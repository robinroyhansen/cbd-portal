import pg from 'pg';
import { readFileSync } from 'fs';

// Read env file
const envContent = readFileSync('.env.local', 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=["']?(.+?)["']?$/);
  if (match) {
    env[match[1].trim()] = match[2];
  }
});

// Extract project ref from URL
const projectRef = env.NEXT_PUBLIC_SUPABASE_URL.match(/https:\/\/([^.]+)/)[1];
console.log('Project ref:', projectRef);

// Try connection with transaction pooler (port 6543)
const connectionString = `postgresql://postgres.${projectRef}:${env.SUPABASE_SERVICE_ROLE_KEY}@aws-0-eu-central-1.pooler.supabase.com:6543/postgres`;

console.log('Connecting to database...');

const client = new pg.Client({ connectionString });

try {
  await client.connect();
  console.log('Connected!');

  // Run migration
  console.log('Adding view_count column...');
  await client.query(`
    ALTER TABLE kb_glossary
    ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;
  `);
  console.log('✓ Column added');

  console.log('Creating index...');
  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_glossary_view_count
    ON kb_glossary(view_count DESC);
  `);
  console.log('✓ Index created');

  // Verify
  const result = await client.query(`
    SELECT column_name, data_type
    FROM information_schema.columns
    WHERE table_name = 'kb_glossary' AND column_name = 'view_count';
  `);
  console.log('✓ Verified:', result.rows);

  console.log('\n✓ Migration complete!');

} catch (error) {
  console.error('Error:', error.message);
} finally {
  await client.end();
}
