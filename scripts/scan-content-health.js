// Simple content health check using fetch
const SUPABASE_URL = 'https://kcqnfqxoatcecwpapmps.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function scanContentHealth() {
  console.log('🔍 Scanning content health...\n');

  if (!SUPABASE_ANON_KEY) {
    console.error('Error: NEXT_PUBLIC_SUPABASE_ANON_KEY not set');
    return;
  }

  try {
    // Fetch all articles
    const articlesResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/kb_articles?select=*`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
      }
    );

    if (!articlesResponse.ok) {
      throw new Error(`HTTP error! status: ${articlesResponse.status}`);
    }

    const articles = await articlesResponse.json();

    if (!articles || articles.length === 0) {
      console.log('No articles found in database.');
      return;
    }

    console.log(`Found ${articles.length} articles to scan.\n`);

    const issues = [];

    // Check each article
    for (const article of articles) {
      const articleIssues = [];

      // Check for empty content
      if (!article.content || article.content.trim() === '') {
        articleIssues.push('Empty content');
      }

      // Check for truncated text
      if (article.content) {
        if (article.content.endsWith('...') && article.content.length < 500) {
          articleIssues.push('Possibly truncated content (ends with ...)');
        }
        if (article.content.includes('Lorem ipsum')) {
          articleIssues.push('Contains placeholder text (Lorem ipsum)');
        }

        // Check for incomplete sentences
        const sentences = article.content.trim().split(/[.!?]/);
        const lastSentence = sentences[sentences.length - 1].trim();
        if (lastSentence.length > 20 && !lastSentence.endsWith(')') && !lastSentence.endsWith('"') && !lastSentence.endsWith('*')) {
          articleIssues.push('Content may be truncated (incomplete last sentence)');
        }
      }

      // Check for broken markdown
      if (article.content) {
        // Unclosed brackets
        const openBrackets = (article.content.match(/\[/g) || []).length;
        const closeBrackets = (article.content.match(/\]/g) || []).length;
        if (Math.abs(openBrackets - closeBrackets) > 2) {
          articleIssues.push(`Broken markdown: unmatched brackets (${openBrackets} [ vs ${closeBrackets} ])`);
        }

        // Empty links
        if (/\[([^\]]+)\]\s*\(\s*\)/.test(article.content)) {
          articleIssues.push('Contains empty markdown links []()');
        }

        // Unclosed code blocks
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

      // Check for missing fields
      if (!article.excerpt) {
        articleIssues.push('Missing excerpt');
      }
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

      if (articleIssues.length > 0) {
        issues.push({
          articleId: article.id,
          title: article.title,
          slug: article.slug,
          issues: articleIssues
        });
      }
    }

    // Check for citations
    const citationsResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/kb_citations?select=article_id`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
      }
    );

    const citations = await citationsResponse.json();
    const articlesWithCitations = new Set(citations.map(c => c.article_id));

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
    console.log('='.repeat(60) + '\n');

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

    // Summary
    console.log('\n📈 Summary Statistics:');
    console.log('-'.repeat(40));
    console.log(`Total articles: ${articles.length}`);
    console.log(`Articles with issues: ${issues.length}`);
    console.log(`Healthy articles: ${articles.length - issues.length}`);
    console.log(`Health rate: ${((articles.length - issues.length) / articles.length * 100).toFixed(1)}%`);

  } catch (error) {
    console.error('Error scanning content:', error);
  }
}

scanContentHealth();