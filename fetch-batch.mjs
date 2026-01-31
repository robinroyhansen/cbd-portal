import { createClient } from '@supabase/supabase-js';
import { writeFileSync } from 'fs';

const supabase = createClient(
  'https://bvrdryvgqarffgdujmjz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2cmRyeXZncWFyZmZnZHVqbWp6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzkwMTc5NywiZXhwIjoyMDgzNDc3Nzk3fQ.SmqoTgGp3J6JEOuOiEl7IMd8whWz4qAvQABM7AUc7kY'
);

async function fetchBatch(offset = 0, limit = 20) {
  const { data: existing } = await supabase
    .from('article_translations')
    .select('article_id')
    .eq('language', 'de');
  
  const translatedIds = (existing || []).map(e => e.article_id);
  
  let query = supabase
    .from('kb_articles')
    .select('id, title, slug, excerpt, content, meta_title, meta_description')
    .order('created_at', { ascending: true })
    .range(offset, offset + limit - 1);
  
  if (translatedIds.length > 0) {
    query = query.not('id', 'in', `(${translatedIds.join(',')})`);
  }
  
  const { data: articles, error } = await query;
  
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  writeFileSync('batch-to-translate.json', JSON.stringify(articles, null, 2));
  console.log(`Saved ${articles.length} articles to batch-to-translate.json`);
  
  return articles;
}

fetchBatch(0, 20);
