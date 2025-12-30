import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Map topics to article slugs
const TOPIC_TO_SLUGS: Record<string, string[]> = {
  'anxiety': ['cbd-and-anxiety', 'cbd-and-stress', 'cbd-and-ptsd'],
  'sleep': ['cbd-and-sleep'],
  'pain': ['cbd-and-pain', 'cbd-and-fibromyalgia', 'cbd-and-arthritis'],
  'epilepsy': ['cbd-and-epilepsy'],
  'depression': ['cbd-and-depression'],
  'inflammation': ['cbd-and-inflammation', 'cbd-and-arthritis'],
  'arthritis': ['cbd-and-arthritis', 'cbd-and-pain'],
  'ptsd': ['cbd-and-ptsd', 'cbd-and-anxiety'],
  'stress': ['cbd-and-stress', 'cbd-and-anxiety'],
  'cancer': ['cbd-and-cancer'],
  'neurological': ['cbd-and-alzheimers', 'cbd-and-parkinsons', 'cbd-and-multiple-sclerosis'],
  'addiction': ['cbd-and-addiction'],
  'nausea': ['cbd-and-nausea', 'cbd-and-cancer'],
  'skin': ['cbd-and-eczema'],
  'ibs': ['cbd-and-ibs'],
  'crohns': ['cbd-and-crohns', 'cbd-and-ibs'],
  'diabetes': ['cbd-and-diabetes'],
  'migraine': ['cbd-and-migraines'],
  'heart': ['cbd-and-heart-disease'],
  'adhd': ['cbd-and-adhd'],
  'glaucoma': ['cbd-and-glaucoma']
};

export async function POST(request: Request) {
  try {
    const { researchId } = await request.json();

    // Get the research item
    const { data: research, error: researchError } = await supabase
      .from('kb_research_queue')
      .select('*')
      .eq('id', researchId)
      .single();

    if (researchError || !research) {
      return NextResponse.json({ error: 'Research not found' }, { status: 404 });
    }

    // Find all matching article slugs based on topics
    const matchingSlugs: string[] = [];
    for (const topic of research.relevant_topics || []) {
      const slugs = TOPIC_TO_SLUGS[topic.toLowerCase()] || [];
      matchingSlugs.push(...slugs);
    }

    // If no topic matches, try to match based on title/abstract keywords
    if (matchingSlugs.length === 0) {
      const text = `${research.title} ${research.abstract || ''}`.toLowerCase();
      for (const [topic, slugs] of Object.entries(TOPIC_TO_SLUGS)) {
        if (text.includes(topic)) {
          matchingSlugs.push(...slugs);
        }
      }
    }

    const uniqueSlugs = [...new Set(matchingSlugs)];

    // Get all matching articles (across ALL languages)
    const { data: articles } = await supabase
      .from('kb_articles')
      .select('id, slug, language, title')
      .in('slug', uniqueSlugs);

    const addedTo: string[] = [];
    const errors: string[] = [];

    for (const article of articles || []) {
      // Check if citation already exists
      const { data: existing } = await supabase
        .from('kb_citations')
        .select('id')
        .eq('article_id', article.id)
        .eq('url', research.url)
        .single();

      if (existing) {
        continue; // Already added
      }

      // Add citation
      const { error: insertError } = await supabase
        .from('kb_citations')
        .insert({
          article_id: article.id,
          title: research.title,
          authors: research.authors,
          publication: research.publication,
          year: research.year,
          url: research.url,
          doi: research.doi
        });

      if (insertError) {
        errors.push(`${article.slug}: ${insertError.message}`);
      } else {
        addedTo.push(`${article.slug} (${article.language})`);
      }
    }

    // Track the integration
    if (articles && articles.length > 0) {
      for (const article of articles) {
        await supabase
          .from('kb_article_research')
          .upsert({
            article_id: article.id,
            research_id: researchId
          }, { onConflict: 'article_id,research_id' });
      }
    }

    return NextResponse.json({
      success: true,
      addedTo,
      errors,
      message: `Citation added to ${addedTo.length} articles`
    });

  } catch (error) {
    console.error('Integration error:', error);
    return NextResponse.json({ error: 'Integration failed' }, { status: 500 });
  }
}