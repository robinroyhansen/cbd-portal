import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkContent() {
  // Check kb_articles
  const { data: articles, count: articleCount } = await supabase
    .from('kb_articles')
    .select('id, title, slug, status, category_id', { count: 'exact' });

  console.log('\n=== KB_ARTICLES ===');
  console.log('Total articles:', articleCount);

  if (articles && articles.length > 0) {
    const byStatus: Record<string, number> = {};
    articles.forEach(a => {
      byStatus[a.status] = (byStatus[a.status] || 0) + 1;
    });
    console.log('By status:', byStatus);
    console.log('\nSample articles:');
    articles.slice(0, 10).forEach(a => {
      console.log('  -', a.slug, ':', a.title, '[' + a.status + ']');
    });
  }

  // Check kb_categories
  const { data: categories } = await supabase
    .from('kb_categories')
    .select('id, slug, name, article_count')
    .order('article_count', { ascending: false });

  console.log('\n=== KB_CATEGORIES ===');
  if (categories) {
    categories.forEach(c => {
      console.log('  ' + c.slug + ': ' + c.article_count + ' articles');
    });
  }

  // Check condition content
  const { data: conditions } = await supabase
    .from('kb_conditions')
    .select('slug, name, display_name, description')
    .order('display_order')
    .limit(10);

  console.log('\n=== CONDITION CONTENT SAMPLE ===');
  if (conditions) {
    conditions.forEach(c => {
      const hasContent = c.description && c.description.length > 500;
      const name = c.display_name || c.name;
      console.log('  ' + c.slug + ': ' + name + ' - ' + (hasContent ? 'HAS CONTENT' : 'NO CONTENT') + ' (' + (c.description?.length || 0) + ' chars)');
    });
  }

  // Check total conditions with content
  const { data: allConditions } = await supabase
    .from('kb_conditions')
    .select('slug, description');

  if (allConditions) {
    const withContent = allConditions.filter(c => c.description && c.description.length > 500).length;
    console.log('\n=== CONDITION CONTENT SUMMARY ===');
    console.log('Total conditions:', allConditions.length);
    console.log('With content (>500 chars):', withContent);
    console.log('Missing content:', allConditions.length - withContent);
  }
}

checkContent().catch(console.error);
