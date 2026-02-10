#!/usr/bin/env node
/**
 * Finnish Translation Script - Corrected Version
 * Uses Gemini 2.0 Flash API for translations with better JSON handling
 * Reads from /tmp/fi-batch-correct.json
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
    const content = readFileSync('/tmp/fi-batch-correct.json', 'utf-8');
    return JSON.parse(content);
  } catch (err) {
    console.error('Failed to load batch file:', err.message);
    process.exit(1);
  }
}

// Escape JSON strings properly
function escapeJsonString(str) {
  if (!str) return '';
  return str
    .replace(/\\/g, '\\\\')    // Backslashes
    .replace(/"/g, '\\"')      // Double quotes
    .replace(/\n/g, '\\n')     // Newlines
    .replace(/\r/g, '\\r')     // Carriage returns
    .replace(/\t/g, '\\t');    // Tabs
}

// Build translation prompt with emphasis on valid JSON
function buildPrompt(article) {
  return `You are a professional translator. Translate this CBD health article from English to Finnish.

CRITICAL INSTRUCTIONS:
1. ALL output text MUST be in Finnish language, NOT English!
2. Your response must be VALID JSON ONLY - no explanations, no markdown blocks, no extra text
3. All strings must be properly escaped for JSON (escape quotes, newlines, etc.)

Translation rules:
- Write in natural Finnish appropriate for Finland
- Preserve ALL markdown formatting, HTML tags, and internal links exactly
- Keep these terms in English: CBD, THC, CBG, CBN, CBDA, mg, ml, %
- Keep ALL internal link paths unchanged (e.g., /conditions/anxiety stays as /conditions/anxiety)
- Use standard medical terminology in Finnish
- Create a URL-safe slug in Finnish (lowercase, hyphens, no ä/ö - use a/o instead)

Return ONLY this JSON structure (no other text):
{
  "title": "translated title in Finnish",
  "slug": "url-safe-finnish-slug-no-special-chars",
  "content": "full translated content in Finnish with preserved formatting",
  "excerpt": "translated excerpt in Finnish",
  "meta_title": "translated meta title in Finnish",
  "meta_description": "translated meta description in Finnish"
}

ARTICLE TO TRANSLATE:

Title: ${escapeJsonString(article.title)}
Slug: ${escapeJsonString(article.slug)}
Content: ${escapeJsonString(article.content)}
Excerpt: ${escapeJsonString(article.excerpt)}
Meta Title: ${escapeJsonString(article.meta_title || article.title)}
Meta Description: ${escapeJsonString(article.meta_description || article.excerpt)}`;
}

// Clean and extract JSON from response
function extractAndCleanJson(text) {
  // Remove any markdown code blocks
  text = text.replace(/```json\s*/g, '').replace(/```\s*/g, '');
  
  // Find the JSON object
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('No JSON object found in response');
  }
  
  let jsonStr = jsonMatch[0];
  
  // Try to fix common JSON issues
  try {
    // First attempt - parse as is
    return JSON.parse(jsonStr);
  } catch (e1) {
    console.log('   🔧 JSON parse failed, attempting to fix...');
    
    // Attempt 2: Fix escaped quotes issues
    try {
      // Fix multiple escaped quotes
      jsonStr = jsonStr.replace(/\\+"/g, '\\"');
      return JSON.parse(jsonStr);
    } catch (e2) {
      // Attempt 3: Fix newlines and tabs
      try {
        jsonStr = jsonStr
          .replace(/([^\\])\\n/g, '$1\\\\n')  // Fix single backslash newlines
          .replace(/([^\\])\\t/g, '$1\\\\t')  // Fix single backslash tabs
          .replace(/([^\\])\\r/g, '$1\\\\r'); // Fix single backslash returns
        return JSON.parse(jsonStr);
      } catch (e3) {
        console.error('   ❌ JSON repair failed. Errors:');
        console.error('   Original:', e1.message.substring(0, 100));
        console.error('   After quote fix:', e2.message.substring(0, 100));
        console.error('   After newline fix:', e3.message.substring(0, 100));
        throw new Error('Unable to parse or repair JSON response');
      }
    }
  }
}

// Call Gemini API with improved error handling
async function translateWithGemini(article) {
  const prompt = buildPrompt(article);
  
  const requestBody = {
    contents: [{
      parts: [{
        text: prompt
      }]
    }],
    generationConfig: {
      temperature: 0.1,  // Lower temperature for more consistent JSON
      topK: 20,
      topP: 0.8,
      maxOutputTokens: 8192,
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
  const timeoutMs = 90000; // 90 second timeout
  
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
      
      // Extract and clean JSON
      console.log(`   🔍 Extracting and parsing JSON...`);
      const result = extractAndCleanJson(translatedText);
      
      // Validate required fields
      const required = ['title', 'slug', 'content', 'excerpt', 'meta_title', 'meta_description'];
      const missing = required.filter(field => !result[field]);
      if (missing.length > 0) {
        throw new Error(`Missing required fields: ${missing.join(', ')}`);
      }
      
      console.log(`   ✅ Translation successful: "${result.title}"`);
      return result;
      
    } catch (error) {
      console.error(`   ❌ Attempt ${attempt} failed:`, error.message);
      
      if (attempt < maxRetries) {
        const delay = attempt * 3000; // Increasing delay: 3s, 6s, 9s
        console.log(`   ⏳ Waiting ${delay/1000} seconds before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
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
  console.log('🇫🇮 Finnish Translation Script - Corrected Version');
  console.log('==================================================');

  try {
    console.log('Loading batch from /tmp/fi-batch-correct.json...');
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
      console.log(`\n[${i + 1}/${articles.length}] Translating: "${article.title}"`);
      console.log(`   📄 Content: ${article.content.length} characters`);

      try {
        const translation = await translateWithGemini(article);
        
        if (translation) {
          const success = await insertTranslation(article.id, translation);
          
          if (success) {
            console.log(`   ✅ Success: Saved "${translation.title}"`);
            successCount++;
          } else {
            console.log(`   ❌ Failed to save: "${article.title}"`);
            failCount++;
          }
        } else {
          console.log(`   ❌ Translation failed: "${article.title}"`);
          failCount++;
        }
        
        // Rate limiting: wait between requests
        if (i < articles.length - 1) {
          console.log('   ⏳ Waiting 3 seconds to avoid rate limits...');
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
        
      } catch (error) {
        console.error(`❌ Error processing "${article.title}":`, error.message);
        failCount++;
        
        // Continue with next article even if this one fails
        if (i < articles.length - 1) {
          console.log('   ⏳ Waiting 3 seconds before next attempt...');
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
      }
    }

    console.log('\n📊 Translation Summary');
    console.log('======================');
    console.log(`✅ Successfully translated: ${successCount}`);
    console.log(`❌ Failed: ${failCount}`);
    console.log(`📈 Success rate: ${((successCount / articles.length) * 100).toFixed(1)}%`);

    // Verify final count
    console.log('\n🔍 Verifying database count...');
    const { count: newCount } = await supabase
      .from('article_translations')
      .select('*', { count: 'exact', head: true })
      .eq('language', 'fi');
    
    console.log(`📊 Total Finnish translations now: ${newCount}`);
    console.log(`📈 Increase from ~1273: +${newCount - 1273}`);

  } catch (error) {
    console.error('❌ Script failed:', error.message);
    process.exit(1);
  }
}

main();