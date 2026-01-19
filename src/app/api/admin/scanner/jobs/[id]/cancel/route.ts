import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAdminAuth } from '@/lib/admin-api-auth';

// POST - Set job status to 'cancelling'
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
      .select('id, status')
      .eq('id', id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Job not found' }, { status: 404 });
      }
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    // Check if job can be cancelled
    const cancellableStatuses = ['queued', 'running', 'paused'];
    if (!cancellableStatuses.includes(job.status)) {
      return NextResponse.json({
        error: `Cannot cancel job with status '${job.status}'`,
        allowedStatuses: cancellableStatuses
      }, { status: 400 });
    }

    // Set status to 'cancelling' - the worker will see this and stop
    const { data: updatedJob, error: updateError } = await supabase
      .from('kb_scan_jobs')
      .update({
        status: 'cancelling',
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
      message: 'Job marked for cancellation. Worker will stop at next checkpoint.',
      job: updatedJob
    });

  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
