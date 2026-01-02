#!/usr/bin/env node

const { Client } = require('pg');

// Supabase connection details
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseKey || !supabaseUrl) {
  console.error('❌ SUPABASE environment variables are required');
  process.exit(1);
}

// Extract project ref from URL: https://yyjuneubsrrqzlcueews.supabase.co
const projectRef = supabaseUrl.replace('https://', '').replace('.supabase.co', '');

// Decode the JWT to get connection details
const payload = JSON.parse(Buffer.from(supabaseKey.split('.')[1], 'base64').toString());
const connectionString = `postgresql://postgres.${projectRef}:${payload.secret || '[YOUR_PASSWORD]'}@aws-0-us-west-1.pooler.supabase.com:5432/postgres`;

// Use provided service role key for auth
const client = new Client({
  connectionString: `postgresql://postgres:${process.env.DB_PASSWORD || '[YOUR_PASSWORD]'}@db.${projectRef}.supabase.co:5432/postgres`,
  ssl: { rejectUnauthorized: false }
});

async function setupDirectDatabase() {
  console.log('🔧 SETTING UP CBD PORTAL DATABASE (DIRECT)');
  console.log('='.repeat(50));

  try {
    // Simple approach: use Supabase Admin API
    console.log('📝 Using Supabase Admin API...');

    // Let's use the graphql endpoint to execute SQL
    const response = await fetch(`${supabaseUrl}/graphql/v1`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey
      },
      body: JSON.stringify({
        query: `
          mutation {
            __schema {
              types {
                name
              }
            }
          }
        `
      })
    });

    const result = await response.json();
    console.log('GraphQL response:', result);

  } catch (error) {
    console.error('💥 Direct setup failed:', error.message);

    // Alternative: try the REST API with a custom admin function
    console.log('🔄 Trying alternative approach...');
    await tryAlternativeSetup();
  }
}

async function tryAlternativeSetup() {
  // Since we can't create tables, let's check if there's an existing schema
  const { createClient } = require('@supabase/supabase-js');
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Check what tables exist
    console.log('🔍 Checking existing schema...');
    const { data, error } = await supabase
      .rpc('get_schema_information', {});

    if (error) {
      console.log('❌ Schema check failed:', error.message);

      // Last resort: provide manual instructions
      console.log('\n' + '='.repeat(60));
      console.log('🚨 MANUAL SETUP REQUIRED');
      console.log('='.repeat(60));
      console.log('');
      console.log('The database tables need to be created manually.');
      console.log('Please run the following in your Supabase SQL Editor:');
      console.log('');
      console.log('1. Go to https://supabase.com/dashboard');
      console.log('2. Open your CBD Portal project');
      console.log('3. Go to SQL Editor');
      console.log('4. Create a new query');
      console.log('5. Copy and paste this SQL:');
      console.log('');
      console.log('-- Basic table setup:');
      console.log(`
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO $$ BEGIN
    CREATE TYPE article_status AS ENUM ('draft', 'pending_review', 'published');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS kb_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  article_count INTEGER DEFAULT 0 NOT NULL
);

CREATE TABLE IF NOT EXISTS kb_articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT NOT NULL,
  featured_image TEXT,
  status article_status DEFAULT 'draft' NOT NULL,
  featured BOOLEAN DEFAULT FALSE NOT NULL,
  category_id UUID REFERENCES kb_categories(id) ON DELETE SET NULL,
  author_id UUID,
  published_at TIMESTAMPTZ,
  reading_time INTEGER,
  meta_title TEXT,
  meta_description TEXT
);

INSERT INTO kb_categories (id, name, slug, description) VALUES
  ('11111111-1111-1111-1111-111111111111', 'CBD Basics', 'cbd-basics', 'Fundamental information about CBD'),
  ('22222222-2222-2222-2222-222222222222', 'Health & Wellness', 'health-wellness', 'CBD applications for health and wellness'),
  ('33333333-3333-3333-3333-333333333333', 'Mental Health', 'mental-health', 'CBD for anxiety, depression, and mental health'),
  ('44444444-4444-4444-4444-444444444444', 'Product Guides', 'product-guides', 'Guides to different CBD product types'),
  ('55555555-5555-5555-5555-555555555555', 'Safety', 'safety', 'CBD safety information and drug interactions')
ON CONFLICT (slug) DO NOTHING;

ALTER TABLE kb_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE kb_articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON kb_categories FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON kb_categories FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users only" ON kb_categories FOR UPDATE USING (true);

CREATE POLICY "Enable read access for all users" ON kb_articles FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON kb_articles FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users only" ON kb_articles FOR UPDATE USING (true);
      `);
      console.log('6. Click "Run" to execute the SQL');
      console.log('7. After successful execution, run the populate script');
      console.log('');
      console.log('='.repeat(60));

    } else {
      console.log('✅ Schema information retrieved:', data);
    }

  } catch (error) {
    console.error('Schema check error:', error);
  }
}

if (require.main === module) {
  setupDirectDatabase();
}

module.exports = { setupDirectDatabase };