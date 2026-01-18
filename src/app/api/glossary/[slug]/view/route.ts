import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use service role to bypass RLS for incrementing view count
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json({ error: 'Slug required' }, { status: 400 });
    }

    // Increment view count atomically
    const { error } = await supabase.rpc('increment_glossary_view', {
      term_slug: slug
    });

    if (error) {
      // If the RPC doesn't exist yet, fall back to direct update
      if (error.message.includes('function') || error.message.includes('does not exist')) {
        const { error: updateError } = await supabase
          .from('kb_glossary')
          .update({ view_count: supabase.rpc('coalesce', { value: 'view_count', default: 0 }) })
          .eq('slug', slug);

        // Simple fallback - just do a raw increment
        if (updateError) {
          await supabase
            .from('kb_glossary')
            .update({ view_count: 1 })
            .eq('slug', slug)
            .is('view_count', null);

          // For existing counts, we need a different approach
          const { data: term } = await supabase
            .from('kb_glossary')
            .select('view_count')
            .eq('slug', slug)
            .single();

          if (term) {
            await supabase
              .from('kb_glossary')
              .update({ view_count: (term.view_count || 0) + 1 })
              .eq('slug', slug);
          }
        }
      } else {
        console.error('Error incrementing view:', error);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('View tracking error:', error);
    return NextResponse.json({ error: 'Failed to track view' }, { status: 500 });
  }
}
