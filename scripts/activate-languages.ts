#!/usr/bin/env npx tsx
/**
 * Activate languages in the kb_languages table
 *
 * Usage:
 *   npx tsx scripts/activate-languages.ts
 */

import { createClient } from '@supabase/supabase-js';

const LANGUAGES_TO_ACTIVATE = [
  'da', // Danish
  'sv', // Swedish
  'no', // Norwegian
  'de', // German
  'nl', // Dutch
  'fi', // Finnish
  'fr', // French
  'it', // Italian
  'de-CH', // Swiss German
  'fr-CH', // Swiss French
  'it-CH', // Swiss Italian
];

async function main() {
  // Check environment variables
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Missing Supabase environment variables');
    console.log('Run: export $(grep -v "^#" .env.local | xargs)');
    process.exit(1);
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  console.log('🌍 Activating languages...\n');

  // First, check what languages exist
  const { data: existingLanguages, error: fetchError } = await supabase
    .from('kb_languages')
    .select('code, name, is_active')
    .order('code');

  if (fetchError) {
    console.error('❌ Failed to fetch languages:', fetchError);
    process.exit(1);
  }

  console.log('Current languages in database:');
  for (const lang of existingLanguages || []) {
    const status = lang.is_active ? '✅' : '⬜';
    console.log(`  ${status} ${lang.code}: ${lang.name}`);
  }

  // Activate the languages
  console.log('\n📝 Activating languages...');

  const { error: updateError } = await supabase
    .from('kb_languages')
    .update({ is_active: true })
    .in('code', LANGUAGES_TO_ACTIVATE);

  if (updateError) {
    console.error('❌ Failed to activate languages:', updateError);
    process.exit(1);
  }

  // Verify activation
  const { data: updatedLanguages } = await supabase
    .from('kb_languages')
    .select('code, name, is_active')
    .eq('is_active', true)
    .order('code');

  console.log('\n✅ Active languages:');
  for (const lang of updatedLanguages || []) {
    console.log(`  ✅ ${lang.code}: ${lang.name}`);
  }

  console.log('\n🎉 Language activation complete!');
}

main().catch(console.error);
