import { CalculatorBreadcrumb } from '../CalculatorBreadcrumb';
import type { Calculator } from '../../calculators/registry';
import { useState } from 'react';

interface CalculatorHeaderProps {
  calculator: Calculator;
  onNavigateHome: () => void;
}

export function CalculatorHeader({ calculator, onNavigateHome }: CalculatorHeaderProps) {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <>
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Breadcrumb */}
          <CalculatorBreadcrumb
            calculatorName={calculator.name}
            onNavigateHome={onNavigateHome}
          />

          {/* Header Content */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-4xl">{calculator.icon}</span>
                <h1 className="text-3xl font-bold text-gray-900">{calculator.name}</h1>
              </div>
              <p className="text-gray-600 text-lg">{calculator.description}</p>
            </div>

            {/* Info Button */}
            <button
              onClick={() => setShowInfo(!showInfo)}
              className="ml-4 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="View calculator details"
            >
              ℹ️
            </button>
          </div>

          {/* Info Panel */}
          {showInfo && (
            <div className="mt-6 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
              <h3 className="font-semibold text-indigo-900 mb-2">Use Cases</h3>
              <ul className="text-indigo-800 text-sm space-y-1">
                {calculator.useCases.map((useCase, idx) => (
                  <li key={idx}>• {useCase}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Calculator Tabs (for switching between calculators) */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={onNavigateHome}
              className="flex items-center gap-2 px-4 py-2 text-indigo-600 font-semibold hover:bg-indigo-50 rounded-lg transition-colors"
            >
              ← Back to Calculators
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
