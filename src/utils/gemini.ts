// Google Gemini API integration for AI-generated content
import { GoogleGenerativeAI } from "@google/generative-ai";
import { ENV } from './env';


// API models
const GEMINI_MODELS = {
  PRIMARY: 'gemini-2.0-flash-lite',    // Main model
  SECONDARY: 'gemini-2.0-flash',  // Fallback to main model
  TERTIARY: 'gemini-1.5-flash'    // Last resort
};

// Array of API keys - we'll rotate through these if one fails
const GEMINI_API_KEYS = ENV.GEMINI_API_KEYS;

// Keep track of failed keys and models
interface ApiState {
  failedKeys: string[];
  failedModels: string[];
  currentKeyIndex: number;
  currentModelIndex: number;
  lastResetTime: number;
}

// Initialize state from localStorage or defaults
const getApiState = (): ApiState => {
  const saved = localStorage.getItem('geminiApiState');
  if (saved) {
    const state = JSON.parse(saved) as ApiState;
    // Reset state if it's been more than 5 minutes since last reset
    const fiveMinutesMs = 5 * 60 * 1000;
    if (Date.now() - state.lastResetTime > fiveMinutesMs) {
      return {
        failedKeys: [],
        failedModels: [],
        currentKeyIndex: 0,
        currentModelIndex: 0,
        lastResetTime: Date.now()
      };
    }
    return state;
  }
  
  return {
    failedKeys: [],
    failedModels: [],
    currentKeyIndex: 0,
    currentModelIndex: 0,
    lastResetTime: Date.now()
  };
};

// Global API state
const apiState = getApiState();

// Save state to localStorage
const saveApiState = () => {
  localStorage.setItem('geminiApiState', JSON.stringify(apiState));
};

// Get current API key
const getCurrentApiKey = (): string => {
  // If all keys failed, or no keys available
  if (apiState.failedKeys.length >= GEMINI_API_KEYS.length || GEMINI_API_KEYS.length === 0) {
    console.warn('All API keys have failed or no keys available');
    return '';
  }
  
  // Try to find a working key
  let attempts = 0;
  while (attempts < GEMINI_API_KEYS.length) {
    const keyIndex = apiState.currentKeyIndex % GEMINI_API_KEYS.length;
    const key = GEMINI_API_KEYS[keyIndex];
    
    if (!apiState.failedKeys.includes(key)) {
      return key;
    }
    
    apiState.currentKeyIndex++;
    attempts++;
  }
  
  return '';
};

// Get current model
const getCurrentModel = (): string => {
  const models = [GEMINI_MODELS.PRIMARY, GEMINI_MODELS.SECONDARY, GEMINI_MODELS.TERTIARY];
  
  // If all models failed
  if (apiState.failedModels.length >= models.length) {
    console.warn('All models have failed');
    return GEMINI_MODELS.PRIMARY; // Default to primary as last resort
  }
  
  // Try to find a working model
  let attempts = 0;
  while (attempts < models.length) {
    const modelIndex = apiState.currentModelIndex % models.length;
    const model = models[modelIndex];
    
    if (!apiState.failedModels.includes(model)) {
      return model;
    }
    
    apiState.currentModelIndex++;
    attempts++;
  }
  
  return GEMINI_MODELS.PRIMARY;
};

// Mark current key as failed and try the next one
const handleApiKeyFailure = (key: string): boolean => {
  if (!apiState.failedKeys.includes(key)) {
    console.warn(`API key ${key.substring(0, 5)}... failed`);
    apiState.failedKeys.push(key);
  }
  
  apiState.currentKeyIndex++;
  saveApiState();
  
  // Return true if there are still keys available
  return apiState.failedKeys.length < GEMINI_API_KEYS.length;
};

// Mark current model as failed and try the next one
const handleModelFailure = (model: string): boolean => {
  if (!apiState.failedModels.includes(model)) {
    console.warn(`Model ${model} failed`);
    apiState.failedModels.push(model);
  }
  
  apiState.currentModelIndex++;
  saveApiState();
  
  // Return true if there are still models available
  return apiState.failedModels.length < 3; // 3 models total
};

// Define error interface for better type checking
interface GeminiError extends Error {
  message: string;
  code?: string;
  details?: unknown;
}

/**
 * Helper function to make API calls to Google Gemini
 * @param prompt The text prompt to send to the model
 * @returns The generated text response
 */
async function callGeminiAPI(prompt: string): Promise<string> {
  const apiKey = getCurrentApiKey();
  
  if (!apiKey) {
    console.warn('No Gemini API key available - falling back to default response');
    return 'No API key configured. Please add a valid Gemini API key to your environment variables.';
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const modelName = getCurrentModel();
    const model = genAI.getGenerativeModel({ 
      model: modelName,
      generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 2048,
      }
    });

    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const responseText = response.text();
        
        if (!responseText) {
          throw new Error('Empty response from model');
        }

        return responseText;
      } catch (error) {
        const geminiError = error as GeminiError;
        console.warn(`Attempt ${attempts + 1} failed:`, geminiError);
        
        const errorMessage = geminiError.message.toLowerCase();
        if (errorMessage.includes('quota') || errorMessage.includes('rate limit')) {
          handleApiKeyFailure(apiKey);
          break;
        }
        
        if (errorMessage.includes('model')) {
          handleModelFailure(modelName);
          break;
        }
        
        attempts++;
        if (attempts === maxAttempts) {
          throw error;
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
      }
    }

    throw new Error('Failed to generate content after multiple attempts');
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    throw error;
  }
}

// Export for testing purposes
export { callGeminiAPI, getCurrentApiKey, getCurrentModel };

// Reset API state (for debugging)
export const resetGeminiApiState = () => {
  apiState.failedKeys = [];
  apiState.failedModels = [];
  apiState.currentKeyIndex = 0;
  apiState.currentModelIndex = 0;
  apiState.lastResetTime = Date.now();
  saveApiState();
  console.log('Gemini API state reset');
};

/**
 * Extract YouTube video ID from a URL
 * @param url YouTube video URL
 * @returns Video ID or null if invalid
 */
export const extractVideoId = (url: string): string | null => {
  const regExp = /^.*(youtu.be\/|v\/|e\/|u\/\w+\/|embed\/|v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

/**
 * Generate a summary of a video transcript using Google Gemini API
 * @param transcript Video transcript text
 * @param videoTitle Title of the video
 * @param videoId YouTube video ID - used to create video reference URL in the prompt
 * @returns Array of bullet points summarizing the content
 */
export async function generateSummary(
  transcript: string,
  videoTitle: string,
  videoId?: string
): Promise<string[]> {
  // Handle empty transcript
  if (!transcript || transcript.trim().length === 0) {
    return [
      'No transcript available to generate summary.',
      'Please try a different video or check if captions are available.'
    ];
  }

  const truncatedTranscript = transcript.length > 15000 
    ? transcript.slice(0, 15000) + "... [transcript truncated for length]"
    : transcript;
  
  // Include video URL in prompt if videoId is provided
  const videoUrl = videoId ? `https://www.youtube.com/watch?v=${videoId}` : '';
  const videoReference = videoId ? ` (Reference: ${videoUrl})` : '';
  
  try {
    const prompt = `As an expert in technical education and programming tutorials, analyze and summarize this video titled "${videoTitle}"${videoReference}.

First, determine if this is educational content. This video IS educational if it matches ANY of these criteria:
1. Programming/Coding tutorials or explanations
2. Technical concepts or technology explanations
3. Framework/Library tutorials (React, Angular, Vue, etc.)
4. Development tools or practices
5. Step-by-step instructions or walkthroughs
6. Code demonstrations or examples
7. Best practices or design patterns
8. Quick tips or short-form technical lessons
9. Any form of structured learning content

Even if the video is short (like "React Hooks in 5 Minutes"), it's still educational if it teaches something specific.

If the content is educational (which includes ALL programming tutorials), provide 4-6 bullet points summarizing:
- The main concept or technology being taught
- Key points or steps explained
- Important code examples or syntax shown
- Practical applications or use cases
- Best practices or tips mentioned

If the content is truly NOT educational (like vlogs, entertainment, or non-instructional content), respond with exactly:
["This video does not appear to be educational content."]

Video Transcript:
${truncatedTranscript}

Remember: Programming tutorials, technical explanations, and developer tips ARE educational content, regardless of length.`;

    const summaryText = await callGeminiAPI(prompt);
    
    // Process the response to extract bullet points
    const bulletPoints = summaryText
      .split('\n')
      .filter(line => line.trim().startsWith('•') || line.trim().startsWith('-') || line.trim().startsWith('*'))
      .map(line => line.replace(/^[•\-*]\s*/, '').trim())
      .filter(line => line.length > 0);
    
    // If no bullet points were found or content is not educational
    if (bulletPoints.length === 0 || 
        summaryText.toLowerCase().includes('does not appear to be educational')) {
      // Check title for common educational keywords
      const educationalKeywords = [
        'tutorial', 'guide', 'learn', 'how to', 'introduction',
        'react', 'angular', 'vue', 'javascript', 'python',
        'programming', 'coding', 'development', 'tips', 'tricks',
        'basics', 'fundamentals', 'course', 'lesson'
      ];
      
      const titleLower = videoTitle.toLowerCase();
      const isLikelyEducational = educationalKeywords.some(keyword => 
        titleLower.includes(keyword.toLowerCase())
      );
      
      if (isLikelyEducational) {
        return [
          `Main Topic: ${videoTitle}`,
          'This appears to be a technical tutorial or educational content.',
          'The transcript might need more processing. Please try refreshing or checking the video captions.',
          `You can watch the video here: ${videoUrl || 'URL not available'}`
        ];
      }
      
      return [
        'This video appears to be entertainment content rather than educational.',
        'For better learning experience, try watching videos focused on tutorials, courses, or educational topics.',
        `Video Title: "${videoTitle}"${videoReference}`
      ];
    }
    
    // Ensure we have at least some bullet points
    if (bulletPoints.length < 3) {
      const formattedPoints = [
        `Topic: ${videoTitle}`,
        ...bulletPoints,
        'Note: This is a brief educational video. For more depth, consider watching longer tutorials on this topic.',
        `Reference: ${videoUrl || 'URL not available'}`
      ];
      return formattedPoints;
    }
    
    return bulletPoints;
  } catch (error: unknown) {
    console.error('Error generating summary:', error);
    return [
      'Unable to generate a summary at this time.',
      'This could be due to API limits or service availability.',
      'Please try again later or contact support if the problem persists.'
    ];
  }
}

/**
 * Generate comprehensive study notes from a video transcript using Google Gemini API
 * @param transcript Video transcript text
 * @param videoTitle Title of the video
 * @param videoId YouTube video ID - used to create video reference URL in the prompt
 * @returns HTML-formatted study notes
 */
export async function generateNotes(
  transcript: string,
  videoTitle: string,
  videoId?: string
): Promise<string> {
  try {
    const prompt = `As an expert educational content creator, transform this video titled "${videoTitle}" into engaging, modern study notes.

Format the notes in a clean, modern style using this structure:

<div class="study-notes">
  <div class="note-header">
    <h1 class="title">${videoTitle}</h1>
    <div class="meta">
      <span class="tag">📚 Study Guide</span>
      <span class="time">⏱️ ${new Date().toLocaleDateString()}</span>
    </div>
  </div>

  <div class="overview">
    <h2>🎯 Learning Goals</h2>
    <ul class="goals">
      [Generate 3-4 clear learning objectives]
    </ul>
    
    <div class="prerequisites">
      <h3>📋 Before You Start</h3>
      <p>[Required knowledge/tools]</p>
      <p>⏱️ Estimated Time: [time estimate]</p>
    </div>
  </div>

  <div class="main-content">
    <div class="key-concepts">
      <h2>🔑 Key Concepts</h2>
      [Transform key concepts into clear, concise explanations with examples]
    </div>

    <div class="detailed-notes">
      <h2>📝 Detailed Notes</h2>
      [Break down complex topics into digestible sections]
    </div>

    <div class="code-examples">
      <h2>💻 Code Examples</h2>
      [Include relevant code snippets in <pre><code> blocks]
    </div>

    <div class="best-practices">
      <h2>✨ Best Practices</h2>
      [List important tips and guidelines]
    </div>
  </div>

  <div class="summary">
    <h2>📌 Key Takeaways</h2>
    <ul class="takeaways">
      [List 3-4 main points to remember]
    </ul>
    
    <div class="next-steps">
      <h2>🚀 Next Steps</h2>
      <ul>
        [Suggest 2-3 ways to continue learning]
      </ul>
    </div>
  </div>
</div>

Video Transcript:
${transcript}`;

    const notesHtml = await callGeminiAPI(prompt);
    return notesHtml;
  } catch (error: unknown) {
    console.error('Error generating notes:', error);
    return `
<div class="study-notes error">
  <div class="note-header">
    <h1>⚠️ Notes Unavailable</h1>
  </div>
  <div class="error-content">
    <p>We couldn't generate study notes right now. Here's why:</p>
    <ul>
      <li>🔌 There might be a connection issue</li>
      <li>🤖 The AI service might be temporarily unavailable</li>
      <li>📝 The video content might need processing</li>
    </ul>
    <p>Please try again in a few moments!</p>
  </div>
</div>`;
  }
}

/**
 * Get AI response to a user's question about video content using Google Gemini API
 * @param userQuestion User's question text
 * @param transcript Video transcript for context
 * @param videoTitle Title of the video
 * @param videoId YouTube video ID - used for context and reference
 * @returns HTML-formatted AI-generated response
 */
export async function getChatResponse(
  userQuestion: string,
  transcript: string,
  videoTitle?: string,
  videoId?: string
): Promise<string> {
  try {
    const prompt = `You are a friendly and engaging AI tutor helping with "${videoTitle || 'this topic'}". 
    
Your personality:
- Enthusiastic and encouraging 🌟
- Uses emojis naturally (but don't overdo it)
- Breaks down complex topics into simple explanations
- Provides relevant examples
- Asks follow-up questions to ensure understanding
- Keeps responses concise and focused

Format your responses like this:

<div class="chat-message">
  <div class="greeting">[Optional friendly greeting with emoji]</div>
  
  <div class="main-response">
    [Your primary explanation - clear and concise]
  </div>
  
  [If needed, ONE of these sections:]
  <div class="code-example">
    <div class="code-title">[What this code demonstrates]</div>
    <pre><code>[Code snippet]</code></pre>
  </div>
  
  <div class="key-points">
    <ul>
      [2-3 bullet points max]
    </ul>
  </div>
  
  <div class="comparison-table">
    [If comparing concepts]
  </div>
  
  <div class="follow-up">
    [One engaging question to continue the conversation]
  </div>
</div>

Video Context:
${transcript}

Question: "${userQuestion}"`;

    const response = await callGeminiAPI(prompt);
    return response;
  } catch (error: unknown) {
    console.error('Error in chat response:', error);
    return `
<div class="chat-message">
  <div class="greeting">
    <p>Oops! 🤔 I hit a small snag.</p>
  </div>
  <div class="main-response">
    <p>I'm having trouble connecting to my knowledge base right now. But I'd love to help you understand ${videoTitle || 'this topic'} once I'm back up and running!</p>
  </div>
  <div class="follow-up">
    <p>Could you try asking your question again in a moment? 🙏</p>
  </div>
</div>`;
  }
}

/**
 * Check if Google Gemini API is configured and available
 * @returns Boolean indicating if the API is ready
 */
export function isGeminiConfigured(): boolean {
  return Boolean(GEMINI_API_KEYS.length > 0);
}

/**
 * Test the API connection with a simple prompt
 * @returns Promise with the test result
 */
export async function testGeminiAPI(): Promise<{ success: boolean; message: string }> {
  try {
    const response = await callGeminiAPI("Respond with 'API connection successful' if you receive this message.");
    return {
      success: response.includes('successful'),
      message: response
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error testing API connection'
    };
  }
}