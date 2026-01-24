#!/usr/bin/env node

/**
 * Script to add requireAdminAuth to all admin API routes
 * Run with: node scripts/add-auth-to-routes.js
 */

const fs = require('fs');
const path = require('path');

const ROUTES_TO_FIX = [
  'src/app/api/admin/articles/[id]/route.ts',
  'src/app/api/admin/authors/[id]/route.ts',
  'src/app/api/admin/authors/route.ts',
  'src/app/api/admin/authors/upload/route.ts',
  'src/app/api/admin/brand-reviews/adjust-section/route.ts',
  'src/app/api/admin/brand-reviews/generate/route.ts',
  'src/app/api/admin/brand-reviews/route.ts',
  'src/app/api/admin/brands/research/route.ts',
  'src/app/api/admin/brands/route.ts',
  'src/app/api/admin/comments/route.ts',
  'src/app/api/admin/conditions/[id]/route.ts',
  'src/app/api/admin/conditions/backfill/route.ts',
  'src/app/api/admin/conditions/create/route.ts',
  'src/app/api/admin/conditions/ignore/route.ts',
  'src/app/api/admin/conditions/map/route.ts',
  'src/app/api/admin/conditions/stats/route.ts',
  'src/app/api/admin/conditions/taxonomy/route.ts',
  'src/app/api/admin/conditions/unmapped/route.ts',
  'src/app/api/admin/env-check/route.ts',
  'src/app/api/admin/glossary/internationalize/route.ts',
  'src/app/api/admin/glossary/route.ts',
  'src/app/api/admin/glossary/seed-research-terms/route.ts',
  'src/app/api/admin/migrate-view-count/route.ts',
  'src/app/api/admin/migrations/status/route.ts',
  'src/app/api/admin/queue-count/route.ts',
  'src/app/api/admin/research/apply-blacklist/route.ts',
  'src/app/api/admin/research/backfill-countries/route.ts',
  'src/app/api/admin/research/backfill-sample-size/route.ts',
  'src/app/api/admin/research/bulk-generate-chunk/route.ts',
  'src/app/api/admin/research/bulk-generate/route.ts',
  'src/app/api/admin/research/check-approved-blacklist/route.ts',
  'src/app/api/admin/research/debug-query/route.ts',
  'src/app/api/admin/research/detect-languages/route.ts',
  'src/app/api/admin/research/fix-future-years/route.ts',
  'src/app/api/admin/research/fix-question-titles/route.ts',
  'src/app/api/admin/research/fix-topics/route.ts',
  'src/app/api/admin/research/generation/country/batch/route.ts',
  'src/app/api/admin/research/generation/country/route.ts',
  'src/app/api/admin/research/generation/stats/route.ts',
  'src/app/api/admin/research/migrate-sample-size/route.ts',
  'src/app/api/admin/research/migrate-sample-type/route.ts',
  'src/app/api/admin/research/recalculate-relevance/route.ts',
  'src/app/api/admin/research/recalculate-scores/route.ts',
  'src/app/api/admin/research/recalculate-topics/route.ts',
  'src/app/api/admin/research/regenerate-slugs/route.ts',
  'src/app/api/admin/research/remove-retracted/route.ts',
  'src/app/api/admin/research/studies/generate/route.ts',
  'src/app/api/admin/research/study-subject-stats/route.ts',
  'src/app/api/admin/research/test-resolver/route.ts',
  'src/app/api/admin/research/translate/route.ts',
  'src/app/api/admin/run-migration/route.ts',
  'src/app/api/admin/scan-jobs/[id]/process/route.ts',
  'src/app/api/admin/scan-jobs/[id]/route.ts',
  'src/app/api/admin/scan-jobs/route.ts',
  'src/app/api/admin/scan/[jobId]/route.ts',
  'src/app/api/admin/scan/active/route.ts',
  'src/app/api/admin/scan/start/route.ts',
  'src/app/api/admin/scanner/jobs/[id]/route.ts',
  'src/app/api/admin/setup/route.ts',
  'src/app/api/admin/trigger-scan/route.ts',
];

// Skip these - they need special handling or are intentionally public
const SKIP = [
  'src/app/api/admin/classify-content/route.ts', // May be called by AI
  'src/app/api/admin/generate-summary/route.ts', // May be called by AI
];

const AUTH_IMPORT = "import { requireAdminAuth } from '@/lib/admin-api-auth';";
const AUTH_CHECK = `  const authError = requireAdminAuth(request);
  if (authError) return authError;
`;

function addAuthToRoute(filePath) {
  const fullPath = path.join(process.cwd(), filePath);

  if (!fs.existsSync(fullPath)) {
    console.log(`SKIP: ${filePath} (not found)`);
    return;
  }

  let content = fs.readFileSync(fullPath, 'utf8');

  // Skip if already has auth
  if (content.includes('requireAdminAuth')) {
    console.log(`SKIP: ${filePath} (already has auth)`);
    return;
  }

  // Add import at the top (after any existing imports from next/server)
  if (content.includes("from 'next/server'")) {
    content = content.replace(
      /(import.*from 'next\/server';)/,
      `$1\n${AUTH_IMPORT}`
    );
  } else if (content.includes('import {')) {
    // Add after first import
    content = content.replace(
      /(import [^;]+;)/,
      `$1\n${AUTH_IMPORT}`
    );
  } else {
    // Add at the very top
    content = AUTH_IMPORT + '\n' + content;
  }

  // Add auth check to each HTTP method handler
  const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];

  for (const method of methods) {
    // Match function declarations like: export async function GET(request: NextRequest)
    // or: export async function GET(request: Request)
    // or: export async function GET()
    const functionPattern = new RegExp(
      `(export\\s+async\\s+function\\s+${method}\\s*\\([^)]*\\)\\s*\\{)(\\s*(?:try\\s*\\{)?\\s*)`,
      'g'
    );

    content = content.replace(functionPattern, (match, funcDecl, afterBrace) => {
      // Check if auth is already there
      if (afterBrace.includes('requireAdminAuth')) {
        return match;
      }

      // If there's a try block, add auth inside it
      if (afterBrace.includes('try {')) {
        return `${funcDecl}\n  try {\n${AUTH_CHECK}`;
      }

      return `${funcDecl}\n${AUTH_CHECK}${afterBrace}`;
    });
  }

  // Make sure request parameter exists if it was missing
  // Change GET() to GET(request: NextRequest)
  for (const method of methods) {
    content = content.replace(
      new RegExp(`(export\\s+async\\s+function\\s+${method})\\(\\)`, 'g'),
      `$1(request: NextRequest)`
    );
  }

  // Write back
  fs.writeFileSync(fullPath, content);
  console.log(`DONE: ${filePath}`);
}

// Run
console.log('Adding auth to admin routes...\n');

for (const route of ROUTES_TO_FIX) {
  if (SKIP.includes(route)) {
    console.log(`SKIP: ${route} (in skip list)`);
    continue;
  }
  addAuthToRoute(route);
}

console.log('\nDone! Review changes with: git diff');
