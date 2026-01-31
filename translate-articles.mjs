import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://bvrdryvgqarffgdujmjz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2cmRyeXZncWFyZmZnZHVqbWp6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzkwMTc5NywiZXhwIjoyMDgzNDc3Nzk3fQ.SmqoTgGp3J6JEOuOiEl7IMd8whWz4qAvQABM7AUc7kY'
);

// Check tables and existing translations
async function checkStatus() {
  // Get total articles
  const { count: totalArticles } = await supabase
    .from('kb_articles')
    .select('*', { count: 'exact', head: true });
  
  // Get existing German translations
  const { count: existingTranslations } = await supabase
    .from('article_translations')
    .select('*', { count: 'exact', head: true })
    .eq('language', 'de');
  
  console.log(`Total articles: ${totalArticles}`);
  console.log(`Existing German translations: ${existingTranslations}`);
  console.log(`Remaining to translate: ${totalArticles - existingTranslations}`);
  
  // Get sample article structure
  const { data: sample } = await supabase
    .from('kb_articles')
    .select('*')
    .limit(1);
  
  console.log('\nSample article structure:');
  console.log(JSON.stringify(sample[0], null, 2));
  
  // Get translation table structure
  const { data: transSample } = await supabase
    .from('article_translations')
    .select('*')
    .limit(1);
  
  console.log('\nTranslation table structure:');
  console.log(transSample ? JSON.stringify(transSample[0], null, 2) : 'No translations yet');
}

checkStatus();
