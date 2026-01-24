import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const { data } = await supabase
  .from('kb_articles')
  .select('article_type, slug, content')
  .not('content', 'is', null);

const missingMyTake = data.filter(a => a.content && !a.content.includes('## My Take'));
const missingFAQ = data.filter(a => a.content && !a.content.includes('## FAQ') && !a.content.includes('## Frequently Asked'));

console.log('Articles missing My Take: ' + missingMyTake.length);
const byType1 = {};
missingMyTake.forEach(a => {
  byType1[a.article_type || 'null'] = (byType1[a.article_type || 'null'] || 0) + 1;
});
Object.entries(byType1).forEach(([t, c]) => console.log('  ' + t + ': ' + c));

console.log('\nArticles missing FAQ: ' + missingFAQ.length);
const byType2 = {};
missingFAQ.forEach(a => {
  byType2[a.article_type || 'null'] = (byType2[a.article_type || 'null'] || 0) + 1;
});
Object.entries(byType2).forEach(([t, c]) => console.log('  ' + t + ': ' + c));

// Sample
if (missingMyTake.length > 0) {
  console.log('\nSample missing My Take:');
  missingMyTake.slice(0, 5).forEach(a => console.log('  [' + a.article_type + '] ' + a.slug));
}
