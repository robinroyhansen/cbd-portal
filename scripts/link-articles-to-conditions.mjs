#!/usr/bin/env node

/**
 * Link Articles to Conditions Script
 *
 * This script automatically links existing articles to health conditions
 * based on title matching and content analysis.
 *
 * Run after applying the migration: 20260124_add_condition_slug_to_articles.sql
 *
 * Usage: node scripts/link-articles-to-conditions.mjs
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function linkArticlesToConditions() {
  console.log('Fetching conditions...');

  // Get all conditions
  const { data: conditions, error: conditionsError } = await supabase
    .from('kb_conditions')
    .select('id, slug, name, display_name')
    .eq('is_published', true);

  if (conditionsError) {
    console.error('Error fetching conditions:', conditionsError);
    return;
  }

  console.log(`Found ${conditions.length} conditions`);

  // Get all articles without a condition_slug
  const { data: articles, error: articlesError } = await supabase
    .from('kb_articles')
    .select('id, title, slug, content')
    .is('condition_slug', null)
    .eq('status', 'published');

  if (articlesError) {
    console.error('Error fetching articles:', articlesError);
    return;
  }

  console.log(`Found ${articles.length} articles without condition_slug`);

  let linkedCount = 0;

  for (const article of articles) {
    const titleLower = article.title.toLowerCase();
    const slugLower = article.slug.toLowerCase();
    const contentLower = (article.content || '').toLowerCase().substring(0, 2000);

    // Find matching condition
    let matchedCondition = null;
    let matchScore = 0;

    for (const condition of conditions) {
      const conditionName = condition.name.toLowerCase();
      const conditionDisplay = (condition.display_name || '').toLowerCase();
      const conditionSlug = condition.slug.toLowerCase();

      let score = 0;

      // Check title matches (highest weight)
      if (titleLower.includes(conditionName) || titleLower.includes(conditionDisplay)) {
        score += 10;
      }

      // Check slug matches
      if (slugLower.includes(conditionSlug) || slugLower.includes(conditionName.replace(/\s+/g, '-'))) {
        score += 5;
      }

      // Check content matches (lower weight)
      if (contentLower.includes(conditionName)) {
        score += 2;
      }

      // "CBD for X" or "CBD and X" patterns
      if (titleLower.includes(`cbd for ${conditionName}`) ||
          titleLower.includes(`cbd and ${conditionName}`) ||
          titleLower.includes(`cannabidiol for ${conditionName}`)) {
        score += 15; // Strong indicator
      }

      if (score > matchScore) {
        matchScore = score;
        matchedCondition = condition;
      }
    }

    // Only link if we have a meaningful match
    if (matchedCondition && matchScore >= 5) {
      console.log(`Linking "${article.title}" -> ${matchedCondition.name} (score: ${matchScore})`);

      const { error: updateError } = await supabase
        .from('kb_articles')
        .update({ condition_slug: matchedCondition.slug })
        .eq('id', article.id);

      if (updateError) {
        console.error(`  Error updating article ${article.id}:`, updateError.message);
      } else {
        linkedCount++;
      }
    }
  }

  console.log(`\nLinked ${linkedCount} articles to conditions`);

  // Show summary of articles per condition
  const { data: summary } = await supabase
    .from('kb_articles')
    .select('condition_slug')
    .not('condition_slug', 'is', null);

  const conditionCounts = {};
  summary?.forEach(a => {
    conditionCounts[a.condition_slug] = (conditionCounts[a.condition_slug] || 0) + 1;
  });

  console.log('\nArticles per condition:');
  Object.entries(conditionCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([slug, count]) => {
      console.log(`  ${slug}: ${count} articles`);
    });
}

linkArticlesToConditions().catch(console.error);
