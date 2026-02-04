import { config } from 'dotenv';
config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const translations = [
  { id: 'b5aab7c7-dab4-4a65-adfd-7d7023b67b9c', slug: 'cbd-and-circulation', title: 'CBD und Durchblutung: Was die Forschung zeigt 2026', meta: 'Was sagt die Forschung über CBD für Durchblutung? Review von 58 Studien. Evidenzniveau: Begrenzt. Gefäßerweiterung und mehr.' },
  { id: '85af7a36-2129-4713-ba72-246fe689508c', slug: 'cbd-and-better-rest', title: 'CBD und bessere Erholung: Was die Forschung zeigt 2026', meta: 'Was sagt die Forschung über CBD für bessere Erholung? Review von 136 Studien. Evidenzniveau: Moderat. Schlafförderung und mehr.' },
  { id: '9fe0f3b6-fb0f-411c-9047-263a54a8db5d', slug: 'cbd-and-chronic-fatigue', title: 'CBD und chronische Erschöpfung: Was die Forschung zeigt 2026', meta: 'Was sagt die Forschung über CBD für chronische Erschöpfung? Review von 55 Studien. Evidenzniveau: Begrenzt. Energieregulation und mehr.' },
  { id: 'cf156210-5fdc-443b-81f7-744f6dd1ef44', slug: 'cbd-and-muscle-tension', title: 'CBD und Muskelverspannung: Was die Forschung zeigt 2026', meta: 'Was sagt die Forschung über CBD für Muskelverspannung? Review von 186 Studien. Evidenzniveau: Begrenzt. Muskelentspannung und mehr.' },
  { id: 'eb4a00e0-893a-4472-b3b8-de204016c93d', slug: 'cbd-and-overuse-injuries', title: 'CBD und Überlastungsverletzungen: Was die Forschung zeigt 2026', meta: 'Was sagt die Forschung über CBD für Überlastungsverletzungen? Review von 191 Studien. Evidenzniveau: Begrenzt. Chronische Entzündungsreduzierung und mehr.' },
  { id: 'da0bb058-714a-4463-87e9-fad801e02ed8', slug: 'cbd-and-physical-therapy', title: 'CBD und Physiotherapie: Was die Forschung zeigt 2026', meta: 'Was sagt die Forschung über CBD für Physiotherapie? Review von 189 Studien. Evidenzniveau: Begrenzt. Schmerzreduktion und mehr.' },
  { id: '236e106a-147a-48de-a67b-06b2df511e38', slug: 'cbd-and-workout-recovery', title: 'CBD und Trainingserholung: Was die Forschung zeigt 2026', meta: 'Was sagt die Forschung über CBD für Trainingserholung? Review von 295 Studien. Evidenzniveau: Begrenzt. Entzündungshemmende Wirkung und mehr.' },
];

async function main() {
  let success = 0;
  let failed = 0;
  
  for (const t of translations) {
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
        article_id: t.id,
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
