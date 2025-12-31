import { createClient } from '@/lib/supabase/server';

interface GlossaryTerm {
  term: string;
  slug: string;
  short_definition: string;
}

let cachedTerms: GlossaryTerm[] | null = null;

export async function getGlossaryTerms(): Promise<GlossaryTerm[]> {
  if (cachedTerms) return cachedTerms;

  const supabase = await createClient();
  const { data } = await supabase
    .from('kb_glossary')
    .select('term, slug, short_definition')
    .eq('is_active', true)
    .eq('language', 'en');

  cachedTerms = data || [];
  return cachedTerms;
}

export async function addGlossaryLinks(content: string): Promise<string> {
  const terms = await getGlossaryTerms();
  let result = content;

  // Sort by length (longest first) to avoid partial replacements
  const sortedTerms = [...terms].sort((a, b) => b.term.length - a.term.length);

  for (const term of sortedTerms) {
    // Create regex that matches the term as a whole word, case-insensitive
    // But only match first occurrence to avoid over-linking
    const regex = new RegExp(`\\b(${escapeRegex(term.term)})\\b`, 'i');

    // Only replace if not already inside a link or glossary tag
    if (regex.test(result) && !isInsideLink(result, term.term)) {
      result = result.replace(regex, (match) => {
        return `<glossary-term slug="${term.slug}" definition="${escapeHtml(term.short_definition)}">${match}</glossary-term>`;
      });
    }
  }

  return result;
}

function escapeRegex(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function escapeHtml(string: string): string {
  return string
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function isInsideLink(content: string, term: string): boolean {
  // Simple check - could be made more robust
  const linkPattern = new RegExp(`<a[^>]*>[^<]*${escapeRegex(term)}[^<]*</a>`, 'i');
  const glossaryPattern = new RegExp(`<glossary-term[^>]*>[^<]*${escapeRegex(term)}[^<]*</glossary-term>`, 'i');
  return linkPattern.test(content) || glossaryPattern.test(content);
}