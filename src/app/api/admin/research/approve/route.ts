import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateStudySlug } from '@/lib/utils/slug-generator';

interface Study {
  id: string;
  title: string;
  relevant_topics: string[] | null;
  authors: string | null;
  year: number | null;
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

    // Fetch the study to get data for slug generation
    const { data: study, error: fetchError } = await supabase
      .from('kb_research_queue')
      .select('id, title, relevant_topics, authors, year')
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

    // Update study with approval status and new slug
    const { error: updateError } = await supabase
      .from('kb_research_queue')
      .update({
        status: 'approved',
        slug: finalSlug,
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
      slug: finalSlug
    });

  } catch (error) {
    console.error('[Approve] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
