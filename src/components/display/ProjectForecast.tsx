import type { XIRRResult } from '../../types/investment';
import { Tooltip } from '../ui/Tooltip';

interface Props {
  result: XIRRResult;
  symbol: string;
  formatDisplay: (idr: number) => string;
}

export function ProjectForecast({ result, symbol, formatDisplay }: Props) {
  const xirrValue = result.rate * 100;
  const xirrPercent = xirrValue.toFixed(1);
  const isPositive = result.rate >= 0;

  // Determine font size based on XIRR value length
  const getXirrFontSize = () => {
    const len = xirrPercent.length;
    if (len <= 4) return 'text-4xl';
    if (len <= 6) return 'text-3xl';
    if (len <= 8) return 'text-2xl';
    return 'text-xl';
  };

  // Format currency with abbreviation for large numbers
  const formatCompact = (value: number): string => {
    const absValue = Math.abs(value);
    const formatted = formatDisplay(absValue);
    // If the formatted string is too long, use abbreviations
    if (formatted.length > 12) {
      if (absValue >= 1e12) return (absValue / 1e12).toFixed(1) + 'T';
      if (absValue >= 1e9) return (absValue / 1e9).toFixed(1) + 'B';
      if (absValue >= 1e6) return (absValue / 1e6).toFixed(1) + 'M';
      if (absValue >= 1e3) return (absValue / 1e3).toFixed(1) + 'K';
    }
    return formatted;
  };

  return (
    <div className="sticky top-36 flex flex-col gap-6">
      {/* Main Card */}
      <div className="rounded-xl border border-border bg-surface p-6 shadow-lg">
        <h3 className="mb-4 text-lg font-bold text-text-primary">Project Forecast</h3>

        {/* XIRR Display */}
        <div className="mb-6 rounded-lg bg-primary-light p-4 text-center border border-primary/20">
          <div className="flex items-center justify-center gap-2 mb-1">
            <p className="text-sm text-text-secondary">Estimated XIRR</p>
            <Tooltip text="Extended Internal Rate of Return - measures the annualized return of your investment accounting for irregular cash flows and timing. Higher is better." />
          </div>
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <span className={`${getXirrFontSize()} font-black ${isPositive ? 'text-primary' : 'text-negative'} break-all`}>
              {xirrPercent}%
            </span>
            <span className={`text-xs flex items-center ${isPositive ? 'text-primary' : 'text-negative'}`}>
              <span className="material-symbols-outlined text-sm">
                {isPositive ? 'trending_up' : 'trending_down'}
              </span>
              Annualized
            </span>
          </div>
        </div>

        {/* Metrics */}
        <div className="space-y-4">
          <div className="flex justify-between items-center border-b border-border pb-2 gap-2">
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-sm text-text-secondary">Total Invested</span>
              <Tooltip text="Sum of all cash outflows including down payment, installments, and additional costs." />
            </div>
            <span className="text-sm font-mono text-text-primary truncate text-right" title={`${symbol} ${formatDisplay(result.totalInvested)}`}>
              {symbol} {formatCompact(result.totalInvested)}
            </span>
          </div>
          <div className="flex justify-between items-center border-b border-border pb-2 gap-2">
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-sm text-text-secondary">Net Profit</span>
              <Tooltip text="Your total return after deducting all investments and closing costs from the projected sale price." />
            </div>
            <span className={`text-sm font-mono truncate text-right ${result.netProfit >= 0 ? 'text-primary' : 'text-negative'}`} title={`${result.netProfit >= 0 ? '+' : ''}${symbol} ${formatDisplay(Math.abs(result.netProfit))}`}>
              {result.netProfit >= 0 ? '+' : ''}{symbol} {formatCompact(result.netProfit)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-sm text-text-secondary">Investment Period</span>
              <Tooltip text="Time from your first payment date until the projected sale date." />
            </div>
            <span className="text-sm text-text-primary">{result.holdPeriodMonths} Months</span>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="rounded-lg bg-surface-alt p-4 border border-border">
        <div className="flex gap-3">
          <span className="material-symbols-outlined text-text-muted">info</span>
          <p className="text-xs text-text-muted">
            XIRR calculation uses irregular intervals. All values stored in IDR internally.
          </p>
        </div>
      </div>
    </div>
  );
}
