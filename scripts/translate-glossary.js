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

const glossaryTranslations = [
  // First batch of 40 glossary translations
  { slug: 'cbd', term: 'CBD', definition: 'Cannabidiol - ein nicht-psychoaktives Cannabinoid, das in Cannabis-Pflanzen gefunden wird und für seine therapeutischen Eigenschaften bekannt ist.' },
  { slug: 'thc', term: 'THC', definition: 'Tetrahydrocannabinol - das primäre psychoaktive Cannabinoid in Cannabis, das für die "High"-Wirkung verantwortlich ist.' },
  { slug: 'cannabinoids', term: 'Cannabinoide', definition: 'Eine Gruppe von chemischen Verbindungen, die in Cannabis-Pflanzen vorkommen oder vom menschlichen Körper produziert werden.' },
  { slug: 'endocannabinoid-system', term: 'Endocannabinoid-System', definition: 'Ein biologisches System im menschlichen Körper, das aus Endocannabinoiden, Rezeptoren und Enzymen besteht.' },
  { slug: 'cb1-receptors', term: 'CB1-Rezeptoren', definition: 'Cannabinoid-Rezeptoren, die hauptsächlich im Gehirn und zentralen Nervensystem zu finden sind.' },
  { slug: 'cb2-receptors', term: 'CB2-Rezeptoren', definition: 'Cannabinoid-Rezeptoren, die hauptsächlich im Immunsystem und in peripheren Geweben zu finden sind.' },
  { slug: 'terpenes', term: 'Terpene', definition: 'Aromatische Verbindungen in Cannabis und anderen Pflanzen, die Geschmack, Geruch und möglicherweise therapeutische Wirkungen beeinflussen.' },
  { slug: 'full-spectrum', term: 'Vollspektrum', definition: 'CBD-Produkte, die alle natürlichen Verbindungen der Cannabis-Pflanze enthalten, einschließlich geringer THC-Mengen.' },
  { slug: 'broad-spectrum', term: 'Breitspektrum', definition: 'CBD-Produkte, die mehrere Cannabis-Verbindungen enthalten, jedoch kein THC.' },
  { slug: 'isolate', term: 'Isolat', definition: 'Reines CBD ohne andere Cannabis-Verbindungen, normalerweise in kristalliner Form.' },
  { slug: 'co2-extraction', term: 'CO2-Extraktion', definition: 'Eine Methode zur Extraktion von CBD und anderen Cannabinoiden unter Verwendung von überkritischem Kohlendioxid.' },
  { slug: 'solvent-extraction', term: 'Lösungsmittelextraktion', definition: 'Eine Methode zur Extraktion von Cannabinoiden unter Verwendung von Lösungsmitteln wie Ethanol oder Butan.' },
  { slug: 'decarboxylation', term: 'Decarboxylierung', definition: 'Ein Erhitzungsprozess, der CBDA in aktives CBD umwandelt, um die Bioverfügbarkeit zu erhöhen.' },
  { slug: 'bioavailability', term: 'Bioverfügbarkeit', definition: 'Der Grad, in dem CBD vom Körper absorbiert und dem Kreislauf zur Verfügung gestellt wird.' },
  { slug: 'sublingual', term: 'Sublingual', definition: 'Eine Verabreichungsmethode, bei der CBD unter die Zunge gegeben wird für schnelle Absorption.' },
  { slug: 'topical', term: 'Topisch', definition: 'CBD-Produkte, die direkt auf die Haut aufgetragen werden, wie Cremes, Balsame oder Lotionen.' },
  { slug: 'edibles', term: 'Esswaren', definition: 'CBD-Produkte, die oral eingenommen werden, wie Gummis, Kapseln oder mit CBD angereicherte Lebensmittel.' },
  { slug: 'vaping', term: 'Verdampfen', definition: 'Eine Methode des CBD-Konsums durch Inhalation von verdampftem CBD-Öl oder -Blüten.' },
  { slug: 'dosage', term: 'Dosierung', definition: 'Die Menge an CBD, die für therapeutische Wirkungen eingenommen wird, normalerweise in Milligramm gemessen.' },
  { slug: 'start-low-go-slow', term: 'Niedrig beginnen, langsam steigern', definition: 'Eine Dosierungsstrategie, die mit kleinen CBD-Dosen beginnt und diese allmählich erhöht.' },
  { slug: 'entourage-effect', term: 'Entourage-Effekt', definition: 'Die Theorie, dass Cannabis-Verbindungen zusammenwirken, um verstärkte therapeutische Wirkungen zu erzielen.' },
  { slug: 'hemp', term: 'Hanf', definition: 'Cannabis-Pflanzen mit weniger als 0,3% THC, die legal für CBD-Produktion angebaut werden.' },
  { slug: 'marijuana', term: 'Marihuana', definition: 'Cannabis-Pflanzen mit höheren THC-Gehalten, die psychoaktive Wirkungen haben.' },
  { slug: 'indica', term: 'Indica', definition: 'Ein Cannabis-Stamm, der traditionell mit entspannenden und sedierenden Wirkungen in Verbindung gebracht wird.' },
  { slug: 'sativa', term: 'Sativa', definition: 'Ein Cannabis-Stamm, der traditionell mit energetisierenden und erhebenden Wirkungen in Verbindung gebracht wird.' },
  { slug: 'hybrid', term: 'Hybrid', definition: 'Cannabis-Pflanzen, die aus der Kreuzung von Indica- und Sativa-Stämmen entstehen.' },
  { slug: 'psychoactive', term: 'Psychoaktiv', definition: 'Substanzen, die das Bewusstsein, die Stimmung oder die Wahrnehmung verändern.' },
  { slug: 'non-psychoactive', term: 'Nicht-psychoaktiv', definition: 'Substanzen, die keine bewusstseinsverändernden Wirkungen haben, wie CBD.' },
  { slug: 'tolerance', term: 'Toleranz', definition: 'Die Verringerung der Reaktion auf eine Substanz nach wiederholter Anwendung.' },
  { slug: 'side-effects', term: 'Nebenwirkungen', definition: 'Unerwünschte Wirkungen, die zusätzlich zu den beabsichtigten therapeutischen Wirkungen auftreten können.' },
  { slug: 'drug-interactions', term: 'Arzneimittelwechselwirkungen', definition: 'Wenn CBD die Wirkung anderer Medikamente verstärkt oder verringert.' },
  { slug: 'third-party-testing', term: 'Drittanbieter-Tests', definition: 'Unabhängige Laboranalysen zur Überprüfung der Reinheit und Potenz von CBD-Produkten.' },
  { slug: 'certificate-of-analysis', term: 'Analysezertifikat', definition: 'Ein Dokument, das die Zusammensetzung und Reinheit eines CBD-Produkts bestätigt.' },
  { slug: 'mg', term: 'mg', definition: 'Milligramm - die Standardmesseinheit für CBD-Dosierungen.' },
  { slug: 'carrier-oil', term: 'Trägeröl', definition: 'Ein Öl wie MCT oder Hanfsamenöl, das zur Verdünnung und besseren Absorption von CBD verwendet wird.' },
  { slug: 'mct-oil', term: 'MCT-Öl', definition: 'Mittelkettige Triglyceride - ein beliebtes Trägeröl für CBD-Tinkturen aufgrund seiner guten Absorption.' },
  { slug: 'hemp-seed-oil', term: 'Hanfsamenöl', definition: 'Ein nahrhaftes Öl aus Hanfsamen, das als Trägeröl für CBD-Produkte verwendet wird.' },
  { slug: 'water-soluble', term: 'Wasserlöslich', definition: 'CBD, das chemisch modifiziert wurde, um sich besser in Wasser zu lösen und die Absorption zu verbessern.' },
  { slug: 'nanoemulsion', term: 'Nanoemulsion', definition: 'Eine Technologie, die CBD-Partikel verkleinert, um die Bioverfügbarkeit zu erhöhen.' },
  { slug: 'liposomal', term: 'Liposomal', definition: 'Eine Abgabemethode, die Lipidvesikel verwendet, um die CBD-Absorption zu verbessern.' }
];

async function translateGlossary() {
  try {
    console.log('🔍 Checking existing glossary translations...');
    
    // Get existing German glossary translations
    const existingUrl = `${SUPABASE_URL}/rest/v1/glossary_translations?language_code=eq.de&select=*`;
    const existingRes = await makeRequest(existingUrl);
    
    if (existingRes.status !== 200) {
      throw new Error(`Failed to fetch existing translations: ${existingRes.status}`);
    }
    
    const existingSlugs = existingRes.data.map(item => item.slug);
    console.log(`Found ${existingSlugs.length} existing German glossary translations`);
    
    // Filter out glossary terms that already exist
    const newTranslations = glossaryTranslations.filter(glossary => !existingSlugs.includes(glossary.slug));
    console.log(`${newTranslations.length} new translations to add`);
    
    if (newTranslations.length === 0) {
      console.log('✅ All glossary translations already exist!');
      return;
    }
    
    // Insert new translations
    for (let i = 0; i < newTranslations.length; i++) {
      const glossary = newTranslations[i];
      const germanSlug = generateSlug(glossary.term);
      
      const translationData = {
        slug: glossary.slug,
        language_code: 'de',
        term: glossary.term,
        definition: glossary.definition,
        slug_localized: germanSlug
      };
      
      console.log(`Adding translation ${i + 1}/${newTranslations.length}: ${glossary.term} (${glossary.slug})`);
      
      const insertUrl = `${SUPABASE_URL}/rest/v1/glossary_translations`;
      const insertRes = await makeRequest(insertUrl, 'POST', translationData);
      
      if (insertRes.status !== 201) {
        console.error(`❌ Failed to insert ${glossary.slug}:`, insertRes.data);
      } else {
        console.log(`✅ Added ${glossary.term}`);
      }
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log(`✅ Glossary translation batch complete: ${newTranslations.length} translations added`);
    
  } catch (error) {
    console.error('❌ Error translating glossary:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  translateGlossary();
}