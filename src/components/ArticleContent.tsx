import { GlossaryTooltip } from './GlossaryTooltip';
import { getGlossaryTerms } from '@/lib/glossary-linker';

interface ArticleContentProps {
  content: string;
  enableGlossary?: boolean;
}

export async function ArticleContent({ content, enableGlossary = true }: ArticleContentProps) {
  let processedContent = content;
  let glossaryTerms: Map<string, { slug: string; definition: string }> = new Map();

  if (enableGlossary) {
    const terms = await getGlossaryTerms();

    // Build map for quick lookup
    terms.forEach(t => {
      glossaryTerms.set(t.term.toLowerCase(), {
        slug: t.slug,
        definition: t.short_definition
      });
    });

    // Sort terms by length (longest first)
    const sortedTerms = [...terms].sort((a, b) => b.term.length - a.term.length);

    // Replace first occurrence of each term
    const replacedTerms = new Set<string>();

    for (const term of sortedTerms) {
      if (replacedTerms.has(term.term.toLowerCase())) continue;

      const regex = new RegExp(`\\b(${escapeRegex(term.term)})\\b`, 'i');

      if (regex.test(processedContent)) {
        processedContent = processedContent.replace(regex,
          `<span class="glossary-term" data-slug="${term.slug}" data-definition="${escapeHtml(term.short_definition)}">$1</span>`
        );
        replacedTerms.add(term.term.toLowerCase());
      }
    }
  }

  return (
    <div
      className="prose prose-green max-w-none article-content"
      dangerouslySetInnerHTML={{ __html: processedContent }}
    />
  );
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