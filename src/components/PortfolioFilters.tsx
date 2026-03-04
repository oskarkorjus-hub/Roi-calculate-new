import { useState, useMemo } from 'react';
import type { PortfolioProject } from '../types/portfolio';

interface PortfolioFiltersProps {
  projects: PortfolioProject[];
  onFiltersChange: (filtered: PortfolioProject[]) => void;
}

type SortBy = 'score' | 'roi' | 'cashflow' | 'investment' | 'date';
type FilterStrategy = 'all' | 'flip' | 'hold' | 'rental' | 'development';
type FilterScore = 'all' | 'excellent' | 'very-good' | 'good' | 'moderate' | 'high-risk';
type FilterStatus = 'all' | 'active' | 'archived' | 'completed';

export function PortfolioFilters({ projects, onFiltersChange }: PortfolioFiltersProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [strategy, setStrategy] = useState<FilterStrategy>('all');
  const [score, setScore] = useState<FilterScore>('all');
  const [status, setStatus] = useState<FilterStatus>('all');
  const [sortBy, setSortBy] = useState<SortBy>('score');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

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
  }, [projects, searchTerm, strategy, score, status, sortBy, sortOrder]);

  // Trigger callback when filters change
  useMemo(() => {
    onFiltersChange(filtered);
  }, [filtered, onFiltersChange]);

  return (
    <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 space-y-4">
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-4">
        <span className="material-symbols-outlined text-emerald-400">filter_list</span>
        <h2 className="text-lg font-bold text-white">Filters & Sorting</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-2">
            Search
          </label>
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Project name or location..."
            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-white placeholder:text-zinc-500"
          />
        </div>

        {/* Strategy Filter */}
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-2">
            Strategy
          </label>
          <select
            value={strategy}
            onChange={e => setStrategy(e.target.value as FilterStrategy)}
            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-white"
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
          <label className="block text-sm font-medium text-zinc-400 mb-2">
            Investment Score
          </label>
          <select
            value={score}
            onChange={e => setScore(e.target.value as FilterScore)}
            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-white"
          >
            <option value="all" className="bg-zinc-800">All Scores</option>
            <option value="excellent" className="bg-zinc-800">Excellent (85+)</option>
            <option value="very-good" className="bg-zinc-800">Very Good (70-84)</option>
            <option value="good" className="bg-zinc-800">Good (60-69)</option>
            <option value="moderate" className="bg-zinc-800">Moderate (50-59)</option>
            <option value="high-risk" className="bg-zinc-800">High Risk (&lt;50)</option>
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-2">
            Status
          </label>
          <select
            value={status}
            onChange={e => setStatus(e.target.value as FilterStatus)}
            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-white"
          >
            <option value="all" className="bg-zinc-800">All Status</option>
            <option value="active" className="bg-zinc-800">Active</option>
            <option value="archived" className="bg-zinc-800">Archived</option>
            <option value="completed" className="bg-zinc-800">Completed</option>
          </select>
        </div>
      </div>

      <div className="border-t border-zinc-800 pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Sort By */}
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-2">
            Sort By
          </label>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as SortBy)}
            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-white"
          >
            <option value="score" className="bg-zinc-800">Investment Score</option>
            <option value="roi" className="bg-zinc-800">ROI %</option>
            <option value="cashflow" className="bg-zinc-800">Cash Flow</option>
            <option value="investment" className="bg-zinc-800">Investment Amount</option>
            <option value="date" className="bg-zinc-800">Created Date</option>
          </select>
        </div>

        {/* Sort Order */}
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-2">
            Order
          </label>
          <select
            value={sortOrder}
            onChange={e => setSortOrder(e.target.value as 'asc' | 'desc')}
            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-white"
          >
            <option value="desc" className="bg-zinc-800">Highest to Lowest</option>
            <option value="asc" className="bg-zinc-800">Lowest to Highest</option>
          </select>
        </div>
      </div>

      {/* Results count */}
      <div className="pt-2 text-sm text-zinc-500">
        Showing {filtered.length} of {projects.length} projects
      </div>
    </div>
  );
}
