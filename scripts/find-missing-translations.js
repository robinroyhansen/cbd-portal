#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function findMissingKeys(enObj, deObj, prefix = '') {
  const missing = {};
  
  for (const [key, value] of Object.entries(enObj)) {
    const currentPath = prefix ? `${prefix}.${key}` : key;
    
    if (typeof value === 'object' && value !== null) {
      if (!deObj[key] || typeof deObj[key] !== 'object') {
        missing[key] = value;
      } else {
        const nestedMissing = findMissingKeys(value, deObj[key], currentPath);
        if (Object.keys(nestedMissing).length > 0) {
          missing[key] = nestedMissing;
        }
      }
    } else {
      if (deObj[key] === undefined) {
        missing[key] = value;
      }
    }
  }
  
  return missing;
}

try {
  const enPath = path.join(__dirname, '../locales/en.json');
  const dePath = path.join(__dirname, '../locales/de.json');
  
  const enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));
  const deData = JSON.parse(fs.readFileSync(dePath, 'utf8'));
  
  const missing = findMissingKeys(enData, deData);
  
  // Write missing translations by section
  const sections = {
    editorialPolicy: missing.editorialPolicy || {},
    methodology: missing.methodology || {},
    cookiePolicy: missing.cookiePolicy || {},
    privacyPolicy: missing.privacyPolicy || {},
    termsOfService: missing.termsOfService || {},
    medicalDisclaimer: missing.medicalDisclaimer || {},
    other: {}
  };
  
  // Collect other missing keys
  for (const [key, value] of Object.entries(missing)) {
    if (!sections[key]) {
      sections.other[key] = value;
    }
  }
  
  // Write results
  fs.writeFileSync(
    path.join(__dirname, '../missing-translations-by-section.json'),
    JSON.stringify(sections, null, 2)
  );
  
  console.log('Missing translations analysis complete:');
  console.log(`- editorialPolicy: ${Object.keys(sections.editorialPolicy).length} keys`);
  console.log(`- methodology: ${Object.keys(sections.methodology).length} keys`);
  console.log(`- cookiePolicy: ${Object.keys(sections.cookiePolicy).length} keys`);
  console.log(`- privacyPolicy: ${Object.keys(sections.privacyPolicy).length} keys`);
  console.log(`- termsOfService: ${Object.keys(sections.termsOfService).length} keys`);
  console.log(`- medicalDisclaimer: ${Object.keys(sections.medicalDisclaimer).length} keys`);
  console.log(`- other sections: ${Object.keys(sections.other).length} keys`);
  
  const totalMissing = Object.values(sections).reduce((sum, section) => sum + Object.keys(section).length, 0);
  console.log(`Total missing keys: ${totalMissing}`);
  
} catch (error) {
  console.error('Error:', error.message);
  process.exit(1);
}