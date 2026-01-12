import { createServiceClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({
        error: 'Supabase configuration missing',
        details: 'Environment variables are required'
      }, { status: 500 });
    }

    const supabase = createServiceClient();
    const { searchParams } = new URL(request.url);

    // Query parameters for filtering
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const archived = searchParams.get('archived');
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    let query = supabase
      .from('kb_projects')
      .select('*')
      .order('created_at', { ascending: false });

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }

    if (priority) {
      query = query.eq('priority', priority);
    }

    if (archived !== null && archived !== undefined) {
      query = query.eq('is_archived', archived === 'true');
    } else {
      // By default, don't show archived projects
      query = query.eq('is_archived', false);
    }

    if (category) {
      query = query.eq('category', category);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data: projects, error } = await query;

    if (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }

    return NextResponse.json({ projects: projects || [] });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({
        error: 'Supabase configuration missing'
      }, { status: 500 });
    }

    const supabase = createServiceClient();
    const body = await request.json();

    // Generate slug from name if not provided
    let slug = body.slug;
    if (!slug && body.name) {
      slug = body.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }

    if (!slug) {
      return NextResponse.json({ error: 'Slug or name is required' }, { status: 400 });
    }

    if (!body.name) {
      return NextResponse.json({ error: 'Project name is required' }, { status: 400 });
    }

    // Check if slug already exists
    const { data: existingProject } = await supabase
      .from('kb_projects')
      .select('id')
      .eq('slug', slug)
      .single();

    if (existingProject) {
      // Add a number suffix to make slug unique
      const timestamp = Date.now().toString().slice(-4);
      slug = `${slug}-${timestamp}`;
    }

    const projectData = {
      name: body.name,
      slug,
      description: body.description || null,
      status: body.status || 'planning',
      priority: body.priority || 'medium',
      start_date: body.start_date || null,
      due_date: body.due_date || null,
      category: body.category || null,
      tags: body.tags || [],
      color: body.color || '#22c55e',
      is_archived: false,
      metadata: body.metadata || {},
    };

    const { data: project, error } = await supabase
      .from('kb_projects')
      .insert(projectData)
      .select()
      .single();

    if (error) {
      console.error('Error creating project:', error);
      throw error;
    }

    return NextResponse.json({ project });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
