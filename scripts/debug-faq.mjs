import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function scriptHasFAQ(content) {
  if (!content) return false;
  const lower = content.toLowerCase();
  return (
    lower.includes('## frequently asked questions') ||
    lower.includes('## faq') ||
    lower.includes('### frequently asked questions') ||
    lower.includes('### faq') ||
    lower.includes('## common questions')
  );
}

function auditHasFAQ(content) {
  if (!content) return false;
  const c = content.toLowerCase();
  return c.includes('## faq') || c.includes('frequently asked');
}

const { data } = await supabase.from('kb_articles').select('slug, content').eq('slug', 'how-much-cbd-for-birds').single();
console.log('Article:', data.slug);
console.log('Script says:', scriptHasFAQ(data.content));
console.log('Audit says:', auditHasFAQ(data.content));

// Check content snippet
const content = data.content || '';
console.log('\nContent length:', content.length);
console.log('Has "faq" anywhere:', content.toLowerCase().includes('faq'));
console.log('Has "frequently" anywhere:', content.toLowerCase().includes('frequently'));
