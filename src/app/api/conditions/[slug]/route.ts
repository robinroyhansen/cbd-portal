import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const supabase = await createClient();
    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    const lang = searchParams.get('lang') || 'en';
    const withResearch = searchParams.get('withResearch') === 'true';

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
    if (withResearch && condition.topic_keywords?.length > 0) {
      // Search for research with matching topics
      const { data: research } = await supabase
        .from('kb_research_queue')
        .select('id, title, url, year, source, relevance_score, abstract')
        .eq('status', 'approved')
        .overlaps('topics', condition.topic_keywords)
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

    // Generate SEO metadata
    const seoTitle = condition.meta_title_template
      ?.replace('{condition}', condition.display_name || condition.name)
      ?.replace('{count}', String(condition.research_count || 0))
      || `CBD for ${condition.display_name || condition.name}`;

    const seoDescription = condition.meta_description_template
      ?.replace('{condition}', condition.display_name || condition.name)
      ?.replace('{count}', String(condition.research_count || 0))
      || condition.short_description;

    return NextResponse.json({
      condition,
      seo: {
        title: seoTitle,
        description: seoDescription,
        h1: condition.h1_template?.replace('{condition}', condition.display_name || condition.name)
      }
    });
  } catch (error) {
    console.error('Error fetching condition:', error);
    return NextResponse.json({ error: 'Failed to fetch condition' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
