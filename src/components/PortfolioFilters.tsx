import { useState, useMemo, useCallback } from 'react';
import type { PortfolioProject } from '../types/portfolio';
import { getCalculatorLabel } from '../utils/crossCalculatorComparison';

interface PortfolioFiltersProps {
  projects: PortfolioProject[];
  onFiltersChange: (filtered: PortfolioProject[]) => void;
}

type SortBy = 'score' | 'roi' | 'cashflow' | 'investment' | 'date';
type FilterStrategy = 'all' | 'flip' | 'hold' | 'rental' | 'development';
type FilterScore = 'all' | 'excellent' | 'very-good' | 'good' | 'moderate' | 'high-risk';
type FilterStatus = 'all' | 'active' | 'archived' | 'completed';
type QuickFilter = 'none' | 'top-performers' | 'high-roi' | 'positive-cashflow' | 'recent' | 'needs-attention';

const CALCULATOR_LABELS: Record<string, string> = {
  'xirr': 'XIRR',
  'irr': 'IRR',
  'npv': 'NPV',
  'rental-roi': 'Rental ROI',
  'rental-projection': 'Rental Projection',
  'cap-rate': 'Cap Rate',
  'cashflow': 'Cash Flow',
  'dev-feasibility': 'Dev Feasibility',
  'mortgage': 'Mortgage',
  'financing': 'Financing',
  'indonesia-tax': 'Tax Calculator',
  'dev-budget': 'Dev Budget',
  'risk-assessment': 'Risk Assessment',
};

export function PortfolioFilters({ projects, onFiltersChange }: PortfolioFiltersProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [strategy, setStrategy] = useState<FilterStrategy>('all');
  const [score, setScore] = useState<FilterScore>('all');
  const [status, setStatus] = useState<FilterStatus>('all');
  const [calculatorType, setCalculatorType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortBy>('score');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [quickFilter, setQuickFilter] = useState<QuickFilter>('none');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Get unique calculator types from projects
  const availableCalculatorTypes = useMemo(() => {
    const types = new Set(projects.map(p => p.calculatorId));
    return Array.from(types).sort();
  }, [projects]);

  // Get unique locations from projects
  const availableLocations = useMemo(() => {
    const locations = new Set(projects.map(p => p.location));
    return Array.from(locations).sort();
  }, [projects]);

  // Reset all filters
  const resetFilters = useCallback(() => {
    setSearchTerm('');
    setStrategy('all');
    setScore('all');
    setStatus('all');
    setCalculatorType('all');
    setQuickFilter('none');
  }, []);

  // Check if any filters are active
  const hasActiveFilters = searchTerm || strategy !== 'all' || score !== 'all' || status !== 'all' || calculatorType !== 'all' || quickFilter !== 'none';

  // Apply quick filter presets
  const applyQuickFilter = useCallback((filter: QuickFilter) => {
    resetFilters();
    setQuickFilter(filter);

    switch (filter) {
      case 'top-performers':
        setScore('excellent');
        setSortBy('score');
        setSortOrder('desc');
        break;
      case 'high-roi':
        setSortBy('roi');
        setSortOrder('desc');
        break;
      case 'positive-cashflow':
        setSortBy('cashflow');
        setSortOrder('desc');
        break;
      case 'recent':
        setSortBy('date');
        setSortOrder('desc');
        break;
      case 'needs-attention':
        setScore('high-risk');
        setSortBy('score');
        setSortOrder('asc');
        break;
    }
  }, [resetFilters]);

  // Apply filters
  const filtered = useMemo(() => {
    let result = [...projects];

    // Search filter (project name or location)
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        p =>
          p.projectName.toLowerCase().includes(term) ||
          p.location.toLowerCase().includes(term)
      );
    }

    // Calculator type filter
    if (calculatorType !== 'all') {
      result = result.filter(p => p.calculatorId === calculatorType);
    }

    // Strategy filter
    if (strategy !== 'all') {
      result = result.filter(p => p.strategy === strategy);
    }

    // Score filter
    if (score !== 'all') {
      result = result.filter(p => {
        const s = p.investmentScore;
        switch (score) {
          case 'excellent':
            return s >= 85;
          case 'very-good':
            return s >= 70 && s < 85;
          case 'good':
            return s >= 60 && s < 70;
          case 'moderate':
            return s >= 50 && s < 60;
          case 'high-risk':
            return s < 50;
          default:
            return true;
        }
      });
    }

    // Status filter
    if (status !== 'all') {
      result = result.filter(p => p.status === status);
    }

    // Quick filter: positive cashflow
    if (quickFilter === 'positive-cashflow') {
      result = result.filter(p => (p.avgCashFlow || 0) > 0);
    }

    // Quick filter: recent (last 30 days)
    if (quickFilter === 'recent') {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      result = result.filter(p => new Date(p.createdAt) >= thirtyDaysAgo);
    }

    // Sort
    result.sort((a, b) => {
      let aVal: number, bVal: number;

      switch (sortBy) {
        case 'score':
          aVal = a.investmentScore || 0;
          bVal = b.investmentScore || 0;
          break;
        case 'roi':
          aVal = a.roi || 0;
          bVal = b.roi || 0;
          break;
        case 'cashflow':
          aVal = a.avgCashFlow || 0;
          bVal = b.avgCashFlow || 0;
          break;
        case 'investment':
          aVal = a.totalInvestment || 0;
          bVal = b.totalInvestment || 0;
          break;
        case 'date':
          aVal = new Date(a.createdAt).getTime();
          bVal = new Date(b.createdAt).getTime();
          break;
        default:
          aVal = 0;
          bVal = 0;
      }

      if (sortOrder === 'desc') {
        return bVal - aVal;
      }
      return aVal - bVal;
    });

    return result;
  }, [projects, searchTerm, strategy, score, status, calculatorType, sortBy, sortOrder, quickFilter]);

  // Calculate filtered stats
  const filteredStats = useMemo(() => {
    if (filtered.length === 0) {
      return { avgScore: 0, avgROI: 0, totalInvestment: 0, avgCashFlow: 0 };
    }

    const avgScore = filtered.reduce((sum, p) => sum + (p.investmentScore || 0), 0) / filtered.length;
    const avgROI = filtered.reduce((sum, p) => sum + (p.roi || 0), 0) / filtered.length;
    const totalInvestment = filtered.reduce((sum, p) => sum + (p.totalInvestment || 0), 0);
    const avgCashFlow = filtered.reduce((sum, p) => sum + (p.avgCashFlow || 0), 0) / filtered.length;

    return { avgScore, avgROI, totalInvestment, avgCashFlow };
  }, [filtered]);

  // Trigger callback when filters change
  useMemo(() => {
    onFiltersChange(filtered);
  }, [filtered, onFiltersChange]);

  const formatCurrency = (value: number) => {
    if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`;
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
    return value.toFixed(0);
  };

  return (
    <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
      {/* Header with Quick Filters */}
      <div className="p-4 sm:p-6 border-b border-zinc-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-white">Filters & Analytics</h2>
          </div>

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="text-sm text-zinc-400 hover:text-white flex items-center gap-1 transition"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Clear all filters
            </button>
          )}
        </div>

        {/* Quick Filter Presets */}
        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-zinc-500 flex items-center mr-1">Quick filters:</span>
          {[
            { id: 'top-performers', label: 'Top Performers' },
            { id: 'high-roi', label: 'High ROI' },
            { id: 'positive-cashflow', label: 'Positive Cash Flow' },
            { id: 'recent', label: 'Recent (30d)' },
            { id: 'needs-attention', label: 'Needs Attention' },
          ].map(preset => (
            <button
              key={preset.id}
              onClick={() => applyQuickFilter(quickFilter === preset.id ? 'none' : preset.id as QuickFilter)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                quickFilter === preset.id
                  ? 'bg-zinc-700 text-white'
                  : 'bg-zinc-800/60 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 border border-zinc-700/50'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Filtered Results Summary */}
      <div className="px-4 sm:px-6 py-3 bg-zinc-800/30 border-b border-zinc-800">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-white">{filtered.length}</span>
            <span className="text-sm text-zinc-400">of {projects.length} projects</span>
          </div>

          {filtered.length > 0 && (
            <>
              <div className="hidden sm:block w-px h-6 bg-zinc-700" />
              <div className="flex flex-wrap gap-4 text-sm">
                <div>
                  <span className="text-zinc-500">Avg Score: </span>
                  <span className={`font-semibold ${
                    filteredStats.avgScore >= 70 ? 'text-emerald-400' :
                    filteredStats.avgScore >= 50 ? 'text-cyan-400' : 'text-orange-400'
                  }`}>
                    {filteredStats.avgScore.toFixed(0)}
                  </span>
                </div>
                <div>
                  <span className="text-zinc-500">Avg ROI: </span>
                  <span className={`font-semibold ${filteredStats.avgROI >= 15 ? 'text-emerald-400' : filteredStats.avgROI >= 8 ? 'text-cyan-400' : 'text-orange-400'}`}>
                    {filteredStats.avgROI.toFixed(1)}%
                  </span>
                </div>
                <div>
                  <span className="text-zinc-500">Total Investment: </span>
                  <span className="font-semibold text-white">{formatCurrency(filteredStats.totalInvestment)}</span>
                </div>
                <div>
                  <span className="text-zinc-500">Avg Cash Flow: </span>
                  <span className={`font-semibold ${filteredStats.avgCashFlow >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {formatCurrency(filteredStats.avgCashFlow)}/mo
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Active Filters Chips */}
      {hasActiveFilters && (
        <div className="px-4 sm:px-6 py-3 border-b border-zinc-800 flex flex-wrap gap-2 items-center">
          <span className="text-xs text-zinc-500">Active:</span>
          {searchTerm && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-zinc-800 text-zinc-300 rounded-md text-xs">
              Search: "{searchTerm}"
              <button onClick={() => setSearchTerm('')} className="hover:text-white">×</button>
            </span>
          )}
          {calculatorType !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-cyan-500/20 text-cyan-400 rounded-md text-xs">
              Type: {CALCULATOR_LABELS[calculatorType] || calculatorType}
              <button onClick={() => setCalculatorType('all')} className="hover:text-white">×</button>
            </span>
          )}
          {strategy !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-500/20 text-purple-400 rounded-md text-xs">
              Strategy: {strategy}
              <button onClick={() => setStrategy('all')} className="hover:text-white">×</button>
            </span>
          )}
          {score !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-md text-xs">
              Score: {score.replace('-', ' ')}
              <button onClick={() => setScore('all')} className="hover:text-white">×</button>
            </span>
          )}
          {status !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-500/20 text-amber-400 rounded-md text-xs">
              Status: {status}
              <button onClick={() => setStatus('all')} className="hover:text-white">×</button>
            </span>
          )}
          {quickFilter !== 'none' && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-md text-xs">
              Quick: {quickFilter.replace('-', ' ')}
              <button onClick={() => setQuickFilter('none')} className="hover:text-white">×</button>
            </span>
          )}
        </div>
      )}

      {/* Main Filters */}
      <div className="p-4 sm:p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
              Search
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Project name or location..."
                className="w-full pl-9 pr-3 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 text-sm text-white placeholder:text-zinc-500 transition"
              />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Calculator Type Filter */}
          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
              Calculator Type
            </label>
            <select
              value={calculatorType}
              onChange={e => setCalculatorType(e.target.value)}
              className="w-full px-3 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 text-sm text-white transition appearance-none cursor-pointer"
            >
              <option value="all" className="bg-zinc-800">All Types</option>
              {availableCalculatorTypes.map(type => (
                <option key={type} value={type} className="bg-zinc-800">
                  {CALCULATOR_LABELS[type] || type}
                </option>
              ))}
            </select>
          </div>

          {/* Strategy Filter */}
          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
              Strategy
            </label>
            <select
              value={strategy}
              onChange={e => setStrategy(e.target.value as FilterStrategy)}
              className="w-full px-3 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 text-sm text-white transition appearance-none cursor-pointer"
            >
              <option value="all" className="bg-zinc-800">All Strategies</option>
              <option value="flip" className="bg-zinc-800">Flip</option>
              <option value="hold" className="bg-zinc-800">Hold</option>
              <option value="rental" className="bg-zinc-800">Rental</option>
              <option value="development" className="bg-zinc-800">Development</option>
            </select>
          </div>

          {/* Score Filter */}
          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
              Investment Score
            </label>
            <select
              value={score}
              onChange={e => setScore(e.target.value as FilterScore)}
              className="w-full px-3 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 text-sm text-white transition appearance-none cursor-pointer"
            >
              <option value="all" className="bg-zinc-800">All Scores</option>
              <option value="excellent" className="bg-zinc-800">⭐ Excellent (85+)</option>
              <option value="very-good" className="bg-zinc-800">Very Good (70-84)</option>
              <option value="good" className="bg-zinc-800">Good (60-69)</option>
              <option value="moderate" className="bg-zinc-800">Moderate (50-59)</option>
              <option value="high-risk" className="bg-zinc-800">High Risk (&lt;50)</option>
            </select>
          </div>
        </div>

        {/* Advanced Filters Toggle */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition"
        >
          <svg
            className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
          {showAdvanced ? 'Hide' : 'Show'} sorting options
        </button>

        {/* Advanced Filters (Sort) */}
        {showAdvanced && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-zinc-800">
            {/* Status Filter */}
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                Status
              </label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as FilterStatus)}
                className="w-full px-3 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 text-sm text-white transition appearance-none cursor-pointer"
              >
                <option value="all" className="bg-zinc-800">All Status</option>
                <option value="active" className="bg-zinc-800">🟢 Active</option>
                <option value="archived" className="bg-zinc-800">📦 Archived</option>
                <option value="completed" className="bg-zinc-800">✅ Completed</option>
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as SortBy)}
                className="w-full px-3 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 text-sm text-white transition appearance-none cursor-pointer"
              >
                <option value="score" className="bg-zinc-800">Investment Score</option>
                <option value="roi" className="bg-zinc-800">ROI %</option>
                <option value="cashflow" className="bg-zinc-800">Cash Flow</option>
                <option value="investment" className="bg-zinc-800">Investment Amount</option>
                <option value="date" className="bg-zinc-800">Created Date</option>
              </select>
            </div>

            {/* Sort Order */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                Order
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setSortOrder('desc')}
                  className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2 ${
                    sortOrder === 'desc'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-zinc-800 text-zinc-400 border border-zinc-700 hover:text-white'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                  </svg>
                  Highest First
                </button>
                <button
                  onClick={() => setSortOrder('asc')}
                  className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2 ${
                    sortOrder === 'asc'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-zinc-800 text-zinc-400 border border-zinc-700 hover:text-white'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
                  </svg>
                  Lowest First
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
