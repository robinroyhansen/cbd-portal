/**
 * Quick database check script
 * Run with: node scripts/check-db.mjs
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Parse .env.local manually
const envContent = readFileSync(join(__dirname, '../.env.local'), 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    const key = match[1].trim();
    let value = match[2].trim();
    // Remove quotes if present
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    envVars[key] = value;
  }
});

const SUPABASE_URL = envVars.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = envVars.SUPABASE_SERVICE_ROLE_KEY;

console.log('Connecting to:', SUPABASE_URL);

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing env vars');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function main() {
  console.log('=== DATABASE STATUS CHECK ===\n');

  // Check tables
  const tables = [
    'condition_taxonomy',
    'study_raw_terms',
    'term_mappings',
    'study_conditions',
    'suggested_mappings'
  ];

  console.log('Table Status:');
  for (const table of tables) {
    try {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (error && error.code === '42P01') {
        console.log(`  ${table}: ✗ NOT FOUND`);
      } else if (error) {
        console.log(`  ${table}: ✗ ERROR - ${error.message}`);
      } else {
        console.log(`  ${table}: ✓ ${count} rows`);
      }
    } catch (e) {
      console.log(`  ${table}: ✗ ${e.message}`);
    }
  }

  // Check approved studies
  const { count: approvedCount } = await supabase
    .from('kb_research_queue')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'approved');

  console.log(`\nApproved Studies: ${approvedCount || 0}`);

  // Check raw terms
  const { count: rawTermsCount } = await supabase
    .from('study_raw_terms')
    .select('*', { count: 'exact', head: true });

  if (rawTermsCount > 0) {
    console.log(`Raw Terms: ${rawTermsCount}`);

    // Get unique studies with raw terms
    const { data: studiesWithTerms } = await supabase
      .from('study_raw_terms')
      .select('study_id')
      .limit(10000);

    const uniqueStudies = new Set((studiesWithTerms || []).map(s => s.study_id));
    console.log(`Studies with Raw Terms: ${uniqueStudies.size}`);
  } else {
    console.log('\nNo raw terms found yet.');
    console.log('Raw terms are captured when scanning from OpenAlex, ClinicalTrials.gov, or Europe PMC.');
  }

  // Check study_conditions
  const { count: studyConditionsCount } = await supabase
    .from('study_conditions')
    .select('*', { count: 'exact', head: true });

  console.log(`Study-Condition Relationships: ${studyConditionsCount || 0}`);

  // Top conditions
  const { data: topConditions } = await supabase
    .from('condition_taxonomy')
    .select('name, study_count')
    .gt('study_count', 0)
    .order('study_count', { ascending: false })
    .limit(10);

  if (topConditions && topConditions.length > 0) {
    console.log('\nTop Conditions by Study Count:');
    topConditions.forEach((c, i) => {
      console.log(`  ${i + 1}. ${c.name}: ${c.study_count} studies`);
    });
  }

  console.log('\n=== END ===');
}

main().catch(console.error);
