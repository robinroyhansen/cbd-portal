import { config } from 'dotenv';
config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {
  // Get existing German translations
  const { data: existingTranslations } = await supabase
    .from('article_translations')
    .select('article_id')
    .eq('language', 'de');

  const translatedIds = new Set(existingTranslations?.map(t => t.article_id) || []);

  // Get untranslated articles
  const { data: articles } = await supabase
    .from('kb_articles')
    .select('id, slug, title, content, meta_description')
    .eq('status', 'published')
    .order('updated_at', { ascending: false })
    .limit(100);

  const untranslated = articles?.filter(a => !translatedIds.has(a.id)) || [];
  
  // Output next 20 untranslated articles
  console.log(JSON.stringify(untranslated.slice(0, 20), null, 2));
}

main().catch(console.error);
