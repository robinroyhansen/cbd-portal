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
  // Get the guides category
  const { data: guidesCategory } = await supabase.from('kb_categories')
    .select('*')
    .eq('slug', 'guides')
    .single();

  console.log('=== GUIDES CATEGORY ===');
  console.log(guidesCategory);

  if (guidesCategory) {
    // Get articles in this category
    const { data: articles } = await supabase.from('kb_articles')
      .select('slug, title, article_type')
      .eq('category_id', guidesCategory.id)
      .order('title');

    console.log(`\n=== ARTICLES IN GUIDES CATEGORY (${articles?.length || 0}) ===`);
    articles?.forEach(a => console.log(`- ${a.slug} (${a.article_type})`));
  }

  // Also check for guide-type articles that might not be linked
  console.log('\n=== ALL GUIDE-TYPE ARTICLES ===');
  const guideTypes = ['educational-guide', 'application-guide', 'pillar'];

  for (const type of guideTypes) {
    const { data: typeArticles } = await supabase.from('kb_articles')
      .select('slug, title, category_id')
      .eq('article_type', type)
      .order('title');

    console.log(`\n${type} (${typeArticles?.length || 0}):`);
    typeArticles?.forEach(a => console.log(`  - ${a.slug} | category_id: ${a.category_id}`));
  }
}
main();
