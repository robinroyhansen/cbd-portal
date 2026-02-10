#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import { config } from 'dotenv';
import fs from 'fs';

// Load environment variables from .env.local for Supabase
config({ path: '.env.local' });

const SUPABASE_URL = 'https://bvrdryvgqarffgdujmjz.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
// Use system-wide OpenAI API key
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!SUPABASE_SERVICE_KEY) {
  console.error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
  process.exit(1);
}

if (!OPENAI_API_KEY) {
  console.error('Missing OPENAI_API_KEY environment variable');
  process.exit(1);
}

// Initialize clients
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

function createUrlSafeSlug(text) {
  return text
    .toLowerCase()
    .replace(/ä/g, 'a')
    .replace(/ö/g, 'o')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

async function translateText(text, fieldName) {
  if (!text) return text;
  
  const prompt = `Translate the following ${fieldName} from English to Finnish. Follow these rules:

1. Use natural Finnish language (no machine-translated feel)
2. Preserve ALL markdown formatting, HTML tags, and links exactly as they are
3. Keep CBD, THC, mg, ml, % and other technical terms unchanged
4. Keep all internal links like [word](/path) unchanged - only translate the display text inside []
5. DO NOT truncate or summarize - translate everything completely
6. Keep the original structure and formatting intact
7. Medical and health accuracy is crucial for CBD terminology
8. URL slugs should be Finnish words, lowercase, hyphenated

${fieldName}:
${text}

Finnish translation:`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{
        role: 'user',
        content: prompt
      }],
      max_tokens: 4000,
      temperature: 0.3
    });

    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error(`Error translating ${fieldName}:`, error);
    throw error;
  }
}

async function translateArticle(article, index, total) {
  console.log(`\n[${index + 1}/${total}] Translating: ${article.title}`);
  console.log(`Article ID: ${article.id}`);
  
  try {
    // Translate all fields
    console.log('  → Translating title...');
    const title = await translateText(article.title, 'title');
    
    console.log('  → Translating content...');
    const content = await translateText(article.content, 'content');
    
    console.log('  → Translating excerpt...');
    const excerpt = await translateText(article.excerpt, 'excerpt');
    
    console.log('  → Translating meta_title...');
    const meta_title = await translateText(article.meta_title, 'meta_title');
    
    console.log('  → Translating meta_description...');
    const meta_description = await translateText(article.meta_description, 'meta_description');

    // Create Finnish URL slug
    const translatedSlug = createUrlSafeSlug(title);

    const translation = {
      article_id: article.id,
      language: 'fi',
      slug: translatedSlug,
      title,
      content,
      excerpt,
      meta_title,
      meta_description,
      translation_quality: 'ai'
    };

    console.log(`  ✓ Translation completed for: ${title}`);
    return translation;
    
  } catch (error) {
    console.error(`  ✗ Failed to translate article ${article.id}:`, error);
    return null;
  }
}

async function main() {
  console.log('🇫🇮 Starting Finnish translation of 15 CBD Portal articles using OpenAI GPT-4...\n');

  // Load articles from the JSON file created by fetch-untranslated.mjs
  const articlesJson = fs.readFileSync('/tmp/fi_batch_asc.json', 'utf8');
  const articles = JSON.parse(articlesJson);

  console.log(`Found ${articles.length} articles to translate\n`);

  if (articles.length === 0) {
    console.log('No articles to translate!');
    return;
  }

  const translations = [];
  let processed = 0;
  let successful = 0;

  // Process articles one by one to avoid rate limits
  for (let i = 0; i < articles.length; i++) {
    const article = articles[i];
    const translation = await translateArticle(article, i, articles.length);
    
    if (translation) {
      translations.push(translation);
      successful++;
    }
    
    processed++;
    console.log(`\nProgress: ${processed}/${articles.length} articles processed (${successful} successful)\n`);
    
    // Add a small delay between translations to respect rate limits
    if (i < articles.length - 1) {
      console.log('  ⏳ Waiting 3 seconds before next translation...');
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }

  // Insert all translations into the database
  if (translations.length > 0) {
    console.log(`\n📥 Inserting ${translations.length} translations into database...`);
    
    const { data: insertedData, error: insertError } = await supabase
      .from('article_translations')
      .insert(translations)
      .select('article_id');

    if (insertError) {
      console.error('Error inserting translations:', insertError);
      return;
    }

    console.log(`✅ Successfully inserted ${insertedData.length} Finnish translations!`);
  } else {
    console.log('❌ No translations were created due to errors');
  }

  console.log(`\n📊 Final Summary:`);
  console.log(`- Articles to translate: ${articles.length}`);
  console.log(`- Successfully translated: ${translations.length}`);
  console.log(`- Failed translations: ${articles.length - translations.length}`);
  console.log(`- Language: Finnish (fi)`);
  console.log(`- Translation quality: AI`);
  console.log(`\n🎉 Finnish translation batch completed!`);
}

main().catch(console.error);