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
  // Get the anxiety study we're looking at
  const { data: anxietyStudy, error: e1 } = await supabase
    .from('kb_research_queue')
    .select('id, title, relevant_topics, slug')
    .eq('status', 'approved')
    .ilike('title', '%social anxiety%')
    .limit(1)
    .single();

  if (e1) {
    console.error('Error finding anxiety study:', e1);
    return;
  }

  console.log('=== Current Study ===');
  console.log('ID:', anxietyStudy.id);
  console.log('Title:', anxietyStudy.title.substring(0, 60) + '...');
  console.log('Topics:', anxietyStudy.relevant_topics);
  console.log('Primary topic:', anxietyStudy.relevant_topics?.[0]);
  console.log('Topics type:', typeof anxietyStudy.relevant_topics);
  console.log('');

  const primaryTopic = anxietyStudy.relevant_topics?.[0];

  // Test the contains query
  console.log('=== Testing contains query ===');
  const { data: containsResult, error: e2 } = await supabase
    .from('kb_research_queue')
    .select('id, title, relevant_topics')
    .eq('status', 'approved')
    .neq('id', anxietyStudy.id)
    .contains('relevant_topics', [primaryTopic])
    .limit(5);

  if (e2) {
    console.error('Contains query error:', e2);
  } else {
    console.log('Contains query returned', containsResult.length, 'results:');
    containsResult.forEach((s, i) => {
      console.log(`${i+1}. Topics: ${JSON.stringify(s.relevant_topics)} - ${s.title.substring(0, 50)}...`);
    });
  }
  console.log('');

  // Test alternative: filter where first topic matches
  console.log('=== Testing overlaps query ===');
  const { data: overlapsResult, error: e3 } = await supabase
    .from('kb_research_queue')
    .select('id, title, relevant_topics')
    .eq('status', 'approved')
    .neq('id', anxietyStudy.id)
    .overlaps('relevant_topics', [primaryTopic])
    .limit(5);

  if (e3) {
    console.error('Overlaps query error:', e3);
  } else {
    console.log('Overlaps query returned', overlapsResult.length, 'results:');
    overlapsResult.forEach((s, i) => {
      console.log(`${i+1}. Topics: ${JSON.stringify(s.relevant_topics)} - ${s.title.substring(0, 50)}...`);
    });
  }
  console.log('');

  // Check what topics exist
  console.log('=== Checking all anxiety studies ===');
  const { data: allAnxiety, error: e4 } = await supabase
    .from('kb_research_queue')
    .select('id, title, relevant_topics')
    .eq('status', 'approved')
    .limit(100);

  if (e4) {
    console.error('Error:', e4);
  } else {
    const anxietyStudies = allAnxiety.filter(s =>
      s.relevant_topics && s.relevant_topics.includes('anxiety')
    );
    console.log('Found', anxietyStudies.length, 'studies with anxiety in topics:');
    anxietyStudies.slice(0, 5).forEach((s, i) => {
      console.log(`${i+1}. ${JSON.stringify(s.relevant_topics)} - ${s.title.substring(0, 50)}...`);
    });
  }
}

debug();
