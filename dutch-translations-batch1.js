const fs = require('fs');

// Load current Dutch locale
const currentNl = JSON.parse(fs.readFileSync('locales/nl.json', 'utf8'));

function setNestedValue(obj, keyPath, value) {
  const keys = keyPath.split('.');
  const lastKey = keys.pop();
  const target = keys.reduce((current, key) => {
    if (!(key in current)) current[key] = {};
    return current[key];
  }, obj);
  target[lastKey] = value;
}

// Dutch translations - high quality, native-sounding
const dutchTranslations = {
  // Common
  "common.healthCondition": "Gezondheidsconditie",
  "common.lastReviewedAndUpdated": "Laatst beoordeeld en bijgewerkt:",
  "common.updated": "Bijgewerkt",
  
  // Navigation
  "nav.closeMenu": "Menu sluiten",
  
  // Conditions
  "conditions.researchBacked": "Onderzoek-Ondersteunde Informatie",
  "conditions.heroTitle": "CBD & GezondheidsCondities", 
  "conditions.heroDescription": "Verken evidence-based onderzoek over hoe CBD kan helpen bij {{count}} gezondheidsaandoeningen. Elk onderwerp bevat wetenschappelijke studies, doseeradvies en expertinzichten.",
  "conditions.searchPlaceholder": "Zoek condities (bijv: angst, pijn, slaap)...",
  "conditions.grid": "Raster",
  "conditions.listAZ": "A-Z",
  "conditions.allConditions": "Alle Condities",
  "conditions.showing": "Toont",
  "conditions.of": "van",
  "conditions.in": "in",
  "conditions.matching": "overeenkomend",
  "conditions.clearFilters": "Filters wissen",
  "conditions.noResults": "Geen Condities Gevonden",
  "conditions.noResultsDescription": "Probeer je zoekterm of categoriefilter aan te passen om meer resultaten te zien.",
  "conditions.strongestEvidence": "Condities met het sterkste wetenschappelijke bewijs",
  "conditions.findByArea": "Vind condities georganiseerd per aangedaan gebied",
  "conditions.searchResults": "Zoekresultaten",
  "conditions.browseByCategoryHeader": "Bladeren per Categorie",
  "conditions.browseByCategoryDescription": "Vind gezondheidsaandoeningen georganiseerd per lichaamssysteem en symptoomtype",
  "conditions.categoryNotFound": "Categorie niet gevonden",
  "conditions.categoryNotFoundDescription": "De opgevraagde categorie bestaat niet of is verplaatst.",
  
  // Categories
  "conditions.categories.mental_health": "Mentale Gezondheid",
  "conditions.categories.mental_health_desc": "Angst, depressie, PTSS, stress en stemmingsstoornissen",
  "conditions.categories.pain": "Pijn & Ongemak",
  "conditions.categories.pain_desc": "Chronische pijn, artritis, fibromyalgie en neuropathie",
  "conditions.categories.neurological": "Neurologisch", 
  "conditions.categories.neurological_desc": "Epilepsie, Parkinson, MS en hersengezondheid",
  "conditions.categories.skin": "Huidaandoeningen",
  "conditions.categories.skin_desc": "Acne, eczeem, psoriasis en dermatitis",
  "conditions.categories.sleep": "Slaap",
  "conditions.categories.sleep_desc": "Slapeloosheid, slaapapneu en circadiane ritme stoornissen", 
  "conditions.categories.autoimmune": "Auto-immuun",
  "conditions.categories.autoimmune_desc": "Reumatoïde artritis, ziekte van Crohn en lupus",
  "conditions.categories.gastrointestinal": "Spijsvertering",
  "conditions.categories.gastrointestinal_desc": "PDS, ziekte van Crohn, misselijkheid en darmgezondheid",
  "conditions.categories.cardiovascular": "Cardiovasculair",
  "conditions.categories.cardiovascular_desc": "Hartgezondheid, bloeddruk en circulatie",
  "conditions.categories.cancer": "Kanker & Oncologie", 
  "conditions.categories.cancer_desc": "Bijwerkingen kankerbehandeling, levenskwaliteit en aanvullende zorg",
  "conditions.categories.metabolic": "Metabolische Gezondheid",
  "conditions.categories.metabolic_desc": "Diabetes, obesitas en metabole stoornissen",
  "conditions.categories.pets": "Huisdieren & Dieren",
  "conditions.categories.pets_desc": "CBD voor honden, katten, paarden en andere huisdieren",
  "conditions.categories.other": "Andere Condities",
  "conditions.categories.other_desc": "Diverse gezondheidsaandoeningen en welzijn",
  "conditions.categories.inflammation": "Ontsteking",
  "conditions.categories.inflammation_desc": "Chronische ontsteking en ontstekingsziekten",
  
  // Evidence
  "evidence.strongDesc": "Uitgebreid onderzoek beschikbaar",
  "evidence.moderateDesc": "Goede onderzoeksbasis",
  "evidence.emerging": "Opkomend",
  "evidence.emergingDesc": "Groeiende hoeveelheid bewijs",
  "evidence.limitedDesc": "Onderzoek in vroege fase",
  "evidence.preliminary": "Voorlopig",
  "evidence.preliminaryDesc": "Zeer beperkte data",
  
  // Research types
  "research.studySubject.human": "Humane Studie",
  "research.studySubject.animal": "Dierstudie", 
  "research.studySubject.review": "Review",
  "research.studySubject.in_vitro": "In Vitro",
  
  // Glossary
  "glossary.knowledgeBase": "Kennisbank",
  "glossary.cbdCannabis": "CBD & Cannabis",
  "glossary.termsExplained": "{{count}} termen uitgelegd — van cannabinoïden en terpenen tot juridische terminologie en producttypes.",
  "glossary.searchLabel": "Zoek glossariumtermen",
  "glossary.searchTermsSynonyms": "Zoek termen, synoniemen...",
  "glossary.suggestionsFound": "{{count}} suggesties gevonden",
  "glossary.matchedSynonym": "Overeenkomend synoniem",
  "glossary.mostPopular": "Populairste Termen",
  "glossary.filterByLetter": "Filter op letter",
  "glossary.all": "Alle",
  "glossary.allCategories": "Alle Categorieën",
  "glossary.cardView": "Kaartweergave",
  "glossary.tableView": "Tabelweergave", 
  "glossary.viewMode": "Weergavemodus",
  "glossary.noTermsFound": "Geen termen gevonden",
  "glossary.noResultsFor": "Geen resultaten voor \"{{query}}\"",
  "glossary.noTermsMatchFilters": "Geen glossariumtermen komen overeen met je filters",
  "glossary.clearFilters": "Filters wissen",
  "glossary.term": "Term",
  "glossary.category": "Categorie",
  "glossary.definition": "Definitie",
  "glossary.also": "Ook",
  "glossary.termCount": "{{count}} term",
  "glossary.termsCount": "{{count}} termen",
  "glossary.home": "Home",
  "glossary.reviewedBy": "Beoordeeld door",
  "glossary.lastUpdated": "Laatst bijgewerkt",
  "glossary.calculateDosage": "Bereken Je CBD Dosering",
  "glossary.getDosageRecommendations": "Krijg gepersonaliseerde doseringsadviezen gebaseerd op je behoeften.",
  "glossary.tryCalculator": "Probeer Calculator →",
  "glossary.viewStudies": "Bekijk {{count}} studie →",
  "glossary.viewStudiesPlural": "Bekijk {{count}} studies →",
  "glossary.faq": "Veelgestelde Vragen",
  "glossary.alsoKnownAs": "Ook Bekend Als",
  "glossary.learnMore": "Meer Leren",
  "glossary.backToGlossary": "Terug naar Glossarium"
};

// Apply Dutch translations
let appliedCount = 0;
Object.keys(dutchTranslations).forEach(key => {
  setNestedValue(currentNl, key, dutchTranslations[key]);
  appliedCount++;
});

console.log(`Applied ${appliedCount} Dutch translations`);

// Save updated file
fs.writeFileSync('locales/nl.json', JSON.stringify(currentNl, null, 2));

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

const newNlKeys = getAllKeys(currentNl);
console.log(`New Dutch key count: ${newNlKeys.length}`);
console.log(`Progress: ${newNlKeys.length}/1667 keys (${Math.round(newNlKeys.length/1667*100)}%)`);