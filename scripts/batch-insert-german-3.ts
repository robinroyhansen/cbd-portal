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
  { id: 'e9be99de-c98d-49d8-a8ac-028c58cd1d79', slug: 'cbd-for-architects', title: 'CBD für Architekten: Was die Forschung zeigt 2026', meta: 'CBD-Forschung relevant für Architekten erkunden. Studien zu Stress, Kreativität und Schreibtischarbeitbelastung können bei den einzigartigen Anforderungen architektonischer Praxis helfen.' },
  { id: '56b8d6ef-8fc0-406c-a54f-0020bee952d8', slug: 'cbd-for-hairdressers', title: 'CBD für Friseure: Was die Forschung zeigt 2026', meta: 'Erfahren Sie, was CBD-Forschung zu Herausforderungen sagt, denen Friseure begegnen. Studien zu Schmerz, Entzündung und Stress können bei Stehermüdung und wiederholter Belastung helfen.' },
  { id: '8d8f37b2-5220-4154-8462-9f0dd2bdfcf3', slug: 'cbd-for-financial-advisors', title: 'CBD für Finanzberater: Was die Forschung zeigt 2026', meta: 'CBD-Forschung relevant für Finanzberater erkunden. Studien zu Stress, Angst und kognitiver Funktion können auf die Bewältigung des Drucks der Finanzberatung anwendbar sein.' },
  { id: '804f9ff2-956b-439b-8a44-ca3ddd8fd1d3', slug: 'cbd-for-real-estate', title: 'CBD für Immobilienprofis: Was die Forschung zeigt 2026', meta: 'Erfahren Sie, was CBD-Forschung für Immobilienprofis sagt. Studien zu Angst, Stress und Schlaf können bei Kundendruck und unregelmäßigen Arbeitszeiten helfen.' },
  { id: '8d9281c5-e2c7-4df1-9d75-80465edf6058', slug: 'cbd-for-sales-professionals', title: 'CBD für Verkaufsprofis: Leistungsangst und Quotenstress', meta: 'Wie CBD Verkaufsprofis bei der Bewältigung von Ablehnungsstress, Leistungsangst und Quotendruck helfen kann. Evidenz aus 86 Angststudien ausgewertet.' },
  { id: 'e4eff60e-f716-40de-86b3-939cceb1ae83', slug: 'cbd-for-retail-workers', title: 'CBD für Einzelhandelsmitarbeiter: Fußschmerzen, Stress und Kundenanforderungen', meta: 'Wie CBD Einzelhandelsmitarbeitern bei der Bewältigung von Fußschmerzen, Kundenstress und unregelmäßigen Zeitplänen helfen kann. Evidenz aus 178 Schmerzstudien ausgewertet.' },
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
