import Link from 'next/link';

const tools = [
  {
    title: 'CBD Dosage Calculator',
    description: 'Get personalized CBD dosing recommendations based on your body weight, experience level, and health goals. Science-based calculations with proper safety guidelines.',
    href: '/tools/dosage-calculator',
    icon: '💊',
    features: [
      'Personalized recommendations',
      'Multiple product types',
      'Safety warnings',
      'Titration schedule'
    ],
    status: 'available'
  },
  {
    title: 'CBD Strength Calculator',
    description: 'Convert between CBD percentages, mg/ml, and total mg. Calculate drops needed for your target dose and compare product strengths side-by-side.',
    href: '/tools/strength-calculator',
    icon: '🧮',
    features: [
      'Convert %, mg/ml, total mg',
      'Drops calculator',
      'Product comparison',
      'Switching helper'
    ],
    status: 'available'
  },
  {
    title: 'Animal CBD Dosage Calculator',
    description: 'Veterinary-guided CBD dosing recommendations for dogs, cats, horses, and other animals. Species-specific calculations with enhanced safety protocols.',
    href: '/tools/animal-dosage-calculator',
    icon: '🐾',
    features: [
      'Species-specific dosing',
      'Age sensitivity adjustments',
      'Veterinary safety protocols',
      'Animal product guidance'
    ],
    status: 'available'
  },
  {
    title: 'Drug Interaction Checker',
    description: 'Check potential interactions between CBD and your current medications. Essential safety tool for anyone taking prescription drugs.',
    href: '/tools/interactions',
    icon: '💊⚠️',
    features: [
      'Comprehensive drug database',
      'Severity ratings',
      'Medical guidance',
      'Safety recommendations'
    ],
    status: 'available'
  },
  {
    title: 'Product Finder Quiz',
    description: 'Find the right CBD product for your specific needs. Answer a few questions about your goals and preferences to get tailored recommendations.',
    href: '/tools/product-finder',
    icon: '🔍',
    features: [
      'Personalized matching',
      'Product comparisons',
      'Budget considerations',
      'Quality verification'
    ],
    status: 'coming-soon'
  },
  {
    title: 'Symptom Tracker',
    description: 'Track your symptoms and CBD effects over time. Monitor your progress and optimize your CBD routine with data-driven insights.',
    href: '/tools/symptom-tracker',
    icon: '📊',
    features: [
      'Daily tracking',
      'Progress charts',
      'Effect correlation',
      'Export reports'
    ],
    status: 'coming-soon'
  },
  {
    title: 'Cost Calculator',
    description: 'Compare CBD product costs per milligram of active CBD. Find the best value products without compromising on quality.',
    href: '/tools/cost-calculator',
    icon: '💰',
    features: [
      'Price per mg calculation',
      'Product comparisons',
      'Value rankings',
      'Budget planning'
    ],
    status: 'coming-soon'
  },
  {
    title: 'Lab Report Analyzer',
    description: 'Upload and analyze Certificate of Analysis (COA) documents. Understand product quality, potency, and safety test results.',
    href: '/tools/lab-analyzer',
    icon: '🧪',
    features: [
      'COA analysis',
      'Safety verification',
      'Potency validation',
      'Contaminant checking'
    ],
    status: 'coming-soon'
  }
];

export default function ToolsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">CBD Tools & Calculators</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Evidence-based tools to help you make informed decisions about CBD use.
              Get personalized recommendations, check safety information, and track your progress.
            </p>
          </div>
        </div>
      </div>

      {/* Tools Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tools.map((tool, index) => (
            <div
              key={tool.title}
              className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 transition-all duration-200 hover:shadow-md
                ${tool.status === 'available' ? 'hover:border-blue-300' : 'opacity-75'}
              `}
            >
              {/* Icon */}
              <div className="text-4xl mb-4">{tool.icon}</div>

              {/* Title and Status */}
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-xl font-semibold text-gray-900">{tool.title}</h3>
                {tool.status === 'coming-soon' && (
                  <span className="bg-amber-100 text-amber-800 text-xs font-medium px-2 py-1 rounded-full">
                    Coming Soon
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-gray-600 mb-4 leading-relaxed">
                {tool.description}
              </p>

              {/* Features */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Features:</h4>
                <ul className="space-y-1">
                  {tool.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="text-sm text-gray-600 flex items-center">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Button */}
              <div className="pt-4 border-t border-gray-100">
                {tool.status === 'available' ? (
                  <Link
                    href={tool.href}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium text-center block"
                  >
                    Use This Tool
                  </Link>
                ) : (
                  <button
                    disabled
                    className="w-full bg-gray-300 text-gray-500 py-3 px-4 rounded-lg font-medium text-center cursor-not-allowed"
                  >
                    Coming Soon
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
              <h3 className="text-lg font-semibold text-red-900 mb-2">Important Safety Notice</h3>
              <p className="text-red-800 leading-relaxed">
                <strong>These tools are for educational purposes only and do not constitute medical advice.</strong>
                CBD affects everyone differently and can interact with medications. Always consult with a healthcare
                provider before starting CBD, especially if you have medical conditions, take medications, are pregnant
                or nursing, or are treating serious health conditions.
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
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Science-Based</h3>
              <p className="text-gray-600">
                All our tools are built on published research and expert recommendations from the medical cannabis community.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🛡️</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Safety First</h3>
              <p className="text-gray-600">
                Every tool includes comprehensive safety information, warnings, and guidance on when to consult healthcare providers.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📱</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Easy to Use</h3>
              <p className="text-gray-600">
                Designed for both beginners and experienced users with intuitive interfaces and clear explanations.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}