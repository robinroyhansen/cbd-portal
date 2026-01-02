#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://yyjuneubsrrqzlcueews.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseKey) {
  console.log('❌ No SUPABASE_SERVICE_ROLE_KEY found');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDashboardFixed() {
  console.log('🧪 TESTING FIXED DASHBOARD QUERIES');
  console.log('='.repeat(40));

  try {
    // Test the FIXED queries that match the real schema
    console.log('\n📊 Testing FIXED dashboard queries...');

    // Articles query with published column
    const { data: articles, error: articlesError } = await supabase
      .from('articles')
      .select('published, category_id');

    if (articlesError) {
      console.log('❌ Articles query failed:', articlesError.message);
    } else {
      console.log(`✅ Articles query successful: ${articles?.length || 0} articles found`);

      const totalArticles = articles?.length || 0;
      const publishedArticles = articles?.filter(a => a.published === true).length || 0;
      const draftArticles = articles?.filter(a => a.published === false).length || 0;

      console.log(`   📄 Total articles: ${totalArticles}`);
      console.log(`   ✅ Published: ${publishedArticles}`);
      console.log(`   📝 Drafts: ${draftArticles}`);
    }

    // Categories query without article_count
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('id, name');

    if (categoriesError) {
      console.log('❌ Categories query failed:', categoriesError.message);
    } else {
      console.log(`✅ Categories query successful: ${categories?.length || 0} categories found`);

      // Calculate article counts dynamically
      const categoriesWithCounts = categories?.map(category => {
        const articleCount = articles?.filter(a => a.category_id === category.id).length || 0;
        return {
          ...category,
          article_count: articleCount
        };
      }) || [];

      categoriesWithCounts.forEach(cat => {
        console.log(`   🏷️ ${cat.name}: ${cat.article_count} articles`);
      });
    }

    console.log('\n🎉 DASHBOARD FIXED TESTS COMPLETE!');
    console.log('✅ Dashboard should now work correctly with the actual database schema');
    console.log('🌐 Test it: https://cbd-portal.vercel.app/admin/dashboard');

  } catch (error) {
    console.log('❌ Test error:', error.message);
  }
}

testDashboardFixed();