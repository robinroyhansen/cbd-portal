import { createClient } from '@supabase/supabase-js';
import { writeFileSync } from 'fs';

const supabase = createClient(
  'https://bvrdryvgqarffgdujmjz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2cmRyeXZncWFyZmZnZHVqbWp6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzkwMTc5NywiZXhwIjoyMDgzNDc3Nzk3fQ.SmqoTgGp3J6JEOuOiEl7IMd8whWz4qAvQABM7AUc7kY'
);

async function fetchBatch(limit = 50) {
  // First get all translated article IDs for German
  const { data: translated, error: transError } = await supabase
    .from('article_translations')
    .select('article_id')
    .eq('language', 'de');
  
  if (transError) {
    console.error('Error fetching translations:', transError);
    return;
  }
  
  const translatedIds = new Set((translated || []).map(t => t.article_id));
  console.log(`Found ${translatedIds.size} already translated articles`);
  
  // Then get all articles
  const { data: allArticles, error: articlesError } = await supabase
    .from('kb_articles')
    .select('id, title, slug, excerpt, content, meta_title, meta_description')
    .order('created_at', { ascending: true });
  
  if (articlesError) {
    console.error('Error fetching articles:', articlesError);
    return;
  }
  
  // Filter to only untranslated
  const untranslated = allArticles.filter(a => !translatedIds.has(a.id));
  console.log(`Found ${untranslated.length} untranslated articles`);
  
  // Take only the requested limit
  const batch = untranslated.slice(0, limit);
  
  writeFileSync('batch-to-translate.json', JSON.stringify(batch, null, 2));
  console.log(`Saved ${batch.length} articles to batch-to-translate.json`);
  
  return batch;
}

const limit = parseInt(process.argv[2]) || 50;
fetchBatch(limit);
