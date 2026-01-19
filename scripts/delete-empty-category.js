#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseKey || !supabaseUrl) {
  console.error('Missing env vars');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function deleteCategory(slug) {
  // First verify it exists
  const { data: cat, error: fetchError } = await supabase
    .from('kb_categories')
    .select('id, name')
    .eq('slug', slug)
    .single();

  if (fetchError || !cat) {
    console.log('Category not found:', slug);
    return;
  }

  // Check if it has articles
  const { data: articles } = await supabase
    .from('kb_articles')
    .select('id')
    .eq('category_id', cat.id);

  if (articles && articles.length > 0) {
    console.log('ERROR: Category "' + cat.name + '" has ' + articles.length + ' articles, cannot delete');
    return;
  }

  console.log('Deleting empty category: ' + cat.name + ' (' + slug + ')...');

  const { error } = await supabase
    .from('kb_categories')
    .delete()
    .eq('slug', slug);

  if (error) {
    console.log('Delete error:', error.message);
  } else {
    console.log('Successfully deleted category: ' + cat.name);
  }
}

const slug = process.argv[2];
if (!slug) {
  console.log('Usage: node delete-empty-category.js <category-slug>');
  process.exit(1);
}

deleteCategory(slug);
