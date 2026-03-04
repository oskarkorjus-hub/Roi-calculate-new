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
    <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
      <h2 className="text-lg font-bold text-gray-900">Filters & Sorting</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            🔍 Search
          </label>
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Project name or location..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
          />
        </div>

        {/* Strategy Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Strategy
          </label>
          <select
            value={strategy}
            onChange={e => setStrategy(e.target.value as FilterStrategy)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
          >
            <option value="all">All Strategies</option>
            <option value="flip">Flip</option>
            <option value="hold">Hold</option>
            <option value="rental">Rental</option>
            <option value="development">Development</option>
          </select>
        </div>

        {/* Score Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Investment Score
          </label>
          <select
            value={score}
            onChange={e => setScore(e.target.value as FilterScore)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
          >
            <option value="all">All Scores</option>
            <option value="excellent">Excellent (85+)</option>
            <option value="very-good">Very Good (70-84)</option>
            <option value="good">Good (60-69)</option>
            <option value="moderate">Moderate (50-59)</option>
            <option value="high-risk">High Risk (&lt;50)</option>
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            value={status}
            onChange={e => setStatus(e.target.value as FilterStatus)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Sort By */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sort By
          </label>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as SortBy)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
          >
            <option value="score">Investment Score</option>
            <option value="roi">ROI %</option>
            <option value="cashflow">Cash Flow</option>
            <option value="investment">Investment Amount</option>
            <option value="date">Created Date</option>
          </select>
        </div>

        {/* Sort Order */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Order
          </label>
          <select
            value={sortOrder}
            onChange={e => setSortOrder(e.target.value as 'asc' | 'desc')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
          >
            <option value="desc">Highest to Lowest</option>
            <option value="asc">Lowest to Highest</option>
          </select>
        </div>
      </div>

      {/* Results count */}
      <div className="pt-2 text-sm text-gray-600">
        Showing {filtered.length} of {projects.length} projects
      </div>
    </div>
  );
}
