#!/usr/bin/env node
/**
 * Fetch untranslated articles for a given language
 * Usage: node scripts/fetch-untranslated.mjs --lang=fi --limit=15 [--offset=0]
 * Outputs JSON array of articles to stdout
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

const args = {};
for (const a of process.argv.slice(2)) {
  const [k,v] = a.replace('--','').split('=');
  args[k] = v;
}
const lang = args.lang || 'fi';
const limit = parseInt(args.limit || '15', 10);
const offset = parseInt(args.offset || '0', 10);
const direction = args.dir || 'asc'; // asc or desc

// Paginate through ALL existing translations (Supabase defaults to 1000 rows)
let allExisting = [];
let page = 0;
const pageSize = 1000;
while (true) {
  const { data: batch } = await sb.from('article_translations')
    .select('article_id')
    .eq('language', lang)
    .range(page * pageSize, (page + 1) * pageSize - 1);
  if (!batch || batch.length === 0) break;
  allExisting.push(...batch);
  if (batch.length < pageSize) break;
  page++;
}
const translatedIds = new Set(allExisting.map(t => t.article_id));
console.error(`Found ${translatedIds.size} existing ${lang} translations (${allExisting.length} rows)`);

// Also paginate articles
let allArticles = [];
page = 0;
while (true) {
  const { data: batch } = await sb.from('kb_articles')
    .select('id, title, slug, content, excerpt, meta_title, meta_description')
    .eq('status', 'published')
    .order('created_at', { ascending: direction === 'asc' })
    .range(page * pageSize, (page + 1) * pageSize - 1);
  if (!batch || batch.length === 0) break;
  allArticles.push(...batch);
  if (batch.length < pageSize) break;
  page++;
}
const articles = allArticles;

const untranslated = (articles||[]).filter(a => !translatedIds.has(a.id));
const batch = untranslated.slice(offset, offset + limit);

console.error(`Total untranslated: ${untranslated.length}, returning ${batch.length} (offset ${offset}, limit ${limit})`);
console.log(JSON.stringify(batch, null, 2));
