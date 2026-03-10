import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { CALCULATORS } from '../calculators/registry';
import type { Calculator } from '../calculators/registry';
import { loadAutoSave, type AutoSaveData } from '../hooks/useAutoSave';

interface CalculatorGridProps {
  onSelectCalculator: (id: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  recentCalculators: string[];
}

// Organize calculators into intuitive categories
const CATEGORIES = [
  {
    id: 'quick-start',
    name: 'Popular',
    description: 'Most used calculators',
    icon: 'star',
    calculatorIds: ['rental-roi', 'mortgage', 'cashflow', 'dev-feasibility'],
  },
  {
    id: 'rental',
    name: 'Rental Analysis',
    description: 'Analyze rental income and yields',
    icon: 'home',
    calculatorIds: ['rental-roi', 'rental-projection', 'cashflow', 'cap-rate'],
  },
  {
    id: 'financing',
    name: 'Financing',
    description: 'Loans, mortgages, and payment planning',
    icon: 'account_balance',
    calculatorIds: ['mortgage', 'financing'],
  },
  {
    id: 'development',
    name: 'Development',
    description: 'Construction and project feasibility',
    icon: 'construction',
    calculatorIds: ['dev-feasibility', 'dev-budget'],
  },
  {
    id: 'analysis',
    name: 'Investment Analysis',
    description: 'Returns, valuations, and comparisons',
    icon: 'analytics',
    calculatorIds: ['xirr', 'irr', 'npv', 'risk-assessment'],
  },
  {
    id: 'local',
    name: 'Indonesia',
    description: 'Local tax and regulatory tools',
    icon: 'public',
    calculatorIds: ['indonesia-tax'],
  },
];

export function CalculatorGrid({
  onSelectCalculator,
  searchQuery,
  onSearchChange,
  recentCalculators,
}: CalculatorGridProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

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

  // Get recent calculators with auto-save data
  const recentCalcs = useMemo(() => {
    return recentCalculators
      .map(id => {
        const calc = CALCULATORS.find(c => c.id === id);
        if (!calc) return null;
        const autoSave = loadAutoSave(id);
        return {
          calculator: calc,
          autoSave,
        };
      })
      .filter((c): c is { calculator: Calculator; autoSave: AutoSaveData<unknown> | null } => c !== null)
      .slice(0, 4);
  }, [recentCalculators]);

  // Get calculators for selected category
  const categoryCalculators = useMemo(() => {
    if (!selectedCategory) return null;
    const category = CATEGORIES.find(c => c.id === selectedCategory);
    if (!category) return null;
    return category.calculatorIds
      .map(id => CALCULATORS.find(c => c.id === id))
      .filter((c): c is Calculator => c !== undefined);
  }, [selectedCategory]);

  const isSearching = searchQuery.trim().length > 0;

  return (
    <div className="space-y-8">
      {/* Search Bar */}
      <div className="relative max-w-2xl">
        <svg
          className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search calculators... (e.g., mortgage, rental, ROI)"
          value={searchQuery}
          onChange={(e) => {
            onSearchChange(e.target.value);
            setSelectedCategory(null);
          }}
          className="w-full pl-12 pr-4 py-4 bg-zinc-900 border border-zinc-800 rounded-2xl text-white text-base placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-zinc-500 hover:text-zinc-300 p-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Search Results */}
      {isSearching ? (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">
              {filteredCalculators.length} result{filteredCalculators.length !== 1 ? 's' : ''} for "{searchQuery}"
            </h2>
            <button
              onClick={() => onSearchChange('')}
              className="text-sm text-emerald-400 hover:text-emerald-300"
            >
              Clear search
            </button>
          </div>
          {filteredCalculators.length === 0 ? (
            <div className="text-center py-16 bg-zinc-900/50 rounded-2xl border border-zinc-800">
              <span className="material-symbols-outlined text-5xl text-zinc-700 mb-4">search_off</span>
              <p className="text-zinc-400 mb-2">No calculators found</p>
              <p className="text-zinc-600 text-sm">Try different keywords</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
      ) : selectedCategory ? (
        /* Category View */
        <div>
          <button
            onClick={() => setSelectedCategory(null)}
            className="flex items-center gap-2 text-zinc-400 hover:text-white mb-6 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to categories
          </button>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">
              {CATEGORIES.find(c => c.id === selectedCategory)?.name}
            </h2>
            <p className="text-zinc-400">
              {CATEGORIES.find(c => c.id === selectedCategory)?.description}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoryCalculators?.map(calc => (
              <CalculatorCard
                key={calc.id}
                calculator={calc}
                onSelect={onSelectCalculator}
                showFullDescription
              />
            ))}
          </div>
        </div>
      ) : (
        /* Main View */
        <>
          {/* Continue Where You Left Off */}
          {recentCalcs.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-lg text-emerald-400">history</span>
                </div>
                <h2 className="text-lg font-semibold text-white">Continue Where You Left Off</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {recentCalcs.map(({ calculator: calc, autoSave }) => {
                  const previewText = getPreviewText(calc.id, autoSave?.preview as Record<string, string | number> | undefined);
                  const hasData = previewText !== 'Continue';
                  const colors = ICON_COLORS[calc.id] || { bg: 'bg-zinc-800', text: 'text-zinc-400' };

                  return (
                    <motion.button
                      key={calc.id}
                      onClick={() => onSelectCalculator(calc.id)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="group relative p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700 text-left transition-all"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`w-9 h-9 rounded-lg ${colors.bg} flex items-center justify-center`}>
                          <span className={`material-symbols-outlined text-lg ${colors.text}`}>
                            {calc.icon}
                          </span>
                        </div>
                      </div>
                      <h3 className="font-medium text-white group-hover:text-zinc-100 transition-colors text-sm">
                        {calc.shortName}
                      </h3>
                      <p className={`text-xs mt-0.5 ${hasData ? 'text-emerald-400' : 'text-zinc-600'}`}>
                        {previewText}
                      </p>
                    </motion.button>
                  );
                })}
              </div>
            </section>
          )}

          {/* Category Filters */}
          <section>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className="group flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-600 hover:bg-zinc-800 text-sm transition-all"
                >
                  <span className="material-symbols-outlined text-base text-zinc-500 group-hover:text-zinc-300">
                    {category.icon}
                  </span>
                  <span className="text-zinc-400 group-hover:text-white">{category.name}</span>
                  <span className="text-[10px] text-zinc-600 bg-zinc-800 group-hover:bg-zinc-700 px-1.5 py-0.5 rounded">
                    {category.calculatorIds.length}
                  </span>
                </button>
              ))}
            </div>
          </section>

          {/* All Calculators */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-lg text-purple-400">grid_view</span>
                </div>
                <h2 className="text-lg font-semibold text-white">All Calculators</h2>
              </div>
              <span className="text-sm text-zinc-500">{CALCULATORS.length} available</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {CALCULATORS.map(calc => (
                <CalculatorCard
                  key={calc.id}
                  calculator={calc}
                  onSelect={onSelectCalculator}
                />
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

// Calculator Card Component
interface CalculatorCardProps {
  calculator: Calculator;
  onSelect: (id: string) => void;
  showFullDescription?: boolean;
}

// Format currency values for preview display
const CURRENCY_SYMBOLS: Record<string, string> = {
  IDR: 'Rp', USD: '$', AUD: 'A$', EUR: '€', GBP: '£', INR: '₹', CNY: '¥', AED: 'د.إ', RUB: '₽'
};

function formatPreviewValue(value: number, currency?: string): string {
  if (!value || value === 0) return '';
  const symbol = currency ? CURRENCY_SYMBOLS[currency] || '' : '';
  if (value >= 1000000000) {
    return `${symbol}${(value / 1000000000).toFixed(1)}B`;
  }
  if (value >= 1000000) {
    return `${symbol}${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${symbol}${(value / 1000).toFixed(0)}K`;
  }
  return `${symbol}${value.toFixed(0)}`;
}

function getPreviewText(calcId: string, preview: Record<string, string | number> | undefined): string {
  if (!preview) return 'Continue';

  const currency = preview.currency as string | undefined;

  switch (calcId) {
    case 'mortgage':
      if (preview.loanAmount) return `Loan: ${formatPreviewValue(preview.loanAmount as number, currency)}`;
      break;
    case 'rental-roi':
      if (preview.initialInvestment) return `Investment: ${formatPreviewValue(preview.initialInvestment as number, currency)}`;
      break;
    case 'npv':
    case 'irr':
      if (preview.initialInvestment) return `Investment: ${formatPreviewValue(preview.initialInvestment as number, currency)}`;
      break;
    case 'cashflow':
      if (preview.monthlyIncome) return `Income: ${formatPreviewValue(preview.monthlyIncome as number, currency)}/mo`;
      break;
    case 'cap-rate':
      if (preview.propertyValue) return `Value: ${formatPreviewValue(preview.propertyValue as number, currency)}`;
      break;
    case 'xirr':
      if (preview.propertyPrice) return `Price: ${formatPreviewValue(preview.propertyPrice as number, currency)}`;
      break;
    case 'dev-feasibility':
      if (preview.landCost) return `Land: ${formatPreviewValue(preview.landCost as number, currency)}`;
      break;
    case 'dev-budget':
      if (preview.totalBudget) return `Budget: ${formatPreviewValue(preview.totalBudget as number, currency)}`;
      if (preview.projectName) return `${preview.projectName}`;
      break;
    case 'financing':
      if (preview.propertyValue) return `Value: ${formatPreviewValue(preview.propertyValue as number, currency)}`;
      break;
    case 'indonesia-tax':
      if (preview.purchasePrice) return `Price: ${formatPreviewValue(preview.purchasePrice as number, currency)}`;
      break;
    case 'rental-projection':
      if (preview.nightlyRate) return `${formatPreviewValue(preview.nightlyRate as number, currency)}/night`;
      break;
    case 'risk-assessment':
      if (preview.investmentAmount) return `Investment: ${formatPreviewValue(preview.investmentAmount as number, currency)}`;
      break;
  }

  return 'Continue';
}

const ICON_COLORS: Record<string, { bg: string; text: string }> = {
  'mortgage': { bg: 'bg-emerald-500/20', text: 'text-emerald-400' },
  'rental-roi': { bg: 'bg-cyan-500/20', text: 'text-cyan-400' },
  'xirr': { bg: 'bg-purple-500/20', text: 'text-purple-400' },
  'cashflow': { bg: 'bg-green-500/20', text: 'text-green-400' },
  'cap-rate': { bg: 'bg-amber-500/20', text: 'text-amber-400' },
  'irr': { bg: 'bg-blue-500/20', text: 'text-blue-400' },
  'npv': { bg: 'bg-teal-500/20', text: 'text-teal-400' },
  'dev-feasibility': { bg: 'bg-orange-500/20', text: 'text-orange-400' },
  'indonesia-tax': { bg: 'bg-red-500/20', text: 'text-red-400' },
  'rental-projection': { bg: 'bg-indigo-500/20', text: 'text-indigo-400' },
  'financing': { bg: 'bg-cyan-500/20', text: 'text-cyan-400' },
  'dev-budget': { bg: 'bg-yellow-500/20', text: 'text-yellow-400' },
  'risk-assessment': { bg: 'bg-rose-500/20', text: 'text-rose-400' },
};

function CalculatorCard({ calculator, onSelect, showFullDescription = false }: CalculatorCardProps) {
  const colors = ICON_COLORS[calculator.id] || { bg: 'bg-zinc-800', text: 'text-zinc-400' };

  return (
    <motion.button
      onClick={() => onSelect(calculator.id)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="group relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 text-left transition-all hover:border-emerald-500/40 hover:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className={`w-11 h-11 rounded-xl ${colors.bg} flex items-center justify-center shrink-0`}>
          <span className={`material-symbols-outlined text-xl ${colors.text}`}>
            {calculator.icon}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white group-hover:text-emerald-400 transition-colors mb-1">
            {calculator.shortName}
          </h3>
          <p className={`text-sm text-zinc-500 ${showFullDescription ? '' : 'line-clamp-2'}`}>
            {calculator.description}
          </p>
        </div>
      </div>

      {/* Hover Arrow */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
        <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </motion.button>
  );
}
