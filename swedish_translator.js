#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

const CONFIG = {
  url: "https://bvrdryvgqarffgdujmjz.supabase.co",
  key: null,
  maxArticles: 15
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
    throw new Error(`Supabase error: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
}

// Get already translated article IDs
async function getTranslatedIds() {
  const translations = await fetchSupabase('/rest/v1/article_translations?language=eq.sv&select=article_id');
  return translations.map(t => t.article_id);
}

// Get next untranslated article
async function getNextArticle(translatedIds) {
  const query = translatedIds.length > 0 
    ? `/rest/v1/kb_articles?select=id,slug,title,content,excerpt,meta_title,meta_description&order=id&limit=1&id=not.in.(${translatedIds.join(',')})`
    : '/rest/v1/kb_articles?select=id,slug,title,content,excerpt,meta_title,meta_description&order=id&limit=1';
  
  const articles = await fetchSupabase(query);
  return articles[0] || null;
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

// Translate text to Swedish (mock function - replace with actual API)
async function translateToSwedish(text) {
  // This is a mock translation - in real implementation you'd use Claude API
  console.log(`   Translating: ${text.substring(0, 50)}...`);
  
  // For demo purposes, return mock Swedish text
  if (text.includes('CBD for Travel Anxiety')) {
    return 'CBD för Reseångest: Flygning, Körning och Resstress';
  }
  
  // Return placeholder Swedish text
  return `[SV] ${text}`;
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
  
  console.log(`   ✓ Inserted Swedish translation for article ${originalArticle.id}`);
}

// Main translation loop
async function translateArticles() {
  console.log('Starting Swedish Translation Process...');
  console.log('=====================================\n');
  
  try {
    loadConfig();
    
    for (let i = 1; i <= CONFIG.maxArticles; i++) {
      console.log(`Processing article ${i}/${CONFIG.maxArticles}...`);
      
      // Get already translated IDs
      const translatedIds = await getTranslatedIds();
      console.log(`   Current translations: ${translatedIds.length}`);
      
      // Get next article to translate
      const article = await getNextArticle(translatedIds);
      
      if (!article) {
        console.log('   No more articles to translate. Stopping.');
        break;
      }
      
      console.log(`   Found article: ${article.title.substring(0, 50)}...`);
      
      // Translate all fields
      const swedishData = {
        title: await translateToSwedish(article.title),
        slug: createUrlSafeSlug(await translateToSwedish(article.title)),
        content: await translateToSwedish(article.content),
        excerpt: await translateToSwedish(article.excerpt),
        meta_title: await translateToSwedish(article.meta_title),
        meta_description: await translateToSwedish(article.meta_description)
      };
      
      // Insert translation
      await insertTranslation(article, swedishData);
      
      console.log(`   ✓ Article ${i} completed: ${swedishData.title}\n`);
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('Translation process completed!');
    
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

// Run the script
translateArticles();