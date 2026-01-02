#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://yyjuneubsrrqzlcueews.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseKey) {
  console.log('❌ No SUPABASE_SERVICE_ROLE_KEY found');
  console.log('Available env vars:', Object.keys(process.env).filter(k => k.includes('SUPABASE')));
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabase() {
  console.log('🔍 CHECKING DATABASE STATE FOR DASHBOARD ISSUE');
  console.log('='.repeat(50));

  try {
    // Check articles table
    console.log('\n📚 ARTICLES TABLE:');
    const { data: articles, count: articleCount, error: articleError } = await supabase
      .from('articles')
      .select('id, title, author_name, slug', { count: 'exact' });

    if (articleError) {
      console.log('❌ Articles error:', articleError.message);
    } else {
      console.log(`   Total count: ${articleCount}`);
      if (articles && articles.length > 0) {
        console.log('   Sample articles:');
        articles.slice(0, 5).forEach((a, i) => {
          console.log(`   ${i + 1}. ${a.title.substring(0, 50)}... (by: ${a.author_name})`);
        });
        if (articles.length > 5) {
          console.log(`   ... and ${articles.length - 5} more`);
        }
      } else {
        console.log('   ⚠️ No articles found!');
      }
    }

    // Check authors table
    console.log('\n👥 AUTHORS TABLE:');
    const { data: authors, count: authorCount, error: authorError } = await supabase
      .from('authors')
      .select('id, name, slug, email', { count: 'exact' });

    if (authorError) {
      console.log('❌ Authors error:', authorError.message);
    } else {
      console.log(`   Total count: ${authorCount}`);
      if (authors && authors.length > 0) {
        authors.forEach(a => {
          console.log(`   - ${a.name} (${a.slug}) - ${a.email}`);
        });
      } else {
        console.log('   ⚠️ No authors found!');
      }
    }

    // Check categories table
    console.log('\n🗂️ CATEGORIES TABLE:');
    const { data: categories, count: categoryCount } = await supabase
      .from('categories')
      .select('id, name, slug', { count: 'exact' });

    console.log(`   Total count: ${categoryCount}`);
    if (categories && categories.length > 0) {
      categories.forEach(c => {
        console.log(`   - ${c.name} (${c.slug})`);
      });
    }

    // Test a simple query that dashboard might use
    console.log('\n🔍 TESTING DASHBOARD QUERIES:');

    // Test articles query without count
    const { data: simpleArticles, error: simpleError } = await supabase
      .from('articles')
      .select('*')
      .limit(5);

    if (simpleError) {
      console.log('❌ Simple articles query error:', simpleError.message);
    } else {
      console.log(`✅ Simple articles query successful: ${simpleArticles?.length || 0} results`);
    }

    // Test with joins to see if that's the issue
    console.log('\n🔗 Testing queries with potential joins...');

    // Check if there's an author_id column that might be causing issues
    const { data: articlesWithAuthorId, error: authorIdError } = await supabase
      .from('articles')
      .select('id, title, author_id, author_name')
      .limit(1);

    if (authorIdError) {
      console.log('❌ author_id column error:', authorIdError.message);
    } else {
      console.log('✅ author_id column query successful');
      if (articlesWithAuthorId && articlesWithAuthorId[0]) {
        console.log('   Sample author_id value:', articlesWithAuthorId[0].author_id);
      }
    }

  } catch (error) {
    console.log('❌ Unexpected error:', error.message);
  }
}

checkDatabase().then(() => {
  console.log('\n✅ Database state check complete!');
}).catch(console.error);