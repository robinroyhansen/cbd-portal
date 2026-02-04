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
  { id: 'fa4ee134-2e07-494d-8541-2db3def9564e', slug: 'cbd-for-chefs', title: 'CBD für Köche: Schmerz, Stress und Küchenanforderungen', meta: 'Wie CBD Köchen bei der Bewältigung von chronischen Schmerzen, Verbrennungen und Küchenstress helfen kann. Evidenz aus 178 Schmerz- und 86 Angststudien ausgewertet.' },
  { id: '3959a707-08ff-4bba-ba77-868c6b795191', slug: 'cbd-for-therapists', title: 'CBD für Therapeuten: Mitgefühlsmüdigkeit und sekundäres Trauma', meta: 'Wie CBD Therapeuten bei der Bewältigung von Mitgefühlsmüdigkeit, sekundärem Trauma und beruflichem Burnout helfen kann. Evidenz aus Angstforschung ausgewertet.' },
  { id: '694082b2-fe6c-42e8-9b4c-50425f903ae0', slug: 'cbd-for-programmers', title: 'CBD für Programmierer: Stress, RSI und mentale Erschöpfung', meta: 'Wie CBD Programmierern bei der Bewältigung von Codestress, Verletzungen durch wiederholte Belastung und mentaler Erschöpfung helfen kann. Evidenz aus Angst- und Schmerzstudien ausgewertet.' },
  { id: 'e2646b2b-fdce-4bd4-9b8c-f612411b2895', slug: 'cbd-for-entrepreneurs', title: 'CBD für Unternehmer: Startup-Stress und Leistung bewältigen', meta: 'Wie CBD Unternehmern bei der Bewältigung von Startup-Stress, Angst und Schlafproblemen helfen kann. Evidenz aus 86 Angst- und 43 Schlafstudien ausgewertet.' },
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
