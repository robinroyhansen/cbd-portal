const fs = require('fs');
const path = require('path');

// Function to recursively collect all keys from an object
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

// Function to get value at nested key path
function getNestedValue(obj, keyPath) {
  return keyPath.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : undefined;
  }, obj);
}

// Load all locale files
const languages = ['es', 'nl', 'pt', 'ro', 'de-CH'];
const en = JSON.parse(fs.readFileSync(path.join(__dirname, 'locales/en.json'), 'utf8'));
const allEnKeys = getAllKeys(en);

console.log(`Total keys in en.json: ${allEnKeys.length}`);

// Find missing keys for each language
languages.forEach(lang => {
  const langData = JSON.parse(fs.readFileSync(path.join(__dirname, `locales/${lang}.json`), 'utf8'));
  const langKeys = getAllKeys(langData);
  
  const missingKeys = allEnKeys.filter(key => !langKeys.includes(key));
  
  console.log(`\n=== ${lang.toUpperCase()} ===`);
  console.log(`Current keys: ${langKeys.length}`);
  console.log(`Missing keys: ${missingKeys.length}`);
  
  // Save missing keys to file for this language
  const missingData = {};
  missingKeys.forEach(key => {
    const value = getNestedValue(en, key);
    missingData[key] = value;
  });
  
  fs.writeFileSync(`missing-keys-${lang}.json`, JSON.stringify(missingData, null, 2));
  console.log(`Missing keys saved to missing-keys-${lang}.json`);
});