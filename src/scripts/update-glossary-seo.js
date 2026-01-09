const SUPABASE_URL = 'https://bvrdryvgqarffgdujmjz.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2cmRyeXZncWFyZmZnZHVqbWp6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzkwMTc5NywiZXhwIjoyMDgzNDc3Nzk3fQ.SmqoTgGp3J6JEOuOiEl7IMd8whWz4qAvQABM7AUc7kY';

// Pronunciation mappings (term lowercase -> pronunciation)
const pronunciations = {
  'cannabidiol': 'kan-uh-BID-ee-ol',
  'tetrahydrocannabinol': 'tet-ruh-hy-droh-kuh-NAB-ih-nol',
  'cannabigerol': 'kan-uh-BIJ-er-ol',
  'cannabinol': 'kan-uh-BIN-ol',
  'cannabichromene': 'kan-uh-by-KROH-meen',
  'terpene': 'TUR-peen',
  'terpenes': 'TUR-peenz',
  'trichome': 'TRY-kohm',
  'trichomes': 'TRY-kohmz',
  'endocannabinoid': 'en-doh-kuh-NAB-ih-noyd',
  'endocannabinoid system': 'en-doh-kuh-NAB-ih-noyd SIS-tem',
  'anxiolytic': 'ang-zee-oh-LIT-ik',
  'bioavailability': 'by-oh-uh-vay-luh-BIL-ih-tee',
  'sublingual': 'sub-LING-gwul',
  'pharmacokinetics': 'far-muh-koh-kih-NET-iks',
  'pharmacodynamics': 'far-muh-koh-dy-NAM-iks',
  'phytocannabinoid': 'fy-toh-kuh-NAB-ih-noyd',
  'entourage effect': 'ON-too-rahzh eh-FEKT',
  'limonene': 'LIM-oh-neen',
  'myrcene': 'MUR-seen',
  'linalool': 'lin-uh-LOOL',
  'pinene': 'PY-neen',
  'caryophyllene': 'kar-ee-OF-ih-leen',
  'humulene': 'HYOO-myoo-leen',
  'cbda': 'see-bee-dee-AY',
  'thca': 'tee-aych-see-AY',
  'cbdv': 'see-bee-dee-VEE',
  'thcv': 'tee-aych-see-VEE',
  'decarboxylation': 'dee-kar-bok-sih-LAY-shun'
};

// Advanced terms (slugs)
const advancedTermSlugs = [
  'cyp450-enzymes',
  'chromatography',
  'pharmacokinetics',
  'pharmacodynamics',
  'short-path-distillation',
  'supercritical-extraction',
  'receptor-agonist',
  'receptor-antagonist',
  'allosteric-modulator',
  'biotransformation',
  'first-pass-metabolism',
  'cytochrome-p450'
];

async function updatePronunciations() {
  console.log('=== Updating Pronunciations ===\n');

  // Fetch all terms
  const response = await fetch(`${SUPABASE_URL}/rest/v1/kb_glossary?select=id,term,slug,pronunciation`, {
    headers: {
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`
    }
  });

  const terms = await response.json();
  let updated = 0;

  for (const term of terms) {
    const termLower = term.term.toLowerCase();
    const pronunciation = pronunciations[termLower];

    if (pronunciation && term.pronunciation !== pronunciation) {
      const updateResponse = await fetch(`${SUPABASE_URL}/rest/v1/kb_glossary?id=eq.${term.id}`, {
        method: 'PATCH',
        headers: {
          'apikey': SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({ pronunciation })
      });

      if (updateResponse.ok) {
        console.log(`✓ "${term.term}" → /${pronunciation}/`);
        updated++;
      } else {
        console.error(`✗ Failed to update "${term.term}":`, await updateResponse.text());
      }
    }
  }

  console.log(`\nUpdated ${updated} pronunciations\n`);
}

async function markAdvancedTerms() {
  console.log('=== Marking Advanced Terms ===\n');

  let updated = 0;

  for (const slug of advancedTermSlugs) {
    const updateResponse = await fetch(`${SUPABASE_URL}/rest/v1/kb_glossary?slug=eq.${slug}`, {
      method: 'PATCH',
      headers: {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({ is_advanced: true })
    });

    if (updateResponse.ok) {
      console.log(`✓ Marked "${slug}" as advanced`);
      updated++;
    } else {
      const errorText = await updateResponse.text();
      if (errorText.includes('0 rows')) {
        console.log(`⊖ Skipped "${slug}" (not found)`);
      } else {
        console.error(`✗ Failed to mark "${slug}":`, errorText);
      }
    }
  }

  console.log(`\nMarked ${updated} terms as advanced\n`);
}

async function checkDuplicates() {
  console.log('=== Checking for Duplicate/Overlapping Terms ===\n');

  // Fetch all terms
  const response = await fetch(`${SUPABASE_URL}/rest/v1/kb_glossary?select=id,term,slug,short_definition`, {
    headers: {
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`
    }
  });

  const terms = await response.json();

  // Check for potential duplicates
  const potentialDuplicates = [
    { pair: ['hemp', 'hemp-vs-marijuana'], keep: 'hemp-vs-marijuana' },
    { pair: ['marijuana', 'hemp-vs-marijuana'], keep: 'hemp-vs-marijuana' },
    { pair: ['full-spectrum', 'full-spectrum-cbd'], keep: 'full-spectrum' },
    { pair: ['broad-spectrum', 'broad-spectrum-cbd'], keep: 'broad-spectrum' },
    { pair: ['cbd-isolate', 'isolate'], keep: 'cbd-isolate' }
  ];

  console.log('Potential overlapping terms to review:\n');

  for (const { pair, keep } of potentialDuplicates) {
    const found = terms.filter(t => pair.includes(t.slug));
    if (found.length > 1) {
      console.log(`Found overlap: ${found.map(t => `"${t.slug}"`).join(' and ')}`);
      console.log(`  Recommendation: Keep "${keep}"`);
      found.forEach(t => console.log(`    - ${t.slug}: ${t.short_definition?.substring(0, 60)}...`));
      console.log('');
    } else if (found.length === 1) {
      console.log(`OK: Only "${found[0].slug}" exists (no duplicate)`);
    }
  }

  // Check for standalone "hemp" and "marijuana" that might be redundant
  const standaloneTerms = ['hemp', 'marijuana', 'cannabis'];
  console.log('\nStandalone terms to review:');
  for (const slug of standaloneTerms) {
    const term = terms.find(t => t.slug === slug);
    if (term) {
      console.log(`  - ${term.slug}: ${term.short_definition?.substring(0, 80)}...`);
    }
  }

  console.log('\nNote: Review these manually. The "Hemp vs Marijuana" comparison term is comprehensive.');
  console.log('Standalone "Hemp" and "Marijuana" entries may be useful for direct lookups.\n');
}

async function printSummary() {
  console.log('=== Final Summary ===\n');

  const response = await fetch(`${SUPABASE_URL}/rest/v1/kb_glossary?select=id,category,is_advanced,pronunciation`, {
    headers: {
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`
    }
  });

  const terms = await response.json();

  const categoryCounts = {};
  let advancedCount = 0;
  let withPronunciation = 0;

  terms.forEach(t => {
    categoryCounts[t.category] = (categoryCounts[t.category] || 0) + 1;
    if (t.is_advanced) advancedCount++;
    if (t.pronunciation) withPronunciation++;
  });

  console.log(`Total terms: ${terms.length}`);
  console.log(`Terms with pronunciation: ${withPronunciation}`);
  console.log(`Advanced terms: ${advancedCount}`);
  console.log(`\nBy category:`);
  Object.entries(categoryCounts)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .forEach(([cat, count]) => console.log(`  ${cat}: ${count}`));
}

async function main() {
  try {
    await updatePronunciations();
    await markAdvancedTerms();
    await checkDuplicates();
    await printSummary();
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
