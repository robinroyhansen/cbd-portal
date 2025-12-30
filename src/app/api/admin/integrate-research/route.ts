import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    // Verify admin authentication
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized - Bearer token required' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized - Invalid token' }, { status: 401 });
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('is_admin')
      .eq('user_id', user.id)
      .single();

    if (!profile?.is_admin) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const { researchId, articleIds } = await request.json();

    if (!researchId || !Array.isArray(articleIds) || articleIds.length === 0) {
      return NextResponse.json({
        error: 'Invalid request - researchId and articleIds array required'
      }, { status: 400 });
    }

    // Get the research item
    const { data: research, error: researchError } = await supabase
      .from('kb_research_queue')
      .select('*')
      .eq('id', researchId)
      .eq('status', 'approved')
      .single();

    if (researchError || !research) {
      return NextResponse.json({
        error: 'Research not found or not approved'
      }, { status: 404 });
    }

    // Prepare citation data
    const citationData = {
      title: research.title,
      authors: research.authors,
      publication: research.publication,
      year: research.year,
      url: research.url,
      doi: research.doi,
      abstract: research.abstract
    };

    const integrationResults = [];
    let successCount = 0;
    let errorCount = 0;

    // For each article, create a citation and link it
    for (const articleId of articleIds) {
      try {
        // Verify the article exists
        const { data: article, error: articleError } = await supabase
          .from('kb_articles')
          .select('id, title')
          .eq('id', articleId)
          .single();

        if (articleError || !article) {
          integrationResults.push({
            articleId,
            success: false,
            error: 'Article not found'
          });
          errorCount++;
          continue;
        }

        // Create the citation
        const { data: citation, error: citationError } = await supabase
          .from('kb_citations')
          .insert({
            ...citationData,
            article_id: articleId
          })
          .select('id')
          .single();

        if (citationError) {
          integrationResults.push({
            articleId,
            articleTitle: article.title,
            success: false,
            error: citationError.message
          });
          errorCount++;
          continue;
        }

        // Link the research to the article
        const { error: linkError } = await supabase
          .from('kb_article_research')
          .insert({
            article_id: articleId,
            research_id: researchId
          });

        if (linkError) {
          // If linking fails, we should delete the citation to maintain consistency
          await supabase
            .from('kb_citations')
            .delete()
            .eq('id', citation.id);

          integrationResults.push({
            articleId,
            articleTitle: article.title,
            success: false,
            error: `Failed to link research: ${linkError.message}`
          });
          errorCount++;
          continue;
        }

        integrationResults.push({
          articleId,
          articleTitle: article.title,
          citationId: citation.id,
          success: true
        });
        successCount++;

      } catch (error) {
        integrationResults.push({
          articleId,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        errorCount++;
      }
    }

    console.log(`🔗 Research integration completed: ${successCount} success, ${errorCount} errors`);

    return NextResponse.json({
      success: true,
      researchId,
      totalArticles: articleIds.length,
      successCount,
      errorCount,
      results: integrationResults
    });

  } catch (error) {
    console.error('💥 Research integration failed:', error);
    return NextResponse.json({
      error: 'Integration failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Get suggestions for which articles might be relevant for a research item
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const researchId = searchParams.get('researchId');

    if (!researchId) {
      return NextResponse.json({ error: 'researchId required' }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get the research item
    const { data: research, error: researchError } = await supabase
      .from('kb_research_queue')
      .select('*')
      .eq('id', researchId)
      .single();

    if (researchError || !research) {
      return NextResponse.json({ error: 'Research not found' }, { status: 404 });
    }

    // Get all articles
    const { data: articles, error: articlesError } = await supabase
      .from('kb_articles')
      .select('id, title, slug, category:kb_categories(name), created_at')
      .order('created_at', { ascending: false });

    if (articlesError) {
      return NextResponse.json({ error: 'Failed to fetch articles' }, { status: 500 });
    }

    // Score articles by relevance to the research topics
    const scoredArticles = articles?.map(article => {
      let score = 0;
      const titleLower = article.title.toLowerCase();

      // Check if any research topics match the article title
      if (research.relevant_topics) {
        for (const topic of research.relevant_topics) {
          if (titleLower.includes(topic.toLowerCase())) {
            score += 10;
          }
        }
      }

      // Boost score for certain keywords in the title
      const keywordBoosts = {
        'cbd': 5,
        'cannabidiol': 5,
        'cannabis': 4,
        'anxiety': 3,
        'pain': 3,
        'sleep': 3,
        'epilepsy': 4,
        'depression': 3,
        'inflammation': 3
      };

      for (const [keyword, boost] of Object.entries(keywordBoosts)) {
        if (titleLower.includes(keyword)) {
          score += boost;
        }
      }

      return {
        ...article,
        relevanceScore: score
      };
    }).filter(article => article.relevanceScore > 0)
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 10); // Top 10 most relevant

    return NextResponse.json({
      research,
      suggestedArticles: scoredArticles || []
    });

  } catch (error) {
    console.error('💥 Article suggestion failed:', error);
    return NextResponse.json({
      error: 'Suggestion failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}