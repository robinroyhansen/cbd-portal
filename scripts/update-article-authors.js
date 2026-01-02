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

async function updateArticleAuthors() {
  console.log('📝 UPDATING ARTICLE AUTHORS');
  console.log('='.repeat(40));
  console.log('');

  try {
    // Check current articles and their authors
    console.log('📋 Step 1: Checking current article authors...');

    const { data: articles, count } = await supabase
      .from('articles')
      .select('id, title, slug, author_name, author_bio', { count: 'exact' });

    console.log(`📚 Total articles: ${count}`);

    if (articles && articles.length > 0) {
      // Group by author name
      const authorCounts = {};
      articles.forEach(article => {
        const authorName = article.author_name || 'No author';
        authorCounts[authorName] = (authorCounts[authorName] || 0) + 1;
      });

      console.log('\n👥 Current author distribution:');
      Object.entries(authorCounts).forEach(([name, count]) => {
        console.log(`   ${name}: ${count} articles`);
      });

      // Find CBD articles specifically
      const cbdArticles = articles.filter(article =>
        article.title.toLowerCase().includes('cbd') ||
        article.slug.toLowerCase().includes('cbd')
      );

      console.log(`\n🌿 CBD-related articles: ${cbdArticles.length}`);
      cbdArticles.forEach(article => {
        console.log(`   - ${article.title} (by: ${article.author_name || 'No author'})`);
      });

      // Define Robin's information
      const robinInfo = {
        author_name: 'Robin Roy Krigslund-Hansen',
        author_bio: 'Cannabis Research Specialist & CBD Expert with extensive experience in cannabinoid science, therapeutic applications, and evidence-based cannabis education. Specializes in translating complex research into accessible, practical guidance for consumers and healthcare providers.'
      };

      // Update all articles to Robin
      console.log('\n🔄 Step 2: Updating all articles to Robin Roy Krigslund-Hansen...');

      const { data: updatedArticles, error } = await supabase
        .from('articles')
        .update(robinInfo)
        .neq('author_name', robinInfo.author_name) // Only update if not already Robin
        .select('id, title, author_name');

      if (error) {
        console.log('❌ Error updating articles:', error.message);
        return;
      }

      console.log(`✅ Updated ${updatedArticles?.length || 0} articles`);

      if (updatedArticles && updatedArticles.length > 0) {
        console.log('\n📄 Updated articles:');
        updatedArticles.slice(0, 10).forEach((article, i) => {
          console.log(`   ${i+1}. ${article.title.substring(0, 50)}...`);
        });
        if (updatedArticles.length > 10) {
          console.log(`   ... and ${updatedArticles.length - 10} more articles`);
        }
      }

      // Specifically update CBD articles to ensure they have Robin as author
      if (cbdArticles.length > 0) {
        console.log('\n🌿 Step 3: Ensuring CBD articles are authored by Robin...');

        const cbdSlugs = cbdArticles.map(a => a.slug);
        const { data: updatedCbdArticles, error: cbdError } = await supabase
          .from('articles')
          .update(robinInfo)
          .in('slug', cbdSlugs)
          .select('id, title, slug');

        if (cbdError) {
          console.log('❌ Error updating CBD articles:', cbdError.message);
        } else {
          console.log(`✅ Ensured ${updatedCbdArticles?.length || 0} CBD articles are authored by Robin`);
        }
      }

      // Final verification
      console.log('\n📊 Step 4: Final verification...');

      const { data: finalArticles } = await supabase
        .from('articles')
        .select('author_name, title')
        .eq('author_name', robinInfo.author_name);

      console.log(`✅ Articles now authored by Robin: ${finalArticles?.length || 0}`);

      // Check if any articles still have other authors
      const { data: otherAuthors } = await supabase
        .from('articles')
        .select('author_name, title')
        .neq('author_name', robinInfo.author_name);

      if (otherAuthors && otherAuthors.length > 0) {
        console.log(`⚠️  Articles with other authors: ${otherAuthors.length}`);
        otherAuthors.slice(0, 5).forEach(article => {
          console.log(`   - ${article.title.substring(0, 40)}... (by: ${article.author_name})`);
        });
      } else {
        console.log('✅ All articles are now authored by Robin Roy Krigslund-Hansen');
      }

      console.log('\n🎉 ARTICLE AUTHOR UPDATE COMPLETE!');
      console.log(`✅ Robin Roy Krigslund-Hansen is now the author of all ${finalArticles?.length || 0} articles`);

    } else {
      console.log('❌ No articles found in database');
    }

  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

if (require.main === module) {
  updateArticleAuthors();
}

module.exports = { updateArticleAuthors };