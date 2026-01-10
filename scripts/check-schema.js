const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const [key, ...val] = line.split('=');
  if (key && val.length) env[key.trim()] = val.join('=').trim();
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  // Get a study WITH abstract
  const { data, error } = await supabase
    .from('kb_research_queue')
    .select('id, title, abstract, relevant_topics, url')
    .eq('status', 'approved')
    .not('abstract', 'is', null)
    .limit(3);

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('Studies with abstracts:');
  data.forEach((s, i) => {
    console.log(`\n--- Study ${i+1} ---`);
    console.log('Title:', s.title.substring(0, 80) + '...');
    console.log('Abstract length:', s.abstract.length, 'chars');
    console.log('Topics:', s.relevant_topics);
    console.log('URL:', s.url);
  });

  // Count studies with abstracts
  const { count } = await supabase
    .from('kb_research_queue')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'approved')
    .not('abstract', 'is', null);

  console.log('\n\nTotal studies with abstracts:', count);
}

check();
