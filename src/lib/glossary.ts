import { createClient } from '@/lib/supabase/server';
import { cache } from 'react';

export interface GlossaryTermForLinking {
  term: string;
  slug: string;
  short_definition: string;
  synonyms: string[];
}

// Use React cache() for request-level deduplication (avoids dynamic data issues with unstable_cache)
export const getGlossaryTermsForLinking = cache(
  async (): Promise<GlossaryTermForLinking[]> => {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('kb_glossary')
      .select('term, slug, short_definition, synonyms')
      .order('term')
      .limit(1000); // Reasonable limit for glossary terms

    if (error) {
      console.error('Error fetching glossary terms:', error);
      return [];
    }

    return (data || []).map(t => ({
      term: t.term,
      slug: t.slug,
      short_definition: t.short_definition,
      synonyms: t.synonyms || []
    }));
  }
);
