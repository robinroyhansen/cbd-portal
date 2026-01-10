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
  // Get the anxiety study
  const { data: anxietyStudy } = await supabase
    .from('kb_research_queue')
    .select('id, title, relevant_topics')
    .eq('status', 'approved')
    .ilike('title', '%social anxiety%')
    .limit(1)
    .single();

  console.log('Looking for studies with PRIMARY topic:', anxietyStudy.relevant_topics[0]);
  console.log('');

  // Method 1: Use filter in JS after fetching
  const { data: allWithAnxiety } = await supabase
    .from('kb_research_queue')
    .select('id, title, relevant_topics, year')
    .eq('status', 'approved')
    .neq('id', anxietyStudy.id)
    .contains('relevant_topics', ['anxiety'])
    .order('year', { ascending: false })
    .limit(20);

  console.log('=== Before filtering (contains anxiety anywhere) ===');
  allWithAnxiety.slice(0, 5).forEach((s, i) => {
    console.log(`${i+1}. Primary: ${s.relevant_topics[0]} | ${s.title.substring(0, 50)}...`);
  });
  console.log('');

  // Filter to only keep where PRIMARY topic is anxiety
  const filtered = allWithAnxiety.filter(s => s.relevant_topics[0] === 'anxiety');
  console.log('=== After filtering (primary topic = anxiety) ===');
  filtered.slice(0, 5).forEach((s, i) => {
    console.log(`${i+1}. Primary: ${s.relevant_topics[0]} | ${s.title.substring(0, 50)}...`);
  });
  console.log('Total filtered:', filtered.length);
}

debug();
