import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
function loadEnv() {
  const envContent = readFileSync(join(__dirname, '../.env.local'), 'utf8');
  const envVars = {};
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      let value = match[2].trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
      envVars[match[1].trim()] = value;
    }
  });
  return envVars;
}
const env = loadEnv();
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  // 1. Check categories table
  const { data: categories, error: catErr } = await supabase.from('kb_categories')
    .select('*')
    .order('name');

  console.log('=== CATEGORIES ===');
  if (catErr) {
    console.log('Error:', catErr);
  } else {
    categories?.forEach(c => {
      console.log(`ID: ${c.id} | Slug: ${c.slug} | Name: ${c.name}`);
    });
  }

  // 2. Check if any articles have category_id set
  const { data: articlesWithCategory } = await supabase.from('kb_articles')
    .select('slug, title, category_id')
    .not('category_id', 'is', null);

  console.log('\n=== ARTICLES WITH CATEGORY_ID SET ===');
  console.log(`Count: ${articlesWithCategory?.length || 0}`);
  articlesWithCategory?.slice(0, 10).forEach(a => {
    console.log(`- ${a.slug} (category_id: ${a.category_id})`);
  });

  // 3. Check cannabinoid articles specifically
  const cannabinoidSlugs = [
    'what-is-cbd', 'what-is-thc', 'what-is-cbg', 'what-is-cbn',
    'what-is-cbc', 'what-is-cbda', 'what-is-thca', 'what-is-thcv',
    'what-is-delta-8-thc', 'what-are-cannabinoids'
  ];

  console.log('\n=== CANNABINOID ARTICLES ===');
  for (const slug of cannabinoidSlugs) {
    const { data: article } = await supabase.from('kb_articles')
      .select('slug, title, category_id, article_type, status')
      .eq('slug', slug)
      .single();

    if (article) {
      console.log(`${article.slug}: category_id=${article.category_id}, type=${article.article_type}, status=${article.status}`);
    } else {
      console.log(`${slug}: NOT FOUND`);
    }
  }

  // 4. Find the cannabinoids category ID
  const { data: cannabinoidsCat } = await supabase.from('kb_categories')
    .select('id, slug')
    .eq('slug', 'cannabinoids')
    .single();

  console.log('\n=== CANNABINOIDS CATEGORY ===');
  console.log(cannabinoidsCat);

  // 5. Count articles that should be in cannabinoids
  const { data: scienceArticles } = await supabase.from('kb_articles')
    .select('slug, category_id')
    .eq('article_type', 'science');

  console.log('\n=== ALL SCIENCE ARTICLES ===');
  scienceArticles?.forEach(a => {
    console.log(`${a.slug}: category_id=${a.category_id}`);
  });
}
main();
