'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

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
  const [showDisclaimer, setShowDisclaimer] = useState(true);

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Medical Disclaimer Modal */}
      {showDisclaimer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                <span className="text-2xl">⚠️</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Important Medical Disclaimer</h2>
            </div>
            <div className="prose prose-sm mb-6">
              <p className="text-gray-700 leading-relaxed">
                <strong>This calculator is for educational purposes only and does not constitute medical advice.</strong>
                CBD dosing is highly individual and depends on many factors including body chemistry, medical conditions,
                medications, and product quality.
              </p>
              <p className="text-gray-700 leading-relaxed mt-3">
                <strong>Always consult with a healthcare provider</strong> before starting CBD, especially if you have medical
                conditions, take medications, are pregnant or nursing, or are treating serious health conditions.
              </p>
              <p className="text-gray-700 leading-relaxed mt-3">
                The recommendations provided are general guidelines based on published research and should be adjusted
                based on individual response and professional medical guidance.
              </p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setShowDisclaimer(false)}
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                I Understand - Continue to Calculator
              </button>
              <Link
                href="/"
                className="flex-1 bg-gray-200 text-gray-800 py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors font-medium text-center"
              >
                Return to Home
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">CBD Dosage Calculator</h1>
              <p className="text-gray-600 mt-2">Get personalized CBD dosing recommendations based on current research</p>
            </div>
            <Link
              href="/"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Calculator Form */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Enter Your Information</h2>

            {/* Body Weight */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Body Weight *
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
                CBD Experience Level *
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'beginner', label: 'Beginner', desc: 'Never or rarely used' },
                  { value: 'intermediate', label: 'Intermediate', desc: 'Some experience' },
                  { value: 'experienced', label: 'Experienced', desc: 'Regular user' }
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
                Primary Reason for Use *
              </label>
              <select
                value={inputs.condition}
                onChange={(e) => handleInputChange('condition', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="general">General wellness</option>
                <option value="anxiety">Anxiety & stress</option>
                <option value="pain">Pain management</option>
                <option value="sleep">Sleep disorders</option>
                <option value="inflammation">Inflammation</option>
                <option value="epilepsy">Epilepsy (requires medical supervision)</option>
              </select>
            </div>

            {/* Product Type */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Type *
              </label>
              <select
                value={inputs.productType}
                onChange={(e) => handleInputChange('productType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="oil">CBD Oil (tincture)</option>
                <option value="sublingual">Sublingual drops</option>
                <option value="edibles">Edibles (gummies, chocolates)</option>
                <option value="capsules">Capsules/softgels</option>
                <option value="vape">Vape/inhalation</option>
                <option value="topical">Topical (creams, balms)</option>
              </select>
            </div>

            {/* Desired Strength */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Desired Effect Strength *
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'mild', label: 'Mild', desc: 'Subtle effects' },
                  { value: 'moderate', label: 'Moderate', desc: 'Noticeable effects' },
                  { value: 'strong', label: 'Strong', desc: 'Pronounced effects' }
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
                  I currently take prescription medications
                </span>
              </label>
            </div>

            {/* Calculate Button */}
            <button
              onClick={handleCalculate}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Calculate My CBD Dosage
            </button>
          </div>

          {/* Results */}
          {recommendation && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Your Dosage Recommendation</h2>

              {/* Starting Dose */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Recommended Starting Dose</h3>
                <div className="text-3xl font-bold text-blue-700 mb-2">
                  {recommendation.startingDose}mg
                </div>
                <p className="text-blue-800 text-sm">
                  {recommendation.frequency}
                </p>
                <p className="text-blue-700 text-sm mt-2 font-medium">
                  Maximum: {recommendation.maxDose}mg per day
                </p>
              </div>

              {/* Administration Method */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-2">How to Take</h4>
                <p className="text-gray-700 text-sm">{recommendation.method}</p>
              </div>

              {/* Titration Schedule */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-2">Gradual Increase Schedule</h4>
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
                  Important Safety Information
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
                <h4 className="font-semibold text-gray-900 mb-2">Additional Notes</h4>
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
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Understanding CBD Dosing</h2>

              <div className="space-y-4 text-sm text-gray-700">
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Why Individual Dosing Matters</h4>
                  <p>CBD affects everyone differently due to factors like metabolism, body chemistry, medical conditions, and product quality. What works for one person may not work for another.</p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Start Low, Go Slow</h4>
                  <p>The golden rule of CBD dosing is to start with a low dose and gradually increase until you find what works for you. This approach minimizes side effects and helps you find your optimal dose.</p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Product Quality Matters</h4>
                  <p>Always choose third-party tested products with Certificates of Analysis (COAs) to ensure you're getting accurate potency and purity information.</p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Medical Supervision</h4>
                  <p>If you're treating a medical condition, especially epilepsy or other serious conditions, work with a healthcare provider experienced in cannabis medicine.</p>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-800 text-sm">
                  <strong>Research-Based:</strong> Our calculator uses dosing guidelines from published clinical research and expert recommendations to provide science-based starting points.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}