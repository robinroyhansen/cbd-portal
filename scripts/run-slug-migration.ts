/**
 * Run the slug translations migration
 * Usage: npx tsx scripts/run-slug-migration.ts
 *
 * NOTE: This script generates slugs for existing translations AFTER the
 * schema changes have been applied via Supabase Dashboard SQL Editor.
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

function generateSlug(text: string): string {
  // Replace Nordic characters
  const normalized = text
    .replace(/[æÆ]/g, 'a')
    .replace(/[øØ]/g, 'o')
    .replace(/[åÅ]/g, 'a')
    .replace(/[äÄ]/g, 'a')
    .replace(/[öÖ]/g, 'o')
    .replace(/[üÜ]/g, 'u');

  // Convert to lowercase, remove special chars, replace spaces with hyphens
  return normalized
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

async function checkColumnExists(table: string, column: string): Promise<boolean> {
  try {
    const { error } = await supabase.from(table).select(column).limit(1);
    return !error || !error.message.includes('does not exist');
  } catch {
    return false;
  }
}

async function runMigration() {
  console.log('Running slug translations migration...\n');

  // Step 1: Check if columns exist
  console.log('1. Checking if slug columns exist...');

  const condColExists = await checkColumnExists('condition_translations', 'slug');
  const glossColExists = await checkColumnExists('glossary_translations', 'slug');

  if (!condColExists || !glossColExists) {
    console.log('\n' + '='.repeat(70));
    console.log('MANUAL STEP REQUIRED!');
    console.log('='.repeat(70));
    console.log('\nThe slug columns do not exist yet. Please run this SQL in the');
    console.log('Supabase Dashboard SQL Editor:');
    console.log('\nhttps://supabase.com/dashboard/project/bvrdryvgqarffgdujmjz/sql');
    console.log('\n--- COPY FROM HERE ---\n');
    console.log(`-- Add slug columns to translation tables
ALTER TABLE condition_translations ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE glossary_translations ADD COLUMN IF NOT EXISTS slug TEXT;

-- Create indexes for slug lookups
CREATE INDEX IF NOT EXISTS idx_condition_translations_slug ON condition_translations(slug) WHERE slug IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_condition_translations_slug_lang ON condition_translations(slug, language) WHERE slug IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_glossary_translations_slug ON glossary_translations(slug) WHERE slug IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_glossary_translations_slug_lang ON glossary_translations(slug, language) WHERE slug IS NOT NULL;
`);
    console.log('\n--- END COPY ---\n');
    console.log('After running the SQL, re-run this script to generate the slugs.');
    console.log('='.repeat(70) + '\n');
    process.exit(1);
  }

  console.log('   condition_translations.slug: ✓ exists');
  console.log('   glossary_translations.slug: ✓ exists');

  // Step 2: Generate slugs for existing Danish condition translations
  console.log('\n2. Generating slugs for Danish condition translations...');
  const { data: conditions, error: condErr } = await supabase
    .from('condition_translations')
    .select('id, name')
    .eq('language', 'da')
    .is('slug', null)
    .not('name', 'is', null);

  if (condErr) {
    console.error('   Error fetching conditions:', condErr.message);
  } else if (conditions && conditions.length > 0) {
    let updated = 0;
    for (const cond of conditions) {
      const slug = generateSlug(cond.name);
      const { error: updateErr } = await supabase
        .from('condition_translations')
        .update({ slug })
        .eq('id', cond.id);

      if (!updateErr) updated++;
    }
    console.log(`   Generated ${updated} slugs for conditions`);
  } else {
    console.log('   All conditions already have slugs (or no Danish translations exist)');
  }

  // Step 3: Generate slugs for existing Danish glossary translations
  console.log('\n3. Generating slugs for Danish glossary translations...');
  const { data: glossary, error: glossErr } = await supabase
    .from('glossary_translations')
    .select('id, term')
    .eq('language', 'da')
    .is('slug', null)
    .not('term', 'is', null);

  if (glossErr) {
    console.error('   Error fetching glossary:', glossErr.message);
  } else if (glossary && glossary.length > 0) {
    let updated = 0;
    for (const term of glossary) {
      const slug = generateSlug(term.term);
      const { error: updateErr } = await supabase
        .from('glossary_translations')
        .update({ slug })
        .eq('id', term.id);

      if (!updateErr) updated++;
    }
    console.log(`   Generated ${updated} slugs for glossary terms`);
  } else {
    console.log('   All glossary terms already have slugs (or no Danish translations exist)');
  }

  // Step 4: Verify results
  console.log('\n4. Verifying results...');

  const { count: condCount } = await supabase
    .from('condition_translations')
    .select('*', { count: 'exact', head: true })
    .eq('language', 'da')
    .not('slug', 'is', null);

  const { count: glossCount } = await supabase
    .from('glossary_translations')
    .select('*', { count: 'exact', head: true })
    .eq('language', 'da')
    .not('slug', 'is', null);

  console.log(`   Conditions with Danish slugs: ${condCount || 0}`);
  console.log(`   Glossary terms with Danish slugs: ${glossCount || 0}`);

  // Show some examples
  const { data: examples } = await supabase
    .from('condition_translations')
    .select('name, slug')
    .eq('language', 'da')
    .not('slug', 'is', null)
    .limit(5);

  if (examples && examples.length > 0) {
    console.log('\n   Example condition slugs:');
    examples.forEach(ex => {
      console.log(`     "${ex.name}" → "${ex.slug}"`);
    });
  }

  console.log('\n✓ Migration complete!');
}

runMigration().catch(console.error);
