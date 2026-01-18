import { NextRequest, NextResponse } from 'next/server';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { calculateRelevanceScore } from '@/lib/utils/relevance-scorer';
import { detectLanguage } from '@/lib/utils/language-detection';
import {
  isDuplicate,
  isUrlDuplicate,
  updateSourceIds,
  buildSourceIds,
  normalizeDoi,
  normalizePmid,
  normalizePmcId
} from '@/lib/utils/deduplication';
import {
  cleanTitle,
  cleanAbstract,
  cleanText,
  validateYear
} from '@/lib/utils/text-cleanup';
import { resolveStudyById } from '@/lib/scanner/term-resolver';

export const maxDuration = 60; // 60 seconds max for Vercel

// Constants for processing (not stored in DB)
const CHUNK_SIZE = 20;
const DELAY_MS = 100;

// Interface matching actual kb_scan_jobs table schema
interface ScannerJob {
  id: string;
  status: string;
  sources: string[];
  search_terms: string[] | null;
  date_range_start: string | null;
  date_range_end: string | null;
  current_source: string | null;
  current_source_index: number;
  current_source_offset: number; // Offset within current source for pagination
  items_found: number;
  items_added: number;
  items_skipped: number;
  items_rejected: number;
  error_message: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

// Raw term captured from professional taxonomies
interface RawTerm {
  source: 'mesh' | 'openalex' | 'ctgov' | 'keyword' | 'title' | 'ai';
  term: string;
  termId?: string;           // External ID (MeSH ID, OpenAlex concept ID)
  confidence?: number;       // Confidence score (0-1)
  isHealthRelated?: boolean; // Filter out non-health concepts
  metadata?: Record<string, unknown>; // Additional data (tree numbers, parent concepts, etc.)
}

interface ResearchItem {
  title: string;
  authors?: string;
  publication?: string;
  year?: number;
  abstract?: string;
  url: string;
  doi?: string;
  pmid?: string;      // PubMed ID for deduplication
  pmcId?: string;     // PMC ID for deduplication
  sourceId?: string;  // ID in the source system
  source_site: string;
  search_term_matched?: string;
  rawTerms?: RawTerm[]; // Professional taxonomy terms from source
}

// POST - Process one chunk of the oldest queued/running job
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 1. Find oldest job with status 'pending', 'queued' or 'running' (also check cancelling/paused to handle state transitions)
    const { data: jobs, error: jobsError } = await supabase
      .from('kb_scan_jobs')
      .select('*')
      .in('status', ['pending', 'queued', 'running', 'cancelling', 'paused'])
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

    // 2b. If job.status === 'paused', don't process - job is paused
    if (job.status === 'paused') {
      return NextResponse.json({
        jobId: job.id,
        status: 'paused',
        message: 'Job is paused. Use resume endpoint to continue.',
        hasMore: false,
        stats: {
          found: job.items_found,
          added: job.items_added,
          skipped: job.items_skipped,
          rejected: job.items_rejected
        }
      });
    }

    // 3. Get current source
    const currentSource = job.sources[job.current_source_index];

    // 4. Mark job as 'running', update started_at if null, set current_source
    if (job.status === 'queued' || !job.started_at) {
      await supabase
        .from('kb_scan_jobs')
        .update({
          status: 'running',
          current_source: currentSource || null,
          started_at: job.started_at || new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', job.id);
    }

    // 5. Check if all sources completed
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

    // 6. Process ONE chunk (use defaults for search terms if null)
    const searchTerms = job.search_terms || ['CBD', 'cannabidiol'];
    const currentOffset = job.current_source_offset || 0;
    console.log(`[Scanner] Processing job ${job.id}: source=${currentSource}, offset=${currentOffset}, terms=${searchTerms.join(',')}`);

    const results = await fetchChunk(
      currentSource,
      searchTerms,
      currentOffset, // Use per-source offset, not cumulative items_found
      CHUNK_SIZE,
      job.date_range_start,
      job.date_range_end
    );

    console.log(`[Scanner] Fetch results: ${results.items.length} items, hasMore=${results.hasMore}, error=${results.error || 'none'}`);

    // 7. Process results - check duplicates, calculate scores, insert
    let added = 0;
    let skipped = 0;
    let rejected = 0;

    for (const item of results.items) {
      const result = await processItem(supabase, item);
      if (result === 'added') added++;
      else if (result === 'skipped') skipped++;
      else rejected++;

      // Add delay between items to avoid rate limits
      if (DELAY_MS > 0 && results.items.indexOf(item) < results.items.length - 1) {
        await new Promise(r => setTimeout(r, Math.min(DELAY_MS / 10, 100)));
      }
    }

    // 8. Update job progress
    let newSourceIndex = job.current_source_index;
    let newSourceOffset = currentOffset + results.items.length;
    let isComplete = false;

    // If no more results for this source, move to next
    if (!results.hasMore || results.items.length === 0) {
      newSourceIndex++;
      newSourceOffset = 0; // Reset offset for new source

      // Check if all sources done
      if (newSourceIndex >= job.sources.length) {
        isComplete = true;
      }
    }

    // Only use columns that exist in the actual database
    const updateData: Record<string, any> = {
      current_source_index: newSourceIndex,
      current_source_offset: newSourceOffset,
      current_source: isComplete ? null : job.sources[newSourceIndex] || null,
      items_found: job.items_found + results.items.length,
      items_added: job.items_added + added,
      items_skipped: job.items_skipped + skipped,
      items_rejected: job.items_rejected + rejected,
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
      processed: results.items.length,
      added,
      skipped,
      rejected,
      hasMore: !isComplete,
      elapsedMs,
      fetchError: results.error || null,
      progress: {
        sourceIndex: newSourceIndex,
        sourceOffset: newSourceOffset,
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
  offset: number,
  chunkSize: number,
  dateStart: string | null,
  dateEnd: string | null
): Promise<{ items: ResearchItem[]; hasMore: boolean; error?: string }> {
  // Use first search term for this chunk (rotate through terms on different pages)
  const pageNum = Math.floor(offset / chunkSize);
  const termIndex = pageNum % searchTerms.length;
  const searchTerm = searchTerms[termIndex];

  console.log(`[Scanner] Fetching from ${source}: offset=${offset}, term="${searchTerm}", dateStart=${dateStart}, dateEnd=${dateEnd}`);

  try {
    switch (source) {
      case 'pubmed':
        return await fetchPubMedChunk(searchTerm, chunkSize, offset, dateStart, dateEnd);

      case 'clinicaltrials':
        return await fetchClinicalTrialsChunk(searchTerm, chunkSize, offset);

      case 'pmc':
        return await fetchPMCChunk(searchTerm, chunkSize, offset, dateStart, dateEnd);

      case 'openalex':
        return await fetchOpenAlexChunk(searchTerm, chunkSize, offset, dateStart, dateEnd);

      case 'europepmc':
        return await fetchEuropePMCChunk(searchTerm, chunkSize, offset, dateStart, dateEnd);

      case 'semanticscholar':
        return await fetchSemanticScholarChunk(searchTerm, chunkSize, offset);

      case 'biorxiv':
        return await fetchBioRxivChunk(searchTerm, chunkSize, offset, dateStart, dateEnd);

      default:
        console.log(`[Scanner] Unknown source: ${source}`);
        return { items: [], hasMore: false, error: `Unknown source: ${source}` };
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error(`[Scanner] Error fetching from ${source}:`, errorMsg);
    return { items: [], hasMore: false, error: errorMsg };
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
  // Build date filter - PubMed uses YYYY/MM/DD format
  let dateFilter = '';
  if (dateStart) {
    // Parse date strings directly without Date object to avoid timezone issues
    const startParts = dateStart.split('T')[0].split('-');
    const endDate = dateEnd ? dateEnd.split('T')[0] : new Date().toISOString().split('T')[0];
    const endParts = endDate.split('-');
    dateFilter = ` AND ("${startParts[0]}/${startParts[1]}/${startParts[2]}"[PDat] : "${endParts[0]}/${endParts[1]}/${endParts[2]}"[PDat])`;
  }

  const fullQuery = `${searchTerm}${dateFilter}`;
  const searchParams = new URLSearchParams({
    db: 'pubmed',
    term: fullQuery,
    retmax: String(limit),
    retstart: String(offset),
    retmode: 'json',
    sort: 'date'
  });

  const searchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?${searchParams}`;
  console.log(`[PubMed] Search URL: ${searchUrl}`);

  const searchResponse = await fetch(searchUrl);

  if (!searchResponse.ok) {
    const errorText = await searchResponse.text();
    console.error(`[PubMed] Search failed: ${searchResponse.status}`, errorText);
    throw new Error(`PubMed search failed: ${searchResponse.status}`);
  }

  const searchData = await searchResponse.json();
  const ids = searchData.esearchresult?.idlist || [];
  const totalCount = parseInt(searchData.esearchresult?.count || '0');

  console.log(`[PubMed] Query "${fullQuery}" returned ${ids.length} IDs (total: ${totalCount})`);

  if (ids.length === 0) {
    // Check if there was an error in the response
    if (searchData.esearchresult?.errorlist) {
      console.error(`[PubMed] Search errors:`, searchData.esearchresult.errorlist);
    }
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
        pmid: id, // PubMed ID for cross-source deduplication
        sourceId: id,
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
  // ClinicalTrials.gov API v2 doesn't support numeric offsets - only page tokens
  // For now, we'll just fetch the first page on offset=0 and skip otherwise
  // TODO: Implement proper cursor-based pagination by storing nextPageToken
  if (offset > 0) {
    console.log(`[ClinicalTrials] Skipping pagination (offset=${offset}) - cursor pagination not implemented`);
    return { items: [], hasMore: false };
  }

  const params = new URLSearchParams({
    'query.term': searchTerm,
    'filter.overallStatus': 'COMPLETED',
    'sort': 'LastUpdatePostDate:desc',
    'pageSize': String(limit)
  });

  const url = `https://clinicaltrials.gov/api/v2/studies?${params}`;
  console.log(`[ClinicalTrials] Search URL: ${url}`);

  const response = await fetch(url);

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[ClinicalTrials] Failed: ${response.status}`, errorText);
    throw new Error(`ClinicalTrials.gov failed: ${response.status}`);
  }

  const data = await response.json();
  const studies = data.studies || [];
  console.log(`[ClinicalTrials] Found ${studies.length} studies`);

  const items: ResearchItem[] = [];

  for (const study of studies) {
    const protocol = study.protocolSection;
    const title = protocol?.identificationModule?.officialTitle || protocol?.identificationModule?.briefTitle;

    if (title) {
      const nctId = protocol?.identificationModule?.nctId;

      // Extract conditions from ClinicalTrials.gov conditionsModule
      const rawTerms: RawTerm[] = [];

      // Add conditions (primary conditions studied)
      const conditions = protocol?.conditionsModule?.conditions || [];
      for (const condition of conditions) {
        if (condition) {
          rawTerms.push({
            source: 'ctgov',
            term: condition,
            confidence: 1.0, // Primary conditions have high confidence
            isHealthRelated: true
          });
        }
      }

      // Add keywords if available
      const keywords = protocol?.conditionsModule?.keywords || [];
      for (const keyword of keywords) {
        if (keyword) {
          rawTerms.push({
            source: 'keyword',
            term: keyword,
            confidence: 0.9,
            isHealthRelated: true
          });
        }
      }

      // Add interventions (what's being studied) - useful for cannabinoid detection
      const interventions = protocol?.armsInterventionsModule?.interventions || [];
      for (const intervention of interventions) {
        if (intervention?.name) {
          rawTerms.push({
            source: 'ctgov',
            term: intervention.name,
            confidence: 0.8,
            isHealthRelated: true,
            metadata: {
              type: 'intervention',
              interventionType: intervention.type
            }
          });
        }
      }

      items.push({
        title,
        authors: protocol?.contactsLocationsModule?.overallOfficials?.map((o: any) => o.name).join(', '),
        publication: 'ClinicalTrials.gov',
        year: new Date(protocol?.statusModule?.lastUpdatePostDateStruct?.date).getFullYear() || new Date().getFullYear(),
        abstract: protocol?.descriptionModule?.briefSummary,
        url: `https://clinicaltrials.gov/study/${nctId}`,
        sourceId: nctId, // NCT ID for tracking
        source_site: 'ClinicalTrials.gov',
        search_term_matched: searchTerm,
        rawTerms: rawTerms.length > 0 ? rawTerms : undefined
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
  // Build date filter - PMC uses YYYY/MM/DD format
  let dateFilter = '';
  if (dateStart) {
    const startParts = dateStart.split('T')[0].split('-');
    const endDate = dateEnd ? dateEnd.split('T')[0] : new Date().toISOString().split('T')[0];
    const endParts = endDate.split('-');
    dateFilter = ` AND ("${startParts[0]}/${startParts[1]}/${startParts[2]}"[PDat] : "${endParts[0]}/${endParts[1]}/${endParts[2]}"[PDat])`;
  }

  const fullQuery = `${searchTerm}${dateFilter}`;
  const searchParams = new URLSearchParams({
    db: 'pmc',
    term: fullQuery,
    retmax: String(limit),
    retstart: String(offset),
    retmode: 'json'
  });

  const searchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?${searchParams}`;
  console.log(`[PMC] Search URL: ${searchUrl}`);

  const searchResponse = await fetch(searchUrl);

  if (!searchResponse.ok) {
    const errorText = await searchResponse.text();
    console.error(`[PMC] Search failed: ${searchResponse.status}`, errorText);
    throw new Error(`PMC search failed: ${searchResponse.status}`);
  }

  const searchData = await searchResponse.json();
  const ids = searchData.esearchresult?.idlist || [];
  const totalCount = parseInt(searchData.esearchresult?.count || '0');

  console.log(`[PMC] Query "${fullQuery}" returned ${ids.length} IDs (total: ${totalCount})`);

  if (ids.length === 0) {
    if (searchData.esearchresult?.errorlist) {
      console.error(`[PMC] Search errors:`, searchData.esearchresult.errorlist);
    }
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
      // PMC articles often have a linked PMID
      const linkedPmid = article.articleids?.find((aid: any) => aid.idtype === 'pmid')?.value;

      items.push({
        title: article.title,
        authors: article.authors?.map((a: any) => a.name).join(', '),
        publication: article.source || 'PMC',
        year: parseInt(article.pubdate?.split(' ')[0]) || new Date().getFullYear(),
        url: `https://www.ncbi.nlm.nih.gov/pmc/articles/PMC${id}/`,
        pmcId: `PMC${id}`, // PMC ID for cross-source deduplication
        pmid: linkedPmid, // PMID if available (links to PubMed)
        sourceId: `PMC${id}`,
        source_site: 'PMC',
        search_term_matched: searchTerm
      });
    }
  }

  const hasMore = offset + ids.length < totalCount;
  return { items, hasMore };
}

// Health-related OpenAlex domains (level 0 concepts)
// See: https://docs.openalex.org/api-entities/concepts
const HEALTH_RELATED_DOMAINS = new Set([
  'https://openalex.org/C71924100',  // Medicine
  'https://openalex.org/C86803240',  // Biology
  'https://openalex.org/C185592680', // Chemistry
  'https://openalex.org/C142362112', // Biochemistry
  'https://openalex.org/C54355233',  // Psychology
  'https://openalex.org/C126322002', // Neuroscience
  'https://openalex.org/C55493867',  // Pharmacology
]);

// Fetch from OpenAlex (250M+ works, excellent DOI/PMID coverage)
async function fetchOpenAlexChunk(
  searchTerm: string,
  limit: number,
  offset: number,
  dateStart: string | null,
  dateEnd: string | null
): Promise<{ items: ResearchItem[]; hasMore: boolean }> {
  // Build date filter if provided - OpenAlex uses from_publication_date and to_publication_date
  let dateFilter = '';
  if (dateStart) {
    const start = dateStart.split('T')[0];
    const end = dateEnd ? dateEnd.split('T')[0] : new Date().toISOString().split('T')[0];
    dateFilter = `,from_publication_date:${start},to_publication_date:${end}`;
  }

  // Request concepts field to capture professional taxonomy terms
  const url = `https://api.openalex.org/works?filter=title.search:${encodeURIComponent(searchTerm)}${dateFilter}&per-page=${limit}&page=${Math.floor(offset / limit) + 1}&select=id,title,authorships,publication_year,abstract_inverted_index,primary_location,ids,doi,concepts,keywords&mailto=admin@cbdportal.com`;

  const response = await fetch(url, {
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'CBD-Portal-Scanner/1.0 (mailto:admin@cbdportal.com)'
    }
  });

  if (!response.ok) {
    throw new Error(`OpenAlex failed: ${response.status}`);
  }

  const data = await response.json();
  const works = data.results || [];
  const items: ResearchItem[] = [];

  for (const work of works) {
    if (work.title) {
      // Extract PMID and PMC ID from external IDs
      const pmid = work.ids?.pmid?.replace('https://pubmed.ncbi.nlm.nih.gov/', '');
      const pmcId = work.ids?.pmcid?.replace('https://www.ncbi.nlm.nih.gov/pmc/articles/', '');

      // Extract OpenAlex concepts as raw terms
      const rawTerms: RawTerm[] = [];

      // Add concepts (OpenAlex's classification system)
      if (work.concepts && Array.isArray(work.concepts)) {
        for (const concept of work.concepts) {
          // Filter: only include concepts with score >= 0.3 to reduce noise
          if (concept.score >= 0.3 && concept.display_name) {
            // Check if concept is health-related by checking ancestors
            const ancestors = concept.ancestors || [];
            const isHealthRelated = ancestors.some((a: any) =>
              HEALTH_RELATED_DOMAINS.has(a.id)
            ) || HEALTH_RELATED_DOMAINS.has(concept.id);

            rawTerms.push({
              source: 'openalex',
              term: concept.display_name,
              termId: concept.id?.replace('https://openalex.org/', ''),
              confidence: concept.score,
              isHealthRelated,
              metadata: {
                level: concept.level,
                wikidata: concept.wikidata,
                ancestors: ancestors.map((a: any) => a.display_name)
              }
            });
          }
        }
      }

      // Add author keywords if available
      if (work.keywords && Array.isArray(work.keywords)) {
        for (const keyword of work.keywords) {
          if (keyword.display_name) {
            rawTerms.push({
              source: 'keyword',
              term: keyword.display_name,
              termId: keyword.id?.replace('https://openalex.org/', ''),
              confidence: keyword.score || 1.0,
              isHealthRelated: true // Assume keywords are relevant
            });
          }
        }
      }

      items.push({
        title: work.title,
        authors: work.authorships?.slice(0, 5).map((a: any) => a.author?.display_name).filter(Boolean).join(', '),
        publication: work.primary_location?.source?.display_name || 'OpenAlex',
        year: work.publication_year,
        abstract: work.abstract_inverted_index ? reconstructAbstract(work.abstract_inverted_index) : undefined,
        url: work.id || work.doi || `https://openalex.org/works/${work.id?.split('/').pop()}`,
        doi: work.doi?.replace('https://doi.org/', ''),
        pmid: pmid,
        pmcId: pmcId,
        sourceId: work.id?.split('/').pop(),
        source_site: 'OpenAlex',
        search_term_matched: searchTerm,
        rawTerms: rawTerms.length > 0 ? rawTerms : undefined
      });
    }
  }

  const totalCount = data.meta?.count || 0;
  const hasMore = offset + works.length < totalCount;
  return { items, hasMore };
}

// Helper to reconstruct abstract from OpenAlex inverted index format
function reconstructAbstract(invertedIndex: Record<string, number[]>): string {
  if (!invertedIndex) return '';

  const words: [string, number][] = [];
  for (const [word, positions] of Object.entries(invertedIndex)) {
    for (const pos of positions) {
      words.push([word, pos]);
    }
  }

  words.sort((a, b) => a[1] - b[1]);
  return words.map(w => w[0]).join(' ');
}

// Fetch from Europe PMC (European biomedical literature)
async function fetchEuropePMCChunk(
  searchTerm: string,
  limit: number,
  offset: number,
  dateStart: string | null,
  dateEnd: string | null
): Promise<{ items: ResearchItem[]; hasMore: boolean }> {
  // Build date filter
  let dateQuery = '';
  if (dateStart) {
    const start = dateStart.split('T')[0].replace(/-/g, '');
    const end = dateEnd ? dateEnd.split('T')[0].replace(/-/g, '') : new Date().toISOString().split('T')[0].replace(/-/g, '');
    dateQuery = ` AND (FIRST_PDATE:[${start} TO ${end}])`;
  }

  const query = encodeURIComponent(`${searchTerm}${dateQuery}`);
  const url = `https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=${query}&format=json&pageSize=${limit}&cursorMark=*&resultType=core`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Europe PMC failed: ${response.status}`);
  }

  const data = await response.json();
  const results = data.resultList?.result || [];
  const items: ResearchItem[] = [];

  for (const article of results) {
    if (article.title) {
      // Extract MeSH terms from Europe PMC
      const rawTerms: RawTerm[] = [];

      // Add MeSH descriptors if available
      if (article.meshHeadingList?.meshHeading) {
        for (const mesh of article.meshHeadingList.meshHeading) {
          if (mesh.descriptorName) {
            rawTerms.push({
              source: 'mesh',
              term: mesh.descriptorName,
              termId: mesh.meshId || undefined,
              confidence: mesh.majorTopic_YN === 'Y' ? 1.0 : 0.8,
              isHealthRelated: true,
              metadata: {
                majorTopic: mesh.majorTopic_YN === 'Y',
                qualifiers: mesh.meshQualifierList?.meshQualifier?.map((q: any) => q.qualifierName) || []
              }
            });
          }
        }
      }

      // Add keywords if available
      if (article.keywordList?.keyword) {
        for (const keyword of article.keywordList.keyword) {
          if (keyword) {
            rawTerms.push({
              source: 'keyword',
              term: keyword,
              confidence: 0.9,
              isHealthRelated: true
            });
          }
        }
      }

      // Add chemical substances if available (useful for cannabinoid detection)
      if (article.chemicalList?.chemical) {
        for (const chemical of article.chemicalList.chemical) {
          if (chemical.name) {
            rawTerms.push({
              source: 'mesh',
              term: chemical.name,
              termId: chemical.registryNumber || undefined,
              confidence: 0.95,
              isHealthRelated: true,
              metadata: {
                type: 'chemical',
                registryNumber: chemical.registryNumber
              }
            });
          }
        }
      }

      items.push({
        title: article.title,
        authors: article.authorString,
        publication: article.journalTitle || 'Europe PMC',
        year: parseInt(article.pubYear) || new Date().getFullYear(),
        abstract: article.abstractText,
        url: article.fullTextUrlList?.fullTextUrl?.[0]?.url || `https://europepmc.org/article/${article.source}/${article.id}`,
        doi: article.doi,
        pmid: article.pmid,
        pmcId: article.pmcid,
        sourceId: article.id,
        source_site: 'Europe PMC',
        search_term_matched: searchTerm,
        rawTerms: rawTerms.length > 0 ? rawTerms : undefined
      });
    }
  }

  const totalCount = data.hitCount || 0;
  const hasMore = offset + results.length < totalCount && results.length === limit;
  return { items, hasMore };
}

// Fetch from Semantic Scholar (AI-powered, good for finding related research)
async function fetchSemanticScholarChunk(
  searchTerm: string,
  limit: number,
  offset: number
): Promise<{ items: ResearchItem[]; hasMore: boolean }> {
  // Semantic Scholar has rate limits - 100 requests per 5 minutes for free tier
  const url = `https://api.semanticscholar.org/graph/v1/paper/search?query=${encodeURIComponent(searchTerm)}&offset=${offset}&limit=${limit}&fields=title,authors,year,abstract,externalIds,url,publicationVenue`;

  const response = await fetch(url, {
    headers: {
      'Accept': 'application/json'
    }
  });

  if (!response.ok) {
    if (response.status === 429) {
      console.log('[Scanner] Semantic Scholar rate limited, backing off...');
      await new Promise(r => setTimeout(r, 5000));
      return { items: [], hasMore: true }; // Retry later
    }
    throw new Error(`Semantic Scholar failed: ${response.status}`);
  }

  const data = await response.json();
  const papers = data.data || [];
  const items: ResearchItem[] = [];

  for (const paper of papers) {
    if (paper.title) {
      items.push({
        title: paper.title,
        authors: paper.authors?.slice(0, 5).map((a: any) => a.name).join(', '),
        publication: paper.publicationVenue?.name || 'Semantic Scholar',
        year: paper.year,
        abstract: paper.abstract,
        url: paper.url || `https://www.semanticscholar.org/paper/${paper.paperId}`,
        doi: paper.externalIds?.DOI,
        pmid: paper.externalIds?.PubMed,
        pmcId: paper.externalIds?.PubMedCentral ? `PMC${paper.externalIds.PubMedCentral}` : undefined,
        sourceId: paper.paperId,
        source_site: 'Semantic Scholar',
        search_term_matched: searchTerm
      });
    }
  }

  const totalCount = data.total || 0;
  const hasMore = offset + papers.length < totalCount;
  return { items, hasMore };
}

// Fetch from bioRxiv/medRxiv (preprints - newest research before peer review)
async function fetchBioRxivChunk(
  searchTerm: string,
  limit: number,
  offset: number,
  dateStart: string | null,
  dateEnd: string | null
): Promise<{ items: ResearchItem[]; hasMore: boolean }> {
  // bioRxiv API uses date ranges in URL path
  const start = dateStart ? dateStart.split('T')[0] : '2020-01-01';
  const end = dateEnd ? dateEnd.split('T')[0] : new Date().toISOString().split('T')[0];

  // bioRxiv API: /details/{server}/{interval}/{cursor}
  // We'll use the content API which supports keyword search better
  const url = `https://api.biorxiv.org/details/biorxiv/${start}/${end}/${offset}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`bioRxiv failed: ${response.status}`);
  }

  const data = await response.json();
  const articles = data.collection || [];
  const items: ResearchItem[] = [];

  // Filter by search term since bioRxiv API doesn't support direct keyword filtering
  const searchTermLower = searchTerm.toLowerCase();

  for (const article of articles) {
    const titleLower = (article.title || '').toLowerCase();
    const abstractLower = (article.abstract || '').toLowerCase();

    // Only include if title or abstract contains search term
    if (titleLower.includes(searchTermLower) || abstractLower.includes(searchTermLower)) {
      if (article.title) {
        items.push({
          title: article.title,
          authors: article.authors,
          publication: `${article.server || 'bioRxiv'} (Preprint)`,
          year: new Date(article.date).getFullYear(),
          abstract: article.abstract,
          url: `https://www.biorxiv.org/content/${article.doi}`,
          doi: article.doi,
          sourceId: article.doi,
          source_site: article.server === 'medrxiv' ? 'medRxiv' : 'bioRxiv',
          search_term_matched: searchTerm
        });
      }
    }
  }

  // bioRxiv returns up to 100 items per request
  const hasMore = articles.length >= 100;
  return { items, hasMore };
}

// Process a single item - check duplicate using cross-source deduplication, calculate scores, insert
async function processItem(
  supabase: SupabaseClient,
  item: ResearchItem
): Promise<'added' | 'skipped' | 'rejected'> {
  try {
    // 0. Clean text fields (strip HTML, decode entities, fix years)
    const cleanedTitle = cleanTitle(item.title) || item.title;
    const cleanedAbstract = cleanAbstract(item.abstract);
    const cleanedAuthors = cleanText(item.authors);
    const cleanedPublication = cleanText(item.publication);
    const validatedYear = validateYear(item.year, item.doi, null);

    // 1. Quick check for duplicate by URL first
    const urlCheck = await isUrlDuplicate(supabase, item.url);
    if (urlCheck.isDuplicate) {
      return 'skipped';
    }

    // 2. Cross-source deduplication check (DOI, PMID, PMC ID, fuzzy title)
    const duplicateCheck = await isDuplicate(supabase, {
      title: cleanedTitle,
      doi: item.doi,
      pmid: item.pmid,
      pmcId: item.pmcId,
      year: validatedYear,
      source: item.source_site.toLowerCase().replace(/[^a-z]/g, ''),
      sourceId: item.sourceId
    });

    if (duplicateCheck.isDuplicate && duplicateCheck.existingId) {
      // Update source_ids on existing record to track this source too
      const sourceIds = buildSourceIds(
        item.source_site.toLowerCase().replace(/[^a-z]/g, ''),
        item.sourceId,
        item.pmid,
        item.pmcId,
        item.doi
      );
      await updateSourceIds(supabase, duplicateCheck.existingId, sourceIds);

      console.log(`[Scanner] Duplicate (${duplicateCheck.matchType}): "${cleanedTitle.substring(0, 50)}..."`);
      return 'skipped';
    }

    // 3. Calculate relevance score (use cleaned text)
    const relevance = calculateRelevanceScore({
      title: cleanedTitle,
      abstract: cleanedAbstract || undefined
    });

    // Auto-reject if relevance is too low
    if (relevance.score < 20) {
      return 'rejected';
    }

    // 4. Detect language (use cleaned text)
    const textForLang = `${cleanedTitle} ${cleanedAbstract || ''}`;
    const langResult = detectLanguage(textForLang, cleanedTitle);

    // 5. Calculate topics (use cleaned text)
    const topics = extractTopics({
      ...item,
      title: cleanedTitle,
      abstract: cleanedAbstract
    });

    // 6. Build source_ids for this item
    const sourceIds = buildSourceIds(
      item.source_site.toLowerCase().replace(/[^a-z]/g, ''),
      item.sourceId,
      item.pmid,
      item.pmcId,
      item.doi
    );

    // 7. Insert into kb_research_queue with cleaned data and get the ID back
    const { data: insertedStudy, error } = await supabase
      .from('kb_research_queue')
      .insert({
        title: cleanedTitle,
        authors: cleanedAuthors,
        publication: cleanedPublication,
        year: validatedYear,
        abstract: cleanedAbstract,
        url: item.url,
        doi: normalizeDoi(item.doi),
        pmid: normalizePmid(item.pmid),
        pmc_id: normalizePmcId(item.pmcId),
        source: item.source_site.toLowerCase().replace(/[^a-z]/g, ''),
        source_ids: sourceIds,
        source_site: item.source_site,
        search_term_matched: item.search_term_matched,
        relevance_score: relevance.score,
        relevance_signals: relevance.signals,
        relevant_topics: topics,
        detected_language: langResult.language,
        status: 'pending'
      })
      .select('id')
      .single();

    if (error) {
      if (error.code === '23505') {
        return 'skipped'; // Duplicate constraint (URL, DOI, PMID, or PMC ID)
      }
      console.error('[Scanner] Insert error:', error.message);
      return 'rejected';
    }

    // 8. Store raw terms in study_raw_terms table for Condition Intelligence System
    if (insertedStudy?.id && item.rawTerms && item.rawTerms.length > 0) {
      await storeRawTerms(supabase, insertedStudy.id, item.rawTerms);

      // 9. Resolve terms to conditions immediately
      try {
        await resolveStudyById(supabase, insertedStudy.id);
      } catch (resolveError) {
        // Don't fail the insert if resolution fails - can be retried later
        console.error(`[Scanner] Failed to resolve conditions for ${insertedStudy.id}:`, resolveError);
      }
    }

    return 'added';
  } catch (error) {
    console.error('[Scanner] Process item error:', error);
    return 'rejected';
  }
}

// Store raw terms captured from professional taxonomies
async function storeRawTerms(
  supabase: SupabaseClient,
  studyId: string,
  rawTerms: RawTerm[]
): Promise<void> {
  if (rawTerms.length === 0) return;

  // Deduplicate terms by source + lowercase term before inserting
  const seen = new Set<string>();
  const uniqueTerms = rawTerms.filter(term => {
    const key = `${term.source}:${term.term.toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Prepare batch insert data
  const termsToInsert = uniqueTerms.map(term => ({
    study_id: studyId,
    source: term.source,
    term: term.term,
    term_id: term.termId || null,
    confidence: term.confidence ?? 1.0,
    is_health_related: term.isHealthRelated ?? true,
    metadata: term.metadata || null
  }));

  // Insert in batches of 50 to avoid hitting limits
  const BATCH_SIZE = 50;
  for (let i = 0; i < termsToInsert.length; i += BATCH_SIZE) {
    const batch = termsToInsert.slice(i, i + BATCH_SIZE);

    // Use insert with ignoreDuplicates - PostgreSQL unique index will prevent duplicates
    const { error } = await supabase
      .from('study_raw_terms')
      .insert(batch);

    if (error) {
      // 23505 is unique constraint violation - expected for duplicates
      if (error.code !== '23505') {
        console.error(`[Scanner] Failed to store raw terms for study ${studyId}:`, error.message);
      }
      // For duplicates or other errors, try inserting one by one
      for (const term of batch) {
        await supabase.from('study_raw_terms').insert(term);
      }
    }
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
