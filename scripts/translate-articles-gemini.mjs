#!/usr/bin/env node
/**
 * Bulk Article Translation Script using Gemini 2.0 Flash API
 * 
 * Usage:
 *   node scripts/translate-articles-gemini.mjs --lang=sv
 *   node scripts/translate-articles-gemini.mjs --lang=sv --batch=100
 *   node scripts/translate-articles-gemini.mjs --lang=sv --all
 * 
 * Translates CBD Portal articles to target language using Gemini Flash (fast & cheap)
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env.local
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
        // Remove quotes if present
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

// Supported languages
const LANGUAGES = {
  sv: { name: 'Swedish', country: 'Sweden' },
  fi: { name: 'Finnish', country: 'Finland' },
  fr: { name: 'French', country: 'France' },
  it: { name: 'Italian', country: 'Italy' },
  nl: { name: 'Dutch', country: 'Netherlands' },
  es: { name: 'Spanish', country: 'Spain (Castilian)' },
  pt: { name: 'Portuguese', country: 'Portugal (European)' },
  ro: { name: 'Romanian', country: 'Romania' },
  da: { name: 'Danish', country: 'Denmark' },
  no: { name: 'Norwegian', country: 'Norway' },
};

// Parse command line arguments
function parseArgs() {
  const args = { lang: null, batch: 50, all: false, skip: 0 };
  
  for (const arg of process.argv.slice(2)) {
    if (arg.startsWith('--lang=')) {
      args.lang = arg.split('=')[1];
    } else if (arg.startsWith('--batch=')) {
      args.batch = parseInt(arg.split('=')[1], 10);
    } else if (arg.startsWith('--skip=')) {
      args.skip = parseInt(arg.split('=')[1], 10);
    } else if (arg === '--all') {
      args.all = true;
    }
  }
  
  return args;
}

// Get articles that need translation
async function getUntranslatedArticles(lang) {
  // Get all article IDs that already have translations for this language
  const { data: existingTranslations, error: transErr } = await supabase
    .from('article_translations')
    .select('article_id')
    .eq('language', lang);
  
  if (transErr) {
    console.error('Error fetching existing translations:', transErr);
    return [];
  }
  
  const translatedIds = new Set(existingTranslations?.map(t => t.article_id) || []);
  
  // Get all articles
  const { data: articles, error: articlesErr } = await supabase
    .from('kb_articles')
    .select('id, title, slug, content, excerpt, meta_title, meta_description')
    .eq('status', 'published')
    .order('created_at', { ascending: true });
  
  if (articlesErr) {
    console.error('Error fetching articles:', articlesErr);
    return [];
  }
  
  // Filter out already translated
  const untranslated = articles.filter(a => !translatedIds.has(a.id));
  
  return untranslated;
}

// Build translation prompt
function buildPrompt(article, langConfig, langCode) {
  return `You are a professional translator. Translate this CBD health article from English to ${langConfig.name}.

CRITICAL: All output text MUST be in ${langConfig.name} language, NOT English!

Translation rules:
- Write in natural ${langConfig.name} appropriate for ${langConfig.country}
- Preserve ALL markdown formatting, HTML tags, and internal links exactly
- Keep these terms in English: CBD, THC, CBG, CBN, CBDA, mg, ml, %
- Keep ALL internal link paths unchanged (e.g., /conditions/anxiety stays as /conditions/anxiety)
- Use standard medical terminology in ${langConfig.name}
- Create a URL-safe slug in ${langConfig.name} (lowercase, hyphens, no accents/special characters)

Return a JSON object with these fields (all values in ${langConfig.name}):
{
  "title": "translated title in ${langConfig.name}",
  "slug": "url-safe-slug-in-${langCode}",
  "content": "full article content translated to ${langConfig.name}",
  "excerpt": "1-2 sentence summary in ${langConfig.name}",
  "meta_title": "SEO title in ${langConfig.name} (max 60 chars)",
  "meta_description": "SEO description in ${langConfig.name} (max 155 chars)"
}

=== ENGLISH ARTICLE TO TRANSLATE ===
Title: ${article.title}
Slug: ${article.slug}
Content:
${article.content || ''}
=== END OF ARTICLE ===

Translate the above article to ${langConfig.name}. Return only the JSON object.`;
}

// Call Gemini API with retries
async function callGemini(prompt, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(GEMINI_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 131072,
            responseMimeType: 'application/json',
            responseSchema: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                slug: { type: 'string' },
                content: { type: 'string' },
                excerpt: { type: 'string' },
                meta_title: { type: 'string' },
                meta_description: { type: 'string' }
              },
              required: ['title', 'slug', 'content', 'excerpt', 'meta_title', 'meta_description']
            }
          }
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API error ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      
      if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
        throw new Error('No content in Gemini response');
      }

      const rawText = data.candidates[0].content.parts[0].text;
      
      // Try parsing directly first
      try {
        return JSON.parse(rawText);
      } catch {
        // Gemini often returns JSON with literal newlines in string values.
        // Fix by escaping newlines inside string values.
        try {
          const fixed = rawText.replace(/(?<=:\s*"(?:[^"\\]|\\.)*)(\n)/g, '\\n');
          return JSON.parse(fixed);
        } catch {
          // More aggressive: replace ALL literal newlines inside the JSON strings
          try {
            let result = '';
            let inStr = false;
            let esc = false;
            for (let i = 0; i < rawText.length; i++) {
              const ch = rawText[i];
              if (esc) { result += ch; esc = false; continue; }
              if (ch === '\\') { result += ch; esc = true; continue; }
              if (ch === '"') { inStr = !inStr; result += ch; continue; }
              if (inStr && ch === '\n') { result += '\\n'; continue; }
              if (inStr && ch === '\r') { result += '\\r'; continue; }
              if (inStr && ch === '\t') { result += '\\t'; continue; }
              result += ch;
            }
            return JSON.parse(result);
          } catch(e3) {
            console.error(`  [JSON-FIX] All 3 parse methods failed. Text length: ${rawText.length}, Last 100 chars: ${rawText.slice(-100)}`);
            return rawText;
          }
        }
      }
    } catch (error) {
      if (attempt === retries) {
        throw error;
      }
      // Exponential backoff: 1s, 2s, 4s
      const delay = Math.pow(2, attempt - 1) * 1000;
      console.log(`  Retry ${attempt}/${retries} after ${delay}ms...`);
      await sleep(delay);
    }
  }
}

// Parse JSON from Gemini response (handles markdown fences and various formats)
function parseGeminiResponse(text) {
  // Clean up the text first
  let cleaned = text.trim();
  
  // Try direct parse first
  try {
    return JSON.parse(cleaned);
  } catch {
    // Continue to other methods
  }
  
  // Apply newline fix to the entire text and try again
  try {
    const fixed = fixJsonNewlines(cleaned);
    return JSON.parse(fixed);
  } catch {
    // Continue to other methods
  }
  
  // Try to extract JSON from markdown code block
  const jsonMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    try {
      const fixed = fixJsonNewlines(jsonMatch[1].trim());
      return JSON.parse(fixed);
    } catch {
      // Continue to other methods
    }
  }
  
  // Try to find JSON object using bracket matching (for responses with extra text)
  const startIdx = cleaned.indexOf('{');
  if (startIdx !== -1) {
    // Find matching closing brace, being careful about strings
    let depth = 0;
    let endIdx = -1;
    let inString = false;
    let escaped = false;
    
    for (let i = startIdx; i < cleaned.length; i++) {
      const char = cleaned[i];
      
      if (escaped) {
        escaped = false;
        continue;
      }
      
      if (char === '\\') {
        escaped = true;
        continue;
      }
      
      if (char === '"' && !escaped) {
        inString = !inString;
        continue;
      }
      
      if (!inString) {
        if (char === '{') depth++;
        else if (char === '}') {
          depth--;
          if (depth === 0) {
            endIdx = i;
            break;
          }
        }
      }
    }
    
    if (endIdx !== -1) {
      const jsonStr = cleaned.substring(startIdx, endIdx + 1);
      try {
        const fixed = fixJsonNewlines(jsonStr);
        return JSON.parse(fixed);
      } catch {
        // Continue to fallback
      }
    }
  }
  
  // Last resort: try to extract fields using regex
  const extracted = extractFieldsFromBrokenJson(cleaned);
  if (extracted && extracted.title && extracted.content) {
    return extracted;
  }
  
  // Log a sample of what we got for debugging
  console.error('  [DEBUG] Failed to parse response. First 500 chars:', text.substring(0, 500));
  throw new Error('Failed to parse JSON from response');
}

// Fix unescaped newlines and control characters in JSON string values
function fixJsonNewlines(jsonStr) {
  let result = '';
  let inString = false;
  let escaped = false;
  
  for (let i = 0; i < jsonStr.length; i++) {
    const char = jsonStr[i];
    const code = char.charCodeAt(0);
    
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
      // Escape control characters inside strings
      if (char === '\n') {
        result += '\\n';
      } else if (char === '\r') {
        result += '\\r';
      } else if (char === '\t') {
        result += '\\t';
      } else if (code < 32) {
        // Other control characters
        result += '\\u' + code.toString(16).padStart(4, '0');
      } else {
        result += char;
      }
    } else {
      result += char;
    }
  }
  
  return result;
}

// Alternative: try to parse field by field using regex
function extractFieldsFromBrokenJson(text) {
  const result = {};
  
  // Try to extract each field using regex
  const fields = ['title', 'slug', 'content', 'excerpt', 'meta_title', 'meta_description'];
  
  for (const field of fields) {
    // Match "field": "value" or "field": "value...
    const regex = new RegExp(`"${field}"\\s*:\\s*"`, 'i');
    const match = text.match(regex);
    
    if (match) {
      const startIdx = match.index + match[0].length;
      // Find the end of the string value
      let endIdx = startIdx;
      let escaped = false;
      
      for (let i = startIdx; i < text.length; i++) {
        if (escaped) {
          escaped = false;
          continue;
        }
        if (text[i] === '\\') {
          escaped = true;
          continue;
        }
        if (text[i] === '"') {
          endIdx = i;
          break;
        }
      }
      
      if (endIdx > startIdx) {
        let value = text.substring(startIdx, endIdx);
        // Unescape common sequences
        value = value.replace(/\\n/g, '\n').replace(/\\r/g, '\r').replace(/\\t/g, '\t').replace(/\\"/g, '"');
        result[field] = value;
      }
    }
  }
  
  return Object.keys(result).length >= 3 ? result : null;
}

// Sleep helper
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Translate a single article
async function translateArticle(article, lang, langConfig) {
  const prompt = buildPrompt(article, langConfig, lang);
  const rawResponse = await callGemini(prompt);
  
  if (!rawResponse) {
    throw new Error('Empty response from Gemini');
  }
  
  // callGemini may return a pre-parsed object or a string
  let translated;
  if (typeof rawResponse === 'object' && !Array.isArray(rawResponse)) {
    translated = rawResponse;
  } else if (Array.isArray(rawResponse)) {
    translated = rawResponse[0] || {};
  } else {
    translated = parseGeminiResponse(rawResponse);
  }
  
  // Handle array responses
  if (Array.isArray(translated)) {
    translated = translated[0] || {};
  }
  
  // Validate required fields
  if (!translated || typeof translated !== 'object') {
    throw new Error('Failed to parse translation response');
  }
  
  if (!translated.title) {
    // If we got an array, use first element
    if (Array.isArray(translated) && translated.length > 0 && translated[0].title) {
      return translateArticle_postProcess(translated[0], article, lang);
    }
    throw new Error(`Missing title in translation. Got keys: ${Object.keys(translated).join(', ')} Type: ${typeof translated} IsArray: ${Array.isArray(translated)}`);
  }
  
  if (!translated.content) {
    throw new Error(`Missing content in translation. Title: ${translated.title?.substring(0, 30)}`);
  }
  
  // Auto-generate slug if missing
  if (!translated.slug) {
    translated.slug = translated.title
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 80);
  }
  
  // Truncate meta fields if needed
  if (translated.meta_title && translated.meta_title.length > 60) {
    translated.meta_title = translated.meta_title.substring(0, 57) + '...';
  }
  if (translated.meta_description && translated.meta_description.length > 155) {
    translated.meta_description = translated.meta_description.substring(0, 152) + '...';
  }
  
  return {
    article_id: article.id,
    language: lang,
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

// Insert translations into database
async function insertTranslations(translations) {
  if (translations.length === 0) return { success: 0, failed: 0 };
  
  const { data, error } = await supabase
    .from('article_translations')
    .upsert(translations, { 
      onConflict: 'article_id,language',
      ignoreDuplicates: false 
    });
  
  if (error) {
    console.error('Insert error:', error);
    return { success: 0, failed: translations.length, error };
  }
  
  return { success: translations.length, failed: 0 };
}

// Process articles in concurrent batches
async function processArticles(articles, lang, langConfig) {
  const CONCURRENT = 5; // Concurrent requests per batch
  const BATCH_DELAY = 500; // 0.5 second between batches
  
  const stats = {
    total: articles.length,
    success: 0,
    failed: 0,
    failedArticles: [],
  };
  
  const startTime = Date.now();
  let processed = 0;
  
  // Process in concurrent batches
  for (let i = 0; i < articles.length; i += CONCURRENT) {
    const batch = articles.slice(i, i + CONCURRENT);
    const batchPromises = batch.map(async (article) => {
      try {
        const translation = await translateArticle(article, lang, langConfig);
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
      } else {
        stats.failed++;
        stats.failedArticles.push({
          id: result.article.id,
          title: result.article.title,
          error: result.error,
        });
        console.log(`  ✗ Failed: "${result.article.title.substring(0, 40)}..." - ${result.error}`);
      }
    }
    
    // Insert successful translations
    if (successfulTranslations.length > 0) {
      const insertResult = await insertTranslations(successfulTranslations);
      stats.success += insertResult.success;
      if (insertResult.failed > 0) {
        stats.failed += insertResult.failed;
      }
    }
    
    // Progress log every 10 articles or at end
    if (processed % 10 === 0 || processed === articles.length) {
      const elapsed = (Date.now() - startTime) / 1000;
      const rate = processed / elapsed;
      const remaining = articles.length - processed;
      const eta = remaining / rate;
      
      const pct = ((processed / articles.length) * 100).toFixed(1);
      console.log(`Progress: ${processed}/${articles.length} (${pct}%) | ` +
                  `${rate.toFixed(1)} art/sec | ` +
                  `ETA: ${Math.ceil(eta)}s | ` +
                  `✓ ${stats.success} ✗ ${stats.failed}`);
    }
    
    // Delay between batches (unless this is the last batch)
    if (i + CONCURRENT < articles.length) {
      await sleep(BATCH_DELAY);
    }
  }
  
  return stats;
}

// Main
async function main() {
  const args = parseArgs();
  
  if (!args.lang) {
    console.log('Usage: node scripts/translate-articles-gemini.mjs --lang=<code> [--batch=N] [--all]');
    console.log('\nSupported languages:');
    for (const [code, config] of Object.entries(LANGUAGES)) {
      console.log(`  ${code}: ${config.name} (${config.country})`);
    }
    process.exit(1);
  }
  
  const langConfig = LANGUAGES[args.lang];
  if (!langConfig) {
    console.error(`Unknown language: ${args.lang}`);
    console.log('Supported:', Object.keys(LANGUAGES).join(', '));
    process.exit(1);
  }
  
  const limit = args.all ? null : args.batch;
  
  console.log(`\n🌐 Gemini Flash Article Translator`);
  console.log(`   Target: ${langConfig.name} (${args.lang})`);
  console.log(`   Batch size: ${limit || 'ALL'}`);
  if (args.skip > 0) {
    console.log(`   Skipping first: ${args.skip} articles`);
  }
  console.log('');
  
  // Get untranslated articles
  console.log('Fetching untranslated articles...');
  let articles = await getUntranslatedArticles(args.lang);
  
  if (articles.length === 0) {
    console.log('✓ All articles already translated for this language!');
    return;
  }
  
  // Apply skip
  if (args.skip > 0) {
    articles = articles.slice(args.skip);
  }
  
  // Apply limit
  if (limit) {
    articles = articles.slice(0, limit);
  }
  
  console.log(`Found ${articles.length} articles to translate\n`);
  
  // Process
  const startTime = Date.now();
  const stats = await processArticles(articles, args.lang, langConfig);
  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
  
  // Final report
  console.log('\n' + '═'.repeat(50));
  console.log(`📊 Translation Complete`);
  console.log('═'.repeat(50));
  console.log(`   Language: ${langConfig.name} (${args.lang})`);
  console.log(`   Total processed: ${stats.total}`);
  console.log(`   ✓ Successful: ${stats.success}`);
  console.log(`   ✗ Failed: ${stats.failed}`);
  console.log(`   ⏱ Time: ${totalTime}s`);
  console.log(`   📈 Speed: ${(stats.total / parseFloat(totalTime)).toFixed(1)} articles/sec`);
  
  if (stats.failedArticles.length > 0) {
    console.log('\nFailed articles:');
    for (const fa of stats.failedArticles.slice(0, 10)) {
      console.log(`  - ${fa.id}: ${fa.title.substring(0, 50)}...`);
      console.log(`    Error: ${fa.error}`);
    }
    if (stats.failedArticles.length > 10) {
      console.log(`  ... and ${stats.failedArticles.length - 10} more`);
    }
  }
  
  // Check remaining
  const remaining = await getUntranslatedArticles(args.lang, 1);
  if (remaining.length > 0) {
    const { count } = await supabase
      .from('kb_articles')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'published');
    
    const { count: translatedCount } = await supabase
      .from('article_translations')
      .select('id', { count: 'exact', head: true })
      .eq('language', args.lang);
    
    console.log(`\n📝 Remaining: ${(count || 0) - (translatedCount || 0)} articles still need translation`);
  } else {
    console.log('\n🎉 All articles translated!');
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
