const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Read environment variables
const envContent = fs.readFileSync('.env.local', 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) env[match[1].trim()] = match[2].trim();
});

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY
);

async function runSetup() {
  console.log('Running research scanner setup...\n');

  // 1. Create kb_research_queue table
  console.log('1. Creating kb_research_queue table...');
  const { error: err1 } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS kb_research_queue (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title TEXT NOT NULL,
        authors TEXT,
        publication TEXT,
        year INT,
        abstract TEXT,
        url TEXT NOT NULL UNIQUE,
        doi TEXT,
        source_site TEXT,
        relevance_score INT,
        relevance_signals TEXT[],
        relevant_topics TEXT[],
        detected_language VARCHAR(20),
        search_term_matched TEXT,
        study_subject TEXT,
        status VARCHAR(20) DEFAULT 'pending',
        reviewed_at TIMESTAMPTZ,
        reviewed_by TEXT,
        rejection_reason TEXT,
        discovered_at TIMESTAMPTZ DEFAULT NOW(),
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `
  });

  if (err1) {
    // Try direct query approach
    const { error: createErr } = await supabase.from('kb_research_queue').select('id').limit(1);
    if (createErr && createErr.code === 'PGRST205') {
      console.log('  Table does not exist, need to create via SQL Editor');
    } else {
      console.log('  Table already exists or accessible');
    }
  } else {
    console.log('  Done');
  }

  // Test if tables exist
  console.log('\n2. Checking if tables exist...');

  const { data: queueData, error: queueErr } = await supabase
    .from('kb_research_queue')
    .select('id', { count: 'exact', head: true });

  if (queueErr) {
    console.log('  kb_research_queue: NOT FOUND - ' + queueErr.message);
  } else {
    console.log('  kb_research_queue: EXISTS');
  }

  const { data: jobsData, error: jobsErr } = await supabase
    .from('kb_scan_jobs')
    .select('id', { count: 'exact', head: true });

  if (jobsErr) {
    console.log('  kb_scan_jobs: NOT FOUND - ' + jobsErr.message);
  } else {
    console.log('  kb_scan_jobs: EXISTS');
  }

  console.log('\n--- Summary ---');
  if (queueErr || jobsErr) {
    console.log('Some tables are missing. Please run the SQL manually in Supabase SQL Editor.');
    console.log('\nFixed SQL (copy this):');
    console.log(fs.readFileSync('supabase/setup_research_scanner.sql', 'utf-8'));
  } else {
    console.log('All tables exist! Setup complete.');
  }
}

runSetup().catch(console.error);
