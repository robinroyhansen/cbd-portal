#!/usr/bin/env npx tsx
/**
 * Agent 2 - German Translation Batch (50 articles)
 * Offset: 50, Limit: 50
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';

const LANG = 'de';
const BATCH_OFFSET = 50;  // Agent 2 starts at offset 50
const BATCH_SIZE = 50;

const TRANSLATION_CONTEXT = `You are translating CBD health content for a German medical/health information website (cbd.de).

Guidelines:
- Use formal German (Sie form) for addressing readers
- Maintain medical accuracy - do not change the meaning
- Use formal but accessible language appropriate for Germany
- Keep these terms unchanged: CBD, THC, CBG, CBN, CBDA, mg, ml, %
- Keep brand names unchanged
- Preserve all markdown formatting exactly
- Keep internal links unchanged (e.g., /conditions/anxiety stays as /conditions/anxiety)
- Use native German medical terminology where appropriate
- Preserve any HTML tags exactly as they appear
- SEO-friendly translations`;

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1500;

async function sleep(ms: number) {
  return new Promise(r => setTimeout(r, ms));
}

async function callWithRetry(
  client: Anthropic,
  params: Anthropic.MessageCreateParams,
  maxRetries = 5
): Promise<Anthropic.Message> {
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
        const waitTime = Math.min(60000, 5000 * Math.pow(2, attempt));
        console.log(`⏳ Rate limited. Waiting ${Math.round(waitTime/1000)}s... (attempt ${attempt + 1}/${maxRetries})`);
        await sleep(waitTime);
        continue;
      }
      throw error;
    }
  }
  throw new Error('Max retries exceeded');
}

async function main() {
  console.log('\n🇩🇪 Agent 2 - German Article Translation Batch');
  console.log('═'.repeat(50));
  console.log(`📊 Batch: offset ${BATCH_OFFSET}, limit ${BATCH_SIZE}\n`);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY!,
  });

  // Get existing German translations
  const { data: existing } = await supabase
    .from('article_translations')
    .select('article_id')
    .eq('language', LANG);
  
  const existingIds = new Set(existing?.map(e => e.article_id) || []);
  console.log(`📋 Already translated: ${existingIds.size} articles\n`);

  // Get all published articles
  const { data: allArticles, error } = await supabase
    .from('kb_articles')
    .select('id, slug, title, content, meta_description')
    .eq('status', 'published')
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('❌ Failed to fetch articles:', error);
    process.exit(1);
  }

  // Filter to only untranslated articles
  const untranslated = allArticles?.filter(a => !existingIds.has(a.id)) || [];
  console.log(`📝 Untranslated articles: ${untranslated.length}\n`);

  // Get our batch (offset 50, limit 50)
  const myBatch = untranslated.slice(BATCH_OFFSET, BATCH_OFFSET + BATCH_SIZE);
  console.log(`🎯 Agent 2 batch: ${myBatch.length} articles (indices ${BATCH_OFFSET}-${BATCH_OFFSET + myBatch.length - 1})\n`);

  if (myBatch.length === 0) {
    console.log('✅ No articles to translate in this batch!');
    return;
  }

  let translated = 0;
  let failed = 0;
  let skipped = 0;

  for (let i = 0; i < myBatch.length; i++) {
    const article = myBatch[i];
    const globalIndex = BATCH_OFFSET + i + 1;
    const progress = `[${i + 1}/${myBatch.length}]`;

    // Double-check not already translated (race condition protection)
    const { data: checkExisting } = await supabase
      .from('article_translations')
      .select('id')
      .eq('article_id', article.id)
      .eq('language', LANG)
      .limit(1);

    if (checkExisting && checkExisting.length > 0) {
      console.log(`${progress} ⏭️ Already translated: ${article.slug}`);
      skipped++;
      continue;
    }

    console.log(`${progress} 🔄 Translating: ${article.slug}`);

    try {
      // Single API call for all fields
      const response = await callWithRetry(anthropic, {
        model: 'claude-3-haiku-20240307',
        max_tokens: 4096,
        messages: [{
          role: 'user',
          content: `${TRANSLATION_CONTEXT}

Translate the following article from English to German (Deutsch).

=== TITLE ===
${article.title}

=== CONTENT (Markdown) ===
${article.content}

=== META DESCRIPTION ===
${article.meta_description || 'N/A'}

Respond in this exact format (preserve all markdown in content):

=== TRANSLATED TITLE ===
[German title here]

=== TRANSLATED CONTENT ===
[German markdown content here]

=== TRANSLATED META DESCRIPTION ===
[German meta description, max 160 chars]`,
        }],
      });

      const responseText = response.content[0].type === 'text' ? response.content[0].text : '';

      // Parse response
      const titleMatch = responseText.match(/=== TRANSLATED TITLE ===\n([\s\S]*?)\n\n=== TRANSLATED CONTENT ===/);
      const contentMatch = responseText.match(/=== TRANSLATED CONTENT ===\n([\s\S]*?)\n\n=== TRANSLATED META DESCRIPTION ===/);
      const metaMatch = responseText.match(/=== TRANSLATED META DESCRIPTION ===\n([\s\S]*?)$/);

      const translatedTitle = titleMatch?.[1]?.trim() || article.title;
      const translatedContent = contentMatch?.[1]?.trim() || article.content;
      const translatedMeta = metaMatch?.[1]?.trim() || article.meta_description || '';

      const { error: insertError } = await supabase.from('article_translations').insert({
        article_id: article.id,
        language: LANG,
        slug: generateSlug(translatedTitle),
        title: translatedTitle,
        content: translatedContent,
        excerpt: translatedMeta,
        meta_title: translatedTitle,
        meta_description: translatedMeta,
      });

      if (insertError) {
        if (insertError.code === '23505') {
          console.log(`${progress} ⏭️ Already exists (race)`);
          skipped++;
        } else {
          console.error(`${progress} ❌ Save failed: ${insertError.message}`);
          failed++;
        }
      } else {
        console.log(`${progress} ✅ Done: ${translatedTitle.substring(0, 50)}...`);
        translated++;
      }

    } catch (error: any) {
      console.error(`${progress} ❌ Failed: ${error.message}`);
      failed++;
    }

    // Progress every 10 articles
    if ((i + 1) % 10 === 0) {
      console.log(`\n📈 Progress: ${translated} done, ${skipped} skipped, ${failed} failed\n`);
    }
  }

  console.log('\n' + '═'.repeat(50));
  console.log('🏁 Agent 2 Batch Complete!');
  console.log(`   ✅ Translated: ${translated}`);
  console.log(`   ⏭️ Skipped: ${skipped}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log('═'.repeat(50));
}

main().catch(console.error);
