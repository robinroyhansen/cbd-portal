#!/usr/bin/env node
/**
 * Swedish Translation Script - Batch Starting at Offset 75
 * Uses Gemini 2.0 Flash API for fast, reliable translations
 * 
 * Translates 75 articles from the untranslated list starting at offset 75
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load environment
function loadEnv() {
  try {
    const envPath = join(__dirname, '..', '.env.local');
    const envContent = readFileSync(envPath, 'utf-8');
    const lines = envContent.split('\n');
    for (const line of lines) {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        let value = match[2].trim();
        if ((value.startsWith('"') && value.endsWith('"')) || 
            (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        process.env[key] = value;
      }
    }
  } catch (err) {
    console.error('Failed to load .env.local:', err.message);
    process.exit(1);
  }
}

loadEnv();

// Configuration
const GEMINI_API_KEY = 'AIzaSyDFAhONFtUzw60V-K0od-814Yi7AuobHuQ';
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Swedish language configuration
const SWEDISH_CONFIG = { name: 'Swedish', country: 'Sweden' };

// Rate limiting
const REQUEST_DELAY = 1000; // 1 second between requests
const BATCH_SIZE = 5; // Process 5 at a time
const BATCH_DELAY = 3000; // 3 seconds between batches

// Build translation prompt
function buildPrompt(article) {
  return `You are a professional translator. Translate this CBD health article from English to Swedish.

CRITICAL: All output text MUST be in Swedish language, NOT English!

Translation rules:
- Write in natural Swedish appropriate for Sweden
- Preserve ALL markdown formatting, HTML tags, and internal links exactly
- Keep these terms in English: CBD, THC, CBG, CBN, CBDA, mg, ml, %
- Keep ALL internal link paths unchanged (e.g., /conditions/anxiety stays as /conditions/anxiety)
- Use standard medical terminology in Swedish
- Create a URL-safe slug in Swedish (lowercase, hyphens, no å/ä/ö - use a/a/o instead)

Return a JSON object with these fields (all values in Swedish):
{
  "title": "translated title in Swedish",
  "slug": "url-safe-slug-without-special-chars",
  "content": "full article content translated to Swedish",
  "excerpt": "1-2 sentence summary in Swedish",
  "meta_title": "SEO title in Swedish (max 60 chars)",
  "meta_description": "meta description in Swedish (max 155 chars)"
}

ARTICLE TO TRANSLATE:

Title: ${article.title}

Content:
${article.content}

${article.excerpt ? `Excerpt: ${article.excerpt}` : ''}
${article.meta_title ? `Meta Title: ${article.meta_title}` : ''}
${article.meta_description ? `Meta Description: ${article.meta_description}` : ''}`;
}

// Call Gemini API
async function callGemini(prompt) {
  const response = await fetch(GEMINI_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.3,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  
  if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
    throw new Error('No content in Gemini response');
  }

  return data.candidates[0].content.parts[0].text;
}

// Parse Gemini response
function parseGeminiResponse(text) {
  // Find JSON block in response
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('No JSON found in response');
  }
  
  let jsonStr = jsonMatch[0];
  
  // Try to parse JSON with multiple fallbacks
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      if (attempt === 1) {
        jsonStr = fixJsonNewlines(jsonStr);
      } else if (attempt === 2) {
        jsonStr = jsonStr
          .replace(/\n/g, '\\n')
          .replace(/\r/g, '\\r')
          .replace(/\t/g, '\\t');
      }
      
      return JSON.parse(jsonStr);
    } catch (e) {
      if (attempt === 2) {
        console.error('Failed to parse response. First 500 chars:', text.substring(0, 500));
        throw new Error('Failed to parse JSON from response');
      }
    }
  }
}

// Fix JSON newlines
function fixJsonNewlines(jsonStr) {
  let result = '';
  let inString = false;
  let escaped = false;
  
  for (let i = 0; i < jsonStr.length; i++) {
    const char = jsonStr[i];
    
    if (escaped) {
      result += char;
      escaped = false;
      continue;
    }
    
    if (char === '\\') {
      result += char;
      escaped = true;
      continue;
    }
    
    if (char === '"') {
      inString = !inString;
      result += char;
      continue;
    }
    
    if (inString) {
      if (char === '\n') {
        result += '\\n';
      } else if (char === '\r') {
        result += '\\r';
      } else if (char === '\t') {
        result += '\\t';
      } else {
        result += char;
      }
    } else {
      result += char;
    }
  }
  
  return result;
}

// Sleep helper
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Get untranslated articles with offset 75, limit 75
async function getUntranslatedArticlesWithOffset() {
  console.log('🔍 Fetching existing Swedish translations...');
  
  // Get existing Swedish translations
  const { data: existingTranslations, error: transErr } = await supabase
    .from('article_translations')
    .select('article_id')
    .eq('language', 'sv');
  
  if (transErr) {
    throw new Error(`Error fetching existing translations: ${transErr.message}`);
  }
  
  const translatedIds = new Set(existingTranslations?.map(t => t.article_id) || []);
  console.log(`   Already translated: ${translatedIds.size} articles`);
  
  // Get all published articles
  console.log('📋 Fetching all published articles...');
  const { data: allArticles, error: articlesErr } = await supabase
    .from('kb_articles')
    .select('id, title, slug, content, excerpt, meta_title, meta_description')
    .eq('status', 'published')
    .order('id');
  
  if (articlesErr) {
    throw new Error(`Error fetching articles: ${articlesErr.message}`);
  }
  
  console.log(`   Total articles: ${allArticles.length}`);
  
  // Filter untranslated and apply offset/limit
  const untranslated = allArticles.filter(a => !translatedIds.has(a.id));
  console.log(`   Untranslated: ${untranslated.length}`);
  
  const targetArticles = untranslated.slice(75, 150); // OFFSET 75, LIMIT 75
  console.log(`   Target batch (offset 75): ${targetArticles.length} articles`);
  
  return targetArticles;
}

// Translate single article
async function translateArticle(article) {
  const prompt = buildPrompt(article);
  const rawResponse = await callGemini(prompt);
  const translated = parseGeminiResponse(rawResponse);
  
  // Validate required fields
  if (!translated.title || !translated.slug || !translated.content) {
    throw new Error('Missing required fields in translation');
  }
  
  // Ensure slug is URL-safe
  translated.slug = translated.slug
    .toLowerCase()
    .replace(/[åäö]/g, match => ({ 'å': 'a', 'ä': 'a', 'ö': 'o' }[match]))
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  
  // Truncate meta fields if needed
  if (translated.meta_title && translated.meta_title.length > 60) {
    translated.meta_title = translated.meta_title.substring(0, 57) + '...';
  }
  if (translated.meta_description && translated.meta_description.length > 155) {
    translated.meta_description = translated.meta_description.substring(0, 152) + '...';
  }
  
  return {
    article_id: article.id,
    language: 'sv',
    slug: translated.slug,
    title: translated.title,
    content: translated.content,
    excerpt: translated.excerpt || null,
    meta_title: translated.meta_title || null,
    meta_description: translated.meta_description || null,
    translation_quality: 'ai',
    translated_at: new Date().toISOString(),
  };
}

// Insert translations
async function insertTranslations(translations) {
  if (translations.length === 0) return { success: 0, failed: 0 };
  
  const { error } = await supabase
    .from('article_translations')
    .insert(translations);
  
  if (error) {
    console.error('Insert error:', error.message);
    return { success: 0, failed: translations.length };
  }
  
  return { success: translations.length, failed: 0 };
}

// Process articles in batches
async function processArticles(articles) {
  const stats = { total: articles.length, success: 0, failed: 0, failedArticles: [] };
  const startTime = Date.now();
  let processed = 0;
  
  console.log(`🚀 Processing ${articles.length} articles in batches of ${BATCH_SIZE}...\n`);
  
  for (let i = 0; i < articles.length; i += BATCH_SIZE) {
    const batch = articles.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(articles.length / BATCH_SIZE);
    
    console.log(`📦 Batch ${batchNum}/${totalBatches} (${batch.length} articles):`);
    
    const batchPromises = batch.map(async (article, idx) => {
      try {
        const translation = await translateArticle(article);
        await sleep(REQUEST_DELAY); // Rate limiting
        return { success: true, translation, article };
      } catch (error) {
        return { success: false, error: error.message, article };
      }
    });
    
    const results = await Promise.all(batchPromises);
    
    // Collect successful translations
    const successfulTranslations = [];
    for (const result of results) {
      processed++;
      if (result.success) {
        successfulTranslations.push(result.translation);
        console.log(`   ✅ [${processed}/${articles.length}] "${result.article.title.substring(0, 50)}..."`);
      } else {
        stats.failed++;
        stats.failedArticles.push({
          id: result.article.id,
          title: result.article.title,
          error: result.error,
        });
        console.log(`   ❌ [${processed}/${articles.length}] "${result.article.title.substring(0, 50)}..." - ${result.error}`);
      }
    }
    
    // Insert successful translations
    if (successfulTranslations.length > 0) {
      const insertResult = await insertTranslations(successfulTranslations);
      stats.success += insertResult.success;
      if (insertResult.failed > 0) {
        stats.failed += insertResult.failed;
        console.log(`   ⚠️ Insert failed for ${insertResult.failed} translations`);
      }
    }
    
    // Progress update
    const elapsed = (Date.now() - startTime) / 1000;
    const rate = processed / elapsed;
    const remaining = articles.length - processed;
    const eta = remaining / rate;
    
    const pct = ((processed / articles.length) * 100).toFixed(1);
    console.log(`   📊 Progress: ${processed}/${articles.length} (${pct}%) | ` +
                `Rate: ${rate.toFixed(1)} art/sec | ` +
                `ETA: ${Math.ceil(eta)}s | ` +
                `✅ ${stats.success} ❌ ${stats.failed}\n`);
    
    // Delay between batches
    if (i + BATCH_SIZE < articles.length) {
      console.log(`⏳ Waiting ${BATCH_DELAY/1000}s before next batch...`);
      await sleep(BATCH_DELAY);
    }
  }
  
  return stats;
}

// Main function
async function main() {
  console.log('🇸🇪 Swedish Translation - Batch 75 (Offset 75, Limit 75)');
  console.log('   Using: Gemini 2.0 Flash API\n');
  
  try {
    // Get articles to translate
    const articles = await getUntranslatedArticlesWithOffset();
    
    if (articles.length === 0) {
      console.log('✅ No articles found at offset 75 to translate!');
      return;
    }
    
    // Process articles
    const startTime = Date.now();
    const stats = await processArticles(articles);
    const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
    
    // Save results
    const timestamp = new Date().toISOString().split('T')[0];
    const resultsFile = `swedish-translations-offset-75-${timestamp}.json`;
    
    const results = {
      timestamp: new Date().toISOString(),
      batch: 'offset-75-limit-75',
      language: 'sv',
      stats,
      failedArticles: stats.failedArticles,
    };
    
    writeFileSync(resultsFile, JSON.stringify(results, null, 2));
    
    // Final report
    console.log('\n' + '═'.repeat(60));
    console.log('🏁 SWEDISH TRANSLATION BATCH COMPLETE');
    console.log('═'.repeat(60));
    console.log(`   Batch: Offset 75, Limit 75`);
    console.log(`   Total processed: ${stats.total}`);
    console.log(`   ✅ Successfully translated: ${stats.success}`);
    console.log(`   ❌ Failed: ${stats.failed}`);
    console.log(`   ⏱️ Total time: ${totalTime}s`);
    console.log(`   📁 Results saved: ${resultsFile}`);
    
    if (stats.failedArticles.length > 0) {
      console.log(`\n❌ Failed articles:`);
      stats.failedArticles.forEach(article => {
        console.log(`   - ${article.title.substring(0, 60)}... (ID: ${article.id})`);
        console.log(`     Error: ${article.error}`);
      });
    }
    
    console.log('═'.repeat(60));
    
    return stats;
    
  } catch (error) {
    console.error('\n💥 Script failed:', error.message);
    process.exit(1);
  }
}

// Run script
main().catch(error => {
  console.error('💥 Unhandled error:', error);
  process.exit(1);
});