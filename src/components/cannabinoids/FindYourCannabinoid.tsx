'use client';

import { useState } from 'react';
import { LocaleLink as Link } from '@/components/LocaleLink';
import {
  Cannabinoid,
  EFFECT_META,
  TYPE_META,
  PrimaryEffect,
  getCannabinoidsByEffect,
} from '@/lib/cannabinoids';

interface FindYourCannabinoidProps {
  cannabinoids: Cannabinoid[];
}

// Group effects by user goal
const EFFECT_GROUPS = [
  {
    id: 'relax',
    label: 'Relaxation & Sleep',
    description: 'Wind down and get better rest',
    icon: '🌙',
    effects: ['sleep', 'calm'] as PrimaryEffect[],
    color: 'indigo',
  },
  {
    id: 'focus',
    label: 'Focus & Energy',
    description: 'Stay sharp and productive',
    icon: '⚡',
    effects: ['focus', 'energy'] as PrimaryEffect[],
    color: 'amber',
  },
  {
    id: 'relief',
    label: 'Pain & Inflammation',
    description: 'Natural relief options',
    icon: '💪',
    effects: ['pain', 'inflammation'] as PrimaryEffect[],
    color: 'red',
  },
  {
    id: 'mood',
    label: 'Mood & Wellness',
    description: 'Support emotional balance',
    icon: '😊',
    effects: ['mood', 'nausea'] as PrimaryEffect[],
    color: 'pink',
  },
];

export function FindYourCannabinoid({ cannabinoids }: FindYourCannabinoidProps) {
  const [activeGroup, setActiveGroup] = useState<string | null>(null);

  // Get cannabinoids for selected group
  const getCannabinoidsForGroup = (groupId: string) => {
    const group = EFFECT_GROUPS.find(g => g.id === groupId);
    if (!group) return [];

    const matchingCannabinoids = new Set<Cannabinoid>();
    group.effects.forEach(effect => {
      getCannabinoidsByEffect(effect).slice(0, 4).forEach(c => matchingCannabinoids.add(c));
    });

    return Array.from(matchingCannabinoids).slice(0, 6);
  };

  const selectedCannabinoids = activeGroup ? getCannabinoidsForGroup(activeGroup) : [];
  const activeGroupInfo = EFFECT_GROUPS.find(g => g.id === activeGroup);

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 lg:p-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Find Your Cannabinoid
        </h2>
        <p className="text-gray-600">
          What are you looking to achieve? Select a goal to see which cannabinoids may help.
        </p>
      </div>

      {/* Goal Selection Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {EFFECT_GROUPS.map(group => (
          <button
            key={group.id}
            onClick={() => setActiveGroup(activeGroup === group.id ? null : group.id)}
            className={`p-4 rounded-xl text-left transition-all duration-200 ${
              activeGroup === group.id
                ? `bg-${group.color}-600 text-white shadow-lg scale-[1.02]`
                : 'bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300'
            }`}
            style={activeGroup === group.id ? {
              backgroundColor: `var(--color-${group.color}-600, #4f46e5)`,
            } : {}}
          >
            <span className="text-2xl mb-2 block">{group.icon}</span>
            <h3 className={`font-semibold mb-1 ${activeGroup === group.id ? 'text-white' : 'text-gray-900'}`}>
              {group.label}
            </h3>
            <p className={`text-sm ${activeGroup === group.id ? 'text-white/80' : 'text-gray-500'}`}>
              {group.description}
            </p>
          </button>
        ))}
      </div>

      {/* Results */}
      {activeGroup && selectedCannabinoids.length > 0 && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">{activeGroupInfo?.icon}</span>
            <h3 className="text-lg font-semibold text-gray-900">
              Best cannabinoids for {activeGroupInfo?.label.toLowerCase()}
            </h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {selectedCannabinoids.map(cannabinoid => {
              const typeInfo = TYPE_META[cannabinoid.type];
              const topEffects = cannabinoid.primaryEffects.slice(0, 2);

              return (
                <Link
                  key={cannabinoid.slug}
                  href={cannabinoid.glossarySlug ? `/glossary/${cannabinoid.glossarySlug}` : '#'}
                  className="group bg-white rounded-xl p-4 border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all"
                >
                  {/* Badge */}
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${typeInfo.bgGradient} flex items-center justify-center mb-3`}>
                    <span className="text-white font-bold text-sm">{cannabinoid.abbreviation}</span>
                  </div>

                  {/* Name */}
                  <h4 className="font-semibold text-gray-900 text-sm mb-1 group-hover:text-green-600 transition-colors">
                    {cannabinoid.abbreviation}
                  </h4>
                  <p className="text-xs text-gray-500 mb-2 line-clamp-1">{cannabinoid.fullName}</p>

                  {/* Effects */}
                  <div className="flex gap-1">
                    {topEffects.map(effect => {
                      const info = EFFECT_META[effect];
                      return (
                        <span key={effect} className="text-sm" title={info.label}>
                          {info.icon}
                        </span>
                      );
                    })}
                  </div>

                  {/* Intoxicating indicator */}
                  <div className="mt-2 pt-2 border-t border-gray-100">
                    <span className={`text-[10px] font-medium ${
                      cannabinoid.intoxicating ? 'text-amber-600' : 'text-green-600'
                    }`}>
                      {cannabinoid.intoxicating ? '⚠️ Intoxicating' : '✓ Non-intoxicating'}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Note */}
          <p className="mt-4 text-sm text-gray-500 text-center">
            Click any cannabinoid to learn more about its effects and research.
          </p>
        </div>
      )}

      {/* Empty state */}
      {!activeGroup && (
        <div className="text-center py-8 text-gray-500">
          <span className="text-4xl mb-2 block">👆</span>
          <p>Select a goal above to see recommended cannabinoids</p>
        </div>
      )}
    </div>
  );
}

// Simpler version: just show effect badges that filter
export function EffectFilter({
  effects,
  activeEffect,
  onSelect,
}: {
  effects: PrimaryEffect[];
  activeEffect: PrimaryEffect | null;
  onSelect: (effect: PrimaryEffect | null) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onSelect(null)}
        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
          activeEffect === null
            ? 'bg-green-600 text-white'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
      >
        All
      </button>
      {effects.map(effect => {
        const info = EFFECT_META[effect];
        return (
          <button
            key={effect}
            onClick={() => onSelect(activeEffect === effect ? null : effect)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1 ${
              activeEffect === effect
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <span>{info.icon}</span>
            {info.label}
          </button>
        );
      })}
    </div>
  );
}
