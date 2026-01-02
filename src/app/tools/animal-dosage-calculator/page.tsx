'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface AnimalDosageRecommendation {
  startingDose: number;
  maxDose: number;
  frequency: string;
  method: string;
  titrationSchedule: string[];
  warnings: string[];
  notes: string[];
  speciesSpecificInfo: string[];
}

interface AnimalCalculatorInputs {
  species: 'dog' | 'cat' | 'horse' | 'other';
  bodyWeight: number;
  weightUnit: 'kg' | 'lbs';
  age: 'puppy_kitten' | 'adult' | 'senior';
  condition: 'arthritis' | 'anxiety' | 'behavioral' | 'seizures' | 'inflammation' | 'general';
  productType: 'oil' | 'treats' | 'capsules' | 'topical';
  desiredStrength: 'mild' | 'moderate' | 'strong';
  animalExperience: 'never' | 'some' | 'experienced';
  currentMedications: boolean;
  vetConsulted: boolean;
}

// Animal-specific dosing calculations
const calculateAnimalDosage = (inputs: AnimalCalculatorInputs): AnimalDosageRecommendation => {
  const { species, bodyWeight, weightUnit, age, condition, productType, desiredStrength, animalExperience } = inputs;

  // Convert weight to kg if needed
  const weightInKg = weightUnit === 'lbs' ? bodyWeight * 0.453592 : bodyWeight;

  // Species-specific base dosing ranges (mg per kg)
  const speciesBaseDosing = {
    dog: { min: 0.1, max: 0.2 },
    cat: { min: 0.05, max: 0.1 },
    horse: { min: 0.05, max: 0.15 },
    other: { min: 0.05, max: 0.1 } // Conservative for unknown species
  };

  // Age sensitivity multipliers (animals of different ages process CBD differently)
  const ageMultipliers = {
    'puppy_kitten': 0.5, // Much more sensitive
    'adult': 1.0,
    'senior': 0.7 // More sensitive due to slower metabolism
  };

  // Animal's CBD experience affects starting point within the dosing range
  const experienceFactors = {
    'never': 0.3, // Start at 30% of range - animals new to CBD
    'some': 0.5, // Start at 50% of range - some previous exposure
    'experienced': 0.7 // Start at 70% of range - regular CBD use
  };

  // Condition-specific adjustments for animals
  const animalConditionMultipliers = {
    general: 1.0,
    anxiety: 1.3,
    arthritis: 1.4, // Joint pain often requires higher doses
    behavioral: 1.2,
    seizures: 1.8, // Often requires higher doses, but needs vet supervision
    inflammation: 1.3
  };

  // Product bioavailability factors for animals
  const animalProductFactors = {
    oil: 1.0, // Baseline
    treats: 1.3, // Lower absorption through digestive system
    capsules: 1.2, // Similar to treats but more controlled
    topical: 2.5 // Much higher doses needed for topical application
  };

  // Strength adjustments
  const strengthMultipliers = {
    mild: 0.8,
    moderate: 1.0,
    strong: 1.2 // More conservative than human calculator
  };

  // Calculate base dose range
  const speciesDosing = speciesBaseDosing[species];
  const doseRange = speciesDosing.max - speciesDosing.min;
  const baseDosePerKg = speciesDosing.min + (doseRange * experienceFactors[animalExperience]);

  // Calculate starting dose with all multipliers
  let startingDose = weightInKg * baseDosePerKg * ageMultipliers[age] *
                    animalConditionMultipliers[condition] * animalProductFactors[productType] *
                    strengthMultipliers[desiredStrength];

  // Round to appropriate increments for animals (more precise than humans)
  if (startingDose < 1) {
    startingDose = Math.round(startingDose * 10) / 10; // Round to 0.1mg increments
  } else if (startingDose < 5) {
    startingDose = Math.round(startingDose * 4) / 4; // Round to 0.25mg increments
  } else {
    startingDose = Math.round(startingDose * 2) / 2; // Round to 0.5mg increments
  }

  // Minimum starting doses by species
  const minimumDoses = {
    dog: 0.5,
    cat: 0.25,
    horse: 2.0,
    other: 0.25
  };

  startingDose = Math.max(startingDose, minimumDoses[species]);

  // Calculate maximum dose (more conservative than human calculator)
  let maxDose = startingDose * (animalExperience === 'never' ? 2.5 : animalExperience === 'some' ? 3 : 4);

  // Species-specific maximum dose caps for safety
  const maxDoseCaps = {
    dog: 50, // mg total daily
    cat: 20,
    horse: 200,
    other: 20
  };

  maxDose = Math.min(maxDose, maxDoseCaps[species]);

  // Special handling for seizures
  if (condition === 'seizures') {
    maxDose = Math.min(maxDose, species === 'dog' ? 30 : species === 'cat' ? 15 : maxDose);
  }

  // Generate frequency recommendations
  const frequency = productType === 'topical' ? '2-3 times daily to affected area' :
                   condition === 'behavioral' ? 'Once daily, 30-60 minutes before triggering events' :
                   condition === 'arthritis' ? '2 times daily with meals' :
                   species === 'horse' ? 'Once daily with feed' :
                   '1-2 times daily with food';

  // Generate titration schedule
  const titrationSchedule = [
    `Week 1: Start with ${startingDose}mg ${frequency.toLowerCase()}`,
    `Week 2: If well tolerated and needed, increase to ${Math.round((startingDose * 1.3) * 10) / 10}mg`,
    `Week 3: If needed, increase to ${Math.round((startingDose * 1.6) * 10) / 10}mg`,
    `Continue increasing gradually every 3-4 days until desired effects achieved`
  ];

  // Generate warnings
  const warnings = [
    'CRITICAL: Always consult with a veterinarian before giving CBD to your pet',
    'Never use human CBD products for animals - they may contain harmful ingredients',
    'Start with the lowest dose and increase very gradually',
    'Monitor your pet closely for any changes in behavior, appetite, or energy',
    'Animals cannot report side effects - observe carefully for signs of discomfort'
  ];

  if (inputs.currentMedications) {
    warnings.push('CBD can interact with veterinary medications - inform your vet of all supplements');
  }

  if (condition === 'seizures') {
    warnings.push('Seizure treatment requires immediate veterinary supervision and should not replace prescribed medications');
  }

  if (species === 'cat') {
    warnings.push('Cats metabolize CBD differently than dogs - use cat-specific products when possible');
  }

  if (productType === 'treats') {
    warnings.push('Ensure treats do not contain xylitol, chocolate, or other ingredients toxic to pets');
  }

  // Generate notes
  const notes = [
    'These calculations are for educational purposes only and are not veterinary advice',
    'Keep a dosing journal to track your pet\'s response and share with your vet',
    'Only use CBD products specifically formulated for animals',
    'Store CBD products safely away from pets to prevent accidental overdose',
    'Results may take several days to weeks to become apparent'
  ];

  // Species-specific information
  const speciesSpecificInfo = getSpeciesSpecificInfo(species, age, weightInKg);

  return {
    startingDose,
    maxDose,
    frequency,
    method: getAnimalMethodInstructions(productType, species),
    titrationSchedule,
    warnings,
    notes,
    speciesSpecificInfo
  };
};

const getAnimalMethodInstructions = (productType: string, species: string): string => {
  switch (productType) {
    case 'oil':
      return species === 'cat' ? 'Mix with wet food or apply to paw pad to be licked off. Cats often reject direct dosing.' :
             'Administer directly into mouth using syringe or mix with food. Most effective when absorbed in mouth.';
    case 'treats':
      return 'Give as a treat with positive reinforcement. Ensure treats are appropriate size for your pet and do not exceed daily calorie needs.';
    case 'capsules':
      return 'Give with food or hide in treat. For cats, may need to crush and mix with wet food (check with vet first).';
    case 'topical':
      return 'Apply to clean skin with minimal fur. Prevent licking for 10-15 minutes if possible. Massage gently until absorbed.';
    default:
      return 'Follow product-specific instructions and consult your veterinarian for administration guidance.';
  }
};

const getSpeciesSpecificInfo = (species: string, age: string, weightKg: number): string[] => {
  const info = [];

  switch (species) {
    case 'dog':
      info.push('Dogs typically show effects within 30-90 minutes of administration');
      info.push('Watch for signs of sedation, changes in coordination, or loss of appetite');
      if (weightKg < 10) {
        info.push('Small dogs are often more sensitive to CBD - start with minimal doses');
      }
      if (age === 'senior') {
        info.push('Senior dogs may have reduced liver function - lower doses often needed');
      }
      break;

    case 'cat':
      info.push('Cats have unique liver metabolism - they process CBD differently than dogs');
      info.push('Look for changes in hiding behavior, appetite, or litter box habits');
      info.push('Cats often prefer CBD mixed with wet food rather than direct administration');
      break;

    case 'horse':
      info.push('Horses may take 2-4 hours to show effects due to their digestive system');
      info.push('Monitor for changes in behavior, appetite, and movement');
      info.push('Consult with an equine veterinarian familiar with CBD use in horses');
      break;

    case 'other':
      info.push('Small animals (rabbits, guinea pigs) are typically very sensitive to CBD');
      info.push('Exotic animals require species-specific veterinary guidance');
      info.push('Start with the absolute minimum dose and increase very slowly');
      break;
  }

  return info;
};

export default function AnimalDosageCalculator() {
  const [inputs, setInputs] = useState<AnimalCalculatorInputs>({
    species: 'dog',
    bodyWeight: 10,
    weightUnit: 'kg',
    age: 'adult',
    condition: 'general',
    productType: 'oil',
    desiredStrength: 'mild',
    animalExperience: 'never',
    currentMedications: false,
    vetConsulted: false
  });

  const [recommendation, setRecommendation] = useState<AnimalDosageRecommendation | null>(null);

  const handleCalculate = () => {
    const result = calculateAnimalDosage(inputs);
    setRecommendation(result);
  };

  const handleInputChange = (field: keyof AnimalCalculatorInputs, value: any) => {
    setInputs(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <span className="text-4xl">🐾</span>
                Animal CBD Dosage Calculator
              </h1>
              <p className="text-gray-600 mt-2">Veterinary-guided CBD dosing recommendations for dogs, cats, horses, and other animals</p>
            </div>
            <Link
              href="/tools"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Tools
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Calculator Form */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Enter Your Pet's Information</h2>

            {/* Animal Species */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Animal Species *
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'dog', label: '🐕 Dog', desc: 'Most common pet' },
                  { value: 'cat', label: '🐱 Cat', desc: 'Unique metabolism' },
                  { value: 'horse', label: '🐎 Horse', desc: 'Large animal dosing' },
                  { value: 'other', label: '🐰 Other', desc: 'Rabbits, birds, etc.' }
                ].map(option => (
                  <label key={option.value} className="cursor-pointer">
                    <input
                      type="radio"
                      name="species"
                      value={option.value}
                      checked={inputs.species === option.value}
                      onChange={(e) => handleInputChange('species', e.target.value)}
                      className="sr-only"
                    />
                    <div className={`p-3 border rounded-lg text-center transition-colors ${
                      inputs.species === option.value
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
                  max="3000"
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

            {/* Age Category */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Age Category *
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'puppy_kitten', label: 'Young' },
                  { value: 'adult', label: 'Adult' },
                  { value: 'senior', label: 'Senior' }
                ].map(option => (
                  <label key={option.value} className="cursor-pointer">
                    <input
                      type="radio"
                      name="age"
                      value={option.value}
                      checked={inputs.age === option.value}
                      onChange={(e) => handleInputChange('age', e.target.value)}
                      className="sr-only"
                    />
                    <div className={`p-4 border rounded-lg text-center transition-colors min-h-[50px] flex items-center justify-center ${
                      inputs.age === option.value
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}>
                      <div className="font-medium text-sm">{option.label}</div>
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
                <option value="arthritis">Arthritis & joint pain</option>
                <option value="anxiety">Anxiety & stress</option>
                <option value="behavioral">Behavioral issues</option>
                <option value="inflammation">Inflammation</option>
                <option value="seizures">Seizures (requires vet supervision)</option>
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
                <option value="oil">Pet CBD Oil/Tincture</option>
                <option value="treats">CBD Treats/Edibles</option>
                <option value="capsules">CBD Capsules</option>
                <option value="topical">Topical CBD (creams, balms)</option>
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

            {/* Animal Experience */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pet's CBD Experience Level *
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'never', label: 'Never Used', desc: 'First time with CBD' },
                  { value: 'some', label: 'Some Experience', desc: 'Tried CBD before' },
                  { value: 'experienced', label: 'Experienced', desc: 'Regular CBD user' }
                ].map(option => (
                  <label key={option.value} className="cursor-pointer">
                    <input
                      type="radio"
                      name="experience"
                      value={option.value}
                      checked={inputs.animalExperience === option.value}
                      onChange={(e) => handleInputChange('animalExperience', e.target.value)}
                      className="sr-only"
                    />
                    <div className={`p-3 border rounded-lg text-center transition-colors ${
                      inputs.animalExperience === option.value
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
            <div className="mb-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={inputs.currentMedications}
                  onChange={(e) => handleInputChange('currentMedications', e.target.checked)}
                  className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm font-medium text-gray-700">
                  My pet currently takes prescription medications
                </span>
              </label>
            </div>

            {/* Vet Consultation */}
            <div className="mb-6">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={inputs.vetConsulted}
                  onChange={(e) => handleInputChange('vetConsulted', e.target.checked)}
                  className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm font-medium text-gray-700">
                  I have discussed CBD use with my veterinarian
                </span>
              </label>
            </div>

            {/* Calculate Button */}
            <button
              onClick={handleCalculate}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Calculate Animal CBD Dosage
            </button>
          </div>

          {/* Results */}
          {recommendation && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Dosage Recommendation for Your {inputs.species === 'other' ? 'Pet' : inputs.species.charAt(0).toUpperCase() + inputs.species.slice(1)}</h2>

              {/* Starting Dose */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-semibold text-green-900 mb-2">Recommended Starting Dose</h3>
                <div className="text-3xl font-bold text-green-700 mb-2">
                  {recommendation.startingDose}mg
                </div>
                <p className="text-green-800 text-sm">
                  {recommendation.frequency}
                </p>
                <p className="text-green-700 text-sm mt-2 font-medium">
                  Maximum daily dose: {recommendation.maxDose}mg
                </p>
              </div>

              {/* Administration Method */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-2">How to Give to Your Pet</h4>
                <p className="text-gray-700 text-sm">{recommendation.method}</p>
              </div>

              {/* Species-Specific Information */}
              {recommendation.speciesSpecificInfo.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-2">Species-Specific Information</h4>
                  <ul className="space-y-1">
                    {recommendation.speciesSpecificInfo.map((info, index) => (
                      <li key={index} className="text-blue-700 text-sm flex items-start">
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2 mt-2"></span>
                        {info}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

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

              {/* Critical Warnings */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-red-900 mb-2 flex items-center">
                  <span className="mr-2">⚠️</span>
                  Critical Safety Information
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
                <h4 className="font-semibold text-gray-900 mb-2">Important Notes</h4>
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
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Understanding Animal CBD Dosing</h2>

              <div className="space-y-4 text-sm text-gray-700">
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Why Animals Need Different Dosing</h4>
                  <p>Animals metabolize CBD very differently than humans. Dogs, cats, horses, and other species have unique liver enzymes, body compositions, and sensitivities that require species-specific dosing protocols.</p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Start Very Low, Go Very Slow</h4>
                  <p>Unlike humans who can report side effects, animals cannot communicate discomfort. Always start with the minimum effective dose and increase gradually while monitoring closely.</p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Never Use Human CBD Products</h4>
                  <p>Human CBD products often contain xylitol, chocolate, or other ingredients that are toxic to animals. Always use products specifically formulated for pets.</p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Veterinary Supervision is Essential</h4>
                  <p>CBD can interact with medications and may not be appropriate for animals with certain health conditions. Your veterinarian can provide guidance specific to your pet's needs.</p>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-800 text-sm">
                  <strong>Evidence-Based:</strong> Our animal dosing recommendations are based on veterinary research and clinical experience with CBD use in animals, adjusted for safety and efficacy.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}