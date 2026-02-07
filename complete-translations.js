const fs = require('fs');

// Load files
const en = require('./locales/en.json');

// Comprehensive translations for each language
const translations = {
  fi: { // Finnish
    'A-Z': 'A-Ö',
    'Research-Backed Information': 'Tutkimustaustaista tietoa',
    'Explore evidence-based research on how CBD may help with {{count}} health conditions. Each topic includes scientific studies, dosage guidance, and expert insights.': 'Tutustu näyttöön perustuvaan tutkimukseen siitä, kuinka CBD voi auttaa {{count}} terveysongelmassa. Jokainen aihe sisältää tieteellisiä tutkimuksia, annostusohjeita ja asiantuntijanäkemyksiä.',
    'Search conditions (e.g., anxiety, pain, sleep)...': 'Etsi sairauksia (esim. ahdistus, kipu, uni)...',
    'All Conditions': 'Kaikki tilanteet',
    'No Conditions Found': 'Ei tiloja löytynyt',
    'Try adjusting your search or category filter to see more results.': 'Kokeile hakusanan tai kategoriafilttereiden muokkaamista nähdäksesi lisää tuloksia.',
    'Conditions with the strongest scientific evidence': 'Tilat, joilla on vahvin tieteellinen näyttö',
    'Find conditions organized by affected area': 'Etsi oireita kehon alueen mukaan järjestettynä',
    'Search Results': 'Hakutulokset',
    'Anxiety, depression, PTSD, stress, and mood disorders': 'Ahdistus, masennus, PTSD, stressi ja mielialahäiriöt',
    'Chronic pain, arthritis, fibromyalgia, and neuropathy': 'Krooninen kipu, niveltulehdus, fibromyalgia ja neuropatia',
    'Epilepsy, Parkinson\'s, MS, and brain health': 'Epilepsia, Parkinson, MS ja aivojen terveys',
    'Acne, eczema, psoriasis, and dermatitis': 'Akne, ekseema, psoriasis ja ihottuma',
    'Digestive Health': 'Ruoansulatuksen terveys',
    'IBS, Crohn\'s, nausea, and gut health': 'IBS, Crohn, pahoinvointi ja suoliston terveys',
    'Heart health, blood pressure, and circulation': 'Sydämen terveys, verenpaine ja verenkierto',
    'Cancer & Oncology': 'Syöpä ja onkologia',
    'Diabetes, obesity, and metabolic disorders': 'Diabetes, lihavuus ja aineenvaihduntahäiriöt',
    'CBD for dogs, cats, horses, and other pets': 'CBD koirille, kissoille, hevosille ja muille lemmikeille',
    'Miscellaneous health conditions and wellness': 'Sekalaiset terveystilat ja hyvinvointi',
    'Extensive research available': 'Laajaa tutkimusta saatavilla',
    'Good research foundation': 'Hyvä tutkimuspohja',
    'Early-stage research': 'Alkuvaiheen tutkimus',
    'Preliminary': 'Alustava',
    'Very limited data': 'Hyvin rajallista tietoa',
    'Human Study': 'Ihmistutkimus',
    'Animal Study': 'Eläintutkimus',
    'Review': 'Katsaus',
    'In Vitro': 'In vitro',
    'Knowledge Base': 'Tietokanta',
    'CBD & Cannabis': 'CBD ja kannabis',
    '{{count}} terms explained — from cannabinoids and terpenes to legal terminology and product types.': '{{count}} termiä selitetty — kannabinoidit ja terpenit laillisuuden terminologiaan ja tuotetyyppeihin.',
    'Search glossary terms': 'Etsi sanakirjan termejä',
    'Search terms, synonyms...': 'Etsi termejä, synonyymejä...',
    '{{count}} suggestions found': '{{count}} ehdotusta löytyi',
    'Matched synonym': 'Vastaava synonyymi',
    'Most Popular Terms': 'Suosituimmat termit',
    'Filter by letter': 'Suodata kirjaimen mukaan',
    'All': 'Kaikki',
    'All Categories': 'Kaikki kategoriat',
    'Card view': 'Korttinäkymä',
    'Table view': 'Taulukkonäkymä',
    'View mode': 'Näkymätila',
    'No terms found': 'Termejä ei löytynyt',
    'No glossary terms match your filters': 'Sanakirjan termit eivät vastaa suodattimiasi',
    'Term': 'Termi',
    'Category': 'Kategoria',
    'Definition': 'Määritelmä',
    'Also': 'Myös',
    '{{count}} term': '{{count}} termi',
    '{{count}} terms': '{{count}} termiä',
    'Home': 'Koti',
    'Reviewed by': 'Tarkistanut',
    'Last updated': 'Viimeksi päivitetty',
    'Calculate Your CBD Dosage': 'Laske CBD-annostuksesi',
    'Get personalized dosage recommendations based on your needs.': 'Hanki henkilökohtaiset annostussuositukset tarpeidesi mukaan.',
    'Try Calculator →': 'Kokeile laskinta →',
    'View {{count}} study →': 'Katso {{count}} tutkimus →',
    'View {{count}} studies →': 'Katso {{count}} tutkimusta →',
    'Frequently Asked Questions': 'Usein kysytyt kysymykset',
    'Also Known As': 'Tunnetaan myös nimellä',
    'Learn More': 'Lue lisää',
    'Back to Glossary': 'Takaisin sanastoon',
    
    // Add more common phrases here...
    'Free CBD Tools & Calculators': 'Ilmaiset CBD-työkalut ja laskimet',
    'Evidence-based calculators to help you use CBD safely and effectively': 'Näyttöön perustuvat laskimet auttavat sinua käyttämään CBD:tä turvallisesti ja tehokkaasti',
    'Drug Interaction Checker': 'Lääkeinteraktioiden tarkistaja',
    'Essential Safety Tool': 'Olennainen turvallisuustyökalu',
    'Check potential interactions between CBD and your medications. Covers 141 common drugs including blood thinners, antidepressants, seizure medications, and more.': 'Tarkista mahdolliset interaktiot CBD:n ja lääkkeittesi välillä. Kattaa 141 yleistä lääkettä, mukaan lukien verenohentajat, masennuslääkkeet, epilepsialääkkeet ja paljon muuta.',
    '141 medications covered': '141 lääkettä kattaa',
    'Check Interactions': 'Tarkista interaktiot',
    'Dosage Calculator': 'Annostuslaskin',
    'Get personalized CBD dosing based on your weight and goals': 'Hanki henkilökohtainen CBD-annostus painosi ja tavoitteidesi perusteella',
    'Strength Calculator': 'Vahvuuslaskin',
    'Convert between %, mg/ml, and compare products': 'Muunna %-osuuksien, mg/ml:n välillä ja vertaile tuotteita',
    'Pet Dosage Calculator': 'Lemmikin annostuslaskin',
    'Species-specific dosing for dogs, cats, and horses': 'Lajispesifinen annostus koirille, kissoille ja hevosille',
    'View all tools': 'Näytä kaikki työkalut',
    'Browse All Conditions': 'Selaa kaikkia tiloja',
    
    // Research and conditions
    'Anxiety': 'Ahdistus',
    'Depression': 'Masennus',
    'PTSD': 'PTSD',
    'Sleep & Insomnia': 'Uni ja insomnia',
    'Epilepsy & Seizures': 'Epilepsia ja kohtaukset',
    'Alzheimer\'s & Dementia': 'Alzheimer ja dementia',
    'Autism & ASD': 'Autismi ja ASD',
    'ADHD': 'ADHD',
    'Schizophrenia': 'Skitsofrenia',
    'Addiction': 'Riippuvuus',
    'Tourette\'s': 'Touretten oireyhtymä',
    'Chronic Stress': 'Krooninen stressi',
    'Arthritis': 'Niveltulehdus',
    'Fibromyalgia': 'Fibromyalgia',
    'Multiple Sclerosis': 'Multippelisklerosi',
    'Inflammation': 'Tulehdus',
    'Crohn\'s Disease': 'Crohnin tauti',
    'Irritable Bowel Syndrome': 'Ärtyvä suoli -oireyhtymä',
    'Nausea': 'Pahoinvointi',
    'Acne': 'Akne',
    'Psoriasis': 'Psoriasis',
    'Eczema': 'Ekseema',
    'Heart Health': 'Sydämen terveys',
    'Blood Pressure': 'Verenpaine',
    'Diabetes': 'Diabetes',
    'Obesity': 'Lihavuus',
    'COVID-19': 'COVID-19',
    'Glaucoma': 'Glaukooma'
  },
  
  fr: { // French
    'A-Z': 'A-Z',
    'Research-Backed Information': 'Informations étayées par la recherche',
    'Explore evidence-based research on how CBD may help with {{count}} health conditions. Each topic includes scientific studies, dosage guidance, and expert insights.': 'Explorez la recherche fondée sur des preuves sur la façon dont le CBD peut aider avec {{count}} conditions de santé. Chaque sujet comprend des études scientifiques, des conseils de dosage et des informations d\'experts.',
    'All Conditions': 'Toutes les conditions',
    'No Conditions Found': 'Aucune condition trouvée',
    'Conditions with the strongest scientific evidence': 'Conditions avec les preuves scientifiques les plus solides',
    'Search Results': 'Résultats de recherche',
    'Anxiety, depression, PTSD, stress, and mood disorders': 'Anxiété, dépression, TSPT, stress et troubles de l\'humeur',
    'Digestive Health': 'Santé digestive',
    'IBS, Crohn\'s, nausea, and gut health': 'SII, Crohn, nausées et santé intestinale',
    'Heart health, blood pressure, and circulation': 'Santé cardiaque, pression artérielle et circulation',
    'Cancer & Oncology': 'Cancer et oncologie',
    'Diabetes, obesity, and metabolic disorders': 'Diabète, obésité et troubles métaboliques',
    'CBD for dogs, cats, horses, and other pets': 'CBD pour chiens, chats, chevaux et autres animaux',
    'Miscellaneous health conditions and wellness': 'Conditions de santé diverses et bien-être',
    'Extensive research available': 'Recherche approfondie disponible',
    'Good research foundation': 'Bonne base de recherche',
    'Early-stage research': 'Recherche en phase préliminaire',
    'Very limited data': 'Données très limitées',
    'Human Study': 'Étude humaine',
    'Animal Study': 'Étude animale',
    'Review': 'Revue',
    'In Vitro': 'In vitro',
    'Knowledge Base': 'Base de connaissances',
    'CBD & Cannabis': 'CBD et Cannabis',
    'Free CBD Tools & Calculators': 'Outils et calculatrices CBD gratuits',
    'Evidence-based calculators to help you use CBD safely and effectively': 'Calculatrices basées sur des preuves pour vous aider à utiliser le CBD en toute sécurité et efficacement',
    'Drug Interaction Checker': 'Vérificateur d\'interactions médicamenteuses',
    'Essential Safety Tool': 'Outil de sécurité essentiel',
    '141 medications covered': '141 médicaments couverts',
    'Check Interactions': 'Vérifier les interactions',
    'Dosage Calculator': 'Calculatrice de dosage',
    'Strength Calculator': 'Calculatrice de puissance',
    'Pet Dosage Calculator': 'Calculatrice de dosage pour animaux',
    'View all tools': 'Voir tous les outils',
    'Browse All Conditions': 'Parcourir toutes les conditions',
    
    // Research and conditions
    'Anxiety': 'Anxiété',
    'Depression': 'Dépression',
    'PTSD': 'TSPT',
    'Sleep & Insomnia': 'Sommeil et insomnie',
    'Epilepsy & Seizures': 'Épilepsie et convulsions',
    'Alzheimer\'s & Dementia': 'Alzheimer et démence',
    'Autism & ASD': 'Autisme et TSA',
    'ADHD': 'TDAH',
    'Schizophrenia': 'Schizophrénie',
    'Addiction': 'Addiction',
    'Tourette\'s': 'Tourette',
    'Chronic Stress': 'Stress chronique',
    'Arthritis': 'Arthrite',
    'Fibromyalgia': 'Fibromyalgie',
    'Multiple Sclerosis': 'Sclérose en plaques',
    'Inflammation': 'Inflammation',
    'Crohn\'s Disease': 'Maladie de Crohn',
    'Irritable Bowel Syndrome': 'Syndrome du côlon irritable',
    'Nausea': 'Nausées',
    'Acne': 'Acné',
    'Psoriasis': 'Psoriasis',
    'Eczema': 'Eczéma',
    'Heart Health': 'Santé cardiaque',
    'Blood Pressure': 'Pression artérielle',
    'Diabetes': 'Diabète',
    'Obesity': 'Obésité',
    'COVID-19': 'COVID-19',
    'Glaucoma': 'Glaucome'
  },
  
  it: { // Italian
    'A-Z': 'A-Z',
    'Research-Backed Information': 'Informazioni supportate dalla ricerca',
    'Explore evidence-based research on how CBD may help with {{count}} health conditions. Each topic includes scientific studies, dosage guidance, and expert insights.': 'Esplora la ricerca basata sull\'evidenza su come il CBD può aiutare con {{count}} condizioni di salute. Ogni argomento include studi scientifici, linee guida per il dosaggio e approfondimenti degli esperti.',
    'All Conditions': 'Tutte le condizioni',
    'No Conditions Found': 'Nessuna condizione trovata',
    'Conditions with the strongest scientific evidence': 'Condizioni con le evidenze scientifiche più forti',
    'Search Results': 'Risultati di ricerca',
    'Anxiety, depression, PTSD, stress, and mood disorders': 'Ansia, depressione, PTSD, stress e disturbi dell\'umore',
    'Digestive Health': 'Salute digestiva',
    'IBS, Crohn\'s, nausea, and gut health': 'IBS, Crohn, nausea e salute intestinale',
    'Heart health, blood pressure, and circulation': 'Salute del cuore, pressione sanguigna e circolazione',
    'Cancer & Oncology': 'Cancro e oncologia',
    'Diabetes, obesity, and metabolic disorders': 'Diabete, obesità e disturbi metabolici',
    'CBD for dogs, cats, horses, and other pets': 'CBD per cani, gatti, cavalli e altri animali domestici',
    'Miscellaneous health conditions and wellness': 'Varie condizioni di salute e benessere',
    'Extensive research available': 'Ricerca approfondita disponibile',
    'Good research foundation': 'Buona base di ricerca',
    'Early-stage research': 'Ricerca in fase iniziale',
    'Very limited data': 'Dati molto limitati',
    'Human Study': 'Studio umano',
    'Animal Study': 'Studio animale',
    'Review': 'Revisione',
    'In Vitro': 'In vitro',
    'Knowledge Base': 'Base di conoscenze',
    'CBD & Cannabis': 'CBD e Cannabis',
    'Free CBD Tools & Calculators': 'Strumenti e calcolatori CBD gratuiti',
    'Evidence-based calculators to help you use CBD safely and effectively': 'Calcolatori basati sull\'evidenza per aiutarti a usare il CBD in modo sicuro ed efficace',
    'Drug Interaction Checker': 'Controllore di interazioni farmacologiche',
    'Essential Safety Tool': 'Strumento di sicurezza essenziale',
    '141 medications covered': '141 farmaci coperti',
    'Check Interactions': 'Controlla interazioni',
    'Dosage Calculator': 'Calcolatore dosaggio',
    'Strength Calculator': 'Calcolatore di potenza',
    'Pet Dosage Calculator': 'Calcolatore dosaggio animali',
    'View all tools': 'Vedi tutti gli strumenti',
    'Browse All Conditions': 'Sfoglia tutte le condizioni',
    
    // Research and conditions
    'Anxiety': 'Ansia',
    'Depression': 'Depressione',
    'PTSD': 'PTSD',
    'Sleep & Insomnia': 'Sonno e insonnia',
    'Epilepsy & Seizures': 'Epilessia e convulsioni',
    'Alzheimer\'s & Dementia': 'Alzheimer e demenza',
    'Autism & ASD': 'Autismo e ASD',
    'ADHD': 'ADHD',
    'Schizophrenia': 'Schizofrenia',
    'Addiction': 'Dipendenza',
    'Tourette\'s': 'Tourette',
    'Chronic Stress': 'Stress cronico',
    'Arthritis': 'Artrite',
    'Fibromyalgia': 'Fibromialgia',
    'Multiple Sclerosis': 'Sclerosi multipla',
    'Inflammation': 'Infiammazione',
    'Crohn\'s Disease': 'Malattia di Crohn',
    'Irritable Bowel Syndrome': 'Sindrome dell\'intestino irritabile',
    'Nausea': 'Nausea',
    'Acne': 'Acne',
    'Psoriasis': 'Psoriasi',
    'Eczema': 'Eczema',
    'Heart Health': 'Salute del cuore',
    'Blood Pressure': 'Pressione sanguigna',
    'Diabetes': 'Diabete',
    'Obesity': 'Obesità',
    'COVID-19': 'COVID-19',
    'Glaucoma': 'Glaucoma'
  }
};

// Function to get value by path from object
function getValueByPath(obj, path) {
  const parts = path.split('.');
  let current = obj;
  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      return undefined;
    }
  }
  return current;
}

// Function to set value by path in target language
function setValueByPath(obj, path, value) {
  const parts = path.split('.');
  let current = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (!(part in current)) {
      current[part] = {};
    }
    current = current[part];
  }
  current[parts[parts.length - 1]] = value;
}

// Enhanced translation function
function translateText(text, lang) {
  if (!text || typeof text !== 'string') return text;
  
  const dict = translations[lang];
  if (!dict) return text;
  
  // Check for exact match first
  if (dict[text]) return dict[text];
  
  // For complex translations, we'll use English and mark for review
  return text;
}

// Complete all missing translations for a language
function completeTranslations(lang) {
  console.log(`\n=== Completing translations for ${lang} ===`);
  
  const missingKeysFile = `missing-keys-${lang}.json`;
  if (!fs.existsSync(missingKeysFile)) {
    console.log(`Missing keys file not found: ${missingKeysFile}`);
    return;
  }
  
  const missingData = JSON.parse(fs.readFileSync(missingKeysFile, 'utf8'));
  const langFile = require(`./locales/${lang}.json`);
  
  let translatedCount = 0;
  let manualCount = 0;
  
  for (const keyPath of missingData.missingKeys) {
    const englishValue = getValueByPath(en, keyPath);
    if (englishValue && typeof englishValue === 'string') {
      const translated = translateText(englishValue, lang);
      setValueByPath(langFile, keyPath, translated);
      
      if (translated !== englishValue) {
        translatedCount++;
      } else {
        manualCount++;
      }
    }
  }
  
  // Save updated language file
  fs.writeFileSync(`./locales/${lang}.json`, JSON.stringify(langFile, null, 2));
  
  console.log(`${lang}: Updated ${translatedCount} translations, ${manualCount} kept as English for review`);
  
  return { translated: translatedCount, manual: manualCount };
}

// Process all target languages
const languages = ['fi', 'fr', 'it'];
languages.forEach(lang => {
  completeTranslations(lang);
});

console.log('\nBase language translations updated. Now creating Swiss variants...');