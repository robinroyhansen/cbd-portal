#!/usr/bin/env npx tsx
/**
 * German translation batch - Agent 3/5
 * Translates 50 articles to German (formal Sie form)
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';

const BATCH_SIZE = 50;

const TRANSLATION_CONTEXT = `You are translating CBD health content for a German medical/health information website.

Guidelines:
- Use FORMAL German (Sie form, not du)
- Maintain medical accuracy - do not change the meaning
- Use formal but accessible language appropriate for German-speaking countries
- Keep these terms unchanged: CBD, THC, CBG, CBN, CBDA, mg, ml, %
- Keep brand names unchanged
- Preserve all markdown formatting exactly
- Keep internal links unchanged (e.g., /conditions/anxiety stays as /conditions/anxiety)
- Use standard German medical terminology where appropriate
- Preserve any HTML tags exactly as they appear
- This is for a professional health information portal, maintain appropriate tone`;

let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 2500;

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
        const retryAfter = error.headers?.get?.('retry-after');
        const waitTime = retryAfter
          ? parseInt(retryAfter) * 1000 + 1000
          : Math.min(60000, 5000 * Math.pow(2, attempt));

        console.log(`⏳ Rate limited. Waiting ${Math.round(waitTime/1000)}s... (attempt ${attempt + 1}/${maxRetries})`);
        await sleep(waitTime);
        continue;
      }
      throw error;
    }
  }
  throw new Error('Max retries exceeded');
}

async function translateArticle(
  client: Anthropic,
  article: { title: string; content: string; meta_description: string | null }
): Promise<{ title: string; content: string; meta_description: string }> {
  const response = await callWithRetry(client, {
    model: 'claude-sonnet-4-20250514',
    max_tokens: 8192,
    messages: [
      {
        role: 'user',
        content: `${TRANSLATION_CONTEXT}

Translate the following article components from English to German.

=== TITLE ===
${article.title}

=== CONTENT (Markdown) ===
${article.content}

=== META DESCRIPTION ===
${article.meta_description || 'N/A'}

Respond in this exact format (preserve markdown in content):

=== TRANSLATED TITLE ===
[translated title here]

=== TRANSLATED CONTENT ===
[translated markdown content here]

=== TRANSLATED META DESCRIPTION ===
[translated meta description here, max 160 chars]`,
      },
    ],
  });

  const responseText = response.content[0].type === 'text' ? response.content[0].text : '';

  const titleMatch = responseText.match(/=== TRANSLATED TITLE ===\n([\s\S]*?)\n\n=== TRANSLATED CONTENT ===/);
  const contentMatch = responseText.match(/=== TRANSLATED CONTENT ===\n([\s\S]*?)\n\n=== TRANSLATED META DESCRIPTION ===/);
  const metaMatch = responseText.match(/=== TRANSLATED META DESCRIPTION ===\n([\s\S]*?)$/);

  return {
    title: titleMatch?.[1]?.trim() || article.title,
    content: contentMatch?.[1]?.trim() || article.content,
    meta_description: metaMatch?.[1]?.trim() || article.meta_description || '',
  };
}

async function main() {
  console.log('🇩🇪 German Translation Batch - Agent 3/5');
  console.log('==========================================\n');

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY!,
  });

  // Get all published articles
  console.log('🔍 Finding untranslated articles...');
  
  let articles: any[] = [];
  let offset = 0;
  const pageSize = 1000;

  while (true) {
    const { data, error } = await supabase
      .from('kb_articles')
      .select('id, slug, title, content, meta_description')
      .eq('status', 'published')
      .order('updated_at', { ascending: false })
      .range(offset, offset + pageSize - 1);

    if (error) {
      console.error('Failed to fetch articles:', error);
      process.exit(1);
    }

    if (!data || data.length === 0) break;
    articles = articles.concat(data);
    if (data.length < pageSize) break;
    offset += pageSize;
  }

  // Get existing German translations
  const { data: existingTranslations } = await supabase
    .from('article_translations')
    .select('article_id')
    .eq('language', 'de');

  const translatedIds = new Set(existingTranslations?.map(t => t.article_id) || []);
  const untranslated = articles.filter(a => !translatedIds.has(a.id));

  console.log(`📊 Total published articles: ${articles.length}`);
  console.log(`✅ Already translated to German: ${translatedIds.size}`);
  console.log(`📝 Remaining untranslated: ${untranslated.length}`);
  
  // Take only BATCH_SIZE articles for this agent
  const batch = untranslated.slice(0, BATCH_SIZE);
  console.log(`🎯 This batch: ${batch.length} articles\n`);

  if (batch.length === 0) {
    console.log('🎉 No articles to translate in this batch!');
    return;
  }

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < batch.length; i++) {
    const article = batch[i];
    const progress = `[${i + 1}/${batch.length}]`;

    console.log(`${progress} 🔄 Translating: ${article.slug}`);

    try {
      const translated = await translateArticle(anthropic, article);

      const { error: insertError } = await supabase
        .from('article_translations')
        .insert({
          article_id: article.id,
          language: 'de',
          slug: article.slug,
          title: translated.title,
          content: translated.content,
          excerpt: translated.meta_description,
          meta_title: translated.title,
          meta_description: translated.meta_description,
        });

      if (insertError) {
        if (insertError.code === '23505') {
          console.log(`${progress} ⏭️ Already exists (race condition)`);
        } else {
          console.error(`${progress} ❌ Save failed:`, insertError.message);
          failCount++;
        }
      } else {
        console.log(`${progress} ✅ Done: ${translated.title.substring(0, 50)}...`);
        successCount++;
      }
    } catch (error: any) {
      console.error(`${progress} ❌ Failed: ${error.message}`);
      failCount++;
    }

    if ((i + 1) % 10 === 0) {
      console.log(`\n📈 Progress: ${successCount} succeeded, ${failCount} failed\n`);
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('🏁 Batch complete!');
  console.log(`   ✅ Success: ${successCount}`);
  console.log(`   ❌ Failed: ${failCount}`);
  console.log(`   📊 Total German translations: ${translatedIds.size + successCount}/${articles.length}`);
}

main().catch(console.error);
