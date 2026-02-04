import { config } from 'dotenv';
config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {
  const slugs = ['cbd-and-hip-pain', 'cbd-and-finger-pain', 'cbd-and-ankle-pain'];
  
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
    { slug: 'cbd-and-hip-pain', title: 'CBD und Hüftschmerzen: Was die Forschung zeigt 2026', meta: 'CBD bei Hüftschmerzen - Arthrose und tiefe Gelenkprobleme. Forschung zu oralem und topischem CBD für die Hüfte.' },
    { slug: 'cbd-and-finger-pain', title: 'CBD und Fingerschmerzen: Was die Forschung zeigt 2026', meta: 'CBD bei Fingerschmerzen - Arthritis, Sehnenscheidenentzündung und kleine Gelenke. Daumengelenk-Studie ist besonders relevant.' },
    { slug: 'cbd-and-ankle-pain', title: 'CBD und Knöchelschmerzen: Was die Forschung zeigt 2026', meta: 'CBD bei Knöchelschmerzen - Verstauchungen, Achillessehne und Arthritis. Forschung zu topischem CBD für den Knöchel.' },
  ];

  let success = 0;
  
  for (const t of translations) {
    const article = articles.find(a => a.slug === t.slug);
    if (!article) {
      console.log(`⚠️ Article not found: ${t.slug}`);
      continue;
    }
    
    const contentFile = path.join(__dirname, '../translations/de', `${t.slug}.md`);
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
      }
    } else {
      console.log(`✅ Inserted: ${t.slug}`);
      success++;
    }
  }
  
  console.log(`\n✅ Success: ${success}`);
}

main().catch(console.error);
