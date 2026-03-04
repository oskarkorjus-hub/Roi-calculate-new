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
      <div className="bg-[#0a0a0a] border-b border-zinc-800">
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
                <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center text-2xl">
                  {calculator.icon}
                </div>
                <h1 className="text-2xl font-bold text-white">{calculator.name}</h1>
              </div>
              <p className="text-zinc-400">{calculator.description}</p>
            </div>

            {/* Info Button */}
            <button
              onClick={() => setShowInfo(!showInfo)}
              className="ml-4 p-2 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 rounded-lg transition-colors"
              title="View calculator details"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          </div>

          {/* Info Panel */}
          {showInfo && (
            <div className="mt-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
              <h3 className="font-semibold text-emerald-400 mb-2">Use Cases</h3>
              <ul className="text-zinc-300 text-sm space-y-1">
                {calculator.useCases.map((useCase, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-400">•</span>
                    {useCase}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Back Button Bar */}
      <div className="bg-[#0a0a0a] border-b border-zinc-800 sticky top-20 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-14">
            <button
              onClick={onNavigateHome}
              className="flex items-center gap-2 px-4 py-2 text-emerald-400 font-medium hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Calculators
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
