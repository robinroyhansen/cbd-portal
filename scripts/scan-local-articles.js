const fs = require('fs');
const path = require('path');

function scanLocalArticles() {
  console.log('🔍 Scanning content health from local article files...\n');

  const articlesDir = path.join(process.cwd(), 'articles');

  if (!fs.existsSync(articlesDir)) {
    console.log('No articles directory found.');
    return;
  }

  const files = fs.readdirSync(articlesDir).filter(f => f.endsWith('.md'));
  console.log(`Found ${files.length} article files to scan.\n`);

  const issues = [];

  files.forEach(file => {
    const filepath = path.join(articlesDir, file);
    const content = fs.readFileSync(filepath, 'utf8');
    const articleIssues = [];

    // Extract title from first # heading
    const titleMatch = content.match(/^# (.+)$/m);
    const title = titleMatch ? titleMatch[1] : file;

    // Check content length
    if (content.length < 5000) {
      articleIssues.push(`Short content (${content.length} characters)`);
    }

    // Check for truncated content
    const lines = content.split('\n');
    const lastLine = lines[lines.length - 1].trim();
    const secondLastLine = lines[lines.length - 2]?.trim() || '';

    if (lastLine === '' && secondLastLine.length > 50 && !secondLastLine.endsWith('.') && !secondLastLine.endsWith('*') && !secondLastLine.includes('©')) {
      articleIssues.push('Content may be truncated (incomplete last line)');
    }

    // Check for FAQs
    if (!content.includes('## Frequently Asked Questions')) {
      articleIssues.push('Missing FAQ section');
    } else {
      // Count FAQs
      const faqMatches = content.match(/### \d+\./g) || [];
      if (faqMatches.length < 5) {
        articleIssues.push(`Only ${faqMatches.length} FAQs (expected 5-10)`);
      }
    }

    // Check for references/citations
    const referenceSection = content.includes('## References');
    const citationNumbers = (content.match(/\[\d+\]/g) || []).length;

    if (!referenceSection) {
      articleIssues.push('Missing References section');
    }
    if (citationNumbers < 5) {
      articleIssues.push(`Only ${citationNumbers} citations found (expected 5-12)`);
    }

    // Check for broken markdown
    const openBrackets = (content.match(/\[/g) || []).length;
    const closeBrackets = (content.match(/\]/g) || []).length;
    if (Math.abs(openBrackets - closeBrackets) > 3) {
      articleIssues.push(`Potential broken markdown: ${openBrackets} [ vs ${closeBrackets} ]`);
    }

    // Check for author byline
    if (!content.includes('Written by Robin Roy Krigslund-Hansen')) {
      articleIssues.push('Missing author byline');
    }

    // Check for medical disclaimer
    if (!content.includes('medical advice')) {
      articleIssues.push('Missing medical disclaimer');
    }

    // Check for meta description in frontmatter
    if (!content.includes('meta_description:') && !content.includes('description:')) {
      articleIssues.push('No meta description found');
    }

    // Check for featured image placeholder
    if (content.includes('/path/to/') || content.includes('placeholder')) {
      articleIssues.push('Contains placeholder image paths');
    }

    if (articleIssues.length > 0) {
      issues.push({
        file: file,
        title: title,
        issues: articleIssues
      });
    }
  });

  // Report findings
  console.log('📊 Content Health Report\n');
  console.log('='.repeat(60) + '\n');

  if (issues.length === 0) {
    console.log('✅ All articles are healthy! No issues found.\n');
  } else {
    console.log(`⚠️  Found issues in ${issues.length} out of ${files.length} articles:\n`);

    issues.forEach(issue => {
      console.log(`📄 ${issue.title}`);
      console.log(`   File: ${issue.file}`);
      console.log(`   Issues:`);
      issue.issues.forEach(problem => {
        console.log(`   - ${problem}`);
      });
      console.log('');
    });
  }

  // Summary
  console.log('\n📈 Summary Statistics:');
  console.log('-'.repeat(40));
  console.log(`Total articles: ${files.length}`);
  console.log(`Articles with issues: ${issues.length}`);
  console.log(`Healthy articles: ${files.length - issues.length}`);
  console.log(`Health rate: ${((files.length - issues.length) / files.length * 100).toFixed(1)}%`);

  // Check for common issues across all articles
  console.log('\n🔍 Common Patterns:');
  console.log('-'.repeat(40));

  const allHaveRefs = files.every(f => {
    const content = fs.readFileSync(path.join(articlesDir, f), 'utf8');
    return content.includes('## References');
  });
  console.log(`All articles have References section: ${allHaveRefs ? '✅ Yes' : '❌ No'}`);

  const allHaveFAQs = files.every(f => {
    const content = fs.readFileSync(path.join(articlesDir, f), 'utf8');
    return content.includes('## Frequently Asked Questions');
  });
  console.log(`All articles have FAQ section: ${allHaveFAQs ? '✅ Yes' : '❌ No'}`);

  const allHaveAuthor = files.every(f => {
    const content = fs.readFileSync(path.join(articlesDir, f), 'utf8');
    return content.includes('Robin Roy Krigslund-Hansen');
  });
  console.log(`All articles have author byline: ${allHaveAuthor ? '✅ Yes' : '❌ No'}`);
}

scanLocalArticles();