import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const maxDuration = 240; // 4 minutes to allow for cleanup and self-scheduling

// GET /api/admin/scan-jobs/[id] - Get job status and progress
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const jobId = params.id;

    if (!jobId || typeof jobId !== 'string') {
      return NextResponse.json(
        { error: 'Invalid job ID' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get job with source progress and recent events
    const { data: job, error: jobError } = await supabase
      .from('kb_scan_jobs')
      .select(`
        *,
        kb_scan_source_progress (*),
        kb_scan_progress_events (
          event_type,
          source_name,
          search_term,
          item_title,
          timestamp
        )
      `)
      .eq('id', jobId)
      .single();

    if (jobError) {
      if (jobError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Job not found' },
          { status: 404 }
        );
      }
      console.error('Error fetching job:', jobError);
      return NextResponse.json(
        { error: 'Failed to fetch job details' },
        { status: 500 }
      );
    }

    // Transform to camelCase and structure response
    return NextResponse.json({
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
      errorMessage: job.error_message,
      estimatedDurationMinutes: job.estimated_duration_minutes,
      startedAt: job.started_at,
      completedAt: job.completed_at,
      createdAt: job.created_at,
      createdBy: job.created_by,
      sourceProgress: job.kb_scan_source_progress.map((sp: any) => ({
        id: sp.id,
        sourceName: sp.source_name,
        searchTerms: sp.search_terms,
        termsCompleted: sp.terms_completed,
        totalTerms: sp.total_terms,
        itemsFound: sp.items_found,
        status: sp.status,
        startedAt: sp.started_at,
        completedAt: sp.completed_at,
        errorMessage: sp.error_message
      })),
      recentEvents: job.kb_scan_progress_events
        .sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 10)
        .map((event: any) => ({
          eventType: event.event_type,
          sourceName: event.source_name,
          searchTerm: event.search_term,
          itemTitle: event.item_title,
          timestamp: event.timestamp
        }))
    });

  } catch (error) {
    console.error('Error in GET /api/admin/scan-jobs/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/scan-jobs/[id] - Update job status (cancel, retry, etc.)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const jobId = params.id;
    const { action } = await request.json();

    if (!jobId || typeof jobId !== 'string') {
      return NextResponse.json(
        { error: 'Invalid job ID' },
        { status: 400 }
      );
    }

    if (!['cancel', 'retry', 'pause', 'resume'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be: cancel, retry, pause, resume' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get current job status
    const { data: currentJob, error: fetchError } = await supabase
      .from('kb_scan_jobs')
      .select('status')
      .eq('id', jobId)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Job not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to fetch job' },
        { status: 500 }
      );
    }

    let newStatus: string;
    let errorMessage: string | null = null;

    switch (action) {
      case 'cancel':
        if (currentJob.status === 'completed') {
          return NextResponse.json(
            { error: 'Cannot cancel completed job' },
            { status: 400 }
          );
        }
        newStatus = 'cancelled';
        break;

      case 'retry':
        if (!['failed', 'cancelled'].includes(currentJob.status)) {
          return NextResponse.json(
            { error: 'Can only retry failed or cancelled jobs' },
            { status: 400 }
          );
        }
        newStatus = 'queued';
        errorMessage = null; // Clear any previous error
        break;

      case 'pause':
        if (currentJob.status !== 'running') {
          return NextResponse.json(
            { error: 'Can only pause running jobs' },
            { status: 400 }
          );
        }
        // Note: Pause functionality would require more complex implementation
        // For now, we'll just mark it as cancelled
        newStatus = 'cancelled';
        break;

      case 'resume':
        if (currentJob.status !== 'cancelled') {
          return NextResponse.json(
            { error: 'Can only resume cancelled jobs' },
            { status: 400 }
          );
        }
        newStatus = 'queued';
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    // Update job status
    const { error: updateError } = await supabase
      .from('kb_scan_jobs')
      .update({
        status: newStatus,
        error_message: errorMessage
      })
      .eq('id', jobId);

    if (updateError) {
      console.error('Error updating job status:', updateError);
      return NextResponse.json(
        { error: 'Failed to update job status' },
        { status: 500 }
      );
    }

    // If retrying or resuming, trigger processing
    if (['retry', 'resume'].includes(action)) {
      fetch(`${request.nextUrl.origin}/api/admin/scan-jobs/${jobId}/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }).catch(error => {
        console.error('Error restarting job processing:', error);
      });
    }

    return NextResponse.json({
      success: true,
      action,
      newStatus,
      message: `Job ${action}ed successfully`
    });

  } catch (error) {
    console.error('Error in PUT /api/admin/scan-jobs/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/scan-jobs/[id] - Delete a specific job and all related data
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const jobId = params.id;

    if (!jobId || typeof jobId !== 'string') {
      return NextResponse.json(
        { error: 'Invalid job ID' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Check if job exists and is not currently running
    const { data: job, error: fetchError } = await supabase
      .from('kb_scan_jobs')
      .select('status')
      .eq('id', jobId)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Job not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to fetch job' },
        { status: 500 }
      );
    }

    if (job.status === 'running') {
      return NextResponse.json(
        { error: 'Cannot delete running job. Cancel it first.' },
        { status: 400 }
      );
    }

    // Delete job (cascading deletes will handle related records)
    const { error: deleteError } = await supabase
      .from('kb_scan_jobs')
      .delete()
      .eq('id', jobId);

    if (deleteError) {
      console.error('Error deleting job:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete job' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Job deleted successfully'
    });

  } catch (error) {
    console.error('Error in DELETE /api/admin/scan-jobs/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}