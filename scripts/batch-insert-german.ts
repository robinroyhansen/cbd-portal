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
  { id: 'ef5ade3d-5066-4425-ad05-9cb140ac3214', slug: 'cbd-and-bursitis', title: 'CBD und Schleimbeutelentzündung: Was die Forschung zeigt 2026', meta: 'CBD bei Schleimbeutelentzündung - Entzündung, Schmerzlinderung und das Endocannabinoid-System. Analyse der Gelenkentzündungsforschung angewendet auf Bursitis.' },
  { id: '56f4cb8b-7399-4b20-980b-bfcc56f0ff99', slug: 'cbd-and-joint-health', title: 'CBD und Gelenkgesundheit: Was die Forschung zeigt 2026', meta: 'Umfassende Analyse von CBD für die Gelenkgesundheit - Arthritisforschung, Entzündungsstudien und die Rolle des Endocannabinoid-Systems bei der Gelenkfunktion.' },
  { id: '779c4f42-f760-4008-9434-bd745fb29763', slug: 'cbd-and-hot-tub', title: 'CBD und Whirlpool: Was die Forschung zeigt 2026', meta: 'CBD mit Whirlpool-Therapie erkunden - Entspannung, Entzündung und das Endocannabinoid-System. Analyse der Forschung zu Wärmetherapie und Erholung.' },
  { id: 'b921595a-02ac-4c2a-a2b2-284d6c6db19e', slug: 'cbd-and-cold-plunge', title: 'CBD und Eisbad: Was die Forschung zeigt 2026', meta: 'CBD mit Eisbad-Therapie erkunden - Entzündung, Erholung und das Endocannabinoid-System. Analyse der Forschung zur Kaltwasserimmersion.' },
  { id: '55fd1e2a-459f-415b-a545-b994e671c8a8', slug: 'cbd-and-skiing', title: 'CBD und Skifahren: Was die Forschung zeigt 2026', meta: 'CBD für Skifahrer erkunden - Kniegesundheit, Muskelerholung und Entzündung. Analyse der Schmerzforschung angewendet auf die körperlichen Anforderungen des Skifahrens.' },
  { id: 'e4616036-5989-440f-b5e4-9c5b22fd8c85', slug: 'cbd-and-tennis', title: 'CBD und Tennis: Was die Forschung zeigt 2026', meta: 'CBD für Tennisspieler erkunden - Tennisellenbogen, Schultergesundheit und Erholung. Analyse der Schmerz- und Entzündungsforschung angewendet auf Tennisanforderungen.' },
  { id: '66beb21f-8596-4cef-8ea3-a6d5b649ef43', slug: 'cbd-and-hiking', title: 'CBD und Wandern: Was die Forschung zeigt 2026', meta: 'CBD für Wanderer erkunden - Gelenkgesundheit, Muskelerholung und Entzündung. Analyse der Schmerzforschung angewendet auf die körperlichen Anforderungen des Wanderns.' },
  { id: '1eb23e20-dd63-471b-bd40-cd15c2fa0efa', slug: 'cbd-and-weightlifters', title: 'CBD und Krafttraining: Was die Forschung zeigt 2026', meta: 'CBD für Kraftsportler erkunden - Muskelerholung, Entzündung und Gelenkgesundheit. Analyse der Schmerz- und Erholungsforschung angewendet auf Krafttraining.' },
  { id: 'c4aee737-410e-4856-aee7-a6df726f5ed6', slug: 'cbd-and-rock-climbing', title: 'CBD und Klettern: Was die Forschung zeigt 2026', meta: 'Kann CBD Kletterern bei Erholung und Gelenkgesundheit helfen? Wir analysieren Forschung zu Entzündung und Schmerz, die für die einzigartigen körperlichen Anforderungen des Kletterns relevant ist.' },
  { id: 'aa5b4786-a201-4a3c-8eb4-8cef71cea913', slug: 'cbd-and-golf', title: 'CBD und Golf: Was die Forschung zeigt 2026', meta: 'CBD für Golfer erkunden - Gelenkgesundheit, Konzentration und Erholung. Analyse der Schmerz- und Entzündungsforschung angewendet auf die körperlichen Anforderungen des Golfs.' },
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
