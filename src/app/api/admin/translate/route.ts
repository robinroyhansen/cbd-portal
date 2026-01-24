import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  getTranslationService,
  type LanguageCode,
  SUPPORTED_LANGUAGES,
} from '@/lib/translation-service';

// Verify admin authorization
function isAuthorized(request: NextRequest): boolean {
  const authHeader = request.headers.get('Authorization');
  const adminSecret = process.env.ADMIN_API_SECRET;

  if (!adminSecret) {
    console.error('ADMIN_API_SECRET not configured');
    return false;
  }

  return authHeader === `Bearer ${adminSecret}`;
}

// Create Supabase client with service role
function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error('Missing Supabase environment variables');
  }

  return createClient(url, key);
}

export async function POST(request: NextRequest) {
  // Check authorization
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { type, id, targetLanguage } = body as {
      type: 'article' | 'condition' | 'glossary' | 'research' | 'text';
      id?: string;
      targetLanguage: string;
      text?: string;
      context?: string;
    };

    // Validate language
    if (!targetLanguage || !(targetLanguage in SUPPORTED_LANGUAGES)) {
      return NextResponse.json(
        { error: `Invalid target language: ${targetLanguage}` },
        { status: 400 }
      );
    }

    const lang = targetLanguage as LanguageCode;
    const translationService = getTranslationService();
    const supabase = getSupabase();

    switch (type) {
      case 'text': {
        const { text, context } = body;
        if (!text) {
          return NextResponse.json({ error: 'Text is required' }, { status: 400 });
        }

        const result = await translationService.translateText(text, lang, context);
        return NextResponse.json(result);
      }

      case 'article': {
        if (!id) {
          return NextResponse.json({ error: 'Article ID is required' }, { status: 400 });
        }

        // Fetch article
        const { data: article, error: fetchError } = await supabase
          .from('kb_articles')
          .select('id, slug, title, content, meta_description')
          .eq('id', id)
          .single();

        if (fetchError || !article) {
          return NextResponse.json({ error: 'Article not found' }, { status: 404 });
        }

        // Translate
        const translation = await translationService.translateArticle(article, lang);

        // Save translation
        const { error: saveError } = await supabase.from('article_translations').upsert(
          {
            article_id: id,
            language: lang,
            slug: translation.slug,
            title: translation.title,
            content: translation.content,
            excerpt: translation.excerpt,
            meta_title: translation.metaTitle,
            meta_description: translation.metaDescription,
            translated_at: new Date().toISOString(),
          },
          { onConflict: 'article_id,language' }
        );

        if (saveError) {
          console.error('Failed to save article translation:', saveError);
          return NextResponse.json(
            { error: 'Failed to save translation', details: saveError },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          translation,
        });
      }

      case 'condition': {
        if (!id) {
          return NextResponse.json({ error: 'Condition ID is required' }, { status: 400 });
        }

        // Fetch condition
        const { data: condition, error: fetchError } = await supabase
          .from('kb_conditions')
          .select('id, name, display_name, short_description, meta_title, meta_description')
          .eq('id', id)
          .single();

        if (fetchError || !condition) {
          return NextResponse.json({ error: 'Condition not found' }, { status: 404 });
        }

        // Translate
        const translation = await translationService.translateCondition(condition, lang);

        // Save translation
        const { error: saveError } = await supabase.from('condition_translations').upsert(
          {
            condition_id: id,
            language: lang,
            name: translation.name,
            display_name: translation.displayName,
            short_description: translation.shortDescription,
            meta_title: translation.metaTitle,
            meta_description: translation.metaDescription,
            translated_at: new Date().toISOString(),
          },
          { onConflict: 'condition_id,language' }
        );

        if (saveError) {
          console.error('Failed to save condition translation:', saveError);
          return NextResponse.json(
            { error: 'Failed to save translation', details: saveError },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          translation,
        });
      }

      case 'glossary': {
        if (!id) {
          return NextResponse.json({ error: 'Term ID is required' }, { status: 400 });
        }

        // Fetch glossary term
        const { data: term, error: fetchError } = await supabase
          .from('kb_glossary')
          .select('id, term, definition, simple_definition')
          .eq('id', id)
          .single();

        if (fetchError || !term) {
          return NextResponse.json({ error: 'Glossary term not found' }, { status: 404 });
        }

        // Translate
        const translation = await translationService.translateGlossaryTerm(term, lang);

        // Save translation
        const { error: saveError } = await supabase.from('glossary_translations').upsert(
          {
            term_id: id,
            language: lang,
            term: translation.term,
            definition: translation.definition,
            simple_definition: translation.simpleDefinition,
            translated_at: new Date().toISOString(),
          },
          { onConflict: 'term_id,language' }
        );

        if (saveError) {
          console.error('Failed to save glossary translation:', saveError);
          return NextResponse.json(
            { error: 'Failed to save translation', details: saveError },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          translation,
        });
      }

      case 'research': {
        if (!id) {
          return NextResponse.json({ error: 'Research ID is required' }, { status: 400 });
        }

        // Fetch research summary
        const { data: research, error: fetchError } = await supabase
          .from('kb_research_queue')
          .select('id, plain_summary')
          .eq('id', id)
          .single();

        if (fetchError || !research || !research.plain_summary) {
          return NextResponse.json({ error: 'Research not found or has no summary' }, { status: 404 });
        }

        // Translate
        const translatedSummary = await translationService.translateResearchSummary(
          research.plain_summary,
          lang
        );

        // Save translation
        const { error: saveError } = await supabase.from('research_translations').upsert(
          {
            research_id: id,
            language: lang,
            plain_summary: translatedSummary,
            translated_at: new Date().toISOString(),
          },
          { onConflict: 'research_id,language' }
        );

        if (saveError) {
          console.error('Failed to save research translation:', saveError);
          return NextResponse.json(
            { error: 'Failed to save translation', details: saveError },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          translation: { plain_summary: translatedSummary },
        });
      }

      default:
        return NextResponse.json(
          { error: `Unknown translation type: ${type}` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Translation error:', error);
    return NextResponse.json(
      { error: 'Translation failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// GET endpoint to check translation status
export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const language = searchParams.get('language');

  const supabase = getSupabase();

  try {
    let stats: Record<string, number> = {};

    if (!type || type === 'all') {
      // Get counts for all types
      const [articles, conditions, glossary, research] = await Promise.all([
        supabase
          .from('article_translations')
          .select('language', { count: 'exact', head: true })
          .eq('language', language || 'da'),
        supabase
          .from('condition_translations')
          .select('language', { count: 'exact', head: true })
          .eq('language', language || 'da'),
        supabase
          .from('glossary_translations')
          .select('language', { count: 'exact', head: true })
          .eq('language', language || 'da'),
        supabase
          .from('research_translations')
          .select('language', { count: 'exact', head: true })
          .eq('language', language || 'da'),
      ]);

      stats = {
        articles: articles.count || 0,
        conditions: conditions.count || 0,
        glossary: glossary.count || 0,
        research: research.count || 0,
      };
    }

    // Get total source counts
    const [totalArticles, totalConditions, totalGlossary, totalResearch] = await Promise.all([
      supabase.from('kb_articles').select('id', { count: 'exact', head: true }).eq('status', 'published'),
      supabase.from('kb_conditions').select('id', { count: 'exact', head: true }).eq('is_published', true),
      supabase.from('kb_glossary').select('id', { count: 'exact', head: true }),
      supabase
        .from('kb_research_queue')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'approved')
        .not('plain_summary', 'is', null),
    ]);

    return NextResponse.json({
      translated: stats,
      total: {
        articles: totalArticles.count || 0,
        conditions: totalConditions.count || 0,
        glossary: totalGlossary.count || 0,
        research: totalResearch.count || 0,
      },
      languages: Object.keys(SUPPORTED_LANGUAGES),
    });
  } catch (error) {
    console.error('Failed to get translation stats:', error);
    return NextResponse.json(
      { error: 'Failed to get translation stats' },
      { status: 500 }
    );
  }
}
