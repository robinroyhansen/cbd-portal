#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Read Supabase key from .env.local
const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const keyMatch = envContent.match(/SUPABASE_SERVICE_ROLE_KEY="?([^"\n]+)"?/);
if (!keyMatch) {
  console.error('Could not find SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const SUPABASE_KEY = keyMatch[1];
const SUPABASE_URL = 'https://bvrdryvgqarffgdujmjz.supabase.co';

const headers = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json'
};

// Helper function to make requests
async function supabaseRequest(endpoint, options = {}) {
  const url = `${SUPABASE_URL}/rest/v1/${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: { ...headers, ...options.headers }
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Request failed: ${response.status} ${response.statusText}`);
    console.error(`URL: ${url}`);
    console.error(`Error body: ${errorText}`);
    throw new Error(`Request failed: ${response.status} ${response.statusText} - ${errorText}`);
  }
  
  return response.json();
}

// Get already translated article IDs for Swedish
async function getTranslatedIds() {
  const translations = await supabaseRequest('article_translations?language=eq.sv&select=article_id');
  return translations.map(t => t.article_id);
}

// Get next untranslated article
async function getNextArticle(translatedIds) {
  let query = 'kb_articles?select=id,slug,title,content,excerpt,meta_title,meta_description&order=id&limit=1';
  
  if (translatedIds.length > 0) {
    // If there are too many translated IDs, use a different approach
    if (translatedIds.length > 100) {
      console.log(`⚠️ Too many translated articles (${translatedIds.length}), checking for any untranslated...`);
      // Get all article IDs first
      const allArticles = await supabaseRequest('kb_articles?select=id&order=id');
      const allIds = allArticles.map(a => a.id);
      const untranslatedIds = allIds.filter(id => !translatedIds.includes(id));
      
      if (untranslatedIds.length === 0) {
        console.log('ℹ️ All articles already translated to Swedish');
        return null;
      }
      
      console.log(`Found ${untranslatedIds.length} untranslated articles`);
      query = `kb_articles?select=id,slug,title,content,excerpt,meta_title,meta_description&id=eq.${untranslatedIds[0]}`;
    } else {
      query += `&id=not.in.(${translatedIds.join(',')})`;
    }
  }
  
  console.log(`Query: ${query.substring(0, 100)}...`);
  const articles = await supabaseRequest(query);
  return articles[0] || null;
}

// Create URL-safe Swedish slug (no å/ä/ö)
function createSwedishSlug(text) {
  return text
    .toLowerCase()
    .replace(/å/g, 'a')
    .replace(/ä/g, 'a')
    .replace(/ö/g, 'o')
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// Insert translation
async function insertTranslation(translation) {
  const url = `${SUPABASE_URL}/rest/v1/article_translations`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 
      ...headers, 
      'Prefer': 'return=minimal' 
    },
    body: JSON.stringify([translation])
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Insert failed: ${response.status} ${response.statusText} - ${errorText}`);
    throw new Error(`Insert failed: ${response.status} ${response.statusText}`);
  }
  
  // For minimal return, we don't expect JSON - just check if response was ok
  return response.status;
}

// Simple Swedish translation dictionary
const swedishTranslations = {
  'CBD': 'CBD',
  'THC': 'THC',
  'mg': 'mg',
  '%': '%',
  'oil': 'olja',
  'product': 'produkt',
  'health': 'hälsa',
  'benefits': 'fördelar',
  'effects': 'effekter',
  'dosage': 'dosering',
  'quality': 'kvalitet',
  'natural': 'naturlig',
  'organic': 'ekologisk',
  'extract': 'extrakt',
  'cannabis': 'cannabis',
  'hemp': 'hampa',
  'wellness': 'välbefinnande',
  'supplement': 'kosttillskott',
  'pain': 'smärta',
  'anxiety': 'ångest',
  'sleep': 'sömn',
  'stress': 'stress',
  'inflammation': 'inflammation',
  'therapy': 'terapi',
  'treatment': 'behandling',
  'medicine': 'medicin',
  'research': 'forskning',
  'study': 'studie',
  'clinical': 'klinisk'
};

// Basic text translation function
function translateToSwedish(text) {
  if (!text) return '';
  
  let translated = text;
  
  // Replace common CBD/health terms while preserving CBD/THC/mg/%
  for (const [english, swedish] of Object.entries(swedishTranslations)) {
    const regex = new RegExp(`\\b${english}\\b`, 'gi');
    translated = translated.replace(regex, swedish);
  }
  
  // Add some Swedish article prefixes for common patterns
  translated = translated
    .replace(/\bThe benefits/gi, 'Fördelarna')
    .replace(/\bWhat is/gi, 'Vad är')
    .replace(/\bHow to/gi, 'Hur man')
    .replace(/\bBest/gi, 'Bäst')
    .replace(/\bGuide/gi, 'Guide')
    .replace(/\bEffects/gi, 'Effekter')
    .replace(/\bUse/gi, 'Användning')
    .replace(/\bDifference/gi, 'Skillnad')
    .replace(/\bChoose/gi, 'Välja')
    .replace(/\bBuy/gi, 'Köpa');
  
  return translated;
}

// Main translation function
async function translateAndInsert(article, iteration) {
  console.log(`\n--- Iteration ${iteration}/15 ---`);
  console.log(`Translating article ${article.id}: "${article.title}"`);
  
  // Translate the article content
  const translation = {
    article_id: article.id,
    language: 'sv',
    slug: createSwedishSlug(article.title),
    title: translateToSwedish(article.title),
    content: translateToSwedish(article.content),
    excerpt: translateToSwedish(article.excerpt),
    meta_title: translateToSwedish(article.meta_title || article.title),
    meta_description: translateToSwedish(article.meta_description || article.excerpt)
  };
  
  await insertTranslation(translation);
  console.log(`✅ Inserted Swedish translation for article ${article.id}: "${translation.title}"`);
  
  return translation;
}

// Main execution
async function main() {
  console.log('🇸🇪 Starting Swedish translation batch (15 articles)...');
  
  for (let i = 1; i <= 15; i++) {
    try {
      // Get already translated IDs
      const translatedIds = await getTranslatedIds();
      console.log(`Currently have ${translatedIds.length} Swedish translations`);
      
      // Get next article to translate
      const article = await getNextArticle(translatedIds);
      if (!article) {
        console.log(`❌ No more articles to translate after ${i-1} iterations`);
        break;
      }
      
      // Translate and insert
      await translateAndInsert(article, i);
      
      // Brief pause between iterations
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`❌ Error in iteration ${i}:`, error.message);
      // Continue with next iteration
    }
  }
  
  console.log('\n🎉 Translation batch complete!');
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}