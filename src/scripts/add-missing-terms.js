const SUPABASE_URL = 'https://bvrdryvgqarffgdujmjz.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2cmRyeXZncWFyZmZnZHVqbWp6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzkwMTc5NywiZXhwIjoyMDgzNDc3Nzk3fQ.SmqoTgGp3J6JEOuOiEl7IMd8whWz4qAvQABM7AUc7kY';

const terms = [
  {
    term: "CBDV",
    display_name: "CBDV (Cannabidivarin)",
    slug: "cbdv",
    category: "cannabinoids",
    short_definition: "A non-psychoactive cannabinoid similar to CBD, being researched for potential anti-nausea and anti-epileptic properties.",
    definition: "Cannabidivarin (CBDV) is a non-psychoactive cannabinoid found in cannabis plants, particularly in indica strains from Asia and Africa. It's structurally similar to CBD but with a shortened side chain.\n\nCBDV is being actively researched for its potential therapeutic benefits, particularly for nausea, seizure disorders, and autism spectrum disorder. Early studies suggest it may have anticonvulsant properties similar to CBD.\n\nLike CBD, CBDV does not produce intoxicating effects and may help modulate the effects of THC when present together in full-spectrum products.",
    synonyms: ["Cannabidivarin", "GWP42006"]
  },
  {
    term: "Half-life",
    display_name: "Half-life",
    slug: "half-life",
    category: "medical",
    short_definition: "The time required for half of a substance to be eliminated from the body—important for CBD dosing schedules.",
    definition: "Half-life is the time required for the concentration of a substance in the body to decrease by half. It's a key pharmacokinetic parameter that helps determine dosing frequency and duration of effects.\n\nCBD's half-life varies based on consumption method and individual factors. Oral CBD typically has a half-life of 2-5 days, while inhaled CBD has a shorter half-life of about 31 hours. This means oral CBD stays in the system longer.\n\nUnderstanding half-life helps optimize CBD dosing schedules. Substances with longer half-lives can be taken less frequently, while those with shorter half-lives may require multiple daily doses for consistent effects.",
    synonyms: ["t½", "Elimination Half-life", "Biological Half-life"]
  },
  {
    term: "Distillate",
    display_name: "Distillate",
    slug: "distillate",
    category: "products",
    short_definition: "A highly refined cannabis extract containing isolated cannabinoids, typically 85-95% pure THC or CBD.",
    definition: "Distillate is a highly purified cannabis extract produced through a process called distillation. The result is a translucent oil that's typically 85-95% pure cannabinoid content (usually THC or CBD).\n\nThe distillation process removes almost all plant materials, waxes, terpenes, and other compounds, leaving nearly pure cannabinoid. Because terpenes are removed, distillate is often described as lacking the flavor and entourage effect of full-spectrum products.\n\nDistillate is versatile and can be consumed directly, added to edibles, or used in vape cartridges. Terpenes are sometimes re-added for flavor. It's valued for its purity and precise dosing potential.",
    synonyms: ["Cannabis Distillate", "THC Distillate", "CBD Distillate"]
  },
  {
    term: "Dab",
    display_name: "Dab",
    slug: "dab",
    category: "products",
    short_definition: "A method of consuming cannabis concentrates by vaporizing them on a heated surface.",
    definition: "Dabbing is a method of consuming cannabis concentrates by vaporizing them on a heated surface, typically a 'nail' or 'banger' attached to a specialized water pipe called a 'dab rig.' The term 'dab' refers to both the method and the dose of concentrate used.\n\nDabbing produces intense effects quickly because concentrates are much more potent than flower. A single dab might contain as much THC as an entire joint. The vapor is smoother than smoke but effects are stronger.\n\nDab rigs can be traditional glass pieces with torches or electronic 'e-rigs' with precise temperature control. Temperature affects flavor and harshness—lower temps preserve terpenes while higher temps produce bigger clouds.",
    synonyms: ["Dabbing", "Dab Hit"]
  },
  {
    term: "Rheumatoid Arthritis",
    display_name: "Rheumatoid Arthritis",
    slug: "rheumatoid-arthritis",
    category: "conditions",
    short_definition: "An autoimmune disease causing chronic joint inflammation, pain, and potential joint damage.",
    definition: "Rheumatoid arthritis (RA) is a chronic autoimmune disease where the immune system mistakenly attacks the joints, causing inflammation, pain, swelling, and potentially permanent joint damage. Unlike osteoarthritis, it's not caused by wear and tear.\n\nRA affects about 1% of the population and is more common in women. It typically affects joints symmetrically (both hands, both knees) and can also affect other body systems including skin, eyes, and lungs.\n\nCannabinoids show promise for RA due to their anti-inflammatory and immunomodulatory properties. CB2 receptors are found in high concentrations in joint tissue. CBD in particular is being researched for its ability to reduce inflammation without psychoactive effects.",
    synonyms: ["RA", "Inflammatory Arthritis"]
  },
  {
    term: "CINV",
    display_name: "CINV (Chemotherapy-Induced Nausea)",
    slug: "cinv",
    category: "conditions",
    short_definition: "Severe nausea and vomiting caused by chemotherapy treatment, often inadequately controlled by standard medications.",
    definition: "Chemotherapy-Induced Nausea and Vomiting (CINV) is a common and debilitating side effect of cancer chemotherapy. Despite advances in anti-nausea medications, many patients still experience significant nausea that affects their ability to continue treatment.\n\nCINV can be acute (within 24 hours of treatment), delayed (24+ hours after), or anticipatory (before treatment due to previous experiences). It significantly impacts patients' quality of life and can lead to treatment discontinuation.\n\nCannabinoids were among the first FDA-approved uses for cannabis medicines. Dronabinol (synthetic THC) and nabilone are approved for CINV. Many patients find whole-plant cannabis more effective than pharmaceutical cannabinoids for managing their symptoms.",
    synonyms: ["Chemotherapy-Induced Nausea and Vomiting", "Chemo Nausea"]
  }
];

async function addTerms() {
  console.log(`Adding ${terms.length} missing glossary terms...\n`);

  let added = 0;

  for (const term of terms) {
    const insertData = {
      term: term.term,
      display_name: term.display_name,
      slug: term.slug,
      definition: term.definition,
      short_definition: term.short_definition,
      category: term.category,
      synonyms: term.synonyms || [],
      sources: [],
      related_terms: [],
      related_research: []
    };

    const insertResponse = await fetch(`${SUPABASE_URL}/rest/v1/kb_glossary`, {
      method: 'POST',
      headers: {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(insertData)
    });

    if (insertResponse.ok) {
      console.log(`✓ Added "${term.display_name}"`);
      added++;
    } else {
      const error = await insertResponse.text();
      console.error(`✗ Failed to add "${term.term}":`, error);
    }
  }

  // Get final count
  const countResponse = await fetch(`${SUPABASE_URL}/rest/v1/kb_glossary?select=id`, {
    headers: {
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`
    }
  });
  const allTerms = await countResponse.json();

  console.log(`\n=== Summary ===`);
  console.log(`Added: ${added}`);
  console.log(`Total terms in database: ${allTerms.length}`);
}

addTerms().catch(console.error);
