import { createServiceClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: projectId } = await params;

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({
        error: 'Supabase configuration missing'
      }, { status: 500 });
    }

    const supabase = createServiceClient();
    const { searchParams } = new URL(request.url);

    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const assigneeId = searchParams.get('assignee_id');
    const milestoneId = searchParams.get('milestone_id');

    let query = supabase
      .from('kb_tasks')
      .select(`
        *,
        assignee:kb_authors(id, name, avatar_url)
      `)
      .eq('project_id', projectId)
      .order('display_order', { ascending: true });

    if (status) {
      query = query.eq('status', status);
    }

    if (priority) {
      query = query.eq('priority', priority);
    }

    if (assigneeId) {
      query = query.eq('assignee_id', assigneeId);
    }

    if (milestoneId) {
      query = query.eq('milestone_id', milestoneId);
    }

    const { data: tasks, error } = await query;

    if (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    }

    return NextResponse.json({ tasks: tasks || [] });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: projectId } = await params;

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({
        error: 'Supabase configuration missing'
      }, { status: 500 });
    }

    const supabase = createServiceClient();
    const body = await request.json();

    if (!body.title) {
      return NextResponse.json({ error: 'Task title is required' }, { status: 400 });
    }

    // Get the highest display order for this project
    const { data: lastTask } = await supabase
      .from('kb_tasks')
      .select('display_order')
      .eq('project_id', projectId)
      .order('display_order', { ascending: false })
      .limit(1)
      .single();

    const taskData = {
      project_id: projectId,
      title: body.title,
      description: body.description || null,
      status: body.status || 'todo',
      priority: body.priority || 'medium',
      milestone_id: body.milestone_id || null,
      parent_task_id: body.parent_task_id || null,
      assignee_id: body.assignee_id || null,
      due_date: body.due_date || null,
      estimated_hours: body.estimated_hours || null,
      labels: body.labels || [],
      display_order: (lastTask?.display_order ?? -1) + 1,
    };

    const { data: task, error } = await supabase
      .from('kb_tasks')
      .insert(taskData)
      .select(`
        *,
        assignee:kb_authors(id, name, avatar_url)
      `)
      .single();

    if (error) {
      console.error('Error creating task:', error);
      throw error;
    }

    return NextResponse.json({ task });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
