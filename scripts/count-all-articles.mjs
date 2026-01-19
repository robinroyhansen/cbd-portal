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
  // Get all articles grouped by article_type
  const { data: articles } = await supabase.from('kb_articles')
    .select('article_type, slug, title, status')
    .order('article_type')
    .order('slug');

  // Group by article_type
  const byType = {};
  articles.forEach(a => {
    if (!byType[a.article_type]) byType[a.article_type] = [];
    byType[a.article_type].push(a);
  });

  console.log('=== ARTICLE COUNT BY TYPE ===\n');

  let total = 0;
  for (const [type, items] of Object.entries(byType)) {
    console.log(`${type}: ${items.length} articles`);
    total += items.length;
  }

  console.log(`\nTOTAL: ${total} articles\n`);

  // Get category counts
  const { data: categories } = await supabase.from('kb_categories')
    .select('slug, name');

  console.log('=== CATEGORIES ===');
  for (const cat of categories || []) {
    const { count } = await supabase.from('kb_articles')
      .select('*', { count: 'exact', head: true })
      .eq('category_id', cat.id);
    console.log(`${cat.slug}: ${count || 0} articles`);
  }

  // Get research topics from kb_research_queue
  const { data: topicData } = await supabase.from('kb_research_queue')
    .select('primary_topic')
    .eq('status', 'approved');

  const topicCounts = {};
  topicData?.forEach(r => {
    if (r.primary_topic) {
      topicCounts[r.primary_topic] = (topicCounts[r.primary_topic] || 0) + 1;
    }
  });

  console.log('\n=== RESEARCH BY TOPIC (top 15) ===');
  const sortedTopics = Object.entries(topicCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15);

  for (const [topic, count] of sortedTopics) {
    console.log(`${topic}: ${count} studies`);
  }

  // Get condition articles specifically
  const { data: conditionArticles } = await supabase.from('kb_articles')
    .select('slug')
    .ilike('slug', 'cbd-and-%');

  console.log(`\n=== CONDITION ARTICLES (cbd-and-*) ===`);
  console.log(`Count: ${conditionArticles?.length || 0}`);
  if (conditionArticles?.length > 0) {
    conditionArticles.forEach(a => console.log(`- ${a.slug}`));
  }
}
main();
