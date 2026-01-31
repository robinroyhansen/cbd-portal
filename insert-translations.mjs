import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const supabase = createClient(
  'https://bvrdryvgqarffgdujmjz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2cmRyeXZncWFyZmZnZHVqbWp6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzkwMTc5NywiZXhwIjoyMDgzNDc3Nzk3fQ.SmqoTgGp3J6JEOuOiEl7IMd8whWz4qAvQABM7AUc7kY'
);

async function insertTranslations(filename) {
  const translations = JSON.parse(readFileSync(filename, 'utf-8'));
  
  console.log(`Inserting ${translations.length} translations from ${filename}...`);
  let inserted = 0;
  
  for (const t of translations) {
    const { error } = await supabase
      .from('article_translations')
      .insert({
        article_id: t.article_id,
        language: t.language,
        slug: t.slug,
        title: t.title,
        content: t.content,
        excerpt: t.excerpt,
        meta_title: t.meta_title,
        meta_description: t.meta_description,
        translation_quality: t.translation_quality
      });
    
    if (error) {
      console.error(`✗ Error: ${t.title} - ${error.message}`);
    } else {
      console.log(`✓ ${t.title}`);
      inserted++;
    }
  }
  
  // Check total count
  const { count } = await supabase
    .from('article_translations')
    .select('*', { count: 'exact', head: true })
    .eq('language', 'de');
  
  console.log(`\nInserted: ${inserted}/${translations.length}`);
  console.log(`Total German translations: ${count}/1259`);
}

const filename = process.argv[2] || 'translations-batch-1.json';
insertTranslations(filename);
