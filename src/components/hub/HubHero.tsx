'use client';

interface HubHeroProps {
  icon: string;
  title: string;
  subtitle: string;
  description: string;
  badgeText?: string;
  badgeColor?: string;
  gradientFrom?: string;
  gradientVia?: string;
  gradientTo?: string;
  pattern?: 'botanical' | 'molecular' | 'geometric' | 'none';
  accentColor?: string;
}

export function HubHero({
  icon,
  title,
  subtitle,
  description,
  badgeText,
  badgeColor = 'bg-green-100 text-green-700 border-green-200',
  gradientFrom = 'from-emerald-50',
  gradientVia = 'via-green-50',
  gradientTo = 'to-teal-50',
  pattern = 'botanical',
  accentColor = 'text-emerald-600',
}: HubHeroProps) {
  return (
    <section className={`relative overflow-hidden bg-gradient-to-br ${gradientFrom} ${gradientVia} ${gradientTo} -mx-4 px-4 py-16 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 rounded-3xl mb-12`}>
      {/* Animated gradient mesh overlay */}
      <div
        className="absolute inset-0 opacity-30 hub-gradient-mesh"
        style={{
          background: `radial-gradient(ellipse at 20% 50%, rgba(16, 185, 129, 0.15) 0%, transparent 50%),
                       radial-gradient(ellipse at 80% 20%, rgba(6, 182, 212, 0.1) 0%, transparent 40%),
                       radial-gradient(ellipse at 40% 80%, rgba(34, 197, 94, 0.1) 0%, transparent 45%)`,
        }}
      />

      {/* Botanical pattern overlay */}
      {pattern === 'botanical' && (
        <div className="absolute inset-0 botanical-pattern opacity-60" />
      )}

      {/* Molecular pattern for science */}
      {pattern === 'molecular' && (
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='25' cy='25' r='4' fill='%237c3aed'/%3E%3Ccircle cx='75' cy='75' r='4' fill='%237c3aed'/%3E%3Ccircle cx='75' cy='25' r='3' fill='%237c3aed'/%3E%3Ccircle cx='25' cy='75' r='3' fill='%237c3aed'/%3E%3Cline x1='25' y1='25' x2='75' y2='25' stroke='%237c3aed' stroke-width='1'/%3E%3Cline x1='25' y1='25' x2='25' y2='75' stroke='%237c3aed' stroke-width='1'/%3E%3Cline x1='75' y1='25' x2='75' y2='75' stroke='%237c3aed' stroke-width='1'/%3E%3C/svg%3E")`,
          }}
        />
      )}

      {/* Geometric pattern */}
      {pattern === 'geometric' && (
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cpolygon points='40,10 70,30 70,70 40,90 10,70 10,30' fill='none' stroke='%23475569' stroke-width='1'/%3E%3C/svg%3E")`,
          }}
        />
      )}

      {/* Decorative floating elements */}
      <div className="absolute top-8 right-8 text-4xl opacity-20 animate-pulse hidden lg:block" aria-hidden="true">
        ✦
      </div>
      <div className="absolute bottom-12 right-24 text-2xl opacity-10 hidden lg:block" aria-hidden="true">
        ✦
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl">
        {/* Badge */}
        {badgeText && (
          <div
            className={`inline-flex items-center gap-2 px-4 py-2 ${badgeColor} border rounded-full text-sm font-medium mb-6 opacity-0 animate-fade-in-up`}
            style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}
          >
            <span className="text-lg">{icon}</span>
            {badgeText}
          </div>
        )}

        {/* Title */}
        <h1
          className="hub-display-heading text-4xl sm:text-5xl lg:text-6xl text-gray-900 mb-4 opacity-0 animate-fade-in-up"
          style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}
        >
          {title}
        </h1>

        {/* Subtitle */}
        <p
          className={`hub-body-text text-xl sm:text-2xl ${accentColor} font-medium mb-6 opacity-0 animate-fade-in-up`}
          style={{ animationDelay: '0.3s', animationFillMode: 'forwards' }}
        >
          {subtitle}
        </p>

        {/* Description */}
        <p
          className="hub-body-text text-gray-600 text-lg max-w-2xl leading-relaxed opacity-0 animate-fade-in-up"
          style={{ animationDelay: '0.4s', animationFillMode: 'forwards' }}
        >
          {description}
        </p>
      </div>

      {/* Decorative accent illustration area */}
      <div className="absolute bottom-0 right-0 w-64 h-64 opacity-10 hidden xl:block" aria-hidden="true">
        <div
          className="w-full h-full"
          style={{
            background: `radial-gradient(circle at center, currentColor 0%, transparent 70%)`,
          }}
        />
      </div>
    </section>
  );
}
