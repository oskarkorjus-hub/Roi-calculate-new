import { useMemo } from 'react';
import { CALCULATORS } from '../calculators/registry';
import type { Calculator } from '../calculators/registry';
import { CalculatorCard } from './CalculatorCard';

interface CalculatorGridProps {
  onSelectCalculator: (id: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  recentCalculators: string[];
}

export function CalculatorGrid({
  onSelectCalculator,
  searchQuery,
  onSearchChange,
  recentCalculators,
}: CalculatorGridProps) {
  const filteredCalculators = useMemo(() => {
    if (!searchQuery.trim()) return CALCULATORS;

    const lowerQuery = searchQuery.toLowerCase();
    return CALCULATORS.filter(
      calc =>
        calc.name.toLowerCase().includes(lowerQuery) ||
        calc.shortName.toLowerCase().includes(lowerQuery) ||
        calc.description.toLowerCase().includes(lowerQuery) ||
        calc.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }, [searchQuery]);

  // Get recent calculators
  const recentCalcs = useMemo(() => {
    return recentCalculators
      .map(id => CALCULATORS.find(c => c.id === id))
      .filter((c): c is Calculator => c !== undefined)
      .slice(0, 3);
  }, [recentCalculators]);

  return (
    <div>
      {/* Search Bar */}
      <div className="mb-8">
        <div className="relative">
          <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg">
            🔍
          </span>
          <input
            type="text"
            placeholder="Search by calculator name or tag (e.g., 'flip', 'rental', 'development')"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Recently Used Section */}
      {recentCalcs.length > 0 && !searchQuery && (
        <div className="mb-12">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Recently Used</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentCalcs.map(calc => (
              <CalculatorCard
                key={calc.id}
                calculator={calc}
                onSelect={onSelectCalculator}
                isRecent={true}
              />
            ))}
          </div>
        </div>
      )}

      {/* All Calculators Section */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          {searchQuery ? `Search Results (${filteredCalculators.length})` : 'All Calculators'}
        </h2>

        {filteredCalculators.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">
              No calculators found matching "{searchQuery}"
            </p>
            <p className="text-gray-400 text-sm mt-2">
              Try searching for tags like: flip, rental, development, or calculator names
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredCalculators.map(calc => (
              <CalculatorCard
                key={calc.id}
                calculator={calc}
                onSelect={onSelectCalculator}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
