'use client';

interface ComparisonItem {
  name: string;
  icon?: string;
  color: 'green' | 'blue' | 'purple' | 'orange';
  stats: {
    label: string;
    value: string;
    winner?: boolean;
  }[];
  pros: string[];
  cons: string[];
  bestFor: string;
}

interface ComparisonInfographicProps {
  title: string;
  itemA: ComparisonItem;
  itemB: ComparisonItem;
  verdict?: string;
}

const colorClasses = {
  green: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    header: 'bg-green-600',
    badge: 'bg-green-100 text-green-700',
    text: 'text-green-700',
  },
  blue: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    header: 'bg-blue-600',
    badge: 'bg-blue-100 text-blue-700',
    text: 'text-blue-700',
  },
  purple: {
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    header: 'bg-purple-600',
    badge: 'bg-purple-100 text-purple-700',
    text: 'text-purple-700',
  },
  orange: {
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    header: 'bg-orange-600',
    badge: 'bg-orange-100 text-orange-700',
    text: 'text-orange-700',
  },
};

export function ComparisonInfographic({
  title,
  itemA,
  itemB,
  verdict,
}: ComparisonInfographicProps) {
  const colorsA = colorClasses[itemA.color];
  const colorsB = colorClasses[itemB.color];

  return (
    <div className="my-8 rounded-2xl border border-gray-200 overflow-hidden bg-white shadow-sm">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-6 py-4">
        <h3 className="text-white font-bold text-lg text-center">{title}</h3>
      </div>

      {/* VS Banner */}
      <div className="relative py-2 bg-gray-100">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center z-10">
          <span className="font-bold text-gray-700">VS</span>
        </div>
        <div className="flex">
          <div className={`flex-1 py-3 ${colorsA.header} text-center`}>
            <span className="text-white font-semibold">{itemA.name}</span>
          </div>
          <div className={`flex-1 py-3 ${colorsB.header} text-center`}>
            <span className="text-white font-semibold">{itemB.name}</span>
          </div>
        </div>
      </div>

      {/* Stats Comparison */}
      <div className="grid grid-cols-2 divide-x divide-gray-200">
        {/* Item A Stats */}
        <div className={`p-4 ${colorsA.bg}`}>
          <div className="space-y-3">
            {itemA.stats.map((stat, i) => (
              <div key={i} className="flex justify-between items-center">
                <span className="text-xs text-gray-600">{stat.label}</span>
                <span className={`text-sm font-semibold ${stat.winner ? colorsA.text : 'text-gray-700'}`}>
                  {stat.value}
                  {stat.winner && <span className="ml-1">✓</span>}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Item B Stats */}
        <div className={`p-4 ${colorsB.bg}`}>
          <div className="space-y-3">
            {itemB.stats.map((stat, i) => (
              <div key={i} className="flex justify-between items-center">
                <span className="text-xs text-gray-600">{stat.label}</span>
                <span className={`text-sm font-semibold ${stat.winner ? colorsB.text : 'text-gray-700'}`}>
                  {stat.value}
                  {stat.winner && <span className="ml-1">✓</span>}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pros */}
      <div className="grid grid-cols-2 divide-x divide-gray-200 border-t border-gray-200">
        <div className="p-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Pros</p>
          <ul className="space-y-1">
            {itemA.pros.map((pro, i) => (
              <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                <span className="text-green-500 mt-0.5">+</span>
                {pro}
              </li>
            ))}
          </ul>
        </div>
        <div className="p-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Pros</p>
          <ul className="space-y-1">
            {itemB.pros.map((pro, i) => (
              <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                <span className="text-green-500 mt-0.5">+</span>
                {pro}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Cons */}
      <div className="grid grid-cols-2 divide-x divide-gray-200 border-t border-gray-200">
        <div className="p-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Cons</p>
          <ul className="space-y-1">
            {itemA.cons.map((con, i) => (
              <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                <span className="text-red-400 mt-0.5">-</span>
                {con}
              </li>
            ))}
          </ul>
        </div>
        <div className="p-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Cons</p>
          <ul className="space-y-1">
            {itemB.cons.map((con, i) => (
              <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                <span className="text-red-400 mt-0.5">-</span>
                {con}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Best For */}
      <div className="grid grid-cols-2 divide-x divide-gray-200 border-t border-gray-200">
        <div className={`p-4 ${colorsA.bg}`}>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Best For</p>
          <p className={`text-sm font-medium ${colorsA.text}`}>{itemA.bestFor}</p>
        </div>
        <div className={`p-4 ${colorsB.bg}`}>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Best For</p>
          <p className={`text-sm font-medium ${colorsB.text}`}>{itemB.bestFor}</p>
        </div>
      </div>

      {/* Verdict */}
      {verdict && (
        <div className="bg-gray-50 border-t border-gray-200 p-4">
          <p className="text-sm text-gray-700">
            <span className="font-semibold">Bottom Line:</span> {verdict}
          </p>
        </div>
      )}
    </div>
  );
}

// Simple comparison badge for inline use
export function ComparisonBadge({
  itemA,
  itemB,
  winner,
}: {
  itemA: string;
  itemB: string;
  winner?: 'A' | 'B' | 'tie';
}) {
  return (
    <span className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full text-sm">
      <span className={winner === 'A' ? 'font-bold text-green-600' : 'text-gray-600'}>{itemA}</span>
      <span className="text-gray-400">vs</span>
      <span className={winner === 'B' ? 'font-bold text-green-600' : 'text-gray-600'}>{itemB}</span>
      {winner && winner !== 'tie' && (
        <span className="text-xs text-green-600">
          {winner === 'A' ? `(${itemA} wins)` : `(${itemB} wins)`}
        </span>
      )}
    </span>
  );
}

// Quick comparison table component
export function QuickComparisonTable({
  title,
  rows,
}: {
  title?: string;
  rows: {
    label: string;
    itemA: string;
    itemB: string;
    winner?: 'A' | 'B' | 'tie';
  }[];
}) {
  return (
    <div className="my-6 overflow-hidden rounded-lg border border-gray-200">
      {title && (
        <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
          <h4 className="font-semibold text-gray-900">{title}</h4>
        </div>
      )}
      <table className="w-full text-sm">
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              <td className="px-4 py-2 font-medium text-gray-700 w-1/3">{row.label}</td>
              <td className={`px-4 py-2 text-center ${row.winner === 'A' ? 'text-green-600 font-semibold bg-green-50' : 'text-gray-600'}`}>
                {row.itemA}
                {row.winner === 'A' && <span className="ml-1 text-xs">✓</span>}
              </td>
              <td className={`px-4 py-2 text-center ${row.winner === 'B' ? 'text-green-600 font-semibold bg-green-50' : 'text-gray-600'}`}>
                {row.itemB}
                {row.winner === 'B' && <span className="ml-1 text-xs">✓</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
