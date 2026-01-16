import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    const slug = searchParams.get('slug');
    const category = searchParams.get('category');
    const featured = searchParams.get('featured') === 'true';
    const withResearch = searchParams.get('withResearch') === 'true';
    const lang = searchParams.get('lang') || 'en';

    // Single condition lookup by slug
    if (slug) {
      const { data: condition, error } = await supabase
        .from('kb_conditions')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .single();

      if (error || !condition) {
        return NextResponse.json({ error: 'Condition not found' }, { status: 404 });
      }

      // Get related conditions details
      if (condition.related_condition_slugs && condition.related_condition_slugs.length > 0) {
        const { data: relatedConditions } = await supabase
          .from('kb_conditions')
          .select('slug, name, display_name, short_description, category, research_count')
          .in('slug', condition.related_condition_slugs)
          .eq('is_published', true);

        condition.related_conditions = relatedConditions || [];
      }

      // Get parent condition if exists
      if (condition.parent_condition_id) {
        const { data: parentCondition } = await supabase
          .from('kb_conditions')
          .select('slug, name, display_name')
          .eq('id', condition.parent_condition_id)
          .single();

        condition.parent_condition = parentCondition;
      }

      // Get child conditions
      const { data: childConditions } = await supabase
        .from('kb_conditions')
        .select('slug, name, display_name, short_description, research_count')
        .eq('parent_condition_id', condition.id)
        .eq('is_published', true)
        .order('display_order', { ascending: true });

      condition.child_conditions = childConditions || [];

      // Fetch associated research if requested
      if (withResearch) {
        const { data: research } = await supabase
          .from('kb_research_queue')
          .select('id, title, url, year, source, relevance_score, abstract')
          .eq('status', 'approved')
          .containedBy('topics', condition.topic_keywords || [])
          .order('year', { ascending: false })
          .limit(20);

        condition.research = research || [];
      }

      // Apply translation if not English
      if (lang !== 'en' && condition.name_translations?.[lang]) {
        condition.name = condition.name_translations[lang];
      }
      if (lang !== 'en' && condition.description_translations?.[lang]) {
        condition.description = condition.description_translations[lang];
      }

      return NextResponse.json({ condition });
    }

    // Build query for listing conditions
    let query = supabase
      .from('kb_conditions')
      .select('id, slug, name, display_name, short_description, category, research_count, is_featured, topic_keywords')
      .eq('is_published', true)
      .order('display_order', { ascending: true });

    if (category) {
      query = query.eq('category', category);
    }

    if (featured) {
      query = query.eq('is_featured', true);
    }

    const { data: conditions, error } = await query;

    if (error) {
      console.error('Error fetching conditions:', error);
      throw error;
    }

    // Get counts by category
    const { data: allConditions } = await supabase
      .from('kb_conditions')
      .select('category')
      .eq('is_published', true);

    const categoryCounts: Record<string, number> = {};
    allConditions?.forEach(c => {
      categoryCounts[c.category] = (categoryCounts[c.category] || 0) + 1;
    });

    // Get total research count
    const totalResearch = conditions?.reduce((sum, c) => sum + (c.research_count || 0), 0) || 0;

    return NextResponse.json({
      conditions: conditions || [],
      total: conditions?.length || 0,
      categoryCounts,
      totalResearch
    });
  } catch (error) {
    console.error('Error fetching conditions:', error);
    return NextResponse.json({ error: 'Failed to fetch conditions' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
