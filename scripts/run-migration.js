#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load .env.local manually
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
envContent.split('\n').forEach(line => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const [key, ...valueParts] = trimmed.split('=');
    let value = valueParts.join('=');
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseKey || !supabaseUrl) {
  console.error('Missing env vars');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAndCreateTable() {
  console.log('Checking database state...');

  // First, let's see what tables we can access
  const { data: articles, error: artError } = await supabase
    .from('kb_articles')
    .select('id')
    .limit(1);

  if (artError) {
    console.log('kb_articles error:', artError.message);
  } else {
    console.log('kb_articles accessible');
  }

  // Try to access kb_conditions
  const { data: conditions, error: condError } = await supabase
    .from('kb_conditions')
    .select('id, slug')
    .limit(5);

  if (condError) {
    console.log('kb_conditions error:', condError.message);
    console.log('\nThe kb_conditions table does not exist.');
    console.log('You need to run the migration SQL in Supabase SQL Editor.');
    console.log('File: supabase/migrations/20260116_create_kb_conditions.sql');
  } else {
    console.log('kb_conditions accessible, found', conditions?.length || 0, 'records');
    if (conditions && conditions.length > 0) {
      console.log('Sample conditions:', conditions.map(c => c.slug).join(', '));
    }
  }
}

checkAndCreateTable();
