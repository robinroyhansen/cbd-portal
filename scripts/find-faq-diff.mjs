import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Script's hasFAQ (more strict)
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

// Audit's hasFAQ (more lenient)
function auditHasFAQ(content) {
  if (!content) return false;
  const c = content.toLowerCase();
  return c.includes('## faq') || c.includes('frequently asked');
}

const { data: articles } = await supabase
  .from('kb_articles')
  .select('slug, article_type, content')
  .not('content', 'is', null)
  .limit(2000);

let scriptYesAuditNo = [];
let scriptNoAuditYes = [];

for (const a of articles) {
  const scriptSays = scriptHasFAQ(a.content);
  const auditSays = auditHasFAQ(a.content);
  
  if (scriptSays && !auditSays) {
    scriptYesAuditNo.push(a.slug);
  }
  if (!scriptSays && auditSays) {
    scriptNoAuditYes.push(a.slug);
  }
}

console.log('Total articles: ' + articles.length);
console.log('\nScript says YES but Audit says NO: ' + scriptYesAuditNo.length);
if (scriptYesAuditNo.length > 0) {
  console.log('  ' + scriptYesAuditNo.slice(0, 5).join(', '));
}

console.log('\nScript says NO but Audit says YES: ' + scriptNoAuditYes.length);
if (scriptNoAuditYes.length > 0) {
  console.log('  ' + scriptNoAuditYes.slice(0, 10).join(', '));
}
