#!/usr/bin/env node
/**
 * Finnish Translation Script - DESC Batch 15 (v2 with better error handling)
 * Uses Gemini 2.0 Flash API for translations
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
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

// Build translation prompt (shorter for large articles)
function buildPrompt(article) {
  const isLargeArticle = article.content.length > 8000;
  
  if (isLargeArticle) {
    // For large articles, split into smaller parts or provide a more focused prompt
    return `Translate this CBD article from German to Finnish. Follow these rules:

- Write in natural Finnish for Finland
- Keep CBD, THC, CBG, mg, ml, % in English
- Preserve ALL markdown/HTML formatting exactly
- Keep internal links unchanged (/conditions/anxiety)
- Finnish slug: no ä/ö, use a/o instead

Return JSON:
{
  "title": "Finnish title",
  "slug": "finnish-slug-no-special-chars", 
  "content": "Finnish content with preserved formatting",
  "excerpt": "Finnish excerpt",
  "meta_title": "Finnish meta title",
  "meta_description": "Finnish meta description"
}

Title: ${article.title}
Excerpt: ${article.excerpt}
Content (first 6000 chars): ${article.content.substring(0, 6000)}...`;
  } else {
    return `Translate this CBD article from German to Finnish. Follow these rules:

- Write in natural Finnish for Finland  
- Keep CBD, THC, CBG, mg, ml, % in English
- Preserve ALL markdown/HTML formatting exactly
- Keep internal links unchanged
- Finnish slug: no ä/ö, use a/o instead

Return JSON:
{
  "title": "Finnish title",
  "slug": "finnish-slug-no-special-chars",
  "content": "Finnish content with preserved formatting", 
  "excerpt": "Finnish excerpt",
  "meta_title": "Finnish meta title",
  "meta_description": "Finnish meta description"
}

Title: ${article.title}
Content: ${article.content}
Excerpt: ${article.excerpt}`;
  }
}

// Call Gemini API with timeout
async function translateWithGemini(article) {
  console.log(`🔄 Calling Gemini API for article: ${article.id}`);
  console.log(`📏 Content length: ${article.content.length} characters`);
  
  const prompt = buildPrompt(article);
  
  const requestBody = {
    contents: [{
      parts: [{
        text: prompt
      }]
    }],
    generationConfig: {
      temperature: 0.2,
      topK: 20,
      topP: 0.8,
      maxOutputTokens: 4096, // Reduced for better reliability
    },
    safetySettings: [
      {
        category: "HARM_CATEGORY_HARASSMENT",
        threshold: "BLOCK_NONE"
      },
      {
        category: "HARM_CATEGORY_HATE_SPEECH", 
        threshold: "BLOCK_NONE"
      },
      {
        category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
        threshold: "BLOCK_NONE"
      },
      {
        category: "HARM_CATEGORY_DANGEROUS_CONTENT",
        threshold: "BLOCK_NONE"
      }
    ]
  };

  try {
    console.log(`⏳ Making API request...`);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout
    
    const response = await fetch(GEMINI_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    console.log(`📡 API Response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ API Error: ${response.status} ${response.statusText}`);
      console.error(`Error details: ${errorText}`);
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`✅ Got API response`);
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      console.error('❌ Invalid API response structure:', JSON.stringify(data, null, 2));
      throw new Error('Invalid API response structure');
    }

    const translatedText = data.candidates[0].content.parts[0].text;
    console.log(`📝 Translation text length: ${translatedText.length}`);
    
    // Parse JSON response
    const jsonMatch = translatedText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('❌ No JSON found in response:', translatedText);
      throw new Error('No valid JSON found in response');
    }

    const parsed = JSON.parse(jsonMatch[0]);
    console.log(`🎯 Parsed translation for: "${parsed.title}"`);
    return parsed;
    
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error(`⏰ Translation timed out for article ${article.id}`);
    } else {
      console.error(`❌ Translation failed for article ${article.id}:`, error.message);
    }
    return null;
  }
}

// Insert translation into Supabase
async function insertTranslation(articleId, translation) {
  try {
    console.log(`💾 Inserting translation for ${articleId} into database...`);
    
    const { data, error } = await supabase
      .from('article_translations')
      .insert({
        article_id: articleId,
        language: 'fi',
        title: translation.title,
        slug: translation.slug,
        content: translation.content,
        excerpt: translation.excerpt,
        meta_title: translation.meta_title,
        meta_description: translation.meta_description
      });

    if (error) {
      console.error(`❌ Database error:`, error);
      throw error;
    }
    
    console.log(`✅ Successfully inserted into database`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to insert translation for ${articleId}:`, error.message);
    return false;
  }
}

// Main function
async function main() {
  console.log('🇫🇮 Finnish Translation Script - DESC Batch 15 (v2)');
  console.log('===================================================');

  try {
    console.log('📁 Loading articles from /tmp/fi-batch-desc.json...');
    const articles = JSON.parse(readFileSync('/tmp/fi-batch-desc.json', 'utf-8'));
    
    if (articles.length === 0) {
      console.log('❌ No articles found in the batch file!');
      return;
    }

    console.log(`📋 Found ${articles.length} articles to translate\n`);

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < articles.length; i++) {
      const article = articles[i];
      console.log(`\n[${i + 1}/${articles.length}] 📖 Processing: "${article.title}"`);
      console.log(`🔗 Article ID: ${article.id}`);
      console.log(`📊 Content length: ${article.content.length} chars`);

      try {
        const translation = await translateWithGemini(article);
        
        if (translation) {
          const success = await insertTranslation(article.id, translation);
          
          if (success) {
            console.log(`✅ SUCCESS: "${translation.title}"`);
            successCount++;
          } else {
            console.log(`❌ FAILED TO SAVE: "${article.title}"`);
            failCount++;
          }
        } else {
          console.log(`❌ TRANSLATION FAILED: "${article.title}"`);
          failCount++;
        }
        
        // Rate limiting
        if (i < articles.length - 1) {
          console.log(`⏱️  Waiting 3 seconds before next article...`);
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
        
      } catch (error) {
        console.error(`💥 UNEXPECTED ERROR for "${article.title}":`, error.message);
        failCount++;
      }
    }

    console.log('\n📊 Translation Summary');
    console.log('=====================');
    console.log(`✅ Successfully translated: ${successCount}`);
    console.log(`❌ Failed: ${failCount}`);
    console.log(`📈 Success rate: ${((successCount / articles.length) * 100).toFixed(1)}%`);

    // Check final count
    console.log('\n🔍 Checking updated Finnish translation count...');
    const { count } = await supabase
      .from('article_translations')
      .select('id', { count: 'exact' })
      .eq('language', 'fi');
    
    console.log(`📊 Total Finnish translations after batch: ${count || 'unknown'}`);
    console.log(`📈 Expected increase: 1273 → ~${1273 + successCount}`);

  } catch (error) {
    console.error('💥 Script failed:', error.message);
    process.exit(1);
  }
}

main();