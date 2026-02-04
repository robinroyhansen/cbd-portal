import { config } from 'dotenv';
config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Get article IDs by querying slugs
async function main() {
  // First get IDs for these slugs
  const slugs = ['cbd-and-sports-injuries', 'cbd-and-surgery-recovery', 'cbd-and-burnout'];
  
  const { data: articles, error: articlesError } = await supabase
    .from('kb_articles')
    .select('id, slug')
    .in('slug', slugs);
    
  if (articlesError || !articles) {
    console.log('Error fetching articles:', articlesError);
    return;
  }
  
  console.log('Found articles:', articles.map(a => `${a.slug}: ${a.id}`).join(', '));
  
  const translations = [
    { slug: 'cbd-and-sports-injuries', title: 'CBD und Sportverletzungen: Was die Forschung zeigt 2026', meta: 'CBD bei Sportverletzungen - Entzündung, Schmerzlinderung und Erholung. Analyse der Forschung zu Sporterholung.' },
    { slug: 'cbd-and-surgery-recovery', title: 'CBD und Operationserholung: Was die Forschung zeigt 2026', meta: 'CBD bei der Operationserholung - Schmerzen, Entzündung und Heilung. Wichtige Überlegungen und Forschung.' },
    { slug: 'cbd-and-burnout', title: 'CBD und Burnout: Was die Forschung zeigt 2026', meta: 'CBD bei Burnout - Stress, Erschöpfung und Schlaf. Wie CBD-Forschung auf Burnout-Symptome anwendbar sein kann.' },
  ];

  let success = 0;
  let failed = 0;
  
  for (const t of translations) {
    const article = articles.find(a => a.slug === t.slug);
    if (!article) {
      console.log(`⚠️ Article not found: ${t.slug}`);
      failed++;
      continue;
    }
    
    const contentFile = path.join(__dirname, '../translations/de', `${t.slug}.md`);
    
    if (!fs.existsSync(contentFile)) {
      console.log(`⚠️ Missing file: ${contentFile}`);
      failed++;
      continue;
    }
    
    const content = fs.readFileSync(contentFile, 'utf-8');
    
    const { error } = await supabase
      .from('article_translations')
      .insert({
        article_id: article.id,
        language: 'de',
        slug: t.slug,
        title: t.title,
        content: content,
        excerpt: t.meta,
        meta_title: t.title,
        meta_description: t.meta,
      });
      
    if (error) {
      if (error.code === '23505') {
        console.log(`⏭️ Already exists: ${t.slug}`);
      } else {
        console.error(`❌ Error for ${t.slug}:`, error.message);
        failed++;
      }
    } else {
      console.log(`✅ Inserted: ${t.slug}`);
      success++;
    }
  }
  
  console.log(`\n✅ Success: ${success}, ❌ Failed: ${failed}`);
}

main().catch(console.error);
