import { useMemo } from 'react';
import { getScoreColor } from '../utils/investmentScoring';

interface InvestmentScoreCardProps {
  score: number; // 0-100
  roi_score?: number;
  cashflow_score?: number;
  stability_score?: number;
  location_score?: number;
  showBreakdown?: boolean;
  size?: 'sm' | 'md' | 'lg';
  compact?: boolean;
}

export function InvestmentScoreCard({
  score,
  roi_score = 0,
  cashflow_score = 0,
  stability_score = 0,
  location_score = 0,
  showBreakdown = true,
  size = 'md',
  compact = false,
}: InvestmentScoreCardProps) {
  const sizeConfig = useMemo(() => {
    switch (size) {
      case 'sm':
        return { diameter: 48, fontSize: 'text-sm', radius: 20, strokeWidth: 3 };
      case 'lg':
        return { diameter: 100, fontSize: 'text-3xl', radius: 44, strokeWidth: 4 };
      default:
        return { diameter: 64, fontSize: 'text-xl', radius: 28, strokeWidth: 4 };
    }
  }, [size]);

  const scoreColor = useMemo(() => getScoreColor(score), [score]);

  const circumference = 2 * Math.PI * sizeConfig.radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  // Determine risk level with dark theme colors
  const getRiskLevel = (s: number) => {
    if (s >= 85) return { label: 'Excellent', color: 'text-emerald-400' };
    if (s >= 70) return { label: 'Very Good', color: 'text-cyan-400' };
    if (s >= 60) return { label: 'Good', color: 'text-blue-400' };
    if (s >= 50) return { label: 'Moderate', color: 'text-yellow-400' };
    return { label: 'High Risk', color: 'text-red-400' };
  };

  const risk = getRiskLevel(score);

  return (
    <div className={`flex flex-col items-center ${compact ? 'gap-1' : 'gap-2'}`}>
      {/* Circular Score Ring */}
      <div className="relative" style={{ width: sizeConfig.diameter, height: sizeConfig.diameter }}>
        <svg
          className="transform -rotate-90"
          width={sizeConfig.diameter}
          height={sizeConfig.diameter}
          viewBox={`0 0 ${sizeConfig.diameter} ${sizeConfig.diameter}`}
        >
          {/* Background circle */}
          <circle
            cx={sizeConfig.diameter / 2}
            cy={sizeConfig.diameter / 2}
            r={sizeConfig.radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={sizeConfig.strokeWidth}
            className="text-zinc-700"
          />
          {/* Progress circle */}
          <circle
            cx={sizeConfig.diameter / 2}
            cy={sizeConfig.diameter / 2}
            r={sizeConfig.radius}
            fill="none"
            stroke={scoreColor}
            strokeWidth={sizeConfig.strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-500"
          />
        </svg>

        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className={`font-bold ${sizeConfig.fontSize}`} style={{ color: scoreColor }}>
            {Math.round(score)}
          </div>
        </div>
      </div>

      {/* Risk Level - only show if not compact */}
      {!compact && (
        <div className={`text-xs font-semibold ${risk.color}`}>{risk.label}</div>
      )}

      {/* Breakdown Components - dark theme */}
      {showBreakdown && !compact && (
        <div className="w-full space-y-1.5 p-3 rounded-lg bg-zinc-800/50 border border-zinc-700">
          <div className="text-xs font-semibold text-zinc-400 mb-2">Score Breakdown</div>

          {/* ROI Component */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="text-zinc-500 w-10">ROI</span>
              <div className="w-16 h-1.5 bg-zinc-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all"
                  style={{ width: `${Math.min((roi_score / 5) * 100, 100)}%` }}
                />
              </div>
            </div>
            <span className="font-semibold text-zinc-300 w-8 text-right">
              {Math.round((roi_score / 5) * 100)}%
            </span>
          </div>

          {/* Cash Flow Component */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="text-zinc-500 w-10">Cash</span>
              <div className="w-16 h-1.5 bg-zinc-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all"
                  style={{ width: `${Math.min((cashflow_score / 3) * 100, 100)}%` }}
                />
              </div>
            </div>
            <span className="font-semibold text-zinc-300 w-8 text-right">
              {Math.round((cashflow_score / 3) * 100)}%
            </span>
          </div>

          {/* Stability Component */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="text-zinc-500 w-10">Stab</span>
              <div className="w-16 h-1.5 bg-zinc-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-500 transition-all"
                  style={{ width: `${Math.min((stability_score / 2) * 100, 100)}%` }}
                />
              </div>
            </div>
            <span className="font-semibold text-zinc-300 w-8 text-right">
              {Math.round((stability_score / 2) * 100)}%
            </span>
          </div>

          {/* Location Component */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="text-zinc-500 w-10">Loc</span>
              <div className="w-16 h-1.5 bg-zinc-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-500 transition-all"
                  style={{ width: `${Math.min(location_score * 100, 100)}%` }}
                />
              </div>
            </div>
            <span className="font-semibold text-zinc-300 w-8 text-right">
              {Math.round(location_score * 100)}%
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
