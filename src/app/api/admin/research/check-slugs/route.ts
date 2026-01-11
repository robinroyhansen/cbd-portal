import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: withSlug, count: withSlugCount } = await supabase
    .from('kb_research_queue')
    .select('slug', { count: 'exact' })
    .eq('status', 'approved')
    .not('slug', 'is', null);

  const { count: totalCount } = await supabase
    .from('kb_research_queue')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'approved');

  return NextResponse.json({
    totalApproved: totalCount,
    withSlugs: withSlugCount,
    sampleSlugs: withSlug?.slice(0, 5).map(s => s.slug)
  });
}
