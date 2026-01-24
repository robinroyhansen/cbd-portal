import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Articles that should actually be linked to tourettes (contains "tourette" or "tic disorder")
const VALID_TOURETTES_KEYWORDS = ['tourette', 'tic disorder', 'tic syndrome'];

async function fixTourettesLinks() {
  console.log('Checking tourettes-linked articles...\n');

  const { data: articles } = await supabase
    .from('kb_articles')
    .select('id, title, slug')
    .eq('condition_slug', 'tourettes');

  console.log(`Found ${articles?.length} articles linked to tourettes\n`);

  let unlinkCount = 0;

  for (const article of articles || []) {
    const titleLower = article.title.toLowerCase();
    const isValidTourettes = VALID_TOURETTES_KEYWORDS.some(kw => titleLower.includes(kw));

    if (!isValidTourettes) {
      console.log(`Unlinking: "${article.title}"`);

      const { error } = await supabase
        .from('kb_articles')
        .update({ condition_slug: null })
        .eq('id', article.id);

      if (!error) unlinkCount++;
    }
  }

  console.log(`\nUnlinked ${unlinkCount} incorrectly matched articles from tourettes`);

  // Verify
  const { data: remaining } = await supabase
    .from('kb_articles')
    .select('title')
    .eq('condition_slug', 'tourettes');

  console.log(`\nRemaining tourettes articles (${remaining?.length}):`);
  remaining?.forEach(a => console.log(`  ${a.title}`));
}

fixTourettesLinks().catch(console.error);
