import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { requireAdminAuth } from '@/lib/admin-api-auth';
import {
  getTranslationService,
  SUPPORTED_LANGUAGES,
  type LanguageCode,
} from '@/lib/translation-service';

// Content types that can be bulk translated
type ContentType = 'conditions' | 'glossary' | 'articles' | 'research';

interface BulkTranslationRequest {
  contentType: ContentType;
  targetLanguages: LanguageCode[];
  ids?: string[]; // Optional: specific IDs to translate. If omitted, translates all missing
  batchSize?: number;
  preview?: boolean; // If true, returns preview without saving
}

interface TranslationResult {
  id: string;
  success: boolean;
  language: LanguageCode;
  error?: string;
  preview?: Record<string, unknown>;
}

interface BulkTranslationResponse {
  success: boolean;
  totalProcessed: number;
  successful: number;
  failed: number;
  results: TranslationResult[];
  errors: string[];
}

// Rate limiting - simple in-memory tracker
let isProcessing = false;
let lastProcessTime = 0;
const MIN_INTERVAL = 1000; // 1 second between API calls

async function waitForRateLimit() {
  const now = Date.now();
  const elapsed = now - lastProcessTime;
  if (elapsed < MIN_INTERVAL) {
    await new Promise((resolve) => setTimeout(resolve, MIN_INTERVAL - elapsed));
  }
  lastProcessTime = Date.now();
}

export async function POST(request: NextRequest) {
  const authError = requireAdminAuth(request);
  if (authError) return authError;

  if (isProcessing) {
    return NextResponse.json(
      { error: 'A bulk translation is already in progress. Please wait.' },
      { status: 429 }
    );
  }

  try {
    isProcessing = true;

    const body: BulkTranslationRequest = await request.json();
    const {
      contentType,
      targetLanguages,
      ids,
      batchSize = 10,
      preview = false,
    } = body;

    // Validate content type
    if (!['conditions', 'glossary', 'articles', 'research'].includes(contentType)) {
      return NextResponse.json(
        { error: `Invalid content type: ${contentType}` },
        { status: 400 }
      );
    }

    // Validate languages
    const validLanguages = targetLanguages.filter(
      (lang) => lang in SUPPORTED_LANGUAGES && lang !== 'en'
    );
    if (validLanguages.length === 0) {
      return NextResponse.json(
        { error: 'No valid target languages provided' },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();
    const translationService = getTranslationService();

    const results: TranslationResult[] = [];
    const errors: string[] = [];
    let successful = 0;
    let failed = 0;

    // Get items to translate
    let items: Record<string, unknown>[] = [];

    switch (contentType) {
      case 'conditions': {
        let query = supabase
          .from('kb_conditions')
          .select('id, name, display_name, short_description, meta_title, meta_description')
          .eq('is_published', true);

        if (ids && ids.length > 0) {
          query = query.in('id', ids);
        }

        const { data, error } = await query.limit(batchSize * validLanguages.length);
        if (error) throw error;
        items = data || [];
        break;
      }

      case 'glossary': {
        let query = supabase
          .from('kb_glossary')
          .select('id, term, definition, simple_definition');

        if (ids && ids.length > 0) {
          query = query.in('id', ids);
        }

        const { data, error } = await query.limit(batchSize * validLanguages.length);
        if (error) throw error;
        items = data || [];
        break;
      }

      case 'articles': {
        let query = supabase
          .from('kb_articles')
          .select('id, slug, title, content, meta_description')
          .eq('status', 'published');

        if (ids && ids.length > 0) {
          query = query.in('id', ids);
        }

        const { data, error } = await query.limit(batchSize * validLanguages.length);
        if (error) throw error;
        items = data || [];
        break;
      }

      case 'research': {
        let query = supabase
          .from('kb_research_queue')
          .select('id, plain_summary')
          .eq('status', 'approved')
          .not('plain_summary', 'is', null);

        if (ids && ids.length > 0) {
          query = query.in('id', ids);
        }

        const { data, error } = await query.limit(batchSize * validLanguages.length);
        if (error) throw error;
        items = data || [];
        break;
      }
    }

    if (items.length === 0) {
      return NextResponse.json({
        success: true,
        totalProcessed: 0,
        successful: 0,
        failed: 0,
        results: [],
        errors: [],
        message: 'No items found to translate',
      });
    }

    // Get existing translations to skip
    async function getExistingTranslations(
      tableName: string,
      idColumn: string
    ): Promise<Set<string>> {
      const { data } = await supabase
        .from(tableName)
        .select(`${idColumn}, language`);

      const existing = new Set<string>();
      if (data) {
        data.forEach((row: Record<string, string>) => {
          existing.add(`${row[idColumn]}_${row.language}`);
        });
      }
      return existing;
    }

    // Get existing translations for the content type
    let existingSet: Set<string>;
    let idColumn: string;
    let translationTable: string;

    switch (contentType) {
      case 'conditions':
        translationTable = 'condition_translations';
        idColumn = 'condition_id';
        existingSet = await getExistingTranslations(translationTable, idColumn);
        break;
      case 'glossary':
        translationTable = 'glossary_translations';
        idColumn = 'term_id';
        existingSet = await getExistingTranslations(translationTable, idColumn);
        break;
      case 'articles':
        translationTable = 'article_translations';
        idColumn = 'article_id';
        existingSet = await getExistingTranslations(translationTable, idColumn);
        break;
      case 'research':
        translationTable = 'research_translations';
        idColumn = 'research_id';
        existingSet = await getExistingTranslations(translationTable, idColumn);
        break;
    }

    // Process each item for each language
    let processed = 0;
    for (const item of items) {
      const itemId = item.id as string;

      for (const lang of validLanguages) {
        // Check if translation already exists
        const key = `${itemId}_${lang}`;
        if (existingSet.has(key)) {
          continue; // Skip existing translations
        }

        try {
          await waitForRateLimit();

          let translation: Record<string, unknown> | null = null;

          switch (contentType) {
            case 'conditions': {
              const condition = {
                name: item.name as string,
                displayName: item.display_name as string,
                shortDescription: item.short_description as string,
                metaTitle: item.meta_title as string,
                metaDescription: item.meta_description as string,
              };

              const result = await translationService.translateCondition(condition, lang);
              translation = {
                [idColumn]: itemId,
                language: lang,
                name: result.name,
                display_name: result.displayName,
                short_description: result.shortDescription,
                meta_title: result.metaTitle,
                meta_description: result.metaDescription,
                translated_at: new Date().toISOString(),
              };
              break;
            }

            case 'glossary': {
              const term = {
                term: item.term as string,
                definition: item.definition as string,
                simpleDefinition: item.simple_definition as string,
              };

              const result = await translationService.translateGlossaryTerm(term, lang);
              translation = {
                [idColumn]: itemId,
                language: lang,
                term: result.term,
                definition: result.definition,
                simple_definition: result.simpleDefinition,
                translated_at: new Date().toISOString(),
              };
              break;
            }

            case 'articles': {
              const article = {
                title: item.title as string,
                content: item.content as string,
                metaDescription: item.meta_description as string,
                slug: item.slug as string,
              };

              const result = await translationService.translateArticle(article, lang);
              translation = {
                [idColumn]: itemId,
                language: lang,
                slug: result.slug,
                title: result.title,
                content: result.content,
                excerpt: result.excerpt,
                meta_title: result.metaTitle,
                meta_description: result.metaDescription,
                translated_at: new Date().toISOString(),
              };
              break;
            }

            case 'research': {
              const summary = item.plain_summary as string;
              const translatedSummary = await translationService.translateResearchSummary(
                summary,
                lang
              );
              translation = {
                [idColumn]: itemId,
                language: lang,
                plain_summary: translatedSummary,
                translated_at: new Date().toISOString(),
              };
              break;
            }
          }

          if (translation) {
            if (preview) {
              // Return preview without saving
              results.push({
                id: itemId,
                success: true,
                language: lang,
                preview: translation,
              });
            } else {
              // Save to database
              const { error: saveError } = await supabase
                .from(translationTable)
                .upsert(translation, { onConflict: `${idColumn},language` });

              if (saveError) {
                throw saveError;
              }

              results.push({
                id: itemId,
                success: true,
                language: lang,
              });
            }
            successful++;
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Unknown error';
          results.push({
            id: itemId,
            success: false,
            language: lang,
            error: errorMessage,
          });
          errors.push(`Failed to translate ${contentType} ${itemId} to ${lang}: ${errorMessage}`);
          failed++;
        }

        processed++;

        // Limit to batch size
        if (processed >= batchSize) {
          break;
        }
      }

      if (processed >= batchSize) {
        break;
      }
    }

    const response: BulkTranslationResponse = {
      success: failed === 0,
      totalProcessed: processed,
      successful,
      failed,
      results,
      errors,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Bulk translation error:', error);
    return NextResponse.json(
      {
        error: 'Bulk translation failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  } finally {
    isProcessing = false;
  }
}

// GET endpoint to check bulk translation progress/status
export async function GET(request: NextRequest) {
  const authError = requireAdminAuth(request);
  if (authError) return authError;

  return NextResponse.json({
    isProcessing,
    lastProcessTime: lastProcessTime > 0 ? new Date(lastProcessTime).toISOString() : null,
  });
}
