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
  const truncatedTranscript = transcript.length > 20000 
    ? transcript.slice(0, 20000) + "... [transcript truncated for length]"
    : transcript;
  
  const videoUrl = videoId ? `https://www.youtube.com/watch?v=${videoId}` : '';
  
  try {
    const prompt = `As an expert educational content creator, transform this video titled "${videoTitle}"${videoUrl ? ` (${videoUrl})` : ''} into comprehensive study notes.

Initial Analysis:
1. First, verify this is educational content
2. Identify the main topic and learning objectives
3. Determine the target knowledge level (beginner/intermediate/advanced)
4. Note any prerequisites or required background knowledge

Required Structure:
1. Title and Overview
   - Main topic and its importance
   - Clear learning objectives
   - Prerequisites if any
   - Estimated time to learn

2. Key Concepts
   - Core ideas with clear explanations
   - Technical terms defined in context
   - Important concepts in **bold**
   - Visual descriptions or diagrams explained

3. Detailed Breakdown
   - Step-by-step explanations
   - Examples with context
   - Code or technical details properly formatted
   - Common misconceptions addressed

4. Practical Applications
   - Real-world examples from the video
   - How to apply the knowledge
   - Common use cases
   - Industry relevance

5. Summary and Review
   - Main takeaways
   - Quick reference points
   - Next steps for learning
   - Related topics to explore

Format Requirements:
1. Use semantic HTML (<h1>, <h2>, <h3>, <p>, <ul>, <li>)
2. Keep paragraphs focused (2-3 sentences)
3. Use lists for multiple related points
4. Format code in <pre><code> blocks
5. Bold important terms with <strong>
6. Maintain clear section spacing
7. Use proper indentation

Video Transcript:
${truncatedTranscript}

Note: Focus on accuracy and educational value. If the content is not educational, respond with a message indicating that.`;

    const notesHtml = await callGeminiAPI(prompt);
    
    if (notesHtml.includes('encountered an issue') || notesHtml.includes('No API key configured')) {
      return `
<div class="error-message">
  <h1>API Configuration Issue</h1>
  <p>We're unable to generate study notes because the AI service is not properly configured.</p>
  <p>Please make sure you have:</p>
  <ul>
    <li>Added a valid Gemini API key to your environment variables</li>
    <li>Named the environment variable VITE_GEMINI_API_KEY</li>
  </ul>
  <p>Once configured, please refresh the page and try again.</p>
</div>`;
    }

    // Check if content is not educational
    if (notesHtml.toLowerCase().includes('not educational content')) {
      return `
<div class="warning-message">
  <h1>Entertainment Content Detected</h1>
  <p>This video appears to be entertainment rather than educational content.</p>
  <p>For the best learning experience:</p>
  <ul>
    <li>Try watching tutorials or course videos</li>
    <li>Look for content with clear learning objectives</li>
    <li>Choose videos that teach specific skills or concepts</li>
  </ul>
  <p>Learning Mode works best with educational content focused on teaching and learning.</p>
</div>`;
    }
    
    return formatHtmlContent(notesHtml);
    
  } catch (error) {
    console.error('Error generating notes:', error);
    return `
<div class="error-message">
  <h1>Unable to Generate Notes</h1>
  <p>We're sorry, but we couldn't generate study notes for this video at the moment.</p>
  <p>This could be due to:</p>
  <ul>
    <li>A temporary service disruption</li>
    <li>Issues with processing the video transcript</li>
    <li>API usage limitations</li>
  </ul>
  <p>Please try again later or contact support if the problem persists.</p>
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
  const truncatedTranscript = transcript.length > 10000 
    ? transcript.slice(0, 10000) + "... [transcript truncated for length]"
    : transcript;
  
  const videoUrl = videoId ? `https://www.youtube.com/watch?v=${videoId}` : '';
  
  try {
    const prompt = `You are an expert educational AI tutor helping students understand "${videoTitle}"${videoUrl ? ` (${videoUrl})` : ''}.

Student Question: "${userQuestion}"

Response Requirements:
1. Structure your response in this format:

   a) Direct Answer Section
      - Begin with a clear, concise answer
      - Use <h3>Direct Answer</h3> as the section header
      - Keep it to 2-3 sentences maximum
      - Use <strong> tags for key terms

   b) Detailed Explanation Section
      - Use <h3>Detailed Explanation</h3> as the section header
      - Break complex concepts into bullet points
      - Use analogies when helpful
      - Include step-by-step explanations if relevant
      - Format each point as a list item

   c) Examples Section (if applicable)
      - Use <h3>Examples</h3> as the section header
      - Include practical examples
      - Use <pre><code> for code snippets
      - Show real-world applications
      - Format as a numbered list if multiple examples

   d) Key Points Section
      - Use <h3>Key Points</h3> as the section header
      - List 3-5 most important takeaways
      - Use bullet points
      - Bold essential terms
      - Keep each point concise

   e) Next Steps Section
      - Use <h3>Further Learning</h3> as the section header
      - Suggest related topics
      - Recommend resources
      - Keep it brief and actionable

2. Formatting Guidelines:
   - Use proper HTML tags (<p>, <ul>, <li>, <code>, etc.)
   - Keep paragraphs short (2-3 sentences)
   - Use consistent spacing between sections
   - Indent nested lists properly
   - Use semantic HTML structure
   - Format code examples cleanly
   - Maintain professional but conversational tone

3. Visual Structure:
   - Start with a welcoming greeting
   - Use clear section headers
   - Include white space between sections
   - End with an encouraging note
   - Keep overall response concise and readable

Video Context:
${truncatedTranscript}`;

    const responseText = await callGeminiAPI(prompt);
    
    if (responseText.includes('encountered an issue') || responseText.includes('No API key configured')) {
      return `
<div class="error-message">
  <p>I'm having trouble connecting to the AI service right now. This could be due to an issue with the API key configuration.</p>
  <p>Please make sure the VITE_GEMINI_API_KEY environment variable is set with a valid API key, then refresh and try again.</p>
</div>`;
    }
    
    // Add wrapper div for consistent styling with notes section
    const formattedResponse = formatHtmlContent(responseText);
    return `<div class="chat-response prose prose-sm max-w-none dark:prose-invert">${formattedResponse}</div>`;
    
  } catch (error) {
    console.error('Error generating chat response:', error);
    return `
<div class="error-message">
  <p>I'm sorry, but I encountered an error while processing your question. This could be due to a temporary service disruption or API limitation.</p>
  <p>Please try asking your question again or rephrase it. If the problem persists, you might want to try again later.</p>
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