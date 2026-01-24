'use client';

import { useEffect, useRef, useState } from 'react';

export interface StatItem {
  value: string | number;
  label: string;
  color?: string;
  bgColor?: string;
}

interface HubQuickStatsProps {
  stats: StatItem[];
}

function AnimatedNumber({ value, color }: { value: number; color: string }) {
  const [displayValue, setDisplayValue] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setDisplayValue(value);
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
          // Animate the counter
          const duration = 1000;
          const startTime = performance.now();
          const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out cubic
            const easeOut = 1 - Math.pow(1 - progress, 3);
            setDisplayValue(Math.floor(easeOut * value));
            if (progress < 1) {
              requestAnimationFrame(animate);
            } else {
              setDisplayValue(value);
            }
          };
          requestAnimationFrame(animate);
          observer.unobserve(element);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [value, isVisible]);

  return (
    <span ref={ref} className={`hub-stat-number text-4xl lg:text-5xl font-bold ${color}`}>
      {displayValue.toLocaleString()}
    </span>
  );
}

export function HubQuickStats({ stats }: HubQuickStatsProps) {
  const defaultColors = [
    { text: 'text-emerald-600', bg: 'from-emerald-50 to-green-50' },
    { text: 'text-blue-600', bg: 'from-blue-50 to-cyan-50' },
    { text: 'text-amber-600', bg: 'from-amber-50 to-orange-50' },
    { text: 'text-purple-600', bg: 'from-purple-50 to-violet-50' },
  ];

  return (
    <section className="mb-12">
      {/* Desktop: horizontal with connecting lines */}
      <div className="hidden md:flex items-stretch gap-0">
        {stats.map((stat, index) => {
          const colorSet = defaultColors[index % defaultColors.length];
          const textColor = stat.color || colorSet.text;
          const bgGradient = stat.bgColor || colorSet.bg;

          return (
            <div key={stat.label} className="flex-1 flex items-center">
              {/* Stat card */}
              <div
                className={`flex-1 bg-gradient-to-br ${bgGradient} rounded-2xl p-6 text-center border border-gray-100 opacity-0 animate-fade-in-up`}
                style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'forwards' }}
              >
                {typeof stat.value === 'number' ? (
                  <AnimatedNumber value={stat.value} color={textColor} />
                ) : (
                  <span className={`hub-stat-number text-4xl lg:text-5xl font-bold ${textColor}`}>
                    {stat.value}
                  </span>
                )}
                <p className="text-sm text-gray-600 mt-2 hub-body-text font-medium">{stat.label}</p>
              </div>

              {/* Connecting line (except last) */}
              {index < stats.length - 1 && (
                <div className="w-8 h-px bg-gray-200 mx-1" />
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile: 2x2 grid */}
      <div className="grid grid-cols-2 gap-3 md:hidden">
        {stats.map((stat, index) => {
          const colorSet = defaultColors[index % defaultColors.length];
          const textColor = stat.color || colorSet.text;
          const bgGradient = stat.bgColor || colorSet.bg;

          return (
            <div
              key={stat.label}
              className={`bg-gradient-to-br ${bgGradient} rounded-xl p-4 text-center border border-gray-100 opacity-0 animate-fade-in-up`}
              style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'forwards' }}
            >
              {typeof stat.value === 'number' ? (
                <AnimatedNumber value={stat.value} color={textColor} />
              ) : (
                <span className={`hub-stat-number text-2xl font-bold ${textColor}`}>
                  {stat.value}
                </span>
              )}
              <p className="text-xs text-gray-600 mt-1 hub-body-text font-medium">{stat.label}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
