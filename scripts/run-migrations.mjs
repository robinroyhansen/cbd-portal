#!/usr/bin/env node
/**
 * Run pending migrations via Supabase
 *
 * This script executes SQL migrations using the Supabase client.
 * Run with: node scripts/run-migrations.mjs
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load environment variables
import dotenv from 'dotenv';
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const migrations = [
  '20260124_create_audit_log.sql',
  '20260124_add_performance_indexes.sql',
];

async function runMigration(filename) {
  console.log(`\n📦 Running migration: ${filename}`);

  const sqlPath = join(__dirname, '..', 'supabase', 'migrations', filename);
  const sql = readFileSync(sqlPath, 'utf-8');

  // Split by semicolons but keep CREATE POLICY statements together
  const statements = sql
    .split(/;(?=\s*(?:--|CREATE|ALTER|COMMENT|DROP))/gi)
    .map(s => s.trim())
    .filter(s => s && !s.startsWith('--'));

  let successCount = 0;
  let errorCount = 0;

  for (const statement of statements) {
    if (!statement || statement.length < 5) continue;

    try {
      const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' });

      if (error) {
        // Try direct execution for DDL statements
        if (error.message.includes('function') || error.message.includes('exec_sql')) {
          console.log(`  ⚠️  Cannot execute DDL via RPC. Statement needs manual execution.`);
          console.log(`     First 80 chars: ${statement.substring(0, 80)}...`);
          errorCount++;
        } else {
          throw error;
        }
      } else {
        successCount++;
        const preview = statement.substring(0, 50).replace(/\n/g, ' ');
        console.log(`  ✓ ${preview}...`);
      }
    } catch (err) {
      // Check if it's a "already exists" error (which is OK)
      if (err.message?.includes('already exists') || err.code === '42P07' || err.code === '42710') {
        console.log(`  ⏭️  Already exists: ${statement.substring(0, 40)}...`);
        successCount++;
      } else {
        console.error(`  ❌ Error: ${err.message || err}`);
        console.log(`     Statement: ${statement.substring(0, 80)}...`);
        errorCount++;
      }
    }
  }

  console.log(`\n   Results: ${successCount} succeeded, ${errorCount} failed/skipped`);
  return errorCount === 0;
}

async function main() {
  console.log('🚀 Running Supabase Migrations');
  console.log('================================');

  // First, check if we can create the exec_sql function
  console.log('\n📝 Note: DDL statements (CREATE TABLE, CREATE INDEX, etc.) cannot be');
  console.log('   executed via the REST API. You may need to run these manually in');
  console.log('   the Supabase SQL Editor.\n');

  let allSuccess = true;

  for (const migration of migrations) {
    const success = await runMigration(migration);
    if (!success) allSuccess = false;
  }

  if (allSuccess) {
    console.log('\n✅ All migrations completed successfully!');
  } else {
    console.log('\n⚠️  Some migrations need manual execution in Supabase SQL Editor.');
    console.log('   Copy the SQL from the migration files and run them there.');
  }
}

main().catch(console.error);
