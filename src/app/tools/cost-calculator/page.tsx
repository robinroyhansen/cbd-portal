'use client';

import { useState } from 'react';
import Link from 'next/link';

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

const formatCurrency = (value: number): string => {
  if (value < 0.01) {
    return `$${value.toFixed(4)}`;
  }
  return `$${value.toFixed(2)}`;
};

export default function CostCalculator() {
  const [inputs, setInputs] = useState<CalculatorInputs>(defaultInputs);
  const [products, setProducts] = useState<Product[]>([]);

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
                Product Price ($) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
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
                  <div className="flex items-center mb-2">
                    <span className="text-2xl mr-2">🏆</span>
                    <h3 className="text-lg font-semibold text-green-900">Best Value</h3>
                  </div>
                  <p className="text-green-800 font-medium">{bestValue.name}</p>
                  <p className="text-green-700 text-sm mt-1">
                    {formatCurrency(bestValue.costPerMg)} per mg of CBD
                  </p>
                </div>
              )}

              {/* Comparison Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-2 text-sm font-medium text-gray-700">Rank</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-gray-700">Product</th>
                      <th className="text-right py-3 px-2 text-sm font-medium text-gray-700">Price</th>
                      <th className="text-right py-3 px-2 text-sm font-medium text-gray-700">CBD</th>
                      <th className="text-right py-3 px-2 text-sm font-medium text-gray-700">Cost/mg</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedProducts.map((product, index) => (
                      <tr
                        key={product.id}
                        className={`border-b border-gray-100 ${
                          index === 0 ? 'bg-green-50' : ''
                        }`}
                      >
                        <td className="py-3 px-2">
                          <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium ${
                            index === 0
                              ? 'bg-green-500 text-white'
                              : index === 1
                              ? 'bg-gray-300 text-gray-700'
                              : index === 2
                              ? 'bg-amber-600 text-white'
                              : 'bg-gray-200 text-gray-600'
                          }`}>
                            {index + 1}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-sm text-gray-900 max-w-[150px] truncate">
                          {product.name}
                        </td>
                        <td className="py-3 px-2 text-sm text-gray-700 text-right">
                          ${product.price.toFixed(2)}
                        </td>
                        <td className="py-3 px-2 text-sm text-gray-700 text-right">
                          {product.cbdUnit === 'g'
                            ? `${product.cbdAmount}g`
                            : `${product.cbdAmount}mg`}
                        </td>
                        <td className="py-3 px-2 text-sm font-medium text-right">
                          <span className={index === 0 ? 'text-green-700' : 'text-gray-900'}>
                            {formatCurrency(product.costPerMg)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Savings Info */}
              {sortedProducts.length > 1 && (
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Potential Savings</h4>
                  <p className="text-blue-800 text-sm">
                    The best value product costs{' '}
                    <strong>
                      {((1 - sortedProducts[0].costPerMg / sortedProducts[sortedProducts.length - 1].costPerMg) * 100).toFixed(0)}% less per mg
                    </strong>{' '}
                    than the most expensive option.
                  </p>
                </div>
              )}

              {/* Additional Notes */}
              <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
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
                  <p>CBD products vary wildly in price and potency. A $30 bottle with 500mg CBD is actually more expensive than a $50 bottle with 1500mg CBD when you calculate the cost per milligram.</p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-1">How to Calculate</h4>
                  <p>Cost per mg = Total Price / Total CBD Content. For example, a $60 bottle containing 1000mg CBD costs $0.06 per mg.</p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Quality Matters Too</h4>
                  <p>The cheapest option isn't always the best. Always check for third-party lab testing (COA) to verify potency and purity. A slightly more expensive product with verified quality may be worth it.</p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-1">What's a Good Price?</h4>
                  <p>Generally, $0.05-0.10 per mg is considered reasonable for quality CBD oil. Prices below $0.03/mg may indicate lower quality, while premium brands often charge $0.15+ per mg.</p>
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
