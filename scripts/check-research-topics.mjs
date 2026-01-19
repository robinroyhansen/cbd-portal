import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
function loadEnv() {
  const envContent = readFileSync(join(__dirname, '../.env.local'), 'utf8');
  const envVars = {};
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      let value = match[2].trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
      envVars[match[1].trim()] = value;
    }
  });
  return envVars;
}
const env = loadEnv();
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  // Get a sample of approved research to see what fields exist
  const { data: sample } = await supabase.from('kb_research_queue')
    .select('relevant_topics, matched_conditions, search_term_matched')
    .eq('status', 'approved')
    .limit(10);

  console.log('Sample research topics:');
  sample?.forEach((r, i) => {
    console.log(`\n--- Study ${i+1} ---`);
    console.log('relevant_topics:', r.relevant_topics);
    console.log('matched_conditions:', r.matched_conditions);
    console.log('search_term_matched:', r.search_term_matched);
  });

  // Count by relevant_topics
  const { data: allApproved } = await supabase.from('kb_research_queue')
    .select('relevant_topics, matched_conditions, search_term_matched')
    .eq('status', 'approved');

  const topicCounts = {};
  const conditionCounts = {};
  const searchTermCounts = {};

  allApproved?.forEach(r => {
    if (r.relevant_topics && Array.isArray(r.relevant_topics)) {
      r.relevant_topics.forEach(t => {
        topicCounts[t] = (topicCounts[t] || 0) + 1;
      });
    }
    if (r.matched_conditions && Array.isArray(r.matched_conditions)) {
      r.matched_conditions.forEach(c => {
        conditionCounts[c] = (conditionCounts[c] || 0) + 1;
      });
    }
    if (r.search_term_matched) {
      searchTermCounts[r.search_term_matched] = (searchTermCounts[r.search_term_matched] || 0) + 1;
    }
  });

  console.log('\n\n=== TOPIC COUNTS (relevant_topics) ===');
  Object.entries(topicCounts).sort((a,b) => b[1]-a[1]).forEach(([t, c]) => {
    console.log(`${t}: ${c}`);
  });

  console.log('\n\n=== CONDITION COUNTS (matched_conditions) ===');
  Object.entries(conditionCounts).sort((a,b) => b[1]-a[1]).slice(0, 30).forEach(([t, c]) => {
    console.log(`${t}: ${c}`);
  });

  console.log('\n\n=== SEARCH TERM COUNTS (top 30) ===');
  Object.entries(searchTermCounts).sort((a,b) => b[1]-a[1]).slice(0, 30).forEach(([t, c]) => {
    console.log(`${t}: ${c}`);
  });

  console.log('\n\nTotal approved studies:', allApproved?.length);
  console.log('Studies with relevant_topics:', allApproved?.filter(r => r.relevant_topics?.length > 0).length);
  console.log('Studies with matched_conditions:', allApproved?.filter(r => r.matched_conditions?.length > 0).length);
}
main();
