'use client';

export interface SafetyItem {
  category: 'warning' | 'avoid' | 'interaction' | 'consult';
  text: string;
}

interface SafetySectionProps {
  items: SafetyItem[];
  title?: string;
  className?: string;
}

const categoryConfig = {
  warning: {
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-300',
    textColor: 'text-yellow-800',
    iconColor: 'text-yellow-600',
  },
  avoid: {
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
      </svg>
    ),
    bgColor: 'bg-red-50',
    borderColor: 'border-red-300',
    textColor: 'text-red-800',
    iconColor: 'text-red-600',
  },
  interaction: {
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
    ),
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-300',
    textColor: 'text-purple-800',
    iconColor: 'text-purple-600',
  },
  consult: {
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-300',
    textColor: 'text-blue-800',
    iconColor: 'text-blue-600',
  },
};

export function SafetySection({ items, title = 'Safety Information', className = '' }: SafetySectionProps) {
  if (items.length === 0) return null;

  // Group items by category
  const grouped = items.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, SafetyItem[]>);

  const categoryLabels = {
    warning: 'Warnings',
    avoid: 'Who Should Avoid',
    interaction: 'Drug Interactions',
    consult: 'Consult Your Doctor If',
  };

  return (
    <div className={`my-8 rounded-xl border border-red-200 overflow-hidden ${className}`}>
      <div className="bg-gradient-to-r from-red-600 to-rose-600 px-4 py-3">
        <h3 className="text-white font-semibold flex items-center gap-2 m-0">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          {title}
        </h3>
      </div>
      <div className="p-4 bg-red-50/50 space-y-4">
        {Object.entries(grouped).map(([category, categoryItems]) => {
          const config = categoryConfig[category as keyof typeof categoryConfig];
          return (
            <div key={category} className={`rounded-lg border ${config.borderColor} ${config.bgColor} p-3`}>
              <h4 className={`font-semibold text-sm ${config.textColor} mb-2 flex items-center gap-2 m-0`}>
                <span className={config.iconColor}>{config.icon}</span>
                {categoryLabels[category as keyof typeof categoryLabels]}
              </h4>
              <ul className="space-y-1 m-0 pl-0 list-none">
                {categoryItems.map((item, i) => (
                  <li key={i} className={`text-sm ${config.textColor} flex items-start gap-2`}>
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-current flex-shrink-0" />
                    {item.text}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Extract Safety Information from markdown content
export function extractSafetyInfo(content: string): { items: SafetyItem[]; content: string } {
  const items: SafetyItem[] = [];
  let cleanedContent = content;

  // Match Safety/Side Effects/Who Should Avoid sections
  const sectionPatterns = [
    { pattern: /##\s*(?:Who Should Avoid|Not Recommended For)\s*\n\n([\s\S]+?)(?=\n##[^#]|\n---|\n\*Written|$)/i, category: 'avoid' as const },
    { pattern: /##\s*(?:Drug Interactions|Medication Interactions)\s*\n\n([\s\S]+?)(?=\n##[^#]|\n---|\n\*Written|$)/i, category: 'interaction' as const },
    { pattern: /##\s*(?:Warnings?|Cautions?|Important Considerations)\s*\n\n([\s\S]+?)(?=\n##[^#]|\n---|\n\*Written|$)/i, category: 'warning' as const },
    { pattern: /##\s*(?:When to Consult|Talk to Your Doctor)\s*\n\n([\s\S]+?)(?=\n##[^#]|\n---|\n\*Written|$)/i, category: 'consult' as const },
  ];

  for (const { pattern, category } of sectionPatterns) {
    const match = content.match(pattern);
    if (match) {
      const sectionContent = match[1];
      cleanedContent = cleanedContent.replace(match[0], '').trim();

      // Extract list items
      const listPattern = /[-*]\s+(.+?)(?=\n[-*]|\n\n|$)/g;
      let listMatch;
      while ((listMatch = listPattern.exec(sectionContent)) !== null) {
        items.push({
          category,
          text: listMatch[1].trim(),
        });
      }
    }
  }

  return { items, content: cleanedContent };
}

// Compact version for inline use
export function SafetyWarning({ text, category = 'warning' }: { text: string; category?: SafetyItem['category'] }) {
  const config = categoryConfig[category];
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${config.bgColor} ${config.textColor} border ${config.borderColor}`}>
      <span className={config.iconColor}>{config.icon}</span>
      {text}
    </div>
  );
}
