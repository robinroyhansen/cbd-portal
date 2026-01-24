#!/usr/bin/env node

/**
 * Run SQL migration against Supabase
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  console.log('Running migration: add condition_slug to kb_articles...\n');

  // Step 1: Add column if not exists
  console.log('Step 1: Adding condition_slug column...');
  const { error: alterError } = await supabase.rpc('exec_sql', {
    sql: `ALTER TABLE kb_articles ADD COLUMN IF NOT EXISTS condition_slug TEXT;`
  }).maybeSingle();

  // If RPC doesn't exist, try direct approach
  if (alterError && alterError.message.includes('function')) {
    // Try using the REST API to check/add column
    const { data: testData, error: testError } = await supabase
      .from('kb_articles')
      .select('condition_slug')
      .limit(1);

    if (testError && testError.message.includes('condition_slug')) {
      console.log('Column does not exist. Please run this SQL in Supabase Dashboard:');
      console.log('\n---');
      console.log('ALTER TABLE kb_articles ADD COLUMN IF NOT EXISTS condition_slug TEXT;');
      console.log('CREATE INDEX IF NOT EXISTS idx_kb_articles_condition_slug ON kb_articles(condition_slug);');
      console.log('---\n');
      console.log('Then run this script again to populate the column.');
      return;
    } else {
      console.log('Column already exists or was just created.');
    }
  } else {
    console.log('Column added successfully.');
  }

  // Step 2: Get conditions
  console.log('\nStep 2: Fetching conditions...');
  const { data: conditions, error: conditionsError } = await supabase
    .from('kb_conditions')
    .select('id, slug, name, display_name')
    .eq('is_published', true);

  if (conditionsError) {
    console.error('Error fetching conditions:', conditionsError);
    return;
  }
  console.log(`Found ${conditions.length} conditions`);

  // Step 3: Get articles without condition_slug
  console.log('\nStep 3: Fetching articles to link...');
  const { data: articles, error: articlesError } = await supabase
    .from('kb_articles')
    .select('id, title, slug')
    .is('condition_slug', null);

  if (articlesError) {
    // Column might not exist yet
    if (articlesError.message.includes('condition_slug')) {
      console.log('\nThe condition_slug column does not exist yet.');
      console.log('Please run this SQL in Supabase SQL Editor first:\n');
      console.log('ALTER TABLE kb_articles ADD COLUMN IF NOT EXISTS condition_slug TEXT;');
      console.log('CREATE INDEX IF NOT EXISTS idx_kb_articles_condition_slug ON kb_articles(condition_slug);');
      return;
    }
    console.error('Error fetching articles:', articlesError);
    return;
  }

  console.log(`Found ${articles?.length || 0} articles without condition_slug`);

  if (!articles || articles.length === 0) {
    console.log('\nNo articles need linking.');
    return;
  }

  // Step 4: Link articles to conditions
  console.log('\nStep 4: Linking articles to conditions...');
  let linkedCount = 0;

  for (const article of articles) {
    const titleLower = article.title.toLowerCase();
    const slugLower = article.slug.toLowerCase();

    let matchedCondition = null;
    let matchScore = 0;

    for (const condition of conditions) {
      const conditionName = condition.name.toLowerCase();
      const conditionDisplay = (condition.display_name || '').toLowerCase();
      const conditionSlug = condition.slug.toLowerCase().replace(/_/g, ' ');

      let score = 0;

      // "CBD for X" or "CBD and X" patterns (strongest match)
      if (titleLower.includes(`cbd for ${conditionName}`) ||
          titleLower.includes(`cbd and ${conditionName}`) ||
          titleLower.includes(`cbd for ${conditionDisplay}`) ||
          titleLower.includes(`cbd and ${conditionDisplay}`)) {
        score += 20;
      }

      // Condition name in title
      if (titleLower.includes(conditionName) || titleLower.includes(conditionDisplay)) {
        score += 10;
      }

      // Condition slug in article slug
      if (slugLower.includes(condition.slug) ||
          slugLower.includes(conditionName.replace(/\s+/g, '-'))) {
        score += 8;
      }

      if (score > matchScore) {
        matchScore = score;
        matchedCondition = condition;
      }
    }

    if (matchedCondition && matchScore >= 8) {
      const { error: updateError } = await supabase
        .from('kb_articles')
        .update({ condition_slug: matchedCondition.slug })
        .eq('id', article.id);

      if (updateError) {
        console.error(`  Error linking "${article.title}":`, updateError.message);
      } else {
        console.log(`  Linked: "${article.title}" -> ${matchedCondition.slug}`);
        linkedCount++;
      }
    }
  }

  console.log(`\nLinked ${linkedCount} articles to conditions`);

  // Summary
  const { data: summary } = await supabase
    .from('kb_articles')
    .select('condition_slug')
    .not('condition_slug', 'is', null);

  if (summary && summary.length > 0) {
    const counts = {};
    summary.forEach(a => {
      counts[a.condition_slug] = (counts[a.condition_slug] || 0) + 1;
    });

    console.log('\nArticles per condition:');
    Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .forEach(([slug, count]) => {
        console.log(`  ${slug}: ${count}`);
      });
  }
}

runMigration().catch(console.error);
