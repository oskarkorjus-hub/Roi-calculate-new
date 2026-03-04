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

  const categories = ['All', 'financing', 'rental', 'development', 'valuation', 'analysis'];

  return (
    <div className="space-y-8">
      {/* Search and Filters Row */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <svg
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search calculators..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-zinc-700 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2">
          {categories.map((tag) => (
            <button
              key={tag}
              onClick={() => onSearchChange(tag === 'All' ? '' : tag)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                (tag === 'All' && !searchQuery) || searchQuery === tag
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:border-zinc-700 hover:text-zinc-300'
              }`}
            >
              {tag === 'All' ? 'All' : tag.charAt(0).toUpperCase() + tag.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Recent Calculators */}
      {recentCalcs.length > 0 && !searchQuery && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wide">Recent</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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

      {/* All Calculators */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wide">
              {searchQuery ? `Results` : 'All Calculators'}
            </h2>
          </div>
          <span className="text-xs text-zinc-600">
            {filteredCalculators.length} available
          </span>
        </div>

        {filteredCalculators.length === 0 ? (
          <div className="text-center py-12 bg-zinc-900/30 rounded-xl border border-zinc-800">
            <svg className="w-12 h-12 text-zinc-700 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p className="text-zinc-500 mb-1">No results for "{searchQuery}"</p>
            <button
              onClick={() => onSearchChange('')}
              className="text-sm text-emerald-400 hover:text-emerald-300"
            >
              Clear search
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
