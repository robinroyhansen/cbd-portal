/**
 * Fetch a batch of studies for validation
 * Usage: node scripts/validation/fetch-batch.mjs <status> <offset> <limit>
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadEnv() {
  const envContent = readFileSync(join(__dirname, '../../.env.local'), 'utf8');
  const envVars = {};
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      let value = match[2].trim();
      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      envVars[key] = value;
    }
  });
  return envVars;
}

const env = loadEnv();
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const status = process.argv[2] || 'approved';
const offset = parseInt(process.argv[3]) || 0;
const limit = parseInt(process.argv[4]) || 100;

async function main() {
  const { data, error } = await supabase
    .from('kb_research_queue')
    .select('id, title, abstract, status, relevant_topics, relevance_score')
    .eq('status', status)
    .order('id')
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log(JSON.stringify(data, null, 2));
}

main();
