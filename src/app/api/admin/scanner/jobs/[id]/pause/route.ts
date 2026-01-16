import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// POST - Pause a running job (can be resumed later)
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

    // Check if job can be paused
    const pausableStatuses = ['queued', 'running'];
    if (!pausableStatuses.includes(job.status)) {
      return NextResponse.json({
        error: `Cannot pause job with status '${job.status}'`,
        allowedStatuses: pausableStatuses,
        hint: job.status === 'paused' ? 'Job is already paused.' :
              job.status === 'completed' ? 'Job already completed.' :
              job.status === 'cancelled' ? 'Job was cancelled.' :
              job.status === 'cancelling' ? 'Job is being cancelled.' :
              job.status === 'failed' ? 'Job failed. Use resume to retry.' : undefined
      }, { status: 400 });
    }

    // Build resume state from current job progress
    // This captures where we left off so we can continue later
    const resumeState = {
      sourceIndex: job.current_source_index,
      currentSource: job.current_source || job.sources?.[job.current_source_index],
      itemsProcessed: job.items_found,
      // Per-source progress (if we have more detailed tracking)
      sources: job.sources?.reduce((acc: Record<string, any>, source: string, idx: number) => {
        acc[source] = {
          completed: idx < job.current_source_index,
          inProgress: idx === job.current_source_index,
          itemsFound: idx < job.current_source_index ? 'completed' :
                      idx === job.current_source_index ? job.items_found : 0
        };
        return acc;
      }, {})
    };

    // Pause the job
    const { data: updatedJob, error: updateError } = await supabase
      .from('kb_scan_jobs')
      .update({
        status: 'paused',
        resume_state: resumeState,
        paused_at: new Date().toISOString(),
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
      message: 'Job paused. Use resume to continue from where you left off.',
      job: updatedJob,
      pausePoint: {
        sourceIndex: job.current_source_index,
        source: job.current_source || job.sources?.[job.current_source_index],
        itemsProcessed: job.items_found
      }
    });

  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
