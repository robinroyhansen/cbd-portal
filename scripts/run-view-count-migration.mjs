import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// Read env file
const envContent = readFileSync('.env.local', 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length) {
    let value = valueParts.join('=').trim();
    // Remove surrounding quotes
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    env[key.trim()] = value;
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
  console.log('Running view_count migration...\n');

  // Step 1: Check if column exists
  const { data: columns, error: colError } = await supabase
    .from('kb_glossary')
    .select('view_count')
    .limit(1);

  if (colError && colError.message.includes('view_count')) {
    console.log('Column does not exist, need to add via SQL Editor');
    console.log('\nPlease run this SQL in Supabase Dashboard > SQL Editor:\n');
    console.log(`
ALTER TABLE kb_glossary ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;
CREATE INDEX IF NOT EXISTS idx_glossary_view_count ON kb_glossary(view_count DESC);
    `);
    return;
  }

  if (!colError) {
    console.log('✓ view_count column already exists!');

    // Check current state
    const { data: topTerms } = await supabase
      .from('kb_glossary')
      .select('term, view_count')
      .order('view_count', { ascending: false })
      .limit(5);

    console.log('\nTop 5 terms by view count:');
    topTerms?.forEach((t, i) => {
      console.log(`  ${i + 1}. ${t.term}: ${t.view_count || 0} views`);
    });

    // Initialize any null values to 0
    const { error: updateError } = await supabase
      .from('kb_glossary')
      .update({ view_count: 0 })
      .is('view_count', null);

    if (!updateError) {
      console.log('\n✓ Initialized null view_counts to 0');
    }

    console.log('\n✓ Migration complete!');
  }
}

runMigration().catch(console.error);
