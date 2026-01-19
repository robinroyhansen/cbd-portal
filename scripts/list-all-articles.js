#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseKey || !supabaseUrl) {
  console.error('Missing env vars');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function listAll() {
  const { data: articles } = await supabase.from('kb_articles').select('title, slug, category_id');
  const { data: cats } = await supabase.from('kb_categories').select('*');

  const catMap = {};
  cats.forEach(c => catMap[c.id] = c);

  console.log('=== ALL ARTICLES BY CATEGORY ===\n');

  // Group by category
  const grouped = {};
  articles.forEach(a => {
    const catName = catMap[a.category_id]?.name || 'UNCATEGORIZED';
    if (!grouped[catName]) grouped[catName] = [];
    grouped[catName].push(a.title);
  });

  Object.keys(grouped).sort().forEach(cat => {
    console.log('\n📁 ' + cat + ' (' + grouped[cat].length + ' articles)');
    console.log('-'.repeat(50));
    grouped[cat].forEach(t => console.log('  • ' + t.substring(0, 60)));
  });

  // Show empty categories
  console.log('\n\n=== EMPTY CATEGORIES ===');
  cats.filter(c => !grouped[c.name]).forEach(c => {
    console.log('  ❌ ' + c.name + ' (' + c.slug + ')');
  });
}

listAll();
