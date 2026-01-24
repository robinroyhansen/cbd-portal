#!/usr/bin/env npx tsx
/**
 * Batch translate content (articles, conditions, glossary) to supported languages
 *
 * Usage:
 *   npx tsx scripts/translate-content.ts --type=conditions --lang=da
 *   npx tsx scripts/translate-content.ts --type=articles --lang=all --limit=10
 *   npx tsx scripts/translate-content.ts --type=glossary --lang=da,sv,no
 */

import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';

// Languages to translate to
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
type ContentType = 'articles' | 'conditions' | 'glossary' | 'research';

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

async function translateConditions(
  supabase: ReturnType<typeof createClient>,
  client: Anthropic,
  langs: LangCode[],
  limit?: number
) {
  console.log('\n📋 Fetching conditions...');

  let query = supabase
    .from('kb_conditions')
    .select('id, name, display_name, short_description, meta_title, meta_description')
    .eq('is_published', true)
    .order('research_count', { ascending: false });

  if (limit) {
    query = query.limit(limit);
  }

  const { data: conditions, error } = await query;

  if (error) {
    console.error('❌ Failed to fetch conditions:', error);
    return;
  }

  console.log(`Found ${conditions.length} conditions to translate`);

  for (const condition of conditions) {
    for (const lang of langs) {
      // Check if translation already exists
      const { data: existing } = await supabase
        .from('condition_translations')
        .select('id')
        .eq('condition_id', condition.id)
        .eq('language', lang)
        .single();

      if (existing) {
        console.log(`⏭️ Skipping ${condition.name} (${lang}) - already translated`);
        continue;
      }

      console.log(`🔄 Translating condition: ${condition.name} → ${TARGET_LANGUAGES[lang].name}`);

      try {
        const response = await client.messages.create({
          model: 'claude-3-5-haiku-20241022',
          max_tokens: 2048,
          messages: [
            {
              role: 'user',
              content: `${TRANSLATION_CONTEXT}

Translate these medical condition fields from English to ${TARGET_LANGUAGES[lang].name}:

name: ${condition.name}
displayName: ${condition.display_name || condition.name}
shortDescription: ${condition.short_description || ''}
metaTitle: ${condition.meta_title || ''}
metaDescription: ${condition.meta_description || ''}

Respond in this exact JSON format:
{
  "name": "translated name",
  "display_name": "translated display name",
  "short_description": "translated short description",
  "meta_title": "translated meta title",
  "meta_description": "translated meta description"
}`,
            },
          ],
        });

        const responseText = response.content[0].type === 'text'
          ? response.content[0].text.trim()
          : '{}';

        let jsonStr = responseText;
        if (jsonStr.startsWith('```')) {
          jsonStr = jsonStr.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
        }

        const translated = JSON.parse(jsonStr);

        // Insert translation
        const { error: insertError } = await supabase.from('condition_translations').insert({
          condition_id: condition.id,
          language: lang,
          name: translated.name,
          display_name: translated.display_name,
          short_description: translated.short_description,
          meta_title: translated.meta_title,
          meta_description: translated.meta_description,
        });

        if (insertError) {
          console.error(`❌ Failed to save translation:`, insertError);
        } else {
          console.log(`✅ Saved: ${condition.name} (${lang})`);
        }

        // Rate limit delay
        await new Promise((r) => setTimeout(r, 300));
      } catch (error) {
        console.error(`❌ Failed to translate ${condition.name} (${lang}):`, error);
      }
    }
  }
}

async function translateArticles(
  supabase: ReturnType<typeof createClient>,
  client: Anthropic,
  langs: LangCode[],
  limit?: number
) {
  console.log('\n📄 Fetching articles...');

  let query = supabase
    .from('kb_articles')
    .select('id, slug, title, content, meta_description')
    .eq('status', 'published')
    .order('updated_at', { ascending: false });

  if (limit) {
    query = query.limit(limit);
  }

  const { data: articles, error } = await query;

  if (error) {
    console.error('❌ Failed to fetch articles:', error);
    return;
  }

  console.log(`Found ${articles.length} articles to translate`);

  for (const article of articles) {
    for (const lang of langs) {
      // Check if translation already exists
      const { data: existing } = await supabase
        .from('article_translations')
        .select('id')
        .eq('article_id', article.id)
        .eq('language', lang)
        .single();

      if (existing) {
        console.log(`⏭️ Skipping ${article.slug} (${lang}) - already translated`);
        continue;
      }

      console.log(`🔄 Translating article: ${article.slug} → ${TARGET_LANGUAGES[lang].name}`);

      try {
        // Translate title
        const titleResponse = await client.messages.create({
          model: 'claude-3-5-haiku-20241022',
          max_tokens: 256,
          messages: [
            {
              role: 'user',
              content: `${TRANSLATION_CONTEXT}

Translate this article title from English to ${TARGET_LANGUAGES[lang].name}:

${article.title}

Provide ONLY the translated title:`,
            },
          ],
        });

        const translatedTitle = titleResponse.content[0].type === 'text'
          ? titleResponse.content[0].text.trim()
          : article.title;

        // Translate content
        const contentResponse = await client.messages.create({
          model: 'claude-3-5-haiku-20241022',
          max_tokens: 8192,
          messages: [
            {
              role: 'user',
              content: `${TRANSLATION_CONTEXT}

Translate this article content (in Markdown format) from English to ${TARGET_LANGUAGES[lang].name}:

${article.content}

Provide ONLY the translated markdown content:`,
            },
          ],
        });

        const translatedContent = contentResponse.content[0].type === 'text'
          ? contentResponse.content[0].text.trim()
          : article.content;

        // Translate meta description
        let translatedMeta = article.meta_description;
        if (article.meta_description) {
          const metaResponse = await client.messages.create({
            model: 'claude-3-5-haiku-20241022',
            max_tokens: 256,
            messages: [
              {
                role: 'user',
                content: `${TRANSLATION_CONTEXT}

Translate this SEO meta description from English to ${TARGET_LANGUAGES[lang].name} (keep under 160 characters):

${article.meta_description}

Provide ONLY the translated meta description:`,
              },
            ],
          });

          translatedMeta = metaResponse.content[0].type === 'text'
            ? metaResponse.content[0].text.trim()
            : article.meta_description;
        }

        // Insert translation
        const { error: insertError } = await supabase.from('article_translations').insert({
          article_id: article.id,
          language: lang,
          slug: article.slug, // Keep original slug
          title: translatedTitle,
          content: translatedContent,
          excerpt: translatedMeta,
          meta_title: translatedTitle,
          meta_description: translatedMeta,
        });

        if (insertError) {
          console.error(`❌ Failed to save translation:`, insertError);
        } else {
          console.log(`✅ Saved: ${article.slug} (${lang})`);
        }

        // Rate limit delay
        await new Promise((r) => setTimeout(r, 500));
      } catch (error) {
        console.error(`❌ Failed to translate ${article.slug} (${lang}):`, error);
      }
    }
  }
}

async function translateGlossary(
  supabase: ReturnType<typeof createClient>,
  client: Anthropic,
  langs: LangCode[],
  limit?: number
) {
  console.log('\n📖 Fetching glossary terms...');

  let query = supabase
    .from('kb_glossary')
    .select('id, term, definition, simple_definition')
    .order('term');

  if (limit) {
    query = query.limit(limit);
  }

  const { data: terms, error } = await query;

  if (error) {
    console.error('❌ Failed to fetch glossary terms:', error);
    return;
  }

  console.log(`Found ${terms.length} glossary terms to translate`);

  for (const term of terms) {
    for (const lang of langs) {
      // Check if translation already exists
      const { data: existing } = await supabase
        .from('glossary_translations')
        .select('id')
        .eq('term_id', term.id)
        .eq('language', lang)
        .single();

      if (existing) {
        console.log(`⏭️ Skipping ${term.term} (${lang}) - already translated`);
        continue;
      }

      console.log(`🔄 Translating term: ${term.term} → ${TARGET_LANGUAGES[lang].name}`);

      try {
        const response = await client.messages.create({
          model: 'claude-3-5-haiku-20241022',
          max_tokens: 1024,
          messages: [
            {
              role: 'user',
              content: `${TRANSLATION_CONTEXT}

Translate this glossary term from English to ${TARGET_LANGUAGES[lang].name}:

Term: ${term.term}
Definition: ${term.definition}
Simple Definition: ${term.simple_definition || 'N/A'}

Respond in this exact JSON format:
{
  "term": "translated term",
  "definition": "translated definition",
  "simple_definition": "translated simple definition or null"
}`,
            },
          ],
        });

        const responseText = response.content[0].type === 'text'
          ? response.content[0].text.trim()
          : '{}';

        let jsonStr = responseText;
        if (jsonStr.startsWith('```')) {
          jsonStr = jsonStr.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
        }

        const translated = JSON.parse(jsonStr);

        // Insert translation
        const { error: insertError } = await supabase.from('glossary_translations').insert({
          term_id: term.id,
          language: lang,
          term: translated.term,
          definition: translated.definition,
          simple_definition: translated.simple_definition || null,
        });

        if (insertError) {
          console.error(`❌ Failed to save translation:`, insertError);
        } else {
          console.log(`✅ Saved: ${term.term} (${lang})`);
        }

        // Rate limit delay
        await new Promise((r) => setTimeout(r, 300));
      } catch (error) {
        console.error(`❌ Failed to translate ${term.term} (${lang}):`, error);
      }
    }
  }
}

async function translateResearch(
  supabase: ReturnType<typeof createClient>,
  client: Anthropic,
  langs: LangCode[],
  limit?: number
) {
  console.log('\n🔬 Fetching research studies...');

  let query = supabase
    .from('kb_research_queue')
    .select('id, title, plain_summary')
    .eq('status', 'approved')
    .not('plain_summary', 'is', null)
    .order('quality_score', { ascending: false });

  if (limit) {
    query = query.limit(limit);
  }

  const { data: studies, error } = await query;

  if (error) {
    console.error('❌ Failed to fetch research:', error);
    return;
  }

  console.log(`Found ${studies.length} research studies to translate`);

  for (const study of studies) {
    for (const lang of langs) {
      // Check if translation already exists
      const { data: existing } = await supabase
        .from('research_translations')
        .select('id')
        .eq('research_id', study.id)
        .eq('language', lang)
        .single();

      if (existing) {
        console.log(`⏭️ Skipping research ${study.id} (${lang}) - already translated`);
        continue;
      }

      console.log(`🔄 Translating research: ${study.title?.substring(0, 50)}... → ${TARGET_LANGUAGES[lang].name}`);

      try {
        const response = await client.messages.create({
          model: 'claude-3-5-haiku-20241022',
          max_tokens: 1024,
          messages: [
            {
              role: 'user',
              content: `${TRANSLATION_CONTEXT}

Translate this research study plain-language summary from English to ${TARGET_LANGUAGES[lang].name}:

${study.plain_summary}

Provide ONLY the translated summary:`,
            },
          ],
        });

        const translatedSummary = response.content[0].type === 'text'
          ? response.content[0].text.trim()
          : study.plain_summary;

        // Insert translation
        const { error: insertError } = await supabase.from('research_translations').insert({
          research_id: study.id,
          language: lang,
          plain_summary: translatedSummary,
        });

        if (insertError) {
          console.error(`❌ Failed to save translation:`, insertError);
        } else {
          console.log(`✅ Saved research translation (${lang})`);
        }

        // Rate limit delay
        await new Promise((r) => setTimeout(r, 300));
      } catch (error) {
        console.error(`❌ Failed to translate research (${lang}):`, error);
      }
    }
  }
}

async function main() {
  // Parse arguments
  const args = process.argv.slice(2);

  const typeArg = args.find((a) => a.startsWith('--type='));
  const langArg = args.find((a) => a.startsWith('--lang='));
  const limitArg = args.find((a) => a.startsWith('--limit='));

  if (!typeArg || !langArg) {
    console.log(`
Usage: npx tsx scripts/translate-content.ts --type=TYPE --lang=LANG [--limit=N]

Types:
  articles    - Translate kb_articles content
  conditions  - Translate kb_conditions names and descriptions
  glossary    - Translate kb_glossary terms
  research    - Translate research plain summaries
  all         - Translate all content types

Languages:
  da, sv, no, de, nl, fi, fr, it, or 'all'
  Can also specify multiple: --lang=da,sv,no

Options:
  --limit=N   - Only translate first N items (useful for testing)

Examples:
  npx tsx scripts/translate-content.ts --type=conditions --lang=da
  npx tsx scripts/translate-content.ts --type=articles --lang=all --limit=10
    `);
    process.exit(1);
  }

  const contentType = typeArg.replace('--type=', '') as ContentType | 'all';
  const langValue = langArg.replace('--lang=', '');
  const limit = limitArg ? parseInt(limitArg.replace('--limit=', ''), 10) : undefined;

  // Parse languages
  let targetLangs: LangCode[];
  if (langValue === 'all') {
    targetLangs = Object.keys(TARGET_LANGUAGES) as LangCode[];
  } else {
    targetLangs = langValue.split(',') as LangCode[];
    for (const lang of targetLangs) {
      if (!(lang in TARGET_LANGUAGES)) {
        console.error(`Unknown language: ${lang}`);
        process.exit(1);
      }
    }
  }

  // Check environment variables
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Missing Supabase environment variables');
    process.exit(1);
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('❌ Missing ANTHROPIC_API_KEY environment variable');
    process.exit(1);
  }

  // Initialize clients
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  console.log(`🌍 Translating ${contentType} to: ${targetLangs.join(', ')}`);
  if (limit) {
    console.log(`📊 Limited to ${limit} items`);
  }

  // Run translations based on type
  if (contentType === 'all' || contentType === 'conditions') {
    await translateConditions(supabase, anthropic, targetLangs, limit);
  }

  if (contentType === 'all' || contentType === 'articles') {
    await translateArticles(supabase, anthropic, targetLangs, limit);
  }

  if (contentType === 'all' || contentType === 'glossary') {
    await translateGlossary(supabase, anthropic, targetLangs, limit);
  }

  if (contentType === 'all' || contentType === 'research') {
    await translateResearch(supabase, anthropic, targetLangs, limit);
  }

  console.log('\n🎉 Translation complete!');
}

main().catch(console.error);
