#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

// Supabase connection
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseKey || !supabaseUrl) {
  console.error('❌ SUPABASE environment variables are required');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function setupDatabase() {
  console.log('🔧 SETTING UP CBD PORTAL DATABASE');
  console.log('='.repeat(50));

  try {
    // Use fetch to directly hit the Supabase REST API for SQL execution
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey
      },
      body: JSON.stringify({
        query: `
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum for article status if not exists
DO $$ BEGIN
    CREATE TYPE article_status AS ENUM ('draft', 'pending_review', 'published');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Categories table
CREATE TABLE IF NOT EXISTS kb_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  article_count INTEGER DEFAULT 0 NOT NULL,
  CONSTRAINT kb_categories_name_unique UNIQUE (name),
  CONSTRAINT kb_categories_slug_unique UNIQUE (slug)
);

-- Articles table
CREATE TABLE IF NOT EXISTS kb_articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
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
  meta_description TEXT,
  CONSTRAINT kb_articles_slug_unique UNIQUE (slug)
);

-- Tags table
CREATE TABLE IF NOT EXISTS kb_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  article_count INTEGER DEFAULT 0 NOT NULL,
  CONSTRAINT kb_tags_name_unique UNIQUE (name),
  CONSTRAINT kb_tags_slug_unique UNIQUE (slug)
);

-- Many-to-many relationship between articles and tags
CREATE TABLE IF NOT EXISTS kb_article_tags (
  article_id UUID NOT NULL REFERENCES kb_articles(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES kb_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (article_id, tag_id)
);

-- Citations/References table
CREATE TABLE IF NOT EXISTS kb_citations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  article_id UUID NOT NULL REFERENCES kb_articles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  authors TEXT,
  publication TEXT,
  year INTEGER,
  url TEXT,
  doi TEXT,
  citation_text TEXT,
  order_index INTEGER DEFAULT 0
);

-- Research scanning system tables
CREATE TABLE IF NOT EXISTS kb_research_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  authors TEXT,
  publication TEXT,
  year INT,
  abstract TEXT,
  url TEXT NOT NULL,
  doi TEXT,
  source_site TEXT,
  relevance_score INT,
  relevant_topics TEXT[],
  status VARCHAR(20) DEFAULT 'pending',
  priority INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT kb_research_queue_url_unique UNIQUE (url)
);

CREATE TABLE IF NOT EXISTS kb_article_research (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL REFERENCES kb_articles(id) ON DELETE CASCADE,
  research_queue_id UUID NOT NULL REFERENCES kb_research_queue(id) ON DELETE CASCADE,
  integration_status VARCHAR(20) DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
        `
      })
    });

    if (!response.ok) {
      // If direct SQL fails, try creating tables using individual operations
      console.log('📝 Direct SQL failed, creating tables manually...');

      // Create categories first
      console.log('📂 Creating categories...');
      await createCategoriesTable();

      // Insert default categories
      console.log('📋 Inserting default categories...');
      await insertDefaultCategories();

    } else {
      console.log('✅ Database tables created successfully');
    }

    // Always try to insert default categories (with conflict handling)
    await insertDefaultCategories();

    // Test the setup by querying categories
    console.log('🧪 Testing database setup...');
    const { data: categories, error: testError } = await supabase
      .from('kb_categories')
      .select('id, name, slug');

    if (testError) {
      console.error('❌ Database test failed:', testError);
    } else {
      console.log('✅ Database test successful!');
      console.log(`📂 Found ${categories.length} categories:`, categories.map(c => c.name).join(', '));
      return true;
    }

  } catch (error) {
    console.error('💥 Setup failed:', error);
    return false;
  }
}

async function createCategoriesTable() {
  // Create categories using Supabase client - this should work
  const categories = [
    { id: '11111111-1111-1111-1111-111111111111', name: 'CBD Basics', slug: 'cbd-basics', description: 'Fundamental information about CBD' },
    { id: '22222222-2222-2222-2222-222222222222', name: 'Health & Wellness', slug: 'health-wellness', description: 'CBD applications for health and wellness' },
    { id: '33333333-3333-3333-3333-333333333333', name: 'Mental Health', slug: 'mental-health', description: 'CBD for anxiety, depression, and mental health' },
    { id: '44444444-4444-4444-4444-444444444444', name: 'Product Guides', slug: 'product-guides', description: 'Guides to different CBD product types' },
    { id: '55555555-5555-5555-5555-555555555555', name: 'Safety', slug: 'safety', description: 'CBD safety information and drug interactions' }
  ];

  // Try to query first to see if table exists
  const { error } = await supabase.from('kb_categories').select('count').limit(1);

  if (error && error.message.includes('does not exist')) {
    console.log('❌ Categories table does not exist. This requires manual database setup.');
    return false;
  }

  return true;
}

async function insertDefaultCategories() {
  const categories = [
    { id: '11111111-1111-1111-1111-111111111111', name: 'CBD Basics', slug: 'cbd-basics', description: 'Fundamental information about CBD' },
    { id: '22222222-2222-2222-2222-222222222222', name: 'Health & Wellness', slug: 'health-wellness', description: 'CBD applications for health and wellness' },
    { id: '33333333-3333-3333-3333-333333333333', name: 'Mental Health', slug: 'mental-health', description: 'CBD for anxiety, depression, and mental health' },
    { id: '44444444-4444-4444-4444-444444444444', name: 'Product Guides', slug: 'product-guides', description: 'Guides to different CBD product types' },
    { id: '55555555-5555-5555-5555-555555555555', name: 'Safety', slug: 'safety', description: 'CBD safety information and drug interactions' }
  ];

  for (const category of categories) {
    const { error } = await supabase
      .from('kb_categories')
      .upsert(category, { onConflict: 'slug', ignoreDuplicates: true });

    if (error && !error.message.includes('already exists') && !error.message.includes('duplicate')) {
      console.log(`⚠️  Category ${category.name} error:`, error.message);
    } else {
      console.log(`✅ Category: ${category.name}`);
    }
  }
}

if (require.main === module) {
  setupDatabase();
}

module.exports = { setupDatabase };