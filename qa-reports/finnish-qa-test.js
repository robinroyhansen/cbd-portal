/**
 * Finnish (FI) Comprehensive QA Test for CBD Portal
 * Tests Finnish language implementation comprehensively
 */

const BASE_URL = 'https://cbd-portal.vercel.app';

// Test results storage
const results = {
  tested: 0,
  passed: [],
  failed: [],
  translationIssues: [],
  mixedLanguage: [],
  rawKeys: [],
  screenshots: []
};

// Critical routes to test for Finnish
const FINNISH_TEST_ROUTES = {
  // Core pages with Finnish paths if they exist
  core: [
    { path: '/?lang=fi', type: 'homepage', expectedLang: 'fi' },
    { path: '/artikkelit?lang=fi', type: 'articles', expectedLang: 'fi' },
    { path: '/sairaudet?lang=fi', type: 'conditions', expectedLang: 'fi' },
    { path: '/tyokalut?lang=fi', type: 'tools', expectedLang: 'fi' },
    { path: '/sanasto?lang=fi', type: 'glossary', expectedLang: 'fi' },
    { path: '/tutkimus?lang=fi', type: 'research', expectedLang: 'fi' },
    { path: '/lemmikit?lang=fi', type: 'pets', expectedLang: 'fi' },
    { path: '/haku?lang=fi', type: 'search', expectedLang: 'fi' }
  ],
  
  // Test English paths with Finnish language parameter
  englishPathsWithFinnish: [
    { path: '/conditions?lang=fi', type: 'conditions-english-path', expectedLang: 'fi' },
    { path: '/tools?lang=fi', type: 'tools-english-path', expectedLang: 'fi' },
    { path: '/glossary?lang=fi', type: 'glossary-english-path', expectedLang: 'fi' },
    { path: '/research?lang=fi', type: 'research-english-path', expectedLang: 'fi' },
    { path: '/articles?lang=fi', type: 'articles-english-path', expectedLang: 'fi' },
    { path: '/pets?lang=fi', type: 'pets-english-path', expectedLang: 'fi' }
  ],

  // Sample condition pages
  conditions: [
    { path: '/conditions/anxiety?lang=fi', type: 'condition-page', expectedLang: 'fi' },
    { path: '/conditions/pain?lang=fi', type: 'condition-page', expectedLang: 'fi' },
    { path: '/conditions/depression?lang=fi', type: 'condition-page', expectedLang: 'fi' },
    { path: '/conditions/epilepsy?lang=fi', type: 'condition-page', expectedLang: 'fi' },
    { path: '/conditions/sleep?lang=fi', type: 'condition-page', expectedLang: 'fi' }
  ],

  // Tool pages
  tools: [
    { path: '/tools/dosage-calculator?lang=fi', type: 'tool-page', expectedLang: 'fi' },
    { path: '/tools/interactions?lang=fi', type: 'tool-page', expectedLang: 'fi' },
    { path: '/tools/cost-calculator?lang=fi', type: 'tool-page', expectedLang: 'fi' },
    { path: '/tools/strength-calculator?lang=fi', type: 'tool-page', expectedLang: 'fi' }
  ],

  // Glossary terms
  glossary: [
    { path: '/glossary/cbd?lang=fi', type: 'glossary-term', expectedLang: 'fi' },
    { path: '/glossary/thc?lang=fi', type: 'glossary-term', expectedLang: 'fi' },
    { path: '/glossary/cannabidiol?lang=fi', type: 'glossary-term', expectedLang: 'fi' }
  ],

  // Pet pages
  pets: [
    { path: '/pets/dogs?lang=fi', type: 'pet-page', expectedLang: 'fi' },
    { path: '/pets/cats?lang=fi', type: 'pet-page', expectedLang: 'fi' }
  ],

  // Static/content pages
  static: [
    { path: '/about?lang=fi', type: 'static-page', expectedLang: 'fi' },
    { path: '/contact?lang=fi', type: 'static-page', expectedLang: 'fi' },
    { path: '/privacy-policy?lang=fi', type: 'static-page', expectedLang: 'fi' },
    { path: '/terms-of-service?lang=fi', type: 'static-page', expectedLang: 'fi' },
    { path: '/medical-disclaimer?lang=fi', type: 'static-page', expectedLang: 'fi' }
  ]
};

// Translation issues to look for
const TRANSLATION_ISSUES = {
  rawKeys: [
    /[a-zA-Z]+Page\.[a-zA-Z]+\./g,  // e.g., "articlesPage.categories.cannabinoids"
    /[a-zA-Z]+\.[a-zA-Z]+\.[a-zA-Z]+/g,  // General key.subkey.value patterns
    /{{[a-zA-Z_]+}}/g,  // Template variables like {{key_name}}
    /\[object Object\]/g,  // Object placeholders
    /undefined/g,  // Undefined values
    /null/g  // Null values
  ],
  
  englishText: [
    /CBD Portal/g,
    /Learn more/g,
    /Read more/g,
    /Get started/g,
    /Search articles/g,
    /Browse all/g,
    /View all/g,
    /Contact us/g,
    /Privacy Policy/g,
    /Terms of Service/g
  ]
};

async function testRoute(url, expectedLang, type) {
  results.tested++;
  
  try {
    console.log(`Testing: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'fi,en;q=0.5',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      }
    });
    
    if (!response.ok) {
      results.failed.push({
        url,
        type,
        status: response.status,
        issue: `HTTP ${response.status}`
      });
      return { status: response.status, issues: [`HTTP ${response.status}`] };
    }
    
    const html = await response.text();
    const issues = [];
    
    // Extract language from html tag
    const langMatch = html.match(/<html[^>]*lang="([^"]+)"/);
    const actualLang = langMatch ? langMatch[1] : 'unknown';
    
    // Check if language matches expected
    if (actualLang !== expectedLang) {
      issues.push(`Wrong language: expected ${expectedLang}, got ${actualLang}`);
      results.mixedLanguage.push({
        url,
        type,
        expected: expectedLang,
        actual: actualLang
      });
    }
    
    // Check for translation key patterns
    let hasRawKeys = false;
    for (const pattern of TRANSLATION_ISSUES.rawKeys) {
      const matches = html.match(pattern);
      if (matches && matches.length > 0) {
        hasRawKeys = true;
        issues.push(`Raw translation keys found: ${matches.slice(0, 5).join(', ')}${matches.length > 5 ? '...' : ''}`);
        results.rawKeys.push({
          url,
          type,
          keys: matches.slice(0, 10)  // Limit to first 10
        });
      }
    }
    
    // Check for English text that should be translated
    let hasEnglishText = false;
    for (const pattern of TRANSLATION_ISSUES.englishText) {
      const matches = html.match(pattern);
      if (matches && matches.length > 0) {
        hasEnglishText = true;
        issues.push(`English text found: ${matches.slice(0, 3).join(', ')}`);
      }
    }
    
    // Extract meta information
    const titleMatch = html.match(/<title[^>]*>([^<]+)/);
    const title = titleMatch ? titleMatch[1] : 'No title';
    
    const descriptionMatch = html.match(/<meta[^>]*name="description"[^>]*content="([^"]+)"/);
    const description = descriptionMatch ? descriptionMatch[1] : 'No description';
    
    // Check if meta content is in Finnish or English
    if (title.includes('CBD Portal') && !title.includes('fi')) {
      issues.push('Title appears to be in English');
    }
    
    const result = {
      url,
      type,
      status: response.status,
      actualLang,
      title,
      description: description.substring(0, 100),
      issues,
      hasRawKeys,
      hasEnglishText
    };
    
    if (issues.length === 0) {
      results.passed.push(result);
    } else {
      results.translationIssues.push(result);
    }
    
    return result;
    
  } catch (error) {
    results.failed.push({
      url,
      type,
      error: error.message,
      issue: 'Network/parsing error'
    });
    return { status: 'ERROR', error: error.message, issues: [error.message] };
  }
}

async function runFinnishQA() {
  console.log('🇫🇮 Starting Finnish (FI) Comprehensive QA Testing...\n');
  
  const startTime = Date.now();
  
  // Test all route categories
  const allCategories = Object.entries(FINNISH_TEST_ROUTES);
  
  for (const [categoryName, routes] of allCategories) {
    console.log(`\n📍 Testing ${categoryName} (${routes.length} routes)...`);
    
    for (const route of routes) {
      await testRoute(`${BASE_URL}${route.path}`, route.expectedLang, route.type);
      
      // Small delay to be respectful
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  console.log('\n✅ Testing completed!');
  
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`⏱️ Total time: ${elapsed}s`);
  
  return results;
}

function generateReport(results) {
  const report = [];
  
  report.push('# CBD Portal Finnish (FI) Comprehensive QA Report');
  report.push(`\n**Date:** ${new Date().toISOString().split('T')[0]}`);
  report.push(`**Site:** ${BASE_URL}`);
  report.push(`**Language:** Finnish (FI)`);
  report.push(`**Database Status:** 1,317/1,317 articles translated (100% complete)`);
  report.push(`**Test Type:** Comprehensive translation and localization audit\n`);
  
  // Summary
  report.push('## Executive Summary\n');
  report.push(`| Metric | Count | Status |`);
  report.push(`|--------|-------|--------|`);
  report.push(`| Total Pages Tested | ${results.tested} | - |`);
  report.push(`| ✅ Fully Translated | ${results.passed.length} | ${results.tested > 0 ? ((results.passed.length / results.tested) * 100).toFixed(1) + '%' : '0%'} |`);
  report.push(`| ⚠️ Translation Issues | ${results.translationIssues.length} | ${results.tested > 0 ? ((results.translationIssues.length / results.tested) * 100).toFixed(1) + '%' : '0%'} |`);
  report.push(`| ❌ Failed to Load | ${results.failed.length} | ${results.tested > 0 ? ((results.failed.length / results.tested) * 100).toFixed(1) + '%' : '0%'} |`);
  report.push(`| 🔀 Wrong Language | ${results.mixedLanguage.length} | ${results.tested > 0 ? ((results.mixedLanguage.length / results.tested) * 100).toFixed(1) + '%' : '0%'} |`);
  report.push(`| 🔑 Raw Translation Keys | ${results.rawKeys.length} | Critical Issue |`);
  
  const overallScore = results.tested > 0 ? ((results.passed.length / results.tested) * 100).toFixed(1) : 0;
  
  let status = '🔴 Poor';
  if (overallScore >= 90) status = '🟢 Excellent';
  else if (overallScore >= 80) status = '🟡 Good';
  else if (overallScore >= 70) status = '🟠 Needs Work';
  
  report.push(`\n**Overall Translation Quality:** ${overallScore}% ${status}\n`);
  
  // Critical Issues
  if (results.rawKeys.length > 0) {
    report.push('## 🚨 Critical Issues - Raw Translation Keys\n');
    report.push('**These must be fixed immediately - they show untranslated key names to users:**\n');
    report.push('| Page | Type | Raw Keys Found |');
    report.push('|------|------|----------------|');
    
    for (const issue of results.rawKeys) {
      const keys = issue.keys.slice(0, 3).join(', ') + (issue.keys.length > 3 ? '...' : '');
      report.push(`| \`${issue.url.replace(BASE_URL, '')}\` | ${issue.type} | \`${keys}\` |`);
    }
    report.push('');
  }
  
  // Language Issues
  if (results.mixedLanguage.length > 0) {
    report.push('## 🔀 Wrong Language Content\n');
    report.push('**These pages return content in wrong language:**\n');
    report.push('| Page | Expected | Actual | Type |');
    report.push('|------|----------|--------|------|');
    
    for (const issue of results.mixedLanguage) {
      report.push(`| \`${issue.url.replace(BASE_URL, '')}\` | ${issue.expected} | ${issue.actual} | ${issue.type} |`);
    }
    report.push('');
  }
  
  // Failed Pages
  if (results.failed.length > 0) {
    report.push('## ❌ Failed Pages\n');
    report.push('| Page | Type | Issue |');
    report.push('|------|------|-------|');
    
    for (const failure of results.failed) {
      report.push(`| \`${failure.url.replace(BASE_URL, '')}\` | ${failure.type} | ${failure.issue || failure.error} |`);
    }
    report.push('');
  }
  
  // Translation Issues Detail
  if (results.translationIssues.length > 0) {
    report.push('## ⚠️ Translation Issues Detail\n');
    
    for (const issue of results.translationIssues) {
      report.push(`### \`${issue.url.replace(BASE_URL, '')}\` - ${issue.type}`);
      report.push(`- **Language:** ${issue.actualLang}`);
      report.push(`- **Title:** ${issue.title}`);
      report.push(`- **Issues:**`);
      
      for (const prob of issue.issues) {
        report.push(`  - ${prob}`);
      }
      report.push('');
    }
  }
  
  // Successful Pages
  if (results.passed.length > 0) {
    report.push('## ✅ Successfully Translated Pages\n');
    
    const groupedByType = {};
    for (const page of results.passed) {
      if (!groupedByType[page.type]) groupedByType[page.type] = [];
      groupedByType[page.type].push(page);
    }
    
    for (const [type, pages] of Object.entries(groupedByType)) {
      report.push(`### ${type} (${pages.length} pages)`);
      for (const page of pages) {
        report.push(`- ✅ \`${page.url.replace(BASE_URL, '')}\` - ${page.title.substring(0, 50)}${page.title.length > 50 ? '...' : ''}`);
      }
      report.push('');
    }
  }
  
  // Recommendations
  report.push('## 🎯 Recommendations\n');
  
  if (results.rawKeys.length > 0) {
    report.push('### Priority 1: Fix Translation Keys');
    report.push('- Review translation files for Finnish (fi.json or similar)');
    report.push('- Ensure all keys have proper Finnish translations');
    report.push('- Check for missing namespace imports in components');
    report.push('- Verify i18n configuration includes Finnish locale\n');
  }
  
  if (results.mixedLanguage.length > 0) {
    report.push('### Priority 2: Language Detection');
    report.push('- Fix middleware.ts to properly detect and set Finnish locale');
    report.push('- Ensure ?lang=fi parameter is respected');
    report.push('- Check that locale context is passed to all components\n');
  }
  
  if (results.failed.length > 0) {
    report.push('### Priority 3: Page Accessibility');
    report.push('- Investigate failed page routes');
    report.push('- Ensure Finnish path prefixes are properly configured');
    report.push('- Check for missing page components or data\n');
  }
  
  report.push('### General Recommendations');
  report.push('- Test with Finnish users for UX feedback');
  report.push('- Verify meta tags (title, description) are translated');
  report.push('- Check breadcrumb navigation in Finnish');
  report.push('- Test search functionality with Finnish queries');
  report.push('- Validate form placeholders and error messages');
  report.push('- Ensure date/number formatting follows Finnish conventions\n');
  
  // Next Steps
  report.push('## 📋 Next Steps\n');
  report.push('1. **Fix critical translation key issues** (if any found)');
  report.push('2. **Resolve language detection problems**');
  report.push('3. **Test article content translation quality**');
  report.push('4. **Verify Finnish-specific URLs work** (if implementing /fi/ prefixes)');
  report.push('5. **QA test with native Finnish speakers**');
  report.push('6. **Setup automated translation monitoring**\n');
  
  return report.join('\n');
}

// Run the audit
runFinnishQA()
  .then(async (results) => {
    const report = generateReport(results);
    
    // Write report to file
    const fs = require('fs');
    const reportPath = process.env.HOME + '/clawd/cbd-portal/qa-reports/finnish-qa-report.md';
    
    fs.writeFileSync(reportPath, report);
    console.log(`\n📄 Report saved to: ${reportPath}`);
    
    // Print summary
    console.log('\n========================================');
    console.log('           FINNISH QA SUMMARY');
    console.log('========================================');
    console.log(`Total Pages Tested: ${results.tested}`);
    console.log(`✅ Fully Translated: ${results.passed.length}`);
    console.log(`⚠️ Translation Issues: ${results.translationIssues.length}`);
    console.log(`❌ Failed to Load: ${results.failed.length}`);
    console.log(`🔑 Raw Translation Keys: ${results.rawKeys.length}`);
    
    const score = results.tested > 0 ? ((results.passed.length / results.tested) * 100).toFixed(1) : 0;
    console.log(`📊 Translation Quality: ${score}%`);
    console.log('========================================\n');
    
    // List top issues for quick action
    if (results.rawKeys.length > 0) {
      console.log('🚨 CRITICAL: Raw translation keys found!');
      results.rawKeys.slice(0, 3).forEach(issue => {
        console.log(`   ${issue.url.replace(BASE_URL, '')} - ${issue.keys[0]}`);
      });
    }
    
    if (results.mixedLanguage.length > 0) {
      console.log('⚠️ Language detection issues:');
      results.mixedLanguage.slice(0, 3).forEach(issue => {
        console.log(`   ${issue.url.replace(BASE_URL, '')} - expected ${issue.expected}, got ${issue.actual}`);
      });
    }
  })
  .catch(error => {
    console.error('Finnish QA test failed:', error);
    process.exit(1);
  });