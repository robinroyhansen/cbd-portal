#!/usr/bin/env npx tsx
/**
 * German Translation Script for CBD Portal (cbd.de launch)
 * 
 * This script translates all content to German:
 * - conditions (312 items)
 * - glossary (263 items)
 * - articles (1,259 items)
 * - research (4,879 items)
 * 
 * Usage:
 *   npx tsx scripts/translate-german.ts --type=conditions
 *   npx tsx scripts/translate-german.ts --type=glossary
 *   npx tsx scripts/translate-german.ts --type=articles --offset=0 --limit=100
 *   npx tsx scripts/translate-german.ts --type=research --offset=0 --limit=500
 *   npx tsx scripts/translate-german.ts --type=all --status
 * 
 * Environment variables required:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *   ANTHROPIC_API_KEY
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';

const LANG = 'de';
const LANG_NAME = 'German';
const LANG_NATIVE = 'Deutsch';

// Use Haiku for cost efficiency (4,879 research items!)
const MODEL = 'claude-3-haiku-20240307';

const TRANSLATION_CONTEXT = `You are translating CBD health content for a German medical/health information website (cbd.de).

Guidelines:
- Use formal German (Sie form) for addressing readers
- Maintain medical accuracy - do not change the meaning
- Use formal but accessible language appropriate for Germany
- Keep these terms unchanged: CBD, THC, CBG, CBN, CBDA, mg, ml, %
- Keep brand names unchanged
- Preserve all markdown formatting
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

async function getTranslationStats(supabase: ReturnType<typeof createClient>) {
  console.log('\n📊 German Translation Status\n');
  console.log('═'.repeat(50));

  // Get totals
  const [conditions, glossary, articles, research] = await Promise.all([
    supabase.from('kb_conditions').select('id', { count: 'exact', head: true }),
    supabase.from('kb_glossary').select('id', { count: 'exact', head: true }),
    supabase.from('kb_articles').select('id', { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('kb_research_queue').select('id', { count: 'exact', head: true })
      .eq('status', 'approved').not('plain_summary', 'is', null),
  ]);

  // Get German translation counts
  const [conditionsTr, glossaryTr, articlesTr, researchTr] = await Promise.all([
    supabase.from('condition_translations').select('id', { count: 'exact', head: true }).eq('language', LANG),
    supabase.from('glossary_translations').select('id', { count: 'exact', head: true }).eq('language', LANG),
    supabase.from('article_translations').select('id', { count: 'exact', head: true }).eq('language', LANG),
    supabase.from('research_translations').select('id', { count: 'exact', head: true }).eq('language', LANG),
  ]);

  const stats = [
    { name: 'Conditions', total: conditions.count || 0, translated: conditionsTr.count || 0 },
    { name: 'Glossary', total: glossary.count || 0, translated: glossaryTr.count || 0 },
    { name: 'Articles', total: articles.count || 0, translated: articlesTr.count || 0 },
    { name: 'Research', total: research.count || 0, translated: researchTr.count || 0 },
  ];

  let totalItems = 0;
  let totalTranslated = 0;

  for (const stat of stats) {
    const pct = stat.total > 0 ? Math.round((stat.translated / stat.total) * 100) : 0;
    const bar = '█'.repeat(Math.floor(pct / 5)) + '░'.repeat(20 - Math.floor(pct / 5));
    console.log(`${stat.name.padEnd(12)} [${bar}] ${pct.toString().padStart(3)}% (${stat.translated}/${stat.total})`);
    totalItems += stat.total;
    totalTranslated += stat.translated;
  }

  console.log('═'.repeat(50));
  const totalPct = totalItems > 0 ? Math.round((totalTranslated / totalItems) * 100) : 0;
  console.log(`${'TOTAL'.padEnd(12)} ${totalPct}% complete (${totalTranslated.toLocaleString('de-DE')}/${totalItems.toLocaleString('de-DE')} items)\n`);

  return stats;
}

async function translateConditions(
  supabase: ReturnType<typeof createClient>,
  client: Anthropic,
  limit?: number,
  offset?: number
) {
  console.log('\n📋 Translating conditions to German...\n');

  // Get existing German translation IDs
  const { data: existing } = await supabase
    .from('condition_translations')
    .select('condition_id')
    .eq('language', LANG);
  
  const existingIds = new Set(existing?.map(e => e.condition_id) || []);

  // Get conditions to translate
  let query = supabase
    .from('kb_conditions')
    .select('id, name, display_name, short_description, meta_title_template, meta_description_template')
    .order('name');

  if (offset !== undefined && limit !== undefined) {
    query = query.range(offset, offset + limit - 1);
  } else if (limit) {
    query = query.limit(limit);
  }

  const { data: conditions, error } = await query;

  if (error) {
    console.error('❌ Failed to fetch conditions:', error);
    return { translated: 0, skipped: 0, failed: 0 };
  }

  // Filter out already translated
  const toTranslate = conditions?.filter(c => !existingIds.has(c.id)) || [];
  const skipped = (conditions?.length || 0) - toTranslate.length;

  console.log(`Found ${conditions?.length} conditions, ${skipped} already translated, ${toTranslate.length} to translate\n`);

  let translated = 0;
  let failed = 0;

  for (const condition of toTranslate) {
    console.log(`🔄 [${translated + 1}/${toTranslate.length}] ${condition.name}`);

    try {
      const response = await client.messages.create({
        model: MODEL,
        max_tokens: 2048,
        messages: [{
          role: 'user',
          content: `${TRANSLATION_CONTEXT}

Translate these medical condition fields from English to ${LANG_NAME} (${LANG_NATIVE}):

name: ${condition.name}
displayName: ${condition.display_name || condition.name}
shortDescription: ${condition.short_description || ''}
metaTitleTemplate: ${condition.meta_title_template || ''}
metaDescriptionTemplate: ${condition.meta_description_template || ''}

Respond in this exact JSON format:
{
  "name": "translated name",
  "display_name": "translated display name",
  "short_description": "translated short description",
  "meta_title": "translated meta title template",
  "meta_description": "translated meta description template"
}`,
        }],
      });

      const responseText = response.content[0].type === 'text' ? response.content[0].text.trim() : '{}';
      let jsonStr = responseText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
      jsonStr = jsonStr.replace(/[\x00-\x1F\x7F]/g, ' ');

      const translatedData = JSON.parse(jsonStr);

      const { error: insertError } = await supabase.from('condition_translations').insert({
        condition_id: condition.id,
        language: LANG,
        slug: generateSlug(translatedData.name),
        name: translatedData.name,
        display_name: translatedData.display_name,
        short_description: translatedData.short_description,
        meta_title: translatedData.meta_title,
        meta_description: translatedData.meta_description,
      });

      if (insertError) {
        if (insertError.code === '23505') {
          console.log(`  ⏭️ Already exists`);
        } else {
          console.error(`  ❌ Save failed: ${insertError.message}`);
          failed++;
        }
      } else {
        console.log(`  ✅ Saved`);
        translated++;
      }

      await new Promise(r => setTimeout(r, 200));
    } catch (error: any) {
      console.error(`  ❌ Failed: ${error.message}`);
      failed++;
    }
  }

  console.log(`\n✅ Conditions: ${translated} translated, ${skipped} skipped, ${failed} failed`);
  return { translated, skipped, failed };
}

async function translateGlossary(
  supabase: ReturnType<typeof createClient>,
  client: Anthropic,
  limit?: number,
  offset?: number
) {
  console.log('\n📖 Translating glossary to German...\n');

  const { data: existing } = await supabase
    .from('glossary_translations')
    .select('term_id')
    .eq('language', LANG);
  
  const existingIds = new Set(existing?.map(e => e.term_id) || []);

  let query = supabase
    .from('kb_glossary')
    .select('id, term, definition, short_definition')
    .order('term');

  if (offset !== undefined && limit !== undefined) {
    query = query.range(offset, offset + limit - 1);
  } else if (limit) {
    query = query.limit(limit);
  }

  const { data: terms, error } = await query;

  if (error) {
    console.error('❌ Failed to fetch glossary terms:', error);
    return { translated: 0, skipped: 0, failed: 0 };
  }

  const toTranslate = terms?.filter(t => !existingIds.has(t.id)) || [];
  const skipped = (terms?.length || 0) - toTranslate.length;

  console.log(`Found ${terms?.length} terms, ${skipped} already translated, ${toTranslate.length} to translate\n`);

  let translated = 0;
  let failed = 0;

  for (const term of toTranslate) {
    console.log(`🔄 [${translated + 1}/${toTranslate.length}] ${term.term}`);

    try {
      const response = await client.messages.create({
        model: MODEL,
        max_tokens: 1024,
        messages: [{
          role: 'user',
          content: `${TRANSLATION_CONTEXT}

Translate this glossary term from English to ${LANG_NAME}:

Term: ${term.term}
Definition: ${term.definition}
Simple Definition: ${term.short_definition || 'N/A'}

Respond in this exact JSON format:
{
  "term": "translated term",
  "definition": "translated definition",
  "simple_definition": "translated simple definition or null"
}`,
        }],
      });

      const responseText = response.content[0].type === 'text' ? response.content[0].text.trim() : '{}';
      let jsonStr = responseText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
      jsonStr = jsonStr.replace(/[\x00-\x1F\x7F]/g, ' ');

      const translatedData = JSON.parse(jsonStr);

      const { error: insertError } = await supabase.from('glossary_translations').insert({
        term_id: term.id,
        language: LANG,
        slug: generateSlug(translatedData.term),
        term: translatedData.term,
        definition: translatedData.definition,
        simple_definition: translatedData.simple_definition || null,
      });

      if (insertError) {
        if (insertError.code === '23505') {
          console.log(`  ⏭️ Already exists`);
        } else {
          console.error(`  ❌ Save failed: ${insertError.message}`);
          failed++;
        }
      } else {
        console.log(`  ✅ Saved`);
        translated++;
      }

      await new Promise(r => setTimeout(r, 200));
    } catch (error: any) {
      console.error(`  ❌ Failed: ${error.message}`);
      failed++;
    }
  }

  console.log(`\n✅ Glossary: ${translated} translated, ${skipped} skipped, ${failed} failed`);
  return { translated, skipped, failed };
}

async function translateArticles(
  supabase: ReturnType<typeof createClient>,
  client: Anthropic,
  limit?: number,
  offset?: number
) {
  console.log('\n📄 Translating articles to German...\n');

  const { data: existing } = await supabase
    .from('article_translations')
    .select('article_id')
    .eq('language', LANG);
  
  const existingIds = new Set(existing?.map(e => e.article_id) || []);

  let query = supabase
    .from('kb_articles')
    .select('id, slug, title, content, meta_description')
    .eq('status', 'published')
    .order('updated_at', { ascending: false });

  if (offset !== undefined && limit !== undefined) {
    query = query.range(offset, offset + limit - 1);
  } else if (limit) {
    query = query.limit(limit);
  }

  const { data: articles, error } = await query;

  if (error) {
    console.error('❌ Failed to fetch articles:', error);
    return { translated: 0, skipped: 0, failed: 0 };
  }

  const toTranslate = articles?.filter(a => !existingIds.has(a.id)) || [];
  const skipped = (articles?.length || 0) - toTranslate.length;

  console.log(`Found ${articles?.length} articles, ${skipped} already translated, ${toTranslate.length} to translate\n`);

  let translated = 0;
  let failed = 0;

  for (const article of toTranslate) {
    console.log(`🔄 [${translated + 1}/${toTranslate.length}] ${article.slug}`);

    try {
      // Translate title
      const titleResponse = await client.messages.create({
        model: MODEL,
        max_tokens: 256,
        messages: [{
          role: 'user',
          content: `${TRANSLATION_CONTEXT}

Translate this article title from English to ${LANG_NAME}:

${article.title}

Provide ONLY the translated title:`,
        }],
      });

      const translatedTitle = titleResponse.content[0].type === 'text'
        ? titleResponse.content[0].text.trim()
        : article.title;

      // Translate content
      const contentResponse = await client.messages.create({
        model: MODEL,
        max_tokens: 4096,
        messages: [{
          role: 'user',
          content: `${TRANSLATION_CONTEXT}

Translate this article content (in Markdown format) from English to ${LANG_NAME}:

${article.content}

Provide ONLY the translated markdown content:`,
        }],
      });

      const translatedContent = contentResponse.content[0].type === 'text'
        ? contentResponse.content[0].text.trim()
        : article.content;

      // Translate meta description
      let translatedMeta = article.meta_description;
      if (article.meta_description) {
        const metaResponse = await client.messages.create({
          model: MODEL,
          max_tokens: 256,
          messages: [{
            role: 'user',
            content: `${TRANSLATION_CONTEXT}

Translate this SEO meta description from English to ${LANG_NAME} (keep under 160 characters):

${article.meta_description}

Provide ONLY the translated meta description:`,
          }],
        });

        translatedMeta = metaResponse.content[0].type === 'text'
          ? metaResponse.content[0].text.trim()
          : article.meta_description;
      }

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
        console.error(`  ❌ Save failed: ${insertError.message}`);
        failed++;
      } else {
        console.log(`  ✅ Saved`);
        translated++;
      }

      await new Promise(r => setTimeout(r, 500));
    } catch (error: any) {
      console.error(`  ❌ Failed: ${error.message}`);
      failed++;
    }
  }

  console.log(`\n✅ Articles: ${translated} translated, ${skipped} skipped, ${failed} failed`);
  return { translated, skipped, failed };
}

async function translateResearch(
  supabase: ReturnType<typeof createClient>,
  client: Anthropic,
  limit?: number,
  offset?: number
) {
  console.log('\n🔬 Translating research summaries to German...\n');

  const { data: existing } = await supabase
    .from('research_translations')
    .select('research_id')
    .eq('language', LANG);
  
  const existingIds = new Set(existing?.map(e => e.research_id) || []);

  let query = supabase
    .from('kb_research_queue')
    .select('id, title, plain_summary')
    .eq('status', 'approved')
    .not('plain_summary', 'is', null)
    .order('quality_score', { ascending: false });

  if (offset !== undefined && limit !== undefined) {
    query = query.range(offset, offset + limit - 1);
  } else if (limit) {
    query = query.limit(limit);
  }

  const { data: studies, error } = await query;

  if (error) {
    console.error('❌ Failed to fetch research:', error);
    return { translated: 0, skipped: 0, failed: 0 };
  }

  const toTranslate = studies?.filter(s => !existingIds.has(s.id)) || [];
  const skipped = (studies?.length || 0) - toTranslate.length;

  console.log(`Found ${studies?.length} studies, ${skipped} already translated, ${toTranslate.length} to translate\n`);

  let translated = 0;
  let failed = 0;

  for (const study of toTranslate) {
    const shortTitle = study.title?.substring(0, 50) || 'Untitled';
    console.log(`🔄 [${translated + 1}/${toTranslate.length}] ${shortTitle}...`);

    try {
      const response = await client.messages.create({
        model: MODEL,
        max_tokens: 1024,
        messages: [{
          role: 'user',
          content: `${TRANSLATION_CONTEXT}

Translate this research study plain-language summary from English to ${LANG_NAME}:

${study.plain_summary}

Provide ONLY the translated summary:`,
        }],
      });

      const translatedSummary = response.content[0].type === 'text'
        ? response.content[0].text.trim()
        : study.plain_summary;

      const { error: insertError } = await supabase.from('research_translations').insert({
        research_id: study.id,
        language: LANG,
        plain_summary: translatedSummary,
      });

      if (insertError) {
        console.error(`  ❌ Save failed: ${insertError.message}`);
        failed++;
      } else {
        console.log(`  ✅ Saved`);
        translated++;
      }

      await new Promise(r => setTimeout(r, 300));
    } catch (error: any) {
      console.error(`  ❌ Failed: ${error.message}`);
      failed++;
    }
  }

  console.log(`\n✅ Research: ${translated} translated, ${skipped} skipped, ${failed} failed`);
  return { translated, skipped, failed };
}

async function main() {
  const args = process.argv.slice(2);
  const typeArg = args.find(a => a.startsWith('--type='));
  const limitArg = args.find(a => a.startsWith('--limit='));
  const offsetArg = args.find(a => a.startsWith('--offset='));
  const statusOnly = args.includes('--status');

  const contentType = typeArg?.replace('--type=', '') || 'all';
  const limit = limitArg ? parseInt(limitArg.replace('--limit=', ''), 10) : undefined;
  const offset = offsetArg ? parseInt(offsetArg.replace('--offset=', ''), 10) : undefined;

  // Check environment variables
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error(`
❌ Missing Supabase environment variables!

Please add SUPABASE_SERVICE_ROLE_KEY to your .env.local file.
Get it from: https://app.supabase.com/project/bvrdryvgqarffgdujmjz/settings/api

Add this line to .env.local:
SUPABASE_SERVICE_ROLE_KEY="eyJ..."
`);
    process.exit(1);
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('❌ Missing ANTHROPIC_API_KEY environment variable');
    process.exit(1);
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  console.log('\n🇩🇪 German Translation for cbd.de\n');
  console.log('═'.repeat(50));

  // Show current status
  await getTranslationStats(supabase);

  if (statusOnly) {
    return;
  }

  if (limit) console.log(`📊 Batch size: ${limit}`);
  if (offset !== undefined) console.log(`⏭️ Starting from offset: ${offset}`);

  const results: Record<string, { translated: number; skipped: number; failed: number }> = {};

  if (contentType === 'all' || contentType === 'conditions') {
    results.conditions = await translateConditions(supabase, anthropic, limit, offset);
  }

  if (contentType === 'all' || contentType === 'glossary') {
    results.glossary = await translateGlossary(supabase, anthropic, limit, offset);
  }

  if (contentType === 'all' || contentType === 'articles') {
    results.articles = await translateArticles(supabase, anthropic, limit, offset);
  }

  if (contentType === 'all' || contentType === 'research') {
    results.research = await translateResearch(supabase, anthropic, limit, offset);
  }

  // Final summary
  console.log('\n' + '═'.repeat(50));
  console.log('🎉 Translation Complete!\n');
  
  let totalTranslated = 0;
  let totalFailed = 0;
  
  for (const [type, result] of Object.entries(results)) {
    console.log(`${type}: ${result.translated} new, ${result.skipped} skipped, ${result.failed} failed`);
    totalTranslated += result.translated;
    totalFailed += result.failed;
  }

  console.log(`\nTotal: ${totalTranslated} new translations, ${totalFailed} failures`);

  // Show updated status
  await getTranslationStats(supabase);
}

main().catch(console.error);
