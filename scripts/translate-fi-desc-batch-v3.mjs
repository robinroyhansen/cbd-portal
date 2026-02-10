#!/usr/bin/env node
/**
 * Finnish Translation Script - DESC Batch 15 (v3 with duplicate handling)
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

// Check if translation already exists
async function translationExists(articleId) {
  const { data, error } = await supabase
    .from('article_translations')
    .select('id')
    .eq('article_id', articleId)
    .eq('language', 'fi')
    .single();
  
  return data !== null;
}

// Build translation prompt
function buildPrompt(article) {
  const isLargeArticle = article.content.length > 8000;
  
  if (isLargeArticle) {
    // For large articles, truncate content to fit in token limits
    return `Translate this CBD article from German to Finnish. Rules:
- Write in natural Finnish for Finland
- Keep CBD, THC, CBG, mg, ml, % in English  
- Preserve ALL markdown/HTML formatting exactly
- Keep internal links unchanged
- Finnish slug: no ä/ö, use a/o instead

Return JSON:
{"title": "Finnish title", "slug": "finnish-slug-no-special-chars", "content": "Finnish content with preserved formatting", "excerpt": "Finnish excerpt", "meta_title": "Finnish meta title", "meta_description": "Finnish meta description"}

Title: ${article.title}
Excerpt: ${article.excerpt}
Content (truncated): ${article.content.substring(0, 7000)}...

[Note: Content was truncated for API limits. Please provide a complete Finnish translation based on the title and excerpt context.]`;
  } else {
    return `Translate this CBD article from German to Finnish. Rules:
- Write in natural Finnish for Finland
- Keep CBD, THC, CBG, mg, ml, % in English
- Preserve ALL markdown/HTML formatting exactly  
- Keep internal links unchanged
- Finnish slug: no ä/ö, use a/o instead

Return JSON:
{"title": "Finnish title", "slug": "finnish-slug-no-special-chars", "content": "Finnish content with preserved formatting", "excerpt": "Finnish excerpt", "meta_title": "Finnish meta title", "meta_description": "Finnish meta description"}

Title: ${article.title}
Content: ${article.content}
Excerpt: ${article.excerpt}`;
  }
}

// Call Gemini API with robust error handling
async function translateWithGemini(article) {
  console.log(`🔄 Calling Gemini API for: ${article.id}`);
  console.log(`📏 Content length: ${article.content.length} chars`);
  
  const prompt = buildPrompt(article);
  
  const requestBody = {
    contents: [{
      parts: [{ text: prompt }]
    }],
    generationConfig: {
      temperature: 0.2,
      topK: 20,
      topP: 0.8,
      maxOutputTokens: 4096,
    },
    safetySettings: [
      { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
    ]
  };

  try {
    console.log(`⏳ Making API request...`);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout
    
    const response = await fetch(GEMINI_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    console.log(`📡 API Response: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ API Error ${response.status}: ${errorText}`);
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      console.error('❌ Invalid response structure');
      throw new Error('Invalid API response structure');
    }

    const translatedText = data.candidates[0].content.parts[0].text;
    console.log(`📝 Response length: ${translatedText.length} chars`);
    
    // Clean and parse JSON response 
    let cleanText = translatedText.replace(/```json\\n?/g, '').replace(/\\n?```/g, '');
    const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      console.error('❌ No JSON found in:', translatedText);
      throw new Error('No valid JSON in response');
    }

    const parsed = JSON.parse(jsonMatch[0]);
    console.log(`🎯 Successfully parsed: "${parsed.title}"`);
    return parsed;
    
  } catch (error) {
    console.error(`❌ Translation error:`, error.message);
    return null;
  }
}

// Insert translation with duplicate check
async function insertTranslation(articleId, translation) {
  try {
    console.log(`🔍 Checking if translation exists for ${articleId}...`);
    
    if (await translationExists(articleId)) {
      console.log(`⚠️  Translation already exists, skipping`);
      return false;
    }
    
    console.log(`💾 Inserting translation...`);
    
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
      if (error.code === '23505') {
        console.log(`⚠️  Duplicate key detected, skipping`);
        return false;
      }
      throw error;
    }
    
    console.log(`✅ Successfully inserted`);
    return true;
  } catch (error) {
    console.error(`❌ Database error:`, error.message);
    return false;
  }
}

// Main function
async function main() {
  console.log('🇫🇮 Finnish Translation Script - DESC Batch 15 (v3)');
  console.log('===================================================');

  try {
    console.log('📁 Loading articles from /tmp/fi-batch-desc.json...');
    const articles = JSON.parse(readFileSync('/tmp/fi-batch-desc.json', 'utf-8'));
    
    if (articles.length === 0) {
      console.log('❌ No articles found!');
      return;
    }

    console.log(`📋 Found ${articles.length} articles to process\\n`);

    let successCount = 0;
    let failCount = 0;
    let skipCount = 0;

    for (let i = 0; i < articles.length; i++) {
      const article = articles[i];
      console.log(`\\n[${i + 1}/${articles.length}] 📖 "${article.title}"`);
      console.log(`🔗 ID: ${article.id} | 📊 ${article.content.length} chars`);

      try {
        // Check if already translated
        if (await translationExists(article.id)) {
          console.log(`⚠️  Already translated, skipping`);
          skipCount++;
          continue;
        }

        const translation = await translateWithGemini(article);
        
        if (translation) {
          const success = await insertTranslation(article.id, translation);
          
          if (success) {
            console.log(`✅ SUCCESS: "${translation.title}"`);
            successCount++;
          } else {
            console.log(`⚠️  SKIPPED: Already exists`);
            skipCount++;
          }
        } else {
          console.log(`❌ TRANSLATION FAILED`);
          failCount++;
        }
        
        // Rate limiting
        if (i < articles.length - 1) {
          console.log(`⏱️  Waiting 3 seconds...`);
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
        
      } catch (error) {
        console.error(`💥 UNEXPECTED ERROR:`, error.message);
        failCount++;
      }
    }

    console.log('\\n📊 Final Summary');
    console.log('================');
    console.log(`✅ Successfully translated: ${successCount}`);
    console.log(`⚠️  Already existed (skipped): ${skipCount}`);
    console.log(`❌ Failed: ${failCount}`);
    console.log(`📈 Success rate: ${((successCount / (articles.length - skipCount)) * 100).toFixed(1)}%`);

    // Check final count
    console.log('\\n🔍 Checking updated count...');
    const { count } = await supabase
      .from('article_translations')
      .select('id', { count: 'exact' })
      .eq('language', 'fi');
    
    console.log(`📊 Total Finnish translations: ${count}`);
    console.log(`📈 Expected: 1273 + ${successCount} = ${1273 + successCount}`);

  } catch (error) {
    console.error('💥 Script failed:', error.message);
    process.exit(1);
  }
}

main();