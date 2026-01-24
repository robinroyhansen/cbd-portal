import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/admin-api-auth';
import { createClient } from '@supabase/supabase-js';

// GET - Get single job by ID with full details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
  const authError = requireAdminAuth(request);
  if (authError) return authError;
const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: job, error } = await supabase
      .from('kb_scan_jobs')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Job not found' }, { status: 404 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Calculate progress percentage
    const totalSources = job.sources?.length || 1;
    const currentSourceProgress = job.current_source_index / totalSources;
    const progressPercent = Math.round(currentSourceProgress * 100);

    // Estimated time remaining (rough estimate based on items processed)
    let estimatedSecondsRemaining: number | null = null;
    if (job.status === 'running' && job.started_at) {
      const elapsedMs = Date.now() - new Date(job.started_at).getTime();
      const itemsProcessed = job.items_added + job.items_skipped + job.items_rejected;
      if (itemsProcessed > 0) {
        const msPerItem = elapsedMs / itemsProcessed;
        const remainingItems = (job.items_found - itemsProcessed) * (totalSources - job.current_source_index);
        estimatedSecondsRemaining = Math.round((remainingItems * msPerItem) / 1000);
      }
    }

    return NextResponse.json({
      job,
      progress: {
        percent: progressPercent,
        currentSource: job.sources?.[job.current_source_index] || null,
        sourcesCompleted: job.current_source_index,
        sourcesTotal: totalSources,
        estimatedSecondsRemaining
      },
      stats: {
        found: job.items_found,
        added: job.items_added,
        skipped: job.items_skipped,
        rejected: job.items_rejected,
        total: job.items_added + job.items_skipped + job.items_rejected
      }
    });

  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
