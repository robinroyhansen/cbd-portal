import { config } from 'dotenv';
config({ path: '.env.local' });

import { readFileSync } from 'fs';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing environment variables');
  process.exit(1);
}

const projectRef = SUPABASE_URL.replace('https://', '').split('.')[0];
const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function checkAndCreateTables() {
  console.log('Checking if chat tables exist...\n');

  // Check if tables already exist
  const { data: tables, error } = await supabase
    .from('information_schema.tables')
    .select('table_name')
    .eq('table_schema', 'public')
    .in('table_name', ['chat_conversations', 'chat_messages', 'chat_feedback']);

  // This won't work directly - need to use a different approach
  // Let's check by trying to query the tables

  try {
    const { error: convError } = await supabase.from('chat_conversations').select('id').limit(1);
    if (!convError) {
      console.log('✓ chat_conversations table already exists');
    } else if (convError.code === '42P01') {
      console.log('✗ chat_conversations table does not exist');
    } else {
      console.log('? chat_conversations: ', convError.message);
    }
  } catch (e) {
    console.log('✗ chat_conversations table does not exist');
  }

  try {
    const { error: msgError } = await supabase.from('chat_messages').select('id').limit(1);
    if (!msgError) {
      console.log('✓ chat_messages table already exists');
    } else if (msgError.code === '42P01') {
      console.log('✗ chat_messages table does not exist');
    } else {
      console.log('? chat_messages: ', msgError.message);
    }
  } catch (e) {
    console.log('✗ chat_messages table does not exist');
  }

  try {
    const { error: fbError } = await supabase.from('chat_feedback').select('id').limit(1);
    if (!fbError) {
      console.log('✓ chat_feedback table already exists');
    } else if (fbError.code === '42P01') {
      console.log('✗ chat_feedback table does not exist');
    } else {
      console.log('? chat_feedback: ', fbError.message);
    }
  } catch (e) {
    console.log('✗ chat_feedback table does not exist');
  }

  console.log('\n--- Instructions ---');
  console.log('To create the chat tables, run the migration SQL in Supabase:');
  console.log(`\n1. Open: https://supabase.com/dashboard/project/${projectRef}/sql/new`);
  console.log('2. Copy the SQL from: supabase/migrations/20260126_chat_logs.sql');
  console.log('3. Paste and click "Run"');
  console.log('\nOr use the Supabase CLI: npx supabase db push');
}

checkAndCreateTables().catch(console.error);
