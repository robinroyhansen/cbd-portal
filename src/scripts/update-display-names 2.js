const SUPABASE_URL = 'https://bvrdryvgqarffgdujmjz.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2cmRyeXZncWFyZmZnZHVqbWp6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzkwMTc5NywiZXhwIjoyMDgzNDc3Nzk3fQ.SmqoTgGp3J6JEOuOiEl7IMd8whWz4qAvQABM7AUc7kY';

// Display name mappings: term (case-insensitive) -> display_name
const displayNameMappings = {
  // Cannabinoids - abbreviation first
  'cannabidiol': 'CBD (Cannabidiol)',
  'tetrahydrocannabinol': 'THC (Tetrahydrocannabinol)',
  'cannabigerol': 'CBG (Cannabigerol)',
  'cannabinol': 'CBN (Cannabinol)',
  'cannabichromene': 'CBC (Cannabichromene)',
  'cbda': 'CBDA (Cannabidiolic Acid)',
  'thca': 'THCA (Tetrahydrocannabinolic Acid)',
  'delta-8 thc': 'Δ8-THC (Delta-8-Tetrahydrocannabinol)',
  'thcv': 'THCV (Tetrahydrocannabivarin)',
  'cbdv': 'CBDV (Cannabidivarin)',

  // Other terms with common abbreviations
  'certificate of analysis': 'Certificate of Analysis (COA)',
  'rick simpson oil': 'RSO (Rick Simpson Oil)',
};

async function updateDisplayNames() {
  console.log('Fetching all glossary terms...\n');

  // Fetch all terms
  const response = await fetch(`${SUPABASE_URL}/rest/v1/kb_glossary?select=id,term,display_name`, {
    headers: {
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`
    }
  });

  if (!response.ok) {
    console.error('Failed to fetch terms:', await response.text());
    return;
  }

  const terms = await response.json();
  console.log(`Found ${terms.length} terms\n`);

  let updated = 0;

  for (const term of terms) {
    const termLower = term.term.toLowerCase();
    const newDisplayName = displayNameMappings[termLower];

    if (newDisplayName && term.display_name !== newDisplayName) {
      // Update the term
      const updateResponse = await fetch(`${SUPABASE_URL}/rest/v1/kb_glossary?id=eq.${term.id}`, {
        method: 'PATCH',
        headers: {
          'apikey': SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({ display_name: newDisplayName })
      });

      if (updateResponse.ok) {
        console.log(`✓ "${term.term}" → "${newDisplayName}"`);
        updated++;
      } else {
        console.error(`✗ Failed to update "${term.term}":`, await updateResponse.text());
      }
    }
  }

  console.log(`\n✓ Updated ${updated} terms with custom display names`);

  // Verify
  console.log('\nVerifying updates...');
  const verifyResponse = await fetch(`${SUPABASE_URL}/rest/v1/kb_glossary?select=term,display_name&order=term`, {
    headers: {
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`
    }
  });

  if (verifyResponse.ok) {
    const allTerms = await verifyResponse.json();
    const customNames = allTerms.filter(t => t.display_name !== t.term);
    console.log(`\nTerms with custom display names (${customNames.length}):`);
    customNames.forEach(t => console.log(`  ${t.term} → ${t.display_name}`));
  }
}

updateDisplayNames().catch(console.error);
