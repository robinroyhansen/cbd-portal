import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const { data: articles } = await supabase
  .from('kb_articles')
  .select('slug, content')
  .not('content', 'is', null)
  .limit(2000);

console.log('Total articles: ' + articles.length);

// Check Research Snapshots
const hasSnapshot = articles.filter(a => {
  const c = (a.content || '').toLowerCase();
  return c.includes('research snapshot') || c.includes('studies reviewed') || c.includes('| studies reviewed |');
});
console.log('Research Snapshots: ' + hasSnapshot.length);

// Check Key Numbers
const hasKeyNumbers = articles.filter(a => {
  const c = (a.content || '').toLowerCase();
  return c.includes('key numbers') || c.includes('| metric |');
});
console.log('Key Numbers: ' + hasKeyNumbers.length);
