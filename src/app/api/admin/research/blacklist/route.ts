import { createServiceClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/admin-api-auth';
import { logAdminAction, ADMIN_ACTIONS, RESOURCE_TYPES } from '@/lib/audit-log';

// GET all blacklist terms
export async function GET(request: NextRequest) {
  try {
    const authError = requireAdminAuth(request);
    if (authError) return authError;

    const supabase = createServiceClient();

    const { data, error } = await supabase
      .from('research_blacklist')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching blacklist:', error);
      return NextResponse.json({ error: 'Failed to fetch blacklist' }, { status: 500 });
    }

    return NextResponse.json({ terms: data || [] });
  } catch (error) {
    console.error('Error fetching blacklist:', error);
    return NextResponse.json({ error: 'Failed to fetch blacklist' }, { status: 500 });
  }
}

// POST add new blacklist term
export async function POST(request: NextRequest) {
  try {
    const authError = requireAdminAuth(request);
    if (authError) return authError;

    const supabase = createServiceClient();
    const body = await request.json();

    const { term, match_type, case_sensitive, reason } = body;

    if (!term || !term.trim()) {
      return NextResponse.json({ error: 'Term is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('research_blacklist')
      .insert({
        term: term.trim().toLowerCase(),
        match_type: match_type || 'contains',
        case_sensitive: case_sensitive || false,
        reason: reason?.trim() || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding blacklist term:', error);
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Term already exists' }, { status: 400 });
      }
      return NextResponse.json({ error: 'Failed to add term' }, { status: 500 });
    }

    // Log blacklist term addition
    await logAdminAction(request, {
      action: ADMIN_ACTIONS.ADD_BLACKLIST_TERM,
      resourceType: RESOURCE_TYPES.BLACKLIST,
      resourceId: data.id,
      details: {
        term: data.term,
        matchType: data.match_type,
        reason: data.reason,
      },
    });

    return NextResponse.json({ term: data });
  } catch (error) {
    console.error('Error adding blacklist term:', error);
    return NextResponse.json({ error: 'Failed to add term' }, { status: 500 });
  }
}

// DELETE remove blacklist term
export async function DELETE(request: NextRequest) {
  try {
    const authError = requireAdminAuth(request);
    if (authError) return authError;

    const supabase = createServiceClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Term ID is required' }, { status: 400 });
    }

    // Fetch term before deletion for audit log
    const { data: termToDelete } = await supabase
      .from('research_blacklist')
      .select('term')
      .eq('id', id)
      .single();

    const { error } = await supabase
      .from('research_blacklist')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting blacklist term:', error);
      return NextResponse.json({ error: 'Failed to delete term' }, { status: 500 });
    }

    // Log blacklist term removal
    await logAdminAction(request, {
      action: ADMIN_ACTIONS.REMOVE_BLACKLIST_TERM,
      resourceType: RESOURCE_TYPES.BLACKLIST,
      resourceId: id,
      details: {
        term: termToDelete?.term || 'Unknown',
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting blacklist term:', error);
    return NextResponse.json({ error: 'Failed to delete term' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
