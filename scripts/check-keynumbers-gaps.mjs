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
  .select('slug, article_type, content')
  .not('content', 'is', null)
  .limit(2000);

const hasKeyNumbers = (c) => c && (c.includes('Key Numbers') || c.includes('key numbers') || c.includes('| Metric |'));

const missing = articles.filter(a => !hasKeyNumbers(a.content));
const byType = {};
missing.forEach(a => {
  byType[a.article_type || 'null'] = (byType[a.article_type || 'null'] || 0) + 1;
});

console.log('Articles missing Key Numbers: ' + missing.length);
Object.entries(byType).sort((a,b) => b[1] - a[1]).forEach(([t, c]) => {
  console.log('  ' + t + ': ' + c);
});
