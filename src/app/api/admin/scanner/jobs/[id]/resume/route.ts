import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAdminAuth } from '@/lib/admin-api-auth';

// POST - Resume a paused or failed job
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Require admin authentication
  const authError = requireAdminAuth(request);
  if (authError) return authError;

  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get current job status
    const { data: job, error: fetchError } = await supabase
      .from('kb_scan_jobs')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Job not found' }, { status: 404 });
      }
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    // Check if job can be resumed
    const resumableStatuses = ['paused', 'failed'];
    if (!resumableStatuses.includes(job.status)) {
      return NextResponse.json({
        error: `Cannot resume job with status '${job.status}'`,
        allowedStatuses: resumableStatuses,
        hint: job.status === 'completed' ? 'Job already completed. Create a new job instead.' :
              job.status === 'cancelled' ? 'Job was cancelled. Create a new job instead.' :
              job.status === 'running' ? 'Job is already running.' :
              job.status === 'queued' ? 'Job is already queued.' : undefined
      }, { status: 400 });
    }

    // Check if there's already an active job
    const { data: activeJobs } = await supabase
      .from('kb_scan_jobs')
      .select('id, status')
      .in('status', ['queued', 'running'])
      .neq('id', id)
      .limit(1);

    if (activeJobs && activeJobs.length > 0) {
      return NextResponse.json({
        error: 'Another job is already active',
        activeJobId: activeJobs[0].id,
        activeJobStatus: activeJobs[0].status
      }, { status: 409 });
    }

    // Calculate how long the job was paused (if applicable)
    const pauseDuration = job.paused_at
      ? Math.round((Date.now() - new Date(job.paused_at).getTime()) / 1000)
      : null;

    // Resume the job by setting status back to 'queued'
    const { data: updatedJob, error: updateError } = await supabase
      .from('kb_scan_jobs')
      .update({
        status: 'queued',
        error_message: null,
        paused_at: null, // Clear paused timestamp
        updated_at: new Date().toISOString()
        // Note: We keep resume_state intact so the processor knows where to continue
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Job resumed. Call /api/admin/scanner/process to continue processing.',
      job: updatedJob,
      resumePoint: {
        sourceIndex: job.current_source_index,
        source: job.sources?.[job.current_source_index] || job.current_source,
        itemsFound: job.items_found,
        itemsAdded: job.items_added
      },
      pauseDuration: pauseDuration ? `${pauseDuration} seconds` : null,
      resumeState: job.resume_state || null
    });

  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
