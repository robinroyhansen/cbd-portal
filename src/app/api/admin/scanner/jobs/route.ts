import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export interface ScannerJob {
  id: string;
  status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled' | 'cancelling' | 'paused';
  sources: string[];
  search_terms: string[];
  date_range_start: string | null;
  date_range_end: string | null;
  chunk_size: number;
  delay_ms: number;

  // Progress tracking
  current_source_index: number;
  current_year: number | null;
  current_page: number;
  items_found: number;
  items_added: number;
  items_skipped: number;
  items_rejected: number;

  // Checkpoint for resumption
  checkpoint: Record<string, any> | null;

  // Timestamps
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;

  // Error tracking
  error_message: string | null;
  last_error_at: string | null;
}

// GET - List all scan jobs
export async function GET(request: NextRequest) {
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
      // Table might not exist yet
      if (error.code === '42P01') {
        return NextResponse.json({
          jobs: [],
          message: 'Scanner jobs table not created yet. Run the migration first.',
          migrationNeeded: true
        });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      jobs: jobs || [],
      count: jobs?.length || 0
    });

  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// POST - Create a new scan job
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));

    const {
      sources = ['pubmed'],
      searchTerms = ['CBD', 'cannabidiol'],
      dateRangeStart = null,
      dateRangeEnd = null,
      chunkSize = 50,
      delayMs = 1000
    } = body;

    // Validate inputs
    if (!Array.isArray(sources) || sources.length === 0) {
      return NextResponse.json(
        { error: 'sources must be a non-empty array' },
        { status: 400 }
      );
    }

    if (!Array.isArray(searchTerms) || searchTerms.length === 0) {
      return NextResponse.json(
        { error: 'searchTerms must be a non-empty array' },
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
      .in('status', ['queued', 'running'])
      .limit(1);

    if (activeJobs && activeJobs.length > 0) {
      return NextResponse.json({
        error: 'A scan job is already in progress',
        existingJobId: activeJobs[0].id,
        existingStatus: activeJobs[0].status
      }, { status: 409 });
    }

    // Create the job
    const { data: job, error } = await supabase
      .from('kb_scan_jobs')
      .insert({
        status: 'queued',
        sources,
        search_terms: searchTerms,
        date_range_start: dateRangeStart,
        date_range_end: dateRangeEnd,
        chunk_size: Math.min(chunkSize, 100), // Cap at 100
        delay_ms: Math.max(delayMs, 500), // Minimum 500ms
        current_source_index: 0,
        current_year: null,
        current_page: 0,
        items_found: 0,
        items_added: 0,
        items_skipped: 0,
        items_rejected: 0,
        checkpoint: null
      })
      .select()
      .single();

    if (error) {
      // Table might not exist
      if (error.code === '42P01') {
        return NextResponse.json({
          error: 'Scanner jobs table does not exist. Please run the migration.',
          migrationSQL: getMigrationSQL()
        }, { status: 500 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      job,
      message: 'Scan job created. Call /api/admin/scanner/process to start processing.'
    });

  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

function getMigrationSQL(): string {
  return `
-- Create kb_scan_jobs table
CREATE TABLE IF NOT EXISTS kb_scan_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'running', 'completed', 'failed', 'cancelled', 'cancelling', 'paused')),

  -- Configuration
  sources TEXT[] NOT NULL DEFAULT ARRAY['pubmed'],
  search_terms TEXT[] NOT NULL DEFAULT ARRAY['CBD', 'cannabidiol'],
  date_range_start DATE,
  date_range_end DATE,
  chunk_size INTEGER NOT NULL DEFAULT 50,
  delay_ms INTEGER NOT NULL DEFAULT 1000,

  -- Progress tracking
  current_source_index INTEGER NOT NULL DEFAULT 0,
  current_year INTEGER,
  current_page INTEGER NOT NULL DEFAULT 0,
  items_found INTEGER NOT NULL DEFAULT 0,
  items_added INTEGER NOT NULL DEFAULT 0,
  items_skipped INTEGER NOT NULL DEFAULT 0,
  items_rejected INTEGER NOT NULL DEFAULT 0,

  -- Checkpoint for resumption
  checkpoint JSONB,

  -- Timestamps
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Error tracking
  error_message TEXT,
  last_error_at TIMESTAMPTZ
);

-- Index for finding active jobs
CREATE INDEX IF NOT EXISTS idx_kb_scan_jobs_status ON kb_scan_jobs(status);
CREATE INDEX IF NOT EXISTS idx_kb_scan_jobs_created_at ON kb_scan_jobs(created_at DESC);
`;
}
