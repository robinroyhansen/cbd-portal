const fs = require('fs');

// Load current Romanian locale
const currentRo = JSON.parse(fs.readFileSync('locales/ro.json', 'utf8'));

function setNestedValue(obj, keyPath, value) {
  const keys = keyPath.split('.');
  const lastKey = keys.pop();
  const target = keys.reduce((current, key) => {
    if (!(key in current)) current[key] = {};
    return current[key];
  }, obj);
  target[lastKey] = value;
}

// Romanian translations - native quality
const romanianTranslations = {
  // Common
  "common.healthCondition": "Condiție de Sănătate",
  "common.lastReviewedAndUpdated": "Ultima revizuire și actualizare:",
  "common.updated": "Actualizat",
  
  // Navigation
  "nav.closeMenu": "Închide meniul",
  
  // Conditions
  "conditions.researchBacked": "Informații Susținute de Cercetare",
  "conditions.heroTitle": "CBD și Condițiile de Sănătate",
  "conditions.heroDescription": "Explorează cercetarea bazată pe evidențe despre cum CBD poate ajuta cu {{count}} condiții de sănătate. Fiecare subiect include studii științifice, ghiduri de dozare și perspective de experți.",
  "conditions.searchPlaceholder": "Caută condiții (ex: anxietate, durere, somn)...",
  "conditions.grid": "Grilă",
  "conditions.listAZ": "A-Z",
  "conditions.allConditions": "Toate Condițiile",
  "conditions.showing": "Se afișează",
  "conditions.of": "din",
  "conditions.in": "în",
  "conditions.matching": "care corespund",
  "conditions.clearFilters": "Șterge filtrele",
  "conditions.noResults": "Nu s-au Găsit Condiții",
  "conditions.noResultsDescription": "Încearcă să îți ajustezi căutarea sau filtrul de categorie pentru a vedea mai multe rezultate.",
  "conditions.strongestEvidence": "Condiții cu cea mai puternică evidență științifică",
  "conditions.findByArea": "Găsește condiții organizate după zona afectată",
  "conditions.searchResults": "Rezultatele Căutării",
  "conditions.browseByCategoryHeader": "Navighează după Categorie",
  "conditions.browseByCategoryDescription": "Găsește condiții de sănătate organizate pe sisteme corporale și tipuri de simptome",
  "conditions.categoryNotFound": "Categoria nu a fost găsită",
  "conditions.categoryNotFoundDescription": "Categoria solicitată nu există sau a fost mutată.",
  
  // Categories
  "conditions.categories.mental_health": "Sănătate Mentală",
  "conditions.categories.mental_health_desc": "Anxietate, depresie, PTSD, stres și tulburări de dispoziție",
  "conditions.categories.pain": "Durere și Disconfort",
  "conditions.categories.pain_desc": "Durere cronică, artrită, fibromilagie și neuropatie",
  "conditions.categories.neurological": "Neurologice",
  "conditions.categories.neurological_desc": "Epilepsie, Parkinson, scleroză multiplă și sănătatea creierului",
  "conditions.categories.skin": "Afecțiuni ale Pielii",
  "conditions.categories.skin_desc": "Acnee, eczemă, psoriazis și dermatită",
  "conditions.categories.sleep": "Somn",
  "conditions.categories.sleep_desc": "Insomnie, apnee de somn și tulburări ale ritmului circadian",
  "conditions.categories.autoimmune": "Autoimune",
  "conditions.categories.autoimmune_desc": "Artrită reumatoidă, boala Crohn și lupus",
  "conditions.categories.gastrointestinal": "Sănătate Digestivă",
  "conditions.categories.gastrointestinal_desc": "SII, boala Crohn, greață și sănătatea intestinelor",
  "conditions.categories.cardiovascular": "Cardiovascular",
  "conditions.categories.cardiovascular_desc": "Sănătatea inimii, tensiunea arterială și circulația",
  "conditions.categories.cancer": "Cancer și Oncologie",
  "conditions.categories.cancer_desc": "Efecte secundare ale tratamentului cancerului, calitatea vieții și îngrijire complementară",
  "conditions.categories.metabolic": "Sănătate Metabolică",
  "conditions.categories.metabolic_desc": "Diabet, obezitate și tulburări metabolice",
  "conditions.categories.pets": "Animale de Companie",
  "conditions.categories.pets_desc": "CBD pentru câini, pisici, cai și alte animale de companie",
  "conditions.categories.other": "Alte Condiții",
  "conditions.categories.other_desc": "Diverse condiții de sănătate și bunăstare",
  "conditions.categories.inflammation": "Inflamație",
  "conditions.categories.inflammation_desc": "Inflamație cronică și boli inflamatorii",
  
  // Evidence
  "evidence.strongDesc": "Cercetare extinsă disponibilă",
  "evidence.moderateDesc": "Bază bună de cercetare",
  "evidence.emerging": "Emergent",
  "evidence.emergingDesc": "Bază de evidențe în creștere",
  "evidence.limitedDesc": "Cercetare în fază incipientă",
  "evidence.preliminary": "Preliminar",
  "evidence.preliminaryDesc": "Date foarte limitate",
  
  // Research types
  "research.studySubject.human": "Studiu Uman",
  "research.studySubject.animal": "Studiu pe Animale",
  "research.studySubject.review": "Revizuire",
  "research.studySubject.in_vitro": "In Vitro",
  
  // Glossary
  "glossary.knowledgeBase": "Bază de Cunoștințe",
  "glossary.cbdCannabis": "CBD și Cannabis",
  "glossary.termsExplained": "{{count}} termeni explicați — de la cannabinoizi și terpene la terminologie legală și tipuri de produse.",
  "glossary.searchLabel": "Caută termeni din glosar",
  "glossary.searchTermsSynonyms": "Caută termeni, sinonime...",
  "glossary.suggestionsFound": "{{count}} sugestii găsite",
  "glossary.matchedSynonym": "Sinonim corespunzător",
  "glossary.mostPopular": "Cei Mai Populari Termeni",
  "glossary.filterByLetter": "Filtrează după literă",
  "glossary.all": "Toate",
  "glossary.allCategories": "Toate Categoriile",
  "glossary.cardView": "Vizualizare card",
  "glossary.tableView": "Vizualizare tabel",
  "glossary.viewMode": "Modul de vizualizare",
  "glossary.noTermsFound": "Nu s-au găsit termeni",
  "glossary.noResultsFor": "Nu există rezultate pentru \"{{query}}\"",
  "glossary.noTermsMatchFilters": "Niciun termen din glosar nu corespunde filtrelor tale",
  "glossary.clearFilters": "Șterge filtrele",
  "glossary.term": "Termen",
  "glossary.category": "Categorie",
  "glossary.definition": "Definiție",
  "glossary.also": "De asemenea",
  "glossary.termCount": "{{count}} termen",
  "glossary.termsCount": "{{count}} termeni",
  "glossary.home": "Acasă",
  "glossary.reviewedBy": "Revizuit de",
  "glossary.lastUpdated": "Ultima actualizare",
  "glossary.calculateDosage": "Calculează Dozajul Tău de CBD",
  "glossary.getDosageRecommendations": "Obține recomandări de dozaj personalizate bazate pe nevoile tale.",
  "glossary.tryCalculator": "Încearcă Calculatorul →",
  "glossary.viewStudies": "Vezi {{count}} studiu →",
  "glossary.viewStudiesPlural": "Vezi {{count}} studii →",
  "glossary.faq": "Întrebări Frecvente",
  "glossary.alsoKnownAs": "De Asemenea Cunoscut Ca",
  "glossary.learnMore": "Învață Mai Mult",
  "glossary.backToGlossary": "Înapoi la Glosar",
  
  // Glossary categories
  "glossaryCategories.cannabinoids": "Cannabinoizi",
  "glossaryCategories.cannabinoids_desc": "CBD, THC, CBG și alte compuși din cannabis",
  "glossaryCategories.terpenes": "Terpene",
  "glossaryCategories.terpenes_desc": "Compuși aromatici care afectează mirosul și efectele",
  "glossaryCategories.products": "Produse",
  "glossaryCategories.products_desc": "Uleiuri, capsule, topice și alte produse CBD",
  "glossaryCategories.extraction": "Extracție",
  "glossaryCategories.extraction_desc": "Metode de extragere a CBD-ului din plantă",
  "glossaryCategories.science": "Știință",
  "glossaryCategories.science_desc": "Sistemul endocannabinoid și cum funcționează CBD-ul",
  "glossaryCategories.research": "Cercetare",
  "glossaryCategories.research_desc": "Tipuri de studii și cercetare științifică",
  "glossaryCategories.legal": "Legal",
  "glossaryCategories.legal_desc": "Legislație, reglementări și statutul legal al CBD-ului",
  "glossaryCategories.cultivation": "Cultivare",
  "glossaryCategories.cultivation_desc": "Metode de cultivare și producere a cannabis-ului",
  "glossaryCategories.testing": "Testare",
  "glossaryCategories.testing_desc": "Analize de laborator și control de calitate",
  "glossaryCategories.safety": "Siguranță",
  "glossaryCategories.safety_desc": "Efecte secundare, interacțiuni și siguranță"
};

// Apply Romanian translations
let appliedCount = 0;
Object.keys(romanianTranslations).forEach(key => {
  setNestedValue(currentRo, key, romanianTranslations[key]);
  appliedCount++;
});

console.log(`Applied ${appliedCount} Romanian translations`);

// Save updated file
fs.writeFileSync('locales/ro.json', JSON.stringify(currentRo, null, 2));

// Count keys to verify progress
function getAllKeys(obj, prefix = '') {
  const keys = [];
  for (const key in obj) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      keys.push(...getAllKeys(obj[key], fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

const newRoKeys = getAllKeys(currentRo);
console.log(`New Romanian key count: ${newRoKeys.length}`);
console.log(`Progress: ${newRoKeys.length}/1667 keys (${Math.round(newRoKeys.length/1667*100)}%)`);