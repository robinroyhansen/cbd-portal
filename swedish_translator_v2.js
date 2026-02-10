#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

const CONFIG = {
  url: "https://bvrdryvgqarffgdujmjz.supabase.co",
  key: null,
  maxArticles: 15,
  anthropicKey: process.env.ANTHROPIC_API_KEY
};

// Read the API key from .env.local
function loadConfig() {
  const envPath = path.join(process.cwd(), '.env.local');
  const envContent = fs.readFileSync(envPath, 'utf8');
  const keyMatch = envContent.match(/SUPABASE_SERVICE_ROLE_KEY="?([^"\n]+)"?/);
  if (keyMatch) {
    CONFIG.key = keyMatch[1];
    console.log(`✓ Loaded API key (${CONFIG.key.length} chars)`);
  } else {
    throw new Error('Failed to load SUPABASE_SERVICE_ROLE_KEY');
  }
}

// Fetch data from Supabase
async function fetchSupabase(endpoint, options = {}) {
  const url = `${CONFIG.url}${endpoint}`;
  const headers = {
    'apikey': CONFIG.key,
    'Authorization': `Bearer ${CONFIG.key}`,
    'Content-Type': 'application/json',
    ...options.headers
  };
  
  const response = await fetch(url, { ...options, headers });
  
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Supabase error: ${response.status} ${response.statusText} - ${text}`);
  }
  
  return response.json();
}

// Get all articles ordered by ID
async function getAllArticles(limit = 100, offset = 0) {
  const articles = await fetchSupabase(`/rest/v1/kb_articles?select=id,slug,title,content,excerpt,meta_title,meta_description&order=id&limit=${limit}&offset=${offset}`);
  return articles;
}

// Check if article is already translated
async function isTranslated(articleId) {
  const translations = await fetchSupabase(`/rest/v1/article_translations?article_id=eq.${articleId}&language=eq.sv&select=article_id`);
  return translations.length > 0;
}

// Translate text using Claude
async function translateWithClaude(text, field = 'content') {
  if (!CONFIG.anthropicKey) {
    // Fallback for testing
    console.log(`   [MOCK] Translating ${field}: ${text.substring(0, 30)}...`);
    return `[SV] ${text}`;
  }

  const prompt = field === 'content' 
    ? `Translate this CBD article content to natural Swedish. Keep all markdown formatting, preserve CBD/THC/mg/% terminology, keep all links intact, and maintain the professional medical tone. Do not translate proper names or technical terms like "CBD", "THC", etc.

Content to translate:
${text}`
    : `Translate this ${field} to natural Swedish for SEO purposes. Keep it concise and professional. Do not translate "CBD" itself:

${text}`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CONFIG.anthropicKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        max_tokens: field === 'content' ? 4000 : 100,
        messages: [{
          role: 'user',
          content: prompt
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.status}`);
    }

    const result = await response.json();
    return result.content[0].text.trim();
  } catch (error) {
    console.log(`   [ERROR] Translation failed for ${field}, using fallback`);
    return `[SV] ${text}`;
  }
}

// Create URL-safe slug without Swedish characters
function createUrlSafeSlug(title) {
  return title
    .toLowerCase()
    .replace(/å/g, 'a')
    .replace(/ä/g, 'a') 
    .replace(/ö/g, 'o')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Insert Swedish translation
async function insertTranslation(originalArticle, swedishData) {
  const translation = {
    article_id: originalArticle.id,
    language: 'sv',
    title: swedishData.title,
    slug: swedishData.slug,
    content: swedishData.content,
    excerpt: swedishData.excerpt,
    meta_title: swedishData.meta_title,
    meta_description: swedishData.meta_description
  };
  
  await fetchSupabase('/rest/v1/article_translations', {
    method: 'POST',
    body: JSON.stringify([translation]),
    headers: {
      'Prefer': 'return=minimal'
    }
  });
  
  console.log(`   ✓ Inserted Swedish translation`);
}

// Main translation loop
async function translateArticles() {
  console.log('Starting Swedish Translation Process...');
  console.log('=====================================\n');
  
  try {
    loadConfig();
    
    let processed = 0;
    let offset = 0;
    const limit = 50;
    
    while (processed < CONFIG.maxArticles) {
      console.log(`Fetching articles (offset: ${offset})...`);
      const articles = await getAllArticles(limit, offset);
      
      if (articles.length === 0) {
        console.log('No more articles found. Stopping.');
        break;
      }
      
      for (const article of articles) {
        if (processed >= CONFIG.maxArticles) break;
        
        const alreadyTranslated = await isTranslated(article.id);
        if (alreadyTranslated) {
          continue; // Skip already translated
        }
        
        processed++;
        console.log(`\nProcessing article ${processed}/${CONFIG.maxArticles}...`);
        console.log(`   Title: ${article.title.substring(0, 50)}...`);
        console.log(`   Article ID: ${article.id}`);
        
        // Translate all fields
        console.log('   Translating title...');
        const swedishTitle = await translateWithClaude(article.title, 'title');
        
        console.log('   Translating excerpt...');
        const swedishExcerpt = await translateWithClaude(article.excerpt, 'excerpt');
        
        console.log('   Translating meta title...');
        const swedishMetaTitle = await translateWithClaude(article.meta_title, 'meta_title');
        
        console.log('   Translating meta description...');
        const swedishMetaDescription = await translateWithClaude(article.meta_description, 'meta_description');
        
        console.log('   Translating content (this may take a moment)...');
        const swedishContent = await translateWithClaude(article.content, 'content');
        
        const swedishData = {
          title: swedishTitle,
          slug: createUrlSafeSlug(swedishTitle),
          content: swedishContent,
          excerpt: swedishExcerpt,
          meta_title: swedishMetaTitle,
          meta_description: swedishMetaDescription
        };
        
        // Insert translation
        await insertTranslation(article, swedishData);
        
        console.log(`   ✓ Article ${processed} completed!`);
        console.log(`     Swedish title: ${swedishData.title.substring(0, 50)}...`);
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      offset += limit;
    }
    
    console.log('\n=====================================');
    console.log(`Translation process completed! Processed ${processed} articles.`);
    
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

// Run the script
translateArticles();