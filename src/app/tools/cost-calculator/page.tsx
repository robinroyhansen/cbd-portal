'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Currency {
  code: string;
  symbol: string;
  name: string;
}

// Reordered with EUR first for international default
const currencies: Currency[] = [
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar' },
  { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar' },
  { code: 'SEK', symbol: 'kr', name: 'Swedish Krona' },
  { code: 'KRW', symbol: '₩', name: 'South Korean Won' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
  { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone' },
  { code: 'MXN', symbol: '$', name: 'Mexican Peso' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'RUB', symbol: '₽', name: 'Russian Ruble' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
  { code: 'DKK', symbol: 'kr', name: 'Danish Krone' },
];

interface Product {
  id: string;
  name: string;
  price: number;
  cbdAmount: number;
  cbdUnit: 'mg' | 'g';
  volume: number;
  volumeUnit: 'ml' | 'count';
  costPerMg: number;
  costPerServing: number;
}

interface CalculatorInputs {
  productName: string;
  price: number;
  cbdAmount: number;
  cbdUnit: 'mg' | 'g';
  volume: number;
  volumeUnit: 'ml' | 'count';
}

const defaultInputs: CalculatorInputs = {
  productName: '',
  price: 0,
  cbdAmount: 0,
  cbdUnit: 'mg',
  volume: 30,
  volumeUnit: 'ml',
};

const calculateCostPerMg = (price: number, cbdAmount: number, cbdUnit: 'mg' | 'g'): number => {
  const totalCbdMg = cbdUnit === 'g' ? cbdAmount * 1000 : cbdAmount;
  if (totalCbdMg === 0) return 0;
  return price / totalCbdMg;
};

const calculateCostPerServing = (price: number, volume: number): number => {
  if (volume === 0) return 0;
  return price / volume;
};

const formatCurrency = (value: number, currency: Currency, forceDecimals?: number): string => {
  if (forceDecimals !== undefined) {
    return `${currency.symbol}${value.toFixed(forceDecimals)}`;
  }
  if (value < 0.01) {
    return `${currency.symbol}${value.toFixed(4)}`;
  }
  if (value < 1) {
    return `${currency.symbol}${value.toFixed(3)}`;
  }
  return `${currency.symbol}${value.toFixed(2)}`;
};

// Detect currency from browser locale
const detectCurrencyFromLocale = (): Currency => {
  if (typeof window === 'undefined') return currencies[0]; // EUR for SSR

  const locale = navigator.language || 'en-GB';
  const region = locale.split('-')[1]?.toUpperCase();

  const regionToCurrency: Record<string, string> = {
    'US': 'USD',
    'GB': 'GBP',
    'UK': 'GBP',
    'DE': 'EUR',
    'FR': 'EUR',
    'IT': 'EUR',
    'ES': 'EUR',
    'NL': 'EUR',
    'AT': 'EUR',
    'BE': 'EUR',
    'IE': 'EUR',
    'PT': 'EUR',
    'CH': 'CHF',
    'CA': 'CAD',
    'AU': 'AUD',
    'NZ': 'NZD',
    'JP': 'JPY',
    'CN': 'CNY',
    'HK': 'HKD',
    'SG': 'SGD',
    'KR': 'KRW',
    'IN': 'INR',
    'BR': 'BRL',
    'MX': 'MXN',
    'ZA': 'ZAR',
    'SE': 'SEK',
    'NO': 'NOK',
    'DK': 'DKK',
  };

  const currencyCode = regionToCurrency[region] || 'EUR';
  return currencies.find(c => c.code === currencyCode) || currencies[0];
};

export default function CostCalculator() {
  const [inputs, setInputs] = useState<CalculatorInputs>(defaultInputs);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(currencies[0]);

  // Auto-detect currency on mount
  useEffect(() => {
    setSelectedCurrency(detectCurrencyFromLocale());
  }, []);

  const handleInputChange = (field: keyof CalculatorInputs, value: string | number) => {
    setInputs(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddProduct = () => {
    if (!inputs.productName.trim() || inputs.price <= 0 || inputs.cbdAmount <= 0) {
      return;
    }

    const costPerMg = calculateCostPerMg(inputs.price, inputs.cbdAmount, inputs.cbdUnit);
    const costPerServing = calculateCostPerServing(inputs.price, inputs.volume);

    const newProduct: Product = {
      id: Date.now().toString(),
      name: inputs.productName.trim(),
      price: inputs.price,
      cbdAmount: inputs.cbdAmount,
      cbdUnit: inputs.cbdUnit,
      volume: inputs.volume,
      volumeUnit: inputs.volumeUnit,
      costPerMg,
      costPerServing,
    };

    setProducts(prev => [...prev, newProduct]);
    setInputs(defaultInputs);
  };

  const handleRemoveProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const handleClearAll = () => {
    setProducts([]);
  };

  const sortedProducts = [...products].sort((a, b) => a.costPerMg - b.costPerMg);
  const bestValue = sortedProducts.length > 0 ? sortedProducts[0] : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">CBD Cost Calculator</h1>
              <p className="text-gray-600 mt-2">Compare CBD product costs per milligram to find the best value</p>
            </div>
            <Link
              href="/tools"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              All Tools
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Calculator Form */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Add Product to Compare</h2>

            {/* Currency Selector */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Currency
              </label>
              <select
                value={selectedCurrency.code}
                onChange={(e) => {
                  const currency = currencies.find(c => c.code === e.target.value);
                  if (currency) setSelectedCurrency(currency);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {currencies.map(currency => (
                  <option key={currency.code} value={currency.code}>
                    {currency.code} ({currency.symbol}) - {currency.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Product Name */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Name *
              </label>
              <input
                type="text"
                value={inputs.productName}
                onChange={(e) => handleInputChange('productName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Brand X CBD Oil 1000mg"
              />
            </div>

            {/* Product Price */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Price ({selectedCurrency.symbol}) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">{selectedCurrency.symbol}</span>
                <input
                  type="number"
                  value={inputs.price || ''}
                  onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                  className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            {/* CBD Amount */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total CBD Content *
              </label>
              <div className="flex gap-3">
                <input
                  type="number"
                  value={inputs.cbdAmount || ''}
                  onChange={(e) => handleInputChange('cbdAmount', parseFloat(e.target.value) || 0)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Amount"
                  min="0"
                  step="1"
                />
                <select
                  value={inputs.cbdUnit}
                  onChange={(e) => handleInputChange('cbdUnit', e.target.value as 'mg' | 'g')}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="mg">mg</option>
                  <option value="g">g</option>
                </select>
              </div>
              <p className="text-xs text-gray-500 mt-1">Total CBD in the entire product (not per serving)</p>
            </div>

            {/* Volume/Servings */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Size / Servings
              </label>
              <div className="flex gap-3">
                <input
                  type="number"
                  value={inputs.volume || ''}
                  onChange={(e) => handleInputChange('volume', parseFloat(e.target.value) || 0)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Amount"
                  min="0"
                  step="1"
                />
                <select
                  value={inputs.volumeUnit}
                  onChange={(e) => handleInputChange('volumeUnit', e.target.value as 'ml' | 'count')}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="ml">ml (oils)</option>
                  <option value="count">count (gummies/capsules)</option>
                </select>
              </div>
              <p className="text-xs text-gray-500 mt-1">For oils: bottle size in ml. For gummies/capsules: number of pieces</p>
            </div>

            {/* Add Product Button */}
            <button
              onClick={handleAddProduct}
              disabled={!inputs.productName.trim() || inputs.price <= 0 || inputs.cbdAmount <= 0}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Add Product to Compare
            </button>

            {/* Product List */}
            {products.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-900">Products Added ({products.length})</h3>
                  <button
                    onClick={handleClearAll}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    Clear All
                  </button>
                </div>
                <div className="space-y-2">
                  {products.map(product => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg"
                    >
                      <span className="text-sm text-gray-700 truncate flex-1">{product.name}</span>
                      <button
                        onClick={() => handleRemoveProduct(product.id)}
                        className="ml-2 text-gray-400 hover:text-red-500"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Results */}
          {products.length > 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Cost Comparison Results</h2>

              {/* Best Value Highlight */}
              {bestValue && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center mb-1">
                        <span className="text-2xl mr-2">🏆</span>
                        <h3 className="text-lg font-semibold text-green-900">Best Value</h3>
                      </div>
                      <p className="text-green-800 font-medium">{bestValue.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-green-700">
                        {formatCurrency(bestValue.costPerMg, selectedCurrency)}
                      </p>
                      <p className="text-green-600 text-sm">per mg</p>
                    </div>
                  </div>
                  {/* Cost for common doses */}
                  <div className="mt-4 pt-3 border-t border-green-200 grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="text-lg font-semibold text-green-700">{formatCurrency(bestValue.costPerMg * 25, selectedCurrency)}</p>
                      <p className="text-xs text-green-600">per 25mg dose</p>
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-green-700">{formatCurrency(bestValue.costPerMg * 50, selectedCurrency)}</p>
                      <p className="text-xs text-green-600">per 50mg dose</p>
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-green-700">{formatCurrency(bestValue.costPerMg * 25 * 30, selectedCurrency)}</p>
                      <p className="text-xs text-green-600">per month (25mg/day)</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Visual Comparison Cards */}
              <div className="space-y-3 mb-6">
                {sortedProducts.map((product, index) => {
                  const worstCostPerMg = sortedProducts[sortedProducts.length - 1].costPerMg;
                  const bestCostPerMg = sortedProducts[0].costPerMg;
                  const percentFromBest = bestCostPerMg > 0
                    ? ((product.costPerMg - bestCostPerMg) / bestCostPerMg * 100)
                    : 0;
                  const barWidth = worstCostPerMg > 0
                    ? (product.costPerMg / worstCostPerMg * 100)
                    : 100;

                  // Color based on position
                  const bgColor = index === 0
                    ? 'bg-green-50 border-green-200'
                    : index === sortedProducts.length - 1 && sortedProducts.length > 1
                    ? 'bg-red-50 border-red-200'
                    : 'bg-gray-50 border-gray-200';
                  const barColor = index === 0
                    ? 'bg-green-500'
                    : index === sortedProducts.length - 1 && sortedProducts.length > 1
                    ? 'bg-red-400'
                    : 'bg-amber-400';
                  const textColor = index === 0
                    ? 'text-green-700'
                    : index === sortedProducts.length - 1 && sortedProducts.length > 1
                    ? 'text-red-700'
                    : 'text-amber-700';

                  return (
                    <div key={product.id} className={`border rounded-lg p-4 ${bgColor}`}>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-bold ${
                            index === 0 ? 'bg-green-500 text-white' :
                            index === sortedProducts.length - 1 && sortedProducts.length > 1 ? 'bg-red-400 text-white' :
                            'bg-amber-400 text-white'
                          }`}>
                            {index + 1}
                          </span>
                          <div>
                            <p className="font-medium text-gray-900">{product.name}</p>
                            <p className="text-sm text-gray-500">
                              {selectedCurrency.symbol}{product.price.toFixed(2)} • {product.cbdUnit === 'g' ? `${product.cbdAmount}g` : `${product.cbdAmount}mg`} CBD
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-xl font-bold ${textColor}`}>
                            {formatCurrency(product.costPerMg, selectedCurrency)}
                          </p>
                          <p className="text-xs text-gray-500">per mg</p>
                        </div>
                      </div>

                      {/* Visual cost bar */}
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-gray-500">Relative cost</span>
                          {index === 0 ? (
                            <span className="font-medium text-green-600">Best value</span>
                          ) : (
                            <span className={`font-medium ${textColor}`}>+{percentFromBest.toFixed(0)}% vs best</span>
                          )}
                        </div>
                        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${barColor} rounded-full transition-all duration-300`}
                            style={{ width: `${barWidth}%` }}
                          />
                        </div>
                      </div>

                      {/* Monthly cost comparison */}
                      <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between text-sm">
                        <span className="text-gray-600">Monthly cost (25mg/day):</span>
                        <span className={`font-semibold ${textColor}`}>
                          {formatCurrency(product.costPerMg * 25 * 30, selectedCurrency)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Savings Summary */}
              {sortedProducts.length > 1 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Potential Savings
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-2xl font-bold text-blue-700">
                        {((1 - sortedProducts[0].costPerMg / sortedProducts[sortedProducts.length - 1].costPerMg) * 100).toFixed(0)}%
                      </p>
                      <p className="text-sm text-blue-600">less per mg vs worst</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-blue-700">
                        {formatCurrency((sortedProducts[sortedProducts.length - 1].costPerMg - sortedProducts[0].costPerMg) * 25 * 30, selectedCurrency)}
                      </p>
                      <p className="text-sm text-blue-600">saved per month (25mg/day)</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Additional Notes */}
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Remember</h4>
                <ul className="space-y-1 text-sm text-gray-700">
                  <li>• Price isn't everything — always verify product quality with third-party lab tests (COAs)</li>
                  <li>• Full-spectrum products may offer additional benefits over isolates</li>
                  <li>• Consider shipping costs and subscription discounts when comparing</li>
                </ul>
              </div>
            </div>
          ) : (
            /* Educational Content */
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Why Compare Cost Per Milligram?</h2>

              <div className="space-y-4 text-sm text-gray-700">
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">The Real Value Metric</h4>
                  <p>CBD products vary wildly in price and potency. A {selectedCurrency.symbol}30 bottle with 500mg CBD is actually more expensive than a {selectedCurrency.symbol}50 bottle with 1500mg CBD when you calculate the cost per milligram.</p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-1">How to Calculate</h4>
                  <p>Cost per mg = Total Price / Total CBD Content. For example, a {selectedCurrency.symbol}60 bottle containing 1000mg CBD costs {selectedCurrency.symbol}0.06 per mg.</p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Quality Matters Too</h4>
                  <p>The cheapest option isn't always the best. Always check for third-party lab testing (COA) to verify potency and purity. A slightly more expensive product with verified quality may be worth it.</p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-1">What's a Good Price?</h4>
                  <p>Generally, {selectedCurrency.symbol}0.05-0.10 per mg is considered reasonable for quality CBD oil. Prices below {selectedCurrency.symbol}0.03/mg may indicate lower quality, while premium brands often charge {selectedCurrency.symbol}0.15+ per mg.</p>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-800 text-sm">
                  <strong>Tip:</strong> Add 2-3 products you're considering to quickly see which offers the best value for your budget.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-gray-100 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-sm text-gray-600 text-center">
            <strong>Disclaimer:</strong> This calculator is for informational purposes only. Always verify CBD content from the product's Certificate of Analysis (COA). Prices and formulations may vary by retailer and over time.
          </p>
        </div>
      </div>
    </div>
  );
}
