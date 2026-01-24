import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/admin-api-auth';
import { createClient } from '@supabase/supabase-js';

/**
 * POST /api/admin/conditions/create
 * Create a new condition in the taxonomy
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
    const {
      name,
      slug,
      parentId,
      description,
      icon,
      synonyms,
      meshIds,
      openalexIds,
      pageThreshold = 10
    } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'name is required' },
        { status: 400 }
      );
    }

    // Generate slug if not provided
    const finalSlug = slug || name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    // Determine level and path based on parent
    let level = 2; // Default to condition level
    let path: string[] = [finalSlug];

    if (parentId) {
      const { data: parent } = await supabase
        .from('condition_taxonomy')
        .select('level, path')
        .eq('id', parentId)
        .single();

      if (parent) {
        level = parent.level + 1;
        path = [...(parent.path || []), finalSlug];
      }
    }

    // Insert the new condition
    const { data: newCondition, error: insertError } = await supabase
      .from('condition_taxonomy')
      .insert({
        slug: finalSlug,
        name,
        parent_id: parentId || null,
        level,
        path,
        description: description || null,
        icon: icon || null,
        has_page: false,
        page_threshold: pageThreshold,
        mesh_ids: meshIds || null,
        openalex_ids: openalexIds || null,
        synonyms: synonyms || null,
        study_count: 0,
        human_study_count: 0,
        enabled: true
      })
      .select()
      .single();

    if (insertError) {
      if (insertError.code === '23505') {
        return NextResponse.json(
          { error: `A condition with slug "${finalSlug}" already exists` },
          { status: 409 }
        );
      }
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    // If synonyms provided, create term mappings for them
    if (synonyms && synonyms.length > 0) {
      const mappings = synonyms.map((synonym: string) => ({
        source_type: 'keyword',
        source_term: synonym.toLowerCase(),
        maps_to: newCondition.id,
        confidence: 0.9,
        is_primary: true,
        created_by: 'admin'
      }));

      await supabase.from('term_mappings').upsert(mappings, {
        onConflict: 'source_type,source_term',
        ignoreDuplicates: true
      });
    }

    return NextResponse.json({
      success: true,
      condition: {
        id: newCondition.id,
        slug: newCondition.slug,
        name: newCondition.name,
        level: newCondition.level,
        path: newCondition.path
      }
    });

  } catch (error) {
    console.error('[Create Condition API] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
