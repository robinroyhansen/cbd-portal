interface BreadcrumbItem {
  name: string;
  url: string;
}

export function BreadcrumbSchema({ items }: { items: BreadcrumbItem[] }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  skipSchema?: boolean; // Skip schema output if already rendered elsewhere
  variant?: 'light' | 'dark'; // light = dark text on light bg, dark = light text on dark bg
}

export function Breadcrumbs({ items, skipSchema = false, variant = 'light' }: BreadcrumbsProps) {
  // Get the parent item (second to last) for mobile back link
  const parentItem = items.length > 1 ? items[items.length - 2] : null;

  const isDark = variant === 'dark';

  return (
    <>
      {!skipSchema && <BreadcrumbSchema items={items} />}

      {/* Mobile: Simple back link */}
      {parentItem && (
        <nav aria-label="Back" className="sm:hidden mb-4">
          <a
            href={parentItem.url}
            className={`inline-flex items-center gap-1 text-sm ${
              isDark
                ? 'text-white opacity-70 hover:opacity-100'
                : 'text-gray-500 hover:text-green-600'
            }`}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            {parentItem.name}
          </a>
        </nav>
      )}

      {/* Desktop: Full breadcrumb path */}
      <nav aria-label="Breadcrumb" className="hidden sm:block mb-6">
        <ol className={`flex items-center gap-2 text-sm ${isDark ? 'text-white opacity-70' : 'text-gray-500'}`}>
          {items.map((item, index) => (
            <li key={item.url} className="flex items-center gap-2">
              {index > 0 && <span className={isDark ? 'text-white opacity-40' : 'text-gray-300'}>/</span>}
              {index === items.length - 1 ? (
                <span className={isDark ? 'text-white opacity-100' : 'text-gray-700'}>{item.name}</span>
              ) : (
                <a href={item.url} className={isDark ? 'text-white opacity-70 hover:opacity-100' : 'hover:text-green-600'}>{item.name}</a>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}