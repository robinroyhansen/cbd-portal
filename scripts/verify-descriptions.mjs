/**
 * Verify Condition Descriptions
 *
 * Checks that all conditions have proper short descriptions.
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });

async function main() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  console.log('\nVerifying condition descriptions...\n');

  const { data: conditions, error, count } = await supabase
    .from('kb_conditions')
    .select('id, name, slug, description, category', { count: 'exact' })
    .order('category')
    .order('name');

  if (error) {
    console.error('Failed to fetch:', error.message);
    process.exit(1);
  }

  console.log(`Total conditions: ${count}\n`);

  // Check for issues
  let hasHtml = 0;
  let tooLong = 0;
  let empty = 0;
  let good = 0;

  const categories = {};

  for (const c of conditions) {
    if (!c.description) {
      empty++;
    } else if (/<[^>]+>/.test(c.description)) {
      hasHtml++;
      console.log(`  HTML found: ${c.name}`);
    } else if (c.description.length > 250) {
      tooLong++;
      console.log(`  Too long (${c.description.length}): ${c.name}`);
    } else {
      good++;
      categories[c.category] = (categories[c.category] || 0) + 1;
    }
  }

  console.log('\n========================================');
  console.log('VERIFICATION RESULTS');
  console.log('========================================');
  console.log(`  Good descriptions: ${good}/${count}`);
  console.log(`  Empty: ${empty}`);
  console.log(`  Contains HTML: ${hasHtml}`);
  console.log(`  Too long (>250 chars): ${tooLong}`);
  console.log('========================================\n');

  if (good === count) {
    console.log('All conditions have proper descriptions!\n');
  }

  // Show sample descriptions
  console.log('Sample descriptions:\n');

  const samples = [
    conditions.find(c => c.slug === 'anxiety'),
    conditions.find(c => c.slug === 'epilepsy'),
    conditions.find(c => c.slug === 'chronic_pain' || c.slug === 'chronic-pain'),
    conditions.find(c => c.slug === 'sleep'),
    conditions.find(c => c.slug === 'depression')
  ].filter(Boolean);

  for (const s of samples) {
    console.log(`[${s.name}]`);
    console.log(`  ${s.description}`);
    console.log(`  (${s.description?.length || 0} chars)\n`);
  }
}

main().catch(console.error);
