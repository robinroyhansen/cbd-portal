'use client';

import { useState, useEffect } from 'react';
import { LocaleLink as Link } from '@/components/LocaleLink';
import { useLocale } from '@/hooks/useLocale';
import { generateHowToSchema } from '@/lib/seo/howto-schema';

interface DosageRecommendation {
  startingDose: number;
  maxDose: number;
  frequency: string;
  method: string;
  titrationSchedule: string[];
  warnings: string[];
  notes: string[];
}

interface CalculatorInputs {
  bodyWeight: number;
  weightUnit: 'kg' | 'lbs';
  experience: 'beginner' | 'intermediate' | 'experienced';
  condition: 'anxiety' | 'pain' | 'sleep' | 'epilepsy' | 'inflammation' | 'general';
  productType: 'oil' | 'edibles' | 'capsules' | 'vape' | 'topical' | 'sublingual';
  desiredStrength: 'mild' | 'moderate' | 'strong';
  currentMedications: boolean;
}

// Dosage calculation algorithms
const calculateDosage = (inputs: CalculatorInputs): DosageRecommendation => {
  const { bodyWeight, weightUnit, experience, condition, productType, desiredStrength } = inputs;

  // Convert weight to kg if needed
  const weightInKg = weightUnit === 'lbs' ? bodyWeight * 0.453592 : bodyWeight;

  // Base dose calculation (mg per kg body weight)
  let baseDosePerKg: number;

  switch (experience) {
    case 'beginner':
      baseDosePerKg = 0.25; // 0.25mg per kg
      break;
    case 'intermediate':
      baseDosePerKg = 0.5; // 0.5mg per kg
      break;
    case 'experienced':
      baseDosePerKg = 1.0; // 1mg per kg
      break;
    default:
      baseDosePerKg = 0.25;
  }

  // Condition-specific adjustments
  const conditionMultipliers = {
    general: 1.0,
    anxiety: 1.2,
    pain: 1.5,
    sleep: 1.3,
    epilepsy: 2.5, // Higher doses often needed, but requires medical supervision
    inflammation: 1.4
  };

  // Product bioavailability factors
  const bioavailabilityFactors = {
    oil: 1.0, // Baseline
    sublingual: 0.8, // Higher bioavailability, so lower dose needed
    edibles: 1.5, // Lower bioavailability, higher dose needed
    capsules: 1.4,
    vape: 0.6, // Highest bioavailability
    topical: 3.0 // Much higher doses for topical application
  };

  // Strength adjustments
  const strengthMultipliers = {
    mild: 0.8,
    moderate: 1.0,
    strong: 1.3
  };

  // Calculate starting dose
  let startingDose = weightInKg * baseDosePerKg * conditionMultipliers[condition] * bioavailabilityFactors[productType] * strengthMultipliers[desiredStrength];

  // Round to reasonable increments
  if (startingDose < 2.5) {
    startingDose = Math.round(startingDose * 4) / 4; // Round to 0.25mg increments
  } else if (startingDose < 10) {
    startingDose = Math.round(startingDose * 2) / 2; // Round to 0.5mg increments
  } else {
    startingDose = Math.round(startingDose); // Round to 1mg increments
  }

  // Minimum starting dose
  startingDose = Math.max(startingDose, productType === 'topical' ? 5 : 1);

  // Calculate maximum dose (typically 3-5x starting dose)
  let maxDose = startingDose * (experience === 'beginner' ? 3 : experience === 'intermediate' ? 4 : 5);

  // Special cases for epilepsy (requires medical supervision)
  if (condition === 'epilepsy') {
    maxDose = Math.min(maxDose, 40); // Cap at 40mg for safety
  }

  // Generate frequency recommendations
  const frequency = productType === 'vape' ? '2-3 times daily as needed' :
                   productType === 'topical' ? '2-4 times daily to affected area' :
                   condition === 'sleep' ? 'Once daily, 30-60 minutes before bedtime' :
                   condition === 'anxiety' ? '2-3 times daily' :
                   '1-2 times daily';

  // Generate titration schedule
  const titrationSchedule = [
    `Week 1: Start with ${startingDose}mg ${frequency.toLowerCase()}`,
    `Week 2: If well tolerated, increase to ${Math.round(startingDose * 1.5)}mg ${frequency.toLowerCase()}`,
    `Week 3: If needed, increase to ${Math.round(startingDose * 2)}mg ${frequency.toLowerCase()}`,
    `Continue increasing by 25-50% weekly until desired effects achieved`
  ];

  // Generate warnings
  const warnings = [
    'Always consult with a healthcare provider before starting CBD',
    'Start with the lowest dose and increase gradually',
    'Wait at least 2 hours before taking additional doses',
    'Do not drive or operate machinery until you know how CBD affects you'
  ];

  if (inputs.currentMedications) {
    warnings.push('CBD can interact with certain medications - consult your doctor');
  }

  if (condition === 'epilepsy') {
    warnings.push('Epilepsy treatment requires medical supervision - work with a neurologist');
  }

  if (productType === 'edibles') {
    warnings.push('Edibles can take 30-120 minutes to take effect');
    warnings.push('Effects can last 4-8 hours');
  }

  // Generate notes
  const notes = [
    'These are general guidelines only - individual responses vary greatly',
    'Keep a dosing journal to track effects and adjust accordingly',
    'Look for third-party tested products with COAs (Certificates of Analysis)',
    'Store CBD products in a cool, dry place away from direct sunlight'
  ];

  return {
    startingDose,
    maxDose,
    frequency,
    method: getMethodInstructions(productType),
    titrationSchedule,
    warnings,
    notes
  };
};

const getMethodInstructions = (productType: string): string => {
  switch (productType) {
    case 'oil':
    case 'sublingual':
      return 'Hold under tongue for 5-10 minutes before swallowing for best absorption';
    case 'edibles':
      return 'Take with food for better absorption. Effects take 30-120 minutes to appear';
    case 'capsules':
      return 'Take with food and water. Effects take 30-90 minutes to appear';
    case 'vape':
      return 'Start with 1-2 small puffs. Effects appear within 2-15 minutes';
    case 'topical':
      return 'Apply to clean, dry skin. Massage gently until absorbed. Reapply as needed';
    default:
      return 'Follow product-specific instructions on the label';
  }
};

export default function DosageCalculator() {
  const { t } = useLocale();
  const [inputs, setInputs] = useState<CalculatorInputs>({
    bodyWeight: 70,
    weightUnit: 'kg',
    experience: 'beginner',
    condition: 'general',
    productType: 'oil',
    desiredStrength: 'mild',
    currentMedications: false
  });

  const [recommendation, setRecommendation] = useState<DosageRecommendation | null>(null);

  const handleCalculate = () => {
    const result = calculateDosage(inputs);
    setRecommendation(result);
  };

  const handleInputChange = (field: keyof CalculatorInputs, value: any) => {
    setInputs(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const howToSchema = generateHowToSchema({
    title: 'How to Calculate Your CBD Dosage',
    description: 'Use our CBD dosage calculator to find your personalized starting dose based on body weight, experience level, and desired effects.',
    steps: [
      {
        name: 'Enter Your Body Weight',
        text: 'Input your body weight in kilograms or pounds. This is used to calculate a weight-based dosage recommendation.'
      },
      {
        name: 'Select Your Experience Level',
        text: 'Choose whether you are a beginner, intermediate, or experienced CBD user. Beginners should start with lower doses.'
      },
      {
        name: 'Choose Your Primary Condition',
        text: 'Select the main reason you want to use CBD (e.g., anxiety, pain, sleep, general wellness). Different conditions may require different dosages.'
      },
      {
        name: 'Select Your Product Type',
        text: 'Choose the type of CBD product you plan to use (oil, edibles, capsules, vape, or topical). Bioavailability varies by product type.'
      },
      {
        name: 'Calculate and Review Results',
        text: 'Click calculate to see your personalized starting dose, maximum dose, frequency recommendations, and titration schedule.'
      }
    ],
    totalTime: 'PT3M'
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{t('dosageCalc.title')}</h1>
              <p className="text-gray-600 mt-2">{t('dosageCalc.subtitle')}</p>
            </div>
            <Link
              href="/"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              {t('dosageCalc.backToHome')}
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Calculator Form */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">{t('dosageCalc.enterInfo')}</h2>

            {/* Body Weight */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('dosageCalc.bodyWeight')} *
              </label>
              <div className="flex gap-3">
                <input
                  type="number"
                  value={inputs.bodyWeight}
                  onChange={(e) => handleInputChange('bodyWeight', parseFloat(e.target.value) || 0)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter weight"
                  min="1"
                  max="500"
                />
                <select
                  value={inputs.weightUnit}
                  onChange={(e) => handleInputChange('weightUnit', e.target.value as 'kg' | 'lbs')}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="kg">kg</option>
                  <option value="lbs">lbs</option>
                </select>
              </div>
            </div>

            {/* Experience Level */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('dosageCalc.experienceLevel')} *
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'beginner', label: t('dosageCalc.beginner'), desc: t('dosageCalc.beginnerDesc') },
                  { value: 'intermediate', label: t('dosageCalc.intermediate'), desc: t('dosageCalc.intermediateDesc') },
                  { value: 'experienced', label: t('dosageCalc.experienced'), desc: t('dosageCalc.experiencedDesc') }
                ].map(option => (
                  <label key={option.value} className="cursor-pointer">
                    <input
                      type="radio"
                      name="experience"
                      value={option.value}
                      checked={inputs.experience === option.value}
                      onChange={(e) => handleInputChange('experience', e.target.value)}
                      className="sr-only"
                    />
                    <div className={`p-3 border rounded-lg text-center transition-colors ${
                      inputs.experience === option.value
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}>
                      <div className="font-medium text-sm">{option.label}</div>
                      <div className="text-xs text-gray-500">{option.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Primary Condition */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('dosageCalc.primaryReason')} *
              </label>
              <select
                value={inputs.condition}
                onChange={(e) => handleInputChange('condition', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="general">{t('dosageCalc.generalWellness')}</option>
                <option value="anxiety">{t('dosageCalc.anxietyStress')}</option>
                <option value="pain">{t('dosageCalc.painManagement')}</option>
                <option value="sleep">{t('dosageCalc.sleepDisorders')}</option>
                <option value="inflammation">{t('dosageCalc.inflammation')}</option>
                <option value="epilepsy">{t('dosageCalc.epilepsyMedical')}</option>
              </select>
            </div>

            {/* Product Type */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('dosageCalc.productType')} *
              </label>
              <select
                value={inputs.productType}
                onChange={(e) => handleInputChange('productType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="oil">{t('dosageCalc.oilTincture')}</option>
                <option value="sublingual">{t('dosageCalc.sublingualDrops')}</option>
                <option value="edibles">{t('dosageCalc.ediblesGummies')}</option>
                <option value="capsules">{t('dosageCalc.capsulesSoftgels')}</option>
                <option value="vape">{t('dosageCalc.vapeInhalation')}</option>
                <option value="topical">{t('dosageCalc.topicalCreams')}</option>
              </select>
            </div>

            {/* Desired Strength */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('dosageCalc.desiredStrength')} *
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'mild', label: t('dosageCalc.mild'), desc: t('dosageCalc.mildDesc') },
                  { value: 'moderate', label: t('dosageCalc.moderate'), desc: t('dosageCalc.moderateDesc') },
                  { value: 'strong', label: t('dosageCalc.strong'), desc: t('dosageCalc.strongDesc') }
                ].map(option => (
                  <label key={option.value} className="cursor-pointer">
                    <input
                      type="radio"
                      name="strength"
                      value={option.value}
                      checked={inputs.desiredStrength === option.value}
                      onChange={(e) => handleInputChange('desiredStrength', e.target.value)}
                      className="sr-only"
                    />
                    <div className={`p-3 border rounded-lg text-center transition-colors ${
                      inputs.desiredStrength === option.value
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}>
                      <div className="font-medium text-sm">{option.label}</div>
                      <div className="text-xs text-gray-500">{option.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Current Medications */}
            <div className="mb-6">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={inputs.currentMedications}
                  onChange={(e) => handleInputChange('currentMedications', e.target.checked)}
                  className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm font-medium text-gray-700">
                  {t('dosageCalc.currentMedications')}
                </span>
              </label>
            </div>

            {/* Calculate Button */}
            <button
              onClick={handleCalculate}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              {t('dosageCalc.calculateButton')}
            </button>
          </div>

          {/* Results */}
          {recommendation && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">{t('dosageCalc.yourRecommendation')}</h2>

              {/* Starting Dose */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">{t('dosageCalc.startingDose')}</h3>
                <div className="text-3xl font-bold text-blue-700 mb-2">
                  {recommendation.startingDose}mg
                </div>
                <p className="text-blue-800 text-sm">
                  {recommendation.frequency}
                </p>
                <p className="text-blue-700 text-sm mt-2 font-medium">
                  {t('dosageCalc.maximum')}: {recommendation.maxDose}mg {t('dosageCalc.perDay')}
                </p>
              </div>

              {/* Administration Method */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-2">{t('dosageCalc.howToTake')}</h4>
                <p className="text-gray-700 text-sm">{recommendation.method}</p>
              </div>

              {/* Titration Schedule */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-2">{t('dosageCalc.gradualSchedule')}</h4>
                <ul className="space-y-1">
                  {recommendation.titrationSchedule.map((step, index) => (
                    <li key={index} className="text-gray-700 text-sm flex items-start">
                      <span className="w-6 h-6 bg-blue-100 text-blue-800 rounded-full text-xs flex items-center justify-center mr-2 mt-0.5">
                        {index + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Warnings */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-red-900 mb-2 flex items-center">
                  <span className="mr-2">⚠️</span>
                  {t('dosageCalc.safetyInfo')}
                </h4>
                <ul className="space-y-1">
                  {recommendation.warnings.map((warning, index) => (
                    <li key={index} className="text-red-800 text-sm">
                      • {warning}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Additional Notes */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">{t('dosageCalc.additionalNotes')}</h4>
                <ul className="space-y-1">
                  {recommendation.notes.map((note, index) => (
                    <li key={index} className="text-gray-700 text-sm">
                      • {note}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Educational Information */}
          {!recommendation && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('dosageCalc.understandingTitle')}</h2>

              <div className="space-y-4 text-sm text-gray-700">
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">{t('dosageCalc.whyIndividual')}</h4>
                  <p>{t('dosageCalc.whyIndividualDesc')}</p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-1">{t('dosageCalc.startLow')}</h4>
                  <p>{t('dosageCalc.startLowDesc')}</p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-1">{t('dosageCalc.productQuality')}</h4>
                  <p>{t('dosageCalc.productQualityDesc')}</p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-1">{t('dosageCalc.medicalSupervision')}</h4>
                  <p>{t('dosageCalc.medicalSupervisionDesc')}</p>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-800 text-sm">
                  <strong>{t('dosageCalc.researchBased')}:</strong> {t('dosageCalc.researchBasedDesc')}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}