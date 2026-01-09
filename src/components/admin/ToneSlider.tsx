'use client';

export type ToneType = 'very_critical' | 'critical' | 'balanced' | 'positive' | 'very_positive';

interface ToneSliderProps {
  value: ToneType;
  onChange: (tone: ToneType) => void;
  compact?: boolean;
}

const TONES: { value: ToneType; label: string; shortLabel: string; color: string }[] = [
  { value: 'very_critical', label: 'Very Critical', shortLabel: 'V.Critical', color: 'bg-red-500' },
  { value: 'critical', label: 'Critical', shortLabel: 'Critical', color: 'bg-orange-500' },
  { value: 'balanced', label: 'Balanced', shortLabel: 'Balanced', color: 'bg-gray-500' },
  { value: 'positive', label: 'Positive', shortLabel: 'Positive', color: 'bg-green-400' },
  { value: 'very_positive', label: 'Very Positive', shortLabel: 'V.Positive', color: 'bg-green-600' },
];

export function ToneSlider({ value, onChange, compact = false }: ToneSliderProps) {
  const currentIndex = TONES.findIndex(t => t.value === value);

  if (compact) {
    return (
      <div className="flex items-center gap-1">
        {TONES.map((tone, index) => (
          <button
            key={tone.value}
            onClick={() => onChange(tone.value)}
            className={`px-2 py-1 text-xs rounded transition-all ${
              value === tone.value
                ? `${tone.color} text-white font-medium`
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title={tone.label}
          >
            {tone.shortLabel}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs text-gray-500 px-1">
        <span>Critical</span>
        <span>Balanced</span>
        <span>Positive</span>
      </div>

      {/* Slider track */}
      <div className="relative">
        <div className="flex gap-1">
          {TONES.map((tone, index) => (
            <button
              key={tone.value}
              onClick={() => onChange(tone.value)}
              className={`flex-1 h-10 rounded-lg transition-all relative group ${
                value === tone.value
                  ? `${tone.color} text-white shadow-md ring-2 ring-offset-1 ring-${tone.color.replace('bg-', '')}`
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              <span className={`text-xs font-medium ${value === tone.value ? '' : 'opacity-70'}`}>
                {tone.shortLabel}
              </span>

              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                {tone.label}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Current selection indicator */}
      <div className="text-center text-sm text-gray-600">
        Tone: <span className="font-medium">{TONES[currentIndex]?.label || 'Balanced'}</span>
      </div>
    </div>
  );
}
