#!/usr/bin/env node
/**
 * Insert a single translation into Supabase
 * Usage: echo '{"article_id":"...","language":"fi","title":"...","slug":"...","content":"...","excerpt":"...","meta_title":"...","meta_description":"..."}' | node scripts/insert-translation.mjs
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
function loadEnv() {
  const envContent = readFileSync(join(__dirname, '..', '.env.local'), 'utf-8');
  for (const line of envContent.split('\n')) {
    const m = line.match(/^([^=]+)=(.*)$/);
    if (m) { let v = m[2].trim(); if ((v[0]==='"'||v[0]==="'") && v[0]===v[v.length-1]) v=v.slice(1,-1); process.env[m[1].trim()]=v; }
  }
}
loadEnv();

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

let input = '';
process.stdin.setEncoding('utf8');
for await (const chunk of process.stdin) input += chunk;

const translations = JSON.parse(input);
const items = Array.isArray(translations) ? translations : [translations];

const toInsert = items.map(t => ({
  article_id: t.article_id,
  language: t.language,
  title: t.title,
  slug: t.slug,
  content: t.content,
  excerpt: t.excerpt || null,
  meta_title: t.meta_title || null,
  meta_description: t.meta_description || null,
  translation_quality: 'ai-sonnet',
  translated_at: new Date().toISOString(),
}));

const { error } = await sb.from('article_translations').upsert(toInsert, {
  onConflict: 'article_id,language',
  ignoreDuplicates: false,
});

if (error) {
  console.error('Insert error:', JSON.stringify(error));
  process.exit(1);
} else {
  console.log(`✓ Inserted ${toInsert.length} translation(s)`);
}
