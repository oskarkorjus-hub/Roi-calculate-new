import { useState } from 'react';
import { CalculatorGrid } from '../components/CalculatorGrid';

const RECENT_CALCULATORS_KEY = 'baliinvest_recent_calculators';
const MAX_RECENT = 5;

interface CalculatorHomeProps {
  onSelectCalculator: (id: string) => void;
}

export function CalculatorHome({ onSelectCalculator }: CalculatorHomeProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const recentCalculators = JSON.parse(
    localStorage.getItem(RECENT_CALCULATORS_KEY) || '[]'
  ) as string[];

  const handleSelectCalculator = (id: string) => {
    // Add to recently used
    const updated = [id, ...recentCalculators.filter(c => c !== id)].slice(0, MAX_RECENT);
    localStorage.setItem(RECENT_CALCULATORS_KEY, JSON.stringify(updated));

    // Notify parent
    onSelectCalculator(id);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl">📊</span>
            <h1 className="text-3xl font-bold text-gray-900">Calculators</h1>
          </div>
          <p className="text-gray-600 text-lg">
            Choose a calculator to analyze your real estate investments with precision
          </p>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <CalculatorGrid
          onSelectCalculator={handleSelectCalculator}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          recentCalculators={recentCalculators}
        />
      </main>
    </div>
  );
}
