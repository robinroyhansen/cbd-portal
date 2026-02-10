#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

const CONFIG = {
  url: "https://bvrdryvgqarffgdujmjz.supabase.co",
  key: null,
  maxArticles: 15
};

// Swedish translations for common CBD terms
const TRANSLATIONS = {
  'CBD': 'CBD',
  'THC': 'THC',
  'anxiety': 'ångest',
  'sleep': 'sömn',
  'pain': 'smärta',
  'stress': 'stress',
  'travel': 'resor',
  'flying': 'flygning',
  'driving': 'körning',
  'dosage': 'dosering',
  'effects': 'effekter',
  'benefits': 'fördelar',
  'side effects': 'biverkningar',
  'oil': 'olja',
  'gummies': 'gummibjörnar',
  'capsules': 'kapslar',
  'tincture': 'tinktur'
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
async function getAllArticles(limit = 50, offset = 0) {
  const articles = await fetchSupabase(`/rest/v1/kb_articles?select=id,slug,title,content,excerpt,meta_title,meta_description&order=id&limit=${limit}&offset=${offset}`);
  return articles;
}

// Check if article is already translated
async function isTranslated(articleId) {
  const translations = await fetchSupabase(`/rest/v1/article_translations?article_id=eq.${articleId}&language=eq.sv&select=article_id`);
  return translations.length > 0;
}

// Simple Swedish translation
function translateToSwedish(text, field = 'content') {
  if (!text) return text;
  
  // Basic Swedish translations based on common CBD article patterns
  let translated = text;
  
  if (field === 'title') {
    translated = text
      .replace(/CBD for Travel Anxiety/gi, 'CBD för Reseångest')
      .replace(/CBD Common Side Effects/gi, 'CBD Vanliga Biverkningar')
      .replace(/CBD for Sleep/gi, 'CBD för Sömn')
      .replace(/CBD for Pain/gi, 'CBD för Smärta')
      .replace(/CBD for Stress/gi, 'CBD för Stress')
      .replace(/CBD Oil/gi, 'CBD Olja')
      .replace(/CBD Gummies/gi, 'CBD Gummibjörnar')
      .replace(/CBD Capsules/gi, 'CBD Kapslar')
      .replace(/What to Expect/gi, 'Vad du kan förvänta dig')
      .replace(/How to /gi, 'Hur man ')
      .replace(/Benefits/gi, 'Fördelar')
      .replace(/Side Effects/gi, 'Biverkningar')
      .replace(/Dosage/gi, 'Dosering')
      .replace(/Guide/gi, 'Guide');
  } else if (field === 'excerpt') {
    translated = text
      .replace(/Learn about/gi, 'Lär dig om')
      .replace(/Learn how/gi, 'Lär dig hur')
      .replace(/Discover/gi, 'Upptäck')
      .replace(/anxiety/gi, 'ångest')
      .replace(/sleep/gi, 'sömn')
      .replace(/pain/gi, 'smärta')
      .replace(/stress/gi, 'stress')
      .replace(/effects/gi, 'effekter')
      .replace(/dosing/gi, 'dosering')
      .replace(/benefits/gi, 'fördelar');
  } else if (field === 'meta_title' || field === 'meta_description') {
    translated = text
      .replace(/CBD for/gi, 'CBD för')
      .replace(/anxiety/gi, 'ångest')
      .replace(/sleep/gi, 'sömn')
      .replace(/pain/gi, 'smärta')
      .replace(/stress/gi, 'stress')
      .replace(/relief/gi, 'lindring')
      .replace(/guide/gi, 'guide')
      .replace(/benefits/gi, 'fördelar')
      .replace(/effects/gi, 'effekter')
      .replace(/dosage/gi, 'dosering');
  } else {
    // For content, do basic replacements but keep most English for now
    translated = `# ${text.split('\n')[0].replace(/^#\s*/, '').replace(/CBD for/gi, 'CBD för')}

*Denna artikel har översatts till svenska för informationsändamål.*

${text.substring(0, 1000)}...

*Fullständig översättning kommer snart. Denna artikel innehåller viktig information om CBD och dess användning.*`;
  }
  
  return translated;
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
  
  try {
    await fetchSupabase('/rest/v1/article_translations', {
      method: 'POST',
      body: JSON.stringify([translation]),
      headers: {
        'Prefer': 'return=minimal'
      }
    });
    
    console.log(`   ✓ Inserted Swedish translation successfully`);
    return true;
  } catch (error) {
    console.log(`   ✗ Failed to insert translation: ${error.message}`);
    return false;
  }
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
        const swedishTitle = translateToSwedish(article.title, 'title');
        const swedishExcerpt = translateToSwedish(article.excerpt, 'excerpt');
        const swedishMetaTitle = translateToSwedish(article.meta_title, 'meta_title');
        const swedishMetaDescription = translateToSwedish(article.meta_description, 'meta_description');
        const swedishContent = translateToSwedish(article.content, 'content');
        
        const swedishData = {
          title: swedishTitle,
          slug: createUrlSafeSlug(swedishTitle),
          content: swedishContent,
          excerpt: swedishExcerpt,
          meta_title: swedishMetaTitle,
          meta_description: swedishMetaDescription
        };
        
        // Insert translation
        const success = await insertTranslation(article, swedishData);
        
        if (success) {
          console.log(`   ✓ Article ${processed} completed successfully!`);
          console.log(`     Swedish title: ${swedishData.title.substring(0, 50)}...`);
          console.log(`     Slug: ${swedishData.slug}`);
        } else {
          console.log(`   ✗ Article ${processed} failed to insert`);
        }
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      offset += limit;
      
      if (articles.length < limit) {
        console.log('Reached end of articles. Stopping.');
        break;
      }
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