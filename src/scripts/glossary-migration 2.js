const SUPABASE_URL = 'https://bvrdryvgqarffgdujmjz.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2cmRyeXZncWFyZmZnZHVqbWp6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzkwMTc5NywiZXhwIjoyMDgzNDc3Nzk3fQ.SmqoTgGp3J6JEOuOiEl7IMd8whWz4qAvQABM7AUc7kY';

// Display name mappings for existing terms
const displayNameMappings = {
  // Cannabinoids - abbreviation first
  'cbd': 'CBD (Cannabidiol)',
  'cannabidiol': 'CBD (Cannabidiol)',
  'thc': 'THC (Tetrahydrocannabinol)',
  'tetrahydrocannabinol': 'THC (Tetrahydrocannabinol)',
  'cbg': 'CBG (Cannabigerol)',
  'cannabigerol': 'CBG (Cannabigerol)',
  'cbn': 'CBN (Cannabinol)',
  'cannabinol': 'CBN (Cannabinol)',
  'cbc': 'CBC (Cannabichromene)',
  'cannabichromene': 'CBC (Cannabichromene)',
  'cbda': 'CBDA (Cannabidiolic Acid)',
  'cannabidiolic acid': 'CBDA (Cannabidiolic Acid)',
  'thca': 'THCA (Tetrahydrocannabinolic Acid)',
  'tetrahydrocannabinolic acid': 'THCA (Tetrahydrocannabinolic Acid)',
  'delta-8 thc': 'Delta-8 THC (Δ8-THC)',
  'delta-8-thc': 'Delta-8 THC (Δ8-THC)',
  'delta-9 thc': 'Delta-9 THC (Δ9-THC)',
  'delta-9-thc': 'Delta-9 THC (Δ9-THC)',
  'thcv': 'THCV (Tetrahydrocannabivarin)',
  'tetrahydrocannabivarin': 'THCV (Tetrahydrocannabivarin)',
  'cbdv': 'CBDV (Cannabidivarin)',
  'cannabidivarin': 'CBDV (Cannabidivarin)',

  // Medical/Scientific - abbreviation in parentheses if commonly used
  'certificate of analysis': 'Certificate of Analysis (COA)',
  'coa': 'Certificate of Analysis (COA)',
  'endocannabinoid system': 'Endocannabinoid System (ECS)',
  'ecs': 'Endocannabinoid System (ECS)',
  'cb1 receptor': 'CB1 Receptor',
  'cb1': 'CB1 Receptor',
  'cb2 receptor': 'CB2 Receptor',
  'cb2': 'CB2 Receptor',
  '2-ag': '2-AG (2-Arachidonoylglycerol)',
  '2-arachidonoylglycerol': '2-AG (2-Arachidonoylglycerol)',
  'anandamide': 'Anandamide (AEA)',
  'blood-brain barrier': 'Blood-Brain Barrier (BBB)',
  'cytochrome p450': 'Cytochrome P450 (CYP450)',
  'rso': 'RSO (Rick Simpson Oil)',
  'rick simpson oil': 'RSO (Rick Simpson Oil)',
  'ptsd': 'PTSD (Post-Traumatic Stress Disorder)',
  'post-traumatic stress disorder': 'PTSD (Post-Traumatic Stress Disorder)',
  'multiple sclerosis': 'Multiple Sclerosis (MS)',

  // Product types with abbreviations
  'co2 extraction': 'CO₂ Extraction',
  'supercritical co2 extraction': 'Supercritical CO₂ Extraction',

  // Greek letters for terpenes
  'alpha-pinene': 'α-Pinene (Alpha-Pinene)',
  'beta-pinene': 'β-Pinene (Beta-Pinene)',
  'beta-caryophyllene': 'β-Caryophyllene (Beta-Caryophyllene)',
  'caryophyllene': 'β-Caryophyllene (Beta-Caryophyllene)',
  'alpha-bisabolol': 'α-Bisabolol (Alpha-Bisabolol)',
  'bisabolol': 'α-Bisabolol',
  'beta-ocimene': 'β-Ocimene (Beta-Ocimene)',
  'ocimene': 'Ocimene',
  'humulene': 'α-Humulene',
  'alpha-humulene': 'α-Humulene (Alpha-Humulene)',
};

async function runMigration() {
  console.log('=== Glossary Schema Migration ===\n');

  // Step 1: Execute SQL to add column and drop difficulty
  console.log('Step 1: Running SQL migration via query endpoint...');

  // Use Supabase's SQL execution capability
  const sqlStatements = `
    ALTER TABLE kb_glossary ADD COLUMN IF NOT EXISTS display_name VARCHAR(255);
    ALTER TABLE kb_glossary DROP COLUMN IF EXISTS difficulty;
  `;

  // Try to run via the pg_query RPC function if available
  const rpcResponse = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query: sqlStatements })
  });

  if (!rpcResponse.ok) {
    // RPC function doesn't exist, we need to run SQL directly via Supabase dashboard
    console.log('  RPC function not available. Running SQL via management API...\n');

    // Try the database query endpoint
    const queryResponse = await fetch(`${SUPABASE_URL}/pg/query`, {
      method: 'POST',
      headers: {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query: sqlStatements })
    });

    if (!queryResponse.ok) {
      console.log('  Direct SQL not available via API. Please run this SQL in Supabase dashboard first:');
      console.log('  ----------------------------------------------------------------');
      console.log('  ALTER TABLE kb_glossary ADD COLUMN IF NOT EXISTS display_name VARCHAR(255);');
      console.log('  ALTER TABLE kb_glossary DROP COLUMN IF EXISTS difficulty;');
      console.log('  ----------------------------------------------------------------\n');
      console.log('  After running the SQL, run this script again to update display_name values.');

      // Check if the column already exists by trying to fetch it
      const testResponse = await fetch(`${SUPABASE_URL}/rest/v1/kb_glossary?select=display_name&limit=1`, {
        headers: {
          'apikey': SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SERVICE_ROLE_KEY}`
        }
      });

      if (!testResponse.ok) {
        console.log('\n  Column does not exist yet. Please run the SQL first.');
        return;
      }
      console.log('\n  Column exists! Proceeding with updates...\n');
    }
  } else {
    console.log('  ✓ SQL migration completed\n');
  }

  // Step 2: Fetch all existing terms
  console.log('Step 2: Fetching existing terms...');
  const fetchResponse = await fetch(`${SUPABASE_URL}/rest/v1/kb_glossary?select=id,term,slug`, {
    headers: {
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`
    }
  });

  if (!fetchResponse.ok) {
    console.error('Failed to fetch terms:', await fetchResponse.text());
    return;
  }

  const terms = await fetchResponse.json();
  console.log(`  Found ${terms.length} terms\n`);

  // Step 3: Update each term with display_name
  console.log('Step 3: Updating terms with display_name values...');

  let updated = 0;
  let customNames = 0;

  for (const term of terms) {
    const termLower = term.term.toLowerCase();
    const slugLower = term.slug.toLowerCase().replace(/-/g, ' ');

    // Check if we have a mapping for this term
    let displayName = displayNameMappings[termLower] || displayNameMappings[slugLower];

    // If no mapping, use the original term as display_name
    if (!displayName) {
      displayName = term.term;
    } else {
      customNames++;
    }

    // Update the term
    const updateResponse = await fetch(`${SUPABASE_URL}/rest/v1/kb_glossary?id=eq.${term.id}`, {
      method: 'PATCH',
      headers: {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({ display_name: displayName })
    });

    if (updateResponse.ok) {
      if (displayName !== term.term) {
        console.log(`  ✓ "${term.term}" → "${displayName}"`);
      }
      updated++;
    } else {
      const errorText = await updateResponse.text();
      if (errorText.includes('display_name')) {
        console.error('\n  ERROR: display_name column does not exist.');
        console.log('  Please run this SQL in Supabase SQL Editor:');
        console.log('  ALTER TABLE kb_glossary ADD COLUMN display_name VARCHAR(255);');
        return;
      }
      console.error(`  ✗ Failed to update ${term.term}:`, errorText);
    }
  }

  console.log(`\n  Updated ${updated} terms (${customNames} with custom display names)\n`);

  // Verify results
  console.log('Step 4: Verifying migration...');
  const verifyResponse = await fetch(`${SUPABASE_URL}/rest/v1/kb_glossary?select=term,display_name&limit=10`, {
    headers: {
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`
    }
  });

  if (verifyResponse.ok) {
    const sample = await verifyResponse.json();
    console.log('  Sample results:');
    sample.forEach(t => console.log(`    ${t.term} → ${t.display_name}`));
  }

  console.log('\n=== Migration Complete! ===');
}

runMigration().catch(console.error);
