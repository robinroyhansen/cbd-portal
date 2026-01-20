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
    // Remove surrounding quotes if present
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

async function check() {
  const { data, error } = await supabase
    .from('kb_conditions')
    .select('slug, name, is_published')
    .order('slug')
    .limit(10);

  if (error) {
    console.log('Error:', error.message);
    return;
  }

  console.log('First 10 conditions:');
  data.forEach(c => {
    console.log('  ' + c.slug + ' - published: ' + c.is_published);
  });

  // Count published vs unpublished
  const { data: counts } = await supabase
    .from('kb_conditions')
    .select('is_published');

  const published = counts.filter(c => c.is_published === true).length;
  const unpublished = counts.filter(c => c.is_published === false || c.is_published === null).length;
  console.log('\nTotal published: ' + published);
  console.log('Total unpublished: ' + unpublished);

  // Check if anxiety exists
  const { data: anxiety } = await supabase
    .from('kb_conditions')
    .select('*')
    .eq('slug', 'anxiety')
    .single();

  console.log('\nAnxiety condition:');
  if (anxiety) {
    console.log('  slug: ' + anxiety.slug);
    console.log('  is_published: ' + anxiety.is_published);
    console.log('  name: ' + anxiety.name);
  } else {
    console.log('  NOT FOUND');
  }
}

check();
