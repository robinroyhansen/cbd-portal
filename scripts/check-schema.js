#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://yyjuneubsrrqzlcueews.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseKey) {
  console.log('❌ No SUPABASE_SERVICE_ROLE_KEY found');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
  console.log('📋 CHECKING ACTUAL DATABASE SCHEMA');
  console.log('='.repeat(40));

  try {
    // Get a sample article to see the schema
    console.log('\n📄 ARTICLES TABLE SCHEMA:');
    const { data: sampleArticle } = await supabase
      .from('articles')
      .select('*')
      .limit(1);

    if (sampleArticle && sampleArticle[0]) {
      console.log('Columns found in articles table:');
      Object.keys(sampleArticle[0]).forEach(key => {
        console.log(`   - ${key}: ${typeof sampleArticle[0][key]}`);
      });
    }

    // Get a sample category to see the schema
    console.log('\n🏷️ CATEGORIES TABLE SCHEMA:');
    const { data: sampleCategory } = await supabase
      .from('categories')
      .select('*')
      .limit(1);

    if (sampleCategory && sampleCategory[0]) {
      console.log('Columns found in categories table:');
      Object.keys(sampleCategory[0]).forEach(key => {
        console.log(`   - ${key}: ${typeof sampleCategory[0][key]}`);
      });
    }

    // Check authors table too
    console.log('\n👤 AUTHORS TABLE SCHEMA:');
    const { data: sampleAuthor } = await supabase
      .from('authors')
      .select('*')
      .limit(1);

    if (sampleAuthor && sampleAuthor[0]) {
      console.log('Columns found in authors table:');
      Object.keys(sampleAuthor[0]).forEach(key => {
        console.log(`   - ${key}: ${typeof sampleAuthor[0][key]}`);
      });
    }

  } catch (error) {
    console.log('❌ Schema check error:', error.message);
  }
}

checkSchema();