#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

// Supabase connection
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseKey || !supabaseUrl) {
  console.error('❌ SUPABASE environment variables are required');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAndAssignArticles() {
  console.log('📄 CHECKING AND ASSIGNING ARTICLES TO ROBIN');
  console.log('='.repeat(50));
  console.log('');

  try {
    // Get Robin's ID
    const { data: robin } = await supabase
      .from('authors')
      .select('id, name')
      .eq('slug', 'robin-roy-krigslund-hansen')
      .single();

    if (!robin) {
      console.log('❌ Robin not found!');
      return;
    }

    console.log(`👤 Robin ID: ${robin.id}`);

    // Check all articles and their author assignments
    const { data: articles, count } = await supabase
      .from('articles')
      .select('id, title, slug, author_id', { count: 'exact' });

    console.log(`📚 Total articles: ${count}`);

    if (articles && articles.length > 0) {
      const articlesWithoutAuthor = articles.filter(article => !article.author_id);
      const articlesWithAuthor = articles.filter(article => article.author_id);

      console.log(`📋 Articles without author: ${articlesWithoutAuthor.length}`);
      console.log(`📝 Articles with author: ${articlesWithAuthor.length}`);

      if (articlesWithoutAuthor.length > 0) {
        console.log('\n🔧 Assigning Robin as author to articles without authors...');

        const { data: updatedArticles, error } = await supabase
          .from('articles')
          .update({ author_id: robin.id })
          .is('author_id', null)
          .select('id, title');

        if (error) {
          console.log('❌ Error updating articles:', error.message);
        } else {
          console.log(`✅ Updated ${updatedArticles?.length || 0} articles`);
          updatedArticles?.slice(0, 5).forEach(article => {
            console.log(`   - ${article.title.substring(0, 50)}...`);
          });
          if (updatedArticles && updatedArticles.length > 5) {
            console.log(`   ... and ${updatedArticles.length - 5} more`);
          }
        }
      }

      // Check CBD-specific articles
      const cbdArticles = articles.filter(article =>
        article.title.toLowerCase().includes('cbd') ||
        article.slug.toLowerCase().includes('cbd')
      );

      console.log(`\n🌿 CBD-related articles: ${cbdArticles.length}`);
      cbdArticles.slice(0, 10).forEach(article => {
        console.log(`   - ${article.slug} (Author ID: ${article.author_id || 'None'})`);
      });

      // Update ALL articles to Robin (since he should be the author of everything)
      console.log('\n🎯 Assigning ALL articles to Robin...');
      const { data: allUpdatedArticles, error: allUpdateError } = await supabase
        .from('articles')
        .update({ author_id: robin.id })
        .neq('author_id', robin.id)  // Only update if not already Robin
        .select('id, title, slug');

      if (allUpdateError) {
        console.log('❌ Error updating all articles:', allUpdateError.message);
      } else {
        console.log(`✅ Ensured ${allUpdatedArticles?.length || 0} articles are authored by Robin`);
        if (allUpdatedArticles && allUpdatedArticles.length > 0) {
          console.log('   Updated articles:');
          allUpdatedArticles.slice(0, 5).forEach(article => {
            console.log(`   - ${article.title.substring(0, 50)}...`);
          });
          if (allUpdatedArticles.length > 5) {
            console.log(`   ... and ${allUpdatedArticles.length - 5} more`);
          }
        }
      }
    }

    // Final verification
    console.log('\n📊 Final verification:');
    const { data: finalArticles, count: finalCount } = await supabase
      .from('articles')
      .select('id', { count: 'exact' })
      .eq('author_id', robin.id);

    console.log(`✅ Articles now authored by Robin: ${finalCount || 0}`);

    // Show breakdown by type
    const { data: articlesByType } = await supabase
      .from('articles')
      .select('title, slug, author_id')
      .eq('author_id', robin.id);

    if (articlesByType) {
      const cbdArticlesCount = articlesByType.filter(a =>
        a.title.toLowerCase().includes('cbd') || a.slug.toLowerCase().includes('cbd')
      ).length;
      const otherArticlesCount = articlesByType.length - cbdArticlesCount;

      console.log(`   🌿 CBD articles: ${cbdArticlesCount}`);
      console.log(`   🔧 Other articles: ${otherArticlesCount}`);
    }

    console.log('\n🎉 ARTICLE ASSIGNMENT COMPLETE!');

  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

if (require.main === module) {
  checkAndAssignArticles();
}

module.exports = { checkAndAssignArticles };