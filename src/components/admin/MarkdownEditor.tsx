'use client';

import { useState } from 'react';
import DOMPurify from 'isomorphic-dompurify';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function MarkdownEditor({ value, onChange }: MarkdownEditorProps) {
  const [preview, setPreview] = useState(false);

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      <div className="bg-gray-50 border-b border-gray-300 px-4 py-2 flex justify-between items-center">
        <div className="text-sm text-gray-600">
          Markdown Editor
        </div>
        <button
          type="button"
          onClick={() => setPreview(!preview)}
          className="text-sm text-primary-600 hover:text-primary-700"
        >
          {preview ? 'Edit' : 'Preview'}
        </button>
      </div>

      {preview ? (
        <div className="p-4 prose prose-sm max-w-none">
          <div dangerouslySetInnerHTML={{ __html: markdownToHtml(value) }} />
        </div>
      ) : (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-96 p-4 font-mono text-sm focus:outline-none"
          placeholder="Write your content in Markdown..."
        />
      )}
    </div>
  );
}

function markdownToHtml(markdown: string): string {
  // Simple markdown to HTML conversion (basic implementation)
  let html = markdown;

  // Headers
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

  // Bold
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

  // Italic
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

  // Links - sanitize href to prevent javascript: URLs
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, text, url) => {
    // Only allow http, https, mailto, and relative URLs
    const sanitizedUrl = url.match(/^(https?:|mailto:|\/|#)/) ? url : '#';
    return `<a href="${sanitizedUrl}">${text}</a>`;
  });

  // Line breaks
  html = html.replace(/\n\n/g, '</p><p>');
  html = '<p>' + html + '</p>';

  // Lists
  html = html.replace(/^\* (.+)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');

  // Sanitize the output to prevent XSS
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'a', 'ul', 'ol', 'li', 'strong', 'em', 'br', 'blockquote', 'code', 'pre'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
    ALLOW_DATA_ATTR: false
  });
}