import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { extractSampleSize } from '@/lib/utils/extract-sample-size';

/**
 * Debug endpoint to analyze animal study detection
 */
export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Find studies with animal keywords in title
    const { data: titleAnimal } = await supabase
      .from('kb_research_queue')
      .select('id, title, sample_type')
      .eq('status', 'approved')
      .or('title.ilike.%mice%,title.ilike.%mouse%,title.ilike.%rat%,title.ilike.%rats%,title.ilike.%murine%,title.ilike.%rodent%,title.ilike.%in vivo%,title.ilike.%animal%');

    // Find studies with animal keywords in abstract
    const { data: abstractAnimal } = await supabase
      .from('kb_research_queue')
      .select('id, title, abstract, sample_type')
      .eq('status', 'approved')
      .or('abstract.ilike.%mice%,abstract.ilike.%mouse%,abstract.ilike.%rat%,abstract.ilike.%rats%,abstract.ilike.%murine%');

    // Find studies with animal keywords in summary
    const { data: summaryAnimal } = await supabase
      .from('kb_research_queue')
      .select('id, title, plain_summary, sample_type')
      .eq('status', 'approved')
      .or('plain_summary.ilike.%mice%,plain_summary.ilike.%mouse%,plain_summary.ilike.%rat%,plain_summary.ilike.%rats%');

    // Get a few examples to test extraction
    const examples = titleAnimal?.slice(0, 10).map(study => {
      const result = extractSampleSize(study.title, null, null);
      return {
        title: study.title?.substring(0, 80),
        currentType: study.sample_type,
        extractedResult: result
      };
    });

    // Get current distribution
    const { data: currentDist } = await supabase
      .from('kb_research_queue')
      .select('sample_type')
      .eq('status', 'approved');

    const distribution = {
      human: currentDist?.filter(s => s.sample_type === 'human').length || 0,
      animal: currentDist?.filter(s => s.sample_type === 'animal').length || 0,
      unknown: currentDist?.filter(s => s.sample_type === 'unknown' || !s.sample_type).length || 0,
    };

    return NextResponse.json({
      potentialAnimalStudies: {
        byTitle: titleAnimal?.length || 0,
        byAbstract: abstractAnimal?.length || 0,
        bySummary: summaryAnimal?.length || 0,
        titleExamples: titleAnimal?.slice(0, 5).map(s => s.title?.substring(0, 60))
      },
      currentDistribution: distribution,
      extractionExamples: examples,
      recommendation: titleAnimal && titleAnimal.length > 0
        ? `Found ${titleAnimal.length} studies with animal keywords in title - detection needs fixing`
        : 'No animal studies found by keyword search'
    });

  } catch (error) {
    console.error('[Debug Sample Type] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
