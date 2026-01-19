'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSlug from 'rehype-slug';
import React from 'react';
import { GlossaryTooltip } from './GlossaryTooltip';

export interface GlossaryTerm {
  term: string;
  slug: string;
  short_definition: string;
  synonyms?: string[];
}

interface ArticleContentProps {
  content: string;
  glossaryTerms?: GlossaryTerm[];
  /** Glossary slugs to exclude (e.g., don't link "CBD Patches" on the CBD Patches article) */
  excludeSlugs?: string[];
  /** Strip the References/Sources section from markdown (use when structured citations exist) */
  stripReferences?: boolean;
}

export function ArticleContent({ content, glossaryTerms = [], excludeSlugs = [], stripReferences = false }: ArticleContentProps) {
  // Build a map of terms and their synonyms for quick lookup
  // Filter out excluded slugs (e.g., don't link "CBD Patches" on the CBD Patches article)
  const termMap = React.useMemo(() => {
    const map = new Map<string, GlossaryTerm>();
    const excludeSet = new Set(excludeSlugs.map(s => s.toLowerCase()));

    glossaryTerms.forEach(term => {
      // Skip excluded terms
      if (excludeSet.has(term.slug.toLowerCase())) {
        return;
      }

      // Add main term
      map.set(term.term.toLowerCase(), term);

      // Add synonyms
      if (term.synonyms) {
        term.synonyms.forEach(synonym => {
          if (!map.has(synonym.toLowerCase())) {
            map.set(synonym.toLowerCase(), term);
          }
        });
      }
    });

    return map;
  }, [glossaryTerms, excludeSlugs]);

  // Sort terms by length (longest first) to match longer terms first
  const sortedTerms = React.useMemo(() => {
    return Array.from(termMap.keys()).sort((a, b) => b.length - a.length);
  }, [termMap]);

  // Build regex pattern for all terms
  const termPattern = React.useMemo(() => {
    if (sortedTerms.length === 0) return null;

    const escaped = sortedTerms.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    return new RegExp(`\\b(${escaped.join('|')})\\b`, 'gi');
  }, [sortedTerms]);

  // Track which terms have been linked (only link first occurrence)
  const linkedTermsRef = React.useRef<Set<string>>(new Set());

  // Reset linked terms on content change
  React.useEffect(() => {
    linkedTermsRef.current = new Set();
  }, [content]);

  // Process text to add glossary links
  const processText = (text: string): React.ReactNode => {
    if (!termPattern || glossaryTerms.length === 0) {
      return text;
    }

    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;

    // Reset regex
    termPattern.lastIndex = 0;

    while ((match = termPattern.exec(text)) !== null) {
      const matchedText = match[0];
      const termKey = matchedText.toLowerCase();

      // Add text before match
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index));
      }

      // Check if this term has already been linked
      const termData = termMap.get(termKey);
      if (termData && !linkedTermsRef.current.has(termData.term.toLowerCase())) {
        // Mark as linked
        linkedTermsRef.current.add(termData.term.toLowerCase());

        // Add glossary tooltip
        parts.push(
          <GlossaryTooltip
            key={`${match.index}-${matchedText}`}
            term={termData.term}
            slug={termData.slug}
            definition={termData.short_definition}
          >
            {matchedText}
          </GlossaryTooltip>
        );
      } else {
        // Already linked or no data, just add the text
        parts.push(matchedText);
      }

      lastIndex = match.index + matchedText.length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }

    return parts.length > 0 ? parts : text;
  };

  // Custom text component that processes glossary terms
  const TextComponent = ({ children }: { children?: React.ReactNode }) => {
    if (typeof children === 'string') {
      return <>{processText(children)}</>;
    }
    return <>{children}</>;
  };

  // Remove the first H1 from content since we already have an H1 in the template
  let processedContent = content.replace(/^#\s+[^\n]+\n\n?/, '');

  // Optionally strip References/Sources section when we have structured citations
  if (stripReferences) {
    processedContent = processedContent.replace(
      /\n##\s*(?:References|Sources|Citations)\s*\n[\s\S]*?(?=\n##[^#]|\n---|\n\*Written|\n\*Last|$)/gi,
      ''
    );
  }

  return (
    <div className="article-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeSlug]}
        components={{
          // Process text in paragraphs
          p: ({ children }) => (
            <p>
              {React.Children.map(children, child => {
                if (typeof child === 'string') {
                  return processText(child);
                }
                return child;
              })}
            </p>
          ),
          // Process text in list items
          li: ({ children }) => (
            <li>
              {React.Children.map(children, child => {
                if (typeof child === 'string') {
                  return processText(child);
                }
                return child;
              })}
            </li>
          ),
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
}
