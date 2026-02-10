#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import { config } from 'dotenv';

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
    .replace(/[åä]/g, 'a')
    .replace(/ö/g, 'o')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

async function translateText(text, fieldName) {
  if (!text) return text;
  
  const prompt = `Translate the following ${fieldName} from English to Swedish (Sweden). Follow these rules:

1. Use natural Swedish (Sweden dialect)
2. Preserve ALL markdown formatting, HTML tags, and links exactly as they are
3. Keep CBD, THC, mg, %, and other technical terms unchanged
4. DO NOT truncate or summarize - translate everything completely
5. Keep the original structure and formatting intact

${fieldName}:
${text}

Swedish translation:`;

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

async function translateArticle(article) {
  console.log(`Translating article ${article.id}: ${article.title}`);
  
  try {
    const [title, content, excerpt, meta_title, meta_description] = await Promise.all([
      translateText(article.title, 'title'),
      translateText(article.content, 'content'),
      translateText(article.excerpt, 'excerpt'),
      translateText(article.meta_title, 'meta_title'),
      translateText(article.meta_description, 'meta_description')
    ]);

    const translatedSlug = createUrlSafeSlug(title);

    return {
      article_id: article.id,
      language: 'sv',
      slug: translatedSlug,
      title,
      content,
      excerpt,
      meta_title,
      meta_description,
      translation_quality: 'ai'
    };
  } catch (error) {
    console.error(`Failed to translate article ${article.id}:`, error);
    return null;
  }
}

async function main() {
  console.log('🇸🇪 Starting Swedish translation batch with OpenAI...\n');

  // Get untranslated articles
  console.log('Fetching untranslated articles...');
  
  // First get all Swedish article IDs that are already translated
  const { data: translatedIds, error: translatedError } = await supabase
    .from('article_translations')
    .select('article_id')
    .eq('language', 'sv');

  if (translatedError) {
    console.error('Error fetching translated article IDs:', translatedError);
    return;
  }

  const translatedIdsList = translatedIds.map(t => t.article_id);
  
  // Get all articles that are NOT in the translated list
  let query = supabase
    .from('kb_articles')
    .select('id, slug, title, content, excerpt, meta_title, meta_description')
    .order('id')
    .limit(75);

  if (translatedIdsList.length > 0) {
    query = query.not('id', 'in', `(${translatedIdsList.join(',')})`);
  }

  const { data: articles, error: fetchError } = await query;

  if (fetchError) {
    console.error('Error fetching articles:', fetchError);
    return;
  }

  console.log(`Found ${articles.length} articles to translate\n`);

  if (articles.length === 0) {
    console.log('No articles to translate!');
    return;
  }

  const translations = [];
  let processed = 0;

  // Process articles one by one to avoid rate limits
  for (const article of articles) {
    const translation = await translateArticle(article);
    if (translation) {
      translations.push(translation);
    }
    
    processed++;
    console.log(`Progress: ${processed}/${articles.length} articles processed\n`);
    
    // Add a small delay between translations to respect rate limits
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  // Insert all translations
  if (translations.length > 0) {
    console.log(`\nInserting ${translations.length} translations into database...`);
    
    const { data: insertedData, error: insertError } = await supabase
      .from('article_translations')
      .insert(translations)
      .select('article_id');

    if (insertError) {
      console.error('Error inserting translations:', insertError);
      return;
    }

    console.log(`✅ Successfully inserted ${insertedData.length} Swedish translations!`);
  } else {
    console.log('❌ No translations were created due to errors');
  }

  console.log(`\n📊 Final Summary:`);
  console.log(`- Articles to translate: ${articles.length}`);
  console.log(`- Successfully translated: ${translations.length}`);
  console.log(`- Failed translations: ${articles.length - translations.length}`);
  console.log(`- Language: Swedish (sv)`);
  console.log(`- Translation quality: AI`);
}

main().catch(console.error);