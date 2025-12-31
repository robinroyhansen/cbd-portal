'use client';

import { useState } from 'react';
import { ArticleTemplate, TemplateSection } from '@/lib/article-templates';

interface TemplateEditorProps {
  template: ArticleTemplate;
  initialData?: Record<string, string>;
  onChange: (data: Record<string, string>) => void;
}

export function TemplateEditor({ template, initialData = {}, onChange }: TemplateEditorProps) {
  const [sections, setSections] = useState<Record<string, string>>(initialData);
  const [expandedSection, setExpandedSection] = useState<string | null>(template.sections[0]?.id);

  const handleSectionChange = (sectionId: string, value: string) => {
    const newSections = { ...sections, [sectionId]: value };
    setSections(newSections);
    onChange(newSections);
  };

  const getWordCount = (text: string): number => {
    return text.trim().split(/\s+/).filter(Boolean).length;
  };

  const getCompletionStatus = (): { complete: number; total: number } => {
    const requiredSections = template.sections.filter(s => s.required);
    const completeSections = requiredSections.filter(s =>
      sections[s.id] && getWordCount(sections[s.id]) >= s.wordCountGuide.min
    );
    return { complete: completeSections.length, total: requiredSections.length };
  };

  const status = getCompletionStatus();

  return (
    <div className="space-y-4">
      {/* Progress bar */}
      <div className="bg-gray-100 rounded-lg p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">Template Completion</span>
          <span className="text-sm text-gray-500">
            {status.complete}/{status.total} required sections
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-green-600 h-2 rounded-full transition-all"
            style={{ width: `${status.total > 0 ? (status.complete / status.total) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* Sections */}
      {template.sections.map((section, index) => {
        const wordCount = getWordCount(sections[section.id] || '');
        const isComplete = wordCount >= section.wordCountGuide.min;
        const isOverLimit = wordCount > section.wordCountGuide.max;
        const isExpanded = expandedSection === section.id;

        return (
          <div
            key={section.id}
            className={`border rounded-lg overflow-hidden ${
              isComplete ? 'border-green-300' : section.required ? 'border-orange-300' : 'border-gray-200'
            }`}
          >
            <button
              onClick={() => setExpandedSection(isExpanded ? null : section.id)}
              className="w-full px-4 py-3 bg-gray-50 flex items-center justify-between hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-gray-400 text-sm">{index + 1}</span>
                <span className="font-medium">{section.title}</span>
                {section.required && !isComplete && (
                  <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded">Required</span>
                )}
                {isComplete && (
                  <span className="text-green-600">✓</span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs ${
                  isOverLimit ? 'text-red-500' : isComplete ? 'text-green-600' : 'text-gray-400'
                }`}>
                  {wordCount}/{section.wordCountGuide.min}-{section.wordCountGuide.max} words
                </span>
                <svg
                  className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>

            {isExpanded && (
              <div className="p-4 border-t">
                <p className="text-sm text-gray-500 mb-3">{section.description}</p>
                <textarea
                  value={sections[section.id] || ''}
                  onChange={(e) => handleSectionChange(section.id, e.target.value)}
                  placeholder={section.placeholder}
                  rows={8}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 font-mono text-sm resize-vertical"
                />
                <div className="mt-2 flex justify-between items-center text-xs">
                  <span className="text-gray-400">
                    Target: {section.wordCountGuide.min}-{section.wordCountGuide.max} words
                  </span>
                  <span className={`${
                    isOverLimit ? 'text-red-500' : isComplete ? 'text-green-600' : 'text-gray-400'
                  }`}>
                    Current: {wordCount} words
                  </span>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* SEO Tips */}
      {template.seoTips.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-800 mb-2">💡 SEO Tips for {template.name}</h4>
          <ul className="space-y-1">
            {template.seoTips.map((tip, index) => (
              <li key={index} className="text-sm text-blue-700 flex items-start gap-2">
                <span>•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Suggested Tags */}
      {template.suggestedTags.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-medium text-green-800 mb-2">🏷️ Suggested Tags for {template.name}</h4>
          <div className="flex flex-wrap gap-2">
            {template.suggestedTags.map(tag => (
              <span key={tag} className="px-2 py-1 bg-green-100 text-green-700 text-sm rounded">
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}