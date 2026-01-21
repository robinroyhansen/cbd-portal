'use client';

interface HubHeroProps {
  icon: string;
  title: string;
  subtitle: string;
  description: string;
  badgeText?: string;
  badgeColor?: string;
  gradientFrom?: string;
  gradientTo?: string;
}

export function HubHero({
  icon,
  title,
  subtitle,
  description,
  badgeText,
  badgeColor = 'bg-green-100 text-green-700',
  gradientFrom = 'from-green-50',
  gradientTo = 'to-emerald-50',
}: HubHeroProps) {
  return (
    <section className={`text-center bg-gradient-to-br ${gradientFrom} ${gradientTo} -mx-4 px-4 py-10 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 rounded-3xl mb-12`}>
      {badgeText && (
        <div className={`inline-flex items-center gap-2 px-4 py-2 ${badgeColor} rounded-full text-sm font-medium mb-4`}>
          <span>{icon}</span>
          {badgeText}
        </div>
      )}
      <h1 className="text-4xl font-bold text-gray-900 mb-2">
        {title}
      </h1>
      <p className="text-lg text-gray-600 mb-4">
        {subtitle}
      </p>
      <p className="text-gray-500 max-w-3xl mx-auto">
        {description}
      </p>
    </section>
  );
}
