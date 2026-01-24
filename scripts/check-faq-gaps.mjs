import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Script's hasFAQ function
function hasFAQ(content) {
  if (content === null || content === undefined) return false;
  const lower = content.toLowerCase();
  return (
    lower.includes('## frequently asked questions') ||
    lower.includes('## faq') ||
    lower.includes('### frequently asked questions') ||
    lower.includes('### faq') ||
    lower.includes('## common questions')
  );
}

const { data } = await supabase.from('kb_articles').select('slug, article_type, content').not('content', 'is', null);

const scriptThinksMissing = data.filter(a => hasFAQ(a.content) === false);
console.log('Script thinks ' + scriptThinksMissing.length + ' are missing FAQ');

// Group by type
const byType = {};
scriptThinksMissing.forEach(a => {
  byType[a.article_type || 'null'] = (byType[a.article_type || 'null'] || 0) + 1;
});
Object.entries(byType).forEach(([t, c]) => console.log('  ' + t + ': ' + c));

if (scriptThinksMissing.length > 0 && scriptThinksMissing.length < 20) {
  console.log('\nAll missing:');
  scriptThinksMissing.forEach(a => console.log('  [' + a.article_type + '] ' + a.slug));
}
