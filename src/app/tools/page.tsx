import { Metadata } from 'next';
import { LocaleLink as Link } from '@/components/LocaleLink';
import { getHreflangAlternates } from '@/components/HreflangTags';
import { getLanguage } from '@/lib/get-language';
import { getLocaleSync, createTranslator } from '@/../locales';
import type { LanguageCode } from '@/lib/translation-service';
import { createLocalizedHref } from '@/lib/utils/locale-href';

// Force dynamic rendering to support language switching via ?lang= parameter
export const dynamic = 'force-dynamic';

interface Props {
  searchParams: Promise<{ lang?: string }>;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { lang: langParam } = await searchParams;
  const lang = (langParam || await getLanguage()) as LanguageCode;
  const locale = getLocaleSync(lang);
  const t = createTranslator(locale);

  return {
    title: t('toolsPage.metaTitle') || 'CBD Tools & Calculators | Dosage, Interactions, Cost',
    description: t('toolsPage.metaDescription') || 'Evidence-based CBD tools including dosage calculator, drug interaction checker, cost calculator, and strength converter.',
    alternates: getHreflangAlternates('/tools'),
  };
}

interface Tool {
  titleKey: string;
  descKey: string;
  href: string;
  icon: string;
  featuresKeys: string[];
  status: 'available' | 'coming-soon';
}

const tools: Tool[] = [
  {
    titleKey: 'toolsPage.dosageCalculatorTitle',
    descKey: 'toolsPage.dosageCalculatorDesc',
    href: '/tools/dosage-calculator',
    icon: '💊',
    featuresKeys: [
      'toolsPage.personalizedRecommendations',
      'toolsPage.multipleProductTypes',
      'toolsPage.safetyWarnings',
      'toolsPage.titrationSchedule'
    ],
    status: 'available'
  },
  {
    titleKey: 'toolsPage.strengthCalculatorTitle',
    descKey: 'toolsPage.strengthCalculatorDesc',
    href: '/tools/strength-calculator',
    icon: '🧮',
    featuresKeys: [
      'toolsPage.convertUnits',
      'toolsPage.dropsCalculator',
      'toolsPage.productComparison',
      'toolsPage.switchingHelper'
    ],
    status: 'available'
  },
  {
    titleKey: 'toolsPage.animalDosageTitle',
    descKey: 'toolsPage.animalDosageDesc',
    href: '/tools/animal-dosage-calculator',
    icon: '🐾',
    featuresKeys: [
      'toolsPage.speciesSpecificDosing',
      'toolsPage.ageSensitivity',
      'toolsPage.vetSafetyProtocols',
      'toolsPage.animalProductGuidance'
    ],
    status: 'available'
  },
  {
    titleKey: 'toolsPage.interactionCheckerTitle',
    descKey: 'toolsPage.interactionCheckerDesc',
    href: '/tools/interactions',
    icon: '💊⚠️',
    featuresKeys: [
      'toolsPage.comprehensiveDrugDatabase',
      'toolsPage.severityRatings',
      'toolsPage.medicalGuidance',
      'toolsPage.safetyRecommendations'
    ],
    status: 'available'
  },
  {
    titleKey: 'toolsPage.productFinderTitle',
    descKey: 'toolsPage.productFinderDesc',
    href: '/tools/product-finder',
    icon: '🔍',
    featuresKeys: [
      'toolsPage.personalizedMatching',
      'toolsPage.productComparisons',
      'toolsPage.budgetConsiderations',
      'toolsPage.qualityVerification'
    ],
    status: 'coming-soon'
  },
  {
    titleKey: 'toolsPage.symptomTrackerTitle',
    descKey: 'toolsPage.symptomTrackerDesc',
    href: '/tools/symptom-tracker',
    icon: '📊',
    featuresKeys: [
      'toolsPage.dailyTracking',
      'toolsPage.progressCharts',
      'toolsPage.effectCorrelation',
      'toolsPage.exportReports'
    ],
    status: 'coming-soon'
  },
  {
    titleKey: 'toolsPage.costCalculatorTitle',
    descKey: 'toolsPage.costCalculatorDesc',
    href: '/tools/cost-calculator',
    icon: '💰',
    featuresKeys: [
      'toolsPage.pricePerMg',
      'toolsPage.productComparisons',
      'toolsPage.valueRankings',
      'toolsPage.budgetPlanning'
    ],
    status: 'available'
  },
  {
    titleKey: 'toolsPage.labAnalyzerTitle',
    descKey: 'toolsPage.labAnalyzerDesc',
    href: '/tools/lab-analyzer',
    icon: '🧪',
    featuresKeys: [
      'toolsPage.coaAnalysis',
      'toolsPage.safetyVerification',
      'toolsPage.potencyValidation',
      'toolsPage.contaminantChecking'
    ],
    status: 'coming-soon'
  }
];

export default async function ToolsPage({ searchParams }: Props) {
  const { lang: langParam } = await searchParams;
  const lang = (langParam || await getLanguage()) as LanguageCode;
  const locale = getLocaleSync(lang);
  const t = createTranslator(locale);
  const localizedHref = createLocalizedHref(lang);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('toolsPage.title')}</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t('toolsPage.subtitle')}
            </p>
          </div>
        </div>
      </div>

      {/* Tools Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tools.map((tool) => (
            <div
              key={tool.titleKey}
              className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 transition-all duration-200 hover:shadow-md
                ${tool.status === 'available' ? 'hover:border-blue-300' : 'opacity-75'}
              `}
            >
              {/* Icon */}
              <div className="text-4xl mb-4">{tool.icon}</div>

              {/* Title and Status */}
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-xl font-semibold text-gray-900">{t(tool.titleKey)}</h3>
                {tool.status === 'coming-soon' && (
                  <span className="bg-amber-100 text-amber-800 text-xs font-medium px-2 py-1 rounded-full">
                    {t('toolsPage.comingSoon')}
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-gray-600 mb-4 leading-relaxed">
                {t(tool.descKey)}
              </p>

              {/* Features */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-900 mb-2">{t('toolsPage.features')}:</h4>
                <ul className="space-y-1">
                  {tool.featuresKeys.map((featureKey, featureIndex) => (
                    <li key={featureIndex} className="text-sm text-gray-600 flex items-center">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>
                      {t(featureKey)}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Button */}
              <div className="pt-4 border-t border-gray-100">
                {tool.status === 'available' ? (
                  <Link
                    href={localizedHref(tool.href)}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium text-center block"
                  >
                    {t('toolsPage.useThisTool')}
                  </Link>
                ) : (
                  <button
                    disabled
                    className="w-full bg-gray-300 text-gray-500 py-3 px-4 rounded-lg font-medium text-center cursor-not-allowed"
                  >
                    {t('toolsPage.comingSoon')}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Safety Notice */}
      <div className="bg-red-50 border border-red-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-start">
            <div className="flex-shrink-0 mr-4">
              <span className="text-3xl">⚠️</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-red-900 mb-2">{t('toolsPage.safetyNoticeTitle')}</h3>
              <p className="text-red-800 leading-relaxed">
                {t('toolsPage.safetyNoticeText')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Educational Section */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔬</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('toolsPage.scienceBased')}</h3>
              <p className="text-gray-600">
                {t('toolsPage.scienceBasedDesc')}
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🛡️</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('toolsPage.safetyFirst')}</h3>
              <p className="text-gray-600">
                {t('toolsPage.safetyFirstDesc')}
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📱</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('toolsPage.easyToUse')}</h3>
              <p className="text-gray-600">
                {t('toolsPage.easyToUseDesc')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}