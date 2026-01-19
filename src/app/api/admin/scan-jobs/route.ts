import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const maxDuration = 300; // 5 minutes max for job creation and initial processing

// POST /api/admin/scan-jobs - Create new scan job and start processing
export async function POST(request: NextRequest) {
  try {
    const {
      scanDepth = 'standard',
      selectedSources = ['pubmed', 'clinicaltrials', 'pmc'],
      customKeywords = [],
      scanType = 'manual'
    } = await request.json();

    // Validate input
    if (!Array.isArray(selectedSources) || selectedSources.length === 0) {
      return NextResponse.json(
        { error: 'At least one source must be selected' },
        { status: 400 }
      );
    }

    const validSources = ['pubmed', 'clinicaltrials', 'pmc', 'cochrane', 'jama', 'nature'];
    const invalidSources = selectedSources.filter(source => !validSources.includes(source));
    if (invalidSources.length > 0) {
      return NextResponse.json(
        { error: `Invalid sources: ${invalidSources.join(', ')}` },
        { status: 400 }
      );
    }

    const validDepths = ['quick', 'standard', 'deep', '1year', '2years', '5years', 'comprehensive'];
    if (!validDepths.includes(scanDepth)) {
      return NextResponse.json(
        { error: `Invalid scan depth: ${scanDepth}` },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Create the scan job using our database function
    const { data: jobId, error: jobError } = await supabase
      .rpc('start_scan_job', {
        p_scan_type: scanType,
        p_scan_depth: scanDepth,
        p_selected_sources: selectedSources,
        p_custom_keywords: Array.isArray(customKeywords) ? customKeywords : [],
        p_created_by: 'admin-api' // TODO: Get from auth when available
      });

    if (jobError) {
      console.error('Error creating scan job:', jobError);
      return NextResponse.json(
        { error: 'Failed to create scan job', details: jobError.message },
        { status: 500 }
      );
    }

    console.log(`Created scan job ${jobId} with ${selectedSources.length} sources`);

    // Start processing the first source immediately (non-blocking)
    // This triggers the chunked processing flow
    fetch(`${request.nextUrl.origin}/api/admin/scan-jobs/${jobId}/process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }).catch(error => {
      console.error('Error starting job processing:', error);
    });

    // Return job info immediately
    const { data: job, error: fetchError } = await supabase
      .from('kb_scan_jobs')
      .select(`
        id,
        scan_type,
        scan_depth,
        selected_sources,
        total_sources,
        status,
        progress_percentage,
        estimated_duration_minutes,
        created_at
      `)
      .eq('id', jobId)
      .single();

    if (fetchError) {
      console.error('Error fetching created job:', fetchError);
      return NextResponse.json(
        { error: 'Job created but failed to fetch details' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      job: {
        id: job.id,
        scanType: job.scan_type,
        scanDepth: job.scan_depth,
        selectedSources: job.selected_sources,
        totalSources: job.total_sources,
        status: job.status,
        progressPercentage: job.progress_percentage,
        estimatedDurationMinutes: job.estimated_duration_minutes,
        createdAt: job.created_at
      },
      message: 'Scan job created and processing started'
    });

  } catch (error) {
    console.error('Error in POST /api/admin/scan-jobs:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// GET /api/admin/scan-jobs - List recent scan jobs with optional filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    const supabase = await createClient();

    let query = supabase
      .from('kb_scan_jobs')
      .select(`
        id,
        scan_type,
        scan_depth,
        selected_sources,
        total_sources,
        sources_completed,
        total_items_found,
        items_added,
        items_skipped,
        items_rejected,
        status,
        progress_percentage,
        current_source,
        current_search_term,
        estimated_duration_minutes,
        started_at,
        completed_at,
        created_at,
        created_by
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply status filter if provided
    if (status && ['queued', 'running', 'completed', 'failed', 'cancelled'].includes(status)) {
      query = query.eq('status', status);
    }

    const { data: jobs, error } = await query;

    if (error) {
      console.error('Error fetching scan jobs:', error);
      return NextResponse.json(
        { error: 'Failed to fetch scan jobs' },
        { status: 500 }
      );
    }

    // Get total count for pagination
    let countQuery = supabase
      .from('kb_scan_jobs')
      .select('*', { count: 'exact', head: true });

    if (status && ['queued', 'running', 'completed', 'failed', 'cancelled'].includes(status)) {
      countQuery = countQuery.eq('status', status);
    }

    const { count } = await countQuery;

    // Transform response to camelCase
    const transformedJobs = jobs.map(job => ({
      id: job.id,
      scanType: job.scan_type,
      scanDepth: job.scan_depth,
      selectedSources: job.selected_sources,
      totalSources: job.total_sources,
      sourcesCompleted: job.sources_completed,
      totalItemsFound: job.total_items_found,
      itemsAdded: job.items_added,
      itemsSkipped: job.items_skipped,
      itemsRejected: job.items_rejected,
      status: job.status,
      progressPercentage: job.progress_percentage,
      currentSource: job.current_source,
      currentSearchTerm: job.current_search_term,
      estimatedDurationMinutes: job.estimated_duration_minutes,
      startedAt: job.started_at,
      completedAt: job.completed_at,
      createdAt: job.created_at,
      createdBy: job.created_by
    }));

    return NextResponse.json({
      jobs: transformedJobs,
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (offset + limit) < (count || 0)
      }
    });

  } catch (error) {
    console.error('Error in GET /api/admin/scan-jobs:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/scan-jobs - Cleanup old completed jobs
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const olderThanDays = parseInt(searchParams.get('olderThanDays') || '30');

    if (olderThanDays < 1 || olderThanDays > 365) {
      return NextResponse.json(
        { error: 'olderThanDays must be between 1 and 365' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Use our cleanup function
    const { data: deletedCount, error } = await supabase
      .rpc('cleanup_old_scan_jobs');

    if (error) {
      console.error('Error cleaning up old jobs:', error);
      return NextResponse.json(
        { error: 'Failed to cleanup old jobs' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      deletedCount: deletedCount || 0,
      message: `Cleaned up ${deletedCount || 0} old scan jobs`
    });

  } catch (error) {
    console.error('Error in DELETE /api/admin/scan-jobs:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}