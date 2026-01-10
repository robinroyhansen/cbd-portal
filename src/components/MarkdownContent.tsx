'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { autoLinkReviewPlatforms } from '@/lib/utils/auto-link';

interface MarkdownContentProps {
  children: string;
  className?: string;
  brandName?: string;
  trustpilotUrl?: string | null;
  websiteDomain?: string | null;
}

export function MarkdownContent({
  children,
  className = '',
  brandName,
  trustpilotUrl,
  websiteDomain
}: MarkdownContentProps) {
  // Auto-link review platforms if brandName is provided
  let processedContent = children;
  if (brandName) {
    processedContent = autoLinkReviewPlatforms(children, {
      brandName,
      trustpilotUrl,
      websiteDomain
    });
  }

  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Style tables for better appearance
          table: ({ children }) => (
            <div className="overflow-x-auto my-4">
              <table className="min-w-full border-collapse border border-gray-200 rounded-lg overflow-hidden">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-gray-100">{children}</thead>
          ),
          th: ({ children }) => (
            <th className="border border-gray-200 px-4 py-2 text-left font-semibold text-gray-900">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-gray-200 px-4 py-2 text-gray-700">
              {children}
            </td>
          ),
          tr: ({ children }) => (
            <tr className="even:bg-gray-50">{children}</tr>
          ),
          // Style links with external indicator
          a: ({ href, children }) => {
            const isExternal = href?.startsWith('http');
            return (
              <a
                href={href}
                target={isExternal ? '_blank' : undefined}
                rel={isExternal ? 'noopener noreferrer' : undefined}
                className="text-green-600 hover:text-green-700 underline"
              >
                {children}
              </a>
            );
          },
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
}
