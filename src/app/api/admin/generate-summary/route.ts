import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generatePlainSummary, StudyData } from '@/lib/summary-generator';
import { requireAdminAuth } from '@/lib/admin-api-auth';

// Generate summary for a single study
export async function POST(request: NextRequest) {
  const authError = requireAdminAuth(request);
  if (authError) return authError;

  try {
    const { studyId } = await request.json();

    if (!studyId) {
      return NextResponse.json({ error: 'studyId required' }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Fetch the study
    const { data: study, error: fetchError } = await supabase
      .from('kb_research_queue')
      .select('*')
      .eq('id', studyId)
      .single();

    if (fetchError || !study) {
      return NextResponse.json({ error: 'Study not found' }, { status: 404 });
    }

    // Generate summary
    const result = await generatePlainSummary(study as StudyData);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    // Save the summary
    const { error: updateError } = await supabase
      .from('kb_research_queue')
      .update({ plain_summary: result.summary })
      .eq('id', studyId);

    if (updateError) {
      return NextResponse.json({ error: 'Failed to save summary' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      summary: result.summary
    });

  } catch (error) {
    console.error('[GenerateSummary] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Batch generate missing summaries
export async function PUT(request: NextRequest) {
  try {
    const { limit = 10 } = await request.json().catch(() => ({}));

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Fetch approved studies without summaries
    const { data: studies, error: fetchError } = await supabase
      .from('kb_research_queue')
      .select('id, title, abstract, authors, year, publication, url, source_site')
      .eq('status', 'approved')
      .is('plain_summary', null)
      .order('discovered_at', { ascending: false })
      .limit(limit);

    if (fetchError) {
      return NextResponse.json({ error: 'Failed to fetch studies' }, { status: 500 });
    }

    if (!studies || studies.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No studies need summaries',
        processed: 0,
        succeeded: 0,
        failed: 0
      });
    }

    let succeeded = 0;
    let failed = 0;
    const errors: string[] = [];

    // Process each study
    for (const study of studies) {
      const result = await generatePlainSummary(study as StudyData);

      if (result.success && result.summary) {
        const { error: updateError } = await supabase
          .from('kb_research_queue')
          .update({ plain_summary: result.summary })
          .eq('id', study.id);

        if (updateError) {
          failed++;
          errors.push(`${study.id}: Failed to save`);
        } else {
          succeeded++;
        }
      } else {
        failed++;
        errors.push(`${study.id}: ${result.error}`);
      }

      // Rate limiting between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Get count of remaining studies without summaries
    const { count: remaining } = await supabase
      .from('kb_research_queue')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'approved')
      .is('plain_summary', null);

    return NextResponse.json({
      success: true,
      processed: studies.length,
      succeeded,
      failed,
      remaining: remaining || 0,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error('[BatchGenerateSummary] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Get count of studies missing summaries
export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { count: missing, error: countError } = await supabase
      .from('kb_research_queue')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'approved')
      .is('plain_summary', null);

    const { count: total } = await supabase
      .from('kb_research_queue')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'approved');

    if (countError) {
      return NextResponse.json({ error: 'Failed to count studies' }, { status: 500 });
    }

    return NextResponse.json({
      missing: missing || 0,
      total: total || 0,
      withSummaries: (total || 0) - (missing || 0)
    });

  } catch (error) {
    console.error('[GetSummaryStats] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
