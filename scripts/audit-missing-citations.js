#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

// Supabase connection
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jgivzyszbpyuvqfmldin.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY environment variable is required');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function auditMissingCitations() {
  console.log('🔍 COMPREHENSIVE CITATION AUDIT');
  console.log('='.repeat(50));

  try {
    // Get all articles with citation counts
    const { data: articles, error } = await supabase
      .from('kb_articles')
      .select('id, slug, title, status')
      .eq('status', 'published')
      .order('slug');

    if (error) {
      console.error('❌ Error fetching articles:', error);
      return;
    }

    console.log(`📊 Auditing ${articles.length} published articles...\n`);

    let citationCounts = [];
    let articlesWith0Citations = [];
    let articlesWithFewCitations = [];

    // Get citation count for each article
    for (const article of articles) {
      const { data: citations, error: citError } = await supabase
        .from('kb_citations')
        .select('id, title, authors')
        .eq('article_id', article.id);

      if (citError) {
        console.error(`❌ Error fetching citations for ${article.slug}:`, citError);
        continue;
      }

      const citationCount = citations?.length || 0;
      citationCounts.push({
        ...article,
        citationCount,
        citations: citations || []
      });

      if (citationCount === 0) {
        articlesWith0Citations.push(article.slug);
      } else if (citationCount < 5) {
        articlesWithFewCitations.push({ slug: article.slug, count: citationCount });
      }
    }

    // Sort by citation count (ascending to see problems first)
    citationCounts.sort((a, b) => a.citationCount - b.citationCount);

    console.log('📊 CITATION COUNT BY ARTICLE:');
    console.log('-'.repeat(50));

    citationCounts.forEach(article => {
      const status = article.citationCount === 0 ? '❌ CRITICAL' :
                     article.citationCount < 5 ? '⚠️  NEEDS MORE' : '✅ GOOD';

      console.log(`${status} ${article.slug}: ${article.citationCount} citations`);

      // Show bad citation data
      if (article.citations.length > 0) {
        const badCitations = article.citations.filter(c =>
          !c.authors ||
          c.authors.toLowerCase().includes('multiple') ||
          c.authors.toLowerCase().includes('various') ||
          c.authors.trim().length < 3
        );

        if (badCitations.length > 0) {
          console.log(`   📝 Bad author data: ${badCitations.length} citations need fixing`);
          badCitations.forEach(bad => {
            console.log(`     - "${bad.title.substring(0, 50)}..." (authors: "${bad.authors || 'NULL'}")`);
          });
        }
      }
    });

    console.log('\n📈 SUMMARY STATISTICS:');
    console.log('-'.repeat(50));
    console.log(`Total Articles: ${articles.length}`);
    console.log(`Articles with 0 citations: ${articlesWith0Citations.length}`);
    console.log(`Articles with <5 citations: ${articlesWithFewCitations.length}`);
    console.log(`Articles with ≥5 citations: ${citationCounts.filter(a => a.citationCount >= 5).length}`);

    const totalCitations = citationCounts.reduce((sum, a) => sum + a.citationCount, 0);
    console.log(`Total Citations: ${totalCitations}`);
    console.log(`Average per article: ${(totalCitations / articles.length).toFixed(1)}`);

    if (articlesWith0Citations.length > 0) {
      console.log('\n❌ ARTICLES WITH ZERO CITATIONS:');
      console.log('-'.repeat(30));
      articlesWith0Citations.forEach(slug => {
        console.log(`- ${slug}`);
      });
    }

    if (articlesWithFewCitations.length > 0) {
      console.log('\n⚠️  ARTICLES NEEDING MORE CITATIONS:');
      console.log('-'.repeat(30));
      articlesWithFewCitations.forEach(article => {
        console.log(`- ${article.slug}: ${article.count}/5 needed`);
      });
    }

    // Check for "Multiple Authors" citations across all articles
    console.log('\n🔍 CHECKING FOR BAD CITATION AUTHORS:');
    console.log('-'.repeat(50));

    const { data: badCitations, error: badError } = await supabase
      .from('kb_citations')
      .select(`
        id, title, authors,
        article:kb_articles(slug)
      `)
      .or('authors.ilike.%multiple%,authors.ilike.%various%,authors.is.null');

    if (badError) {
      console.error('❌ Error checking bad citations:', badError);
    } else if (badCitations && badCitations.length > 0) {
      console.log(`Found ${badCitations.length} citations with bad author data:`);
      badCitations.forEach(citation => {
        console.log(`❌ ${citation.article.slug}: "${citation.title.substring(0, 60)}..." (authors: "${citation.authors || 'NULL'}")`);
      });
    } else {
      console.log('✅ No citations found with "Multiple Authors" or bad data');
    }

    return {
      totalArticles: articles.length,
      articlesWith0Citations,
      articlesWithFewCitations,
      totalCitations,
      averageCitations: (totalCitations / articles.length).toFixed(1),
      badCitations: badCitations || []
    };

  } catch (error) {
    console.error('💥 Audit failed:', error);
  }
}

if (require.main === module) {
  auditMissingCitations().then(() => {
    console.log('\n✅ Citation audit complete');
  });
}

module.exports = { auditMissingCitations };