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
  // Check kb_conditions
  const { data: conditions, error: condErr } = await supabase.from('kb_conditions').select('*').limit(5);
  console.log('=== kb_conditions ===');
  console.log('Error:', condErr);
  console.log('Sample data:', conditions?.length || 0, 'rows');
  if (conditions?.length > 0) console.log('First row:', conditions[0]);

  // Check kb_research_queue
  const { data: research, error: resErr } = await supabase.from('kb_research_queue').select('*').limit(5);
  console.log('\n=== kb_research_queue ===');
  console.log('Error:', resErr);
  console.log('Sample data:', research?.length || 0, 'rows');
  if (research?.length > 0) console.log('First row keys:', Object.keys(research[0]));

  // Count total in research
  const { count: resCount } = await supabase.from('kb_research_queue').select('*', { count: 'exact', head: true });
  console.log('Total rows in kb_research_queue:', resCount);

  // Count approved
  const { count: approvedCount } = await supabase.from('kb_research_queue').select('*', { count: 'exact', head: true }).eq('status', 'approved');
  console.log('Approved rows:', approvedCount);

  // Check kb_glossary_terms
  const { count: glossaryCount } = await supabase.from('kb_glossary_terms').select('*', { count: 'exact', head: true });
  console.log('\n=== kb_glossary_terms ===');
  console.log('Total:', glossaryCount);
}
main();
