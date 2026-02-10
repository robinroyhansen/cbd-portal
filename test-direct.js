const Anthropic = require('@anthropic-ai/sdk');

// Direct test with API key
const anthropic = new Anthropic({
  apiKey: "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",
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
    console.error('❌ API failed:', error.message, error.status);
  }
}

test();