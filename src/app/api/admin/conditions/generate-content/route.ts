import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

interface ResearchStudy {
  id: string;
  title: string;
  slug: string;
  year: number;
  study_type: string;
  study_subject: string;
  sample_size: number | null;
  quality_score: number | null;
  abstract: string | null;
  plain_summary: string | null;
  doi: string | null;
  pmid: string | null;
  authors: string | null;
  key_findings: Array<{ text: string; type: string }> | null;
}

interface ConditionData {
  id: string;
  slug: string;
  name: string;
  display_name: string | null;
  short_description: string | null;
  topic_keywords: string[];
}

interface EvidenceAnalysis {
  totalStudies: number;
  humanStudies: number;
  animalStudies: number;
  inVitroStudies: number;
  rcts: number;
  reviews: number;
  metaAnalyses: number;
  totalParticipants: number;
  yearRange: { min: number; max: number };
  avgQualityScore: number;
  highQualityStudies: number;
  evidenceLevel: 'Strong' | 'Moderate' | 'Limited' | 'Insufficient';
  targetWordCount: { min: number; max: number };
  topStudies: ResearchStudy[];
}

function analyzeEvidence(studies: ResearchStudy[]): EvidenceAnalysis {
  const totalStudies = studies.length;

  // Categorize studies
  const humanStudies = studies.filter(s => s.study_subject === 'human' || s.study_subject === 'review');
  const animalStudies = studies.filter(s => s.study_subject === 'animal');
  const inVitroStudies = studies.filter(s => s.study_subject === 'in_vitro');

  // Study types
  const rcts = studies.filter(s =>
    s.study_type?.toLowerCase().includes('randomized') ||
    s.study_type?.toLowerCase().includes('rct') ||
    s.study_type?.toLowerCase() === 'clinical trial'
  );
  const reviews = studies.filter(s =>
    s.study_type?.toLowerCase().includes('review') ||
    s.study_type?.toLowerCase().includes('systematic')
  );
  const metaAnalyses = studies.filter(s =>
    s.study_type?.toLowerCase().includes('meta-analysis') ||
    s.study_type?.toLowerCase().includes('meta analysis')
  );

  // Participants
  const totalParticipants = humanStudies
    .filter(s => s.sample_size && s.sample_size > 0)
    .reduce((sum, s) => sum + (s.sample_size || 0), 0);

  // Years
  const years = studies.map(s => s.year).filter(y => y > 1900 && y < 2100);
  const yearRange = {
    min: years.length > 0 ? Math.min(...years) : 0,
    max: years.length > 0 ? Math.max(...years) : 0
  };

  // Quality
  const qualityScores = studies.filter(s => s.quality_score).map(s => s.quality_score!);
  const avgQualityScore = qualityScores.length > 0
    ? Math.round(qualityScores.reduce((a, b) => a + b, 0) / qualityScores.length)
    : 0;
  const highQualityStudies = studies.filter(s => (s.quality_score || 0) >= 70).length;

  // Determine evidence level
  let evidenceLevel: EvidenceAnalysis['evidenceLevel'] = 'Insufficient';
  let targetWordCount = { min: 600, max: 900 };

  if (
    totalStudies >= 20 &&
    (rcts.length >= 3 || metaAnalyses.length >= 1 || reviews.length >= 2) &&
    totalParticipants >= 200
  ) {
    evidenceLevel = 'Strong';
    targetWordCount = { min: 1800, max: 2400 };
  } else if (
    totalStudies >= 10 &&
    (rcts.length >= 1 || humanStudies.length >= 5)
  ) {
    evidenceLevel = 'Moderate';
    targetWordCount = { min: 1300, max: 1800 };
  } else if (totalStudies >= 5) {
    evidenceLevel = 'Limited';
    targetWordCount = { min: 900, max: 1300 };
  }

  // Get top studies for highlighting
  const topStudies = [...studies]
    .sort((a, b) => {
      // Prioritize human studies, then by quality score
      const aHuman = a.study_subject === 'human' || a.study_subject === 'review' ? 1 : 0;
      const bHuman = b.study_subject === 'human' || b.study_subject === 'review' ? 1 : 0;
      if (aHuman !== bHuman) return bHuman - aHuman;
      return (b.quality_score || 0) - (a.quality_score || 0);
    })
    .slice(0, 4);

  return {
    totalStudies,
    humanStudies: humanStudies.length,
    animalStudies: animalStudies.length,
    inVitroStudies: inVitroStudies.length,
    rcts: rcts.length,
    reviews: reviews.length,
    metaAnalyses: metaAnalyses.length,
    totalParticipants,
    yearRange,
    avgQualityScore,
    highQualityStudies,
    evidenceLevel,
    targetWordCount,
    topStudies
  };
}

function getEvidenceIcon(level: string): string {
  switch (level) {
    case 'Strong': return '●●●●○';
    case 'Moderate': return '●●●○○';
    case 'Limited': return '●●○○○';
    default: return '●○○○○';
  }
}

export async function POST(request: NextRequest) {
  try {
    const { conditionSlug, preview = false } = await request.json();

    if (!conditionSlug) {
      return NextResponse.json({ error: 'conditionSlug required' }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 500 });
    }

    const supabase = createServiceClient();

    // Fetch the condition
    const { data: condition, error: conditionError } = await supabase
      .from('kb_conditions')
      .select('id, slug, name, display_name, short_description, topic_keywords')
      .eq('slug', conditionSlug)
      .single();

    if (conditionError || !condition) {
      return NextResponse.json({ error: 'Condition not found' }, { status: 404 });
    }

    // Fetch all approved research and filter by topic_keywords (same approach as conditions page)
    const keywords = condition.topic_keywords || [];

    // Add the condition slug as a fallback keyword
    const allKeywords = [...new Set([...keywords, conditionSlug])];

    console.log('[Generate Content] Condition:', conditionSlug);
    console.log('[Generate Content] topic_keywords from DB:', keywords);
    console.log('[Generate Content] All keywords to match:', allKeywords);

    let studies: ResearchStudy[] = [];

    try {
      // Fetch all approved research with topics
      // Note: Database only has relevant_topics array, no primary_topic column
      const { data: allResearch, error: researchError } = await supabase
        .from('kb_research_queue')
        .select('id, title, slug, year, study_type, study_subject, sample_size, quality_score, abstract, plain_summary, doi, pmid, authors, key_findings, relevant_topics')
        .eq('status', 'approved');

      if (researchError) {
        console.error('Research fetch error:', researchError);
      } else if (allResearch) {
        console.log('[Generate Content] Total approved research:', allResearch.length);

        // Sample first 3 research items to see their topic structure
        if (allResearch.length > 0) {
          console.log('[Generate Content] Sample research topics:');
          allResearch.slice(0, 3).forEach(r => {
            console.log(`  - "${r.title?.substring(0, 50)}...": relevant_topics=${JSON.stringify(r.relevant_topics)}`);
          });
        }

        // Filter research that matches any of the condition's topic keywords
        studies = allResearch
          .filter((research: any) => {
            const topics = research.relevant_topics || [];
            return allKeywords.some(keyword => topics.includes(keyword));
          })
          .sort((a: any, b: any) => (b.quality_score || 0) - (a.quality_score || 0))
          .map((r: any) => ({
            id: r.id,
            title: r.title,
            slug: r.slug,
            year: r.year,
            study_type: r.study_type,
            study_subject: r.study_subject,
            sample_size: r.sample_size,
            quality_score: r.quality_score,
            abstract: r.abstract,
            plain_summary: r.plain_summary,
            doi: r.doi,
            pmid: r.pmid,
            authors: r.authors,
            key_findings: r.key_findings
          }));

        console.log('[Generate Content] Matched studies:', studies.length);
      }
    } catch (fetchError) {
      console.error('Research fetch exception:', fetchError);
    }
    const evidence = analyzeEvidence(studies);

    // Prepare context for Claude
    const conditionName = condition.display_name || condition.name;

    // Build a summary of top studies for the prompt
    const topStudiesSummary = evidence.topStudies
      .map(s => `- "${s.title}" (${s.year}): ${s.plain_summary || s.abstract?.substring(0, 300) || 'No summary'}`)
      .join('\n');

    // Generate the article content using Claude
    const hasResearch = evidence.totalStudies > 0;

    const systemPrompt = `You are an expert health content writer for CBD Portal, writing ${hasResearch ? 'research-backed' : 'educational'} articles about CBD and medical conditions.

Author profile:
- Name: Robin Roy Krigslund-Hansen
- Title: Founder & Editor
- Experience: 12+ years in CBD industry
- Has reviewed 700+ CBD research studies

IMPORTANT RULES:
1. Write in first person as Robin ("I've reviewed...", "In my experience...")
2. Be honest about evidence strength - don't oversell weak evidence
${hasResearch ? '3. Every claim needs a citation with internal link format: [study year](/research/study/[slug])\n4. Use specific numbers from studies, not vague claims' : '3. Clearly state when research is limited or unavailable\n4. Focus on general CBD knowledge and safety information'}
5. Reading level: Grade 8-10 (15-year-old can understand)
6. NO medical jargon without explanation
7. Include the "My Take" section with genuine author perspective
8. European focus (not US-centric)
9. DO NOT claim CBD "treats" or "cures" anything
10. Always mention to consult a healthcare professional
${!hasResearch ? '11. Be extra cautious with claims when no specific research exists\n12. Focus on mechanism of action, safety, and general CBD education' : ''}`;

    const userPromptBase = hasResearch
      ? `Generate comprehensive article content for "CBD and ${conditionName}" following this exact structure.`
      : `Generate educational article content for "CBD and ${conditionName}". Note: There is limited specific research on CBD for this condition, so focus on general CBD education, safety, and honest assessment.`;

    const userPrompt = hasResearch ? `${userPromptBase}

EVIDENCE ANALYSIS:
- Total studies: ${evidence.totalStudies}
- Human studies: ${evidence.humanStudies}
- RCTs: ${evidence.rcts}
- Reviews/Meta-analyses: ${evidence.reviews + evidence.metaAnalyses}
- Total participants: ${evidence.totalParticipants}
- Evidence level: ${evidence.evidenceLevel}
- Target length: ${evidence.targetWordCount.min}-${evidence.targetWordCount.max} words

TOP STUDIES:
${topStudiesSummary}

SHORT DESCRIPTION:
${condition.short_description || 'No description available'}

Generate HTML content with these sections (use proper HTML tags):

1. <section class="short-answer">
   THE SHORT ANSWER (50-100 words)
   Answer immediately: Does CBD help with ${conditionName}?
   State: what research suggests + evidence strength + key caveat
</section>

2. <section class="research-snapshot">
   RESEARCH SNAPSHOT BOX (format as styled box)
   Include: studies reviewed, human trials, reviews, total participants, strongest evidence for, typical dosages studied, evidence strength visual
</section>

${evidence.evidenceLevel !== 'Insufficient' ? `
3. <section class="key-numbers">
   KEY NUMBERS BOX (2-4 quotable stats)
   Format: big number + what it means + source
</section>
` : ''}

4. <section class="what-research-shows">
   WHAT THE RESEARCH SHOWS
   <h2>The Best Evidence</h2>
   - Most important clinical trial findings with specific numbers
   - Author interpretation: "What I find significant..."

   <h2>What Reviews Conclude</h2>
   - Summary of systematic reviews if any

   <h2>Supporting Evidence</h2>
   - Brief mention of other studies (animal, observational)
</section>

${evidence.topStudies.length > 0 ? `
5. <section class="studies-worth-knowing">
   STUDIES WORTH KNOWING (2-3 highlighted)
   For each study include:
   - Short title with year
   - What they did (1-2 sentences plain language)
   - Key finding with specific numbers
   - Sample size and type
   - Why it matters (author perspective)
   - Link: [View study summary](/research/study/[slug])
</section>
` : ''}

6. <section class="how-cbd-might-help">
   HOW CBD MIGHT HELP WITH ${conditionName.toUpperCase()}
   - Mechanism of action in plain language
   - Use analogies where helpful
   - Mention endocannabinoid system, receptors if relevant
</section>

${evidence.humanStudies > 0 ? `
7. <section class="dosages-studied">
   WHAT DOSAGES HAVE BEEN STUDIED
   - NOT medical advice - what research actually used
   - Range of doses from studies
   - "Most clinical trials used between X and Y mg..."
</section>
` : ''}

8. <section class="my-take">
   MY TAKE
   Write genuine author perspective based on evidence level (${evidence.evidenceLevel}):
   - Overall impression of the evidence
   - What's most promising or concerning
   - What I'd tell someone considering CBD for this
   - What future research I'm watching for
</section>

9. <section class="faq">
   FAQ (4-5 questions)
   Include relevant questions like:
   - Can CBD cure ${conditionName}?
   - How much CBD for ${conditionName}?
   - How long does CBD take to work?
   - Can I take CBD with my medications?
   - What type of CBD is best?
</section>

10. <section class="references">
    REFERENCES
    List the key studies cited with:
    - Author (Year). Title.
    - [Summary](/research/study/[slug]) • [PubMed](link) if available
    - Include: [View all studies on CBD and ${conditionName}](/research/${conditionSlug})
</section>

Remember:
- Use the actual study slugs for internal links
- Be specific with numbers (40% reduction, 300mg dose, 57 participants)
- Match the tone to evidence level (confident if strong, cautious if limited)
- Include proper HTML structure with classes for styling`
    : `${userPromptBase}

CONDITION: ${conditionName}
SHORT DESCRIPTION: ${condition.short_description || 'No description available'}
TARGET LENGTH: 600-900 words (shorter since limited research)

Generate HTML content with these sections (use proper HTML tags):

1. <section class="short-answer">
   THE SHORT ANSWER (50-100 words)
   Be honest: There is limited specific research on CBD for ${conditionName}.
   Explain what we know about CBD in general that might be relevant.
   Emphasize the importance of consulting a healthcare provider.
</section>

2. <section class="research-snapshot">
   <h3>Research Status</h3>
   - Clearly state: "Limited specific research available"
   - Mention if there's related research (e.g., for broader categories)
   - Include what general CBD research tells us
</section>

3. <section class="what-we-know">
   <h2>What We Know About CBD</h2>
   - General CBD effects that might be relevant to ${conditionName}
   - How the endocannabinoid system relates to this condition
   - Related conditions where CBD has been studied
   - Be clear about the distinction between studied vs speculated benefits
</section>

4. <section class="how-cbd-might-help">
   <h2>How CBD Might Potentially Help</h2>
   - Theoretical mechanisms (clearly labeled as theoretical)
   - Related pathways CBD affects
   - Use cautious language: "may potentially", "some researchers suggest"
</section>

5. <section class="safety-considerations">
   <h2>Safety Considerations</h2>
   - General CBD safety profile
   - Potential drug interactions to discuss with doctor
   - Importance of quality products (third-party testing)
   - Starting low and going slow
</section>

6. <section class="my-take">
   <h2>My Take</h2>
   Write genuine author perspective:
   - Be honest about the lack of specific research
   - Share what you'd tell someone asking about this
   - Emphasize importance of medical guidance
   - Mention any promising directions for future research
</section>

7. <section class="faq">
   <h2>Frequently Asked Questions</h2>
   FAQ (3-4 questions)
   - Is there research on CBD for ${conditionName}?
   - Is CBD safe to try?
   - What should I look for in a CBD product?
   - Should I talk to my doctor before trying CBD?
</section>

8. <section class="references">
   <h2>References & Further Reading</h2>
   - Link to general CBD research: [Explore CBD Research](/research)
   - Link to related conditions if applicable
   - Note that this page will be updated as research emerges
</section>

Remember:
- Be honest about the limited specific research
- Focus on safety and education
- Use cautious, measured language
- Recommend consulting healthcare providers
- Include proper HTML structure with classes for styling`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 8000,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userPrompt
          }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('[Generate Condition Content] API error:', response.status, errorData);
      return NextResponse.json({ error: `API error: ${response.status}` }, { status: 500 });
    }

    const data = await response.json();
    const generatedContent = data.content?.[0]?.text?.trim();

    if (!generatedContent) {
      return NextResponse.json({ error: 'No content generated' }, { status: 500 });
    }

    // If preview mode, don't save
    if (preview) {
      return NextResponse.json({
        success: true,
        preview: true,
        condition: condition.name,
        evidenceAnalysis: evidence,
        content: generatedContent
      });
    }

    // Save the generated content to the condition
    const { error: updateError } = await supabase
      .from('kb_conditions')
      .update({
        description: generatedContent,
        research_count: evidence.totalStudies,
        updated_at: new Date().toISOString()
      })
      .eq('id', condition.id);

    if (updateError) {
      console.error('Update error:', updateError);
      return NextResponse.json({ error: 'Failed to save content' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      condition: condition.name,
      evidenceAnalysis: evidence,
      contentLength: generatedContent.length,
      saved: true
    });

  } catch (error) {
    console.error('[Generate Condition Content] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// GET endpoint to fetch generation status for all conditions
export async function GET() {
  try {
    const supabase = createServiceClient();

    const { data: conditions, error } = await supabase
      .from('kb_conditions')
      .select('id, slug, name, display_name, description, research_count, updated_at')
      .eq('is_published', true)
      .order('display_order', { ascending: true });

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch conditions' }, { status: 500 });
    }

    const stats = {
      total: conditions?.length || 0,
      withContent: conditions?.filter(c => c.description && c.description.length > 500).length || 0,
      needsContent: conditions?.filter(c => !c.description || c.description.length < 500).length || 0,
      conditions: conditions?.map(c => ({
        slug: c.slug,
        name: c.display_name || c.name,
        hasContent: c.description && c.description.length > 500,
        contentLength: c.description?.length || 0,
        researchCount: c.research_count || 0,
        lastUpdated: c.updated_at
      }))
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('[Get Conditions Status] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
