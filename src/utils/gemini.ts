// Google Gemini API integration for AI-generated content

// Get API key from environment variables
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || 'AIzaSyALhNHeJyC5doShpa5mR_09KXq8MR-NkoY';

// Gemini models
const GEMINI_TEXT_MODEL = 'gemini-2.0-flash-lite'; // Using the standard model
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1';

/**
 * Helper function to make API calls to Google Gemini
 * @param prompt The text prompt to send to the model
 * @param temperature Controls randomness (0.0-1.0)
 * @param maxTokens Maximum number of tokens to generate
 * @returns The generated text response
 */
async function callGeminiAPI(prompt: string, temperature = 0.3, maxTokens = 2048): Promise<string> {
  if (!GEMINI_API_KEY) {
    console.error('Gemini API key is missing! Please add VITE_GEMINI_API_KEY to your .env file');
    return "No API key configured. Please add a valid Gemini API key to your environment variables.";
  }

  try {
    console.log('Calling Gemini API with prompt:', prompt.substring(0, 100) + '...');
    
    // Updated API URL with key as query parameter
    const response = await fetch(`${GEMINI_API_URL}/models/${GEMINI_TEXT_MODEL}:generateContent?key=${GEMINI_API_KEY}`, {
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
      console.error('API response error:', response.status, errorText);
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Received API response:', JSON.stringify(data).substring(0, 100) + '...');
    
    if (!data.candidates || data.candidates.length === 0) {
      throw new Error('No response generated');
    }

    // Extract text from response - handle different response formats
    let responseText = '';
    if (data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts.length > 0) {
      responseText = data.candidates[0].content.parts[0].text || '';
    } else if (data.candidates[0].text) {
      responseText = data.candidates[0].text;
    }
    
    if (!responseText) {
      throw new Error('Empty response from API');
    }
    
    return responseText;
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return `I encountered an issue connecting to the AI service. Please check your API key configuration and try again.`;
  }
}

// Export for testing purposes
export { callGeminiAPI };

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
  // Truncate transcript if too long
  const truncatedTranscript = transcript.length > 15000 
    ? transcript.slice(0, 15000) + "... [transcript truncated for length]"
    : transcript;
  
  // Construct video URL if ID is provided
  const videoUrl = videoId ? `https://www.youtube.com/watch?v=${videoId}` : '';
  
  try {
    const prompt = `
You are an educational assistant helping students understand YouTube videos.
Based on the following transcript from the YouTube video titled "${videoTitle}"${videoUrl ? ` (${videoUrl})` : ''}, 
create a concise but comprehensive summary of the key points.
make sure to include all the key points and details from the video.
Format your response as a bulleted list with 6-8 main points.
Each point should be a single sentence capturing an important concept from the video.
Focus on the educational value and key takeaways a student would need.
Do not add any introductory text or conclusion - just return the bullet points directly.

TRANSCRIPT:
${truncatedTranscript}
`;

    // Call the Gemini API
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
  // Truncate transcript if too long
  const truncatedTranscript = transcript.length > 20000 
    ? transcript.slice(0, 20000) + "... [transcript truncated for length]"
    : transcript;
  
  // Construct video URL if ID is provided
  const videoUrl = videoId ? `https://www.youtube.com/watch?v=${videoId}` : '';
  
  try {
    const prompt = `
You are an educational assistant creating comprehensive study notes for a student.
Based on the following transcript from the YouTube video titled "${videoTitle}"${videoUrl ? ` (${videoUrl})` : ''}, 
create detailed, well-structured study notes that a student can use for learning and revision.

Format your response in HTML with appropriate heading levels, lists, code blocks, etc.
Include the following sections:
1. A main title with the video title
2. Main concepts explained in the video
3. Detailed explanations with examples where applicable
4. Key takeaways
5. Additional resources or practice suggestions if mentioned in the video

The notes should be thorough enough for a student to understand the topic without rewatching the video.
Use clear explanations, examples, and visual organization to make the content easy to understand and reference.

TRANSCRIPT:
${truncatedTranscript}
`;

    // Call the Gemini API
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
  // Truncate transcript if too long
  const truncatedTranscript = transcript.length > 10000 
    ? transcript.slice(0, 10000) + "... [transcript truncated for length]"
    : transcript;
  
  // Construct video URL if ID is provided
  const videoUrl = videoId ? `https://www.youtube.com/watch?v=${videoId}` : '';
  
  try {
    const prompt = `
You are an AI tutor helping a student understand a YouTube video${videoTitle ? ` titled "${videoTitle}"` : ''}${videoUrl ? ` (${videoUrl})` : ''}.
The student is asking: "${userQuestion}"

Based on the following transcript from the video, provide a helpful, accurate response.
Your response should be HTML-formatted with appropriate paragraphs, lists, and emphasis where needed.
If the transcript doesn't contain information relevant to the question, acknowledge that and provide
general guidance on the topic if possible. Be concise but thorough in your explanation.

TRANSCRIPT EXCERPT:
${truncatedTranscript}
`;

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
  return Boolean(GEMINI_API_KEY);
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