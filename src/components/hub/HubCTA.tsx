'use client';

import { LocaleLink as Link } from '@/components/LocaleLink';

interface CTAButton {
  label: string;
  href: string;
  variant?: 'primary' | 'secondary';
}

interface HubCTAProps {
  title: string;
  description: string;
  buttons: CTAButton[];
  gradientFrom?: string;
  gradientTo?: string;
}

export function HubCTA({
  title,
  description,
  buttons,
  gradientFrom = 'from-green-600',
  gradientTo = 'to-emerald-600',
}: HubCTAProps) {
  return (
    <section className={`bg-gradient-to-r ${gradientFrom} ${gradientTo} rounded-2xl p-8 text-center text-white mt-12`}>
      <h2 className="text-2xl font-bold mb-2">{title}</h2>
      <p className="text-green-100 mb-6 max-w-2xl mx-auto">
        {description}
      </p>
      <div className="flex flex-wrap justify-center gap-4">
        {buttons.map((button) => (
          <Link
            key={button.href}
            href={button.href}
            className={`px-6 py-3 font-semibold rounded-lg transition-colors ${
              button.variant === 'secondary'
                ? 'bg-green-700 text-white hover:bg-green-800'
                : 'bg-white text-green-700 hover:bg-green-50'
            }`}
          >
            {button.label}
          </Link>
        ))}
      </div>
    </section>
  );
}
