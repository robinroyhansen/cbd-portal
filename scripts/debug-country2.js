const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envFile = fs.readFileSync('/Users/robinroyhansen/projects/cbd-portal/.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const [key, ...val] = line.split('=');
  if (key && val.length) env[key.trim()] = val.join('=').trim();
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function debug() {
  // Check the country field value for social anxiety study
  const { data: study } = await supabase
    .from('kb_research_queue')
    .select('id, title, country')
    .eq('status', 'approved')
    .ilike('title', '%social anxiety%')
    .limit(1)
    .single();

  console.log('=== Social Anxiety Study ===');
  console.log('Title:', study.title.substring(0, 60) + '...');
  console.log('Country field value:', study.country);
  console.log('');

  // Check how many studies have country values
  const { data: withCountry } = await supabase
    .from('kb_research_queue')
    .select('id, title, country')
    .eq('status', 'approved')
    .not('country', 'is', null)
    .limit(5);

  console.log('=== Studies WITH country values ===');
  console.log('Count:', withCountry.length);
  withCountry.forEach((s, i) => {
    console.log(`${i+1}. ${s.country} - ${s.title.substring(0, 50)}...`);
  });
  console.log('');

  // Check ClinicalTrials.gov studies - they might have location info
  const { data: ctGov } = await supabase
    .from('kb_research_queue')
    .select('id, title, country, abstract')
    .eq('status', 'approved')
    .eq('source_site', 'ClinicalTrials.gov')
    .limit(3);

  console.log('=== ClinicalTrials.gov Studies ===');
  ctGov.forEach((s, i) => {
    console.log(`${i+1}. Country: ${s.country}`);
    console.log(`   Title: ${s.title.substring(0, 50)}...`);
    // Check if USA or location in abstract
    if (s.abstract && (s.abstract.toLowerCase().includes('usa') || s.abstract.toLowerCase().includes('united states'))) {
      console.log('   Abstract mentions USA/United States');
    }
  });
}

debug();
