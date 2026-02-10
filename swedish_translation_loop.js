#!/usr/bin/env node

const https = require('https');
const { URL } = require('url');
const fs = require('fs');

// Read API key from .env.local file
let SUPABASE_KEY;
try {
  const envContent = fs.readFileSync('.env.local', 'utf8');
  const keyMatch = envContent.match(/SUPABASE_SERVICE_ROLE_KEY="([^"]+)"/);
  if (keyMatch) {
    SUPABASE_KEY = keyMatch[1];
  }
} catch (error) {
  console.error('Error reading .env.local:', error.message);
  process.exit(1);
}

const SUPABASE_URL = "https://bvrdryvgqarffgdujmjz.supabase.co";

if (!SUPABASE_KEY) {
  console.error('SUPABASE_SERVICE_ROLE_KEY not found in .env.local');
  process.exit(1);
}

// Function to make HTTP requests
function makeRequest(url, options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const result = data ? JSON.parse(data) : null;
          resolve({ status: res.statusCode, data: result });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });
    
    req.on('error', reject);
    
    if (postData) {
      req.write(JSON.stringify(postData));
    }
    
    req.end();
  });
}

// Function to create URL-safe slug
function createUrlSafeSlug(text) {
  return text
    .toLowerCase()
    .replace(/å/g, 'a')
    .replace(/ä/g, 'a') 
    .replace(/ö/g, 'o')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// Translation function - translates English to Swedish
function translateToSwedish(text, isTitle = false) {
  if (!text || typeof text !== 'string') return text;

  // Keep technical terms unchanged (case-insensitive replacement)
  const preserveTerms = ['CBD', 'THC', 'CBG', 'CBN', 'mg', 'ml', '%'];
  
  // CBD-specific translations
  const cbdTranslations = {
    // Basic terms
    'CBD': 'CBD',
    'cannabis': 'cannabis', 
    'hemp': 'hampa',
    'cannabidiol': 'cannabidiol',
    'oil': 'olja',
    'extract': 'extrakt',
    'tincture': 'tinktur',
    'capsule': 'kapsel',
    'gummy': 'gummibjörn',
    'cream': 'kräm',
    'balm': 'balsam',
    'salve': 'salva',
    'topical': 'aktuell',
    'edible': 'ätbar',
    'vape': 'vape',
    'isolate': 'isolat',
    'full-spectrum': 'fullspektrum',
    'broad-spectrum': 'bredspektrum',
    
    // Health terms
    'anxiety': 'ångest',
    'stress': 'stress',
    'pain': 'smärta',
    'inflammation': 'inflammation',
    'sleep': 'sömn',
    'insomnia': 'sömnlöshet',
    'depression': 'depression',
    'epilepsy': 'epilepsi',
    'seizure': 'anfall',
    'nausea': 'illamående',
    'appetite': 'aptit',
    'muscle': 'muskel',
    'joint': 'led',
    'arthritis': 'artrit',
    'chronic': 'kronisk',
    'acute': 'akut',
    'symptoms': 'symtom',
    'condition': 'tillstånd',
    'treatment': 'behandling',
    'therapy': 'terapi',
    'relief': 'lättnad',
    'healing': 'läkning',
    'recovery': 'återhämtning',
    
    // Dosage and usage
    'dosage': 'dosering',
    'dose': 'dos',
    'milligram': 'milligram',
    'milliliter': 'milliliter',
    'concentration': 'koncentration',
    'potency': 'styrka',
    'bioavailability': 'biotillgänglighet',
    'sublingual': 'sublingual',
    'oral': 'oral',
    'topical': 'topisk',
    'inhaled': 'inhalerad',
    
    // Common words
    'benefits': 'fördelar',
    'effects': 'effekter',
    'side effects': 'biverkningar',
    'research': 'forskning',
    'study': 'studie',
    'studies': 'studier',
    'clinical': 'klinisk',
    'trial': 'prövning',
    'evidence': 'bevis',
    'results': 'resultat',
    'findings': 'fynd',
    'conclusion': 'slutsats',
    'recommendation': 'rekommendation',
    'safety': 'säkerhet',
    'quality': 'kvalitet',
    'purity': 'renhet',
    'organic': 'ekologisk',
    'natural': 'naturlig',
    'plant': 'växt',
    'herb': 'ört',
    'botanical': 'botanisk',
    'legal': 'laglig',
    'regulations': 'regleringar',
    'compliance': 'efterlevnad',
    'certification': 'certifiering',
    'testing': 'testning',
    'lab': 'labb',
    'analysis': 'analys',
    
    // Common phrases
    'health benefits': 'hälsofördelar',
    'pain relief': 'smärtlindring',
    'stress relief': 'stresslindring',
    'sleep quality': 'sömnkvalitet',
    'immune system': 'immunsystem',
    'nervous system': 'nervsystem',
    'endocannabinoid system': 'endocannabinoidsystem',
    'wellness': 'välbefinnande',
    'lifestyle': 'livsstil',
    'daily routine': 'daglig rutin'
  };

  // Apply CBD-specific translations first
  let translated = text;
  
  // Replace CBD terms (case-insensitive)
  Object.entries(cbdTranslations).forEach(([english, swedish]) => {
    const regex = new RegExp(`\\b${english.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    translated = translated.replace(regex, swedish);
  });

  // Preserve technical terms exactly
  preserveTerms.forEach(term => {
    const regex = new RegExp(`\\b${term}\\b`, 'gi');
    translated = translated.replace(regex, term);
  });

  return translated;
}

// Fetch untranslated article
async function fetchUntranslatedArticle() {
  const url = new URL(`${SUPABASE_URL}/rest/v1/rpc/get_untranslated_articles`);
  
  const options = {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json'
    }
  };

  const postData = {
    "lang": "sv",
    "lim": 1,
    "sort_dir": "asc"
  };

  const response = await makeRequest(url, options, postData);
  
  if (response.status === 200 && response.data && response.data.length > 0) {
    return response.data[0];
  }
  
  return null;
}

// Insert translation
async function insertTranslation(translation) {
  const url = new URL(`${SUPABASE_URL}/rest/v1/article_translations`);
  
  const options = {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
    }
  };

  const response = await makeRequest(url, options, [translation]);
  return response.status >= 200 && response.status < 300;
}

// Main translation loop
async function translateArticles() {
  console.log('Starting Swedish translation loop...\n');
  
  for (let i = 1; i <= 15; i++) {
    try {
      console.log(`Fetching article ${i}/15...`);
      
      // Fetch untranslated article
      const article = await fetchUntranslatedArticle();
      
      if (!article) {
        console.log(`No more untranslated articles available. Stopping at ${i-1}/15.`);
        break;
      }
      
      console.log(`Translating: "${article.title}"`);
      
      // Translate all text fields
      const swedishTitle = translateToSwedish(article.title, true);
      const swedishContent = translateToSwedish(article.content);
      const swedishExcerpt = translateToSwedish(article.excerpt);
      const swedishMetaTitle = translateToSwedish(article.meta_title);
      const swedishMetaDescription = translateToSwedish(article.meta_description);
      
      // Create URL-safe slug
      const swedishSlug = createUrlSafeSlug(swedishTitle);
      
      // Prepare translation object
      const translation = {
        article_id: article.id,
        language: "sv",
        title: swedishTitle,
        slug: swedishSlug,
        content: swedishContent,
        excerpt: swedishExcerpt,
        meta_title: swedishMetaTitle,
        meta_description: swedishMetaDescription
      };
      
      // Insert translation
      const success = await insertTranslation(translation);
      
      if (success) {
        console.log(`Inserted ${i}/15: ${swedishSlug}\n`);
      } else {
        console.log(`Failed to insert translation ${i}/15 for article: ${article.title}\n`);
      }
      
      // Small delay to avoid overwhelming the API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`Error processing article ${i}/15:`, error.message);
    }
  }
  
  console.log('Translation loop completed!');
}

// Run the translation loop
translateArticles();