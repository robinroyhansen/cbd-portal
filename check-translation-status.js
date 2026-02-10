#!/usr/bin/env node

const fs = require('fs');

// Read environment
const envContent = fs.readFileSync('.env.local', 'utf8');
const KEY = envContent.match(/SUPABASE_SERVICE_ROLE_KEY="([^"]+)"/)[1];
const URL = "https://bvrdryvgqarffgdujmjz.supabase.co";

console.log('📊 Checking Swedish translation status...');
console.log('=====================================');

async function fetchData(endpoint) {
  const headers = {
    'apikey': KEY,
    'Authorization': `Bearer ${KEY}`,
    'Content-Type': 'application/json'
  };
  
  try {
    const response = await fetch(`${URL}${endpoint}`, { headers });
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
  // Get sample articles and check their translation status
  console.log('🔍 Fetching articles and checking translation coverage...');
  
  const articles = await fetchData('/rest/v1/kb_articles?select=id,title,created_at&limit=20');
  if (!articles) {
    console.log('❌ Could not fetch articles');
    return;
  }
  
  console.log(`📄 Checking ${articles.length} sample articles:`);
  
  let translatedCount = 0;
  let untranslatedArticles = [];
  
  for (const article of articles) {
    const translation = await fetchData(`/rest/v1/article_translations?article_id=eq.${article.id}&language=eq.sv`);
    
    if (translation && translation.length > 0) {
      translatedCount++;
      console.log(`✅ ${article.title.substring(0, 50)}... (TRANSLATED)`);
    } else {
      untranslatedArticles.push(article);
      console.log(`❌ ${article.title.substring(0, 50)}... (NOT TRANSLATED)`);
    }
  }
  
  console.log('\n📊 SUMMARY:');
  console.log(`✅ Translated: ${translatedCount}/${articles.length}`);
  console.log(`❌ Untranslated: ${articles.length - translatedCount}/${articles.length}`);
  console.log(`📈 Coverage: ${Math.round((translatedCount / articles.length) * 100)}%`);
  
  if (untranslatedArticles.length > 0) {
    console.log('\n🎯 Found untranslated articles:');
    untranslatedArticles.forEach((article, index) => {
      console.log(`${index + 1}. ${article.id} - ${article.title}`);
    });
  } else {
    console.log('\n🎉 All sample articles have Swedish translations!');
  }
  
  // Try to find ANY untranslated articles by checking different ranges
  console.log('\n🔍 Searching for any untranslated articles...');
  
  const strategies = [
    { name: 'Very Recent', query: '/rest/v1/kb_articles?order=created_at.desc&limit=50' },
    { name: 'Very Old', query: '/rest/v1/kb_articles?order=created_at.asc&limit=50' },
    { name: 'Middle Range', query: '/rest/v1/kb_articles?order=id.desc&offset=100&limit=50' },
    { name: 'High IDs', query: '/rest/v1/kb_articles?order=id.desc&offset=200&limit=50' }
  ];
  
  let foundUntranslated = [];
  
  for (const strategy of strategies) {
    const articles = await fetchData(`${strategy.query}&select=id,title`);
    if (!articles) continue;
    
    for (const article of articles.slice(0, 10)) { // Check first 10 from each strategy
      const translation = await fetchData(`/rest/v1/article_translations?article_id=eq.${article.id}&language=eq.sv`);
      
      if (!translation || translation.length === 0) {
        foundUntranslated.push(article);
        console.log(`🎯 FOUND UNTRANSLATED (${strategy.name}): ${article.title}`);
        
        if (foundUntranslated.length >= 15) break; // Found enough
      }
    }
    
    if (foundUntranslated.length >= 15) break;
  }
  
  console.log(`\n🎯 Total untranslated articles found: ${foundUntranslated.length}`);
  
  if (foundUntranslated.length > 0) {
    console.log('\n✨ These articles are ready for translation!');
  } else {
    console.log('\n🎉 Swedish translation appears to be nearly complete!');
    console.log('💡 Consider checking if there are any newer articles that need translation.');
  }
}

main().catch(console.error);