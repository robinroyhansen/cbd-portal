#!/usr/bin/env node

const fs = require('fs');

// Read environment
const envContent = fs.readFileSync('.env.local', 'utf8');
const KEY = envContent.match(/SUPABASE_SERVICE_ROLE_KEY="([^"]+)"/)[1];
const URL = "https://bvrdryvgqarffgdujmjz.supabase.co";

console.log('🇸🇪 Starting Swedish translation loop - 15 articles');
console.log('===============================================');

// Simple translation function with better Swedish
function translateToSwedish(text) {
  if (!text) return text;
  
  // More comprehensive Swedish translations
  const translations = {
    // Common CBD terms
    'CBD': 'CBD',
    'THC': 'THC', 
    'Cannabis': 'Cannabis',
    'Hemp': 'Hampa',
    'Oil': 'Olja',
    'Capsules': 'Kapslar',
    'Gummies': 'Gummin',
    'Tincture': 'Tinktur',
    'Extract': 'Extrakt',
    'Isolate': 'Isolat',
    'Full spectrum': 'Fullspektrum',
    'Broad spectrum': 'Bredspektrum',
    
    // Health terms
    'Benefits': 'Fördelar',
    'Effects': 'Effekter', 
    'Side effects': 'Biverkningar',
    'Dosage': 'Dosering',
    'Dose': 'Dos',
    'Research': 'Forskning',
    'Studies': 'Studier',
    'Health': 'Hälsa',
    'Wellness': 'Välbefinnande',
    'Pain': 'Smärta',
    'Relief': 'Lindring',
    'Sleep': 'Sömn',
    'Anxiety': 'Ångest',
    'Stress': 'Stress',
    'Depression': 'Depression',
    'Inflammation': 'Inflammation',
    'Treatment': 'Behandling',
    
    // Quality terms
    'Quality': 'Kvalitet',
    'Pure': 'Ren',
    'Natural': 'Naturlig',
    'Organic': 'Ekologisk',
    'Laboratory': 'Laboratorium',
    'Testing': 'Testning',
    'Certificate': 'Certifikat',
    'Analysis': 'Analys',
    'Legal': 'Laglig',
    'Safe': 'Säker',
    'Effective': 'Effektiv',
    
    // Common words
    'Guide': 'Guide',
    'Calculator': 'Kalkylator',
    'How to': 'Hur man',
    'What is': 'Vad är',
    'What are': 'Vad är',
    'Benefits of': 'Fördelar med',
    'How to use': 'Hur man använder',
    'How to calculate': 'Hur man beräknar',
    'Best': 'Bästa',
    'Top': 'Topp',
    'Complete': 'Komplett',
    'Ultimate': 'Ultimat',
    'Your': 'Din',
    'The': 'Den',
    'A': 'En',
    'An': 'En',
    
    // Action words
    'Calculate': 'Beräkna',
    'Choose': 'Välj',
    'Find': 'Hitta',
    'Use': 'Använd',
    'Take': 'Ta',
    'Buy': 'Köp',
    'Learn': 'Lär dig',
    'Understand': 'Förstå',
    
    // Conjunctions
    'and': 'och',
    'or': 'eller',
    'but': 'men',
    'with': 'med',
    'for': 'för',
    'in': 'i',
    'on': 'på',
    'at': 'vid',
    'to': 'till',
    'from': 'från'
  };
  
  let translated = text;
  
  // Apply translations, preserving case
  for (const [en, sv] of Object.entries(translations)) {
    // Case-insensitive replacement with proper casing
    const regex = new RegExp('\\b' + en.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'gi');
    translated = translated.replace(regex, (match) => {
      if (match === match.toUpperCase()) return sv.toUpperCase();
      if (match[0] === match[0].toUpperCase()) return sv.charAt(0).toUpperCase() + sv.slice(1);
      return sv;
    });
  }
  
  return translated;
}

function createSwedishSlug(title) {
  return title
    .toLowerCase()
    .replace(/[åä]/g, 'a')
    .replace(/ö/g, 'o') 
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

async function fetchData(endpoint, options = {}) {
  const headers = {
    'apikey': KEY,
    'Authorization': `Bearer ${KEY}`,
    'Content-Type': 'application/json'
  };
  
  try {
    const response = await fetch(`${URL}${endpoint}`, { 
      headers,
      ...options 
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('❌ Fetch error:', error.message);
    return null;
  }
}

async function main() {
  let successCount = 0;
  
  for (let i = 1; i <= 15; i++) {
    console.log(`\n📝 Iteration ${i}/15 - ${new Date().toLocaleString()}`);
    
    try {
      // 1. Get ALL translated article IDs (remove limit)
      console.log('🔍 Checking all translated articles...');
      const translated = await fetchData('/rest/v1/article_translations?language=eq.sv&select=article_id');
      
      if (!translated) {
        console.log('❌ Failed to fetch translated articles');
        continue;
      }
      
      const translatedIds = translated.map(t => t.article_id);
      console.log(`📊 Found ${translatedIds.length} already translated articles`);
      
      // 2. Get untranslated articles
      console.log('🔍 Finding untranslated articles...');
      const articles = await fetchData('/rest/v1/kb_articles?select=id,slug,title,content,excerpt,meta_title,meta_description&order=id.desc&limit=50');
      
      if (!articles || articles.length === 0) {
        console.log('❌ No articles found');
        break;
      }
      
      // Find first untranslated article
      const untranslated = articles.find(article => !translatedIds.includes(article.id));
      
      if (!untranslated) {
        console.log('❌ No untranslated articles found in current batch');
        // Try older articles
        const olderArticles = await fetchData('/rest/v1/kb_articles?select=id,slug,title,content,excerpt,meta_title,meta_description&order=id.asc&limit=50');
        const olderUntranslated = olderArticles?.find(article => !translatedIds.includes(article.id));
        
        if (!olderUntranslated) {
          console.log('❌ No untranslated articles found');
          break;
        }
        
        // Use the older article
        Object.assign(untranslated, olderUntranslated);
      }
      
      console.log(`🔍 Found article ID: ${untranslated.id}`);
      console.log(`📄 Title: ${untranslated.title}`);
      
      // 3. Translate to Swedish
      console.log('🌐 Translating to Swedish...');
      
      const swedishTitle = translateToSwedish(untranslated.title);
      const swedishContent = translateToSwedish(untranslated.content);
      const swedishExcerpt = translateToSwedish(untranslated.excerpt);
      const swedishMetaTitle = translateToSwedish(untranslated.meta_title);
      const swedishMetaDesc = translateToSwedish(untranslated.meta_description);
      const swedishSlug = createSwedishSlug(swedishTitle);
      
      console.log(`🇸🇪 Swedish title: ${swedishTitle}`);
      console.log(`🔗 Swedish slug: ${swedishSlug}`);
      
      const translation = {
        article_id: untranslated.id,
        language: 'sv',
        title: swedishTitle,
        slug: swedishSlug,
        content: swedishContent,
        excerpt: swedishExcerpt,
        meta_title: swedishMetaTitle,
        meta_description: swedishMetaDesc
      };
      
      // 4. Check if translation already exists
      const existingCheck = await fetchData(`/rest/v1/article_translations?article_id=eq.${untranslated.id}&language=eq.sv`);
      
      if (existingCheck && existingCheck.length > 0) {
        console.log(`⚠️  Translation already exists for article ${untranslated.id}, skipping...`);
        continue;
      }
      
      // 5. Insert translation
      console.log('💾 Saving translation...');
      const result = await fetchData('/rest/v1/article_translations', {
        method: 'POST',
        body: JSON.stringify([translation])
      });
      
      if (result !== null) {
        console.log(`✅ Successfully translated article ${untranslated.id}`);
        successCount++;
      } else {
        console.log(`❌ Failed to save translation for article ${untranslated.id}`);
      }
      
    } catch (error) {
      console.error(`❌ Error in iteration ${i}:`, error.message);
    }
    
    // Brief pause between iterations
    await new Promise(resolve => setTimeout(resolve, 1500));
  }
  
  console.log(`\n🎉 Translation loop completed!`);
  console.log(`✅ Successfully translated: ${successCount}/15 articles`);
}

// Check if fetch is available (Node 18+)
if (typeof fetch === 'undefined') {
  console.log('❌ This script requires Node.js 18+ with fetch support');
  process.exit(1);
}

main().catch(console.error);