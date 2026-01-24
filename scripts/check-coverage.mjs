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
  .select('article_type, content')
  .not('content', 'is', null);

let total = 0, hasMyTake = 0;
const byType = {};

articles.forEach(a => {
  total++;
  const type = a.article_type || 'unknown';
  if (!byType[type]) byType[type] = { total: 0, has: 0 };
  byType[type].total++;

  if (a.content?.toLowerCase().includes('## my take')) {
    hasMyTake++;
    byType[type].has++;
  }
});

console.log('\n🎉 FINAL MY TAKE COVERAGE\n');
console.log(`Total: ${hasMyTake}/${total} articles (${Math.round(hasMyTake/total*100)}%)`);
console.log('\nBy article type:');
Object.entries(byType).sort((a, b) => b[1].total - a[1].total).forEach(([type, stats]) => {
  const pct = Math.round(stats.has / stats.total * 100);
  console.log(`  ${type}: ${stats.has}/${stats.total} (${pct}%)`);
});
