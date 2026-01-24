#!/usr/bin/env npx tsx
/**
 * Run SQL migration against Supabase
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

async function main() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Missing Supabase environment variables');
    process.exit(1);
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  // Read migration file
  const migrationPath = path.join(process.cwd(), 'supabase/migrations/20260125_translation_tables.sql');
  const sql = fs.readFileSync(migrationPath, 'utf-8');

  console.log('🔄 Running translation tables migration...\n');

  // Split SQL into individual statements (simplified - handles most cases)
  const statements = sql
    .split(/;\s*$/m)
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  let successCount = 0;
  let errorCount = 0;

  for (const statement of statements) {
    if (!statement) continue;

    // Skip comments-only statements
    if (statement.split('\n').every(line => line.trim().startsWith('--') || line.trim() === '')) {
      continue;
    }

    try {
      const { error } = await supabase.rpc('exec_sql', { sql_query: statement + ';' });

      if (error) {
        // Try direct query for DDL statements
        const { error: directError } = await supabase.from('_exec').select().limit(0);

        // For CREATE TABLE and similar, we need to use the SQL editor or pg connection
        // Let's check if the table already exists instead
        const tableName = statement.match(/CREATE TABLE (?:IF NOT EXISTS )?(\w+)/i)?.[1];

        if (tableName) {
          const { count } = await supabase
            .from(tableName)
            .select('*', { count: 'exact', head: true });

          if (count !== null) {
            console.log(`✅ Table ${tableName} already exists`);
            successCount++;
            continue;
          }
        }

        console.log(`⚠️ Statement may need manual execution:`, statement.substring(0, 60) + '...');
        errorCount++;
      } else {
        successCount++;
        console.log(`✅ Executed: ${statement.substring(0, 50)}...`);
      }
    } catch (err) {
      // Check if it's a "table already exists" type error
      const errorMsg = err instanceof Error ? err.message : String(err);
      if (errorMsg.includes('already exists') || errorMsg.includes('duplicate')) {
        console.log(`⏭️ Already exists: ${statement.substring(0, 50)}...`);
        successCount++;
      } else {
        console.log(`⚠️ Error: ${errorMsg}`);
        errorCount++;
      }
    }
  }

  console.log(`\n📊 Migration complete: ${successCount} succeeded, ${errorCount} need manual review`);

  // Let's verify by checking if tables exist
  console.log('\n🔍 Verifying tables...');

  const tables = ['article_translations', 'condition_translations', 'glossary_translations', 'research_translations', 'ui_translations'];

  for (const table of tables) {
    try {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.log(`❌ ${table}: Not found or error - ${error.message}`);
      } else {
        console.log(`✅ ${table}: Exists (${count || 0} rows)`);
      }
    } catch (err) {
      console.log(`❌ ${table}: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }
}

main().catch(console.error);
