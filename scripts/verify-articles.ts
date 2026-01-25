import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function verify() {
  const { data, error } = await supabase
    .from('kb_articles')
    .select('slug, title, status, language, condition_slug, created_at')
    .in('slug', [
      'cbd-and-exam-anxiety',
      'cbd-and-performance-anxiety',
      'cbd-and-travel-anxiety',
      'cbd-and-phone-anxiety',
      'cbd-and-interview-anxiety',
      'cbd-and-healthcare-anxiety',
      'cbd-and-dental-anxiety',
      'cbd-and-dating-anxiety',
      'cbd-and-social-events',
      'cbd-and-family-gatherings',
      'cbd-and-holiday-stress',
      'cbd-and-moving-stress'
    ])
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('=== VERIFIED ARTICLES IN DATABASE ===\n');
  data.forEach((a, i) => {
    console.log(`${i+1}. ${a.slug}`);
    console.log(`   Title: ${a.title}`);
    console.log(`   Status: ${a.status} | Language: ${a.language}`);
    console.log(`   Condition: ${a.condition_slug}`);
    console.log('');
  });
  console.log(`Total: ${data.length} articles`);
}

verify();
