#!/usr/bin/env node

const https = require('https');
const fs = require('fs');

const SUPABASE_URL = 'https://bvrdryvgqarffgdujmjz.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2cmRyeXZncWFyZmZnZHVqbWp6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzkwMTc5NywiZXhwIjoyMDgzNDc3Nzk3fQ.SmqoTgGp3J6JEOuOiEl7IMd8whWz4qAvQABM7AUc7kY';

function makeRequest(url, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      method: method,
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(url, options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(body);
          resolve({ status: res.statusCode, data: result });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

function generateSlug(text) {
  return text
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

const conditionTranslations = [
  // First batch of 36 condition translations
  { slug: 'anxiety', name: 'Angst', description: 'Eine häufige psychische Erkrankung, die durch Gefühle der Sorge, Angst oder Furcht gekennzeichnet ist.' },
  { slug: 'chronic-pain', name: 'Chronische Schmerzen', description: 'Anhaltende Schmerzen, die länger als drei bis sechs Monate andauern.' },
  { slug: 'epilepsy', name: 'Epilepsie', description: 'Eine neurologische Erkrankung, die durch wiederkehrende Anfälle gekennzeichnet ist.' },
  { slug: 'insomnia', name: 'Schlaflosigkeit', description: 'Eine Schlafstörung, die das Einschlafen oder Durchschlafen erschwert.' },
  { slug: 'depression', name: 'Depression', description: 'Eine Stimmungsstörung, die anhaltende Gefühle der Traurigkeit und des Interessenverlusts verursacht.' },
  { slug: 'arthritis', name: 'Arthritis', description: 'Entzündung eines oder mehrerer Gelenke, die Schmerzen und Steifheit verursacht.' },
  { slug: 'fibromyalgia', name: 'Fibromyalgie', description: 'Eine Erkrankung, die durch weit verbreitete Muskel-Skelett-Schmerzen gekennzeichnet ist.' },
  { slug: 'ptsd', name: 'PTBS', description: 'Posttraumatische Belastungsstörung, die nach traumatischen Ereignissen auftreten kann.' },
  { slug: 'multiple-sclerosis', name: 'Multiple Sklerose', description: 'Eine Autoimmunerkrankung, die das zentrale Nervensystem betrifft.' },
  { slug: 'cancer', name: 'Krebs', description: 'Eine Gruppe von Krankheiten, die durch unkontrolliertes Zellwachstum gekennzeichnet sind.' },
  { slug: 'nausea', name: 'Übelkeit', description: 'Ein Gefühl der Unruhe und Unwohlsein im Magen.' },
  { slug: 'inflammation', name: 'Entzündung', description: 'Die natürliche Reaktion des Körpers auf Verletzungen oder Infektionen.' },
  { slug: 'migraines', name: 'Migräne', description: 'Wiederkehrende Kopfschmerzen, die oft von anderen Symptomen begleitet werden.' },
  { slug: 'adhd', name: 'ADHS', description: 'Aufmerksamkeitsdefizit-Hyperaktivitätsstörung, die Aufmerksamkeit und Verhalten beeinträchtigt.' },
  { slug: 'parkinsons', name: 'Parkinson-Krankheit', description: 'Eine neurodegenerative Erkrankung, die Bewegung und Koordination beeinträchtigt.' },
  { slug: 'alzheimers', name: 'Alzheimer-Krankheit', description: 'Eine fortschreitende Demenz, die Gedächtnis und kognitive Funktionen beeinträchtigt.' },
  { slug: 'autism', name: 'Autismus', description: 'Eine Entwicklungsstörung, die Kommunikation und soziale Interaktion beeinträchtigt.' },
  { slug: 'schizophrenia', name: 'Schizophrenie', description: 'Eine psychische Erkrankung, die das Denken, die Wahrnehmung und das Verhalten beeinträchtigt.' },
  { slug: 'bipolar-disorder', name: 'Bipolare Störung', description: 'Eine Stimmungsstörung mit extremen Stimmungsschwankungen.' },
  { slug: 'crohns-disease', name: 'Morbus Crohn', description: 'Eine entzündliche Darmerkrankung, die den Verdauungstrakt betrifft.' },
  { slug: 'ibs', name: 'Reizdarmsyndrom', description: 'Eine Funktionsstörung des Darms mit Bauchschmerzen und Verdauungsproblemen.' },
  { slug: 'glaucoma', name: 'Glaukom', description: 'Eine Augenerkrankung, die den Sehnerv schädigt und zur Erblindung führen kann.' },
  { slug: 'tourettes', name: 'Tourette-Syndrom', description: 'Eine neurologische Erkrankung, die durch unwillkürliche Tics gekennzeichnet ist.' },
  { slug: 'ocd', name: 'Zwangsstörung', description: 'Eine psychische Erkrankung mit wiederkehrenden, ungewollten Gedanken und Verhaltensweisen.' },
  { slug: 'eating-disorders', name: 'Essstörungen', description: 'Psychische Erkrankungen, die durch abnormales Essverhalten gekennzeichnet sind.' },
  { slug: 'addiction', name: 'Suchterkrankungen', description: 'Chronische Erkrankungen, die durch zwanghaften Substanzgebrauch gekennzeichnet sind.' },
  { slug: 'acne', name: 'Akne', description: 'Eine Hauterkrankung, die durch verstopfte Poren und Entzündungen gekennzeichnet ist.' },
  { slug: 'eczema', name: 'Ekzem', description: 'Eine Hauterkrankung, die durch Entzündungen und Juckreiz gekennzeichnet ist.' },
  { slug: 'psoriasis', name: 'Psoriasis', description: 'Eine Autoimmunerkrankung der Haut mit schuppigen, entzündeten Stellen.' },
  { slug: 'diabetes', name: 'Diabetes', description: 'Eine Stoffwechselerkrankung mit erhöhten Blutzuckerwerten.' },
  { slug: 'hypertension', name: 'Bluthochdruck', description: 'Ein Zustand mit dauerhaft erhöhtem Blutdruck in den Arterien.' },
  { slug: 'heart-disease', name: 'Herzkrankheiten', description: 'Eine Gruppe von Erkrankungen, die das Herz betreffen.' },
  { slug: 'stroke', name: 'Schlaganfall', description: 'Eine Störung der Blutversorgung des Gehirns.' },
  { slug: 'osteoporosis', name: 'Osteoporose', description: 'Eine Erkrankung mit verringerter Knochendichte und erhöhtem Frakturrisiko.' },
  { slug: 'copd', name: 'COPD', description: 'Chronisch obstruktive Lungenerkrankung mit eingeschränkter Lungenfunktion.' },
  { slug: 'asthma', name: 'Asthma', description: 'Eine chronische Atemwegserkrankung mit Entzündungen und verengten Atemwegen.' }
];

async function translateConditions() {
  try {
    console.log('🔍 Checking existing condition translations...');
    
    // Get existing German condition translations
    const existingUrl = `${SUPABASE_URL}/rest/v1/condition_translations?language_code=eq.de&select=*`;
    const existingRes = await makeRequest(existingUrl);
    
    if (existingRes.status !== 200) {
      throw new Error(`Failed to fetch existing translations: ${existingRes.status}`);
    }
    
    const existingSlugs = existingRes.data.map(item => item.slug);
    console.log(`Found ${existingSlugs.length} existing German condition translations`);
    
    // Filter out conditions that already exist
    const newTranslations = conditionTranslations.filter(condition => !existingSlugs.includes(condition.slug));
    console.log(`${newTranslations.length} new translations to add`);
    
    if (newTranslations.length === 0) {
      console.log('✅ All condition translations already exist!');
      return;
    }
    
    // Insert new translations
    for (let i = 0; i < newTranslations.length; i++) {
      const condition = newTranslations[i];
      const germanSlug = generateSlug(condition.name);
      
      const translationData = {
        slug: condition.slug,
        language_code: 'de',
        name: condition.name,
        description: condition.description,
        slug_localized: germanSlug
      };
      
      console.log(`Adding translation ${i + 1}/${newTranslations.length}: ${condition.name} (${condition.slug})`);
      
      const insertUrl = `${SUPABASE_URL}/rest/v1/condition_translations`;
      const insertRes = await makeRequest(insertUrl, 'POST', translationData);
      
      if (insertRes.status !== 201) {
        console.error(`❌ Failed to insert ${condition.slug}:`, insertRes.data);
      } else {
        console.log(`✅ Added ${condition.name}`);
      }
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log(`✅ Condition translation batch complete: ${newTranslations.length} translations added`);
    
  } catch (error) {
    console.error('❌ Error translating conditions:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  translateConditions();
}