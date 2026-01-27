'use client';

import Link from 'next/link';
import { useLocale } from '@/hooks/useLocale';

export function ToolsShowcase() {
  const { t } = useLocale();

  const tools = [
    {
      nameKey: 'toolsShowcase.dosageCalculator',
      descriptionKey: 'toolsShowcase.dosageCalculatorDesc',
      href: '/tools/dosage-calculator',
      icon: '💊',
      color: 'bg-blue-50 border-blue-200 hover:border-blue-400',
      iconBg: 'bg-blue-100',
    },
    {
      nameKey: 'toolsShowcase.strengthCalculator',
      descriptionKey: 'toolsShowcase.strengthCalculatorDesc',
      href: '/tools/strength-calculator',
      icon: '🧮',
      color: 'bg-purple-50 border-purple-200 hover:border-purple-400',
      iconBg: 'bg-purple-100',
    },
    {
      nameKey: 'toolsShowcase.petDosageCalculator',
      descriptionKey: 'toolsShowcase.petDosageCalculatorDesc',
      href: '/tools/animal-dosage-calculator',
      icon: '🐾',
      color: 'bg-orange-50 border-orange-200 hover:border-orange-400',
      iconBg: 'bg-orange-100',
    },
  ];

  return (
    <section className="py-12 md:py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            {t('toolsShowcase.title')}
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {t('toolsShowcase.subtitle')}
          </p>
        </div>

        {/* Drug Interaction Checker - Featured */}
        <Link
          href="/tools/interactions"
          className="block mb-8 bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 hover:border-red-400 rounded-2xl p-6 md:p-8 transition-all hover:shadow-lg group"
        >
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-red-100 rounded-2xl flex items-center justify-center">
                <span className="text-3xl md:text-4xl">⚠️</span>
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 group-hover:text-red-700 transition-colors">
                  {t('toolsShowcase.interactionChecker')}
                </h3>
                <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                  {t('toolsShowcase.essentialSafetyTool')}
                </span>
              </div>
              <p className="text-gray-600 mb-4">
                {t('toolsShowcase.interactionCheckerDesc')}
              </p>
              <div className="flex flex-wrap gap-4 text-sm">
                <span className="flex items-center gap-1.5 text-gray-500">
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                  {t('toolsShowcase.majorInteractions')}
                </span>
                <span className="flex items-center gap-1.5 text-gray-500">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                  {t('toolsShowcase.researchCitations')}
                </span>
                <span className="flex items-center gap-1.5 text-gray-500">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  {t('toolsShowcase.medicationsCovered')}
                </span>
              </div>
            </div>
            <div className="flex-shrink-0 hidden md:block">
              <span className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg font-semibold group-hover:bg-red-700 transition-colors">
                {t('toolsShowcase.checkInteractions')}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </div>
          </div>
          {/* Mobile CTA */}
          <div className="mt-4 md:hidden">
            <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-lg font-semibold text-sm">
              {t('toolsShowcase.checkInteractions')}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </div>
        </Link>

        {/* Other Tools Grid */}
        <div className="grid md:grid-cols-3 gap-4 md:gap-6">
          {tools.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className={`block p-5 md:p-6 rounded-xl border-2 transition-all hover:shadow-md group ${tool.color}`}
            >
              <div className={`w-12 h-12 ${tool.iconBg} rounded-xl flex items-center justify-center mb-4`}>
                <span className="text-2xl">{tool.icon}</span>
              </div>
              <h3 className="font-semibold text-gray-900 group-hover:text-green-700 mb-2">
                {t(tool.nameKey)}
              </h3>
              <p className="text-sm text-gray-600">{t(tool.descriptionKey)}</p>
            </Link>
          ))}
        </div>

        {/* View All Tools Link */}
        <div className="text-center mt-8">
          <Link
            href="/tools"
            className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-medium"
          >
            {t('toolsShowcase.viewAllTools')}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
