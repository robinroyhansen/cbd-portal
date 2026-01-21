'use client';

export interface StatItem {
  value: string | number;
  label: string;
  color?: string;
}

interface HubQuickStatsProps {
  stats: StatItem[];
}

export function HubQuickStats({ stats }: HubQuickStatsProps) {
  const colors = [
    'text-green-600',
    'text-blue-600',
    'text-amber-600',
    'text-purple-600',
  ];

  return (
    <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
      {stats.map((stat, index) => (
        <div
          key={stat.label}
          className="bg-white rounded-xl border border-gray-200 p-4 text-center"
        >
          <p className={`text-3xl font-bold ${stat.color || colors[index % colors.length]}`}>
            {stat.value}
          </p>
          <p className="text-sm text-gray-600">{stat.label}</p>
        </div>
      ))}
    </section>
  );
}
