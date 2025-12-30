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

// Critical articles that MUST have citations
const CRITICAL_ARTICLES = [
  'cbd-and-anxiety',
  'cbd-and-sleep',
  'cbd-and-pain',
  'cbd-and-depression',
  'cbd-and-inflammation',
  'cbd-and-arthritis',
  'cbd-and-stress',
  'cbd-and-epilepsy',
  'cbd-and-ptsd',
  'cbd-and-fibromyalgia'
];

async function auditCitations() {
  console.log('🔍 CITATION AUDIT REPORT');
  console.log('='.repeat(50));

  try {
    // Get all articles with citation counts
    const { data: articles, error } = await supabase
      .from('kb_articles')
      .select(`
        id,
        slug,
        title,
        kb_citations!inner(id)
      `);

    if (error) {
      console.error('❌ Error fetching articles:', error);
      return;
    }

    // Process citation counts
    const articlesWithCounts = [];

    // Get individual citation counts for each article
    for (const article of articles) {
      const { data: citations, error: citError } = await supabase
        .from('kb_citations')
        .select('id')
        .eq('article_id', article.id);

      if (!citError) {
        articlesWithCounts.push({
          ...article,
          citation_count: citations?.length || 0
        });
      }
    }

    // Sort by citation count (ascending to see problems first)
    articlesWithCounts.sort((a, b) => a.citation_count - b.citation_count);

    console.log('\n📊 CITATION COUNT SUMMARY:');
    console.log('-'.repeat(50));

    let articlesWith0Citations = [];
    let articlesWithFewCitations = [];
    let articlesWithGoodCitations = [];
    let totalCitations = 0;

    articlesWithCounts.forEach(article => {
      const count = article.citation_count;
      totalCitations += count;

      const isCritical = CRITICAL_ARTICLES.includes(article.slug);
      const criticalFlag = isCritical ? '⚠️  CRITICAL' : '';

      if (count === 0) {
        console.log(`❌ ${article.slug}: ${count} citations ${criticalFlag}`);
        articlesWith0Citations.push(article);
      } else if (count < 5) {
        console.log(`🟡 ${article.slug}: ${count} citations ${criticalFlag}`);
        articlesWithFewCitations.push(article);
      } else {
        console.log(`✅ ${article.slug}: ${count} citations`);
        articlesWithGoodCitations.push(article);
      }
    });

    console.log('\n📈 SUMMARY STATISTICS:');
    console.log('-'.repeat(50));
    console.log(`Total Articles: ${articlesWithCounts.length}`);
    console.log(`Articles with 0 citations: ${articlesWith0Citations.length}`);
    console.log(`Articles with <5 citations: ${articlesWithFewCitations.length}`);
    console.log(`Articles with ≥5 citations: ${articlesWithGoodCitations.length}`);
    console.log(`Total Citations: ${totalCitations}`);
    console.log(`Average citations per article: ${(totalCitations / articlesWithCounts.length).toFixed(1)}`);

    // Focus on critical articles
    console.log('\n🎯 CRITICAL ARTICLE STATUS:');
    console.log('-'.repeat(50));

    const criticalArticleStatus = CRITICAL_ARTICLES.map(slug => {
      const article = articlesWithCounts.find(a => a.slug === slug);
      return {
        slug,
        found: !!article,
        citations: article ? article.citation_count : 0,
        title: article ? article.title : 'NOT FOUND'
      };
    });

    criticalArticleStatus.forEach(status => {
      if (!status.found) {
        console.log(`❌ ${status.slug}: ARTICLE NOT FOUND`);
      } else if (status.citations === 0) {
        console.log(`❌ ${status.slug}: ${status.citations} citations - NEEDS RESTORATION`);
      } else if (status.citations < 5) {
        console.log(`🟡 ${status.slug}: ${status.citations} citations - NEEDS MORE`);
      } else {
        console.log(`✅ ${status.slug}: ${status.citations} citations - GOOD`);
      }
    });

    // Return data for further processing
    return {
      allArticles: articlesWithCounts,
      articlesWith0Citations,
      articlesWithFewCitations,
      articlesWithGoodCitations,
      criticalArticleStatus,
      totalCitations,
      stats: {
        total: articlesWithCounts.length,
        zeroCitations: articlesWith0Citations.length,
        fewCitations: articlesWithFewCitations.length,
        goodCitations: articlesWithGoodCitations.length
      }
    };

  } catch (error) {
    console.error('💥 Audit failed:', error);
  }
}

if (require.main === module) {
  auditCitations().then(() => {
    console.log('\n✅ Citation audit complete');
  });
}

module.exports = { auditCitations };