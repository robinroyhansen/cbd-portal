#!/usr/bin/env node

// Autonomous Research Scanner Activation Script
console.log('🚀 AUTONOMOUS RESEARCH SCANNER ACTIVATION');
console.log('==========================================');
console.log('');

// Step 1: Database Migration SQL
const migrationSQL = `
-- Research Scanner Database Migration
-- Run this in Supabase SQL Editor: https://app.supabase.com/project/jgivzyszbpyuvqfmldin/editor

-- Create research queue table
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
  relevant_topics TEXT[],
  search_term_matched TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  reviewed_at TIMESTAMPTZ,
  reviewed_by TEXT,
  rejection_reason TEXT,
  discovered_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_research_queue_status ON kb_research_queue(status);
CREATE INDEX IF NOT EXISTS idx_research_queue_discovered ON kb_research_queue(discovered_at DESC);
CREATE INDEX IF NOT EXISTS idx_research_queue_score ON kb_research_queue(relevance_score DESC);
CREATE INDEX IF NOT EXISTS idx_research_queue_topics ON kb_research_queue USING gin(relevant_topics);

-- Enable RLS
ALTER TABLE kb_research_queue ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin full access" ON kb_research_queue;
CREATE POLICY "Admin full access" ON kb_research_queue FOR ALL USING (true);

-- Create article-research junction table
CREATE TABLE IF NOT EXISTS kb_article_research (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID REFERENCES kb_articles(id) ON DELETE CASCADE,
  research_id UUID REFERENCES kb_research_queue(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(article_id, research_id)
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_article_research_article ON kb_article_research(article_id);
CREATE INDEX IF NOT EXISTS idx_article_research_research ON kb_article_research(research_id);

-- Enable RLS
ALTER TABLE kb_article_research ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read access" ON kb_article_research;
CREATE POLICY "Public read access" ON kb_article_research FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin write access" ON kb_article_research;
CREATE POLICY "Admin write access" ON kb_article_research FOR INSERT USING (true);

-- Activate all languages for global research access
UPDATE kb_languages SET is_active = true WHERE is_active = false;
`;

console.log('📊 STEP 1: Database Migration');
console.log('===============================');
console.log('');
console.log('✅ Migration SQL prepared');
console.log('');
console.log('📋 EXECUTE THIS SQL IN SUPABASE:');
console.log('1. Go to: https://app.supabase.com/project/jgivzyszbpyuvqfmldin/editor');
console.log('2. Click "New query"');
console.log('3. Paste the following SQL:');
console.log('');
console.log(migrationSQL);
console.log('');
console.log('4. Click "Run"');
console.log('');

// Step 2: Generate CRON_SECRET
const crypto = require('crypto');
const cronSecret = crypto.randomBytes(32).toString('hex');

console.log('🔐 STEP 2: CRON_SECRET Generated');
console.log('=================================');
console.log('');
console.log(`CRON_SECRET: ${cronSecret}`);
console.log('');
console.log('📋 ADD TO VERCEL:');
console.log('1. Go to: https://vercel.com/robinroyhansens-projects/cbd-portal/settings/environment-variables');
console.log('2. Click "Add Environment Variable"');
console.log('3. Name: CRON_SECRET');
console.log(`4. Value: ${cronSecret}`);
console.log('5. Environment: Production, Preview, Development');
console.log('6. Click "Save"');
console.log('');

// Step 3: Deployment commands
console.log('🚀 STEP 3: Deployment Commands');
console.log('==============================');
console.log('');
console.log('Run these commands:');
console.log('```bash');
console.log('cd /Users/robinroyhansen/cbd-portal');
console.log('git add .');
console.log('git commit -m "🔬 Activate research scanner system"');
console.log('git push origin main');
console.log('```');
console.log('');

// Step 4: Verification
console.log('✅ STEP 4: Verification Tests');
console.log('============================');
console.log('');
console.log('After deployment, test:');
console.log('1. Admin interface: https://cbd-portal.vercel.app/admin/research');
console.log('2. Manual scan: Click "Manual Scan" button in admin interface');
console.log('3. API endpoint: https://cbd-portal.vercel.app/api/cron/research-scan');
console.log('4. Check daily cron runs at 6 AM UTC');
console.log('');

console.log('🎯 ACTIVATION SUMMARY');
console.log('====================');
console.log('✅ Migration SQL generated');
console.log('✅ CRON_SECRET generated');
console.log('✅ Deployment commands ready');
console.log('✅ Verification steps outlined');
console.log('');
console.log('🔬 RESEARCH SCANNER FEATURES:');
console.log('• Daily automated scanning of PubMed, ClinicalTrials.gov, PMC');
console.log('• 60+ comprehensive search terms');
console.log('• Intelligent relevance scoring and topic categorization');
console.log('• Admin review interface');
console.log('• Manual scan trigger');
console.log('• Automatic citation integration');
console.log('• Rate limiting and error handling');
console.log('');
console.log('🚀 READY FOR AUTONOMOUS ACTIVATION!');