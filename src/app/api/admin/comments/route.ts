import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/admin-api-auth';

export async function GET(request: NextRequest) {
  try {
  const authError = requireAdminAuth(request);
  if (authError) return authError;
const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const articleId = searchParams.get('article_id');

    let query = supabase
      .from('kb_comments')
      .select(`
        *,
        article:kb_articles(id, title, slug)
      `)
      .order('created_at', { ascending: false });

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    if (articleId) {
      query = query.eq('article_id', articleId);
    }

    const { data: comments, error } = await query;

    if (error) {
      console.error('Error fetching comments:', error);
      throw error;
    }

    // Calculate status counts from fetched comments in a single pass
    // Note: If filters are applied, counts are for filtered results only
    const counts = {
      all: comments?.length || 0,
      pending: 0,
      approved: 0,
      rejected: 0,
      spam: 0
    };

    (comments || []).forEach(c => {
      if (c.status in counts) {
        counts[c.status as keyof typeof counts]++;
      }
    });

    return NextResponse.json({ comments: comments || [], counts });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
  const authError = requireAdminAuth(request);
  if (authError) return authError;
const supabase = await createClient();
    const body = await request.json();
    const { ids, status } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'Comment IDs required' }, { status: 400 });
    }

    if (!status || !['pending', 'approved', 'rejected', 'spam'].includes(status)) {
      return NextResponse.json({ error: 'Valid status required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('kb_comments')
      .update({ status })
      .in('id', ids)
      .select();

    if (error) {
      console.error('Error updating comments:', error);
      throw error;
    }

    return NextResponse.json({ updated: data?.length || 0 });
  } catch (error) {
    console.error('Error updating comments:', error);
    return NextResponse.json({ error: 'Failed to update comments' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
  const authError = requireAdminAuth(request);
  if (authError) return authError;
const supabase = await createClient();
    const body = await request.json();
    const { ids } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'Comment IDs required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('kb_comments')
      .delete()
      .in('id', ids);

    if (error) {
      console.error('Error deleting comments:', error);
      throw error;
    }

    return NextResponse.json({ deleted: ids.length });
  } catch (error) {
    console.error('Error deleting comments:', error);
    return NextResponse.json({ error: 'Failed to delete comments' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
