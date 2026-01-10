const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const [key, ...val] = line.split('=');
  if (key && val.length) env[key.trim()] = val.join('=').trim();
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function cancelStuckJobs() {
  // Find stuck jobs
  const { data: stuckJobs, error } = await supabase
    .from('kb_scan_jobs')
    .select('id, status, created_at, started_at, current_source')
    .in('status', ['pending', 'running'])
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching jobs:', error);
    return;
  }

  console.log('Found active/stuck jobs:', stuckJobs?.length || 0);
  
  if (stuckJobs && stuckJobs.length > 0) {
    for (const job of stuckJobs) {
      console.log(`\nJob ${job.id}:`);
      console.log(`  Status: ${job.status}`);
      console.log(`  Started: ${job.started_at}`);
      console.log(`  Current source: ${job.current_source}`);
      
      // Cancel it
      const { error: updateError } = await supabase
        .from('kb_scan_jobs')
        .update({ 
          status: 'cancelled', 
          completed_at: new Date().toISOString() 
        })
        .eq('id', job.id);
      
      if (updateError) {
        console.error(`  Failed to cancel:`, updateError);
      } else {
        console.log(`  ✓ Cancelled`);
      }
    }
  } else {
    console.log('No stuck jobs found.');
  }
}

cancelStuckJobs();
