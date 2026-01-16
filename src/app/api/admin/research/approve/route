import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateStudySlug } from '@/lib/utils/slug-generator';
import { extractSampleSize } from '@/lib/utils/extract-sample-size';

interface Study {
  id: string;
  title: string;
  relevant_topics: string[] | null;
  authors: string | null;
  year: number | null;
  abstract: string | null;
  plain_summary: string | null;
}

export async function POST(request: NextRequest) {
  try {
    const { studyId } = await request.json();

    if (!studyId) {
      return NextResponse.json({ error: 'studyId is required' }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Fetch the study to get data for slug generation and sample size extraction
    const { data: study, error: fetchError } = await supabase
      .from('kb_research_queue')
      .select('id, title, relevant_topics, authors, year, abstract, plain_summary')
      .eq('id', studyId)
      .single();

    if (fetchError || !study) {
      return NextResponse.json({ error: 'Study not found' }, { status: 404 });
    }

    // Generate SEO-friendly slug
    const baseSlug = generateStudySlug(
      study.title,
      study.relevant_topics,
      study.authors,
      study.year
    );

    // Check for duplicates and add suffix if needed
    let finalSlug = baseSlug;
    let counter = 1;

    while (true) {
      const { data: existing } = await supabase
        .from('kb_research_queue')
        .select('id')
        .eq('slug', finalSlug)
        .neq('id', study.id)
        .maybeSingle();

      if (!existing) break;

      finalSlug = `${baseSlug}-${counter}`;
      counter++;

      // Safety limit
      if (counter > 100) {
        finalSlug = `${baseSlug}-${study.id.slice(0, 8)}`;
        break;
      }
    }

    // Extract sample size and type from study text
    const sampleResult = extractSampleSize(study.title, study.abstract, study.plain_summary);

    // Update study with approval status, slug, sample size and type
    const { error: updateError } = await supabase
      .from('kb_research_queue')
      .update({
        status: 'approved',
        slug: finalSlug,
        sample_size: sampleResult?.size || null,
        sample_type: sampleResult?.type || 'unknown',
        reviewed_at: new Date().toISOString(),
        reviewed_by: 'admin'
      })
      .eq('id', studyId);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      studyId,
      slug: finalSlug,
      sampleSize: sampleResult?.size || null,
      sampleType: sampleResult?.type || 'unknown'
    });

  } catch (error) {
    console.error('[Approve] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
