const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envFile = fs.readFileSync('/Users/robinroyhansen/projects/cbd-portal/.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const [key, ...val] = line.split('=');
  if (key && val.length) env[key.trim()] = val.join('=').trim();
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

// Country extraction - same as in page.tsx
const COUNTRY_FLAGS = {
  'usa': { flag: '🇺🇸', name: 'USA' },
  'united states': { flag: '🇺🇸', name: 'USA' },
  'america': { flag: '🇺🇸', name: 'USA' },
  'uk': { flag: '🇬🇧', name: 'UK' },
  'united kingdom': { flag: '🇬🇧', name: 'UK' },
  'germany': { flag: '🇩🇪', name: 'Germany' },
  'german': { flag: '🇩🇪', name: 'Germany' },
};

function extractCountry(text) {
  const lowerText = text.toLowerCase();
  for (const [keyword, info] of Object.entries(COUNTRY_FLAGS)) {
    if (lowerText.includes(keyword)) {
      return info;
    }
  }
  return null;
}

async function debug() {
  const { data: study } = await supabase
    .from('kb_research_queue')
    .select('id, title, abstract, url, source_site')
    .eq('status', 'approved')
    .ilike('title', '%social anxiety%')
    .limit(1)
    .single();

  console.log('=== Study Info ===');
  console.log('Title:', study.title);
  console.log('Source:', study.source_site);
  console.log('URL:', study.url);
  console.log('');

  const studyText = `${study.title || ''} ${study.abstract || ''}`;
  console.log('=== Text to search (first 500 chars) ===');
  console.log(studyText.substring(0, 500));
  console.log('');

  const country = extractCountry(studyText);
  console.log('=== Country extraction result ===');
  console.log('Country:', country);
  console.log('');

  // Check for any country mentions
  const keywords = ['usa', 'united states', 'america', 'uk', 'united kingdom', 'germany', 'german', 'canada', 'australia'];
  console.log('=== Checking for country keywords ===');
  keywords.forEach(kw => {
    if (studyText.toLowerCase().includes(kw)) {
      console.log(`Found: "${kw}"`);
    }
  });

  // Check if there's a location field or other fields
  const { data: fullStudy } = await supabase
    .from('kb_research_queue')
    .select('*')
    .eq('id', study.id)
    .single();

  console.log('\n=== All study fields ===');
  console.log(Object.keys(fullStudy).join(', '));
}

debug();
