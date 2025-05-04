// Google Gemini API integration for AI-generated content
import { ENV, GEMINI_API_BASE_URL } from './env';

// Array of API keys - we'll rotate through these if one fails
const GEMINI_API_KEYS = ENV.GEMINI_API_KEYS;

// Gemini models with fallback options
const GEMINI_MODELS = {
  PRIMARY: 'gemini-2.0-flash-lite',    // Fast, efficient
  SECONDARY: 'gemini-1.5-flash',       // Reliable fallback
  TERTIARY: 'gemini-1.0-pro'           // Last resort
};

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
    // Reset state if it's been more than 1 hour since last reset
    const oneHourMs = 60 * 60 * 1000;
    if (Date.now() - state.lastResetTime > oneHourMs) {
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
 * @param temperature Controls randomness (0.0-1.0)
 * @param maxTokens Maximum number of tokens to generate
 * @returns The generated text response
 */
async function callGeminiAPI(prompt: string, temperature = 0.3, maxTokens = 2048): Promise<string> {
  // Try all available keys and models
  let attemptsRemaining = GEMINI_API_KEYS.length * 3; // 3 models per key
  
  while (attemptsRemaining > 0) {
    const apiKey = getCurrentApiKey();
    const model = getCurrentModel();
    
    if (!apiKey) {
      console.error('No working Gemini API keys available');
      return "No working API keys available. Please add valid Gemini API keys to your environment variables.";
    }
    
    try {
      console.log(`Calling Gemini API with model: ${model}, prompt: ${prompt.substring(0, 100)}...`);
      
      // Updated API URL with key as query parameter
      const response = await fetch(`${GEMINI_API_BASE_URL}/models/${model}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{ 
            parts: [{ text: prompt }] 
          }],
          generationConfig: {
            temperature: temperature,
            maxOutputTokens: maxTokens,
            topK: 40,
            topP: 0.95
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API response error with model ${model}:`, response.status, errorText);
        
        // Check error type to determine if it's a key or model issue
        if (response.status === 400 && errorText.includes('model')) {
          // Model-related error, try another model
          handleModelFailure(model);
        } else {
          // Probably an API key issue
          handleApiKeyFailure(apiKey);
        }
        
        attemptsRemaining--;
        continue; // Try the next key/model
      }

      const data = await response.json();
      console.log(`Received API response from ${model}:`, JSON.stringify(data).substring(0, 100) + '...');
      
      if (!data.candidates || data.candidates.length === 0) {
        console.error(`No response generated from model ${model}`);
        handleModelFailure(model);
        attemptsRemaining--;
        continue;
      }

      // Extract text from response - handle different response formats
      let responseText = '';
      if (data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts.length > 0) {
        responseText = data.candidates[0].content.parts[0].text || '';
      } else if (data.candidates[0].text) {
        responseText = data.candidates[0].text;
      }
      
      if (!responseText) {
        console.error(`Empty response from model ${model}`);
        handleModelFailure(model);
        attemptsRemaining--;
        continue;
      }
      
      // Success! Reset the failed attempts counter for this model
      if (apiState.failedModels.includes(model)) {
        const index = apiState.failedModels.indexOf(model);
        if (index > -1) {
          apiState.failedModels.splice(index, 1);
          saveApiState();
        }
      }
      
      return responseText;
    } catch (error) {
      console.error(`Error calling Gemini API with model ${model}:`, error);
      handleModelFailure(model);
      attemptsRemaining--;
    }
  }
  
  // All attempts failed
  return `I encountered an issue connecting to the AI service. Please check your API key configuration and try again.`;
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
    const prompt = `As an educational content summarizer, create a clear and comprehensive summary of "${videoTitle}"${videoUrl ? ` (${videoUrl})` : ''}.

Format Requirements:
- Exactly 6-8 bullet points
- Each bullet must start with "•" (bullet point)
- Each point should be a complete, self-contained concept
- Points should progress logically from basic to advanced concepts
- Keep each point between 15-30 words for readability
- Focus on actionable insights and technical details

Content Guidelines:
- Include key technical terms and their explanations
- Highlight practical applications
- Note important techniques or methodologies
- Include any best practices mentioned
- Capture core concepts and their relationships

Transcript to Summarize:
${truncatedTranscript}`;

    const summaryText = await callGeminiAPI(prompt, 0.2, 1024);
    
    // Check if we got an error message back
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
    
    // If no bullet points were found, try to split by newlines
    if (bulletPoints.length === 0) {
      return summaryText
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0 && !line.startsWith('#'));
    }
    
    return bulletPoints;
  } catch (error) {
    console.error('Error generating summary:', error);
    // Return a friendly error message as the first bullet point
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
  const truncatedTranscript = transcript.length > 20000 
    ? transcript.slice(0, 20000) + "... [transcript truncated for length]"
    : transcript;
  
  const videoUrl = videoId ? `https://www.youtube.com/watch?v=${videoId}` : '';
  
  try {
    const prompt = `You are an expert educational content creator specializing in detailed study notes.

Task: Transform this video lecture titled "${videoTitle}"${videoUrl ? ` (${videoUrl})` : ''} into comprehensive study notes.

Required Structure (using semantic HTML):
<div class="study-notes">
  <h1>${videoTitle}</h1>

  <div class="overview">
    <h2>Overview</h2>
    <p>[Brief introduction explaining the topic's importance and context]</p>
    <div class="prerequisites">
      <h3>Prerequisites</h3>
      <ul>
        <li>[Required knowledge/tools]</li>
      </ul>
    </div>
    <div class="objectives">
      <h3>Learning Objectives</h3>
      <ul>
        <li>[What you'll learn - specific and measurable]</li>
      </ul>
    </div>
  </div>

  <div class="main-content">
    <h2>Core Concepts</h2>
    <div class="concept-list">
      [For each major concept]:
      <div class="concept">
        <h3>[Concept Name]</h3>
        <p>[Clear explanation]</p>
        [If applicable]:
        <pre><code>[Code example]</code></pre>
      </div>
    </div>

    <h2>Implementation Details</h2>
    <div class="steps">
      [For each implementation step]:
      <div class="step">
        <h3>Step [number]: [step name]</h3>
        <p>[Detailed explanation]</p>
        [If relevant]:
        <pre><code>[Code implementation]</code></pre>
        <div class="note">
          <strong>Note:</strong> [Important considerations]
        </div>
      </div>
    </div>
  </div>

  <div class="practical-application">
    <h2>Practical Applications</h2>
    <ul>
      <li>[Real-world use case with example]</li>
    </ul>
  </div>

  <div class="best-practices">
    <h2>Best Practices</h2>
    <ul>
      <li>[Each practice with brief explanation]</li>
    </ul>
  </div>

  <div class="common-pitfalls">
    <h2>Common Pitfalls</h2>
    <ul>
      <li>[Potential issue and how to avoid it]</li>
    </ul>
  </div>

  <div class="resources">
    <h2>Additional Resources</h2>
    <ul>
      <li>[Related documentation, tutorials, or tools]</li>
    </ul>
  </div>
</div>

Formatting Guidelines:
- Use semantic HTML for proper structure
- Keep paragraphs concise (2-3 sentences)
- Include code examples in <pre><code> blocks
- Use lists for better readability
- Bold important terms with <strong>
- Add explanatory notes where helpful
- Include practical examples
- Link concepts together logically

Here's the video transcript to analyze:
${truncatedTranscript}`;

    const notesHtml = await callGeminiAPI(prompt, 0.3, 4096);
    
    // Check if we got an error message back
    if (notesHtml.includes('encountered an issue') || notesHtml.includes('No API key configured')) {
      return `
<h1>API Configuration Issue</h1>
<p>We're unable to generate study notes because the AI service is not properly configured.</p>
<p>Please make sure you have:</p>
<ul>
  <li>Added a valid Gemini API key to your environment variables</li>
  <li>Named the environment variable VITE_GEMINI_API_KEY</li>
</ul>
<p>Once configured, please refresh the page and try again.</p>
`;
    }
    
    // Check if the response is already in HTML format
    if (notesHtml.includes('<h1>') || notesHtml.includes('<p>')) {
      return notesHtml;
    }
    
    // If not in HTML, convert markdown-like response to basic HTML
    return convertToHtml(notesHtml);
  } catch (error) {
    console.error('Error generating notes:', error);
    return `
<h1>Unable to Generate Notes</h1>
<p>We're sorry, but we couldn't generate study notes for this video at the moment.</p>
<p>This could be due to:</p>
<ul>
  <li>A temporary service disruption</li>
  <li>Issues with processing the video transcript</li>
  <li>API usage limitations</li>
</ul>
<p>Please try again later or contact support if the problem persists.</p>
`;
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
  const truncatedTranscript = transcript.length > 10000 
    ? transcript.slice(0, 10000) + "... [transcript truncated for length]"
    : transcript;
  
  const videoUrl = videoId ? `https://www.youtube.com/watch?v=${videoId}` : '';
  
  try {
    const prompt = `You are an expert educational AI tutor helping students understand "${videoTitle}"${videoUrl ? ` (${videoUrl})` : ''}.

Student Question: "${userQuestion}"

Response Requirements:
1. Format in clean HTML with semantic structure
2. Focus on accuracy and clarity
3. Use a conversational, encouraging tone
4. Structure the response as follows:

<div class="chat-response">
  <div class="answer">
    <p class="main-point">[Direct, clear answer to the question]</p>
  </div>

  [If the concept needs explanation]:
  <div class="explanation">
    <h4>Let me explain further:</h4>
    <p>[Detailed explanation with examples]</p>
  </div>

  [If code is relevant]:
  <pre><code>
    [Code example with comments]
  </code></pre>

  [For technical concepts]:
  <div class="technical-details">
    <h4>Technical Details:</h4>
    <ul>
      <li>[Technical point 1]</li>
      <li>[Technical point 2]</li>
    </ul>
  </div>

  [If helpful]:
  <div class="examples">
    <h4>Examples:</h4>
    <p>[Real-world examples or applications]</p>
  </div>

  [To encourage learning]:
  <div class="next-steps">
    <p>[Suggestion for further learning or practice]</p>
  </div>
</div>

Guidelines:
- Keep explanations concise but thorough
- Use clear examples for complex concepts
- Include code snippets when relevant
- Reference specific parts of the video when possible
- If unsure, acknowledge limitations
- Encourage further learning

Video Context:
${truncatedTranscript}`;

    // Call the Gemini API
    const responseText = await callGeminiAPI(prompt, 0.4, 2048);
    
    // Check if we got an error message back
    if (responseText.includes('encountered an issue') || responseText.includes('No API key configured')) {
      return `
<p>I'm having trouble connecting to the AI service right now. This could be due to an issue with the API key configuration.</p>
<p>Please make sure the VITE_GEMINI_API_KEY environment variable is set with a valid API key, then refresh and try again.</p>
`;
    }
    
    // Check if the response is already in HTML format
    if (responseText.includes('<p>') || responseText.includes('<ul>')) {
      return responseText;
    }
    
    // If not in HTML, convert markdown-like response to basic HTML
    return convertToHtml(responseText);
  } catch (error) {
    console.error('Error generating chat response:', error);
    return `
<p>I'm sorry, but I encountered an error while processing your question. This could be due to a temporary service disruption or API limitation.</p>
<p>Please try asking your question again or rephrase it. If the problem persists, you might want to try again later.</p>
`;
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