require('dotenv').config({ path: '.env.local' });
const Anthropic = require('@anthropic-ai/sdk');

console.log('API Key loaded:', process.env.ANTHROPIC_API_KEY?.substring(0, 20) + '...');

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

async function test() {
  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 50,
      messages: [
        {
          role: 'user',
          content: 'Say "test successful" in Swedish'
        }
      ]
    });
    
    console.log('✅ API working:', message.content[0].text);
  } catch (error) {
    console.error('❌ API failed:', error.message);
  }
}

test();