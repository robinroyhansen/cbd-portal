#!/usr/bin/env npx tsx
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

async function main() {
  const { data: conditions } = await supabase
    .from('kb_conditions')
    .select('slug, name, research_count')
    .eq('is_published', true)
    .order('research_count', { ascending: false });

  const { data: articles } = await supabase
    .from('kb_articles')
    .select('condition_slug')
    .not('condition_slug', 'is', null);

  const existingSlugs = new Set(articles?.map(a => a.condition_slug) || []);
  const withArticles = (conditions || []).filter(c => existingSlugs.has(c.slug));
  const needsArticle = (conditions || []).filter(c => !existingSlugs.has(c.slug));

  console.log('Total conditions:', conditions?.length);
  console.log('With articles:', withArticles.length);
  console.log('Need articles:', needsArticle.length);
  console.log('');

  console.log('Conditions with articles:', withArticles.length);
  withArticles.forEach(c => {
    console.log('  ✓ ' + c.slug + ' (' + (c.research_count || 0) + ' studies)');
  });

  console.log('');
  console.log('Conditions needing articles:');
  needsArticle.slice(0, 50).forEach(c => {
    console.log('  ○ ' + c.slug + ' (' + (c.research_count || 0) + ' studies)');
  });
}

main();
