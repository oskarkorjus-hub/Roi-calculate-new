import { formatCurrency } from '../../../utils/numberParsing';
import type { ProjectionResult } from '../index';

interface RentalInputs {
  projectionYears: number;
  nightlyRate: number;
  baseOccupancyRate: number;
  location: string;
  currency: 'IDR' | 'USD' | 'AUD' | 'EUR' | 'GBP';
}

interface Props {
  result: ProjectionResult;
  inputs: RentalInputs;
  symbol: string;
}

const locationLabels: Record<string, string> = {
  'ubud': 'Ubud',
  'seminyak': 'Seminyak',
  'canggu': 'Canggu',
  'other-bali': 'Other Bali',
  'international': 'International',
};

export function ProjectionResults({ result, inputs, symbol }: Props) {
  const getPerformanceRating = () => {
    const annualYield = (result.annualNetIncome / (inputs.nightlyRate * 365)) * 100;
    if (annualYield >= 15) return { grade: 'A+', label: 'Excellent', color: 'text-emerald-400', bg: 'bg-emerald-500/10' };
    if (annualYield >= 12) return { grade: 'A', label: 'Very Good', color: 'text-emerald-500', bg: 'bg-emerald-500/10' };
    if (annualYield >= 8) return { grade: 'B+', label: 'Good', color: 'text-cyan-400', bg: 'bg-cyan-500/10' };
    if (annualYield >= 5) return { grade: 'B', label: 'Fair', color: 'text-yellow-400', bg: 'bg-yellow-500/10' };
    if (annualYield >= 0) return { grade: 'C', label: 'Marginal', color: 'text-orange-400', bg: 'bg-orange-500/10' };
    return { grade: 'D', label: 'Poor', color: 'text-red-400', bg: 'bg-red-500/10' };
  };

  const rating = getPerformanceRating();
  const cashOnCash = result.annualNetIncome > 0 ? (result.annualNetIncome / (inputs.nightlyRate * 100)) * 100 : 0;

  return (
    <div className="flex flex-col gap-4">
      {/* Main Results Card */}
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
        <div className="mb-4 flex items-center border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-purple-400">analytics</span>
            <h3 className="text-lg font-bold text-white">Projection Results</h3>
          </div>
        </div>

        <div className="space-y-4">
          {/* Performance Rating */}
          <div className={`${rating.bg} rounded-xl p-4 border border-zinc-700`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-400 uppercase tracking-wider mb-1">Performance</p>
                <div className="flex items-baseline gap-2">
                  <span className={`text-3xl font-black ${rating.color}`}>{rating.grade}</span>
                  <span className={`text-sm font-medium ${rating.color}`}>{rating.label}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-zinc-400">Avg Occupancy</p>
                <p className="text-xl font-bold text-purple-400">{result.averageOccupancy.toFixed(1)}%</p>
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-zinc-800 rounded-xl p-4 border border-zinc-700">
              <p className="text-xs text-zinc-400 uppercase tracking-wider mb-1">Annual Revenue</p>
              <p className="text-lg font-bold text-emerald-400">
                {symbol} {formatCurrency(result.annualRevenue, inputs.currency)}
              </p>
            </div>
            <div className="bg-zinc-800 rounded-xl p-4 border border-zinc-700">
              <p className="text-xs text-zinc-400 uppercase tracking-wider mb-1">Annual Net</p>
              <p className={`text-lg font-bold ${result.annualNetIncome >= 0 ? 'text-cyan-400' : 'text-red-400'}`}>
                {symbol} {formatCurrency(result.annualNetIncome, inputs.currency)}
              </p>
            </div>
          </div>

          {/* Total Projection */}
          <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
            <p className="text-xs text-purple-400 uppercase tracking-wider mb-1">{inputs.projectionYears}-Year Total Cash Flow</p>
            <p className={`text-2xl font-bold ${result.totalProjectedCashFlow >= 0 ? 'text-purple-400' : 'text-red-400'}`}>
              {symbol} {formatCurrency(result.totalProjectedCashFlow, inputs.currency)}
            </p>
          </div>

          {/* Detailed Breakdown */}
          <div className="space-y-3 pt-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-zinc-400">Annual Expenses</span>
              <span className="text-sm font-medium text-red-400">
                -{symbol} {formatCurrency(result.annualExpenses, inputs.currency)}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-zinc-400">Average Nightly Rate</span>
              <span className="text-sm font-medium text-purple-400">
                {symbol} {formatCurrency(result.averageNightlyRate, inputs.currency)}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-zinc-400">Peak Season Revenue</span>
              <span className="text-sm font-medium text-emerald-400">
                {symbol} {formatCurrency(result.peakSeasonRevenue, inputs.currency)}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-zinc-400">Low Season Revenue</span>
              <span className="text-sm font-medium text-yellow-400">
                {symbol} {formatCurrency(result.lowSeasonRevenue, inputs.currency)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Optimization */}
      {result.optimalRate !== inputs.nightlyRate && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">💡</span>
            <h4 className="font-bold text-sm text-emerald-400">Pricing Opportunity</h4>
          </div>
          <p className="text-xs text-zinc-300 mb-2">
            Optimal rate: <strong className="text-emerald-400">{symbol} {formatCurrency(result.optimalRate, inputs.currency)}</strong>
          </p>
          <p className="text-xs text-zinc-400">
            Potential additional annual revenue:
          </p>
          <p className="text-lg font-bold text-emerald-400">
            +{symbol} {formatCurrency(result.optimalRateRevenue - result.revenueAtCurrentRate, inputs.currency)}
          </p>
        </div>
      )}

      {/* Location Tip */}
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-4">
        <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">Location Insights</h4>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">📍</span>
          <span className="text-sm font-medium text-white">{locationLabels[inputs.location] || inputs.location}</span>
        </div>
        <p className="text-xs text-zinc-500">
          {inputs.location === 'ubud' && 'Peak: Jul-Sept (weddings). Strong yoga/wellness market.'}
          {inputs.location === 'seminyak' && 'Peak: Dec-Feb (holidays). Party/beach crowd.'}
          {inputs.location === 'canggu' && 'Steady year-round. Digital nomad hub.'}
          {inputs.location === 'other-bali' && 'Variable seasonality. Research local patterns.'}
          {inputs.location === 'international' && 'Flat seasonality. Adjust rates manually for local patterns.'}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-4">
        <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">Quick Stats</h4>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-zinc-500">Monthly Avg Revenue</span>
            <span className="text-xs font-medium text-zinc-300">
              {symbol} {formatCurrency(result.annualRevenue / 12, inputs.currency)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-zinc-500">Monthly Avg Net</span>
            <span className={`text-xs font-medium ${result.annualNetIncome >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {symbol} {formatCurrency(result.annualNetIncome / 12, inputs.currency)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-zinc-500">Expense Ratio</span>
            <span className="text-xs font-medium text-zinc-300">
              {((result.annualExpenses / result.annualRevenue) * 100).toFixed(1)}%
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-zinc-500">Profit Margin</span>
            <span className={`text-xs font-medium ${result.annualNetIncome >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {((result.annualNetIncome / result.annualRevenue) * 100).toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      {/* Low Occupancy Warning */}
      {result.averageOccupancy < 60 && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-amber-400">⚠️</span>
            <h4 className="font-bold text-sm text-amber-400">Occupancy Warning</h4>
          </div>
          <p className="text-xs text-zinc-300">
            Occupancy below 60% may indicate pricing issues or market challenges. Consider lowering rates or improving listing quality.
          </p>
        </div>
      )}
    </div>
  );
}

export default ProjectionResults;
