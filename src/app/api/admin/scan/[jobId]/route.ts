import { NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/admin-api-auth';
import { createClient } from '@supabase/supabase-js';
import { getScanJob, updateScanJobProgress } from '@/lib/research-scanner';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
  const authError = requireAdminAuth(request);
  if (authError) return authError;
const { jobId } = await params;

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const job = await getScanJob(supabase, jobId);

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    return NextResponse.json({ job });

  } catch (error) {
    console.error('Failed to get scan job:', error);
    return NextResponse.json({
      error: 'Failed to get scan job',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Cancel a running scan
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
  const authError = requireAdminAuth(request);
  if (authError) return authError;
const { jobId } = await params;

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const job = await getScanJob(supabase, jobId);

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    if (job.status !== 'running' && job.status !== 'pending') {
      return NextResponse.json({
        error: 'Job cannot be cancelled',
        status: job.status
      }, { status: 400 });
    }

    await updateScanJobProgress(supabase, jobId, {
      status: 'cancelled',
      completed_at: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      message: 'Scan cancelled'
    });

  } catch (error) {
    console.error('Failed to cancel scan:', error);
    return NextResponse.json({
      error: 'Failed to cancel scan',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
