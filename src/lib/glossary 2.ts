import { createClient } from '@/lib/supabase/server';
import { unstable_cache } from 'next/cache';

export interface GlossaryTermForLinking {
  term: string;
  slug: string;
  short_definition: string;
  synonyms: string[];
}

// Cache glossary terms for 1 hour to avoid repeated DB calls
export const getGlossaryTermsForLinking = unstable_cache(
  async (): Promise<GlossaryTermForLinking[]> => {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('kb_glossary')
      .select('term, slug, short_definition, synonyms')
      .order('term');

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
  },
  ['glossary-terms-for-linking'],
  { revalidate: 3600 } // Cache for 1 hour
);
