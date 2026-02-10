#!/usr/bin/env node
// Script to insert Swedish translations into Supabase
// Usage: node insert-swedish-translation.js

const fs = require('fs');

const SUPABASE_URL = 'https://bvrdryvgqarffgdujmjz.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function insertTranslation(translation) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/article_translations`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify(translation)
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Insert failed: ${response.status} - ${error}`);
  }
  
  return true;
}

async function main() {
  const translationFile = process.argv[2];
  if (!translationFile) {
    console.error('Usage: node insert-swedish-translation.js <translation.json>');
    process.exit(1);
  }
  
  const translation = JSON.parse(fs.readFileSync(translationFile, 'utf-8'));
  
  try {
    await insertTranslation(translation);
    console.log(`✓ Inserted: ${translation.slug}`);
  } catch (error) {
    console.error(`✗ Failed: ${translation.slug} - ${error.message}`);
    process.exit(1);
  }
}

main();
