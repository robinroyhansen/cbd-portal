'use client';

import { ArticleTemplate, TemplateSection } from '@/lib/article-templates';

interface TemplatePreviewProps {
  template: ArticleTemplate;
  onSelect?: () => void;
}

export function TemplatePreview({ template, onSelect }: TemplatePreviewProps) {
  return (
    <div className="border rounded-lg p-6 bg-white hover:shadow-lg transition-shadow">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-3xl">{template.icon}</span>
        <div>
          <h3 className="text-lg font-semibold">{template.name}</h3>
          <p className="text-sm text-gray-500">{template.description}</p>
        </div>
      </div>

      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Sections:</h4>
        <div className="space-y-1">
          {template.sections.map((section, index) => (
            <div key={section.id} className="flex items-center gap-2 text-sm">
              <span className="text-gray-400">{index + 1}.</span>
              <span className={section.required ? 'text-gray-700' : 'text-gray-400'}>
                {section.title}
              </span>
              {section.required && (
                <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded">Required</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {template.suggestedTags.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Suggested Tags:</h4>
          <div className="flex flex-wrap gap-1">
            {template.suggestedTags.map(tag => (
              <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {template.seoTips.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">SEO Tips:</h4>
          <div className="text-xs text-gray-500 space-y-1">
            {template.seoTips.slice(0, 2).map((tip, index) => (
              <div key={index} className="flex items-start gap-1">
                <span className="text-green-500">•</span>
                <span>{tip}</span>
              </div>
            ))}
            {template.seoTips.length > 2 && (
              <div className="text-gray-400">+{template.seoTips.length - 2} more tips</div>
            )}
          </div>
        </div>
      )}

      {onSelect && (
        <button
          onClick={onSelect}
          className="w-full mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors font-medium"
        >
          Use This Template
        </button>
      )}
    </div>
  );
}