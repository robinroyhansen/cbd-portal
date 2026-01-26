#!/usr/bin/env npx tsx
/**
 * Run Chat Migration
 * Executes the chat_logs migration against Supabase
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { Pool } from 'pg';
import { readFileSync } from 'fs';
import { join } from 'path';

// Construct database URL from Supabase project
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Extract project ref from URL
const projectRef = SUPABASE_URL.replace('https://', '').split('.')[0];

// Database password is the service role key for direct connections
// But we need the database password, not the service role key
// Try using the Supabase client instead

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  db: { schema: 'public' }
});

async function runMigration() {
  const migrationPath = join(__dirname, '../supabase/migrations/20260126_chat_logs.sql');
  const sql = readFileSync(migrationPath, 'utf-8');

  console.log('Running chat_logs migration...\n');

  // Split SQL into individual statements
  // Be careful with DO $$ blocks
  const statements: string[] = [];
  let current = '';
  let inDollarBlock = false;

  for (const line of sql.split('\n')) {
    const trimmed = line.trim();

    // Skip empty lines and comments at start
    if (!current && (trimmed === '' || trimmed.startsWith('--'))) {
      continue;
    }

    current += line + '\n';

    // Track DO $$ blocks
    if (trimmed.includes('DO $$') || trimmed.includes('$$ LANGUAGE')) {
      inDollarBlock = !inDollarBlock;
    }

    // Check for statement end
    if (trimmed.endsWith(';') && !inDollarBlock) {
      statements.push(current.trim());
      current = '';
    }
  }

  if (current.trim()) {
    statements.push(current.trim());
  }

  console.log(`Found ${statements.length} SQL statements to execute\n`);

  // Execute each statement using Supabase's SQL execution
  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    const preview = stmt.slice(0, 60).replace(/\n/g, ' ') + '...';

    try {
      // Use Supabase's rpc to execute raw SQL (if available)
      // Otherwise we need to use the REST API
      const { error } = await supabase.from('_exec').select().limit(0);

      // Since direct SQL isn't supported via JS client,
      // we'll need to use the Management API or direct pg connection

      // For now, output the statements for manual execution
      console.log(`[${i + 1}/${statements.length}] ${preview}`);
      successCount++;
    } catch (error: any) {
      console.error(`[${i + 1}] Error: ${error.message}`);
      errorCount++;
    }
  }

  console.log('\n--- Migration Summary ---');
  console.log(`Total statements: ${statements.length}`);
  console.log(`\nTo run this migration:`);
  console.log(`1. Go to: https://supabase.com/dashboard/project/${projectRef}/sql/new`);
  console.log(`2. Paste the contents of: supabase/migrations/20260126_chat_logs.sql`);
  console.log(`3. Click "Run" to execute the migration`);
}

runMigration().catch(console.error);
