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
  // Get all categories
  const { data: categories } = await supabase.from('kb_categories').select('*').order('name');
  console.log('=== CATEGORIES ===');
  categories.forEach(c => console.log(c.slug + ' | ' + c.name));
  
  // Get all unique article_types
  const { data: articles } = await supabase.from('kb_articles').select('article_type');
  const types = [...new Set(articles.map(a => a.article_type))];
  console.log('\n=== ARTICLE TYPES ===');
  types.forEach(t => console.log(t));
  
  // Check for basics-related slugs
  const basicsKeywords = ['introduction', 'beginner', 'guide', 'buying', 'quality', 'hemp', 'cannabis', 'full-spectrum', 'broad-spectrum', 'isolate', 'flavonoid', 'high', 'psychoactive', 'feel', 'natural', 'made', 'drug', 'medicine', 'halal', 'kosher', 'vegan', 'myth', 'skeptic', 'why-people'];
  
  const { data: existingBasics } = await supabase.from('kb_articles')
    .select('slug, title, article_type')
    .order('slug');
  
  console.log('\n=== POTENTIAL BASICS ARTICLES ALREADY EXISTING ===');
  existingBasics.forEach(a => {
    if (basicsKeywords.some(k => a.slug.includes(k))) {
      console.log(a.slug + ' | ' + a.article_type);
    }
  });
}
main();
