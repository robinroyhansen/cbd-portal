#!/usr/bin/env node

const fs = require('fs');

// Read environment
const envContent = fs.readFileSync('.env.local', 'utf8');
const KEY = envContent.match(/SUPABASE_SERVICE_ROLE_KEY="([^"]+)"/)[1];
const URL = "https://bvrdryvgqarffgdujmjz.supabase.co";

console.log('🇸🇪 Manual Swedish translation - targeting specific articles');
console.log('========================================================');

// Comprehensive Swedish translation
function translateToSwedish(text) {
  if (!text) return text;
  
  // Comprehensive Swedish translation map
  const replacements = [
    // Question words and phrases
    ['How to Calculate Your Dose', 'Hur man beräknar din dos'],
    ['How to calculate', 'Hur man beräknar'],
    ['How to use', 'Hur man använder'],
    ['How to choose', 'Hur man väljer'],
    ['How to take', 'Hur man tar'],
    ['What is', 'Vad är'],
    ['What are', 'Vad är'],
    ['Benefits of', 'Fördelar med'],
    ['Side effects of', 'Biverkningar av'],
    ['Complete guide to', 'Komplett guide till'],
    ['Ultimate guide', 'Ultimat guide'],
    ['Guide to', 'Guide till'],
    ['Everything you need to know', 'Allt du behöver veta'],
    
    // CBD/Cannabis terms
    ['CBD mg/ml Calculator', 'CBD mg/ml kalkylator'],
    ['Calculator Guide', 'Kalkylator guide'],
    ['CBD Oil', 'CBD-olja'],
    ['CBD Capsules', 'CBD-kapslar'],
    ['CBD Gummies', 'CBD-gummin'],
    ['CBD Products', 'CBD-produkter'],
    ['Cannabis Oil', 'Cannabis-olja'],
    ['Hemp Oil', 'Hampaolja'],
    ['Full Spectrum', 'Fullspektrum'],
    ['Broad Spectrum', 'Bredspektrum'],
    ['CBD Isolate', 'CBD-isolat'],
    ['THC Content', 'THC-innehåll'],
    ['Third Party Testing', 'Tredje parts testning'],
    
    // Health and effects
    ['Pain Relief', 'Smärtlindring'],
    ['Sleep Aid', 'Sömnhjälp'],
    ['Anxiety Relief', 'Ångeslindring'],
    ['Stress Relief', 'Stresslindring'],
    ['Anti-inflammatory', 'Antiinflammatorisk'],
    ['Side Effects', 'Biverkningar'],
    ['Health Benefits', 'Hälsofördelar'],
    ['Therapeutic Effects', 'Terapeutiska effekter'],
    ['Medical Benefits', 'Medicinska fördelar'],
    
    // Quality and safety
    ['Laboratory Testing', 'Laboratorietestning'],
    ['Certificate of Analysis', 'Analysbevis'],
    ['Quality Assurance', 'Kvalitetssäkring'],
    ['Organic Hemp', 'Ekologisk hampa'],
    ['Natural Ingredients', 'Naturliga ingredienser'],
    ['Safe and Effective', 'Säker och effektiv'],
    ['FDA Approved', 'FDA-godkänd'],
    ['GMP Certified', 'GMP-certifierad'],
    
    // Dosage and usage
    ['Recommended Dosage', 'Rekommenderad dosering'],
    ['Start Low', 'Börja lågt'],
    ['Go Slow', 'Öka långsamt'],
    ['Daily Dose', 'Daglig dos'],
    ['Serving Size', 'Portionsstorlek'],
    ['Instructions for Use', 'Bruksanvisning'],
    ['When to Take', 'När man ska ta'],
    ['How Often', 'Hur ofta'],
    
    // Individual words
    ['Calculator', 'Kalkylator'],
    ['Guide', 'Guide'],
    ['Benefits', 'Fördelar'],
    ['Effects', 'Effekter'],
    ['Dosage', 'Dosering'],
    ['Research', 'Forskning'],
    ['Studies', 'Studier'],
    ['Health', 'Hälsa'],
    ['Wellness', 'Välbefinnande'],
    ['Pain', 'Smärta'],
    ['Relief', 'Lindring'],
    ['Sleep', 'Sömn'],
    ['Anxiety', 'Ångest'],
    ['Stress', 'Stress'],
    ['Quality', 'Kvalitet'],
    ['Pure', 'Ren'],
    ['Natural', 'Naturlig'],
    ['Organic', 'Ekologisk'],
    ['Safe', 'Säker'],
    ['Effective', 'Effektiv'],
    ['Legal', 'Laglig'],
    ['Treatment', 'Behandling'],
    ['Supplement', 'Kosttillskott'],
    ['Product', 'Produkt'],
    ['Brand', 'Märke'],
    ['Company', 'Företag'],
    ['Customer', 'Kund'],
    ['Review', 'Recension'],
    ['Rating', 'Betyg'],
    ['Price', 'Pris'],
    ['Buy', 'Köp'],
    ['Order', 'Beställ'],
    ['Shop', 'Handla'],
    ['Store', 'Butik'],
    ['Your', 'Din'],
    ['The', 'Den'],
    ['A', 'En'],
    ['An', 'En'],
    ['This', 'Denna'],
    ['That', 'Den där'],
    ['These', 'Dessa'],
    ['Those', 'De där'],
    ['Best', 'Bästa'],
    ['Better', 'Bättre'],
    ['Good', 'Bra'],
    ['Bad', 'Dålig'],
    ['New', 'Ny'],
    ['Old', 'Gammal'],
    ['First', 'Första'],
    ['Last', 'Sista'],
    ['Next', 'Nästa'],
    ['Previous', 'Föregående'],
    ['and', 'och'],
    ['or', 'eller'],
    ['but', 'men'],
    ['with', 'med'],
    ['for', 'för'],
    ['in', 'i'],
    ['on', 'på'],
    ['at', 'vid'],
    ['to', 'till'],
    ['from', 'från'],
    ['by', 'av'],
    ['about', 'om'],
    ['through', 'genom'],
    ['during', 'under'],
    ['before', 'före'],
    ['after', 'efter'],
    ['above', 'ovan'],
    ['below', 'under'],
    ['between', 'mellan'],
    ['among', 'bland'],
    ['without', 'utan']
  ];
  
  let result = text;
  
  // Apply replacements in order of length (longest first)
  replacements
    .sort((a, b) => b[0].length - a[0].length)
    .forEach(([en, sv]) => {
      const regex = new RegExp('\\b' + en.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'gi');
      result = result.replace(regex, sv);
    });
  
  return result;
}

function createSwedishSlug(title) {
  return title
    .toLowerCase()
    .replace(/[åäá]/g, 'a')
    .replace(/[öó]/g, 'o')
    .replace(/[ü]/g, 'u')
    .replace(/[ñ]/g, 'n')
    .replace(/[ç]/g, 'c')
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
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('❌ Fetch error:', error.message);
    return null;
  }
}

async function main() {
  console.log('🔍 Starting manual translation process...');
  
  let successCount = 0;
  
  // Try different strategies to find untranslated articles
  const strategies = [
    { name: 'Recent Articles', query: '/rest/v1/kb_articles?order=created_at.desc&limit=100' },
    { name: 'Oldest Articles', query: '/rest/v1/kb_articles?order=created_at.asc&limit=100' },
    { name: 'Random Articles', query: '/rest/v1/kb_articles?order=id.asc&offset=500&limit=100' }
  ];
  
  for (const strategy of strategies) {
    console.log(`\n🔍 Trying strategy: ${strategy.name}`);
    
    // Get articles
    const articles = await fetchData(`${strategy.query}&select=id,slug,title,content,excerpt,meta_title,meta_description`);
    
    if (!articles || articles.length === 0) {
      console.log(`❌ No articles found for ${strategy.name}`);
      continue;
    }
    
    console.log(`📄 Found ${articles.length} articles`);
    
    // Check each article for Swedish translation
    for (const article of articles.slice(0, 5)) { // Process first 5 from each strategy
      if (successCount >= 15) break; // Stop when we reach 15 successful translations
      
      try {
        // Check if this article already has Swedish translation
        const existing = await fetchData(`/rest/v1/article_translations?article_id=eq.${article.id}&language=eq.sv`);
        
        if (existing && existing.length > 0) {
          console.log(`⚠️  Article ${article.id} already translated, skipping`);
          continue;
        }
        
        console.log(`\n🌐 Translating: ${article.title}`);
        console.log(`📄 Article ID: ${article.id}`);
        
        // Translate
        const swedishTitle = translateToSwedish(article.title);
        const swedishContent = translateToSwedish(article.content);
        const swedishExcerpt = translateToSwedish(article.excerpt);
        const swedishMetaTitle = translateToSwedish(article.meta_title);
        const swedishMetaDesc = translateToSwedish(article.meta_description);
        const swedishSlug = createSwedishSlug(swedishTitle);
        
        console.log(`🇸🇪 Swedish title: ${swedishTitle}`);
        console.log(`🔗 Swedish slug: ${swedishSlug}`);
        
        const translation = {
          article_id: article.id,
          language: 'sv',
          title: swedishTitle,
          slug: swedishSlug,
          content: swedishContent,
          excerpt: swedishExcerpt,
          meta_title: swedishMetaTitle,
          meta_description: swedishMetaDesc
        };
        
        // Insert translation
        const result = await fetchData('/rest/v1/article_translations', {
          method: 'POST',
          body: JSON.stringify([translation])
        });
        
        if (result !== null) {
          console.log(`✅ Successfully translated article ${article.id}`);
          successCount++;
        } else {
          console.log(`❌ Failed to save translation`);
        }
        
        // Pause between translations
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (error) {
        console.error(`❌ Error translating article ${article.id}:`, error.message);
      }
    }
    
    if (successCount >= 15) break;
  }
  
  console.log(`\n🎉 Translation process completed!`);
  console.log(`✅ Successfully translated: ${successCount}/15 articles`);
}

main().catch(console.error);