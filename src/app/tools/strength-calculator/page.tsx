'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';

type Tab = 'converter' | 'drops' | 'compare' | 'switch';

interface StrengthValues {
  percentage: number;
  mgPerMl: number;
  totalMg: number;
  bottleSize: number;
  mgPerDrop: number;
}

interface CompareProduct {
  id: number;
  name: string;
  inputType: 'percentage' | 'mgPerMl' | 'totalMg';
  value: number;
  bottleSize: number;
  price: string;
}

// Constants
const DROPS_PER_ML = 20; // Standard dropper: ~0.05ml per drop
const DROP_SIZE_ML = 0.05;

// Strength level definitions
const getStrengthLevel = (percentage: number): { level: string; color: string; bgColor: string; description: string } => {
  if (percentage <= 3) return { level: 'Low', color: 'text-green-700', bgColor: 'bg-green-500', description: 'Ideal for beginners or micro-dosing' };
  if (percentage <= 10) return { level: 'Medium', color: 'text-blue-700', bgColor: 'bg-blue-500', description: 'Most common strength for daily use' };
  if (percentage <= 20) return { level: 'High', color: 'text-orange-700', bgColor: 'bg-orange-500', description: 'For experienced users or specific needs' };
  return { level: 'Very High', color: 'text-red-700', bgColor: 'bg-red-500', description: 'Concentrated formula, use with caution' };
};

// Calculation functions
const calculateFromPercentage = (percentage: number, bottleSize: number): StrengthValues => {
  const mgPerMl = (percentage / 100) * 1000;
  const totalMg = mgPerMl * bottleSize;
  const mgPerDrop = mgPerMl * DROP_SIZE_ML;
  return { percentage, mgPerMl, totalMg, bottleSize, mgPerDrop };
};

const calculateFromMgPerMl = (mgPerMl: number, bottleSize: number): StrengthValues => {
  const percentage = (mgPerMl / 1000) * 100;
  const totalMg = mgPerMl * bottleSize;
  const mgPerDrop = mgPerMl * DROP_SIZE_ML;
  return { percentage, mgPerMl, totalMg, bottleSize, mgPerDrop };
};

const calculateFromTotalMg = (totalMg: number, bottleSize: number): StrengthValues => {
  const mgPerMl = totalMg / bottleSize;
  const percentage = (mgPerMl / 1000) * 100;
  const mgPerDrop = mgPerMl * DROP_SIZE_ML;
  return { percentage, mgPerMl, totalMg, bottleSize, mgPerDrop };
};

// Strength Gauge Component
const StrengthGauge = ({ percentage }: { percentage: number }) => {
  const strengthInfo = getStrengthLevel(percentage);
  const gaugeWidth = Math.min((percentage / 30) * 100, 100);

  return (
    <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-gray-600">Strength Level</span>
        <span className={`text-sm font-bold ${strengthInfo.color}`}>{strengthInfo.level}</span>
      </div>

      {/* Gauge bar */}
      <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden mb-3">
        <div
          className={`absolute left-0 top-0 h-full ${strengthInfo.bgColor} transition-all duration-500 ease-out rounded-full`}
          style={{ width: `${gaugeWidth}%` }}
        />
        {/* Markers */}
        <div className="absolute top-0 left-[10%] w-px h-full bg-gray-400 opacity-50" />
        <div className="absolute top-0 left-[33%] w-px h-full bg-gray-400 opacity-50" />
        <div className="absolute top-0 left-[66%] w-px h-full bg-gray-400 opacity-50" />
      </div>

      {/* Labels */}
      <div className="flex justify-between text-xs text-gray-500">
        <span>0%</span>
        <span>3%</span>
        <span>10%</span>
        <span>20%</span>
        <span>30%+</span>
      </div>

      <p className="mt-3 text-sm text-gray-600">{strengthInfo.description}</p>
    </div>
  );
};

// Results Card Component
const ResultsCard = ({ values, showDrops = true }: { values: StrengthValues; showDrops?: boolean }) => {
  const strengthInfo = getStrengthLevel(values.percentage);

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
        <div className="text-sm text-blue-600 font-medium mb-1">Percentage</div>
        <div className="text-2xl font-bold text-blue-900">{values.percentage.toFixed(2)}%</div>
      </div>

      <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
        <div className="text-sm text-green-600 font-medium mb-1">mg per ml</div>
        <div className="text-2xl font-bold text-green-900">{values.mgPerMl.toFixed(1)}</div>
      </div>

      <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
        <div className="text-sm text-purple-600 font-medium mb-1">Total CBD</div>
        <div className="text-2xl font-bold text-purple-900">{values.totalMg.toFixed(0)}mg</div>
        <div className="text-xs text-purple-600">in {values.bottleSize}ml bottle</div>
      </div>

      {showDrops && (
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
          <div className="text-sm text-orange-600 font-medium mb-1">mg per Drop</div>
          <div className="text-2xl font-bold text-orange-900">{values.mgPerDrop.toFixed(2)}</div>
          <div className="text-xs text-orange-600">~{DROPS_PER_ML} drops/ml</div>
        </div>
      )}
    </div>
  );
};

export default function StrengthCalculatorPage() {
  const [activeTab, setActiveTab] = useState<Tab>('converter');

  // Converter state
  const [converterInput, setConverterInput] = useState({
    type: 'percentage' as 'percentage' | 'mgPerMl' | 'totalMg',
    value: 5,
    bottleSize: 10
  });

  // Drops calculator state
  const [dropsInput, setDropsInput] = useState({
    targetDose: 25,
    oilStrength: 5,
    strengthType: 'percentage' as 'percentage' | 'mgPerMl',
    customDropSize: DROP_SIZE_ML
  });

  // Compare state
  const [compareProducts, setCompareProducts] = useState<CompareProduct[]>([
    { id: 1, name: 'Product A', inputType: 'percentage', value: 5, bottleSize: 10, price: '' },
    { id: 2, name: 'Product B', inputType: 'totalMg', value: 1000, bottleSize: 30, price: '' }
  ]);

  // Switch products state
  const [switchInput, setSwitchInput] = useState({
    currentDrops: 4,
    currentStrength: 5,
    currentType: 'percentage' as 'percentage' | 'mgPerMl',
    newStrength: 10,
    newType: 'percentage' as 'percentage' | 'mgPerMl'
  });

  // Calculate converter values
  const converterValues = useMemo((): StrengthValues => {
    const { type, value, bottleSize } = converterInput;
    if (value <= 0 || bottleSize <= 0) {
      return { percentage: 0, mgPerMl: 0, totalMg: 0, bottleSize: bottleSize || 10, mgPerDrop: 0 };
    }

    switch (type) {
      case 'percentage':
        return calculateFromPercentage(value, bottleSize);
      case 'mgPerMl':
        return calculateFromMgPerMl(value, bottleSize);
      case 'totalMg':
        return calculateFromTotalMg(value, bottleSize);
      default:
        return calculateFromPercentage(value, bottleSize);
    }
  }, [converterInput]);

  // Calculate drops needed
  const dropsResult = useMemo(() => {
    const { targetDose, oilStrength, strengthType, customDropSize } = dropsInput;

    if (targetDose <= 0 || oilStrength <= 0) {
      return { drops: 0, mgPerDrop: 0, totalMl: 0 };
    }

    const mgPerMl = strengthType === 'percentage'
      ? (oilStrength / 100) * 1000
      : oilStrength;

    const mgPerDrop = mgPerMl * customDropSize;
    const dropsNeeded = targetDose / mgPerDrop;
    const totalMl = dropsNeeded * customDropSize;

    return { drops: dropsNeeded, mgPerDrop, totalMl };
  }, [dropsInput]);

  // Calculate compare values
  const compareValues = useMemo(() => {
    return compareProducts.map(product => {
      let values: StrengthValues;
      switch (product.inputType) {
        case 'percentage':
          values = calculateFromPercentage(product.value, product.bottleSize);
          break;
        case 'mgPerMl':
          values = calculateFromMgPerMl(product.value, product.bottleSize);
          break;
        case 'totalMg':
          values = calculateFromTotalMg(product.value, product.bottleSize);
          break;
        default:
          values = calculateFromPercentage(product.value, product.bottleSize);
      }

      const priceNum = parseFloat(product.price);
      const costPerMg = priceNum > 0 ? priceNum / values.totalMg : null;

      return { ...values, costPerMg, name: product.name };
    });
  }, [compareProducts]);

  // Calculate switch values
  const switchResult = useMemo(() => {
    const { currentDrops, currentStrength, currentType, newStrength, newType } = switchInput;

    const currentMgPerMl = currentType === 'percentage'
      ? (currentStrength / 100) * 1000
      : currentStrength;

    const newMgPerMl = newType === 'percentage'
      ? (newStrength / 100) * 1000
      : newStrength;

    const currentMgPerDrop = currentMgPerMl * DROP_SIZE_ML;
    const newMgPerDrop = newMgPerMl * DROP_SIZE_ML;

    const currentTotalMg = currentDrops * currentMgPerDrop;
    const newDrops = currentTotalMg / newMgPerDrop;

    return {
      currentMgPerDrop,
      newMgPerDrop,
      currentTotalMg,
      newDrops
    };
  }, [switchInput]);

  const updateCompareProduct = (id: number, field: keyof CompareProduct, value: any) => {
    setCompareProducts(prev =>
      prev.map(p => p.id === id ? { ...p, [field]: value } : p)
    );
  };

  const addCompareProduct = () => {
    if (compareProducts.length < 4) {
      const newId = Math.max(...compareProducts.map(p => p.id)) + 1;
      setCompareProducts(prev => [...prev, {
        id: newId,
        name: `Product ${String.fromCharCode(64 + newId)}`,
        inputType: 'percentage',
        value: 5,
        bottleSize: 10,
        price: ''
      }]);
    }
  };

  const removeCompareProduct = (id: number) => {
    if (compareProducts.length > 2) {
      setCompareProducts(prev => prev.filter(p => p.id !== id));
    }
  };

  const tabs = [
    { id: 'converter' as Tab, label: 'Strength Converter', icon: '🔄' },
    { id: 'drops' as Tab, label: 'Drops Calculator', icon: '💧' },
    { id: 'compare' as Tab, label: 'Compare Products', icon: '⚖️' },
    { id: 'switch' as Tab, label: 'Switch Helper', icon: '🔀' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                CBD Strength Calculator
              </h1>
              <p className="text-gray-600 mt-1">
                Convert, calculate, and compare CBD product strengths
              </p>
            </div>
            <Link
              href="/tools"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Tools
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-sm p-2 mb-8">
          <div className="flex flex-wrap gap-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 min-w-[140px] px-4 py-3 rounded-lg font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* CONVERTER TAB */}
          {activeTab === 'converter' && (
            <>
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Enter CBD Strength</h2>

                {/* Input Type Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    I know the...
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: 'percentage', label: 'Percentage', example: 'e.g., 5%' },
                      { value: 'mgPerMl', label: 'mg/ml', example: 'e.g., 50mg/ml' },
                      { value: 'totalMg', label: 'Total mg', example: 'e.g., 500mg' }
                    ].map(option => (
                      <label key={option.value} className="cursor-pointer">
                        <input
                          type="radio"
                          name="inputType"
                          value={option.value}
                          checked={converterInput.type === option.value}
                          onChange={(e) => setConverterInput(prev => ({ ...prev, type: e.target.value as any }))}
                          className="sr-only"
                        />
                        <div className={`p-3 border rounded-lg text-center transition-all ${
                          converterInput.type === option.value
                            ? 'border-blue-500 bg-blue-50 text-blue-700 ring-2 ring-blue-500'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}>
                          <div className="font-medium text-sm">{option.label}</div>
                          <div className="text-xs text-gray-500 mt-1">{option.example}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Value Input */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {converterInput.type === 'percentage' ? 'CBD Percentage' :
                     converterInput.type === 'mgPerMl' ? 'mg per ml' : 'Total mg in bottle'}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={converterInput.value}
                      onChange={(e) => setConverterInput(prev => ({ ...prev, value: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                      placeholder="Enter value"
                      min="0"
                      step={converterInput.type === 'percentage' ? '0.1' : '1'}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                      {converterInput.type === 'percentage' ? '%' : 'mg'}
                    </span>
                  </div>
                </div>

                {/* Bottle Size */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bottle Size
                  </label>
                  <div className="flex gap-2">
                    {[10, 15, 30, 50, 100].map(size => (
                      <button
                        key={size}
                        onClick={() => setConverterInput(prev => ({ ...prev, bottleSize: size }))}
                        className={`flex-1 py-2 px-3 rounded-lg border transition-all ${
                          converterInput.bottleSize === size
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        {size}ml
                      </button>
                    ))}
                  </div>
                  <div className="mt-2">
                    <input
                      type="number"
                      value={converterInput.bottleSize}
                      onChange={(e) => setConverterInput(prev => ({ ...prev, bottleSize: parseFloat(e.target.value) || 10 }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="Custom size (ml)"
                      min="1"
                    />
                  </div>
                </div>

                {/* Common Products Reference */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Common Product Strengths</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex justify-between"><span>Low strength:</span><span className="font-medium">2-5%</span></div>
                    <div className="flex justify-between"><span>Medium:</span><span className="font-medium">5-10%</span></div>
                    <div className="flex justify-between"><span>High:</span><span className="font-medium">10-20%</span></div>
                    <div className="flex justify-between"><span>Very high:</span><span className="font-medium">20-30%+</span></div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Converted Values</h2>
                  <ResultsCard values={converterValues} />
                </div>

                <StrengthGauge percentage={converterValues.percentage} />
              </div>
            </>
          )}

          {/* DROPS TAB */}
          {activeTab === 'drops' && (
            <>
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Calculate Drops Needed</h2>

                {/* Target Dose */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Dose (mg)
                  </label>
                  <input
                    type="number"
                    value={dropsInput.targetDose}
                    onChange={(e) => setDropsInput(prev => ({ ...prev, targetDose: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                    placeholder="e.g., 25"
                    min="0"
                  />
                  <div className="flex gap-2 mt-2">
                    {[10, 15, 25, 50, 100].map(dose => (
                      <button
                        key={dose}
                        onClick={() => setDropsInput(prev => ({ ...prev, targetDose: dose }))}
                        className={`flex-1 py-1.5 px-2 rounded border text-sm ${
                          dropsInput.targetDose === dose
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        {dose}mg
                      </button>
                    ))}
                  </div>
                </div>

                {/* Oil Strength */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Oil Strength
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="number"
                      value={dropsInput.oilStrength}
                      onChange={(e) => setDropsInput(prev => ({ ...prev, oilStrength: parseFloat(e.target.value) || 0 }))}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                      placeholder="e.g., 5"
                      min="0"
                      step="0.1"
                    />
                    <select
                      value={dropsInput.strengthType}
                      onChange={(e) => setDropsInput(prev => ({ ...prev, strengthType: e.target.value as any }))}
                      className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="percentage">%</option>
                      <option value="mgPerMl">mg/ml</option>
                    </select>
                  </div>
                </div>

                {/* Drop Size */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Drop Size (ml)
                  </label>
                  <div className="flex gap-2">
                    {[0.03, 0.04, 0.05, 0.06].map(size => (
                      <button
                        key={size}
                        onClick={() => setDropsInput(prev => ({ ...prev, customDropSize: size }))}
                        className={`flex-1 py-2 px-3 rounded-lg border transition-all text-sm ${
                          dropsInput.customDropSize === size
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        {size}ml
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Standard dropper: ~0.05ml per drop. Thicker oils may have larger drops.
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Drops Needed</h2>

                  {/* Big Result */}
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white text-center mb-6">
                    <div className="text-5xl font-bold mb-2">
                      {dropsResult.drops === Infinity || isNaN(dropsResult.drops) ? '—' : dropsResult.drops.toFixed(1)}
                    </div>
                    <div className="text-blue-100 text-lg">drops</div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="text-sm text-gray-600 mb-1">mg per drop</div>
                      <div className="text-xl font-bold text-gray-900">{dropsResult.mgPerDrop.toFixed(2)}</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="text-sm text-gray-600 mb-1">Total volume</div>
                      <div className="text-xl font-bold text-gray-900">{dropsResult.totalMl.toFixed(2)}ml</div>
                    </div>
                  </div>
                </div>

                {/* Visual Drops */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-4">Visual Guide</h3>
                  <div className="flex flex-wrap gap-1">
                    {Array.from({ length: Math.min(Math.ceil(dropsResult.drops), 20) }).map((_, i) => (
                      <div
                        key={i}
                        className="w-6 h-6 bg-blue-500 rounded-full opacity-80"
                        title={`Drop ${i + 1}`}
                      />
                    ))}
                    {dropsResult.drops > 20 && (
                      <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-xs text-gray-600">
                        +{Math.ceil(dropsResult.drops) - 20}
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-3">
                    Each circle represents one drop
                  </p>
                </div>
              </div>
            </>
          )}

          {/* COMPARE TAB */}
          {activeTab === 'compare' && (
            <>
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Compare Products</h2>
                  {compareProducts.length < 4 && (
                    <button
                      onClick={addCompareProduct}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      + Add Product
                    </button>
                  )}
                </div>

                <div className="space-y-6">
                  {compareProducts.map((product, index) => (
                    <div key={product.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <input
                          type="text"
                          value={product.name}
                          onChange={(e) => updateCompareProduct(product.id, 'name', e.target.value)}
                          className="font-medium text-gray-900 bg-transparent border-none focus:outline-none focus:ring-0 p-0"
                        />
                        {compareProducts.length > 2 && (
                          <button
                            onClick={() => removeCompareProduct(product.id)}
                            className="text-red-500 hover:text-red-700 text-sm"
                          >
                            Remove
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-gray-500 mb-1 block">Strength Type</label>
                          <select
                            value={product.inputType}
                            onChange={(e) => updateCompareProduct(product.id, 'inputType', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          >
                            <option value="percentage">Percentage (%)</option>
                            <option value="mgPerMl">mg/ml</option>
                            <option value="totalMg">Total mg</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-xs text-gray-500 mb-1 block">Value</label>
                          <input
                            type="number"
                            value={product.value}
                            onChange={(e) => updateCompareProduct(product.id, 'value', parseFloat(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            min="0"
                          />
                        </div>

                        <div>
                          <label className="text-xs text-gray-500 mb-1 block">Bottle Size (ml)</label>
                          <input
                            type="number"
                            value={product.bottleSize}
                            onChange={(e) => updateCompareProduct(product.id, 'bottleSize', parseFloat(e.target.value) || 10)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            min="1"
                          />
                        </div>

                        <div>
                          <label className="text-xs text-gray-500 mb-1 block">Price (optional)</label>
                          <input
                            type="text"
                            value={product.price}
                            onChange={(e) => updateCompareProduct(product.id, 'price', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            placeholder="e.g., 49.99"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Comparison Results</h2>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">Metric</th>
                        {compareValues.map((v, i) => (
                          <th key={i} className="text-right py-3 px-2 text-sm font-medium text-gray-900">
                            {v.name}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      <tr>
                        <td className="py-3 px-2 text-sm text-gray-600">Percentage</td>
                        {compareValues.map((v, i) => (
                          <td key={i} className="py-3 px-2 text-sm text-right font-medium">{v.percentage.toFixed(2)}%</td>
                        ))}
                      </tr>
                      <tr>
                        <td className="py-3 px-2 text-sm text-gray-600">mg/ml</td>
                        {compareValues.map((v, i) => (
                          <td key={i} className="py-3 px-2 text-sm text-right font-medium">{v.mgPerMl.toFixed(1)}</td>
                        ))}
                      </tr>
                      <tr>
                        <td className="py-3 px-2 text-sm text-gray-600">Total CBD</td>
                        {compareValues.map((v, i) => (
                          <td key={i} className="py-3 px-2 text-sm text-right font-medium">{v.totalMg.toFixed(0)}mg</td>
                        ))}
                      </tr>
                      <tr>
                        <td className="py-3 px-2 text-sm text-gray-600">mg/drop</td>
                        {compareValues.map((v, i) => (
                          <td key={i} className="py-3 px-2 text-sm text-right font-medium">{v.mgPerDrop.toFixed(2)}</td>
                        ))}
                      </tr>
                      <tr>
                        <td className="py-3 px-2 text-sm text-gray-600">Strength Level</td>
                        {compareValues.map((v, i) => {
                          const level = getStrengthLevel(v.percentage);
                          return (
                            <td key={i} className={`py-3 px-2 text-sm text-right font-medium ${level.color}`}>
                              {level.level}
                            </td>
                          );
                        })}
                      </tr>
                      {compareValues.some(v => v.costPerMg !== null) && (
                        <tr className="bg-green-50">
                          <td className="py-3 px-2 text-sm text-green-700 font-medium">Cost per mg</td>
                          {compareValues.map((v, i) => {
                            const isBest = v.costPerMg !== null &&
                              v.costPerMg === Math.min(...compareValues.filter(x => x.costPerMg !== null).map(x => x.costPerMg!));
                            return (
                              <td key={i} className={`py-3 px-2 text-sm text-right font-medium ${isBest ? 'text-green-700' : 'text-gray-600'}`}>
                                {v.costPerMg !== null ? `€${v.costPerMg.toFixed(3)}` : '—'}
                                {isBest && v.costPerMg !== null && <span className="ml-1">✓</span>}
                              </td>
                            );
                          })}
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* SWITCH TAB */}
          {activeTab === 'switch' && (
            <>
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Switching Products?</h2>
                <p className="text-gray-600 text-sm mb-6">
                  Calculate equivalent drops when changing to a different strength oil.
                </p>

                {/* Current Product */}
                <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h3 className="font-medium text-blue-900 mb-3">Current Product</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-blue-700 mb-1 block">Drops you take</label>
                      <input
                        type="number"
                        value={switchInput.currentDrops}
                        onChange={(e) => setSwitchInput(prev => ({ ...prev, currentDrops: parseFloat(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 border border-blue-300 rounded-lg"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-blue-700 mb-1 block">Strength</label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={switchInput.currentStrength}
                          onChange={(e) => setSwitchInput(prev => ({ ...prev, currentStrength: parseFloat(e.target.value) || 0 }))}
                          className="flex-1 px-3 py-2 border border-blue-300 rounded-lg"
                          min="0"
                          step="0.1"
                        />
                        <select
                          value={switchInput.currentType}
                          onChange={(e) => setSwitchInput(prev => ({ ...prev, currentType: e.target.value as any }))}
                          className="px-2 py-2 border border-blue-300 rounded-lg text-sm"
                        >
                          <option value="percentage">%</option>
                          <option value="mgPerMl">mg/ml</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* New Product */}
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <h3 className="font-medium text-green-900 mb-3">New Product</h3>
                  <div>
                    <label className="text-xs text-green-700 mb-1 block">Strength</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={switchInput.newStrength}
                        onChange={(e) => setSwitchInput(prev => ({ ...prev, newStrength: parseFloat(e.target.value) || 0 }))}
                        className="flex-1 px-3 py-2 border border-green-300 rounded-lg"
                        min="0"
                        step="0.1"
                      />
                      <select
                        value={switchInput.newType}
                        onChange={(e) => setSwitchInput(prev => ({ ...prev, newType: e.target.value as any }))}
                        className="px-2 py-2 border border-green-300 rounded-lg text-sm"
                      >
                        <option value="percentage">%</option>
                        <option value="mgPerMl">mg/ml</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Equivalent Dose</h2>

                  <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white text-center mb-6">
                    <div className="text-lg text-green-100 mb-1">Take</div>
                    <div className="text-5xl font-bold mb-1">
                      {switchResult.newDrops === Infinity || isNaN(switchResult.newDrops) ? '—' : switchResult.newDrops.toFixed(1)}
                    </div>
                    <div className="text-green-100 text-lg">drops of new oil</div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600">Your current dose</span>
                      <span className="font-medium">{switchResult.currentTotalMg.toFixed(1)}mg CBD</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600">Current oil: mg/drop</span>
                      <span className="font-medium">{switchResult.currentMgPerDrop.toFixed(2)}mg</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600">New oil: mg/drop</span>
                      <span className="font-medium">{switchResult.newMgPerDrop.toFixed(2)}mg</span>
                    </div>
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <div className="flex gap-3">
                    <span className="text-2xl">💡</span>
                    <div>
                      <h4 className="font-medium text-amber-900">Tip</h4>
                      <p className="text-sm text-amber-800 mt-1">
                        When switching to a stronger oil, you'll need fewer drops. Start with the calculated amount and adjust based on how you feel.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Educational Section */}
        <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Understanding CBD Strength</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Percentage vs mg/ml</h3>
              <p className="text-sm text-gray-600">
                A 5% CBD oil contains 50mg of CBD per ml. The formula: percentage × 10 = mg/ml.
                So 10% oil = 100mg/ml, and 3% oil = 30mg/ml.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Total mg in Bottle</h3>
              <p className="text-sm text-gray-600">
                Total mg depends on both strength AND bottle size. A 10ml bottle of 5% oil contains 500mg total,
                while a 30ml bottle of the same strength contains 1500mg.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Drops per ml</h3>
              <p className="text-sm text-gray-600">
                Standard droppers dispense about 20 drops per ml (0.05ml each). Thicker oils may have slightly
                larger drops. Our calculator uses this standard but allows adjustments.
              </p>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-6 bg-gray-100 rounded-xl p-4 border border-gray-200">
          <p className="text-sm text-gray-600">
            <strong>Disclaimer:</strong> This calculator provides general information for educational purposes.
            CBD dosing is highly individual. Always start with lower doses and consult a healthcare professional,
            especially if you take medications. See our{' '}
            <Link href="/tools/interactions" className="text-blue-600 hover:underline">
              Drug Interaction Checker
            </Link>{' '}
            for safety information.
          </p>
        </div>
      </div>
    </div>
  );
}
