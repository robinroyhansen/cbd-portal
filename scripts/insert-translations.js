import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bvrdryvgqarffgdujmjz.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

// Read translations from stdin (JSON array)
const input = await new Promise((resolve) => {
  let data = '';
  process.stdin.on('data', chunk => data += chunk);
  process.stdin.on('end', () => resolve(data));
});

const translations = JSON.parse(input);

let success = 0;
let failed = 0;

for (const t of translations) {
  const { error } = await supabase
    .from('research_translations')
    .insert({
      research_id: t.id,
      language: 'de',
      plain_summary: t.translation
    });

  if (error) {
    console.error(`Failed ${t.id}:`, error.message);
    failed++;
  } else {
    success++;
  }
}

console.log(`Done: ${success} inserted, ${failed} failed`);
