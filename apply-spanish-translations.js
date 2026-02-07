const fs = require('fs');
const path = require('path');

// Load current Spanish locale
const currentEs = JSON.parse(fs.readFileSync('locales/es.json', 'utf8'));
const en = JSON.parse(fs.readFileSync('locales/en.json', 'utf8'));

// Get all missing keys
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

function getNestedValue(obj, keyPath) {
  return keyPath.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : undefined;
  }, obj);
}

function setNestedValue(obj, keyPath, value) {
  const keys = keyPath.split('.');
  const lastKey = keys.pop();
  const target = keys.reduce((current, key) => {
    if (!(key in current)) current[key] = {};
    return current[key];
  }, obj);
  target[lastKey] = value;
}

const allEnKeys = getAllKeys(en);
const esKeys = getAllKeys(currentEs);
const missingKeys = allEnKeys.filter(key => !esKeys.includes(key));

console.log(`Missing ${missingKeys.length} keys in Spanish`);

// Comprehensive Spanish translations for missing keys
const spanishTranslations = {
  // Common
  "common.healthCondition": "Condición de Salud",
  "common.lastReviewedAndUpdated": "Última revisión y actualización:",
  "common.updated": "Actualizado",
  
  // Navigation
  "nav.closeMenu": "Cerrar menú",
  
  // Conditions (many keys)
  "conditions.researchBacked": "Información Respaldada por Investigación",
  "conditions.heroTitle": "CBD y Condiciones de Salud",
  "conditions.heroDescription": "Explora investigación basada en evidencia sobre cómo el CBD puede ayudar con {{count}} condiciones de salud. Cada tema incluye estudios científicos, orientación sobre dosis y perspectivas de expertos.",
  "conditions.searchPlaceholder": "Buscar condiciones (ej: ansiedad, dolor, sueño)...",
  "conditions.grid": "Cuadrícula",
  "conditions.listAZ": "A-Z",
  "conditions.allConditions": "Todas las Condiciones",
  "conditions.showing": "Mostrando",
  "conditions.of": "de",
  "conditions.in": "en",
  "conditions.matching": "que coinciden",
  "conditions.clearFilters": "Limpiar filtros",
  "conditions.noResults": "No se Encontraron Condiciones",
  "conditions.noResultsDescription": "Intenta ajustar tu búsqueda o filtro de categoría para ver más resultados.",
  "conditions.strongestEvidence": "Condiciones con la evidencia científica más sólida",
  "conditions.findByArea": "Encuentra condiciones organizadas por área afectada",
  "conditions.searchResults": "Resultados de Búsqueda",
  "conditions.browseByCategoryHeader": "Explorar por Categoría",
  "conditions.browseByCategoryDescription": "Encuentra condiciones de salud organizadas por sistemas corporales y tipos de síntomas",
  "conditions.categoryNotFound": "Categoría no encontrada",
  "conditions.categoryNotFoundDescription": "La categoría solicitada no existe o ha sido movida.",
  
  // Categories
  "conditions.categories.mental_health": "Salud Mental",
  "conditions.categories.mental_health_desc": "Ansiedad, depresión, TEPT, estrés y trastornos del estado de ánimo",
  "conditions.categories.pain": "Dolor e Incomodidad",
  "conditions.categories.pain_desc": "Dolor crónico, artritis, fibromialgia y neuropatía",
  "conditions.categories.neurological": "Neurológicos",
  "conditions.categories.neurological_desc": "Epilepsia, Parkinson, esclerosis múltiple y salud cerebral",
  "conditions.categories.skin": "Condiciones de la Piel",
  "conditions.categories.skin_desc": "Acné, eccema, psoriasis y dermatitis",
  "conditions.categories.sleep": "Sueño",
  "conditions.categories.sleep_desc": "Insomnio, apnea del sueño y trastornos del ciclo circadiano",
  "conditions.categories.autoimmune": "Autoinmunes",
  "conditions.categories.autoimmune_desc": "Artritis reumatoide, enfermedad de Crohn y lupus",
  "conditions.categories.gastrointestinal": "Salud Digestiva",
  "conditions.categories.gastrointestinal_desc": "SII, enfermedad de Crohn, náuseas y salud intestinal",
  "conditions.categories.cardiovascular": "Cardiovascular",
  "conditions.categories.cardiovascular_desc": "Salud del corazón, presión arterial y circulación",
  "conditions.categories.cancer": "Cáncer y Oncología",
  "conditions.categories.cancer_desc": "Efectos secundarios del tratamiento del cáncer, calidad de vida y cuidado complementario",
  "conditions.categories.metabolic": "Salud Metabólica",
  "conditions.categories.metabolic_desc": "Diabetes, obesidad y trastornos metabólicos",
  "conditions.categories.pets": "Mascotas y Animales",
  "conditions.categories.pets_desc": "CBD para perros, gatos, caballos y otras mascotas",
  "conditions.categories.other": "Otras Condiciones",
  "conditions.categories.other_desc": "Condiciones de salud varias y bienestar",
  "conditions.categories.inflammation": "Inflamación",
  "conditions.categories.inflammation_desc": "Inflamación crónica y trastornos inflamatorios"
};

// Apply only first batch of translations to see progress
let appliedCount = 0;
Object.keys(spanishTranslations).forEach(key => {
  if (missingKeys.includes(key)) {
    setNestedValue(currentEs, key, spanishTranslations[key]);
    appliedCount++;
  }
});

console.log(`Applied ${appliedCount} translations to Spanish locale file`);

// Save the updated Spanish file
fs.writeFileSync('locales/es.json', JSON.stringify(currentEs, null, 2));
console.log('Updated es.json with new translations');

// Verify key count
const newEsKeys = getAllKeys(currentEs);
console.log(`New Spanish key count: ${newEsKeys.length} (was ${esKeys.length})`);
console.log(`Still missing: ${722 - appliedCount} keys`);