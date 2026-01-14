import { NextRequest, NextResponse } from 'next/server';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { calculateRelevanceScore } from '@/lib/utils/relevance-scorer';
import { detectLanguage } from '@/lib/utils/language-detection';

export const maxDuration = 60; // 60 seconds max for Vercel

interface ScannerJob {
  id: string;
  status: string;
  sources: string[];
  search_terms: string[];
  date_range_start: string | null;
  date_range_end: string | null;
  chunk_size: number;
  delay_ms: number;
  current_source_index: number;
  current_year: number | null;
  current_page: number;
  items_found: number;
  items_added: number;
  items_skipped: number;
  items_rejected: number;
  checkpoint: Record<string, any> | null;
  started_at: string | null;
}

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

// POST - Process one chunk of the oldest queued/running job
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 1. Find oldest job with status 'queued' or 'running'
    const { data: jobs, error: jobsError } = await supabase
      .from('kb_scan_jobs')
      .select('*')
      .in('status', ['queued', 'running', 'cancelling'])
      .order('created_at', { ascending: true })
      .limit(1);

    if (jobsError) {
      if (jobsError.code === '42P01') {
        return NextResponse.json({
          message: 'Scanner jobs table does not exist',
          migrationNeeded: true
        });
      }
      return NextResponse.json({ error: jobsError.message }, { status: 500 });
    }

    if (!jobs || jobs.length === 0) {
      return NextResponse.json({
        message: 'No jobs to process',
        hint: 'Create a job with POST /api/admin/scanner/jobs'
      });
    }

    const job = jobs[0] as ScannerJob;

    // 2. If job.status === 'cancelling', mark it 'cancelled' and return
    if (job.status === 'cancelling') {
      await supabase
        .from('kb_scan_jobs')
        .update({
          status: 'cancelled',
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', job.id);

      return NextResponse.json({
        jobId: job.id,
        status: 'cancelled',
        message: 'Job cancelled',
        stats: {
          found: job.items_found,
          added: job.items_added,
          skipped: job.items_skipped,
          rejected: job.items_rejected
        }
      });
    }

    // 3. Mark job as 'running', update started_at if null
    if (job.status === 'queued' || !job.started_at) {
      await supabase
        .from('kb_scan_jobs')
        .update({
          status: 'running',
          started_at: job.started_at || new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', job.id);
    }

    // 4. Get current source and search term
    const currentSource = job.sources[job.current_source_index];
    if (!currentSource) {
      // All sources completed
      await supabase
        .from('kb_scan_jobs')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', job.id);

      return NextResponse.json({
        jobId: job.id,
        status: 'completed',
        message: 'All sources processed',
        stats: {
          found: job.items_found,
          added: job.items_added,
          skipped: job.items_skipped,
          rejected: job.items_rejected
        }
      });
    }

    // 5. Process ONE chunk
    const results = await fetchChunk(
      currentSource,
      job.search_terms,
      job.current_page,
      job.chunk_size,
      job.date_range_start,
      job.date_range_end
    );

    // 6. Process results - check duplicates, calculate scores, insert
    let added = 0;
    let skipped = 0;
    let rejected = 0;

    for (const item of results.items) {
      const result = await processItem(supabase, item);
      if (result === 'added') added++;
      else if (result === 'skipped') skipped++;
      else rejected++;

      // Add delay between items to avoid rate limits
      if (job.delay_ms > 0 && results.items.indexOf(item) < results.items.length - 1) {
        await new Promise(r => setTimeout(r, Math.min(job.delay_ms / 10, 100)));
      }
    }

    // 7. Update job progress
    let newSourceIndex = job.current_source_index;
    let newPage = job.current_page + 1;
    let isComplete = false;

    // If no more results for this source, move to next
    if (!results.hasMore || results.items.length === 0) {
      newSourceIndex++;
      newPage = 0;

      // Check if all sources done
      if (newSourceIndex >= job.sources.length) {
        isComplete = true;
      }
    }

    const updateData: Record<string, any> = {
      current_source_index: newSourceIndex,
      current_page: newPage,
      items_found: job.items_found + results.items.length,
      items_added: job.items_added + added,
      items_skipped: job.items_skipped + skipped,
      items_rejected: job.items_rejected + rejected,
      checkpoint: {
        lastProcessedAt: new Date().toISOString(),
        lastSource: currentSource,
        lastPage: job.current_page
      },
      updated_at: new Date().toISOString()
    };

    if (isComplete) {
      updateData.status = 'completed';
      updateData.completed_at = new Date().toISOString();
    }

    await supabase
      .from('kb_scan_jobs')
      .update(updateData)
      .eq('id', job.id);

    const elapsedMs = Date.now() - startTime;

    return NextResponse.json({
      jobId: job.id,
      status: isComplete ? 'completed' : 'running',
      source: currentSource,
      page: job.current_page,
      processed: results.items.length,
      added,
      skipped,
      rejected,
      hasMore: !isComplete,
      elapsedMs,
      progress: {
        sourceIndex: newSourceIndex,
        totalSources: job.sources.length,
        nextSource: isComplete ? null : job.sources[newSourceIndex]
      },
      totals: {
        found: job.items_found + results.items.length,
        added: job.items_added + added,
        skipped: job.items_skipped + skipped,
        rejected: job.items_rejected + rejected
      }
    });

  } catch (error) {
    console.error('[Scanner Process] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Fetch a chunk of items from a source
async function fetchChunk(
  source: string,
  searchTerms: string[],
  page: number,
  chunkSize: number,
  dateStart: string | null,
  dateEnd: string | null
): Promise<{ items: ResearchItem[]; hasMore: boolean }> {
  const items: ResearchItem[] = [];
  const offset = page * chunkSize;

  // Use first search term for this chunk (rotate through terms on different pages)
  const termIndex = page % searchTerms.length;
  const searchTerm = searchTerms[termIndex];

  try {
    switch (source) {
      case 'pubmed':
        return await fetchPubMedChunk(searchTerm, chunkSize, offset, dateStart, dateEnd);

      case 'clinicaltrials':
        return await fetchClinicalTrialsChunk(searchTerm, chunkSize, offset);

      case 'pmc':
        return await fetchPMCChunk(searchTerm, chunkSize, offset, dateStart, dateEnd);

      default:
        console.log(`[Scanner] Unknown source: ${source}`);
        return { items: [], hasMore: false };
    }
  } catch (error) {
    console.error(`[Scanner] Error fetching from ${source}:`, error);
    return { items: [], hasMore: false };
  }
}

// Fetch from PubMed
async function fetchPubMedChunk(
  searchTerm: string,
  limit: number,
  offset: number,
  dateStart: string | null,
  dateEnd: string | null
): Promise<{ items: ResearchItem[]; hasMore: boolean }> {
  let dateFilter = '';
  if (dateStart) {
    const start = new Date(dateStart);
    const end = dateEnd ? new Date(dateEnd) : new Date();
    dateFilter = ` AND ("${start.getFullYear()}/${String(start.getMonth() + 1).padStart(2, '0')}/${String(start.getDate()).padStart(2, '0')}"[PDat] : "${end.getFullYear()}/${String(end.getMonth() + 1).padStart(2, '0')}/${String(end.getDate()).padStart(2, '0')}"[PDat])`;
  }

  const searchParams = new URLSearchParams({
    db: 'pubmed',
    term: `${searchTerm}${dateFilter}`,
    retmax: String(limit),
    retstart: String(offset),
    retmode: 'json',
    sort: 'date'
  });

  const searchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?${searchParams}`;
  const searchResponse = await fetch(searchUrl);

  if (!searchResponse.ok) {
    throw new Error(`PubMed search failed: ${searchResponse.status}`);
  }

  const searchData = await searchResponse.json();
  const ids = searchData.esearchresult?.idlist || [];
  const totalCount = parseInt(searchData.esearchresult?.count || '0');

  if (ids.length === 0) {
    return { items: [], hasMore: false };
  }

  // Fetch summaries
  const summaryParams = new URLSearchParams({
    db: 'pubmed',
    id: ids.join(','),
    retmode: 'json'
  });

  const summaryResponse = await fetch(
    `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?${summaryParams}`
  );

  if (!summaryResponse.ok) {
    throw new Error(`PubMed summary failed: ${summaryResponse.status}`);
  }

  const summaryData = await summaryResponse.json();
  const items: ResearchItem[] = [];

  for (const id of ids) {
    const article = summaryData.result?.[id];
    if (article && article.title) {
      items.push({
        title: article.title,
        authors: article.authors?.map((a: any) => a.name).join(', '),
        publication: article.source,
        year: parseInt(article.pubdate?.split(' ')[0]) || new Date().getFullYear(),
        url: `https://pubmed.ncbi.nlm.nih.gov/${id}/`,
        doi: article.elocationid?.replace('doi: ', ''),
        source_site: 'PubMed',
        search_term_matched: searchTerm
      });
    }
  }

  const hasMore = offset + ids.length < totalCount;
  return { items, hasMore };
}

// Fetch from ClinicalTrials.gov
async function fetchClinicalTrialsChunk(
  searchTerm: string,
  limit: number,
  offset: number
): Promise<{ items: ResearchItem[]; hasMore: boolean }> {
  const url = 'https://clinicaltrials.gov/api/v2/studies?' + new URLSearchParams({
    'query.term': searchTerm,
    'filter.overallStatus': 'COMPLETED',
    'sort': 'LastUpdatePostDate:desc',
    'pageSize': String(limit),
    'pageToken': offset > 0 ? String(offset) : ''
  });

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`ClinicalTrials.gov failed: ${response.status}`);
  }

  const data = await response.json();
  const studies = data.studies || [];
  const items: ResearchItem[] = [];

  for (const study of studies) {
    const protocol = study.protocolSection;
    const title = protocol?.identificationModule?.officialTitle || protocol?.identificationModule?.briefTitle;

    if (title) {
      const nctId = protocol?.identificationModule?.nctId;
      items.push({
        title,
        authors: protocol?.contactsLocationsModule?.overallOfficials?.map((o: any) => o.name).join(', '),
        publication: 'ClinicalTrials.gov',
        year: new Date(protocol?.statusModule?.lastUpdatePostDateStruct?.date).getFullYear() || new Date().getFullYear(),
        abstract: protocol?.descriptionModule?.briefSummary,
        url: `https://clinicaltrials.gov/study/${nctId}`,
        source_site: 'ClinicalTrials.gov',
        search_term_matched: searchTerm
      });
    }
  }

  const hasMore = data.nextPageToken != null;
  return { items, hasMore };
}

// Fetch from PMC
async function fetchPMCChunk(
  searchTerm: string,
  limit: number,
  offset: number,
  dateStart: string | null,
  dateEnd: string | null
): Promise<{ items: ResearchItem[]; hasMore: boolean }> {
  let dateFilter = '';
  if (dateStart) {
    const start = new Date(dateStart);
    const end = dateEnd ? new Date(dateEnd) : new Date();
    dateFilter = ` AND ("${start.getFullYear()}/${String(start.getMonth() + 1).padStart(2, '0')}/${String(start.getDate()).padStart(2, '0')}"[PDat] : "${end.getFullYear()}/${String(end.getMonth() + 1).padStart(2, '0')}/${String(end.getDate()).padStart(2, '0')}"[PDat])`;
  }

  const searchParams = new URLSearchParams({
    db: 'pmc',
    term: `${searchTerm}${dateFilter}`,
    retmax: String(limit),
    retstart: String(offset),
    retmode: 'json'
  });

  const searchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?${searchParams}`;
  const searchResponse = await fetch(searchUrl);

  if (!searchResponse.ok) {
    throw new Error(`PMC search failed: ${searchResponse.status}`);
  }

  const searchData = await searchResponse.json();
  const ids = searchData.esearchresult?.idlist || [];
  const totalCount = parseInt(searchData.esearchresult?.count || '0');

  if (ids.length === 0) {
    return { items: [], hasMore: false };
  }

  // Fetch summaries
  const summaryParams = new URLSearchParams({
    db: 'pmc',
    id: ids.join(','),
    retmode: 'json'
  });

  const summaryResponse = await fetch(
    `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?${summaryParams}`
  );

  if (!summaryResponse.ok) {
    throw new Error(`PMC summary failed: ${summaryResponse.status}`);
  }

  const summaryData = await summaryResponse.json();
  const items: ResearchItem[] = [];

  for (const id of ids) {
    const article = summaryData.result?.[id];
    if (article && article.title) {
      items.push({
        title: article.title,
        authors: article.authors?.map((a: any) => a.name).join(', '),
        publication: article.source || 'PMC',
        year: parseInt(article.pubdate?.split(' ')[0]) || new Date().getFullYear(),
        url: `https://www.ncbi.nlm.nih.gov/pmc/articles/PMC${id}/`,
        source_site: 'PMC',
        search_term_matched: searchTerm
      });
    }
  }

  const hasMore = offset + ids.length < totalCount;
  return { items, hasMore };
}

// Process a single item - check duplicate, calculate scores, insert
async function processItem(
  supabase: SupabaseClient,
  item: ResearchItem
): Promise<'added' | 'skipped' | 'rejected'> {
  try {
    // Check for duplicate by URL
    const { data: existing } = await supabase
      .from('kb_research_queue')
      .select('id')
      .eq('url', item.url)
      .single();

    if (existing) {
      return 'skipped';
    }

    // Check for duplicate by DOI
    if (item.doi) {
      const { data: doiMatch } = await supabase
        .from('kb_research_queue')
        .select('id')
        .eq('doi', item.doi)
        .single();

      if (doiMatch) {
        return 'skipped';
      }
    }

    // Calculate relevance score
    const relevance = calculateRelevanceScore({
      title: item.title,
      abstract: item.abstract
    });

    // Auto-reject if relevance is too low
    if (relevance.score < 20) {
      return 'rejected';
    }

    // Detect language
    const textForLang = `${item.title} ${item.abstract || ''}`;
    const langResult = detectLanguage(textForLang, item.title);

    // Calculate topics
    const topics = extractTopics(item);

    // Insert into kb_research_queue
    const { error } = await supabase
      .from('kb_research_queue')
      .insert({
        title: item.title,
        authors: item.authors,
        publication: item.publication,
        year: item.year,
        abstract: item.abstract,
        url: item.url,
        doi: item.doi,
        source_site: item.source_site,
        search_term_matched: item.search_term_matched,
        relevance_score: relevance.score,
        relevance_signals: relevance.signals,
        relevant_topics: topics,
        detected_language: langResult.language,
        status: 'pending'
      });

    if (error) {
      if (error.code === '23505') {
        return 'skipped'; // Duplicate constraint
      }
      console.error('[Scanner] Insert error:', error.message);
      return 'rejected';
    }

    return 'added';
  } catch (error) {
    console.error('[Scanner] Process item error:', error);
    return 'rejected';
  }
}

// Extract topics from item
function extractTopics(item: ResearchItem): string[] {
  const text = `${item.title || ''} ${item.abstract || ''}`.toLowerCase();
  const topics: string[] = [];

  const TOPIC_KEYWORDS: Record<string, string[]> = {
    'anxiety': ['anxiety', 'anxiolytic', 'gad', 'social anxiety'],
    'depression': ['depression', 'antidepressant', 'mood disorder'],
    'sleep': ['sleep', 'insomnia', 'circadian'],
    'pain': ['pain', 'analgesic', 'neuropathic'],
    'epilepsy': ['epilepsy', 'seizure', 'dravet', 'lennox-gastaut'],
    'cancer': ['cancer', 'tumor', 'oncology'],
    'inflammation': ['inflammation', 'anti-inflammatory', 'cytokine']
  };

  for (const [topic, keywords] of Object.entries(TOPIC_KEYWORDS)) {
    if (keywords.some(kw => text.includes(kw))) {
      topics.push(topic);
    }
  }

  return topics;
}

// GET - Check worker status
export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: activeJobs } = await supabase
      .from('kb_scan_jobs')
      .select('id, status, current_source_index, sources, items_found, items_added')
      .in('status', ['queued', 'running'])
      .limit(1);

    if (!activeJobs || activeJobs.length === 0) {
      return NextResponse.json({
        hasActiveJob: false,
        message: 'No active jobs'
      });
    }

    const job = activeJobs[0];

    return NextResponse.json({
      hasActiveJob: true,
      job: {
        id: job.id,
        status: job.status,
        currentSource: job.sources?.[job.current_source_index],
        progress: `${job.current_source_index}/${job.sources?.length || 0}`,
        stats: {
          found: job.items_found,
          added: job.items_added
        }
      }
    });

  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
