#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const issues = [];
  
  // Patterns to detect hardcoded English strings
  const patterns = [
    // String literals in JSX
    { regex: />\s*([A-Z][a-z\s]+(?:[a-z\s.,!?:;-]+)?)\s*</g, type: 'JSX content' },
    // aria-label attributes
    { regex: /aria-label=['"`]([^'"`]+)['"`]/g, type: 'aria-label' },
    // alt attributes
    { regex: /alt=['"`]([^'"`]+)['"`]/g, type: 'alt text' },
    // placeholder attributes
    { regex: /placeholder=['"`]([^'"`]+)['"`]/g, type: 'placeholder' },
    // title attributes
    { regex: /title=['"`]([^'"`]+)['"`]/g, type: 'title' },
    // String literals in error messages
    { regex: /(?:throw new Error|console\.error|console\.warn)\s*\(\s*['"`]([^'"`]+)['"`]/g, type: 'error message' },
    // Alert or confirm messages
    { regex: /(?:alert|confirm)\s*\(\s*['"`]([^'"`]+)['"`]/g, type: 'alert message' }
  ];
  
  patterns.forEach(pattern => {
    let match;
    while ((match = pattern.regex.exec(content)) !== null) {
      const text = match[1].trim();
      
      // Skip if it's obviously not English or already a translation key
      if (
        text.length < 3 ||
        /^[A-Z_][A-Z0-9_]*$/.test(text) || // ALL_CAPS constants
        /^\{.*\}$/.test(text) || // JSX expressions
        /^t\(/.test(text) || // translation calls
        /^\$\{/.test(text) || // template literals
        /^(src|href|className|id|key)$/.test(text) || // attribute names
        /^[\d\s.,:-]+$/.test(text) || // numbers/dates
        /^(true|false|null|undefined)$/.test(text) || // JS literals
        text.includes('{{') || // already contains template syntax
        text.includes('{') && text.includes('}') // contains JSX expressions
      ) {
        continue;
      }
      
      // Check if it contains English words (simple heuristic)
      const englishWords = ['the', 'and', 'or', 'but', 'for', 'with', 'this', 'that', 'from', 'to', 'of', 'in', 'on', 'at', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'can', 'may', 'might', 'must', 'shall', 'Error', 'Loading', 'Please', 'Click', 'Search', 'View', 'Show', 'Hide', 'Open', 'Close', 'Save', 'Cancel', 'Submit', 'Next', 'Previous', 'Back', 'Home', 'About', 'Contact'];
      
      const hasEnglishWords = englishWords.some(word => 
        new RegExp(`\\b${word}\\b`, 'i').test(text)
      );
      
      if (hasEnglishWords || /^[A-Z][a-z]+(\s+[A-Za-z]+)*[.!?]?$/.test(text)) {
        const lineNumber = content.substring(0, match.index).split('\n').length;
        issues.push({
          text,
          type: pattern.type,
          line: lineNumber,
          context: content.split('\n')[lineNumber - 1]?.trim() || ''
        });
      }
    }
  });
  
  return issues;
}

function scanDirectory(dirPath, extensions = ['.tsx', '.ts', '.jsx', '.js']) {
  const results = {};
  
  function walkDir(currentPath) {
    const items = fs.readdirSync(currentPath);
    
    for (const item of items) {
      const fullPath = path.join(currentPath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        // Skip node_modules and other common directories
        if (!['node_modules', '.git', '.next', 'dist', 'build'].includes(item)) {
          walkDir(fullPath);
        }
      } else if (stat.isFile()) {
        const ext = path.extname(item);
        if (extensions.includes(ext)) {
          const issues = scanFile(fullPath);
          if (issues.length > 0) {
            const relativePath = path.relative(process.cwd(), fullPath);
            results[relativePath] = issues;
          }
        }
      }
    }
  }
  
  walkDir(dirPath);
  return results;
}

function generateReport(results) {
  let report = '# Component English String Scan Report\n\n';
  report += `Generated: ${new Date().toISOString()}\n\n`;
  
  const totalFiles = Object.keys(results).length;
  const totalIssues = Object.values(results).reduce((sum, issues) => sum + issues.length, 0);
  
  report += `## Summary\n`;
  report += `- **Files with issues**: ${totalFiles}\n`;
  report += `- **Total issues found**: ${totalIssues}\n\n`;
  
  if (totalFiles === 0) {
    report += '✅ **No hardcoded English strings found!**\n\n';
    return report;
  }
  
  report += '## Issues by File\n\n';
  
  Object.entries(results).forEach(([filePath, issues]) => {
    report += `### ${filePath}\n\n`;
    report += `Found ${issues.length} issue(s):\n\n`;
    
    issues.forEach((issue, index) => {
      report += `${index + 1}. **${issue.type}** (Line ${issue.line})\n`;
      report += `   - Text: "${issue.text}"\n`;
      report += `   - Context: \`${issue.context}\`\n\n`;
    });
  });
  
  // Generate suggested fixes
  report += '## Suggested Fixes\n\n';
  report += 'For each hardcoded string found:\n\n';
  report += '1. Add a translation key to `locales/en.json` and `locales/de.json`\n';
  report += '2. Import and use the `useTranslations` hook\n';
  report += '3. Replace the hardcoded string with `t("your.translation.key")`\n\n';
  report += 'Example:\n';
  report += '```tsx\n';
  report += 'import { useTranslations } from "next-intl";\n\n';
  report += 'const t = useTranslations();\n\n';
  report += '// Before\n';
  report += '<button>Click here</button>\n\n';
  report += '// After\n';
  report += '<button>{t("common.clickHere")}</button>\n';
  report += '```\n\n';
  
  return report;
}

try {
  console.log('🔍 Scanning components for hardcoded English strings...');
  
  const srcPath = path.join(process.cwd(), 'src');
  
  if (!fs.existsSync(srcPath)) {
    console.log('❌ src directory not found');
    process.exit(1);
  }
  
  const results = scanDirectory(srcPath);
  const report = generateReport(results);
  
  // Write report to file
  const reportPath = path.join(process.cwd(), 'component-scan-report.md');
  fs.writeFileSync(reportPath, report);
  
  console.log(`✅ Scan complete! Report saved to: ${reportPath}`);
  
  const totalFiles = Object.keys(results).length;
  const totalIssues = Object.values(results).reduce((sum, issues) => sum + issues.length, 0);
  
  if (totalIssues > 0) {
    console.log(`⚠️  Found ${totalIssues} potential issues in ${totalFiles} files`);
    
    // Show top 5 issues
    console.log('\nTop issues found:');
    let count = 0;
    for (const [filePath, issues] of Object.entries(results)) {
      for (const issue of issues) {
        if (count >= 5) break;
        console.log(`  ${count + 1}. ${path.basename(filePath)} (${issue.type}): "${issue.text}"`);
        count++;
      }
      if (count >= 5) break;
    }
    
    if (totalIssues > 5) {
      console.log(`  ... and ${totalIssues - 5} more issues`);
    }
  } else {
    console.log('✅ No hardcoded English strings found!');
  }
  
} catch (error) {
  console.error('❌ Error scanning components:', error.message);
  process.exit(1);
}