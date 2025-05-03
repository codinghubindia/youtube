// Simple script to test Gemini API connection

const GEMINI_API_KEY = process.env.VITE_GEMINI_API_KEY;
const MODEL = 'gemini-pro';
const API_URL = `https://generativelanguage.googleapis.com/v1/models/${MODEL}:generateContent`;

async function testGeminiAPI() {
  try {
    console.log('Testing Gemini API connection...');
    
    if (!GEMINI_API_KEY) {
      console.error('❌ VITE_GEMINI_API_KEY environment variable is not set');
      console.log('Make sure you have a .env file with VITE_GEMINI_API_KEY=your_key_here');
      return;
    }
    
    console.log('API Key found, attempting to call Gemini API...');
    
    const response = await fetch(`${API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: 'Hello! Please respond with "API connection successful" if you receive this message.'
          }]
        }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 100,
        }
      })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ API call successful!');
      console.log('Response:', JSON.stringify(data, null, 2).substring(0, 200) + '...');
      
      // Extract the response text
      const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      console.log('\nModel response:', responseText);
      
      if (responseText.includes('successful')) {
        console.log('\n✅ Gemini API is properly configured and working!');
      } else {
        console.log('\n⚠️ API responded but with unexpected content. Check the response above.');
      }
    } else {
      console.error('❌ API call failed:', data.error?.message || 'Unknown error');
      console.log('Full error:', JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error('❌ Error testing Gemini API:', error.message);
  }
}

// Run the test
testGeminiAPI();

// Usage instructions:
// 1. Make sure you have Node.js installed
// 2. Create a .env file with your Gemini API key
// 3. Run this script with: node -r dotenv/config src/utils/testGemini.js
// (You might need to install dotenv: npm install dotenv) 