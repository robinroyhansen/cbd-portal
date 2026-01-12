import { createServiceClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

interface RouteParams {
  params: Promise<{ taskId: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { taskId } = await params;

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({
        error: 'Supabase configuration missing'
      }, { status: 500 });
    }

    const supabase = createServiceClient();

    const { data: task, error } = await supabase
      .from('kb_tasks')
      .select(`
        *,
        assignee:kb_authors(id, name, avatar_url)
      `)
      .eq('id', taskId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Task not found' }, { status: 404 });
      }
      throw error;
    }

    // Fetch subtasks
    const { data: subtasks } = await supabase
      .from('kb_tasks')
      .select(`
        *,
        assignee:kb_authors(id, name, avatar_url)
      `)
      .eq('parent_task_id', taskId)
      .order('display_order', { ascending: true });

    // Fetch comments
    const { data: comments } = await supabase
      .from('kb_task_comments')
      .select(`
        *,
        author:kb_authors(id, name, avatar_url)
      `)
      .eq('task_id', taskId)
      .order('created_at', { ascending: true });

    return NextResponse.json({
      task,
      subtasks: subtasks || [],
      comments: comments || []
    });
  } catch (error) {
    console.error('Error fetching task:', error);
    return NextResponse.json({ error: 'Failed to fetch task' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { taskId } = await params;

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({
        error: 'Supabase configuration missing'
      }, { status: 500 });
    }

    const supabase = createServiceClient();
    const body = await request.json();

    // Remove fields that shouldn't be updated directly
    const { id, created_at, updated_at, assignee, subtasks, ...updateData } = body;

    const { data: task, error } = await supabase
      .from('kb_tasks')
      .update(updateData)
      .eq('id', taskId)
      .select(`
        *,
        assignee:kb_authors(id, name, avatar_url)
      `)
      .single();

    if (error) {
      console.error('Error updating task:', error);
      throw error;
    }

    return NextResponse.json({ task });
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { taskId } = await params;

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({
        error: 'Supabase configuration missing'
      }, { status: 500 });
    }

    const supabase = createServiceClient();

    const { error } = await supabase
      .from('kb_tasks')
      .delete()
      .eq('id', taskId);

    if (error) {
      console.error('Error deleting task:', error);
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
