#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://yyjuneubsrrqzlcueews.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseKey) {
  console.log('❌ No SUPABASE_SERVICE_ROLE_KEY found');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDashboardQueries() {
  console.log('🧪 TESTING DASHBOARD QUERIES AFTER TABLE NAME FIX');
  console.log('='.repeat(50));

  try {
    // Test the exact queries used by the dashboard
    console.log('\n📊 Testing dashboard statistics queries...');

    // Articles query (matches dashboard page.tsx)
    const { data: articles, error: articlesError } = await supabase
      .from('articles')
      .select('status, category_id');

    if (articlesError) {
      console.log('❌ Articles query failed:', articlesError.message);
    } else {
      console.log(`✅ Articles query successful: ${articles?.length || 0} articles found`);

      const totalArticles = articles?.length || 0;
      const publishedArticles = articles?.filter(a => a.status === 'published').length || 0;
      const draftArticles = articles?.filter(a => a.status === 'draft').length || 0;

      console.log(`   📄 Total articles: ${totalArticles}`);
      console.log(`   ✅ Published: ${publishedArticles}`);
      console.log(`   📝 Drafts: ${draftArticles}`);
    }

    // Categories query (matches dashboard page.tsx)
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('id, name, article_count');

    if (categoriesError) {
      console.log('❌ Categories query failed:', categoriesError.message);
    } else {
      console.log(`✅ Categories query successful: ${categories?.length || 0} categories found`);
      categories?.forEach(cat => {
        console.log(`   🏷️ ${cat.name}: ${cat.article_count || 0} articles`);
      });
    }

    // Media query (matches dashboard page.tsx)
    const { data: media, error: mediaError } = await supabase
      .from('media')
      .select('id');

    if (mediaError) {
      console.log(`⚠️ Media query failed: ${mediaError.message} (table might not exist yet)`);
    } else {
      console.log(`✅ Media query successful: ${media?.length || 0} media files found`);
    }

    // Citations query (matches dashboard page.tsx)
    const { data: citations, error: citationsError } = await supabase
      .from('citations')
      .select('id');

    if (citationsError) {
      console.log(`⚠️ Citations query failed: ${citationsError.message} (table might not exist yet)`);
    } else {
      console.log(`✅ Citations query successful: ${citations?.length || 0} citations found`);
    }

    console.log('\n📝 Testing articles admin page queries...');

    // Articles with categories join (matches articles admin page)
    const { data: articlesWithCategories, error: joinError } = await supabase
      .from('articles')
      .select(`
        *,
        category:categories(name)
      `)
      .order('created_at', { ascending: false });

    if (joinError) {
      console.log('❌ Articles with categories join failed:', joinError.message);
    } else {
      console.log(`✅ Articles with categories join successful: ${articlesWithCategories?.length || 0} articles`);
      articlesWithCategories?.slice(0, 3).forEach(article => {
        const categoryName = article.category?.name || 'Uncategorized';
        console.log(`   📄 ${article.title.substring(0, 40)}... (${categoryName})`);
      });
    }

    console.log('\n🎉 DASHBOARD QUERY TESTS COMPLETE!');
    console.log('✅ Dashboard should now display data correctly');
    console.log('🌐 Check: https://cbd-portal.vercel.app/admin/dashboard');

  } catch (error) {
    console.log('❌ Test error:', error.message);
  }
}

testDashboardQueries();