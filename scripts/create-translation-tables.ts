#!/usr/bin/env npx tsx
/**
 * Create translation tables using Supabase REST API
 */

import { createClient } from '@supabase/supabase-js';

async function main() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Missing Supabase environment variables');
    process.exit(1);
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      db: { schema: 'public' },
      auth: { persistSession: false }
    }
  );

  console.log('🔄 Creating translation tables...\n');

  // We'll create tables one by one using raw SQL via rpc if available,
  // or fall back to checking if we can insert into them

  const tables = [
    {
      name: 'condition_translations',
      check: async () => {
        const { error } = await supabase.from('condition_translations').select('id').limit(0);
        return !error;
      }
    },
    {
      name: 'glossary_translations',
      check: async () => {
        const { error } = await supabase.from('glossary_translations').select('id').limit(0);
        return !error;
      }
    },
    {
      name: 'article_translations',
      check: async () => {
        const { error } = await supabase.from('article_translations').select('id').limit(0);
        return !error;
      }
    },
    {
      name: 'research_translations',
      check: async () => {
        const { error } = await supabase.from('research_translations').select('id').limit(0);
        return !error;
      }
    }
  ];

  let allExist = true;
  for (const table of tables) {
    const exists = await table.check();
    if (exists) {
      console.log(`✅ ${table.name} - exists`);
    } else {
      console.log(`❌ ${table.name} - does not exist`);
      allExist = false;
    }
  }

  if (allExist) {
    console.log('\n✅ All translation tables exist!');
    return;
  }

  console.log('\n⚠️ Some tables are missing. You need to run the SQL migration manually.');
  console.log('\nPlease run this SQL in your Supabase SQL Editor:\n');
  console.log('━'.repeat(60));
  console.log(`
CREATE TABLE IF NOT EXISTS condition_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  condition_id UUID NOT NULL REFERENCES kb_conditions(id) ON DELETE CASCADE,
  language VARCHAR(5) NOT NULL,
  name TEXT NOT NULL,
  display_name TEXT,
  short_description TEXT,
  long_description TEXT,
  meta_title TEXT,
  meta_description TEXT,
  translated_at TIMESTAMPTZ DEFAULT NOW(),
  translation_quality VARCHAR(20) DEFAULT 'ai',
  UNIQUE(condition_id, language)
);

CREATE TABLE IF NOT EXISTS glossary_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  term_id UUID NOT NULL REFERENCES kb_glossary(id) ON DELETE CASCADE,
  language VARCHAR(5) NOT NULL,
  term TEXT NOT NULL,
  definition TEXT NOT NULL,
  simple_definition TEXT,
  translated_at TIMESTAMPTZ DEFAULT NOW(),
  translation_quality VARCHAR(20) DEFAULT 'ai',
  UNIQUE(term_id, language)
);

CREATE TABLE IF NOT EXISTS article_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL REFERENCES kb_articles(id) ON DELETE CASCADE,
  language VARCHAR(5) NOT NULL,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  meta_title TEXT,
  meta_description TEXT,
  translated_at TIMESTAMPTZ DEFAULT NOW(),
  source_updated_at TIMESTAMPTZ,
  translation_quality VARCHAR(20) DEFAULT 'ai',
  UNIQUE(article_id, language)
);

CREATE TABLE IF NOT EXISTS research_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  research_id UUID NOT NULL REFERENCES kb_research_queue(id) ON DELETE CASCADE,
  language VARCHAR(5) NOT NULL,
  plain_summary TEXT NOT NULL,
  translated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(research_id, language)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_condition_translations_lang ON condition_translations(language);
CREATE INDEX IF NOT EXISTS idx_glossary_translations_lang ON glossary_translations(language);
CREATE INDEX IF NOT EXISTS idx_article_translations_lang ON article_translations(language);
CREATE INDEX IF NOT EXISTS idx_research_translations_lang ON research_translations(language);

-- Enable RLS and add policies
ALTER TABLE condition_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE glossary_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_translations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read" ON condition_translations FOR SELECT USING (true);
CREATE POLICY "public_read" ON glossary_translations FOR SELECT USING (true);
CREATE POLICY "public_read" ON article_translations FOR SELECT USING (true);
CREATE POLICY "public_read" ON research_translations FOR SELECT USING (true);
`);
  console.log('━'.repeat(60));
  console.log('\nGo to: https://supabase.com/dashboard/project/bvrdryvgqarffgdujmjz/sql/new');
}

main().catch(console.error);
