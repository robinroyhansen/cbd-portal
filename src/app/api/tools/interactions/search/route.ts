import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import type { DrugSearchResult, DrugCategory } from '@/types/drug-interactions';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.trim().toLowerCase();
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 20);

    if (!query || query.length < 2) {
      return NextResponse.json({ results: [] });
    }

    const supabase = createServiceClient();

    // Search pattern for ILIKE
    const searchPattern = `%${query}%`;

    // Search drugs by generic name, display name, and brand names
    const { data: drugs, error } = await supabase
      .from('kb_drugs')
      .select(
        `
        id,
        generic_name,
        display_name,
        brand_names,
        synonyms,
        category
      `
      )
      .eq('is_published', true)
      .or(
        `generic_name.ilike.${searchPattern},display_name.ilike.${searchPattern}`
      )
      .limit(limit * 2); // Fetch extra to allow for deduplication

    if (error) {
      console.error('[Drug Search] Database error:', error);
      throw error;
    }

    // Also search by brand names (array contains)
    const { data: brandMatches, error: brandError } = await supabase
      .from('kb_drugs')
      .select(
        `
        id,
        generic_name,
        display_name,
        brand_names,
        synonyms,
        category
      `
      )
      .eq('is_published', true)
      .contains('brand_names', [query])
      .limit(limit);

    // Combine results and deduplicate
    const allDrugs = [...(drugs || [])];
    const seenIds = new Set(allDrugs.map((d) => d.id));

    if (!brandError && brandMatches) {
      for (const drug of brandMatches) {
        if (!seenIds.has(drug.id)) {
          allDrugs.push(drug);
          seenIds.add(drug.id);
        }
      }
    }

    // Process results to identify match type and matched term
    const results: DrugSearchResult[] = allDrugs.map((drug) => {
      const lowerGeneric = drug.generic_name.toLowerCase();
      const lowerDisplay = (drug.display_name || '').toLowerCase();

      let matchType: 'generic' | 'brand' | 'synonym' = 'generic';
      let matchedTerm: string | undefined;

      if (lowerGeneric.includes(query) || lowerDisplay.includes(query)) {
        matchType = 'generic';
      } else {
        // Check brand names
        const matchedBrand = (drug.brand_names || []).find((b: string) =>
          b.toLowerCase().includes(query)
        );
        if (matchedBrand) {
          matchType = 'brand';
          matchedTerm = matchedBrand;
        } else {
          // Check synonyms
          const matchedSynonym = (drug.synonyms || []).find((s: string) =>
            s.toLowerCase().includes(query)
          );
          if (matchedSynonym) {
            matchType = 'synonym';
            matchedTerm = matchedSynonym;
          }
        }
      }

      return {
        id: drug.id,
        generic_name: drug.generic_name,
        display_name: drug.display_name || drug.generic_name,
        brand_names: drug.brand_names || [],
        category: drug.category as DrugCategory,
        match_type: matchType,
        matched_term: matchedTerm,
      };
    });

    // Sort: exact matches first, then prefix matches, then by generic name
    results.sort((a, b) => {
      // Exact match on generic name
      const aExact = a.generic_name.toLowerCase() === query ? 0 : 1;
      const bExact = b.generic_name.toLowerCase() === query ? 0 : 1;
      if (aExact !== bExact) return aExact - bExact;

      // Starts with query
      const aStarts = a.generic_name.toLowerCase().startsWith(query) ? 0 : 1;
      const bStarts = b.generic_name.toLowerCase().startsWith(query) ? 0 : 1;
      if (aStarts !== bStarts) return aStarts - bStarts;

      // Generic match over brand match
      const aGeneric = a.match_type === 'generic' ? 0 : 1;
      const bGeneric = b.match_type === 'generic' ? 0 : 1;
      if (aGeneric !== bGeneric) return aGeneric - bGeneric;

      // Alphabetical
      return a.generic_name.localeCompare(b.generic_name);
    });

    return NextResponse.json(
      {
        query,
        results: results.slice(0, limit),
      },
      {
        headers: { 'Cache-Control': 'public, max-age=300' }, // 5 min cache
      }
    );
  } catch (error) {
    console.error('[Drug Search] Error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
