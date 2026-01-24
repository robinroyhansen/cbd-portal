import { createServiceClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/admin-api-auth';
import { detectLanguage } from '@/lib/utils/language-detection';

export async function GET(request: NextRequest) {
  try {
  const authError = requireAdminAuth(request);
  if (authError) return authError;
const supabase = createServiceClient();

    // Get language distribution
    const { data: studies } = await supabase
      .from('kb_research_queue')
      .select('detected_language');

    const distribution: Record<string, number> = {};
    for (const study of studies || []) {
      const lang = study.detected_language || 'unknown';
      distribution[lang] = (distribution[lang] || 0) + 1;
    }

    return NextResponse.json({
      total: studies?.length || 0,
      distribution
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
  const authError = requireAdminAuth(request);
  if (authError) return authError;
const supabase = createServiceClient();

    // Get studies without detected_language or with null
    const { data: studies, error: fetchError } = await supabase
      .from('kb_research_queue')
      .select('id, title, abstract, detected_language');

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    if (!studies || studies.length === 0) {
      return NextResponse.json({ message: 'No studies to process', updated: 0 });
    }

    let updated = 0;
    const nonEnglish: { id: string; language: string; title: string }[] = [];
    const distribution: Record<string, number> = {};

    for (const study of studies) {
      const text = `${study.title} ${study.abstract || ''}`;
      const result = detectLanguage(text, study.title);

      // Track distribution
      distribution[result.language] = (distribution[result.language] || 0) + 1;

      // Only update if different from current or not set
      if (study.detected_language !== result.language) {
        const { error: updateError } = await supabase
          .from('kb_research_queue')
          .update({ detected_language: result.language })
          .eq('id', study.id);

        if (!updateError) {
          updated++;

          if (!result.isEnglish) {
            nonEnglish.push({
              id: study.id,
              language: result.language,
              title: study.title?.slice(0, 80) || ''
            });
          }
        }
      } else if (!result.isEnglish) {
        // Already set to non-English, still include in results
        nonEnglish.push({
          id: study.id,
          language: result.language,
          title: study.title?.slice(0, 80) || ''
        });
      }
    }

    return NextResponse.json({
      processed: studies.length,
      updated,
      distribution,
      nonEnglishCount: nonEnglish.length,
      nonEnglishStudies: nonEnglish.slice(0, 50) // Return first 50 for preview
    });
  } catch (error) {
    console.error('Language detection error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
