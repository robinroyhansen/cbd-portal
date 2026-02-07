#!/usr/bin/env node
/**
 * Batch article translation helper for CBD Portal
 * 
 * Usage: Called by coder agents with article data piped in.
 * The coder reads English articles, translates them, and this script inserts into Supabase.
 * 
 * Environment:
 *   SUPABASE_URL, SUPABASE_SERVICE_KEY
 * 
 * Input (stdin): JSON array of translated articles:
 * [{ article_id, language, title, slug, content, excerpt, meta_title, meta_description }]
 */

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://bvrdryvgqarffgdujmjz.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2cmRyeXZncWFyZmZnZHVqbWp6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzkwMTc5NywiZXhwIjoyMDgzNDc3Nzk3fQ.SmqoTgGp3J6JEOuOiEl7IMd8whWz4qAvQABM7AUc7kY';

async function insertTranslations(translations) {
  const results = { success: 0, failed: 0, errors: [] };
  
  // Insert in batches of 10
  for (let i = 0; i < translations.length; i += 10) {
    const batch = translations.slice(i, i + 10).map(t => ({
      article_id: t.article_id,
      language: t.language,
      title: t.title,
      slug: t.slug,
      content: t.content,
      excerpt: t.excerpt || null,
      meta_title: t.meta_title || null,
      meta_description: t.meta_description || null,
      translated_at: new Date().toISOString(),
      translation_quality: 'machine'
    }));

    const resp = await fetch(`${SUPABASE_URL}/rest/v1/article_translations`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify(batch)
    });

    if (resp.ok) {
      results.success += batch.length;
    } else {
      const err = await resp.text();
      results.failed += batch.length;
      results.errors.push({ batch: i, error: err });
    }
  }
  
  return results;
}

async function insertConditionTranslations(translations) {
  const results = { success: 0, failed: 0, errors: [] };
  
  for (let i = 0; i < translations.length; i += 10) {
    const batch = translations.slice(i, i + 10).map(t => ({
      condition_id: t.condition_id,
      language: t.language,
      name: t.name,
      slug: t.slug,
      display_name: t.display_name || null,
      short_description: t.short_description || null,
      meta_title: t.meta_title || null,
      meta_description: t.meta_description || null
    }));

    const resp = await fetch(`${SUPABASE_URL}/rest/v1/condition_translations`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify(batch)
    });

    if (resp.ok) {
      results.success += batch.length;
    } else {
      const err = await resp.text();
      results.failed += batch.length;
      results.errors.push({ batch: i, error: err });
    }
  }
  
  return results;
}

async function insertGlossaryTranslations(translations) {
  const results = { success: 0, failed: 0, errors: [] };
  
  for (let i = 0; i < translations.length; i += 10) {
    const batch = translations.slice(i, i + 10).map(t => ({
      glossary_id: t.glossary_id,
      language: t.language,
      term: t.term,
      slug: t.slug,
      definition: t.definition,
      simple_definition: t.simple_definition || null
    }));

    const resp = await fetch(`${SUPABASE_URL}/rest/v1/glossary_translations`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify(batch)
    });

    if (resp.ok) {
      results.success += batch.length;
    } else {
      const err = await resp.text();
      results.failed += batch.length;
      results.errors.push({ batch: i, error: err });
    }
  }
  
  return results;
}

// Main: read from stdin or file argument
async function main() {
  const type = process.argv[2] || 'articles'; // articles, conditions, glossary
  
  let input = '';
  process.stdin.setEncoding('utf8');
  for await (const chunk of process.stdin) {
    input += chunk;
  }
  
  const data = JSON.parse(input);
  console.log(`Inserting ${data.length} ${type} translations...`);
  
  let results;
  switch (type) {
    case 'conditions':
      results = await insertConditionTranslations(data);
      break;
    case 'glossary':
      results = await insertGlossaryTranslations(data);
      break;
    default:
      results = await insertTranslations(data);
  }
  
  console.log(`Done: ${results.success} success, ${results.failed} failed`);
  if (results.errors.length) {
    console.error('Errors:', JSON.stringify(results.errors, null, 2));
  }
}

main().catch(console.error);
