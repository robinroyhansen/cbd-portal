#!/usr/bin/env node

const https = require('https');
const fs = require('fs');
const path = require('path');

// Routes to test with German language
const routes = [
  { path: '/', name: 'Homepage' },
  { path: '/erkrankungen', name: 'Conditions' },
  { path: '/artikel', name: 'Articles' },
  { path: '/forschung', name: 'Research' },
  { path: '/glossar', name: 'Glossary' },
  { path: '/datenschutz', name: 'Privacy Policy' },
  { path: '/cookie-richtlinie', name: 'Cookie Policy' },
  { path: '/nutzungsbedingungen', name: 'Terms of Service' },
  { path: '/medizinischer-haftungsausschluss', name: 'Medical Disclaimer' },
  { path: '/redaktionelle-richtlinien', name: 'Editorial Policy' },
  { path: '/forschungsmethodik', name: 'Methodology' }
];

function makeRequest(url, headers = {}) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; CBD-Portal-Test/1.0)',
        ...headers
      }
    };

    const req = https.get(url, options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: body,
          url: url
        });
      });
    });

    req.on('error', reject);
    req.setTimeout(10000, () => {
      req.abort();
      reject(new Error('Request timeout'));
    });
  });
}

function analyzeContent(body, routeName) {
  const issues = [];
  
  // Check for common English phrases that should be translated
  const englishPhrases = [
    'Loading...',
    'Search for',
    'Click here',
    'Read more',
    'Learn more',
    'View all',
    'Show more',
    'Hide',
    'Close',
    'Menu',
    'Home',
    'About',
    'Contact',
    'Privacy Policy',
    'Terms of Service',
    'Cookie Policy',
    'All rights reserved',
    'Copyright',
    'Back to top',
    'Share',
    'Print',
    'Subscribe',
    'Newsletter',
    'Email',
    'Submit',
    'Cancel',
    'Save',
    'Edit',
    'Delete',
    'Previous',
    'Next',
    'Page',
    'Results',
    'Found',
    'No results',
    'Error',
    'Something went wrong'
  ];
  
  englishPhrases.forEach(phrase => {
    if (body.includes(phrase)) {
      issues.push({
        type: 'English phrase',
        text: phrase,
        severity: 'medium'
      });
    }
  });
  
  // Check for English meta tags
  const metaTitleMatch = body.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (metaTitleMatch && /[A-Z][a-z]+\s+[A-Z][a-z]+/.test(metaTitleMatch[1])) {
    const title = metaTitleMatch[1];
    if (!title.includes('CBD') && !/deutsch|german|de\b/i.test(title)) {
      issues.push({
        type: 'English meta title',
        text: title,
        severity: 'high'
      });
    }
  }
  
  const metaDescMatch = body.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
  if (metaDescMatch && /\b(the|and|or|with|for|from|about)\b/.test(metaDescMatch[1])) {
    issues.push({
      type: 'English meta description',
      text: metaDescMatch[1],
      severity: 'high'
    });
  }
  
  // Check for English navigation items
  const navMatches = body.match(/<nav[^>]*>[\s\S]*?<\/nav>/gi) || [];
  navMatches.forEach(nav => {
    englishPhrases.forEach(phrase => {
      if (nav.includes(phrase)) {
        issues.push({
          type: 'English navigation',
          text: phrase,
          severity: 'high'
        });
      }
    });
  });
  
  // Check for English breadcrumbs
  const breadcrumbMatches = body.match(/breadcrumb|crumb/gi) || [];
  if (breadcrumbMatches.length > 0) {
    englishPhrases.forEach(phrase => {
      if (body.includes(phrase)) {
        const context = body.substring(body.indexOf(phrase) - 50, body.indexOf(phrase) + 50);
        if (context.includes('breadcrumb') || context.includes('crumb')) {
          issues.push({
            type: 'English breadcrumb',
            text: phrase,
            severity: 'medium'
          });
        }
      }
    });
  }
  
  return issues;
}

async function testRoute(baseUrl, route) {
  const results = {
    route: route.path,
    name: route.name,
    tests: {}
  };
  
  try {
    // Test route with ?lang=de
    const germanUrl = `${baseUrl}${route.path}?lang=de`;
    console.log(`Testing: ${germanUrl}`);
    
    const germanResponse = await makeRequest(germanUrl);
    results.tests.german = {
      url: germanUrl,
      status: germanResponse.status,
      success: germanResponse.status === 200,
      issues: germanResponse.status === 200 ? analyzeContent(germanResponse.body, route.name) : []
    };
    
    // Test without language parameter (should default to German based on domain/config)
    const defaultUrl = `${baseUrl}${route.path}`;
    const defaultResponse = await makeRequest(defaultUrl);
    results.tests.default = {
      url: defaultUrl,
      status: defaultResponse.status,
      success: defaultResponse.status === 200,
      issues: defaultResponse.status === 200 ? analyzeContent(defaultResponse.body, route.name) : []
    };
    
    // Check if response contains German-specific elements
    if (germanResponse.status === 200) {
      const body = germanResponse.body;
      const germanIndicators = [
        'lang="de"',
        'hreflang="de"',
        'content="de"',
        'Datenschutz',
        'Nutzungsbedingungen',
        'Impressum',
        'Cookie-Richtlinie',
        'Über uns',
        'Kontakt',
        'Suchen',
        'Artikel',
        'Forschung',
        'Erkrankungen',
        'Glossar'
      ];
      
      const hasGermanIndicators = germanIndicators.some(indicator => body.includes(indicator));
      results.tests.german.hasGermanContent = hasGermanIndicators;
      
      if (!hasGermanIndicators) {
        results.tests.german.issues.push({
          type: 'No German indicators',
          text: 'Page may not be properly localized to German',
          severity: 'high'
        });
      }
    }
    
  } catch (error) {
    results.error = error.message;
  }
  
  return results;
}

async function testAllRoutes() {
  console.log('🧪 Testing German routes and localization...');
  
  // Try to determine the base URL
  let baseUrl = 'https://cbdportal.com';
  
  // Check if we're testing locally
  if (process.env.NODE_ENV === 'development' || process.argv.includes('--local')) {
    baseUrl = 'http://localhost:3000';
  }
  
  console.log(`Base URL: ${baseUrl}`);
  
  const testResults = [];
  
  for (const route of routes) {
    try {
      const result = await testRoute(baseUrl, route);
      testResults.push(result);
      
      const germanTest = result.tests.german;
      const status = germanTest.success ? '✅' : '❌';
      const issueCount = germanTest.issues?.length || 0;
      
      console.log(`${status} ${route.name} (${route.path}) - ${issueCount} issues`);
      
      if (issueCount > 0) {
        germanTest.issues.slice(0, 3).forEach(issue => {
          const emoji = issue.severity === 'high' ? '🔴' : '🟡';
          console.log(`   ${emoji} ${issue.type}: ${issue.text}`);
        });
        if (issueCount > 3) {
          console.log(`   ... and ${issueCount - 3} more issues`);
        }
      }
      
    } catch (error) {
      console.log(`❌ ${route.name}: ${error.message}`);
      testResults.push({
        route: route.path,
        name: route.name,
        error: error.message
      });
    }
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Generate report
  generateTestReport(testResults, baseUrl);
  
  return testResults;
}

function generateTestReport(results, baseUrl) {
  let report = '# German Route Testing Report\n\n';
  report += `Generated: ${new Date().toISOString()}\n`;
  report += `Base URL: ${baseUrl}\n\n`;
  
  const totalRoutes = results.length;
  const successfulRoutes = results.filter(r => r.tests?.german?.success).length;
  const totalIssues = results.reduce((sum, r) => sum + (r.tests?.german?.issues?.length || 0), 0);
  
  report += `## Summary\n\n`;
  report += `- **Total routes tested**: ${totalRoutes}\n`;
  report += `- **Successful routes**: ${successfulRoutes}\n`;
  report += `- **Total issues found**: ${totalIssues}\n\n`;
  
  if (successfulRoutes === totalRoutes && totalIssues === 0) {
    report += '✅ **All routes working perfectly with German localization!**\n\n';
  }
  
  report += `## Route Test Results\n\n`;
  
  results.forEach(result => {
    const status = result.tests?.german?.success ? '✅' : '❌';
    report += `### ${status} ${result.name} (${result.route})\n\n`;
    
    if (result.error) {
      report += `**Error**: ${result.error}\n\n`;
      return;
    }
    
    if (result.tests?.german) {
      const test = result.tests.german;
      report += `- **Status**: ${test.status}\n`;
      report += `- **German content detected**: ${test.hasGermanContent ? 'Yes' : 'No'}\n`;
      report += `- **Issues found**: ${test.issues.length}\n\n`;
      
      if (test.issues.length > 0) {
        report += `#### Issues:\n\n`;
        test.issues.forEach((issue, index) => {
          const emoji = issue.severity === 'high' ? '🔴' : '🟡';
          report += `${index + 1}. ${emoji} **${issue.type}**: ${issue.text}\n`;
        });
        report += '\n';
      }
    }
  });
  
  // Write report
  const reportPath = path.join(process.cwd(), 'german-route-test-report.md');
  fs.writeFileSync(reportPath, report);
  
  console.log(`\n✅ Test report saved to: ${reportPath}`);
}

// Run if called directly
if (require.main === module) {
  testAllRoutes().catch(error => {
    console.error('❌ Error running tests:', error.message);
    process.exit(1);
  });
}