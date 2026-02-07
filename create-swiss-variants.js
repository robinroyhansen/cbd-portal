const fs = require('fs');

// Load base language files
const fr = require('./locales/fr.json');
const it = require('./locales/it.json');
const en = require('./locales/en.json');

// Swiss-specific terminology modifications
const swissModifications = {
  'fr-CH': {
    // French-Swiss specific terms (mostly same as French but some variations)
    'pharmacie': 'pharmacie',
    'médicament': 'médicament',
    'docteur': 'médecin', // Swiss French prefers 'médecin'
    'septante': 'soixante-dix', // Swiss French uses septante for 70
    'nonante': 'quatre-vingt-dix', // Swiss French uses nonante for 90
    'déjeuner': 'petit-déjeuner', // Different meal terminology
    'souper': 'dîner', // Swiss French uses souper for dinner
    
    // CBD-specific Swiss terms
    'Cannabis médical': 'Cannabis thérapeutique',
    'Ordonnance': 'Prescription',
    'Consultation médicale': 'Consultation médicale',
    'Thérapie': 'Traitement'
  },
  
  'it-CH': {
    // Italian-Swiss specific terms
    'farmacia': 'farmacia',
    'medico': 'medico',
    'dottore': 'medico', // Swiss Italian often prefers 'medico'
    'medicina': 'medicina',
    
    // CBD-specific Swiss terms
    'Cannabis medicinale': 'Cannabis terapeutica',
    'Prescrizione': 'Ricetta',
    'Consultazione medica': 'Visita medica',
    'Terapia': 'Trattamento'
  }
};

// Function to apply Swiss modifications to text
function applySwissModifications(text, variant) {
  if (!text || typeof text !== 'string') return text;
  
  const modifications = swissModifications[variant];
  if (!modifications) return text;
  
  let modifiedText = text;
  
  // Apply Swiss-specific terminology
  Object.keys(modifications).forEach(original => {
    const swissTerm = modifications[original];
    // Use word boundaries to avoid partial replacements
    const regex = new RegExp(`\\b${original}\\b`, 'gi');
    modifiedText = modifiedText.replace(regex, swissTerm);
  });
  
  return modifiedText;
}

// Function to recursively process object and apply Swiss modifications
function processObjectForSwiss(obj, variant) {
  const result = {};
  
  for (const key in obj) {
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      result[key] = processObjectForSwiss(obj[key], variant);
    } else if (typeof obj[key] === 'string') {
      result[key] = applySwissModifications(obj[key], variant);
    } else {
      result[key] = obj[key];
    }
  }
  
  return result;
}

// Function to ensure all keys from English are present
function ensureAllKeys(targetObj, sourceObj, lang) {
  const missingKeysFile = `missing-keys-${lang.replace('-CH', '')}.json`;
  
  if (fs.existsSync(missingKeysFile)) {
    const missingData = JSON.parse(fs.readFileSync(missingKeysFile, 'utf8'));
    
    for (const keyPath of missingData.missingKeys) {
      const value = getValueByPath(sourceObj, keyPath);
      if (value && typeof value === 'string') {
        setValueByPath(targetObj, keyPath, value);
      }
    }
  }
  
  return targetObj;
}

// Helper functions for nested object operations
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

// Create Swiss variants
console.log('Creating Swiss variants...');

// Create fr-CH based on fr.json
console.log('\n=== Creating fr-CH ===');
let frCH = JSON.parse(JSON.stringify(fr)); // Deep copy
frCH = processObjectForSwiss(frCH, 'fr-CH');
frCH = ensureAllKeys(frCH, fr, 'fr-CH');

// Add some Swiss-specific metadata
if (frCH.meta) {
  frCH.meta.siteName = frCH.meta.siteName || 'CBD.ch';
  frCH.meta.siteTagline = frCH.meta.siteTagline || 'Informations CBD basées sur des preuves et recherche';
}

// Create it-CH based on it.json
console.log('\n=== Creating it-CH ===');
let itCH = JSON.parse(JSON.stringify(it)); // Deep copy
itCH = processObjectForSwiss(itCH, 'it-CH');
itCH = ensureAllKeys(itCH, it, 'it-CH');

// Add some Swiss-specific metadata
if (itCH.meta) {
  itCH.meta.siteName = itCH.meta.siteName || 'CBD.ch';
  itCH.meta.siteTagline = itCH.meta.siteTagline || 'Informazioni CBD basate su evidenze e ricerca';
}

// Save the Swiss variants
fs.writeFileSync('./locales/fr-CH.json', JSON.stringify(frCH, null, 2));
fs.writeFileSync('./locales/it-CH.json', JSON.stringify(itCH, null, 2));

console.log('fr-CH: Swiss variant created based on French translations');
console.log('it-CH: Swiss variant created based on Italian translations');

// Count keys in final files
function countKeys(obj) {
  let count = 0;
  for (const key in obj) {
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      count += countKeys(obj[key]);
    } else {
      count++;
    }
  }
  return count;
}

console.log('\n=== Final key counts ===');
console.log(`fr-CH: ${countKeys(frCH)} keys`);
console.log(`it-CH: ${countKeys(itCH)} keys`);

console.log('\nSwiss variants created successfully!');