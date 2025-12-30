const { createClient } = require('@supabase/supabase-js');

// Keyword mapping as specified
const keywordMapping = {
  'cbd-and-anxiety': { primary: 'CBD anxiety', secondary: ['cannabidiol anxiety', 'CBD stress'] },
  'cbd-and-sleep': { primary: 'CBD sleep', secondary: ['cannabidiol sleep', 'CBD rest'] },
  'cbd-and-pain': { primary: 'CBD pain relief', secondary: ['cannabidiol pain', 'CBD pain management'] },
  'cbd-and-depression': { primary: 'CBD depression', secondary: ['cannabidiol depression', 'CBD mood'] },
  'cbd-and-inflammation': { primary: 'CBD inflammation', secondary: ['cannabidiol anti-inflammatory'] },
  'cbd-and-arthritis': { primary: 'CBD arthritis', secondary: ['cannabidiol joint pain'] },
  'cbd-and-stress': { primary: 'CBD stress relief', secondary: ['cannabidiol stress'] },
  'cbd-and-epilepsy': { primary: 'CBD epilepsy', secondary: ['cannabidiol epilepsy', 'Epidiolex'] },
  'cbd-and-ptsd': { primary: 'CBD PTSD', secondary: ['cannabidiol trauma', 'CBD PTSD treatment'] },
  'cbd-and-fibromyalgia': { primary: 'CBD fibromyalgia', secondary: ['cannabidiol fibromyalgia pain'] }
};

// Power words to use
const powerWords = [
  'Evidence-Based', 'Clinical Research', 'Studies Show', 'Complete Guide',
  'Expert Review', '2025 Research', 'Science-Backed', 'Peer-Reviewed'
];

async function auditMetaData() {
  // Create Supabase client
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  console.log('🔍 STEP 1: Querying current meta data...\n');

  // Query all articles with their meta data
  const { data: articles, error } = await supabase
    .from('kb_articles')
    .select('id, slug, title, meta_title, meta_description')
    .eq('language_code', 'en') // Focus on English articles first
    .order('slug');

  if (error) {
    console.error('❌ Error querying articles:', error);
    return;
  }

  console.log(`📊 Found ${articles.length} articles to audit\n`);

  // Audit each article
  const auditResults = [];

  console.log('🔍 STEP 2: Auditing current meta data...\n');

  articles.forEach((article, index) => {
    console.log(`\n[${index + 1}/${articles.length}] Auditing: ${article.slug}`);
    console.log('─'.repeat(60));

    const audit = auditArticleMeta(article);
    auditResults.push(audit);

    // Display current meta
    console.log(`Title: "${article.meta_title || 'NOT SET'}" (${(article.meta_title || '').length} chars)`);
    console.log(`Description: "${article.meta_description || 'NOT SET'}" (${(article.meta_description || '').length} chars)`);

    // Display issues
    if (audit.issues.length > 0) {
      console.log(`\n❌ Issues found:`);
      audit.issues.forEach(issue => console.log(`   • ${issue}`));
    } else {
      console.log(`\n✅ No major issues found`);
    }
  });

  console.log('\n' + '='.repeat(80));
  console.log('📈 AUDIT SUMMARY');
  console.log('='.repeat(80));

  const totalIssues = auditResults.reduce((sum, result) => sum + result.issues.length, 0);
  const articlesWithIssues = auditResults.filter(result => result.issues.length > 0).length;

  console.log(`Total articles: ${articles.length}`);
  console.log(`Articles with issues: ${articlesWithIssues}`);
  console.log(`Total issues found: ${totalIssues}`);

  // Group issues by type
  const issueTypes = {};
  auditResults.forEach(result => {
    result.issues.forEach(issue => {
      const type = issue.split(':')[0];
      issueTypes[type] = (issueTypes[type] || 0) + 1;
    });
  });

  console.log('\nIssue breakdown:');
  Object.entries(issueTypes).forEach(([type, count]) => {
    console.log(`  ${type}: ${count}`);
  });

  return { articles, auditResults };
}

function auditArticleMeta(article) {
  const issues = [];

  // Check meta title
  if (!article.meta_title) {
    issues.push('Meta title: Missing');
  } else {
    if (article.meta_title.length > 60) {
      issues.push(`Meta title: Too long (${article.meta_title.length} chars, max 60)`);
    }
    if (article.meta_title.length < 30) {
      issues.push(`Meta title: Too short (${article.meta_title.length} chars, min 30)`);
    }

    // Check for primary keyword
    const keywords = keywordMapping[article.slug];
    if (keywords) {
      const titleLower = article.meta_title.toLowerCase();
      const hasPrimaryKeyword = titleLower.includes(keywords.primary.toLowerCase());
      if (!hasPrimaryKeyword) {
        issues.push(`Meta title: Missing primary keyword "${keywords.primary}"`);
      }
    }
  }

  // Check meta description
  if (!article.meta_description) {
    issues.push('Meta description: Missing');
  } else {
    if (article.meta_description.length > 160) {
      issues.push(`Meta description: Too long (${article.meta_description.length} chars, max 160)`);
    }
    if (article.meta_description.length < 120) {
      issues.push(`Meta description: Too short (${article.meta_description.length} chars, min 120)`);
    }

    // Check for primary keyword
    const keywords = keywordMapping[article.slug];
    if (keywords) {
      const descLower = article.meta_description.toLowerCase();
      const hasPrimaryKeyword = descLower.includes(keywords.primary.toLowerCase());
      if (!hasPrimaryKeyword) {
        issues.push(`Meta description: Missing primary keyword "${keywords.primary}"`);
      }
    }
  }

  return {
    article,
    issues
  };
}

// Run the audit
if (require.main === module) {
  auditMetaData().catch(console.error);
}

module.exports = { auditMetaData };