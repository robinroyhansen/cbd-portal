import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/admin-api-auth';
import { createClient } from '@supabase/supabase-js';

/**
 * POST /api/admin/conditions/ignore
 * Mark a term as non-health-related (ignored)
 */
export async function POST(request: NextRequest) {
  try {
  const authError = requireAdminAuth(request);
  if (authError) return authError;
const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const body = await request.json();
    const { term } = body;

    if (!term) {
      return NextResponse.json(
        { error: 'term is required' },
        { status: 400 }
      );
    }

    const termLower = term.toLowerCase();

    // 1. Update suggested_mappings status to 'rejected'
    const { error: updateError } = await supabase
      .from('suggested_mappings')
      .update({
        status: 'rejected',
        reviewed_by: 'admin',
        reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('term', termLower);

    if (updateError && updateError.code !== '42P01') {
      console.error('[Ignore API] Error updating suggested_mappings:', updateError.message);
    }

    // 2. Mark the term as non-health-related in study_raw_terms
    const { error: rawUpdateError } = await supabase
      .from('study_raw_terms')
      .update({ is_health_related: false })
      .ilike('term', term);

    if (rawUpdateError) {
      console.error('[Ignore API] Error updating study_raw_terms:', rawUpdateError.message);
    }

    return NextResponse.json({
      success: true,
      message: `Marked "${term}" as non-health-related`
    });

  } catch (error) {
    console.error('[Ignore API] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
