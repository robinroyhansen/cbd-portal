import { createServiceClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({
        error: 'Supabase configuration missing'
      }, { status: 500 });
    }

    const supabase = createServiceClient();

    // Fetch project with related data
    const { data: project, error } = await supabase
      .from('kb_projects')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Project not found' }, { status: 404 });
      }
      throw error;
    }

    // Fetch milestones for the project
    const { data: milestones } = await supabase
      .from('kb_milestones')
      .select('*')
      .eq('project_id', id)
      .order('display_order', { ascending: true });

    // Fetch tasks for the project with assignee info
    const { data: tasks } = await supabase
      .from('kb_tasks')
      .select(`
        *,
        assignee:kb_authors(id, name, avatar_url)
      `)
      .eq('project_id', id)
      .order('display_order', { ascending: true });

    return NextResponse.json({
      project,
      milestones: milestones || [],
      tasks: tasks || []
    });
  } catch (error) {
    console.error('Error fetching project:', error);
    return NextResponse.json({ error: 'Failed to fetch project' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({
        error: 'Supabase configuration missing'
      }, { status: 500 });
    }

    const supabase = createServiceClient();
    const body = await request.json();

    // Prepare update data, excluding id and timestamps
    const { id: _id, created_at, updated_at, ...updateData } = body;

    // If name changed and no slug provided, regenerate slug
    if (updateData.name && !updateData.slug) {
      updateData.slug = updateData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      // Check if new slug exists (excluding current project)
      const { data: existingProject } = await supabase
        .from('kb_projects')
        .select('id')
        .eq('slug', updateData.slug)
        .neq('id', id)
        .single();

      if (existingProject) {
        const timestamp = Date.now().toString().slice(-4);
        updateData.slug = `${updateData.slug}-${timestamp}`;
      }
    }

    const { data: project, error } = await supabase
      .from('kb_projects')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating project:', error);
      throw error;
    }

    return NextResponse.json({ project });
  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json({ error: 'Failed to update project' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({
        error: 'Supabase configuration missing'
      }, { status: 500 });
    }

    const supabase = createServiceClient();

    const { error } = await supabase
      .from('kb_projects')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting project:', error);
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
