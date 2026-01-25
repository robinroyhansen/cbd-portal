import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { requireAdminAuth } from '@/lib/admin-api-auth';
import {
  SUPPORTED_LANGUAGES,
  type LanguageCode,
} from '@/lib/translation-service';

type ContentType = 'conditions' | 'glossary' | 'articles' | 'research';

interface MissingItem {
  id: string;
  name: string;
  description?: string;
  missingLanguages: LanguageCode[];
  translatedLanguages: LanguageCode[];
}

interface MissingResponse {
  contentType: ContentType;
  targetLanguage?: LanguageCode;
  total: number;
  missing: number;
  items: MissingItem[];
}

export async function GET(request: NextRequest) {
  const authError = requireAdminAuth(request);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const contentType = searchParams.get('type') as ContentType;
    const targetLanguage = searchParams.get('language') as LanguageCode | null;
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    if (!contentType) {
      return NextResponse.json(
        { error: 'Content type is required (conditions, glossary, articles, research)' },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    // Get target languages to check (exclude English)
    const languagesToCheck = targetLanguage
      ? [targetLanguage]
      : (Object.keys(SUPPORTED_LANGUAGES).filter((l) => l !== 'en') as LanguageCode[]);

    let sourceItems: Array<{ id: string; name: string; description?: string }> = [];
    let existingTranslations: Map<string, Set<string>> = new Map();
    let totalCount = 0;

    switch (contentType) {
      case 'conditions': {
        // Get source items
        const { data: conditions, count } = await supabase
          .from('kb_conditions')
          .select('id, name, short_description', { count: 'exact' })
          .eq('is_published', true)
          .order('name')
          .range(offset, offset + limit - 1);

        totalCount = count || 0;
        sourceItems = (conditions || []).map((c) => ({
          id: c.id,
          name: c.name,
          description: c.short_description,
        }));

        // Get existing translations
        const { data: translations } = await supabase
          .from('condition_translations')
          .select('condition_id, language');

        if (translations) {
          translations.forEach((t) => {
            if (!existingTranslations.has(t.condition_id)) {
              existingTranslations.set(t.condition_id, new Set());
            }
            existingTranslations.get(t.condition_id)!.add(t.language);
          });
        }
        break;
      }

      case 'glossary': {
        const { data: terms, count } = await supabase
          .from('kb_glossary')
          .select('id, term, definition', { count: 'exact' })
          .order('term')
          .range(offset, offset + limit - 1);

        totalCount = count || 0;
        sourceItems = (terms || []).map((t) => ({
          id: t.id,
          name: t.term,
          description: t.definition?.substring(0, 100) + (t.definition?.length > 100 ? '...' : ''),
        }));

        const { data: translations } = await supabase
          .from('glossary_translations')
          .select('term_id, language');

        if (translations) {
          translations.forEach((t) => {
            if (!existingTranslations.has(t.term_id)) {
              existingTranslations.set(t.term_id, new Set());
            }
            existingTranslations.get(t.term_id)!.add(t.language);
          });
        }
        break;
      }

      case 'articles': {
        const { data: articles, count } = await supabase
          .from('kb_articles')
          .select('id, title, meta_description', { count: 'exact' })
          .eq('status', 'published')
          .order('title')
          .range(offset, offset + limit - 1);

        totalCount = count || 0;
        sourceItems = (articles || []).map((a) => ({
          id: a.id,
          name: a.title,
          description: a.meta_description,
        }));

        const { data: translations } = await supabase
          .from('article_translations')
          .select('article_id, language');

        if (translations) {
          translations.forEach((t) => {
            if (!existingTranslations.has(t.article_id)) {
              existingTranslations.set(t.article_id, new Set());
            }
            existingTranslations.get(t.article_id)!.add(t.language);
          });
        }
        break;
      }

      case 'research': {
        const { data: research, count } = await supabase
          .from('kb_research_queue')
          .select('id, title, plain_summary', { count: 'exact' })
          .eq('status', 'approved')
          .not('plain_summary', 'is', null)
          .order('title')
          .range(offset, offset + limit - 1);

        totalCount = count || 0;
        sourceItems = (research || []).map((r) => ({
          id: r.id,
          name: r.title,
          description: r.plain_summary?.substring(0, 100) + (r.plain_summary?.length > 100 ? '...' : ''),
        }));

        const { data: translations } = await supabase
          .from('research_translations')
          .select('research_id, language');

        if (translations) {
          translations.forEach((t) => {
            if (!existingTranslations.has(t.research_id)) {
              existingTranslations.set(t.research_id, new Set());
            }
            existingTranslations.get(t.research_id)!.add(t.language);
          });
        }
        break;
      }

      default:
        return NextResponse.json(
          { error: `Invalid content type: ${contentType}` },
          { status: 400 }
        );
    }

    // Build response with missing/translated status
    const items: MissingItem[] = sourceItems.map((item) => {
      const translatedSet = existingTranslations.get(item.id) || new Set();

      const missingLanguages: LanguageCode[] = [];
      const translatedLanguages: LanguageCode[] = [];

      languagesToCheck.forEach((lang) => {
        if (translatedSet.has(lang)) {
          translatedLanguages.push(lang);
        } else {
          missingLanguages.push(lang);
        }
      });

      return {
        id: item.id,
        name: item.name,
        description: item.description,
        missingLanguages,
        translatedLanguages,
      };
    });

    // Filter to only items with missing translations if a specific language is requested
    const filteredItems = targetLanguage
      ? items.filter((item) => item.missingLanguages.length > 0)
      : items;

    const missingCount = filteredItems.filter((item) => item.missingLanguages.length > 0).length;

    const response: MissingResponse = {
      contentType,
      targetLanguage: targetLanguage || undefined,
      total: totalCount,
      missing: missingCount,
      items: filteredItems,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Failed to get missing translations:', error);
    return NextResponse.json(
      {
        error: 'Failed to get missing translations',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
