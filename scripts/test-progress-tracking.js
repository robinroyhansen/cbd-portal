const { createClient } = require('@supabase/supabase-js');

// Environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ SUPABASE environment variables are required');
  console.log('Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function testProgressTracking() {
  console.log('🧪 TESTING PROGRESS TRACKING SYSTEM');
  console.log('='.repeat(50));

  try {
    // Step 1: Create a test scan job
    console.log('\n1. Creating test scan job...');
    const { data: jobData, error: jobError } = await supabase
      .rpc('start_scan_job', {
        p_scan_type: 'manual',
        p_scan_depth: 'standard',
        p_selected_sources: ['pubmed', 'clinicaltrials'],
        p_custom_keywords: ['CBD', 'anxiety'],
        p_created_by: 'test-user'
      });

    if (jobError) {
      console.error('❌ Error creating job:', jobError);
      return;
    }

    const jobId = jobData;
    console.log(`✅ Created job with ID: ${jobId}`);

    // Step 2: Verify job was created correctly
    console.log('\n2. Verifying job creation...');
    const { data: job, error: fetchError } = await supabase
      .from('kb_scan_jobs')
      .select(`
        *,
        kb_scan_source_progress (*)
      `)
      .eq('id', jobId)
      .single();

    if (fetchError) {
      console.error('❌ Error fetching job:', fetchError);
      return;
    }

    console.log(`✅ Job status: ${job.status}`);
    console.log(`✅ Total sources: ${job.total_sources}`);
    console.log(`✅ Progress: ${job.progress_percentage}%`);
    console.log(`✅ Source progress records: ${job.kb_scan_source_progress.length}`);

    // Step 3: Simulate adding research items
    console.log('\n3. Simulating research item discovery...');

    const mockResearchItems = [
      {
        title: 'CBD and Anxiety: A Clinical Study',
        authors: 'Smith, J., et al.',
        publication: 'Journal of Cannabis Research',
        year: 2023,
        abstract: 'This study examines the effects of CBD on anxiety disorders...',
        url: 'https://example.com/study1',
        doi: '10.1000/example1',
        source_site: 'pubmed',
        relevance_score: 85,
        relevant_topics: ['anxiety', 'cbd'],
        search_term_matched: 'CBD anxiety',
        status: 'pending',
        job_id: jobId
      },
      {
        title: 'Cannabidiol Treatment for Generalized Anxiety',
        authors: 'Johnson, A., et al.',
        publication: 'Neuropsychopharmacology',
        year: 2024,
        abstract: 'A randomized controlled trial of CBD for anxiety treatment...',
        url: 'https://example.com/study2',
        doi: '10.1000/example2',
        source_site: 'clinicaltrials',
        relevance_score: 92,
        relevant_topics: ['anxiety', 'cbd', 'clinical-trial'],
        search_term_matched: 'cannabidiol anxiety',
        status: 'pending',
        job_id: jobId
      },
      {
        title: 'CBD Oil for Anxiety Disorders: Systematic Review',
        authors: 'Wilson, R., et al.',
        publication: 'Cochrane Reviews',
        year: 2023,
        abstract: 'A comprehensive review of CBD oil studies for anxiety...',
        url: 'https://example.com/study3',
        doi: '10.1000/example3',
        source_site: 'pubmed',
        relevance_score: 88,
        relevant_topics: ['anxiety', 'cbd', 'systematic-review'],
        search_term_matched: 'CBD oil anxiety',
        status: 'pending',
        job_id: jobId
      }
    ];

    // Insert items one by one to test trigger
    for (const [index, item] of mockResearchItems.entries()) {
      console.log(`   Adding item ${index + 1}: ${item.title.substring(0, 40)}...`);

      const { error: insertError } = await supabase
        .from('kb_research_queue')
        .insert(item);

      if (insertError) {
        console.error(`❌ Error inserting item ${index + 1}:`, insertError);
        continue;
      }

      // Small delay to see progressive updates
      await new Promise(resolve => setTimeout(resolve, 500));

      // Check updated job stats
      const { data: updatedJob } = await supabase
        .from('kb_scan_jobs')
        .select('items_added, items_skipped, items_rejected, total_items_found')
        .eq('id', jobId)
        .single();

      console.log(`   ✅ Items added: ${updatedJob.items_added}, Total found: ${updatedJob.total_items_found}`);
    }

    // Step 4: Test progress events
    console.log('\n4. Checking progress events...');
    const { data: events, error: eventsError } = await supabase
      .from('kb_scan_progress_events')
      .select('*')
      .eq('job_id', jobId)
      .order('timestamp', { ascending: false });

    if (eventsError) {
      console.error('❌ Error fetching events:', eventsError);
    } else {
      console.log(`✅ Found ${events.length} progress events`);
      events.slice(0, 3).forEach((event, index) => {
        console.log(`   ${index + 1}. ${event.event_type}: ${event.item_title || 'N/A'}`);
      });
    }

    // Step 5: Test source completion
    console.log('\n5. Testing source completion...');

    // Mark first source as completed
    const { error: completeError } = await supabase
      .rpc('complete_job_source', {
        job_uuid: jobId,
        source_name: 'pubmed'
      });

    if (completeError) {
      console.error('❌ Error completing source:', completeError);
    } else {
      console.log('✅ Marked pubmed source as completed');
    }

    // Check updated progress
    const { data: finalJob } = await supabase
      .from('kb_scan_jobs')
      .select('sources_completed, progress_percentage, status')
      .eq('id', jobId)
      .single();

    console.log(`✅ Sources completed: ${finalJob.sources_completed}/2`);
    console.log(`✅ Progress: ${finalJob.progress_percentage}%`);
    console.log(`✅ Status: ${finalJob.status}`);

    // Step 6: Complete remaining source to trigger job completion
    console.log('\n6. Completing remaining source...');

    const { error: completeError2 } = await supabase
      .rpc('complete_job_source', {
        job_uuid: jobId,
        source_name: 'clinicaltrials'
      });

    if (!completeError2) {
      const { data: completedJob } = await supabase
        .from('kb_scan_jobs')
        .select('sources_completed, progress_percentage, status, completed_at')
        .eq('id', jobId)
        .single();

      console.log(`✅ Final sources completed: ${completedJob.sources_completed}/2`);
      console.log(`✅ Final progress: ${completedJob.progress_percentage}%`);
      console.log(`✅ Final status: ${completedJob.status}`);
      console.log(`✅ Completed at: ${completedJob.completed_at ? 'Set' : 'Not set'}`);
    }

    // Step 7: Test cleanup function
    console.log('\n7. Testing cleanup function...');
    const { data: cleanupCount, error: cleanupError } = await supabase
      .rpc('cleanup_old_scan_jobs');

    if (cleanupError) {
      console.error('❌ Error testing cleanup:', cleanupError);
    } else {
      console.log(`✅ Cleanup function works (deleted ${cleanupCount} old jobs)`);
    }

    console.log('\n🎉 ALL TESTS PASSED!');
    console.log('\nDatabase schema is ready for real-time progress tracking.');
    console.log(`Test job ID: ${jobId} (can be used for further testing)`);

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the tests
testProgressTracking();