import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  cleanTitle,
  cleanAbstract,
  cleanText,
  validateYear
} from '@/lib/utils/text-cleanup';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface ResearchQueueRecord {
  id: string;
  title: string;
  abstract: string | null;
  authors: string | null;
  publication: string | null;
  year: number | null;
  doi: string | null;
}

/**
 * POST /api/admin/scanner/cleanup
 *
 * Cleans existing records in kb_research_queue:
 * - Strips HTML tags from titles and abstracts
 * - Decodes HTML entities
 * - Validates and corrects years using DOI
 *
 * Query params:
 * - batchSize: Number of records to process per batch (default: 100)
 * - dryRun: If "true", shows what would change without updating (default: false)
 */
export async function POST(request: Request) {
  const url = new URL(request.url);
  const batchSize = parseInt(url.searchParams.get('batchSize') || '100', 10);
  const dryRun = url.searchParams.get('dryRun') === 'true';

  try {
    // Get total count first
    const { count: totalCount } = await supabase
      .from('kb_research_queue')
      .select('*', { count: 'exact', head: true });

    let processed = 0;
    let updated = 0;
    let offset = 0;
    const changes: Array<{
      id: string;
      field: string;
      before: string | number | null;
      after: string | number | null;
    }> = [];

    // Process in batches
    while (true) {
      const { data: records, error } = await supabase
        .from('kb_research_queue')
        .select('id, title, abstract, authors, publication, year, doi')
        .range(offset, offset + batchSize - 1)
        .order('created_at', { ascending: true });

      if (error) {
        throw new Error(`Failed to fetch records: ${error.message}`);
      }

      if (!records || records.length === 0) {
        break;
      }

      for (const record of records as ResearchQueueRecord[]) {
        processed++;

        // Clean fields
        const cleanedTitle = cleanTitle(record.title);
        const cleanedAbstract = cleanAbstract(record.abstract);
        const cleanedAuthors = cleanText(record.authors);
        const cleanedPublication = cleanText(record.publication);
        const validatedYear = validateYear(record.year, record.doi, null);

        // Check what changed
        const updates: Record<string, string | number | null> = {};

        if (cleanedTitle !== record.title && cleanedTitle !== null) {
          changes.push({
            id: record.id,
            field: 'title',
            before: record.title?.substring(0, 100) || null,
            after: cleanedTitle?.substring(0, 100) || null
          });
          updates.title = cleanedTitle;
        }

        if (cleanedAbstract !== record.abstract) {
          if (record.abstract && cleanedAbstract && record.abstract !== cleanedAbstract) {
            changes.push({
              id: record.id,
              field: 'abstract',
              before: record.abstract?.substring(0, 100) || null,
              after: cleanedAbstract?.substring(0, 100) || null
            });
          }
          updates.abstract = cleanedAbstract;
        }

        if (cleanedAuthors !== record.authors) {
          if (record.authors && cleanedAuthors && record.authors !== cleanedAuthors) {
            changes.push({
              id: record.id,
              field: 'authors',
              before: record.authors?.substring(0, 100) || null,
              after: cleanedAuthors?.substring(0, 100) || null
            });
          }
          updates.authors = cleanedAuthors;
        }

        if (cleanedPublication !== record.publication) {
          if (record.publication && cleanedPublication && record.publication !== cleanedPublication) {
            changes.push({
              id: record.id,
              field: 'publication',
              before: record.publication?.substring(0, 100) || null,
              after: cleanedPublication?.substring(0, 100) || null
            });
          }
          updates.publication = cleanedPublication;
        }

        if (validatedYear !== record.year) {
          changes.push({
            id: record.id,
            field: 'year',
            before: record.year,
            after: validatedYear
          });
          updates.year = validatedYear;
        }

        // Apply updates if there are any and not a dry run
        if (Object.keys(updates).length > 0) {
          updated++;

          if (!dryRun) {
            const { error: updateError } = await supabase
              .from('kb_research_queue')
              .update(updates)
              .eq('id', record.id);

            if (updateError) {
              console.error(`Failed to update record ${record.id}:`, updateError);
            }
          }
        }
      }

      offset += batchSize;

      // Safety check to prevent infinite loops
      if (offset > (totalCount || 0) + batchSize) {
        break;
      }
    }

    // Group changes by field for summary
    const changesByField = changes.reduce((acc, change) => {
      acc[change.field] = (acc[change.field] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({
      success: true,
      dryRun,
      stats: {
        totalRecords: totalCount || 0,
        processed,
        recordsUpdated: updated,
        changesByField
      },
      // Only include sample changes to avoid huge response
      sampleChanges: changes.slice(0, 20),
      message: dryRun
        ? `Dry run complete. Would update ${updated} records.`
        : `Cleanup complete. Updated ${updated} records.`
    });
  } catch (error) {
    console.error('Cleanup error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Cleanup failed'
    }, { status: 500 });
  }
}

/**
 * GET /api/admin/scanner/cleanup
 *
 * Returns info about the cleanup endpoint
 */
export async function GET() {
  // Get count of records that might need cleaning
  const { count: totalCount } = await supabase
    .from('kb_research_queue')
    .select('*', { count: 'exact', head: true });

  return NextResponse.json({
    endpoint: '/api/admin/scanner/cleanup',
    description: 'Cleans HTML entities and validates years in existing research queue records',
    methods: {
      POST: {
        description: 'Run the cleanup process',
        params: {
          batchSize: 'Number of records per batch (default: 100)',
          dryRun: 'Set to "true" to preview changes without applying (default: false)'
        },
        examples: [
          'POST /api/admin/scanner/cleanup?dryRun=true',
          'POST /api/admin/scanner/cleanup?batchSize=50'
        ]
      }
    },
    currentStats: {
      totalRecords: totalCount || 0
    }
  });
}
