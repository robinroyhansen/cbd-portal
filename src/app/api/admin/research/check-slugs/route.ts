import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // This is the exact query used in sitemap.ts
  const { data: studies, error: studiesError } = await supabase
    .from('kb_research_queue')
    .select('slug')
    .eq('status', 'approved')
    .not('slug', 'is', null);

  const { data: glossary, error: glossaryError } = await supabase
    .from('kb_glossary')
    .select('slug');

  const { data: brands, error: brandsError } = await supabase
    .from('kb_brands')
    .select('slug')
    .not('review_content', 'is', null);

  return NextResponse.json({
    studies: {
      count: studies?.length || 0,
      error: studiesError?.message,
      sample: studies?.slice(0, 3).map(s => s.slug)
    },
    glossary: {
      count: glossary?.length || 0,
      error: glossaryError?.message,
      sample: glossary?.slice(0, 3).map(s => s.slug)
    },
    brands: {
      count: brands?.length || 0,
      error: brandsError?.message,
      sample: brands?.slice(0, 3).map(s => s.slug)
    }
  });
}
