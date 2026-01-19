import { createClient } from '@supabase/supabase-js';
import {
  scanPubMed,
  scanClinicalTrials,
  scanPMC,
  calculateRelevance
} from './research-scanner';

interface ResearchItem {
  title: string;
  authors?: string;
  publication?: string;
  year?: number;
  abstract?: string;
  url: string;
  doi?: string;
  source_site: string;
  search_term_matched?: string;
}

// REQUIRED KEYWORDS - Study MUST contain at least one of these
const REQUIRED_KEYWORDS = [
  'cannabidiol',
  'cbd',
  'cannabis',
  'cannabinoid',
  'cannabinoids',
  'marijuana',
  'hemp',
  'thc',
  'tetrahydrocannabinol',
  'endocannabinoid',
  'phytocannabinoid',
  'cb1',
  'cb2',
  'epidiolex',
  'sativex',
  'nabiximols',
  'dronabinol',
  'nabilone'
];

// VALIDATION FUNCTION - Must pass to be added
function isRelevantToCannabis(study: ResearchItem): boolean {
  const text = `${study.title || ''} ${study.abstract || ''}`.toLowerCase();

  // Must contain at least one required keyword
  const hasRequiredKeyword = REQUIRED_KEYWORDS.some(keyword =>
    text.includes(keyword.toLowerCase())
  );

  if (!hasRequiredKeyword) {
    return false;
  }

  // Reject if it's about cannabis but not therapeutic
  const nonTherapeuticKeywords = [
    'agricultural',
    'cultivation only',
    'fiber production',
    'textile',
    'policy analysis',
    'legal framework',
    'drug testing',
    'detection method',
    'forensic'
  ];

  const isNonTherapeutic = nonTherapeuticKeywords.some(kw =>
    text.includes(kw) && !text.includes('therapeutic') && !text.includes('treatment') && !text.includes('patient')
  );

  return !isNonTherapeutic;
}

// Category assignment function
function assignCategories(study: ResearchItem): string[] {
  const text = `${study.title || ''} ${study.abstract || ''}`.toLowerCase();
  const categories: string[] = [];

  // CBD category
  if (
    text.includes('cannabidiol') ||
    text.includes('cbd') ||
    text.includes('epidiolex')
  ) {
    categories.push('cbd');
  }

  // Cannabis category
  if (
    text.includes('cannabis') ||
    text.includes('marijuana') ||
    text.includes('hemp') ||
    text.includes('thc') ||
    text.includes('tetrahydrocannabinol')
  ) {
    categories.push('cannabis');
  }

  // Medical Cannabis category
  if (
    text.includes('medical cannabis') ||
    text.includes('medicinal cannabis') ||
    text.includes('medical marijuana') ||
    text.includes('therapeutic') ||
    text.includes('patient') ||
    text.includes('treatment') ||
    text.includes('clinical trial') ||
    text.includes('randomized') ||
    text.includes('efficacy')
  ) {
    categories.push('medical-cannabis');
  }

  // Default to CBD if no category matched
  if (categories.length === 0) {
    categories.push('cbd');
  }

  return [...new Set(categories)];
}

/**
 * Process a single source chunk with real-time progress updates
 */
export async function processSourceChunk(
  jobId: string,
  sourceName: string,
  scanDepth: string,
  customKeywords: string[] = [],
  searchTermsOverride?: string[]
): Promise<{
  itemsFound: number;
  itemsAdded: number;
  itemsSkipped: number;
  itemsRejected: number;
}> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  console.log(`Processing source chunk: ${sourceName} for job ${jobId}`);

  let results: ResearchItem[] = [];
  let itemsAdded = 0;
  let itemsSkipped = 0;
  let itemsRejected = 0;

  // Update job status to running and set current source
  await supabase
    .from('kb_scan_jobs')
    .update({
      status: 'running',
      current_source: sourceName,
      started_at: new Date().toISOString()
    })
    .eq('id', jobId);

  // Log source started event
  await supabase
    .from('kb_scan_progress_events')
    .insert({
      job_id: jobId,
      event_type: 'source_started',
      source_name: sourceName,
      details: {
        scan_depth: scanDepth,
        custom_keywords: customKeywords
      }
    });

  try {
    // Scan the specified source
    switch (sourceName.toLowerCase()) {
      case 'pubmed':
        results = await scanPubMed(scanDepth, searchTermsOverride || customKeywords);
        break;
      case 'clinicaltrials':
        results = await scanClinicalTrials(scanDepth, searchTermsOverride || customKeywords);
        break;
      case 'pmc':
        results = await scanPMC(scanDepth, searchTermsOverride || customKeywords);
        break;
      default:
        throw new Error(`Unknown source: ${sourceName}`);
    }

    console.log(`Found ${results.length} potential results from ${sourceName}`);

    // Process each result individually for real-time updates
    for (const study of results) {
      try {
        // STRICT VALIDATION - Must be about cannabis/CBD
        if (!isRelevantToCannabis(study)) {
          itemsRejected++;
          // Use the database function to increment rejected count
          await supabase.rpc('increment_job_item_count', {
            job_uuid: jobId,
            count_type: 'rejected'
          });
          continue;
        }

        // Check if already exists
        const { data: existing } = await supabase
          .from('kb_research_queue')
          .select('id')
          .eq('url', study.url)
          .single();

        if (existing) {
          itemsSkipped++;
          // Use the database function to increment skipped count
          await supabase.rpc('increment_job_item_count', {
            job_uuid: jobId,
            count_type: 'skipped'
          });
          continue;
        }

        // Calculate relevance
        const { score, topics } = calculateRelevance(study);

        // Must have reasonable relevance score
        if (score < 20) {
          itemsRejected++;
          await supabase.rpc('increment_job_item_count', {
            job_uuid: jobId,
            count_type: 'rejected'
          });
          continue;
        }

        // Assign categories
        const categories = assignCategories(study);

        // Insert with job tracking - this will auto-trigger progress update
        const { error } = await supabase
          .from('kb_research_queue')
          .insert({
            title: study.title,
            authors: study.authors,
            publication: study.publication,
            year: study.year,
            abstract: study.abstract,
            url: study.url,
            doi: study.doi,
            source_site: study.source_site,
            search_term_matched: study.search_term_matched,
            relevance_score: score,
            relevant_topics: topics,
            categories: categories,
            status: 'pending',
            job_id: jobId
          });

        if (!error) {
          itemsAdded++;
          console.log(`Added: ${study.title.substring(0, 80)}...`);
        } else {
          console.error('Error inserting study:', error);
          itemsRejected++;
          await supabase.rpc('increment_job_item_count', {
            job_uuid: jobId,
            count_type: 'rejected'
          });
        }

        // Small delay to prevent overwhelming the database
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        console.error('Error processing individual study:', error);
        itemsRejected++;
        await supabase.rpc('increment_job_item_count', {
          job_uuid: jobId,
          count_type: 'rejected'
        });
      }
    }

    // Mark source as completed
    await supabase.rpc('complete_job_source', {
      job_uuid: jobId,
      source_name: sourceName
    });

    // Log source completion event
    await supabase
      .from('kb_scan_progress_events')
      .insert({
        job_id: jobId,
        event_type: 'source_completed',
        source_name: sourceName,
        details: {
          items_found: results.length,
          items_added: itemsAdded,
          items_skipped: itemsSkipped,
          items_rejected: itemsRejected
        }
      });

    console.log(`Completed ${sourceName}: Added=${itemsAdded}, Skipped=${itemsSkipped}, Rejected=${itemsRejected}`);

    return {
      itemsFound: results.length,
      itemsAdded,
      itemsSkipped,
      itemsRejected
    };

  } catch (error) {
    console.error(`Error processing source ${sourceName}:`, error);

    // Mark source as failed
    await supabase
      .from('kb_scan_source_progress')
      .update({
        status: 'failed',
        error_message: error instanceof Error ? error.message : 'Unknown error'
      })
      .eq('job_id', jobId)
      .eq('source_name', sourceName);

    // Log failure event
    await supabase
      .from('kb_scan_progress_events')
      .insert({
        job_id: jobId,
        event_type: 'job_failed',
        source_name: sourceName,
        details: {
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      });

    throw error;
  }
}

/**
 * Get the next source to process for a job
 */
export async function getNextSourceToProcess(jobId: string): Promise<{
  sourceName: string | null;
  searchTerms: string[];
  hasMoreSources: boolean;
}> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Get the next pending source
  const { data: nextSource, error } = await supabase
    .from('kb_scan_source_progress')
    .select('source_name, search_terms')
    .eq('job_id', jobId)
    .eq('status', 'pending')
    .order('created_at', { ascending: true })
    .limit(1)
    .single();

  if (error || !nextSource) {
    return {
      sourceName: null,
      searchTerms: [],
      hasMoreSources: false
    };
  }

  // Check if there are more sources after this one
  const { count: remainingCount } = await supabase
    .from('kb_scan_source_progress')
    .select('*', { count: 'exact', head: true })
    .eq('job_id', jobId)
    .eq('status', 'pending');

  return {
    sourceName: nextSource.source_name,
    searchTerms: nextSource.search_terms || [],
    hasMoreSources: (remainingCount || 0) > 1
  };
}

/**
 * Check if a job is complete and update its final status
 */
export async function checkJobCompletion(jobId: string): Promise<boolean> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Get job status
  const { data: job, error: jobError } = await supabase
    .from('kb_scan_jobs')
    .select('total_sources, sources_completed, status')
    .eq('id', jobId)
    .single();

  if (jobError || !job) {
    console.error('Error fetching job for completion check:', jobError);
    return false;
  }

  // Check if all sources are completed
  const isComplete = job.sources_completed >= job.total_sources;

  if (isComplete && job.status === 'running') {
    // Mark job as completed
    await supabase
      .from('kb_scan_jobs')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        progress_percentage: 100
      })
      .eq('id', jobId);

    // Log completion event
    await supabase
      .from('kb_scan_progress_events')
      .insert({
        job_id: jobId,
        event_type: 'job_completed',
        details: {
          sources_completed: job.sources_completed,
          total_sources: job.total_sources
        }
      });

    console.log(`Job ${jobId} marked as completed`);
    return true;
  }

  return isComplete;
}