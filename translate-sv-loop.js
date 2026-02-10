#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Read environment variables
const envContent = fs.readFileSync('.env.local', 'utf8');
const serviceKey = envContent.match(/SUPABASE_SERVICE_ROLE_KEY="([^"]+)"/)?.[1];

if (!serviceKey) {
    console.error('Could not find SUPABASE_SERVICE_ROLE_KEY in .env.local');
    process.exit(1);
}

const URL = "https://bvrdryvgqarffgdujmjz.supabase.co";
const KEY = serviceKey;

async function translateToSwedish(content) {
    const { exec } = require('child_process');
    const util = require('util');
    const execPromise = util.promisify(exec);
    
    try {
        // Use Claude to translate to Swedish
        const translationScript = `
const { Anthropic } = require('@anthropic-ai/sdk');

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

async function translate() {
  const msg = await anthropic.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 4000,
    messages: [{
      role: "user",
      content: \`Translate this CBD article content to Swedish. Keep it natural and informative. Preserve any markdown formatting. Keep CBD, THC, mg, % unchanged. Make the slug URL-safe without å/ä/ö characters.

Content: \${JSON.stringify(${JSON.stringify(content)})}\`
    }]
  });
  
  console.log(msg.content[0].text);
}

translate().catch(console.error);
`;
        
        const { stdout } = await execPromise(`node -e "${translationScript.replace(/"/g, '\\"').replace(/\n/g, ' ')}"`, {
            env: { ...process.env, ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY }
        });
        
        return stdout.trim();
    } catch (error) {
        console.error('Translation error:', error);
        return null;
    }
}

function createUrlSafeSlug(text) {
    return text.toLowerCase()
        .replace(/å/g, 'a')
        .replace(/ä/g, 'a')
        .replace(/ö/g, 'o')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

async function fetchUntranslatedArticle() {
    const { exec } = require('child_process');
    const util = require('util');
    const execPromise = util.promisify(exec);
    
    try {
        // Get list of already translated article IDs
        const { stdout: translatedIds } = await execPromise(`curl -s "${URL}/rest/v1/article_translations?language=eq.sv&select=article_id" -H "apikey: ${KEY}" -H "Authorization: Bearer ${KEY}"`);
        const translated = JSON.parse(translatedIds).map(t => t.article_id);
        
        // Get first few articles and find one that's not translated
        const { stdout: articlesData } = await execPromise(`curl -s "${URL}/rest/v1/kb_articles?select=id,slug,title,content,excerpt,meta_title,meta_description&order=id&limit=10" -H "apikey: ${KEY}" -H "Authorization: Bearer ${KEY}"`);
        const articles = JSON.parse(articlesData);
        
        const untranslated = articles.find(article => !translated.includes(article.id));
        return untranslated;
    } catch (error) {
        console.error('Fetch error:', error);
        return null;
    }
}

async function insertTranslation(translation) {
    const { exec } = require('child_process');
    const util = require('util');
    const execPromise = util.promisify(exec);
    
    try {
        const payload = JSON.stringify([translation]);
        const { stdout } = await execPromise(`curl -s -X POST "${URL}/rest/v1/article_translations" -H "apikey: ${KEY}" -H "Authorization: Bearer ${KEY}" -H "Content-Type: application/json" -H "Prefer: return=minimal" -d '${payload}'`);
        return stdout;
    } catch (error) {
        console.error('Insert error:', error);
        return null;
    }
}

async function main() {
    console.log('Starting Swedish translation loop...');
    
    for (let i = 1; i <= 15; i++) {
        console.log(`\n=== Iteration ${i} ===`);
        
        // Step 1: Fetch untranslated article
        const article = await fetchUntranslatedArticle();
        if (!article) {
            console.log('No untranslated article found, stopping.');
            break;
        }
        
        console.log(`Found article: ${article.title} (${article.id})`);
        
        // Step 2: Translate content
        const swedishContent = await translateToSwedish(article.content);
        if (!swedishContent) {
            console.log('Translation failed, skipping.');
            continue;
        }
        
        // Step 3: Create translation object
        const translation = {
            article_id: article.id,
            language: 'sv',
            title: swedishContent.split('\n')[0] || article.title,
            slug: createUrlSafeSlug(swedishContent.split('\n')[0] || article.title),
            content: swedishContent,
            excerpt: article.excerpt ? await translateToSwedish(article.excerpt) : null,
            meta_title: article.meta_title ? await translateToSwedish(article.meta_title) : null,
            meta_description: article.meta_description ? await translateToSwedish(article.meta_description) : null
        };
        
        // Step 4: Insert translation
        const result = await insertTranslation(translation);
        
        console.log(`Translation ${i} completed for: ${translation.title}`);
        
        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('\nTranslation loop completed!');
}

main().catch(console.error);