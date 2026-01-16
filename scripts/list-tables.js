const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envContent = fs.readFileSync('.env.local', 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) env[match[1].trim()] = match[2].trim();
});

fetch(env.NEXT_PUBLIC_SUPABASE_URL + '/rest/v1/', {
  headers: {
    'apikey': env.SUPABASE_SERVICE_ROLE_KEY,
    'Authorization': 'Bearer ' + env.SUPABASE_SERVICE_ROLE_KEY
  }
}).then(r => r.json()).then(schema => {
  const paths = Object.keys(schema.paths || {}).filter(p => p !== '/');
  console.log('Available tables/views:');
  paths.forEach(p => console.log(' -', p.replace('/', '')));
}).catch(e => console.error('Error:', e));
