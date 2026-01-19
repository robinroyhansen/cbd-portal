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
  const { data: articles, error } = await supabase.from('kb_articles')
    .select('slug, title, article_type, category_id')
    .order('slug');

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('Total articles:', articles.length);
  console.log('\nAll slugs:');
  articles.forEach(a => console.log(a.slug + ' | type: ' + a.article_type + ' | cat: ' + (a.category_id ? 'yes' : 'NO')));
}
main();
