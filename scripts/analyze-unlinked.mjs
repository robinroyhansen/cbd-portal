import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function analyze() {
  // Get all articles
  const { data: articles } = await supabase
    .from('kb_articles')
    .select('id, title, slug, condition_slug')
    .eq('status', 'published');

  console.log('Total published articles:', articles.length);

  const linked = articles.filter(a => a.condition_slug);
  const unlinked = articles.filter(a => !a.condition_slug);

  console.log('Linked to conditions:', linked.length);
  console.log('Not linked:', unlinked.length);

  // Show unlinked articles that look like condition articles
  console.log('\n--- Unlinked articles with "CBD for" or "CBD and" in title ---');
  const cbdFor = unlinked.filter(a =>
    a.title.toLowerCase().includes('cbd for') ||
    a.title.toLowerCase().includes('cbd and')
  );
  console.log('Count:', cbdFor.length);
  cbdFor.slice(0, 50).forEach(a => console.log(' ', a.title));

  // Get conditions to see what we're matching against
  const { data: conditions } = await supabase
    .from('kb_conditions')
    .select('slug, name, display_name');

  console.log('\n--- Available conditions ---');
  conditions.forEach(c => console.log(`  ${c.slug}: ${c.display_name || c.name}`));
}

analyze();
