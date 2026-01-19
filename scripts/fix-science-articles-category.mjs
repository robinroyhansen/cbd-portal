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

async function main() {
  // Step 1: Check if 'science' category exists
  console.log('Checking for science category...');
  const { data: existingCategory } = await supabase
    .from('kb_categories')
    .select('id, slug, name')
    .eq('slug', 'science')
    .single();

  let categoryId;

  if (existingCategory) {
    console.log('Science category already exists:', existingCategory.id);
    categoryId = existingCategory.id;
  } else {
    // Create the science category
    console.log('Creating science category...');
    const { data: newCategory, error: catError } = await supabase
      .from('kb_categories')
      .insert({
        name: 'Science',
        slug: 'science',
        description: 'Scientific explanations of cannabinoids, the endocannabinoid system, receptors, and how CBD works in the body.'
      })
      .select()
      .single();

    if (catError) {
      console.error('Error creating category:', catError);
      return;
    }
    console.log('Created science category:', newCategory.id);
    categoryId = newCategory.id;
  }

  // Step 2: List of science article slugs to update
  const scienceArticleSlugs = [
    'how-cbd-works',
    'endocannabinoid-system',
    'entourage-effect',
    'cb1-receptors',
    'cb2-receptors',
    'anandamide',
    '2-ag',
    'gpr55-receptor',
    'trpv-receptors',
    'faah-enzyme'
  ];

  // Step 3: Update each article to link to the science category
  console.log('\nUpdating articles to link to science category...');

  for (const slug of scienceArticleSlugs) {
    const { data, error } = await supabase
      .from('kb_articles')
      .update({ category_id: categoryId })
      .eq('slug', slug)
      .select('id, slug, title')
      .single();

    if (error) {
      console.log(`  ✗ ${slug}: ${error.message}`);
    } else if (data) {
      console.log(`  ✓ ${slug}: Updated`);
    } else {
      console.log(`  - ${slug}: Not found`);
    }
  }

  // Step 4: Verify the update
  console.log('\nVerifying articles in science category...');
  const { data: articles, error: verifyError } = await supabase
    .from('kb_articles')
    .select('slug, title')
    .eq('category_id', categoryId)
    .eq('status', 'published')
    .order('published_at', { ascending: false });

  if (verifyError) {
    console.error('Verification error:', verifyError);
  } else {
    console.log(`\nFound ${articles.length} articles in science category:`);
    articles.forEach(a => console.log(`  - ${a.slug}: ${a.title}`));
  }

  console.log('\nDone! Articles should now appear at /categories/science');
}

main();
