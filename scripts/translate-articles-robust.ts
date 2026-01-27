#!/usr/bin/env npx tsx
/**
 * Robust article translation with proper rate limit handling
 * Usage: npx tsx scripts/translate-articles-robust.ts --lang=da
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';

const TARGET_LANGUAGES = {
  da: { name: 'Danish', nativeName: 'Dansk' },
  sv: { name: 'Swedish', nativeName: 'Svenska' },
  no: { name: 'Norwegian', nativeName: 'Norsk' },
  de: { name: 'German', nativeName: 'Deutsch' },
  nl: { name: 'Dutch', nativeName: 'Nederlands' },
  fi: { name: 'Finnish', nativeName: 'Suomi' },
  fr: { name: 'French', nativeName: 'Français' },
  it: { name: 'Italian', nativeName: 'Italiano' },
} as const;

type LangCode = keyof typeof TARGET_LANGUAGES;

const TRANSLATION_CONTEXT = `You are translating CBD health content for a medical/health information website.

Guidelines:
- Maintain medical accuracy - do not change the meaning
- Use formal but accessible language appropriate for the target country
- Keep these terms unchanged: CBD, THC, CBG, CBN, CBDA, mg, ml, %
- Keep brand names unchanged
- Preserve all markdown formatting
- Keep internal links unchanged (e.g., /conditions/anxiety stays as /conditions/anxiety)
- Use native medical terminology where appropriate
- Preserve any HTML tags exactly as they appear`;

// Rate limit tracking
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 2000; // 2 seconds between requests to stay under limits

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
        // Parse retry-after header or use exponential backoff
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
  article: { title: string; content: string; meta_description: string | null },
  lang: LangCode
): Promise<{ title: string; content: string; meta_description: string }> {
  // Combine all translations into a single API call to reduce rate limit impact
  const response = await callWithRetry(client, {
    model: 'claude-3-haiku-20240307',
    max_tokens: 4096,
    messages: [
      {
        role: 'user',
        content: `${TRANSLATION_CONTEXT}

Translate the following article components from English to ${TARGET_LANGUAGES[lang].name}.

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

  // Parse response
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
  const args = process.argv.slice(2);
  const langArg = args.find(a => a.startsWith('--lang='));

  if (!langArg) {
    console.log('Usage: npx tsx scripts/translate-articles-robust.ts --lang=da');
    process.exit(1);
  }

  const lang = langArg.replace('--lang=', '') as LangCode;
  if (!(lang in TARGET_LANGUAGES)) {
    console.error(`Unknown language: ${lang}`);
    process.exit(1);
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY!,
  });

  // Get untranslated articles
  console.log(`🔍 Finding untranslated articles for ${TARGET_LANGUAGES[lang].name}...`);

  // Get all articles with pagination (Supabase default limit is 1000)
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

  const articlesError = null;

  if (articlesError) {
    console.error('Failed to fetch articles:', articlesError);
    process.exit(1);
  }

  // Get existing translations for this language
  const { data: existingTranslations } = await supabase
    .from('article_translations')
    .select('article_id')
    .eq('language', lang);

  const translatedIds = new Set(existingTranslations?.map(t => t.article_id) || []);
  const untranslated = articles?.filter(a => !translatedIds.has(a.id)) || [];

  console.log(`📊 Total articles: ${articles?.length}`);
  console.log(`✅ Already translated: ${translatedIds.size}`);
  console.log(`📝 Remaining: ${untranslated.length}`);
  console.log('');

  if (untranslated.length === 0) {
    console.log('🎉 All articles are already translated!');
    return;
  }

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < untranslated.length; i++) {
    const article = untranslated[i];
    const progress = `[${i + 1}/${untranslated.length}]`;

    console.log(`${progress} 🔄 Translating: ${article.slug}`);

    try {
      const translated = await translateArticle(anthropic, article, lang);

      const { error: insertError } = await supabase
        .from('article_translations')
        .insert({
          article_id: article.id,
          language: lang,
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
        console.log(`${progress} ✅ Done: ${article.slug}`);
        successCount++;
      }
    } catch (error: any) {
      console.error(`${progress} ❌ Failed: ${error.message}`);
      failCount++;

      // If it's a non-rate-limit error, continue to next article
      if (error?.status !== 429) {
        continue;
      }
    }

    // Progress update every 10 articles
    if ((i + 1) % 10 === 0) {
      console.log(`\n📈 Progress: ${successCount} succeeded, ${failCount} failed, ${untranslated.length - i - 1} remaining\n`);
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log(`🏁 Translation complete!`);
  console.log(`   ✅ Success: ${successCount}`);
  console.log(`   ❌ Failed: ${failCount}`);
  console.log(`   📊 Total: ${translatedIds.size + successCount}/${articles?.length}`);
}

main().catch(console.error);
