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
  // Cannabinoids category ID
  const cannabinoidsCategoryId = 'b6b0dd3c-d0a8-485c-84a6-5c5a850b0d61';

  // Articles that should be in the cannabinoids category
  const cannabinoidSlugs = [
    'what-is-cbd',
    'what-is-cbg',
    'what-is-cbn',
    'what-is-cbc',
    'what-is-cbda',
    'what-is-thca',
    'what-is-thcv',
    'what-is-delta-8-thc',
    'what-are-cannabinoids'
    // what-is-thc is already in the correct category
  ];

  console.log('Updating cannabinoid articles to cannabinoids category...\n');

  for (const slug of cannabinoidSlugs) {
    const { data, error } = await supabase.from('kb_articles')
      .update({ category_id: cannabinoidsCategoryId })
      .eq('slug', slug)
      .select('slug, category_id');

    if (error) {
      console.log(`❌ ${slug}: ${error.message}`);
    } else {
      console.log(`✅ ${slug}: moved to cannabinoids category`);
    }
  }

  // Verify the change
  console.log('\n=== VERIFICATION ===');
  const { data: updated } = await supabase.from('kb_articles')
    .select('slug, category_id')
    .eq('category_id', cannabinoidsCategoryId);

  console.log(`\nArticles now in cannabinoids category: ${updated?.length}`);
  updated?.forEach(a => console.log(`  - ${a.slug}`));
}
main();
