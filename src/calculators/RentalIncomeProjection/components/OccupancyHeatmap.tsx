import { useMemo } from 'react';
import { formatCurrency } from '../../../utils/numberParsing';
import type { MonthlyProjection } from '../index';

interface Props {
  monthlyProjections: MonthlyProjection[];
  baseRate: number;
  baseOccupancy: number;
  symbol: string;
  currency: 'IDR' | 'USD' | 'AUD' | 'EUR' | 'GBP';
}

export function OccupancyHeatmap({ monthlyProjections, baseRate, baseOccupancy, symbol, currency }: Props) {
  // Generate heatmap data for rate vs occupancy revenue potential
  const heatmapData = useMemo(() => {
    const rateMultipliers = [0.7, 0.8, 0.9, 1.0, 1.1, 1.2, 1.3, 1.4, 1.5];
    const occupancyLevels = [40, 50, 60, 70, 80, 90];

    return rateMultipliers.map(rateMult => ({
      rate: baseRate * rateMult,
      rateMultiplier: rateMult,
      occupancies: occupancyLevels.map(occ => ({
        occupancy: occ,
        revenue: (baseRate * rateMult) * (occ / 100) * 30, // Monthly revenue
        isOptimal: false,
      })),
    }));
  }, [baseRate]);

  // Find optimal cell
  const allCells = heatmapData.flatMap(row =>
    row.occupancies.map(cell => ({ ...cell, rate: row.rate, rateMultiplier: row.rateMultiplier }))
  );
  const maxRevenue = Math.max(...allCells.map(c => c.revenue));
  const optimalCell = allCells.find(c => c.revenue === maxRevenue);

  // Color scale for revenue
  const getColor = (revenue: number) => {
    const ratio = revenue / maxRevenue;
    if (ratio >= 0.9) return 'bg-emerald-500';
    if (ratio >= 0.75) return 'bg-emerald-600';
    if (ratio >= 0.6) return 'bg-cyan-600';
    if (ratio >= 0.45) return 'bg-blue-600';
    if (ratio >= 0.3) return 'bg-indigo-600';
    return 'bg-purple-700';
  };

  // Current position marker
  const currentRateMultiplier = 1.0;
  const currentOccupancy = baseOccupancy;

  return (
    <div className="mt-6 space-y-6">
      {/* Heatmap */}
      <div className="bg-zinc-800 rounded-xl p-4 border border-zinc-700">
        <h4 className="text-sm font-bold text-white mb-4">Revenue Potential Matrix (Rate x Occupancy)</h4>

        <div className="overflow-x-auto">
          <div className="min-w-[500px]">
            {/* Header row */}
            <div className="flex items-center mb-2">
              <div className="w-24 text-xs text-zinc-500 font-medium">Rate</div>
              <div className="flex-1 grid grid-cols-6 gap-1">
                {[40, 50, 60, 70, 80, 90].map(occ => (
                  <div key={occ} className="text-center text-xs text-zinc-400 font-medium">
                    {occ}%
                  </div>
                ))}
              </div>
            </div>

            {/* Data rows */}
            {heatmapData.map((row) => (
              <div key={row.rateMultiplier} className="flex items-center mb-1">
                <div className="w-24 text-xs text-zinc-400 font-medium">
                  {(row.rateMultiplier * 100).toFixed(0)}% ({symbol}{formatCurrency(row.rate, currency).split('.')[0]})
                </div>
                <div className="flex-1 grid grid-cols-6 gap-1">
                  {row.occupancies.map((cell) => {
                    const isOptimal = cell.revenue === maxRevenue;
                    const isCurrent = row.rateMultiplier === currentRateMultiplier &&
                      Math.abs(cell.occupancy - currentOccupancy) < 5;

                    return (
                      <div
                        key={`${row.rateMultiplier}-${cell.occupancy}`}
                        className={`relative h-10 rounded ${getColor(cell.revenue)} flex items-center justify-center text-[10px] font-bold text-white transition-all hover:scale-105 cursor-default group`}
                        title={`${symbol}${formatCurrency(cell.revenue, currency)}/month`}
                      >
                        {formatCurrency(cell.revenue / 1000000, currency)}M
                        {isOptimal && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                            <span className="text-[8px] text-black font-black">★</span>
                          </div>
                        )}
                        {isCurrent && (
                          <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-white rounded-full border-2 border-zinc-800"></div>
                        )}

                        {/* Tooltip on hover */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-zinc-700 rounded text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                          {symbol} {formatCurrency(cell.revenue, currency)}/month
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-zinc-700">
          <div className="flex items-center gap-4 text-[10px]">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-400 rounded-full flex items-center justify-center">
                <span className="text-[6px] text-black font-black">★</span>
              </div>
              <span className="text-zinc-400">Optimal</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-white rounded-full border-2 border-zinc-600"></div>
              <span className="text-zinc-400">Current</span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-zinc-400">
            <span>Low</span>
            <div className="flex gap-0.5">
              <div className="w-4 h-2 bg-purple-700 rounded-sm"></div>
              <div className="w-4 h-2 bg-indigo-600 rounded-sm"></div>
              <div className="w-4 h-2 bg-blue-600 rounded-sm"></div>
              <div className="w-4 h-2 bg-cyan-600 rounded-sm"></div>
              <div className="w-4 h-2 bg-emerald-600 rounded-sm"></div>
              <div className="w-4 h-2 bg-emerald-500 rounded-sm"></div>
            </div>
            <span>High</span>
          </div>
        </div>
      </div>

      {/* Optimal Point Analysis */}
      {optimalCell && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">💡</span>
            <h4 className="font-bold text-emerald-400">Optimal Price Point</h4>
          </div>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-zinc-400 text-xs">Recommended Rate</p>
              <p className="text-lg font-bold text-white">
                {symbol} {formatCurrency(optimalCell.rate, currency)}
              </p>
              <p className="text-[10px] text-zinc-500">
                {((optimalCell.rateMultiplier - 1) * 100).toFixed(0)}% {optimalCell.rateMultiplier > 1 ? 'above' : 'below'} base
              </p>
            </div>
            <div>
              <p className="text-zinc-400 text-xs">Target Occupancy</p>
              <p className="text-lg font-bold text-white">{optimalCell.occupancy}%</p>
              <p className="text-[10px] text-zinc-500">
                {(optimalCell.occupancy - baseOccupancy).toFixed(0)}% vs current
              </p>
            </div>
            <div>
              <p className="text-zinc-400 text-xs">Monthly Revenue</p>
              <p className="text-lg font-bold text-emerald-400">
                {symbol} {formatCurrency(optimalCell.revenue, currency)}
              </p>
              <p className="text-[10px] text-zinc-500">Maximum potential</p>
            </div>
          </div>
        </div>
      )}

      {/* Occupancy Impact Analysis */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-zinc-800 rounded-xl p-4 border border-zinc-700">
          <p className="text-xs text-zinc-400 uppercase tracking-wider mb-2">If Occupancy +10%</p>
          <p className="text-xl font-bold text-emerald-400">
            +{symbol} {formatCurrency(baseRate * 0.1 * 30, currency)}
          </p>
          <p className="text-[10px] text-zinc-500">Additional monthly revenue</p>
        </div>
        <div className="bg-zinc-800 rounded-xl p-4 border border-zinc-700">
          <p className="text-xs text-zinc-400 uppercase tracking-wider mb-2">If Rate +20%</p>
          <p className="text-xl font-bold text-purple-400">
            +{symbol} {formatCurrency(baseRate * 0.2 * (baseOccupancy / 100) * 30, currency)}
          </p>
          <p className="text-[10px] text-zinc-500">Assuming same occupancy</p>
        </div>
      </div>
    </div>
  );
}

export default OccupancyHeatmap;
