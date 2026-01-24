import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/admin-api-auth';
import { createClient } from '@supabase/supabase-js';

/**
 * GET /api/admin/conditions/[id]
 * Get a single condition by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
  const authError = requireAdminAuth(request);
  if (authError) return authError;
const { id } = await params;
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: condition, error } = await supabase
      .from('condition_taxonomy')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Condition not found' }, { status: 404 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get associated term mappings
    const { data: mappings } = await supabase
      .from('term_mappings')
      .select('source_term, source_type, confidence')
      .eq('maps_to', id);

    return NextResponse.json({
      condition,
      mappings: mappings || []
    });

  } catch (error) {
    console.error('[Get Condition API] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/conditions/[id]
 * Update a condition in the taxonomy
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
  const authError = requireAdminAuth(request);
  if (authError) return authError;
const { id } = await params;
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const body = await request.json();
    const {
      name,
      description,
      icon,
      synonyms,
      meshIds,
      openalexIds,
      hasPage,
      pageThreshold,
      enabled
    } = body;

    // Build update object with only provided fields
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString()
    };

    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (icon !== undefined) updateData.icon = icon;
    if (synonyms !== undefined) updateData.synonyms = synonyms;
    if (meshIds !== undefined) updateData.mesh_ids = meshIds;
    if (openalexIds !== undefined) updateData.openalex_ids = openalexIds;
    if (hasPage !== undefined) updateData.has_page = hasPage;
    if (pageThreshold !== undefined) updateData.page_threshold = pageThreshold;
    if (enabled !== undefined) updateData.enabled = enabled;

    const { data: updatedCondition, error: updateError } = await supabase
      .from('condition_taxonomy')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      if (updateError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Condition not found' }, { status: 404 });
      }
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // Update term mappings if synonyms changed
    if (synonyms !== undefined) {
      // Remove old keyword mappings for this condition
      await supabase
        .from('term_mappings')
        .delete()
        .eq('maps_to', id)
        .eq('source_type', 'keyword')
        .eq('created_by', 'admin');

      // Add new mappings
      if (synonyms && synonyms.length > 0) {
        const mappings = synonyms.map((synonym: string) => ({
          source_type: 'keyword',
          source_term: synonym.toLowerCase(),
          maps_to: id,
          confidence: 0.9,
          is_primary: true,
          created_by: 'admin'
        }));

        await supabase.from('term_mappings').upsert(mappings, {
          onConflict: 'source_type,source_term',
          ignoreDuplicates: true
        });
      }
    }

    return NextResponse.json({
      success: true,
      condition: updatedCondition
    });

  } catch (error) {
    console.error('[Update Condition API] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/conditions/[id]
 * Soft delete (disable) a condition
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
  const authError = requireAdminAuth(request);
  if (authError) return authError;
const { id } = await params;
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Soft delete by setting enabled = false
    const { error } = await supabase
      .from('condition_taxonomy')
      .update({
        enabled: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Condition disabled'
    });

  } catch (error) {
    console.error('[Delete Condition API] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
