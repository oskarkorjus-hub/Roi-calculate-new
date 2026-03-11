import type { BRRRRResult } from '../index';

interface BRRRRResultsProps {
  result: BRRRRResult;
  symbol: string;
  rating: { grade: string; label: string };
}

export function BRRRRResults({ result, symbol, rating }: BRRRRResultsProps) {
  const formatCurrency = (value: number) => {
    if (!isFinite(value)) return 'N/A';
    return `${symbol}${Math.round(value).toLocaleString()}`;
  };

  const formatROI = (value: number) => {
    if (!isFinite(value)) return 'Infinite';
    return `${value.toFixed(2)}%`;
  };

  const getRatingColor = (grade: string) => {
    if (grade.startsWith('A')) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    if (grade.startsWith('B')) return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
    if (grade.startsWith('C')) return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    return 'text-red-400 bg-red-500/10 border-red-500/20';
  };

  return (
    <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 space-y-4">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-amber-400">analytics</span>
          <h3 className="text-lg font-bold text-white">Results</h3>
        </div>
        <div className={`px-3 py-1 rounded-lg border ${getRatingColor(rating.grade)}`}>
          <span className="text-sm font-bold">{rating.grade}</span>
        </div>
      </div>

      {/* Primary Metric - Cash on Cash ROI */}
      <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 rounded-xl p-4 border border-amber-500/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-zinc-400 uppercase tracking-wide mb-1">Cash-on-Cash ROI</p>
            <p className={`text-2xl font-bold ${result.cashOnCashROI >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {formatROI(result.cashOnCashROI)}
            </p>
            <p className="text-xs text-zinc-500 mt-1">{rating.label}</p>
          </div>
          <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
        </div>
      </div>

      {/* Cash Flow Metrics */}
      <ResultCard
        title="Monthly Cash Flow"
        value={formatCurrency(result.monthlyCashFlow)}
        subtitle="After all expenses"
        positive={result.monthlyCashFlow >= 0}
      />

      <ResultCard
        title="Annual Cash Flow"
        value={formatCurrency(result.annualCashFlow)}
        subtitle="Yearly net income"
        positive={result.annualCashFlow >= 0}
      />

      {/* Investment Breakdown */}
      <div className="border-t border-zinc-700 pt-4 mt-4">
        <h4 className="text-xs text-zinc-500 uppercase tracking-wide mb-3">Investment Breakdown</h4>

        <MiniResult
          label="Total Investment"
          value={formatCurrency(result.totalInvestment)}
        />

        <MiniResult
          label="Refinance Amount"
          value={formatCurrency(result.refinanceLoanAmount)}
        />

        <MiniResult
          label="Cash Left in Deal"
          value={formatCurrency(result.cashLeftInDeal)}
          highlight
        />

        <MiniResult
          label="Equity Position"
          value={formatCurrency(result.equity)}
        />
      </div>

      {/* Monthly Breakdown */}
      <div className="border-t border-zinc-700 pt-4 mt-4">
        <h4 className="text-xs text-zinc-500 uppercase tracking-wide mb-3">Monthly Numbers</h4>

        <MiniResult
          label="Net Operating Income"
          value={formatCurrency(result.monthlyNOI)}
        />

        <MiniResult
          label="Mortgage Payment"
          value={formatCurrency(result.monthlyMortgagePayment)}
          negative
        />
      </div>

      {/* Analysis Tips */}
      <div className="bg-amber-500/5 border border-amber-500/10 rounded-xl p-4 mt-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="material-symbols-outlined text-amber-400 text-lg">tips_and_updates</span>
          <h4 className="font-bold text-amber-400 text-sm">BRRRR Analysis</h4>
        </div>
        <ul className="space-y-1 text-xs text-zinc-400">
          {result.cashLeftInDeal <= 0 && result.annualCashFlow > 0 && (
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 mt-0.5">*</span>
              <span>Infinite ROI - You pulled out all your capital and still have positive cash flow!</span>
            </li>
          )}
          {result.cashLeftInDeal > 0 && result.cashOnCashROI >= 15 && (
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 mt-0.5">*</span>
              <span>Strong returns above 15% CoC ROI threshold</span>
            </li>
          )}
          {result.monthlyCashFlow < 0 && (
            <li className="flex items-start gap-2">
              <span className="text-red-400 mt-0.5">*</span>
              <span>Negative cash flow - consider higher rents or lower expenses</span>
            </li>
          )}
          {result.cashLeftInDeal > result.totalInvestment * 0.3 && (
            <li className="flex items-start gap-2">
              <span className="text-amber-400 mt-0.5">*</span>
              <span>Over 30% of capital still in deal - may need higher ARV or better purchase price</span>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}

function ResultCard({ title, value, subtitle, positive }: {
  title: string;
  value: string;
  subtitle: string;
  positive: boolean;
}) {
  return (
    <div className="bg-zinc-800/50 rounded-xl p-4 border border-zinc-700/50">
      <p className="text-xs text-zinc-400 mb-1">{title}</p>
      <p className={`text-xl font-bold ${positive ? 'text-emerald-400' : 'text-red-400'}`}>
        {value}
      </p>
      <p className="text-xs text-zinc-500 mt-1">{subtitle}</p>
    </div>
  );
}

function MiniResult({ label, value, highlight, negative }: {
  label: string;
  value: string;
  highlight?: boolean;
  negative?: boolean;
}) {
  return (
    <div className="flex justify-between items-center py-1.5">
      <span className="text-xs text-zinc-400">{label}</span>
      <span className={`text-sm font-semibold ${
        highlight ? 'text-amber-400' :
        negative ? 'text-red-400' :
        'text-zinc-200'
      }`}>
        {negative ? `-${value.replace('-', '')}` : value}
      </span>
    </div>
  );
}
