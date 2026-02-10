#!/usr/bin/env npx tsx
/**
 * Swedish translation batch starting at offset 75
 * Translates 75 articles from untranslated list to Swedish
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';

const TRANSLATION_CONTEXT = `You are translating CBD health content for a Swedish medical/health information website.

Guidelines:
- Use natural Swedish (Sweden variant) - formal but accessible language
- Maintain medical accuracy - do not change the meaning
- Keep these terms unchanged: CBD, THC, CBG, CBN, CBDA, mg, ml, %
- Keep brand names unchanged
- Preserve ALL markdown formatting, links, and HTML tags exactly
- Keep internal links unchanged (e.g., /conditions/anxiety stays as /conditions/anxiety)
- Use Swedish medical terminology where appropriate
- Translate EVERYTHING - do not truncate content
- For slugs: use URL-safe Swedish (no å/ä/ö), use a/a/o instead`;

// Rate limit management
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1500; // 1.5 seconds between requests

async function sleep(ms: number) {
  return new Promise(r => setTimeout(r, ms));
}

async function callWithRetry(
  client: Anthropic,
  params: Anthropic.MessageCreateParams,
  maxRetries = 5
): Promise<Anthropic.Message> {
  // Ensure minimum interval between requests
  const now = Date.now();
  const timeSinceLast = now - lastRequestTime;
  if (timeSinceLast < MIN_REQUEST_INTERVAL) {
    await sleep(MIN_REQUEST_INTERVAL - timeSinceLast);
  }

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      lastRequestTime = Date.now();
      return await client.messages.create(params);
    } catch (error: any) {
      if (error?.status === 429) {
        const retryAfter = error.headers?.get?.('retry-after');
        const waitTime = retryAfter
          ? parseInt(retryAfter) * 1000 + 2000
          : Math.min(120000, 10000 * Math.pow(2, attempt));

        console.log(`⏳ Rate limited. Waiting ${Math.round(waitTime/1000)}s... (attempt ${attempt + 1}/${maxRetries})`);
        await sleep(waitTime);
        continue;
      }
      throw error;
    }
  }
  throw new Error('Max retries exceeded');
}

function createSwedishSlug(englishSlug: string): string {
  return englishSlug
    .replace(/å/g, 'a')
    .replace(/ä/g, 'a')
    .replace(/ö/g, 'o')
    .replace(/Å/g, 'A')
    .replace(/Ä/g, 'A')
    .replace(/Ö/g, 'O');
}

async function translateArticle(
  client: Anthropic,
  article: { 
    id: number;
    slug: string;
    title: string; 
    content: string; 
    excerpt: string | null;
    meta_title: string | null;
    meta_description: string | null;
  }
): Promise<{
  article_id: number;
  language: string;
  slug: string;
  title: string;
  content: string;
  excerpt: string;
  meta_title: string;
  meta_description: string;
  translation_quality: string;
}> {
  
  const response = await callWithRetry(client, {
    model: 'claude-sonnet-4-20250514',
    max_tokens: 8192,
    messages: [
      {
        role: 'user',
        content: `${TRANSLATION_CONTEXT}

Translate the following CBD article from English to Swedish.

=== ORIGINAL TITLE ===
${article.title}

=== ORIGINAL CONTENT (Markdown) ===
${article.content}

=== ORIGINAL EXCERPT ===
${article.excerpt || 'N/A'}

=== ORIGINAL META TITLE ===
${article.meta_title || article.title}

=== ORIGINAL META DESCRIPTION ===
${article.meta_description || 'N/A'}

Respond in this exact format (preserve all markdown formatting):

=== SWEDISH TITLE ===
[translated title here]

=== SWEDISH CONTENT ===
[translated markdown content here - preserve ALL formatting, links, HTML]

=== SWEDISH EXCERPT ===
[translated excerpt here]

=== SWEDISH META TITLE ===
[translated meta title here]

=== SWEDISH META DESCRIPTION ===
[translated meta description here, max 160 chars]`,
      },
    ],
  });

  const responseText = response.content[0].type === 'text' ? response.content[0].text : '';

  // Parse response with more robust regex
  const titleMatch = responseText.match(/=== SWEDISH TITLE ===\s*\n(.*?)\n\n=== SWEDISH CONTENT ===/s);
  const contentMatch = responseText.match(/=== SWEDISH CONTENT ===\s*\n(.*?)\n\n=== SWEDISH EXCERPT ===/s);
  const excerptMatch = responseText.match(/=== SWEDISH EXCERPT ===\s*\n(.*?)\n\n=== SWEDISH META TITLE ===/s);
  const metaTitleMatch = responseText.match(/=== SWEDISH META TITLE ===\s*\n(.*?)\n\n=== SWEDISH META DESCRIPTION ===/s);
  const metaDescMatch = responseText.match(/=== SWEDISH META DESCRIPTION ===\s*\n(.*?)$/s);

  const translatedTitle = titleMatch?.[1]?.trim() || article.title;
  const translatedContent = contentMatch?.[1]?.trim() || article.content;
  const translatedExcerpt = excerptMatch?.[1]?.trim() || article.excerpt || '';
  const translatedMetaTitle = metaTitleMatch?.[1]?.trim() || translatedTitle;
  const translatedMetaDesc = metaDescMatch?.[1]?.trim() || article.meta_description || '';

  return {
    article_id: article.id,
    language: 'sv',
    slug: createSwedishSlug(article.slug),
    title: translatedTitle,
    content: translatedContent,
    excerpt: translatedExcerpt,
    meta_title: translatedMetaTitle,
    meta_description: translatedMetaDesc,
    translation_quality: 'ai'
  };
}

async function main() {
  console.log('🇸🇪 Starting Swedish translation batch (offset 75, limit 75)...\n');

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY!,
  });

  console.log('📊 Fetching untranslated articles...');

  // First get all articles
  const { data: allArticles, error: allError } = await supabase
    .from('kb_articles')
    .select('id, slug, title, content, excerpt, meta_title, meta_description')
    .eq('status', 'published')
    .order('id');

  if (allError) {
    console.error('❌ Failed to fetch articles:', allError);
    process.exit(1);
  }

  // Get existing Swedish translations
  const { data: existingTranslations, error: translationsError } = await supabase
    .from('article_translations')
    .select('article_id')
    .eq('language', 'sv');

  if (translationsError) {
    console.error('❌ Failed to fetch existing translations:', translationsError);
    process.exit(1);
  }

  // Filter untranslated and apply offset/limit
  const translatedIds = new Set(existingTranslations?.map(t => t.article_id) || []);
  const untranslated = allArticles?.filter(a => !translatedIds.has(a.id)) || [];
  const articles = untranslated.slice(75, 150); // OFFSET 75 LIMIT 75

  const articlesError = null;

  if (articlesError) {
    console.error('❌ Failed to fetch articles:', articlesError);
    process.exit(1);
  }

  if (!articles || articles.length === 0) {
    console.log('✅ No untranslated articles found at offset 75');
    return;
  }

  console.log(`📋 Found ${articles.length} articles to translate`);
  console.log('🚀 Starting translation...\n');

  let successCount = 0;
  let failCount = 0;
  const results: any[] = [];

  for (let i = 0; i < articles.length; i++) {
    const article = articles[i];
    const progress = `[${i + 1}/${articles.length}]`;

    console.log(`${progress} 🔄 Translating: "${article.title.substring(0, 50)}..."`);

    try {
      // Translate article
      const translated = await translateArticle(anthropic, article);
      
      // Insert into database
      const { error: insertError } = await supabase
        .from('article_translations')
        .insert(translated);

      if (insertError) {
        if (insertError.code === '23505') {
          console.log(`${progress} ⏭️ Already exists (duplicate)`);
        } else {
          console.error(`${progress} ❌ Save failed:`, insertError.message);
          failCount++;
        }
      } else {
        console.log(`${progress} ✅ Success: ${translated.slug}`);
        successCount++;
        results.push(translated);
      }

    } catch (error: any) {
      console.error(`${progress} ❌ Translation failed:`, error.message);
      failCount++;
    }

    // Progress updates
    if ((i + 1) % 10 === 0) {
      console.log(`\n📈 Progress: ${successCount} succeeded, ${failCount} failed\n`);
    }

    // Small delay between articles
    await sleep(500);
  }

  console.log('\n' + '='.repeat(60));
  console.log('🏁 BATCH TRANSLATION COMPLETE');
  console.log(`   ✅ Successfully translated: ${successCount}`);
  console.log(`   ❌ Failed: ${failCount}`);
  console.log(`   📊 Total processed: ${articles.length}`);
  console.log('='.repeat(60));

  // Save results to file for backup
  if (results.length > 0) {
    const fs = await import('fs');
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `swedish-translations-batch-75-${timestamp}.json`;
    fs.writeFileSync(filename, JSON.stringify(results, null, 2));
    console.log(`💾 Results saved to: ${filename}`);
  }

  return { success: successCount, failed: failCount, total: articles.length };
}

if (require.main === module) {
  main().catch(error => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  });
}

export default main;