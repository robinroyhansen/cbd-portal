import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * Fix display titles that are questions but missing question marks
 *
 * Run with: curl -X POST https://cbd-portal.vercel.app/api/admin/research/fix-question-titles
 */

const QUESTION_STARTERS = /^(can|does|do|is|are|will|could|should|would|how|what|why|when|where|which)\s/i;

export async function POST() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get all approved studies with display_title
    const { data: studies, error: fetchError } = await supabase
      .from('kb_research_queue')
      .select('id, title, display_title')
      .eq('status', 'approved')
      .not('display_title', 'is', null);

    if (fetchError) {
      console.error('[Fix Question Titles] Fetch error:', fetchError);
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    const results = {
      checked: 0,
      fixed: 0,
      alreadyCorrect: 0,
      notQuestion: 0,
      examples: [] as { before: string; after: string }[],
    };

    for (const study of studies || []) {
      results.checked++;

      // Check if original title is a question
      const isQuestion = QUESTION_STARTERS.test(study.title) || study.title.includes('?');

      if (!isQuestion) {
        results.notQuestion++;
        continue;
      }

      // Check if display_title already has a question mark
      if (study.display_title.includes('?')) {
        results.alreadyCorrect++;
        continue;
      }

      // Fix the display_title - add question mark before the year or at a sensible point
      let fixedTitle = study.display_title;

      // Pattern 1: Replace ": YYYY" with "? YYYY"
      if (fixedTitle.match(/:\s*\d{4}/)) {
        fixedTitle = fixedTitle.replace(/:\s*(\d{4})/, '? $1');
      }
      // Pattern 2: Replace ": Study" or ": Trial" with "? Study" or "? Trial"
      else if (fixedTitle.match(/:\s*(Study|Trial|Review|Analysis)/i)) {
        fixedTitle = fixedTitle.replace(/:\s*(Study|Trial|Review|Analysis)/i, '? $1');
      }
      // Pattern 3: If ends with a word (no punctuation), add ? before last segment
      else if (!fixedTitle.match(/[.!?]$/)) {
        // Find the last colon and replace with question mark
        const lastColonIndex = fixedTitle.lastIndexOf(':');
        if (lastColonIndex > 0) {
          fixedTitle = fixedTitle.substring(0, lastColonIndex) + '?' + fixedTitle.substring(lastColonIndex + 1);
        } else {
          // No colon, just append question mark
          fixedTitle = fixedTitle.trimEnd() + '?';
        }
      }

      // Only update if we actually changed something
      if (fixedTitle !== study.display_title) {
        const { error: updateError } = await supabase
          .from('kb_research_queue')
          .update({ display_title: fixedTitle })
          .eq('id', study.id);

        if (updateError) {
          console.error(`[Fix Question Titles] Update error for ${study.id}:`, updateError);
        } else {
          results.fixed++;
          // Store first 5 examples
          if (results.examples.length < 5) {
            results.examples.push({
              before: study.display_title,
              after: fixedTitle,
            });
          }
        }
      }
    }

    console.log('[Fix Question Titles] Complete:', results);

    return NextResponse.json({
      success: true,
      ...results,
    });

  } catch (error) {
    console.error('[Fix Question Titles] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'POST to this endpoint to fix question titles missing question marks',
    description: 'Finds display_titles where original title is a question but display_title lacks a ?',
  });
}
