import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const { data } = await supabase.from('kb_articles').select('slug, content').eq('slug', 'how-much-cbd-for-birds').single();
const lower = (data.content || '').toLowerCase();

console.log('Checking patterns:');
console.log('  "## frequently asked questions":', lower.includes('## frequently asked questions'));
console.log('  "## faq":', lower.includes('## faq'));
console.log('  "### frequently asked questions":', lower.includes('### frequently asked questions'));
console.log('  "### faq":', lower.includes('### faq'));
console.log('  "## common questions":', lower.includes('## common questions'));

// What about just "common questions"?
console.log('\n  "common questions" anywhere:', lower.includes('common questions'));

// Find context
const idx = lower.indexOf('common');
if (idx > -1) {
  console.log('\nContext around "common":');
  console.log(data.content.substring(idx - 20, idx + 80));
}
