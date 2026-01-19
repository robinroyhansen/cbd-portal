import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAdminAuth } from '@/lib/admin-api-auth';

// Interface matching actual kb_scan_jobs table schema
export interface ScannerJob {
  id: string;
  status: 'pending' | 'queued' | 'running' | 'completed' | 'failed' | 'cancelled' | 'cancelling' | 'paused';
  sources: string[];
  search_terms: string[] | null;
  date_range_start: string | null;
  date_range_end: string | null;
  current_source: string | null;
  current_source_index: number;
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

// GET - List all scan jobs
export async function GET(request: NextRequest) {
  // Require admin authentication
  const authError = requireAdminAuth(request);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    let query = supabase
      .from('kb_scan_jobs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (status) {
      query = query.eq('status', status);
    }

    const { data: jobs, error } = await query;

    if (error) {
      if (error.code === '42P01') {
        return NextResponse.json({
          jobs: [],
          message: 'Scanner jobs table not created yet.',
          migrationNeeded: true
        });
      }
      console.error('[Scanner Jobs GET] Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      jobs: jobs || [],
      count: jobs?.length || 0
    });

  } catch (error) {
    console.error('[Scanner Jobs GET] Exception:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// POST - Create a new scan job
export async function POST(request: NextRequest) {
  // Require admin authentication
  const authError = requireAdminAuth(request);
  if (authError) return authError;

  try {
    const body = await request.json().catch(() => ({}));

    const {
      sources = ['pubmed'],
      searchTerms = ['CBD', 'cannabidiol'],
      dateRangeStart = null,
      dateRangeEnd = null,
    } = body;

    // Validate inputs
    if (!Array.isArray(sources) || sources.length === 0) {
      return NextResponse.json(
        { error: 'sources must be a non-empty array' },
        { status: 400 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Check for existing queued/running jobs
    const { data: activeJobs } = await supabase
      .from('kb_scan_jobs')
      .select('id, status')
      .in('status', ['pending', 'queued', 'running'])
      .limit(1);

    if (activeJobs && activeJobs.length > 0) {
      return NextResponse.json({
        error: 'A scan job is already in progress',
        existingJobId: activeJobs[0].id,
        existingStatus: activeJobs[0].status
      }, { status: 409 });
    }

    // Create the job - only columns that exist in the actual table
    const { data: job, error } = await supabase
      .from('kb_scan_jobs')
      .insert({
        status: 'pending',
        sources: sources,
        search_terms: Array.isArray(searchTerms) && searchTerms.length > 0 ? searchTerms : null,
        date_range_start: dateRangeStart,
        date_range_end: dateRangeEnd,
        current_source_index: 0,
        items_found: 0,
        items_added: 0,
        items_skipped: 0,
        items_rejected: 0
      })
      .select()
      .single();

    if (error) {
      console.error('[Scanner Jobs POST] Insert error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      job,
      message: 'Scan job created. Call /api/admin/scanner/process to start processing.'
    });

  } catch (error) {
    console.error('[Scanner Jobs POST] Exception:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
