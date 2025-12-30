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

async function diagnoseDuplicateAuthor() {
  console.log('🔍 DIAGNOSING DUPLICATE AUTHOR ISSUE');
  console.log('='.repeat(50));

  try {
    // Check if author info is embedded in article content
    const { data: articles, error } = await supabase
      .from('kb_articles')
      .select('id, slug, title, content')
      .eq('status', 'published');

    if (error) {
      console.error('❌ Error fetching articles:', error);
      return;
    }

    console.log(`📊 Checking ${articles.length} articles for embedded author content...\n`);

    let articlesWithEmbeddedAuthor = [];
    let articlesWithAboutSection = [];
    let articlesWithWrittenBy = [];

    articles.forEach(article => {
      const content = article.content || '';

      const hasRobinInContent = content.includes('Robin Roy Krigslund-Hansen');
      const hasAboutSection = content.includes('About the Author') || content.includes('## About the Author');
      const hasWrittenBy = content.includes('Written by Robin') || content.includes('*Written by Robin');

      if (hasRobinInContent) {
        articlesWithEmbeddedAuthor.push(article);
      }
      if (hasAboutSection) {
        articlesWithAboutSection.push(article);
      }
      if (hasWrittenBy) {
        articlesWithWrittenBy.push(article);
      }

      if (hasRobinInContent || hasAboutSection || hasWrittenBy) {
        console.log(`⚠️  ${article.slug}:`);
        if (hasRobinInContent) console.log(`   - Has Robin's name in content`);
        if (hasAboutSection) console.log(`   - Has "About the Author" section`);
        if (hasWrittenBy) console.log(`   - Has "Written by Robin" text`);
        console.log('');
      }
    });

    console.log('\n📈 SUMMARY:');
    console.log('-'.repeat(30));
    console.log(`Articles with Robin's name in content: ${articlesWithEmbeddedAuthor.length}`);
    console.log(`Articles with "About the Author" sections: ${articlesWithAboutSection.length}`);
    console.log(`Articles with "Written by Robin" text: ${articlesWithWrittenBy.length}`);

    // Check for specific patterns that need to be removed
    console.log('\n🔍 DETAILED CONTENT ANALYSIS:');
    console.log('-'.repeat(50));

    for (const article of articlesWithEmbeddedAuthor) {
      const content = article.content;
      console.log(`\n📄 ${article.slug}:`);

      // Look for specific problematic patterns
      const patterns = [
        /\*\*About the Author\*\*/gi,
        /## About the Author/gi,
        /\*Written by Robin Roy Krigslund-Hansen\*/gi,
        /---\s*\n\*Written by/gi,
        /Robin Roy Krigslund-Hansen.*CEO.*Formula Swiss/gi
      ];

      patterns.forEach((pattern, index) => {
        const matches = content.match(pattern);
        if (matches) {
          console.log(`   Pattern ${index + 1}: Found ${matches.length} match(es)`);
          matches.forEach(match => {
            console.log(`     "${match.substring(0, 60)}..."`);
          });
        }
      });

      // Show context around Robin's name
      const robinIndex = content.indexOf('Robin Roy Krigslund-Hansen');
      if (robinIndex !== -1) {
        const start = Math.max(0, robinIndex - 100);
        const end = Math.min(content.length, robinIndex + 200);
        const context = content.substring(start, end);
        console.log(`\n   Context: "${context.replace(/\n/g, ' ')}"`);
      }
    }

    return {
      articlesWithEmbeddedAuthor,
      articlesWithAboutSection,
      articlesWithWrittenBy,
      totalIssues: articlesWithEmbeddedAuthor.length
    };

  } catch (error) {
    console.error('💥 Diagnosis failed:', error);
  }
}

if (require.main === module) {
  diagnoseDuplicateAuthor().then(() => {
    console.log('\n✅ Duplicate author diagnosis complete');
  });
}

module.exports = { diagnoseDuplicateAuthor };