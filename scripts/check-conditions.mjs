import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
  // Get all conditions (published and unpublished)
  const { data: all, count: totalCount } = await supabase
    .from('kb_conditions')
    .select('slug, name, is_published, category', { count: 'exact' });

  console.log('Total conditions in database:', totalCount);

  const published = all?.filter(c => c.is_published);
  const unpublished = all?.filter(c => !c.is_published);

  console.log('Published:', published?.length);
  console.log('Unpublished:', unpublished?.length);

  if (unpublished?.length > 0) {
    console.log('\nUnpublished conditions:');
    unpublished.forEach(c => console.log('  -', c.slug, ':', c.name));
  }

  // Check CONDITIONS from research-conditions.ts
  const researchConditions = ['anxiety', 'depression', 'ptsd', 'sleep', 'epilepsy', 'parkinsons', 'alzheimers', 'autism', 'adhd', 'schizophrenia', 'addiction', 'tourettes', 'stress', 'neurological', 'chronic_pain', 'neuropathic_pain', 'arthritis', 'fibromyalgia', 'ms', 'inflammation', 'migraines', 'crohns', 'ibs', 'nausea', 'cancer', 'chemo_side_effects', 'acne', 'psoriasis', 'eczema', 'heart', 'blood_pressure', 'diabetes', 'obesity', 'athletic', 'veterinary', 'aging', 'womens', 'covid', 'glaucoma'];

  const dbSlugs = all?.map(c => c.slug) || [];
  const missingFromDb = researchConditions.filter(c => !dbSlugs.includes(c));

  if (missingFromDb.length > 0) {
    console.log('\nConditions in research-conditions.ts but NOT in kb_conditions:');
    missingFromDb.forEach(c => console.log('  -', c));
  }

  // Show all published conditions
  console.log('\nAll published conditions:');
  published?.forEach(c => console.log('  -', c.slug, ':', c.name, `(${c.category})`));
}

check();
