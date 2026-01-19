const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

try {
  const envPath = path.join(process.cwd(), '.env.local');
  fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
    const [key, ...vals] = line.split('=');
    if (key && vals.length) {
      process.env[key.trim()] = vals.join('=').replace(/^["']|["']$/g, '');
    }
  });
} catch (e) {}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
  // Get sample citations
  const { data: citations } = await supabase
    .from('kb_citations')
    .select('id, title, authors, year')
    .limit(5);

  console.log('Checking if citations match studies in kb_research_queue...\n');

  for (const c of citations) {
    // Search for matching study
    const searchTerms = c.title.split(' ').slice(0, 4).join(' ');
    const { data: studies } = await supabase
      .from('kb_research_queue')
      .select('title, doi, pmid, slug')
      .textSearch('title', searchTerms.replace(/[^\w\s]/g, ''))
      .limit(1);

    console.log('Citation:', c.title.substring(0, 60) + '...');
    if (studies && studies.length > 0) {
      console.log('  MATCH FOUND:', studies[0].slug);
      console.log('  DOI:', studies[0].doi);
      console.log('  PMID:', studies[0].pmid);
    } else {
      console.log('  No match in research queue');
    }
    console.log('');
  }
}

check();
