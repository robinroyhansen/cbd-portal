import { NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/admin-api-auth';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
  const authError = requireAdminAuth(request);
  if (authError) return authError;
const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Total approved studies
    const { count: totalStudies } = await supabase
      .from('kb_research_queue')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'approved');

    // Studies with plain summaries
    const { count: withSummaries } = await supabase
      .from('kb_research_queue')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'approved')
      .not('plain_summary', 'is', null);

    // Studies with complete meta (meta_title AND key_findings)
    const { count: withMeta } = await supabase
      .from('kb_research_queue')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'approved')
      .not('meta_title', 'is', null)
      .not('key_findings', 'is', null);

    // Studies with country data
    const { count: withCountry } = await supabase
      .from('kb_research_queue')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'approved')
      .not('country', 'is', null);

    return NextResponse.json({
      totalStudies: totalStudies || 0,
      withSummaries: withSummaries || 0,
      withMeta: withMeta || 0,
      withCountry: withCountry || 0,
    });
  } catch (error) {
    console.error('[GenerationStats] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
