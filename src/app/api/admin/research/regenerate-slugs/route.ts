import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateStudySlug, isOldStyleSlug } from '@/lib/utils/slug-generator';

interface Study {
  id: string;
  title: string;
  relevant_topics: string[] | null;
  authors: string | null;
  year: number | null;
  slug: string;
}

interface SlugUpdate {
  id: string;
  oldSlug: string;
  newSlug: string;
  title: string;
}

/**
 * ONE-TIME MIGRATION: Regenerate all old-style slugs to SEO-friendly format
 *
 * Run with: curl -X POST http://localhost:3000/api/admin/research/regenerate-slugs
 *
 * This will update ALL approved studies with old-style slugs to the new format:
 * cbd-[topic]-[author-lastname]-[year]
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get ALL approved studies
    const { data: studies, error: fetchError } = await supabase
      .from('kb_research_queue')
      .select('id, title, relevant_topics, authors, year, slug')
      .eq('status', 'approved')
      .order('relevance_score', { ascending: false, nullsFirst: false });

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    if (!studies || studies.length === 0) {
      return NextResponse.json({
        updated: 0,
        skipped: 0,
        message: 'No studies found'
      });
    }

    console.log(`[RegenerateSlugs] Processing ${studies.length} studies...`);

    const results: SlugUpdate[] = [];
    let skipped = 0;
    let errors = 0;

    for (const study of studies as Study[]) {
      // Skip if already has new-style slug
      if (!isOldStyleSlug(study.slug)) {
        skipped++;
        continue;
      }

      // Generate new slug
      const baseSlug = generateStudySlug(
        study.title,
        study.relevant_topics,
        study.authors,
        study.year
      );

      // Check for duplicates and add suffix if needed
      let finalSlug = baseSlug;
      let counter = 1;

      while (true) {
        const { data: existing } = await supabase
          .from('kb_research_queue')
          .select('id')
          .eq('slug', finalSlug)
          .neq('id', study.id)
          .maybeSingle();

        if (!existing) break;

        finalSlug = `${baseSlug}-${counter}`;
        counter++;

        // Safety limit
        if (counter > 100) {
          finalSlug = `${baseSlug}-${study.id.slice(0, 8)}`;
          break;
        }
      }

      // Update if slug is different
      if (finalSlug !== study.slug) {
        const { error: updateError } = await supabase
          .from('kb_research_queue')
          .update({ slug: finalSlug })
          .eq('id', study.id);

        if (updateError) {
          console.error(`[RegenerateSlugs] Error updating ${study.id}:`, updateError.message);
          errors++;
        } else {
          results.push({
            id: study.id,
            oldSlug: study.slug,
            newSlug: finalSlug,
            title: study.title.substring(0, 60),
          });
        }
      } else {
        skipped++;
      }
    }

    console.log(`[RegenerateSlugs] Complete: ${results.length} updated, ${skipped} skipped, ${errors} errors`);

    return NextResponse.json({
      updated: results.length,
      skipped,
      errors,
      total: studies.length,
      results: results.slice(0, 50), // Return first 50 for display
    });

  } catch (error) {
    console.error('[RegenerateSlugs] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// GET endpoint to check status
export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get all approved study slugs
    const { data: studies, error } = await supabase
      .from('kb_research_queue')
      .select('slug')
      .eq('status', 'approved');

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const total = studies?.length || 0;
    const oldStyle = (studies || []).filter(s => isOldStyleSlug(s.slug)).length;
    const newStyle = total - oldStyle;

    return NextResponse.json({
      total,
      oldStyle,
      newStyle,
      percentNew: total > 0 ? Math.round((newStyle / total) * 100) : 0,
    });

  } catch (error) {
    console.error('[RegenerateSlugs] Status error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
