#!/usr/bin/env node
/**
 * Finnish Translation Script - ASC Batch 15
 * Uses Gemini 2.0 Flash API for translations
 * Reads from pre-fetched batch file in ascending order
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

// Load batch from file
function loadBatch() {
  try {
    const content = readFileSync('/tmp/fi-batch-asc.json', 'utf-8');
    return JSON.parse(content);
  } catch (err) {
    console.error('Failed to load batch file:', err.message);
    process.exit(1);
  }
}

// Build translation prompt
function buildPrompt(article) {
  return `You are a professional translator. Translate this CBD health article from English to Finnish.

CRITICAL: All output text MUST be in Finnish language, NOT English!

Translation rules:
- Write in natural Finnish appropriate for Finland
- Preserve ALL markdown formatting, HTML tags, and internal links exactly
- Keep these terms in English: CBD, THC, CBG, CBN, CBDA, mg, ml, %
- Keep ALL internal link paths unchanged (e.g., /conditions/anxiety stays as /conditions/anxiety)
- Use standard medical terminology in Finnish
- Create a URL-safe slug in Finnish (lowercase, hyphens, no ä/ö - use a/o instead)

Return a JSON object with these fields (all values in Finnish):
{
  "title": "translated title in Finnish",
  "slug": "url-safe-finnish-slug-no-special-chars",
  "content": "full translated content in Finnish with preserved formatting",
  "excerpt": "translated excerpt in Finnish",
  "meta_title": "translated meta title in Finnish",
  "meta_description": "translated meta description in Finnish"
}

ARTICLE TO TRANSLATE:

Title: ${article.title}
Slug: ${article.slug}
Content: ${article.content}
Excerpt: ${article.excerpt}
Meta Title: ${article.meta_title || article.title}
Meta Description: ${article.meta_description || article.excerpt}`;
}

// Call Gemini API with timeout and retry
async function translateWithGemini(article) {
  const prompt = buildPrompt(article);
  
  const requestBody = {
    contents: [{
      parts: [{
        text: prompt
      }]
    }],
    generationConfig: {
      temperature: 0.3,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 8192,
      responseMimeType: "application/json",
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

  const maxRetries = 3;
  const timeoutMs = 120000; // 120 second timeout
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`   🤖 Gemini API call (attempt ${attempt}/${maxRetries})...`);
      
      // Create timeout controller
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
      
      const response = await fetch(GEMINI_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        throw new Error(`Invalid API response structure: ${JSON.stringify(data)}`);
      }

      const translatedText = data.candidates[0].content.parts[0].text;
      console.log(`   📝 Response length: ${translatedText.length} characters`);
      
      // With responseMimeType: "application/json", Gemini returns valid JSON directly
      const result = JSON.parse(translatedText);
      
      // Validate required fields
      if (!result.title || !result.slug || !result.content) {
        throw new Error(`Missing required fields in translation: ${Object.keys(result)}`);
      }
      
      return result;
      
    } catch (error) {
      console.error(`   ❌ Attempt ${attempt} failed:`, error.message);
      
      if (attempt < maxRetries) {
        console.log(`   ⏳ Waiting 5 seconds before retry...`);
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
  }
  
  console.error(`❌ All ${maxRetries} attempts failed for article ${article.id}`);
  return null;
}

// Insert translation into Supabase
async function insertTranslation(articleId, translation) {
  try {
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

    if (error) throw error;
    return true;
  } catch (error) {
    console.error(`Failed to insert translation for ${articleId}:`, error.message);
    return false;
  }
}

// Main function
async function main() {
  console.log('🇫🇮 Finnish Translation Script - ASC Batch 15');
  console.log('================================================');

  try {
    console.log('Loading batch from /tmp/fi-batch-asc.json...');
    const articles = loadBatch();
    
    if (articles.length === 0) {
      console.log('No articles found in batch file!');
      return;
    }

    console.log(`Found ${articles.length} articles to translate\n`);

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < articles.length; i++) {
      const article = articles[i];
      console.log(`[${i + 1}/${articles.length}] Translating: "${article.title}"`);

      try {
        const translation = await translateWithGemini(article);
        
        if (translation) {
          const success = await insertTranslation(article.id, translation);
          
          if (success) {
            console.log(`✅ Success: "${translation.title}"`);
            successCount++;
          } else {
            console.log(`❌ Failed to save: "${article.title}"`);
            failCount++;
          }
        } else {
          console.log(`❌ Translation failed: "${article.title}"`);
          failCount++;
        }
        
        // Rate limiting: wait 2 seconds between requests
        if (i < articles.length - 1) {
          console.log('⏳ Waiting 2 seconds to avoid rate limits...');
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
      } catch (error) {
        console.error(`❌ Error processing "${article.title}":`, error.message);
        failCount++;
        
        // Continue with next article even if this one fails
        if (i < articles.length - 1) {
          console.log('⏳ Waiting 2 seconds before next attempt...');
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
    }

    console.log('\n📊 Translation Summary');
    console.log('=====================');
    console.log(`✅ Successfully translated: ${successCount}`);
    console.log(`❌ Failed: ${failCount}`);
    console.log(`📈 Success rate: ${((successCount / articles.length) * 100).toFixed(1)}%`);

    // Verify final count
    console.log('\n🔍 Verifying database count...');
    const { data } = await supabase
      .from('article_translations')
      .select('*', { count: 'exact' })
      .eq('language', 'fi');
    
    console.log(`📊 Total Finnish translations now: ${data?.length || 0}`);

  } catch (error) {
    console.error('❌ Script failed:', error.message);
    process.exit(1);
  }
}

main();