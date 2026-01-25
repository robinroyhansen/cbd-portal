#!/usr/bin/env npx tsx
/**
 * Run SQL migration using Supabase service role
 * This uses raw PostgreSQL connection via pg library
 */

import { Client } from 'pg';
import fs from 'fs';
import path from 'path';

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!supabaseUrl) {
    console.error('❌ NEXT_PUBLIC_SUPABASE_URL is required');
    process.exit(1);
  }

  // Extract project ref from URL
  const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];

  if (!projectRef) {
    console.error('❌ Could not extract project ref from URL');
    process.exit(1);
  }

  // Get database password from environment
  const dbPassword = process.env.SUPABASE_DB_PASSWORD;

  if (!dbPassword) {
    console.error('❌ SUPABASE_DB_PASSWORD is required');
    console.log('Add to .env.local: SUPABASE_DB_PASSWORD=your-database-password');
    console.log('Find it in Supabase Dashboard → Settings → Database → Connection string');
    process.exit(1);
  }

  // Build connection string
  const connectionString = `postgresql://postgres.${projectRef}:${dbPassword}@aws-0-eu-west-1.pooler.supabase.com:6543/postgres`;

  console.log('🔄 Connecting to Supabase database...');

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Read migration file
    const migrationPath = path.join(process.cwd(), 'supabase/migrations/20260125_translation_tables.sql');
    const sql = fs.readFileSync(migrationPath, 'utf-8');

    console.log('🔄 Running migration...');

    // Execute the SQL
    await client.query(sql);

    console.log('✅ Migration completed successfully!');

    // Verify tables exist
    const { rows } = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name LIKE '%_translations'
    `);

    console.log('\n📊 Translation tables created:');
    rows.forEach(row => console.log(`  ✅ ${row.table_name}`));

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
