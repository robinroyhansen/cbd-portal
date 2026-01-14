import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createScanJob, getActiveScanJob, runBackgroundScan } from '@/lib/research-scanner';

export const maxDuration = 300; // 5 minutes max for Vercel

// Convert scan depth label to date range
function getDateRangeFromDepth(scanDepth: string): { start: string | null; end: string | null } {
  const now = new Date();
  const end = now.toISOString().split('T')[0];

  const depthMap: Record<string, number | null> = {
    'quick': 1,        // 1 month
    '6months': 6,      // 6 months
    '1year': 12,       // 1 year
    '2years': 24,      // 2 years
    '5years': 60,      // 5 years
    'historical': null // All time
  };

  const months = depthMap[scanDepth];
  if (months === null || months === undefined) {
    return { start: null, end: null }; // All time
  }

  const start = new Date(now);
  start.setMonth(start.getMonth() - months);
  return { start: start.toISOString().split('T')[0], end };
}

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
    const scanDepth = body?.scanDepth || '6months';
    const customKeywords = body?.customKeywords || [];

    // Convert scan depth to date range
    const dateRange = getDateRangeFromDepth(scanDepth);

    console.log(`[ScanAPI] Creating new scan job (range: ${dateRange.start || 'all'} to ${dateRange.end || 'now'}, sources: ${selectedSources.join(', ')})`);

    // Create the job
    const jobId = await createScanJob(supabase, selectedSources, dateRange.start, dateRange.end, customKeywords);

    console.log(`[ScanAPI] Scan job created: ${jobId}`);
    console.log(`[ScanAPI] Starting background scan...`);

    // Run the scan and wait for it to complete
    // We must await this because Vercel serverless functions terminate after response
    // The client polls for status updates so this works even though it blocks
    try {
      await runBackgroundScan(jobId);
      console.log(`[ScanAPI] Background scan completed for job ${jobId}`);
    } catch (scanError) {
      console.error(`[ScanAPI] Background scan failed for job ${jobId}:`, scanError);
      // Error is already recorded in the job status by runBackgroundScan
    }

    // Return success - client will poll for final status
    return NextResponse.json({
      success: true,
      jobId,
      message: 'Scan completed'
    });

  } catch (error) {
    console.error('[ScanAPI] Failed to start scan:', error);
    return NextResponse.json({
      error: 'Failed to start scan',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
