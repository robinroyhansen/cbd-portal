const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Read env file manually
const envContent = fs.readFileSync('.env.local', 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)="?([^"]*)"?$/);
  if (match) env[match[1]] = match[2];
});

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkRetracted() {
  // Check for any remaining retracted entries
  const { data: remaining, error: remainError } = await supabase
    .from('kb_research_queue')
    .select('id, title, status')
    .ilike('title', '%RETRACTED%');

  if (remainError) {
    console.error('Error checking remaining:', remainError);
  } else {
    console.log(`\nRemaining retracted in queue: ${remaining?.length || 0}`);
    if (remaining && remaining.length > 0) {
      remaining.forEach(r => console.log(`  - [${r.status}] ${r.title?.substring(0, 80)}`));
    }
  }

  // Check kb_articles for any retracted content
  const { data: articles, error: articlesError } = await supabase
    .from('kb_articles')
    .select('id, title, slug')
    .ilike('title', '%RETRACTED%');

  if (articlesError) {
    console.error('Error checking articles:', articlesError);
  } else {
    console.log(`\nRetracted in kb_articles: ${articles?.length || 0}`);
    if (articles && articles.length > 0) {
      articles.forEach(a => console.log(`  - ${a.title} (${a.slug})`));
    }
  }

  // Check if any approved research references retracted content
  const { data: approved, error: approvedError } = await supabase
    .from('kb_research_queue')
    .select('id, title, status')
    .eq('status', 'approved')
    .or('title.ilike.%RETRACTED%,title.ilike.%scam%,title.ilike.%gummies%reviews%');

  if (approvedError) {
    console.error('Error checking approved:', approvedError);
  } else {
    const suspicious = approved?.filter(a =>
      a.title?.toLowerCase().includes('retracted') ||
      a.title?.toLowerCase().includes('scam') ||
      (a.title?.toLowerCase().includes('gummies') && a.title?.toLowerCase().includes('review'))
    ) || [];
    console.log(`\nSuspicious approved entries: ${suspicious.length}`);
    if (suspicious.length > 0) {
      suspicious.forEach(a => console.log(`  - [${a.status}] ${a.title?.substring(0, 80)}`));
    }
  }
}

checkRetracted();
