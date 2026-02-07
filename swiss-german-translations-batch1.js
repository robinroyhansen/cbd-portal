const fs = require('fs');

// Load current Swiss German locale and standard German for reference
const currentDeCH = JSON.parse(fs.readFileSync('locales/de-CH.json', 'utf8'));
const germanReference = JSON.parse(fs.readFileSync('locales/de.json', 'utf8'));

function setNestedValue(obj, keyPath, value) {
  const keys = keyPath.split('.');
  const lastKey = keys.pop();
  const target = keys.reduce((current, key) => {
    if (!(key in current)) current[key] = {};
    return current[key];
  }, obj);
  target[lastKey] = value;
}

// Swiss German translations - based on German but with Swiss terminology
const swissGermanTranslations = {
  // Common - Swiss style
  "common.healthCondition": "Gesundheitszustand",
  "common.lastReviewedAndUpdated": "Letzte Überprüfung und Aktualisierung:",
  "common.updated": "Aktualisiert",
  
  // Navigation
  "nav.closeMenu": "Menü schliessen",
  
  // Conditions
  "conditions.researchBacked": "Forschungsgestützte Informationen",
  "conditions.heroTitle": "CBD & Gesundheitszustände",
  "conditions.heroDescription": "Entdecken Sie evidenzbasierte Forschung darüber, wie CBD bei {{count}} Gesundheitszuständen helfen kann. Jedes Thema umfasst wissenschaftliche Studien, Dosierungsanleitungen und Experteneinsichten.",
  "conditions.searchPlaceholder": "Zustände suchen (z.B.: Angst, Schmerzen, Schlaf)...",
  "conditions.grid": "Raster",
  "conditions.listAZ": "A-Z",
  "conditions.allConditions": "Alle Zustände",
  "conditions.showing": "Anzeige",
  "conditions.of": "von",
  "conditions.in": "in",
  "conditions.matching": "passende",
  "conditions.clearFilters": "Filter löschen",
  "conditions.noResults": "Keine Zustände gefunden",
  "conditions.noResultsDescription": "Versuchen Sie, Ihre Suche oder Kategorie-Filter anzupassen, um mehr Resultate zu sehen.",
  "conditions.strongestEvidence": "Zustände mit der stärksten wissenschaftlichen Evidenz",
  "conditions.findByArea": "Finden Sie Zustände organisiert nach betroffenem Bereich",
  "conditions.searchResults": "Suchresultate",
  "conditions.browseByCategoryHeader": "Nach Kategorie durchsuchen",
  "conditions.browseByCategoryDescription": "Finden Sie Gesundheitszustände organisiert nach Körpersystemen und Symptomtypen",
  "conditions.categoryNotFound": "Kategorie nicht gefunden",
  "conditions.categoryNotFoundDescription": "Die angeforderte Kategorie existiert nicht oder wurde verschoben.",
  
  // Categories - Swiss German medical terms
  "conditions.categories.mental_health": "Mentale Gesundheit",
  "conditions.categories.mental_health_desc": "Angst, Depression, PTBS, Stress und Stimmungsstörungen",
  "conditions.categories.pain": "Schmerzen & Beschwerden",
  "conditions.categories.pain_desc": "Chronische Schmerzen, Arthritis, Fibromyalgie und Neuropathie",
  "conditions.categories.neurological": "Neurologische",
  "conditions.categories.neurological_desc": "Epilepsie, Parkinson, MS und Gehirngesundheit",
  "conditions.categories.skin": "Hautzustände",
  "conditions.categories.skin_desc": "Akne, Ekzeme, Psoriasis und Dermatitis",
  "conditions.categories.sleep": "Schlaf",
  "conditions.categories.sleep_desc": "Schlaflosigkeit, Schlafapnoe und zirkadiane Rhythmusstörungen",
  "conditions.categories.autoimmune": "Autoimmun",
  "conditions.categories.autoimmune_desc": "Rheumatoide Arthritis, Morbus Crohn und Lupus",
  "conditions.categories.gastrointestinal": "Verdauungsgesundheit",
  "conditions.categories.gastrointestinal_desc": "RDS, Morbus Crohn, Übelkeit und Darmgesundheit",
  "conditions.categories.cardiovascular": "Herz-Kreislauf",
  "conditions.categories.cardiovascular_desc": "Herzgesundheit, Blutdruck und Durchblutung",
  "conditions.categories.cancer": "Krebs & Onkologie",
  "conditions.categories.cancer_desc": "Nebenwirkungen der Krebsbehandlung, Lebensqualität und komplementäre Pflege",
  "conditions.categories.metabolic": "Stoffwechselgesundheit",
  "conditions.categories.metabolic_desc": "Diabetes, Adipositas und Stoffwechselstörungen",
  "conditions.categories.pets": "Haustiere",
  "conditions.categories.pets_desc": "CBD für Hunde, Katzen, Pferde und andere Haustiere",
  "conditions.categories.other": "Weitere Zustände",
  "conditions.categories.other_desc": "Verschiedene Gesundheitszustände und Wohlbefinden",
  "conditions.categories.inflammation": "Entzündung",
  "conditions.categories.inflammation_desc": "Chronische Entzündung und entzündliche Erkrankungen",
  
  // Evidence
  "evidence.strongDesc": "Umfangreiche Forschung verfügbar",
  "evidence.moderateDesc": "Gute Forschungsgrundlage",
  "evidence.emerging": "Aufkommend",
  "evidence.emergingDesc": "Wachsende Evidenzbasis",
  "evidence.limitedDesc": "Frühstadium-Forschung",
  "evidence.preliminary": "Vorläufig",
  "evidence.preliminaryDesc": "Sehr begrenzte Daten",
  
  // Research types
  "research.studySubject.human": "Humanstudie",
  "research.studySubject.animal": "Tierstudie",
  "research.studySubject.review": "Übersicht",
  "research.studySubject.in_vitro": "In Vitro",
  
  // Glossary
  "glossary.knowledgeBase": "Wissensbasis",
  "glossary.cbdCannabis": "CBD & Cannabis",
  "glossary.termsExplained": "{{count}} Begriffe erklärt — von Cannabinoiden und Terpenen bis hin zu rechtlicher Terminologie und Produkttypen.",
  "glossary.searchLabel": "Glossar-Begriffe suchen",
  "glossary.searchTermsSynonyms": "Begriffe, Synonyme suchen...",
  "glossary.suggestionsFound": "{{count}} Vorschläge gefunden",
  "glossary.matchedSynonym": "Passendes Synonym",
  "glossary.mostPopular": "Beliebteste Begriffe",
  "glossary.filterByLetter": "Nach Buchstabe filtern",
  "glossary.all": "Alle",
  "glossary.allCategories": "Alle Kategorien",
  "glossary.cardView": "Kartenansicht",
  "glossary.tableView": "Tabellenansicht",
  "glossary.viewMode": "Ansichtsmodus",
  "glossary.noTermsFound": "Keine Begriffe gefunden",
  "glossary.noResultsFor": "Keine Resultate für \"{{query}}\"",
  "glossary.noTermsMatchFilters": "Keine Glossar-Begriffe entsprechen Ihren Filtern",
  "glossary.clearFilters": "Filter löschen",
  "glossary.term": "Begriff",
  "glossary.category": "Kategorie",
  "glossary.definition": "Definition",
  "glossary.also": "Auch",
  "glossary.termCount": "{{count}} Begriff",
  "glossary.termsCount": "{{count}} Begriffe",
  "glossary.home": "Home",
  "glossary.reviewedBy": "Überprüft von",
  "glossary.lastUpdated": "Zuletzt aktualisiert",
  "glossary.calculateDosage": "Berechnen Sie Ihre CBD-Dosierung",
  "glossary.getDosageRecommendations": "Erhalten Sie personalisierte Dosierungsempfehlungen basierend auf Ihren Bedürfnissen.",
  "glossary.tryCalculator": "Rechner ausprobieren →",
  "glossary.viewStudies": "{{count}} Studie ansehen →",
  "glossary.viewStudiesPlural": "{{count}} Studien ansehen →",
  "glossary.faq": "Häufige Fragen",
  "glossary.alsoKnownAs": "Auch bekannt als",
  "glossary.learnMore": "Mehr erfahren",
  "glossary.backToGlossary": "Zurück zum Glossar",
  
  // Glossary categories
  "glossaryCategories.cannabinoids": "Cannabinoide",
  "glossaryCategories.cannabinoids_desc": "CBD, THC, CBG und andere Cannabis-Verbindungen",
  "glossaryCategories.terpenes": "Terpene",
  "glossaryCategories.terpenes_desc": "Aromatische Verbindungen, die Duft und Wirkung beeinflussen",
  "glossaryCategories.products": "Produkte",
  "glossaryCategories.products_desc": "Öle, Kapseln, Topika und andere CBD-Produkte",
  "glossaryCategories.extraction": "Extraktion",
  "glossaryCategories.extraction_desc": "Methoden zur CBD-Extraktion aus der Pflanze",
  "glossaryCategories.science": "Wissenschaft",
  "glossaryCategories.science_desc": "Das Endocannabinoid-System und wie CBD wirkt",
  "glossaryCategories.research": "Forschung",
  "glossaryCategories.research_desc": "Arten von Studien und wissenschaftlicher Forschung",
  "glossaryCategories.legal": "Rechtlich",
  "glossaryCategories.legal_desc": "Gesetzgebung, Vorschriften und rechtlicher Status von CBD",
  "glossaryCategories.cultivation": "Anbau",
  "glossaryCategories.cultivation_desc": "Anbau- und Produktionsmethoden für Cannabis",
  "glossaryCategories.testing": "Prüfung",
  "glossaryCategories.testing_desc": "Laboranalysen und Qualitätskontrolle",
  "glossaryCategories.safety": "Sicherheit",
  "glossaryCategories.safety_desc": "Nebenwirkungen, Wechselwirkungen und Sicherheit"
};

// Apply Swiss German translations
let appliedCount = 0;
Object.keys(swissGermanTranslations).forEach(key => {
  setNestedValue(currentDeCH, key, swissGermanTranslations[key]);
  appliedCount++;
});

console.log(`Applied ${appliedCount} Swiss German translations`);

// Save updated file
fs.writeFileSync('locales/de-CH.json', JSON.stringify(currentDeCH, null, 2));

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

const newDeChKeys = getAllKeys(currentDeCH);
console.log(`New Swiss German key count: ${newDeChKeys.length}`);
console.log(`Progress: ${newDeChKeys.length}/1667 keys (${Math.round(newDeChKeys.length/1667*100)}%)`);