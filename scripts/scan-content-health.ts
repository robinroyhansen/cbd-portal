import { createClient } from '@/lib/supabase/server';

interface ContentIssue {
  articleId: string;
  title: string;
  slug: string;
  issues: string[];
}

interface Article {
  id: string;
  title: string;
  slug: string;
  content?: string;
  excerpt?: string;
  featured_image?: string;
  meta_title?: string;
  meta_description?: string;
}

async function scanContentHealth() {
  console.log('🔍 Scanning content health...\n');

  const supabase = await createClient();
  const issues: ContentIssue[] = [];

  // Fetch all articles
  const { data: articles, error } = await supabase
    .from('kb_articles')
    .select('*')
    .returns<Article[]>();

  if (error) {
    console.error('Error fetching articles:', error);
    return;
  }

  if (!articles || articles.length === 0) {
    console.log('No articles found in database.');
    return;
  }

  console.log(`Found ${articles.length} articles to scan.\n`);

  // Check each article
  for (const article of articles) {
    const articleIssues: string[] = [];

    // Check for empty content
    if (!article.content || article.content.trim() === '') {
      articleIssues.push('Empty content');
    }

    // Check for truncated text (common patterns)
    if (article.content) {
      if (article.content.endsWith('...') && article.content.length < 500) {
        articleIssues.push('Possibly truncated content (ends with ...)');
      }
      if (article.content.includes('Lorem ipsum')) {
        articleIssues.push('Contains placeholder text (Lorem ipsum)');
      }

      // Check for incomplete sentences at the end
      const lastSentence = article.content.trim().split('.').pop();
      if (lastSentence && lastSentence.length > 10 && !lastSentence.endsWith(')') && !lastSentence.endsWith('"')) {
        articleIssues.push('Content may be truncated (incomplete last sentence)');
      }
    }

    // Check for broken markdown
    if (article.content) {
      // Unclosed markdown patterns
      const openBrackets = (article.content.match(/\[/g) || []).length;
      const closeBrackets = (article.content.match(/\]/g) || []).length;
      if (openBrackets !== closeBrackets) {
        articleIssues.push(`Broken markdown: unmatched brackets (${openBrackets} [ vs ${closeBrackets} ])`);
      }

      // Check for broken links
      const brokenLinkPattern = /\[([^\]]+)\]\s*\(\s*\)/g;
      if (brokenLinkPattern.test(article.content)) {
        articleIssues.push('Contains empty markdown links []()');
      }

      // Check for unclosed code blocks
      const codeBlockCount = (article.content.match(/```/g) || []).length;
      if (codeBlockCount % 2 !== 0) {
        articleIssues.push('Unclosed code block (odd number of ```)');
      }
    }

    // Check for duplicate images
    if (article.featured_image) {
      const duplicates = articles.filter(a =>
        a.id !== article.id && a.featured_image === article.featured_image
      );
      if (duplicates.length > 0) {
        articleIssues.push(`Duplicate featured image used in ${duplicates.length} other articles`);
      }
    }

    // Check for missing excerpt
    if (!article.excerpt) {
      articleIssues.push('Missing excerpt');
    }

    // Check for missing meta data
    if (!article.meta_title) {
      articleIssues.push('Missing meta title');
    }
    if (!article.meta_description) {
      articleIssues.push('Missing meta description');
    }

    // Check content length
    if (article.content && article.content.length < 1000) {
      articleIssues.push(`Very short content (${article.content.length} characters)`);
    }

    // Add to issues list if any problems found
    if (articleIssues.length > 0) {
      issues.push({
        articleId: article.id,
        title: article.title,
        slug: article.slug,
        issues: articleIssues
      });
    }
  }

  // Check for missing citations
  const { data: citations } = await supabase
    .from('kb_citations')
    .select('article_id')
    .order('article_id')
    .returns<{article_id: string}[]>();

  const articlesWithCitations = new Set(citations?.map(c => c.article_id) || []);

  for (const article of articles) {
    if (!articlesWithCitations.has(article.id)) {
      const existingIssue = issues.find(i => i.articleId === article.id);
      if (existingIssue) {
        existingIssue.issues.push('No citations found');
      } else {
        issues.push({
          articleId: article.id,
          title: article.title,
          slug: article.slug,
          issues: ['No citations found']
        });
      }
    }
  }

  // Report findings
  console.log('📊 Content Health Report\n');
  console.log('=' .repeat(60) + '\n');

  if (issues.length === 0) {
    console.log('✅ All articles are healthy! No issues found.\n');
  } else {
    console.log(`⚠️  Found issues in ${issues.length} out of ${articles.length} articles:\n`);

    for (const issue of issues) {
      console.log(`📄 ${issue.title}`);
      console.log(`   Slug: ${issue.slug}`);
      console.log(`   Issues:`);
      for (const problem of issue.issues) {
        console.log(`   - ${problem}`);
      }
      console.log('');
    }
  }

  // Summary statistics
  console.log('\n📈 Summary Statistics:');
  console.log('-'.repeat(40));
  console.log(`Total articles: ${articles.length}`);
  console.log(`Articles with issues: ${issues.length}`);
  console.log(`Healthy articles: ${articles.length - issues.length}`);
  console.log(`Health rate: ${((articles.length - issues.length) / articles.length * 100).toFixed(1)}%`);
}

// Run the scan
scanContentHealth().catch(console.error);