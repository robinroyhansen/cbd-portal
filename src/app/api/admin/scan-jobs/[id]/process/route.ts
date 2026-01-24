import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/admin-api-auth';
import { createClient } from '@/lib/supabase/server';
import {
  processSourceChunk,
  getNextSourceToProcess,
  checkJobCompletion
} from '@/lib/research-scanner-chunked';

export const maxDuration = 240; // 4 minutes to allow for processing and self-scheduling

// POST /api/admin/scan-jobs/[id]/process - Process next chunk of a scan job
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
  const authError = requireAdminAuth(request);
  if (authError) return authError;
const jobId = params.id;

    if (!jobId || typeof jobId !== 'string') {
      return NextResponse.json(
        { error: 'Invalid job ID' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Verify job exists and is not already completed
    const { data: job, error: jobError } = await supabase
      .from('kb_scan_jobs')
      .select('id, status, scan_depth, custom_keywords')
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

    // Check if job is already completed or cancelled
    if (['completed', 'cancelled'].includes(job.status)) {
      return NextResponse.json(
        { message: `Job is already ${job.status}` },
        { status: 200 }
      );
    }

    // Get the next source to process
    const { sourceName, searchTerms, hasMoreSources } = await getNextSourceToProcess(jobId);

    if (!sourceName) {
      // No more sources to process - check if job should be marked complete
      const isComplete = await checkJobCompletion(jobId);
      return NextResponse.json({
        success: true,
        message: isComplete ? 'Job completed successfully' : 'No sources to process',
        jobComplete: isComplete
      });
    }

    console.log(`Processing ${sourceName} for job ${jobId} (${hasMoreSources ? 'more sources pending' : 'last source'})`);

    // Process this source chunk
    let processingResults;
    try {
      processingResults = await processSourceChunk(
        jobId,
        sourceName,
        job.scan_depth,
        job.custom_keywords || [],
        searchTerms
      );
    } catch (processingError) {
      console.error(`Error processing source ${sourceName}:`, processingError);

      // Mark job as failed
      await supabase
        .from('kb_scan_jobs')
        .update({
          status: 'failed',
          error_message: processingError instanceof Error ? processingError.message : 'Processing failed'
        })
        .eq('id', jobId);

      return NextResponse.json(
        {
          error: 'Source processing failed',
          details: processingError instanceof Error ? processingError.message : 'Unknown error'
        },
        { status: 500 }
      );
    }

    // Check if job is now complete
    const isJobComplete = await checkJobCompletion(jobId);

    // If there are more sources and job isn't complete, schedule next chunk
    if (hasMoreSources && !isJobComplete) {
      // Self-schedule next chunk (non-blocking)
      fetch(`${request.nextUrl.origin}/api/admin/scan-jobs/${jobId}/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }).catch(error => {
        console.error('Error scheduling next chunk:', error);
      });

      return NextResponse.json({
        success: true,
        message: `Completed processing ${sourceName}. Next chunk scheduled.`,
        sourceCompleted: sourceName,
        hasMoreSources: true,
        jobComplete: false,
        processingResults
      });
    } else {
      return NextResponse.json({
        success: true,
        message: isJobComplete ? 'Job completed successfully' : `Completed processing ${sourceName}`,
        sourceCompleted: sourceName,
        hasMoreSources: false,
        jobComplete: isJobComplete,
        processingResults
      });
    }

  } catch (error) {
    console.error('Error in POST /api/admin/scan-jobs/[id]/process:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}