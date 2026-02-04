const fs = require('fs');
const path = require('path');

// Function to merge nested objects
function mergeDeep(target, source) {
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      if (!target[key] || typeof target[key] !== 'object') {
        target[key] = {};
      }
      mergeDeep(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  }
  return target;
}

try {
  // Read existing German translations
  const dePath = path.join(__dirname, 'locales', 'de.json');
  const missingPath = path.join(__dirname, 'missing-de-translations.json');
  
  const existingDe = JSON.parse(fs.readFileSync(dePath, 'utf8'));
  const missingDe = JSON.parse(fs.readFileSync(missingPath, 'utf8'));
  
  // Merge translations
  const merged = mergeDeep({...existingDe}, missingDe);
  
  // Write back to de.json with proper formatting
  fs.writeFileSync(dePath, JSON.stringify(merged, null, 2), 'utf8');
  
  console.log('✅ Successfully merged missing translations into de.json');
  console.log('📝 Added translations for:');
  
  // Show what was added
  function showKeys(obj, prefix = '') {
    for (const key in obj) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
        showKeys(obj[key], fullKey);
      } else {
        console.log(`   ${fullKey}: "${obj[key]}"`);
      }
    }
  }
  
  showKeys(missingDe);
  
} catch (error) {
  console.error('❌ Error merging translations:', error);
  process.exit(1);
}