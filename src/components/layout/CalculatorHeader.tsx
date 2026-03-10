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
    <div className="mb-6">
      {/* Breadcrumb */}
      <CalculatorBreadcrumb
        calculatorName={calculator.name}
        onNavigateHome={onNavigateHome}
      />

      {/* Header Content */}
      <div className="flex items-start justify-between mt-4 pb-4 border-b border-zinc-800">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center">
              <span className="material-symbols-outlined text-xl text-zinc-400">
                {calculator.icon}
              </span>
            </div>
            <h1 className="text-xl font-semibold text-white">{calculator.name}</h1>
          </div>
          <p className="text-zinc-500 text-sm">{calculator.description}</p>
        </div>

        {/* Info Button */}
        <button
          onClick={() => setShowInfo(!showInfo)}
          className="p-2 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 rounded-lg transition-colors"
          title="View calculator details"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      </div>

      {/* Info Panel */}
      {showInfo && (
        <div className="mt-4 p-3 bg-zinc-800/50 border border-zinc-700 rounded-lg">
          <h3 className="font-medium text-zinc-300 text-sm mb-2">Use Cases</h3>
          <ul className="text-zinc-400 text-sm space-y-1">
            {calculator.useCases.map((useCase, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-zinc-500">•</span>
                {useCase}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Back Button */}
      <div className="flex items-center h-10 mt-4">
        <button
          onClick={onNavigateHome}
          className="flex items-center gap-2 text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Calculators
        </button>
      </div>
    </div>
  );
}
