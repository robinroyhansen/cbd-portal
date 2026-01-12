import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get all approved studies with their study_subject
    const { data, error } = await supabase
      .from('kb_research_queue')
      .select('study_subject')
      .eq('status', 'approved');

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Count by study_subject
    const counts: Record<string, number> = {};
    for (const row of data || []) {
      const subject = row.study_subject || 'NULL';
      counts[subject] = (counts[subject] || 0) + 1;
    }

    // Sort by count descending
    const sorted = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([study_subject, count]) => ({ study_subject, count }));

    return NextResponse.json({
      total: data?.length || 0,
      distribution: sorted
    });

  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
