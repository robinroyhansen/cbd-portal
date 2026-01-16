const SUPABASE_URL = 'https://bvrdryvgqarffgdujmjz.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2cmRyeXZncWFyZmZnZHVqbWp6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzkwMTc5NywiZXhwIjoyMDgzNDc3Nzk3fQ.SmqoTgGp3J6JEOuOiEl7IMd8whWz4qAvQABM7AUc7kY';

// Robin's author ID
const ROBIN_AUTHOR_ID = 'e81ce9e2-d10f-427b-8d43-6cc63e2761ba';

// Related terms mappings (slug -> array of related slugs)
const relatedTermsMap = {
  'cbd': ['thc', 'cannabinoids', 'full-spectrum', 'endocannabinoid-system', 'hemp'],
  'thc': ['cbd', 'cannabinoids', 'delta-8-thc', 'hemp-vs-marijuana', 'psychoactive'],
  'cannabinoids': ['cbd', 'thc', 'cbg', 'cbn', 'phytocannabinoid'],
  'full-spectrum': ['broad-spectrum', 'cbd-isolate', 'entourage-effect', 'terpenes'],
  'broad-spectrum': ['full-spectrum', 'cbd-isolate', 'thc-free', 'entourage-effect'],
  'cbd-isolate': ['full-spectrum', 'broad-spectrum', 'crystalline', 'purity'],
  'terpenes': ['entourage-effect', 'limonene', 'myrcene', 'linalool', 'pinene'],
  'entourage-effect': ['full-spectrum', 'terpenes', 'cannabinoids', 'whole-plant'],
  'endocannabinoid-system': ['cb1-receptor', 'cb2-receptor', 'anandamide', '2-ag', 'homeostasis'],
  'bioavailability': ['sublingual', 'first-pass-metabolism', 'nanoemulsion', 'absorption'],
  'cbd-oil': ['tincture', 'carrier-oil', 'mct-oil', 'dosage', 'sublingual'],
  'hemp': ['hemp-vs-marijuana', 'industrial-hemp', 'farm-bill', 'cbd'],
  'cbg': ['cannabinoids', 'cbga', 'mother-cannabinoid', 'minor-cannabinoid'],
  'cbn': ['cannabinoids', 'sleep', 'degradation', 'minor-cannabinoid'],
  'delta-8-thc': ['thc', 'delta-9-thc', 'hemp-derived', 'psychoactive'],
  'sublingual': ['bioavailability', 'tincture', 'absorption', 'cbd-oil'],
  'tincture': ['cbd-oil', 'sublingual', 'carrier-oil', 'dosage'],
  'topical': ['transdermal', 'localized', 'cbd-cream', 'absorption'],
  'edibles': ['bioavailability', 'first-pass-metabolism', 'gummies', 'onset-time'],
  'dosage': ['milligram', 'titration', 'bioavailability', 'body-weight'],
  'certificate-of-analysis': ['third-party-testing', 'lab-results', 'potency', 'contaminants'],
  'third-party-testing': ['certificate-of-analysis', 'lab-results', 'quality-assurance'],
  'carrier-oil': ['mct-oil', 'hemp-seed-oil', 'bioavailability', 'cbd-oil'],
  'hemp-vs-marijuana': ['hemp', 'thc', 'legal-status', 'farm-bill'],
  'farm-bill': ['hemp', 'legal-status', 'thc-limit', 'hemp-derived'],
  'anxiety': ['cbd', 'anxiolytic', 'stress', 'dosage'],
  'sleep': ['cbn', 'melatonin', 'insomnia', 'relaxation'],
  'pain': ['anti-inflammatory', 'topical', 'chronic-pain', 'cbd'],
  'inflammation': ['anti-inflammatory', 'cbd', 'cytokines', 'autoimmune'],
  'cb1-receptor': ['cb2-receptor', 'endocannabinoid-system', 'thc', 'brain']
};

// FAQs for top 10 terms
const faqsMap = {
  'cbd': [
    {
      question: 'What is CBD and where does it come from?',
      answer: 'CBD (cannabidiol) is a naturally occurring compound found in the Cannabis sativa plant. It is one of over 100 cannabinoids identified in cannabis. CBD is primarily extracted from hemp plants, which contain high CBD and low THC levels (less than 0.3%).'
    },
    {
      question: 'Will CBD get me high?',
      answer: 'No, CBD is non-psychoactive and will not produce a "high." Unlike THC, CBD does not bind strongly to CB1 receptors in the brain that cause intoxication. You can use CBD products without experiencing mind-altering effects.'
    },
    {
      question: 'Is CBD legal?',
      answer: 'In the United States, hemp-derived CBD containing less than 0.3% THC is federally legal under the 2018 Farm Bill. However, state laws vary, and some states have additional restrictions. Always check your local regulations.'
    },
    {
      question: 'How do I take CBD?',
      answer: 'CBD is available in many forms including oils/tinctures (taken sublingually), capsules, edibles, topicals, and vapes. The best method depends on your needs: sublingual offers fast absorption, edibles provide longer-lasting effects, and topicals work for localized relief.'
    }
  ],
  'thc': [
    {
      question: 'What is the difference between THC and CBD?',
      answer: 'THC (tetrahydrocannabinol) is the psychoactive compound that causes the "high" associated with marijuana, while CBD is non-psychoactive. Both interact with the endocannabinoid system but affect different receptors and produce different effects.'
    },
    {
      question: 'Is THC legal?',
      answer: 'THC legality varies by location. Hemp-derived products with less than 0.3% THC are federally legal in the US. Marijuana with higher THC levels is legal for medical or recreational use in some states but remains federally illegal.'
    },
    {
      question: 'How long does THC stay in your system?',
      answer: 'THC can be detected in urine for 3-30 days depending on usage frequency, body fat percentage, and metabolism. Heavy users may test positive for longer. Blood tests typically detect THC for 1-2 days, while hair tests can detect it for up to 90 days.'
    }
  ],
  'full-spectrum': [
    {
      question: 'What is full-spectrum CBD?',
      answer: 'Full-spectrum CBD contains all naturally occurring compounds from the hemp plant, including cannabinoids (CBD, CBG, CBN, trace THC), terpenes, flavonoids, and fatty acids. These compounds work together synergistically in what is called the "entourage effect."'
    },
    {
      question: 'Does full-spectrum CBD contain THC?',
      answer: 'Yes, full-spectrum CBD contains trace amounts of THC, but legally must be below 0.3% to be sold as hemp-derived. This small amount is not enough to cause intoxication but may show up on sensitive drug tests.'
    },
    {
      question: 'Is full-spectrum CBD better than isolate?',
      answer: 'Many users report that full-spectrum CBD is more effective due to the entourage effect. However, CBD isolate is preferred by those who want to avoid any THC, need to pass drug tests, or are sensitive to other cannabinoids.'
    }
  ],
  'endocannabinoid-system': [
    {
      question: 'What is the endocannabinoid system?',
      answer: 'The endocannabinoid system (ECS) is a complex cell-signaling system present in all mammals. It consists of endocannabinoids, receptors (CB1 and CB2), and enzymes. The ECS helps regulate sleep, mood, appetite, memory, reproduction, and pain sensation.'
    },
    {
      question: 'How does CBD interact with the endocannabinoid system?',
      answer: 'CBD indirectly influences the ECS by inhibiting the breakdown of endocannabinoids, allowing them to have a greater effect. It also interacts with other receptors including serotonin and vanilloid receptors, contributing to its various effects.'
    }
  ],
  'bioavailability': [
    {
      question: 'What does bioavailability mean for CBD?',
      answer: 'Bioavailability refers to the percentage of CBD that actually enters your bloodstream and produces effects. Different consumption methods have different bioavailability rates: inhalation (30-40%), sublingual (20-35%), oral/edibles (6-20%), and topical (localized, not systemic).'
    },
    {
      question: 'How can I increase CBD bioavailability?',
      answer: 'Take CBD with fatty foods to improve absorption, use sublingual administration and hold under tongue for 60-90 seconds, choose nanoemulsified products for better absorption, or consider water-soluble CBD formulations.'
    }
  ],
  'terpenes': [
    {
      question: 'What are terpenes in CBD products?',
      answer: 'Terpenes are aromatic compounds found in hemp and many other plants. They give plants their distinctive smells and flavors. In CBD products, terpenes may contribute to the entourage effect and provide their own therapeutic benefits.'
    },
    {
      question: 'What are the most common terpenes in hemp?',
      answer: 'Common hemp terpenes include myrcene (earthy, relaxing), limonene (citrus, uplifting), linalool (floral, calming), pinene (pine, alertness), and caryophyllene (spicy, anti-inflammatory). Each has unique potential benefits.'
    }
  ],
  'cbd-oil': [
    {
      question: 'What is CBD oil used for?',
      answer: 'CBD oil is used for various purposes including managing stress and anxiety, supporting sleep, addressing discomfort and inflammation, and promoting overall wellness. Research is ongoing, and effects vary by individual.'
    },
    {
      question: 'How do I choose a quality CBD oil?',
      answer: 'Look for products with third-party lab testing (COA), verify THC content is below 0.3%, check for organic hemp sourcing, review extraction methods (CO2 is preferred), and ensure the company provides transparent ingredient lists.'
    },
    {
      question: 'How much CBD oil should I take?',
      answer: 'Start with a low dose (10-20mg) and gradually increase until you find relief. Factors affecting dosage include body weight, metabolism, desired effects, and product potency. Consult a healthcare provider for personalized guidance.'
    }
  ],
  'hemp': [
    {
      question: 'What is the difference between hemp and marijuana?',
      answer: 'Hemp and marijuana are both Cannabis sativa but differ in THC content. Hemp contains 0.3% THC or less and is federally legal for cultivation. Marijuana has higher THC levels (5-30%) and is regulated differently, with legality varying by state.'
    },
    {
      question: 'What is hemp used for?',
      answer: 'Hemp has numerous uses: CBD extraction, textiles and clothing, paper products, building materials (hempcrete), biofuels, food products (hemp seeds, oil), animal feed, and plastic alternatives. It is one of the most versatile crops.'
    }
  ],
  'certificate-of-analysis': [
    {
      question: 'What is a Certificate of Analysis (COA)?',
      answer: 'A COA is a document from an independent laboratory that verifies the contents of a CBD product. It shows cannabinoid levels, terpene profiles, and tests for contaminants like pesticides, heavy metals, and residual solvents.'
    },
    {
      question: 'How do I read a CBD Certificate of Analysis?',
      answer: 'Check that the product name and batch number match, verify CBD content matches the label, ensure THC is below 0.3%, look for "ND" (not detected) or "pass" on contaminant tests, and confirm the lab is ISO-certified.'
    }
  ],
  'dosage': [
    {
      question: 'How much CBD should I take?',
      answer: 'There is no universal CBD dose. Start with 10-20mg daily and increase gradually every few days until desired effects are achieved. General guidelines suggest 1-6mg per 10 pounds of body weight, but individual needs vary.'
    },
    {
      question: 'Can I take too much CBD?',
      answer: 'CBD is generally well-tolerated, and there is no known lethal dose. However, high doses may cause side effects like drowsiness, dry mouth, or digestive upset. Always start low and consult a healthcare provider, especially if taking medications.'
    }
  ]
};

async function checkColumnsExist() {
  console.log('=== Checking if author_id and faq columns exist ===\n');

  const response = await fetch(`${SUPABASE_URL}/rest/v1/kb_glossary?select=author_id,faq&limit=1`, {
    headers: {
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    if (errorText.includes('author_id') || errorText.includes('faq')) {
      console.log('ERROR: Columns do not exist yet.');
      console.log('\nPlease run this SQL in Supabase SQL Editor:\n');
      console.log(`
ALTER TABLE kb_glossary ADD COLUMN IF NOT EXISTS author_id UUID REFERENCES kb_authors(id);
ALTER TABLE kb_glossary ADD COLUMN IF NOT EXISTS faq JSONB;
CREATE INDEX IF NOT EXISTS idx_kb_glossary_author_id ON kb_glossary(author_id);
      `);
      return false;
    }
  }

  console.log('Columns exist. Proceeding with updates.\n');
  return true;
}

async function setAuthorForAllTerms() {
  console.log('=== Setting Author for All Terms ===\n');

  const response = await fetch(`${SUPABASE_URL}/rest/v1/kb_glossary?author_id=is.null`, {
    method: 'PATCH',
    headers: {
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify({ author_id: ROBIN_AUTHOR_ID })
  });

  if (!response.ok) {
    console.error('Failed to set author:', await response.text());
    return;
  }

  const updated = await response.json();
  console.log(`Set author_id for ${updated.length} terms\n`);
}

async function updateRelatedTerms() {
  console.log('=== Updating Related Terms for Top 30 Terms ===\n');

  let updated = 0;

  for (const [slug, relatedSlugs] of Object.entries(relatedTermsMap)) {
    const updateResponse = await fetch(`${SUPABASE_URL}/rest/v1/kb_glossary?slug=eq.${slug}`, {
      method: 'PATCH',
      headers: {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({ related_terms: relatedSlugs })
    });

    if (updateResponse.ok) {
      console.log(`✓ ${slug} → [${relatedSlugs.join(', ')}]`);
      updated++;
    } else {
      const errorText = await updateResponse.text();
      console.log(`✗ ${slug}: ${errorText}`);
    }
  }

  console.log(`\nUpdated related terms for ${updated} terms\n`);
}

async function updateFAQs() {
  console.log('=== Adding FAQs for Top 10 Terms ===\n');

  let updated = 0;

  for (const [slug, faqs] of Object.entries(faqsMap)) {
    const updateResponse = await fetch(`${SUPABASE_URL}/rest/v1/kb_glossary?slug=eq.${slug}`, {
      method: 'PATCH',
      headers: {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({ faq: faqs })
    });

    if (updateResponse.ok) {
      console.log(`✓ ${slug} → ${faqs.length} FAQs`);
      updated++;
    } else {
      const errorText = await updateResponse.text();
      console.log(`✗ ${slug}: ${errorText}`);
    }
  }

  console.log(`\nAdded FAQs for ${updated} terms\n`);
}

async function printSummary() {
  console.log('=== Final Summary ===\n');

  const response = await fetch(`${SUPABASE_URL}/rest/v1/kb_glossary?select=slug,author_id,related_terms,faq`, {
    headers: {
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`
    }
  });

  const terms = await response.json();

  const withAuthor = terms.filter(t => t.author_id).length;
  const withRelated = terms.filter(t => t.related_terms && t.related_terms.length > 0).length;
  const withFaq = terms.filter(t => t.faq && t.faq.length > 0).length;

  console.log(`Total terms: ${terms.length}`);
  console.log(`With author: ${withAuthor}`);
  console.log(`With related terms: ${withRelated}`);
  console.log(`With FAQs: ${withFaq}`);
}

async function main() {
  try {
    const columnsExist = await checkColumnsExist();
    if (!columnsExist) {
      process.exit(1);
    }

    await setAuthorForAllTerms();
    await updateRelatedTerms();
    await updateFAQs();
    await printSummary();
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
