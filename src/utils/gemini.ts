// Google Gemini API integration for AI-generated content
import { GoogleGenAI } from "@google/genai";
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

/**
 * Helper function to make API calls to Google Gemini
 * @param prompt The text prompt to send to the model
 * @returns The generated text response
 */
async function callGeminiAPI(prompt: string): Promise<string> {
  // Get API key from environment
  const apiKey = ENV.GEMINI_API_KEYS[0]; // Use first key for simplicity
  
  if (!apiKey) {
    throw new Error('No Gemini API key available. Please add a valid API key to your environment variables.');
  }

  try {
    // Initialize the Gemini API client
    const genAI = new GoogleGenAI({ apiKey });

    // Generate content
    const result = await genAI.models.generateContent({
      model: GEMINI_MODELS.PRIMARY,
      contents: [{ text: prompt }]
    });

    // Get the response text from the first candidate
    const responseText = result.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!responseText) {
      throw new Error('Empty response from model');
    }

    return responseText;

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
 * Helper function to clean and format HTML content
 */
function formatHtmlContent(content: string): string {
  return content
    // Convert markdown-style bold to HTML
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Ensure code blocks are properly formatted
    .replace(/```(\w+)?\n([\s\S]*?)\n```/g, (_, lang, code) => {
      // Remove extra indentation while preserving code structure
      const lines = code.split('\n');
      const indent = lines[0].match(/^\s*/)[0];
      const cleanedCode = lines.map((line: string) => line.replace(new RegExp(`^${indent}`), '')).join('\n');
      return `<pre><code>${cleanedCode.trim()}</code></pre>`;
    })
    // Convert single backticks to inline code
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // Ensure proper spacing around headings
    .replace(/<h([1-6])>/g, '\n<h$1>')
    .replace(/<\/h([1-6])>/g, '</h$1>\n')
    // Fix list spacing
    .replace(/<\/(ul|ol)>\s*<(ul|ol)>/g, '</$1>\n<$2>')
    .replace(/<\/li>\s*<li>/g, '</li>\n<li>')
    // Clean up excessive newlines
    .replace(/\n{3,}/g, '\n\n')
    // Fix paragraph spacing
    .replace(/<\/p>\s*<p>/g, '</p>\n<p>')
    // Ensure proper indentation for nested lists
    .replace(/(<[uo]l>.*?<\/[uo]l>)/gs, list => {
      return list.replace(/<li>/g, '  <li>');
    })
    // Clean up any remaining excessive whitespace
    .replace(/\s+</g, '<')
    .replace(/>\s+/g, '>')
    .trim();
}

/**
 * Generate a summary of a video transcript using Google Gemini API
 * @param transcript Video transcript text
 * @param videoTitle Title of the video
 * @param videoId YouTube video ID for reference
 * @returns Array of bullet points summarizing the content
 */
export async function generateSummary(
  transcript: string,
  videoTitle: string,
  videoId?: string
): Promise<string[]> {
  const truncatedTranscript = transcript.length > 15000 
    ? transcript.slice(0, 15000) + "... [transcript truncated for length]"
    : transcript;
  
  const videoUrl = videoId ? `https://www.youtube.com/watch?v=${videoId}` : '';
  
  try {
    const prompt = `As an expert educational content analyzer, create a precise and relevant summary of the video titled "${videoTitle}"${videoUrl ? ` (${videoUrl})` : ''}.

Analysis Requirements:
1. First, analyze if this is truly educational content. If not, respond with ["This video does not appear to be educational content."]
2. Identify the main educational topic and learning objectives
3. Focus only on the factual, educational content
4. Ensure each point directly relates to the video's main topic

Summary Format:
- Create exactly 6-8 bullet points
- Each point must start with "•"
- Each point should be 15-30 words
- Progress logically from basic to advanced concepts
- Focus on actionable insights and key learnings
- Include specific examples or data mentioned

Content Guidelines:
- Capture the core educational message
- Include key technical terms with brief explanations
- Note important methodologies or techniques
- Highlight practical applications
- Emphasize memorable examples or analogies used

Video Transcript:
${truncatedTranscript}

Remember: Stay focused on the educational value and ensure all points are directly related to "${videoTitle}".`;

    const summaryText = await callGeminiAPI(prompt);
    
    if (summaryText.includes('encountered an issue') || summaryText.includes('No API key configured')) {
      return [
        'Unable to generate a summary at this time.',
        'Please check your API key configuration and try again later.'
      ];
    }
    
    // Process the response to extract bullet points
    const bulletPoints = summaryText
      .split('\n')
      .filter(line => line.trim().startsWith('•') || line.trim().startsWith('-') || line.trim().startsWith('*'))
      .map(line => line.replace(/^[•\-*]\s*/, '').trim())
      .filter(line => line.length > 0);
    
    // If no bullet points were found or content is not educational
    if (bulletPoints.length === 0 || bulletPoints[0].includes('does not appear to be educational')) {
      return [
        'This video appears to be entertainment content rather than educational.',
        'Try watching videos focused on tutorials, courses, or educational topics.'
      ];
    }
    
    return bulletPoints;
  } catch (error) {
    console.error('Error generating summary:', error);
    return [
      'Unable to generate a summary at this time.',
      'Please try again later or contact support if the problem persists.'
    ];
  }
}

/**
 * Generate comprehensive study notes from a video transcript using Google Gemini API
 * @param transcript Video transcript text
 * @param videoTitle Title of the video
 * @param videoId YouTube video ID for reference
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
  } catch (error) {
    // Return a nicely formatted error message
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
 * @param videoId YouTube video ID for reference
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
  } catch (error) {
    // Return a friendly error message
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
 * Convert markdown-like text to basic HTML
 * @param text Text with markdown-like formatting
 * @returns HTML-formatted text
 */
function convertToHtml(text: string): string {
  let html = text;
  
  // Handle code blocks
  html = html.replace(/```(\w+)?\n([\s\S]*?)\n```/g, '<pre><code>$2</code></pre>');
  
  // Handle inline code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
  
  // Handle headings (# Heading 1, ## Heading 2, etc.)
  html = html.replace(/^# (.*?)$/gm, '<h1>$1</h1>');
  html = html.replace(/^## (.*?)$/gm, '<h2>$1</h2>');
  html = html.replace(/^### (.*?)$/gm, '<h3>$1</h3>');
  
  // Handle bold and italic
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  
  // Handle lists
  const listItemRegex = /^[*-] (.*?)$/gm;
  if (listItemRegex.test(html)) {
    // Replace each list item
    html = html.replace(listItemRegex, '<li>$1</li>');
    // Wrap with ul tags
    html = html.replace(/<li>(.*?)(<li>|$)/gs, '<ul><li>$1</ul>$2');
  }
  
  // Handle paragraphs - split by double newlines and wrap in p tags
  const paragraphs = html.split(/\n\n+/);
  html = paragraphs.map(p => {
    // Skip if already has HTML tags
    if (p.trim().startsWith('<') && !p.trim().startsWith('<li>')) {
      return p;
    }
    return `<p>${p.trim()}</p>`;
  }).join('\n');
  
  return html;
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