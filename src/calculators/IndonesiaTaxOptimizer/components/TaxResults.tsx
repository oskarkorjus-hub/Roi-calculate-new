import { formatCurrency } from '../../../utils/numberParsing';
import type { TaxCalculationResult } from '../index';

interface TaxInputs {
  purchasePrice: number;
  holdingPeriod: number;
  projectedSalePrice: number;
  ownershipStructure: 'pt' | 'freehold' | 'leasehold';
  currency: 'IDR' | 'USD' | 'AUD' | 'EUR' | 'GBP';
  showDepreciation: boolean;
  showDeductions: boolean;
}

interface Props {
  result: TaxCalculationResult;
  inputs: TaxInputs;
  symbol: string;
}

const ownershipLabels: Record<string, string> = {
  pt: 'PT (Company)',
  freehold: 'Freehold',
  leasehold: 'Leasehold',
};

export function TaxResults({ result, inputs, symbol }: Props) {
  const getROIColor = (roi: number) => {
    if (roi >= 20) return 'text-emerald-400';
    if (roi >= 10) return 'text-cyan-400';
    if (roi >= 0) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getTaxRating = () => {
    const effectiveRate = result.effectiveTaxRate;
    if (effectiveRate <= 15) return { grade: 'A', label: 'Excellent', color: 'text-emerald-400', bg: 'bg-emerald-500/10' };
    if (effectiveRate <= 20) return { grade: 'B', label: 'Good', color: 'text-cyan-400', bg: 'bg-cyan-500/10' };
    if (effectiveRate <= 25) return { grade: 'C', label: 'Fair', color: 'text-yellow-400', bg: 'bg-yellow-500/10' };
    return { grade: 'D', label: 'High', color: 'text-red-400', bg: 'bg-red-500/10' };
  };

  const rating = getTaxRating();

  return (
    <div className="flex flex-col gap-4">
      {/* Main Results Card */}
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
        <div className="mb-4 flex items-center border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-red-400">analytics</span>
            <h3 className="text-lg font-bold text-white">Tax Analysis</h3>
          </div>
        </div>

        <div className="space-y-4">
          {/* Tax Rating */}
          <div className={`${rating.bg} rounded-xl p-4 border border-zinc-700`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-400 uppercase tracking-wider mb-1">Tax Efficiency</p>
                <div className="flex items-baseline gap-2">
                  <span className={`text-3xl font-black ${rating.color}`}>{rating.grade}</span>
                  <span className={`text-sm font-medium ${rating.color}`}>{rating.label}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-zinc-400">Effective Rate</p>
                <p className={`text-xl font-bold ${rating.color}`}>{result.effectiveTaxRate.toFixed(1)}%</p>
              </div>
            </div>
          </div>

          {/* ROI Comparison */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-zinc-800 rounded-xl p-4 border border-zinc-700">
              <p className="text-xs text-zinc-400 uppercase tracking-wider mb-1">Gross ROI</p>
              <p className={`text-2xl font-bold ${getROIColor(result.grossROI)}`}>
                {result.grossROI.toFixed(1)}%
              </p>
              <p className="text-[10px] text-zinc-500 mt-1">Before taxes</p>
            </div>
            <div className="bg-zinc-800 rounded-xl p-4 border border-zinc-700">
              <p className="text-xs text-zinc-400 uppercase tracking-wider mb-1">Net ROI</p>
              <p className={`text-2xl font-bold ${getROIColor(result.netROI)}`}>
                {result.netROI.toFixed(1)}%
              </p>
              <p className="text-[10px] text-zinc-500 mt-1">After taxes</p>
            </div>
          </div>

          {/* Tax Breakdown */}
          <div className="space-y-3 pt-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-zinc-400">Capital Gains Tax</span>
              <span className="text-sm font-medium text-red-400">
                -{symbol} {formatCurrency(result.capitalGainsTax, inputs.currency)}
              </span>
            </div>

            {inputs.showDepreciation && result.depreciationRecaptureTax > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-zinc-400">Depreciation Recapture</span>
                <span className="text-sm font-medium text-red-400">
                  -{symbol} {formatCurrency(result.depreciationRecaptureTax, inputs.currency)}
                </span>
              </div>
            )}

            {inputs.showDepreciation && result.depreciationTaxSavings > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-zinc-400">Depreciation Benefit</span>
                <span className="text-sm font-medium text-emerald-400">
                  +{symbol} {formatCurrency(result.depreciationTaxSavings, inputs.currency)}
                </span>
              </div>
            )}

            {inputs.showDeductions && result.deductionTaxSavings > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-zinc-400">Deduction Savings</span>
                <span className="text-sm font-medium text-emerald-400">
                  +{symbol} {formatCurrency(result.deductionTaxSavings, inputs.currency)}
                </span>
              </div>
            )}

            <div className="flex justify-between items-center pt-3 border-t border-zinc-700">
              <span className="text-sm font-bold text-white">Total Tax Liability</span>
              <span className="text-lg font-bold text-red-400">
                {symbol} {formatCurrency(result.totalTaxLiability, inputs.currency)}
              </span>
            </div>
          </div>

          {/* Net Amounts */}
          <div className="bg-zinc-800/50 rounded-xl p-4 border border-zinc-700 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-zinc-400">Net Proceeds</span>
              <span className="text-sm font-medium text-white">
                {symbol} {formatCurrency(result.netProceeds, inputs.currency)}
              </span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-zinc-700">
              <span className="text-sm font-bold text-white">Net Profit</span>
              <span className={`text-lg font-bold ${result.netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {symbol} {formatCurrency(result.netProfit, inputs.currency)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Optimal Structure Recommendation */}
      <div className={`rounded-xl p-4 border ${
        result.optimalStructure === inputs.ownershipStructure
          ? 'bg-emerald-500/10 border-emerald-500/20'
          : 'bg-amber-500/10 border-amber-500/20'
      }`}>
        <div className="flex items-center gap-2 mb-3">
          <span className="material-symbols-outlined text-lg">
            {result.optimalStructure === inputs.ownershipStructure ? 'check_circle' : 'lightbulb'}
          </span>
          <h4 className={`font-bold text-sm ${
            result.optimalStructure === inputs.ownershipStructure ? 'text-emerald-400' : 'text-amber-400'
          }`}>
            {result.optimalStructure === inputs.ownershipStructure
              ? 'Optimal Structure Selected'
              : 'Optimization Opportunity'}
          </h4>
        </div>

        {result.optimalStructure !== inputs.ownershipStructure ? (
          <div className="space-y-2">
            <p className="text-xs text-zinc-300">
              Switching to <strong className="text-amber-400">{ownershipLabels[result.optimalStructure]}</strong> could save:
            </p>
            <p className="text-xl font-bold text-amber-400">
              {symbol} {formatCurrency(result.taxSavingsFromOptimal, inputs.currency)}
            </p>
            <p className="text-[10px] text-zinc-500">
              Current: {ownershipLabels[inputs.ownershipStructure]} ({symbol} {formatCurrency(result.totalTaxLiability, inputs.currency)} tax)
            </p>
          </div>
        ) : (
          <p className="text-xs text-zinc-300">
            Your current <strong className="text-emerald-400">{ownershipLabels[inputs.ownershipStructure]}</strong> ownership minimizes your tax liability for this scenario.
          </p>
        )}
      </div>

      {/* Quick Stats */}
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-4">
        <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">Quick Stats</h4>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-zinc-500">Holding Period</span>
            <span className="text-xs font-medium text-zinc-300">{inputs.holdingPeriod} years</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-zinc-500">Capital Gain</span>
            <span className={`text-xs font-medium ${result.capitalGain >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {symbol} {formatCurrency(result.capitalGain, inputs.currency)}
            </span>
          </div>
          {inputs.showDepreciation && (
            <div className="flex justify-between items-center">
              <span className="text-xs text-zinc-500">Total Depreciation</span>
              <span className="text-xs font-medium text-cyan-400">
                {symbol} {formatCurrency(result.totalDepreciation, inputs.currency)}
              </span>
            </div>
          )}
          {inputs.showDeductions && (
            <div className="flex justify-between items-center">
              <span className="text-xs text-zinc-500">Total Deductions</span>
              <span className="text-xs font-medium text-blue-400">
                {symbol} {formatCurrency(result.totalDeductions, inputs.currency)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Risk Warning */}
      {inputs.holdingPeriod < 5 && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h4 className="font-bold text-sm text-red-400">Short-Term Holding Warning</h4>
          </div>
          <p className="text-xs text-zinc-300">
            Holding less than 5 years may trigger higher short-term capital gains rates. Consider extending your holding period to reduce tax burden.
          </p>
        </div>
      )}
    </div>
  );
}

export default TaxResults;
