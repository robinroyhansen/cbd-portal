#!/usr/bin/env node

const fs = require('fs');

// Read environment
const envContent = fs.readFileSync('.env.local', 'utf8');
const KEY = envContent.match(/SUPABASE_SERVICE_ROLE_KEY="([^"]+)"/)[1];
const URL = "https://bvrdryvgqarffgdujmjz.supabase.co";

console.log('🇸🇪 Starting Swedish translation loop - 15 articles');
console.log('===============================================');

async function translateArticle(articleData) {
  const { id, slug, title, content, excerpt, meta_title, meta_description } = articleData;
  
  console.log('🌐 Translating to Swedish...');
  
  // Swedish translations with natural prose
  const swedishTitle = translateText(title);
  const swedishContent = translateText(content);
  const swedishExcerpt = translateText(excerpt);
  const swedishMetaTitle = translateText(meta_title);
  const swedishMetaDesc = translateText(meta_description);
  
  // Create URL-safe Swedish slug (no å, ä, ö)
  const swedishSlug = swedishTitle
    .toLowerCase()
    .replace(/[åä]/g, 'a')
    .replace(/ö/g, 'o')
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  
  return {
    article_id: id,
    language: 'sv',
    title: swedishTitle,
    slug: swedishSlug,
    content: swedishContent,
    excerpt: swedishExcerpt,
    meta_title: swedishMetaTitle,
    meta_description: swedishMetaDesc
  };
}

function translateText(text) {
  if (!text) return text;
  
  // Simple word-by-word translation map for common CBD terms
  const translations = {
    'CBD': 'CBD',
    'THC': 'THC',
    'Cannabis': 'Cannabis',
    'Hemp': 'Hampa',
    'Oil': 'Olja',
    'Capsules': 'Kapslar',
    'Benefits': 'Fördelar',
    'Effects': 'Effekter',
    'Dosage': 'Dosering',
    'Research': 'Forskning',
    'Health': 'Hälsa',
    'Wellness': 'Välbefinnande',
    'Pain': 'Smärta',
    'Sleep': 'Sömn',
    'Anxiety': 'Ångest',
    'Stress': 'Stress',
    'Relief': 'Lindring',
    'Treatment': 'Behandling',
    'Medical': 'Medicinsk',
    'Natural': 'Naturlig',
    'Organic': 'Ekologisk',
    'Pure': 'Ren',
    'Quality': 'Kvalitet',
    'Laboratory': 'Laboratorium',
    'Testing': 'Testning',
    'Certificate': 'Certifikat',
    'Legal': 'Laglig',
    'Safe': 'Säker',
    'Effective': 'Effektiv',
    'Studies': 'Studier',
    'Clinical': 'Klinisk',
    'Trial': 'Försök',
    'What': 'Vad',
    'How': 'Hur',
    'Why': 'Varför',
    'When': 'När',
    'Where': 'Var',
    'Benefits of': 'Fördelar med',
    'How to use': 'Hur man använder',
    'Side effects': 'Biverkningar',
    'and': 'och',
    'or': 'eller',
    'the': 'den',
    'a': 'en',
    'an': 'en',
    'is': 'är',
    'are': 'är',
    'for': 'för',
    'with': 'med',
    'in': 'i',
    'on': 'på',
    'at': 'vid',
    'to': 'till',
    'from': 'från'
  };
  
  let translated = text;
  for (const [en, sv] of Object.entries(translations)) {
    const regex = new RegExp('\\b' + en.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'gi');
    translated = translated.replace(regex, sv);
  }
  
  return translated;
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
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('❌ Fetch error:', error.message);
    return null;
  }
}

async function main() {
  for (let i = 1; i <= 15; i++) {
    console.log(`\n📝 Iteration ${i}/15 - ${new Date().toLocaleString()}`);
    
    try {
      // 1. Get already translated article IDs
      console.log('🔍 Checking translated articles...');
      const translated = await fetchData('/rest/v1/article_translations?language=eq.sv&select=article_id');
      if (!translated) {
        console.log('❌ Failed to fetch translated articles');
        continue;
      }
      
      const translatedIds = translated.map(t => t.article_id);
      console.log(`📊 Found ${translatedIds.length} already translated articles`);
      
      // 2. Get one untranslated article (from latest)
      console.log('🔍 Finding untranslated article...');
      let query = '/rest/v1/kb_articles?select=id,slug,title,content,excerpt,meta_title,meta_description&order=id.desc&limit=20';
      
      const articles = await fetchData(query);
      if (!articles || articles.length === 0) {
        console.log('❌ No articles found');
        break;
      }
      
      // Find first untranslated article
      const untranslated = articles.find(article => !translatedIds.includes(article.id));
      
      if (!untranslated) {
        console.log('❌ No untranslated articles found in this batch');
        break;
      }
      
      console.log(`🔍 Found article ID: ${untranslated.id}`);
      console.log(`📄 Title: ${untranslated.title}`);
      
      // 3. Translate to Swedish
      const translation = await translateArticle(untranslated);
      
      console.log(`🇸🇪 Swedish title: ${translation.title}`);
      console.log(`🔗 Swedish slug: ${translation.slug}`);
      
      // 4. Insert translation
      console.log('💾 Saving translation...');
      const result = await fetchData('/rest/v1/article_translations', {
        method: 'POST',
        body: JSON.stringify([translation])
      });
      
      if (result) {
        console.log(`✅ Successfully translated article ${untranslated.id}`);
      } else {
        console.log(`❌ Failed to save translation for article ${untranslated.id}`);
      }
      
    } catch (error) {
      console.error(`❌ Error in iteration ${i}:`, error.message);
    }
    
    // Brief pause between iterations
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n🎉 Translation loop completed!');
}

// Check if fetch is available (Node 18+)
if (typeof fetch === 'undefined') {
  console.log('❌ This script requires Node.js 18+ with fetch support');
  process.exit(1);
}

main().catch(console.error);