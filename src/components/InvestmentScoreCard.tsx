import { useMemo } from 'react';
import { getScoreColor, getScoreBgColor } from '../utils/investmentScoring';

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
        return { diameter: 64, fontSize: 'text-xl', radius: 28, strokeWidth: 4 };
      case 'lg':
        return { diameter: 120, fontSize: 'text-5xl', radius: 55, strokeWidth: 3 };
      default:
        return { diameter: 88, fontSize: 'text-3xl', radius: 40, strokeWidth: 4 };
    }
  }, [size]);

  const scoreColor = useMemo(() => getScoreColor(score), [score]);
  const scoreBg = useMemo(() => getScoreBgColor(score), [score]);

  const circumference = 2 * Math.PI * sizeConfig.radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  // Determine risk level
  const getRiskLevel = (s: number) => {
    if (s >= 85) return { label: 'Excellent', color: 'text-green-700' };
    if (s >= 70) return { label: 'Very Good', color: 'text-green-600' };
    if (s >= 60) return { label: 'Good', color: 'text-blue-600' };
    if (s >= 50) return { label: 'Moderate', color: 'text-yellow-600' };
    return { label: 'High Risk', color: 'text-red-600' };
  };

  const risk = getRiskLevel(score);

  return (
    <div className={`flex flex-col items-center gap-4 ${compact ? 'gap-2' : ''}`}>
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
            className="text-gray-200"
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
          {size !== 'sm' && <div className="text-xs text-gray-500 font-medium">/100</div>}
        </div>
      </div>

      {/* Risk Level */}
      {!compact && (
        <div className="text-center">
          <div className={`text-sm font-semibold ${risk.color}`}>{risk.label}</div>
        </div>
      )}

      {/* Breakdown Components */}
      {showBreakdown && !compact && (
        <div className={`w-full space-y-2 p-3 rounded-lg ${scoreBg} border border-gray-200`}>
          <div className="text-xs font-semibold text-gray-700 mb-2">Score Breakdown</div>

          {/* ROI Component */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="text-gray-600 w-12">ROI</span>
              <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 transition-all"
                  style={{ width: `${Math.min((roi_score / 5) * 100, 100)}%` }}
                />
              </div>
            </div>
            <span className="font-semibold text-gray-700 w-8 text-right">
              {Math.round((roi_score / 5) * 100)}%
            </span>
          </div>

          {/* Cash Flow Component */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="text-gray-600 w-12">Cash</span>
              <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all"
                  style={{ width: `${Math.min((cashflow_score / 3) * 100, 100)}%` }}
                />
              </div>
            </div>
            <span className="font-semibold text-gray-700 w-8 text-right">
              {Math.round((cashflow_score / 3) * 100)}%
            </span>
          </div>

          {/* Stability Component */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="text-gray-600 w-12">Stab</span>
              <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-500 transition-all"
                  style={{ width: `${Math.min((stability_score / 2) * 100, 100)}%` }}
                />
              </div>
            </div>
            <span className="font-semibold text-gray-700 w-8 text-right">
              {Math.round((stability_score / 2) * 100)}%
            </span>
          </div>

          {/* Location Component */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="text-gray-600 w-12">Loc</span>
              <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-500 transition-all"
                  style={{ width: `${Math.min(location_score * 100, 100)}%` }}
                />
              </div>
            </div>
            <span className="font-semibold text-gray-700 w-8 text-right">
              {Math.round(location_score * 100)}%
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
