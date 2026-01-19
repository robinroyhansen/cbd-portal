#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseKey || !supabaseUrl) {
  console.error('Missing env vars');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkLinks() {
  // Get all published articles
  const { data: articles, error } = await supabase
    .from('kb_articles')
    .select('id, title, slug, category_id, status')
    .eq('status', 'published');

  if (error) {
    console.log('Error fetching articles:', error.message);
    return;
  }

  console.log('=== ARTICLE LINK CHECK ===');
  console.log('Total published articles:', articles.length);

  // Check for issues
  const issues = [];

  articles.forEach(a => {
    // Check for missing slug
    if (!a.slug || a.slug.trim() === '') {
      issues.push({ type: 'missing_slug', article: a });
    }

    // Check for invalid characters in slug
    if (a.slug && !/^[a-z0-9-]+$/.test(a.slug)) {
      issues.push({ type: 'invalid_slug', article: a, slug: a.slug });
    }

    // Check for missing category
    if (!a.category_id) {
      issues.push({ type: 'missing_category', article: a });
    }
  });

  if (issues.length === 0) {
    console.log('\n✅ All article links are valid!');
  } else {
    console.log('\n❌ Found ' + issues.length + ' issues:\n');
    issues.forEach(i => {
      console.log('Issue: ' + i.type);
      console.log('  Title: ' + i.article.title);
      console.log('  Slug: ' + (i.article.slug || 'MISSING'));
      console.log('');
    });
  }

  // Check for duplicate slugs
  const slugs = articles.map(a => a.slug).filter(Boolean);
  const duplicates = slugs.filter((s, i) => slugs.indexOf(s) !== i);

  if (duplicates.length > 0) {
    console.log('\n❌ Duplicate slugs found:');
    duplicates.forEach(d => console.log('  - ' + d));
  } else {
    console.log('✅ No duplicate slugs');
  }

  // Sample some URLs to verify format
  console.log('\n=== SAMPLE ARTICLE URLS ===');
  articles.slice(0, 10).forEach(a => {
    console.log('  /articles/' + a.slug);
  });
}

checkLinks();
