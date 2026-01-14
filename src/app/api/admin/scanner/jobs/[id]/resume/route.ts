import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// POST - Resume a paused or failed job
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
      .from('scanner_jobs')
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
      .from('scanner_jobs')
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

    // Resume the job by setting status back to 'queued'
    const { data: updatedJob, error: updateError } = await supabase
      .from('scanner_jobs')
      .update({
        status: 'queued',
        error_message: null,
        updated_at: new Date().toISOString()
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
        source: job.sources?.[job.current_source_index],
        page: job.current_page,
        year: job.current_year
      }
    });

  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
