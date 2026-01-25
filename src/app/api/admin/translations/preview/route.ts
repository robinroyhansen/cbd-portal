import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { requireAdminAuth } from '@/lib/admin-api-auth';
import {
  getTranslationService,
  SUPPORTED_LANGUAGES,
  type LanguageCode,
} from '@/lib/translation-service';

type ContentType = 'conditions' | 'glossary' | 'articles' | 'research';

interface PreviewRequest {
  contentType: ContentType;
  id: string;
  targetLanguage: LanguageCode;
}

interface PreviewResponse {
  success: boolean;
  original: Record<string, unknown>;
  translation: Record<string, unknown>;
  qualityIndicators: {
    characterCount: {
      original: number;
      translated: number;
      ratio: number;
    };
    wordCount: {
      original: number;
      translated: number;
      ratio: number;
    };
    preservedTerms: string[];
    warnings: string[];
  };
}

// Terms that should be preserved exactly (not translated)
const PRESERVED_TERMS = [
  'CBD',
  'THC',
  'CBG',
  'CBN',
  'CBDA',
  'THCA',
  'mg',
  'ml',
  '%',
  'Epidiolex',
  'FDA',
  'EMA',
];

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function checkPreservedTerms(
  original: string,
  translated: string
): { preserved: string[]; missing: string[] } {
  const preserved: string[] = [];
  const missing: string[] = [];

  PRESERVED_TERMS.forEach((term) => {
    const originalHas = original.toLowerCase().includes(term.toLowerCase());
    const translatedHas = translated.toLowerCase().includes(term.toLowerCase());

    if (originalHas) {
      if (translatedHas) {
        preserved.push(term);
      } else {
        missing.push(term);
      }
    }
  });

  return { preserved, missing };
}

function generateQualityWarnings(
  original: Record<string, string>,
  translated: Record<string, string>
): string[] {
  const warnings: string[] = [];

  Object.keys(original).forEach((key) => {
    const origText = original[key] || '';
    const transText = translated[key] || '';

    if (!origText || !transText) return;

    // Check for significant length changes
    const lengthRatio = transText.length / origText.length;
    if (lengthRatio < 0.5) {
      warnings.push(`${key}: Translation is significantly shorter (${Math.round(lengthRatio * 100)}% of original)`);
    } else if (lengthRatio > 2) {
      warnings.push(`${key}: Translation is significantly longer (${Math.round(lengthRatio * 100)}% of original)`);
    }

    // Check for preserved terms
    const { missing } = checkPreservedTerms(origText, transText);
    if (missing.length > 0) {
      warnings.push(`${key}: Missing preserved terms: ${missing.join(', ')}`);
    }

    // Check for URL preservation
    const urlPattern = /https?:\/\/[^\s]+/g;
    const originalUrls = origText.match(urlPattern) || [];
    const translatedUrls = transText.match(urlPattern) || [];

    if (originalUrls.length !== translatedUrls.length) {
      warnings.push(`${key}: URL count mismatch (original: ${originalUrls.length}, translated: ${translatedUrls.length})`);
    }
  });

  return warnings;
}

export async function POST(request: NextRequest) {
  const authError = requireAdminAuth(request);
  if (authError) return authError;

  try {
    const body: PreviewRequest = await request.json();
    const { contentType, id, targetLanguage } = body;

    // Validate inputs
    if (!contentType || !id || !targetLanguage) {
      return NextResponse.json(
        { error: 'Missing required fields: contentType, id, targetLanguage' },
        { status: 400 }
      );
    }

    if (!(targetLanguage in SUPPORTED_LANGUAGES) || targetLanguage === 'en') {
      return NextResponse.json(
        { error: `Invalid target language: ${targetLanguage}` },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();
    const translationService = getTranslationService();

    let original: Record<string, unknown> = {};
    let translation: Record<string, unknown> = {};
    let originalTexts: Record<string, string> = {};
    let translatedTexts: Record<string, string> = {};

    switch (contentType) {
      case 'conditions': {
        const { data, error } = await supabase
          .from('kb_conditions')
          .select('id, name, display_name, short_description, meta_title, meta_description')
          .eq('id', id)
          .single();

        if (error || !data) {
          return NextResponse.json({ error: 'Condition not found' }, { status: 404 });
        }

        original = data;
        originalTexts = {
          name: data.name || '',
          displayName: data.display_name || '',
          shortDescription: data.short_description || '',
          metaTitle: data.meta_title || '',
          metaDescription: data.meta_description || '',
        };

        const result = await translationService.translateCondition(
          {
            name: data.name,
            displayName: data.display_name,
            shortDescription: data.short_description,
            metaTitle: data.meta_title,
            metaDescription: data.meta_description,
          },
          targetLanguage
        );

        translation = result;
        translatedTexts = {
          name: result.name || '',
          displayName: result.displayName || '',
          shortDescription: result.shortDescription || '',
          metaTitle: result.metaTitle || '',
          metaDescription: result.metaDescription || '',
        };
        break;
      }

      case 'glossary': {
        const { data, error } = await supabase
          .from('kb_glossary')
          .select('id, term, definition, simple_definition')
          .eq('id', id)
          .single();

        if (error || !data) {
          return NextResponse.json({ error: 'Glossary term not found' }, { status: 404 });
        }

        original = data;
        originalTexts = {
          term: data.term || '',
          definition: data.definition || '',
          simpleDefinition: data.simple_definition || '',
        };

        const result = await translationService.translateGlossaryTerm(
          {
            term: data.term,
            definition: data.definition,
            simpleDefinition: data.simple_definition,
          },
          targetLanguage
        );

        translation = result;
        translatedTexts = {
          term: result.term || '',
          definition: result.definition || '',
          simpleDefinition: result.simpleDefinition || '',
        };
        break;
      }

      case 'articles': {
        const { data, error } = await supabase
          .from('kb_articles')
          .select('id, slug, title, content, meta_description')
          .eq('id', id)
          .single();

        if (error || !data) {
          return NextResponse.json({ error: 'Article not found' }, { status: 404 });
        }

        original = data;
        originalTexts = {
          title: data.title || '',
          content: data.content || '',
          metaDescription: data.meta_description || '',
        };

        const result = await translationService.translateArticle(
          {
            title: data.title,
            content: data.content,
            metaDescription: data.meta_description,
            slug: data.slug,
          },
          targetLanguage
        );

        translation = result;
        translatedTexts = {
          title: result.title || '',
          content: result.content || '',
          metaDescription: result.metaDescription || '',
        };
        break;
      }

      case 'research': {
        const { data, error } = await supabase
          .from('kb_research_queue')
          .select('id, title, plain_summary')
          .eq('id', id)
          .single();

        if (error || !data) {
          return NextResponse.json({ error: 'Research not found' }, { status: 404 });
        }

        if (!data.plain_summary) {
          return NextResponse.json(
            { error: 'Research has no plain summary to translate' },
            { status: 400 }
          );
        }

        original = data;
        originalTexts = {
          plainSummary: data.plain_summary || '',
        };

        const translatedSummary = await translationService.translateResearchSummary(
          data.plain_summary,
          targetLanguage
        );

        translation = {
          plainSummary: translatedSummary,
        };
        translatedTexts = {
          plainSummary: translatedSummary || '',
        };
        break;
      }

      default:
        return NextResponse.json(
          { error: `Invalid content type: ${contentType}` },
          { status: 400 }
        );
    }

    // Calculate quality indicators
    const allOriginalText = Object.values(originalTexts).join(' ');
    const allTranslatedText = Object.values(translatedTexts).join(' ');

    const originalCharCount = allOriginalText.length;
    const translatedCharCount = allTranslatedText.length;
    const originalWordCount = countWords(allOriginalText);
    const translatedWordCount = countWords(allTranslatedText);

    const { preserved } = checkPreservedTerms(allOriginalText, allTranslatedText);
    const warnings = generateQualityWarnings(originalTexts, translatedTexts);

    const response: PreviewResponse = {
      success: true,
      original,
      translation,
      qualityIndicators: {
        characterCount: {
          original: originalCharCount,
          translated: translatedCharCount,
          ratio: originalCharCount > 0 ? translatedCharCount / originalCharCount : 0,
        },
        wordCount: {
          original: originalWordCount,
          translated: translatedWordCount,
          ratio: originalWordCount > 0 ? translatedWordCount / originalWordCount : 0,
        },
        preservedTerms: preserved,
        warnings,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Translation preview error:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate translation preview',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
