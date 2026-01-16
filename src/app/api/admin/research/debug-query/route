import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Test 1: Simple count query
    const { count: totalCount, error: countError } = await supabase
      .from('kb_research_queue')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      return NextResponse.json({
        test: 'count',
        error: countError.message,
        code: countError.code,
        details: countError.details
      }, { status: 500 });
    }

    // Test 2: Get actual columns first
    const { data: sampleRow, error: sampleError } = await supabase
      .from('kb_research_queue')
      .select('*')
      .limit(1)
      .single();

    if (sampleError) {
      return NextResponse.json({
        test: 'sample',
        error: sampleError.message,
        code: sampleError.code
      }, { status: 500 });
    }

    const columns = sampleRow ? Object.keys(sampleRow).sort() : [];

    // Test 3: Simple select with only columns that exist
    const { data: items, error: selectError } = await supabase
      .from('kb_research_queue')
      .select('id, title, status, study_subject, relevance_score, created_at')
      .eq('status', 'pending')
      .in('study_subject', ['human', 'review'])
      .order('created_at', { ascending: false })
      .limit(5);

    if (selectError) {
      return NextResponse.json({
        test: 'select',
        error: selectError.message,
        code: selectError.code,
        details: selectError.details
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      totalCount,
      itemsReturned: items?.length || 0,
      sampleItem: items?.[0] ? {
        id: items[0].id,
        title: items[0].title?.substring(0, 50),
        study_subject: items[0].study_subject,
        status: items[0].status
      } : null,
      tableColumns: columns,
      hasCategories: columns.includes('categories'),
      queriesWorking: true
    });

  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
