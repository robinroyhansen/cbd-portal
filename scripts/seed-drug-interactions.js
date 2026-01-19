const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const SEED_DATA_DIR = path.join(__dirname, 'seed-data/interactions');

async function seedDrugs() {
  console.log('Starting drug interaction seeding...\n');

  // Read all JSON files from seed-data directory
  const files = fs.readdirSync(SEED_DATA_DIR).filter(f => f.endsWith('.json'));

  let totalDrugs = 0;
  let totalInteractions = 0;

  for (const file of files) {
    console.log(`Processing ${file}...`);

    const data = JSON.parse(
      fs.readFileSync(path.join(SEED_DATA_DIR, file), 'utf-8')
    );

    for (const drug of data.drugs) {
      // Insert drug
      const drugData = {
        generic_name: drug.generic_name,
        slug: drug.generic_name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        display_name: drug.display_name || drug.generic_name.charAt(0).toUpperCase() + drug.generic_name.slice(1),
        brand_names: drug.brand_names || [],
        synonyms: drug.synonyms || [],
        category: data.category,
        drug_class: drug.drug_class || null,
        primary_cyp_enzymes: drug.primary_cyp_enzymes || [],
        secondary_cyp_enzymes: drug.secondary_cyp_enzymes || [],
        common_uses: drug.common_uses || [],
        rxcui: drug.rxcui || null,
        atc_code: drug.atc_code || null,
        is_published: true,
      };

      const { data: insertedDrug, error: drugError } = await supabase
        .from('kb_drugs')
        .upsert(drugData, { onConflict: 'slug' })
        .select('id, generic_name')
        .single();

      if (drugError) {
        console.error(`  Error inserting ${drug.generic_name}:`, drugError.message);
        continue;
      }

      totalDrugs++;

      // Insert interaction if exists
      if (drug.interaction) {
        const interactionData = {
          drug_id: insertedDrug.id,
          severity: drug.interaction.severity,
          mechanism: drug.interaction.mechanism,
          mechanism_description: drug.interaction.mechanism_description || null,
          clinical_effects: drug.interaction.clinical_effects || [],
          potential_outcomes: drug.interaction.potential_outcomes || null,
          recommendation: drug.interaction.recommendation,
          monitoring_parameters: drug.interaction.monitoring_parameters || [],
          dose_adjustment_guidance: drug.interaction.dose_adjustment_guidance || null,
          onset_timeframe: drug.interaction.onset_timeframe || null,
          evidence_level: drug.interaction.evidence_level || null,
          citations: drug.interaction.citations || [],
          special_populations_notes: drug.interaction.special_populations_notes || null,
          last_reviewed_at: new Date().toISOString(),
        };

        const { error: interactionError } = await supabase
          .from('kb_drug_interactions')
          .upsert(interactionData, { onConflict: 'drug_id' });

        if (interactionError) {
          console.error(`  Error inserting interaction for ${drug.generic_name}:`, interactionError.message);
        } else {
          totalInteractions++;
        }
      }

      console.log(`  ✓ ${drug.display_name || drug.generic_name}`);
    }
  }

  console.log(`\n========================================`);
  console.log(`Seeding complete!`);
  console.log(`Total drugs: ${totalDrugs}`);
  console.log(`Total interactions: ${totalInteractions}`);
  console.log(`========================================`);
}

seedDrugs().catch(console.error);
