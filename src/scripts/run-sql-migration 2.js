// Run SQL migration using Supabase Management API or direct connection
const SUPABASE_URL = 'https://bvrdryvgqarffgdujmjz.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2cmRyeXZncWFyZmZnZHVqbWp6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzkwMTc5NywiZXhwIjoyMDgzNDc3Nzk3fQ.SmqoTgGp3J6JEOuOiEl7IMd8whWz4qAvQABM7AUc7kY';

async function createExecSqlFunction() {
  // First, try to create an RPC function that can execute SQL
  // This is a workaround since REST API doesn't support DDL

  console.log('Creating exec_sql function via REST API...');

  // We'll use the management API approach - connect to pg via pooler
  const { default: pg } = await import('pg');
  const { Pool } = pg;

  // Use the session mode pooler for DDL operations
  const pool = new Pool({
    host: 'aws-0-eu-central-1.pooler.supabase.com',
    port: 5432,
    database: 'postgres',
    user: 'postgres.bvrdryvgqarffgdujmjz',
    password: process.env.SUPABASE_DB_PASSWORD,
    ssl: { rejectUnauthorized: false }
  });

  if (!process.env.SUPABASE_DB_PASSWORD) {
    console.log('SUPABASE_DB_PASSWORD not set. Please provide the database password.');
    console.log('You can find it in Supabase Dashboard > Settings > Database > Connection string');
    console.log('');
    console.log('Run this command manually in Supabase SQL Editor:');
    console.log('');
    console.log('ALTER TABLE kb_glossary ADD COLUMN IF NOT EXISTS display_name VARCHAR(255);');
    console.log('ALTER TABLE kb_glossary DROP COLUMN IF EXISTS difficulty;');
    console.log('UPDATE kb_glossary SET display_name = term WHERE display_name IS NULL;');
    return;
  }

  try {
    const client = await pool.connect();

    console.log('Connected to database!');

    await client.query('ALTER TABLE kb_glossary ADD COLUMN IF NOT EXISTS display_name VARCHAR(255)');
    console.log('✓ Added display_name column');

    await client.query('ALTER TABLE kb_glossary DROP COLUMN IF EXISTS difficulty');
    console.log('✓ Removed difficulty column');

    await client.query('UPDATE kb_glossary SET display_name = term WHERE display_name IS NULL');
    console.log('✓ Set default display_name values');

    client.release();
    await pool.end();

    console.log('\n✓ Migration complete!');
  } catch (err) {
    console.error('Database error:', err.message);
    console.log('');
    console.log('Run this SQL manually in Supabase SQL Editor:');
    console.log('');
    console.log('ALTER TABLE kb_glossary ADD COLUMN IF NOT EXISTS display_name VARCHAR(255);');
    console.log('ALTER TABLE kb_glossary DROP COLUMN IF EXISTS difficulty;');
    console.log('UPDATE kb_glossary SET display_name = term WHERE display_name IS NULL;');
  }
}

createExecSqlFunction().catch(console.error);
