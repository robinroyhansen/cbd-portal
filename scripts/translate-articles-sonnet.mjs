#!/usr/bin/env node
/**
 * Bulk Article Translation Script using Claude Sonnet API
 * 
 * Usage:
 *   node scripts/translate-articles-sonnet.mjs --lang=fi
 *   node scripts/translate-articles-sonnet.mjs --lang=fi --batch=50
 *   node scripts/translate-articles-sonnet.mjs --lang=fi --all
 *   node scripts/translate-articles-sonnet.mjs --lang=fi --all --retranslate  (redo Gemini ones)
 *   node scripts/translate-articles-sonnet.mjs --lang=fi --all --account=formulaswiss
 * 
 * Accounts: formulaswiss (default), willer-hansen, roy
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
    for (const line of envContent.split('\n')) {
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

// Anthropic API keys by account
const ACCOUNTS = {
  formulaswiss: process.env.ANTHROPIC_TOKEN_FORMULASWISS,
  'willer-hansen': process.env.ANTHROPIC_TOKEN_WILLER_HANSEN,
  roy: process.env.ANTHROPIC_TOKEN_ROY,
};

const ANTHROPIC_MODEL = 'claude-sonnet-4-20250514';
const ANTHROPIC_ENDPOINT = 'https://api.anthropic.com/v1/messages';

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

function parseArgs() {
  const args = { lang: null, batch: 50, all: false, skip: 0, retranslate: false, account: 'formulaswiss' };
  for (const arg of process.argv.slice(2)) {
    if (arg.startsWith('--lang=')) args.lang = arg.split('=')[1];
    else if (arg.startsWith('--batch=')) args.batch = parseInt(arg.split('=')[1], 10);
    else if (arg.startsWith('--skip=')) args.skip = parseInt(arg.split('=')[1], 10);
    else if (arg.startsWith('--account=')) args.account = arg.split('=')[1];
    else if (arg === '--all') args.all = true;
    else if (arg === '--retranslate') args.retranslate = true;
  }
  return args;
}

// Get untranslated articles (or all articles if retranslate=true)
async function getArticlesToTranslate(lang, retranslate = false) {
  if (retranslate) {
    // Get ALL published articles — we'll re-translate everything
    const { data: articles, error } = await supabase
      .from('kb_articles')
      .select('id, title, slug, content, excerpt, meta_title, meta_description')
      .eq('status', 'published')
      .order('created_at', { ascending: true });
    
    if (error) { console.error('Error fetching articles:', error); return []; }
    return articles || [];
  }
  
  // Normal mode: only untranslated
  const { data: existingTranslations, error: transErr } = await supabase
    .from('article_translations')
    .select('article_id')
    .eq('language', lang);
  
  if (transErr) { console.error('Error fetching existing translations:', transErr); return []; }
  
  const translatedIds = new Set(existingTranslations?.map(t => t.article_id) || []);
  
  const { data: articles, error: articlesErr } = await supabase
    .from('kb_articles')
    .select('id, title, slug, content, excerpt, meta_title, meta_description')
    .eq('status', 'published')
    .order('created_at', { ascending: true });
  
  if (articlesErr) { console.error('Error fetching articles:', articlesErr); return []; }
  
  return (articles || []).filter(a => !translatedIds.has(a.id));
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

Translate the above article to ${langConfig.name}. Return ONLY the JSON object, no other text.`;
}

// Call Anthropic Messages API with retries and rate limit handling
async function callSonnet(apiKey, prompt, retries = 5) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(ANTHROPIC_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: ANTHROPIC_MODEL,
          max_tokens: 8192,
          temperature: 0.1,
          messages: [{
            role: 'user',
            content: prompt
          }]
        }),
      });

      if (response.status === 429) {
        // Rate limited — extract retry-after or use exponential backoff
        const retryAfter = response.headers.get('retry-after');
        const delay = retryAfter ? parseInt(retryAfter, 10) * 1000 : Math.min(Math.pow(2, attempt) * 5000, 120000);
        console.log(`  ⏳ Rate limited. Waiting ${(delay/1000).toFixed(0)}s (attempt ${attempt}/${retries})...`);
        await sleep(delay);
        continue;
      }

      if (response.status === 529) {
        // Overloaded
        const delay = Math.min(Math.pow(2, attempt) * 10000, 180000);
        console.log(`  ⏳ API overloaded. Waiting ${(delay/1000).toFixed(0)}s (attempt ${attempt}/${retries})...`);
        await sleep(delay);
        continue;
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Anthropic API error ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      
      if (!data.content?.[0]?.text) {
        throw new Error('No content in Anthropic response');
      }

      const rawText = data.content[0].text;
      return parseJsonResponse(rawText);
      
    } catch (error) {
      if (attempt === retries) throw error;
      if (error.message.includes('Rate') || error.message.includes('429') || error.message.includes('529')) {
        const delay = Math.min(Math.pow(2, attempt) * 5000, 120000);
        console.log(`  ⏳ Retrying after error: ${error.message.substring(0, 80)}. Wait ${(delay/1000).toFixed(0)}s...`);
        await sleep(delay);
      } else {
        const delay = Math.pow(2, attempt - 1) * 2000;
        console.log(`  Retry ${attempt}/${retries} after ${delay}ms: ${error.message.substring(0, 60)}`);
        await sleep(delay);
      }
    }
  }
}

// Parse JSON from response (handles markdown fences, etc.)
function parseJsonResponse(text) {
  let cleaned = text.trim();
  
  // Try direct parse
  try { return JSON.parse(cleaned); } catch {}
  
  // Try extracting from markdown code block
  const jsonMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    try { return JSON.parse(fixJsonNewlines(jsonMatch[1].trim())); } catch {}
  }
  
  // Fix newlines and try again
  try { return JSON.parse(fixJsonNewlines(cleaned)); } catch {}
  
  // Find JSON object by bracket matching
  const startIdx = cleaned.indexOf('{');
  if (startIdx !== -1) {
    let depth = 0, endIdx = -1, inString = false, escaped = false;
    for (let i = startIdx; i < cleaned.length; i++) {
      const ch = cleaned[i];
      if (escaped) { escaped = false; continue; }
      if (ch === '\\') { escaped = true; continue; }
      if (ch === '"') { inString = !inString; continue; }
      if (!inString) {
        if (ch === '{') depth++;
        else if (ch === '}') { depth--; if (depth === 0) { endIdx = i; break; } }
      }
    }
    if (endIdx !== -1) {
      try { return JSON.parse(fixJsonNewlines(cleaned.substring(startIdx, endIdx + 1))); } catch {}
    }
  }
  
  throw new Error('Failed to parse JSON from response');
}

function fixJsonNewlines(jsonStr) {
  let result = '', inString = false, escaped = false;
  for (let i = 0; i < jsonStr.length; i++) {
    const ch = jsonStr[i];
    if (escaped) { result += ch; escaped = false; continue; }
    if (ch === '\\') { result += ch; escaped = true; continue; }
    if (ch === '"') { inString = !inString; result += ch; continue; }
    if (inString) {
      if (ch === '\n') result += '\\n';
      else if (ch === '\r') result += '\\r';
      else if (ch === '\t') result += '\\t';
      else if (ch.charCodeAt(0) < 32) result += '\\u' + ch.charCodeAt(0).toString(16).padStart(4, '0');
      else result += ch;
    } else result += ch;
  }
  return result;
}

function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

// Translate a single article
async function translateArticle(apiKey, article, lang, langConfig) {
  const prompt = buildPrompt(article, langConfig, lang);
  const translated = await callSonnet(apiKey, prompt);
  
  if (!translated || typeof translated !== 'object') throw new Error('Invalid translation response');
  if (!translated.title) throw new Error('Missing title');
  if (!translated.content) throw new Error(`Missing content for: ${translated.title?.substring(0, 30)}`);
  
  // Auto-generate slug if missing
  if (!translated.slug) {
    translated.slug = translated.title
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 80);
  }
  
  // Truncate meta fields
  if (translated.meta_title && translated.meta_title.length > 60)
    translated.meta_title = translated.meta_title.substring(0, 57) + '...';
  if (translated.meta_description && translated.meta_description.length > 155)
    translated.meta_description = translated.meta_description.substring(0, 152) + '...';
  
  return {
    article_id: article.id,
    language: lang,
    slug: translated.slug,
    title: translated.title,
    content: translated.content,
    excerpt: translated.excerpt || null,
    meta_title: translated.meta_title || null,
    meta_description: translated.meta_description || null,
    translation_quality: 'ai-sonnet',
    translated_at: new Date().toISOString(),
  };
}

// Insert/upsert translations
async function insertTranslations(translations) {
  if (translations.length === 0) return { success: 0, failed: 0 };
  
  const { error } = await supabase
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

// Process articles — sequential with small concurrency to respect rate limits
async function processArticles(apiKey, articles, lang, langConfig) {
  const CONCURRENT = 3; // Lower concurrency for Anthropic API
  const BATCH_DELAY = 2000; // 2s between batches to avoid rate limits
  
  const stats = { total: articles.length, success: 0, failed: 0, failedArticles: [] };
  const startTime = Date.now();
  let processed = 0;
  
  for (let i = 0; i < articles.length; i += CONCURRENT) {
    const batch = articles.slice(i, i + CONCURRENT);
    const results = await Promise.all(batch.map(async (article) => {
      try {
        const translation = await translateArticle(apiKey, article, lang, langConfig);
        return { success: true, translation, article };
      } catch (error) {
        return { success: false, error: error.message, article };
      }
    }));
    
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
    
    if (successfulTranslations.length > 0) {
      const insertResult = await insertTranslations(successfulTranslations);
      stats.success += insertResult.success;
      if (insertResult.failed > 0) stats.failed += insertResult.failed;
    }
    
    // Progress log
    if (processed % 9 === 0 || processed === articles.length) {
      const elapsed = (Date.now() - startTime) / 1000;
      const rate = processed / elapsed;
      const eta = (articles.length - processed) / rate;
      console.log(`Progress: ${processed}/${articles.length} (${((processed/articles.length)*100).toFixed(1)}%) | ${rate.toFixed(2)} art/sec | ETA: ${Math.ceil(eta)}s | ✓ ${stats.success} ✗ ${stats.failed}`);
    }
    
    // Delay between batches
    if (i + CONCURRENT < articles.length) await sleep(BATCH_DELAY);
  }
  
  return stats;
}

// Main
async function main() {
  const args = parseArgs();
  
  if (!args.lang) {
    console.log('Usage: node scripts/translate-articles-sonnet.mjs --lang=<code> [--batch=N] [--all] [--retranslate] [--account=name]');
    console.log('\nAccounts: formulaswiss (default), willer-hansen, roy');
    console.log('\nSupported languages:');
    for (const [code, config] of Object.entries(LANGUAGES))
      console.log(`  ${code}: ${config.name} (${config.country})`);
    process.exit(1);
  }
  
  const langConfig = LANGUAGES[args.lang];
  if (!langConfig) {
    console.error(`Unknown language: ${args.lang}`);
    process.exit(1);
  }
  
  const apiKey = ACCOUNTS[args.account];
  if (!apiKey) {
    console.error(`Unknown account: ${args.account}. Available: ${Object.keys(ACCOUNTS).join(', ')}`);
    process.exit(1);
  }
  
  const limit = args.all ? null : args.batch;
  
  console.log(`\n🧠 Sonnet Article Translator (${ANTHROPIC_MODEL})`);
  console.log(`   Account: ${args.account}`);
  console.log(`   Target: ${langConfig.name} (${args.lang})`);
  console.log(`   Mode: ${args.retranslate ? 'RE-TRANSLATE ALL' : 'untranslated only'}`);
  console.log(`   Batch size: ${limit || 'ALL'}`);
  console.log('');
  
  console.log('Fetching articles...');
  let articles = await getArticlesToTranslate(args.lang, args.retranslate);
  
  if (articles.length === 0) {
    console.log('✓ All articles already translated!');
    return;
  }
  
  if (args.skip > 0) articles = articles.slice(args.skip);
  if (limit) articles = articles.slice(0, limit);
  
  console.log(`Found ${articles.length} articles to translate\n`);
  
  const startTime = Date.now();
  const stats = await processArticles(apiKey, articles, args.lang, langConfig);
  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
  
  console.log('\n' + '═'.repeat(50));
  console.log(`📊 Translation Complete`);
  console.log('═'.repeat(50));
  console.log(`   Language: ${langConfig.name} (${args.lang})`);
  console.log(`   Model: ${ANTHROPIC_MODEL}`);
  console.log(`   Account: ${args.account}`);
  console.log(`   Total processed: ${stats.total}`);
  console.log(`   ✓ Successful: ${stats.success}`);
  console.log(`   ✗ Failed: ${stats.failed}`);
  console.log(`   ⏱ Time: ${totalTime}s`);
  console.log(`   📈 Speed: ${(stats.total / parseFloat(totalTime)).toFixed(2)} articles/sec`);
  
  if (stats.failedArticles.length > 0) {
    console.log('\nFailed articles:');
    for (const fa of stats.failedArticles.slice(0, 10)) {
      console.log(`  - ${fa.id}: ${fa.title.substring(0, 50)}...`);
      console.log(`    Error: ${fa.error}`);
    }
  }
  
  // Check remaining
  const { count: totalArticles } = await supabase
    .from('kb_articles')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'published');
  
  const { count: translatedCount } = await supabase
    .from('article_translations')
    .select('id', { count: 'exact', head: true })
    .eq('language', args.lang);
  
  const remaining = (totalArticles || 0) - (translatedCount || 0);
  if (remaining > 0) {
    console.log(`\n📝 Remaining: ${remaining} articles still need translation`);
  } else {
    console.log('\n🎉 All articles translated!');
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
