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

async function removeBlacklistedStudy() {
  // Remove the corticobasal degeneration study that slipped through
  const { data: matches, error } = await supabase
    .from('kb_research_queue')
    .select('id, title, status')
    .ilike('title', '%corticobasal degeneration%');

  if (error) {
    console.error('Error finding studies:', error);
    return;
  }

  console.log(`Found ${matches?.length || 0} studies with "corticobasal degeneration":`);
  if (matches && matches.length > 0) {
    for (const m of matches) {
      console.log(`  - [${m.status}] ${m.title?.substring(0, 80)}`);
    }

    const ids = matches.map(m => m.id);
    const { error: delError } = await supabase
      .from('kb_research_queue')
      .delete()
      .in('id', ids);

    if (delError) {
      console.error('Error deleting:', delError);
    } else {
      console.log(`Deleted ${ids.length} studies.`);
    }
  }
}

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

async function checkAllBlacklistTerms() {
  // Get all blacklist terms
  const { data: blacklist, error: blError } = await supabase
    .from('research_blacklist')
    .select('term, match_type');

  if (blError) {
    console.error('Error fetching blacklist:', blError);
    return;
  }

  console.log(`\n=== Checking ${blacklist?.length || 0} blacklist terms ===\n`);

  let totalFound = 0;
  const allMatches = [];

  for (const bl of blacklist || []) {
    // Normalize the term for searching
    const searchTerm = bl.term.toLowerCase()
      .replace(/[\u2010\u2011\u2012\u2013\u2014\u2015\u2212]/g, '-');

    // Search in both title and abstract
    const { data: titleMatches } = await supabase
      .from('kb_research_queue')
      .select('id, title, status')
      .ilike('title', `%${searchTerm}%`);

    const { data: abstractMatches } = await supabase
      .from('kb_research_queue')
      .select('id, title, status')
      .ilike('abstract', `%${searchTerm}%`);

    // Combine and deduplicate
    const combined = [...(titleMatches || []), ...(abstractMatches || [])];
    const unique = combined.filter((item, index, self) =>
      index === self.findIndex(t => t.id === item.id)
    );

    if (unique.length > 0) {
      console.log(`\n"${bl.term}" (${bl.match_type}): ${unique.length} matches`);
      unique.forEach(m => {
        console.log(`  - [${m.status}] ${m.title?.substring(0, 70)}...`);
        allMatches.push({ ...m, matchedTerm: bl.term });
      });
      totalFound += unique.length;
    }
  }

  console.log(`\n=== Summary ===`);
  console.log(`Total studies matching blacklist terms: ${totalFound}`);

  if (totalFound > 0 && allMatches.length > 0) {
    const byStatus = allMatches.reduce((acc, m) => {
      acc[m.status] = (acc[m.status] || 0) + 1;
      return acc;
    }, {});
    console.log(`By status:`, byStatus);

    // Ask if should delete
    console.log(`\nTo delete these, run with --delete flag`);

    if (process.argv.includes('--delete')) {
      const ids = [...new Set(allMatches.map(m => m.id))];
      const { error: delError } = await supabase
        .from('kb_research_queue')
        .delete()
        .in('id', ids);

      if (delError) {
        console.error('Error deleting:', delError);
      } else {
        console.log(`\nDeleted ${ids.length} studies.`);
      }
    }
  }
}

checkAllBlacklistTerms();
