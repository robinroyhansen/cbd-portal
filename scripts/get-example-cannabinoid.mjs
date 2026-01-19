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
  const { data } = await supabase.from('kb_articles')
    .select('*')
    .eq('slug', 'what-is-cbg')
    .single();

  console.log('=== ARTICLE STRUCTURE ===\n');
  console.log('Title:', data.title);
  console.log('Slug:', data.slug);
  console.log('Excerpt:', data.excerpt);
  console.log('Article Type:', data.article_type);
  console.log('Category ID:', data.category_id);
  console.log('Reading Time:', data.reading_time);
  console.log('Meta Title:', data.meta_title);
  console.log('Meta Description:', data.meta_description);
  console.log('\n=== CONTENT (first 3000 chars) ===\n');
  console.log(data.content?.substring(0, 3000));
}
main();
