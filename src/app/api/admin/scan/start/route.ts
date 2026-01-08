import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createScanJob, getActiveScanJob, runBackgroundScan } from '@/lib/research-scanner';

export const maxDuration = 300; // 5 minutes max for Vercel

export async function POST(request: Request) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Check if there's already an active scan
    const activeJob = await getActiveScanJob(supabase);
    if (activeJob) {
      return NextResponse.json({
        error: 'Scan already in progress',
        jobId: activeJob.id,
        status: activeJob.status
      }, { status: 409 });
    }

    // Parse request body
    const body = await request.json().catch(() => ({}));
    const selectedSources = body?.selectedSources || ['pubmed', 'clinicaltrials', 'pmc'];
    const scanDepth = body?.scanDepth || 'standard';
    const customKeywords = body?.customKeywords || [];

    console.log(`Creating new scan job (depth: ${scanDepth}, sources: ${selectedSources.join(', ')})`);

    // Create the job
    const jobId = await createScanJob(supabase, selectedSources, scanDepth, customKeywords);

    console.log(`Scan job created: ${jobId}`);

    // Start the background scan (fire and forget)
    // This runs asynchronously - the response returns immediately
    runBackgroundScan(jobId).catch(err => {
      console.error(`Background scan failed for job ${jobId}:`, err);
    });

    return NextResponse.json({
      success: true,
      jobId,
      message: 'Scan started in background'
    });

  } catch (error) {
    console.error('Failed to start scan:', error);
    return NextResponse.json({
      error: 'Failed to start scan',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
