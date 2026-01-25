import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {
  // First get table structure
  const { data: sample, error: sampleError } = await supabase
    .from('kb_research_queue')
    .select('*')
    .eq('status', 'approved')
    .limit(1);

  if (sampleError) {
    console.error('Error:', sampleError);
    return;
  }
  
  console.log('Table structure (columns):', Object.keys(sample[0] || {}));
  console.log('\nSample row:', JSON.stringify(sample[0], null, 2));
}

main();
