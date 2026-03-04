import { useState } from 'react';
import { useInvestmentScore, type ScoreInput } from '../../hooks/useInvestmentScore';

interface InvestmentScoreProps {
  input: ScoreInput;
  size?: 'sm' | 'md' | 'lg';
  showBreakdown?: boolean;
  showTooltip?: boolean;
}

export function InvestmentScore({
  input,
  size = 'md',
  showBreakdown = true,
  showTooltip = true,
}: InvestmentScoreProps) {
  const { overallScore, breakdown, scoreLabel, scoreColor, bgColor, description } =
    useInvestmentScore(input);
  const [showDetails, setShowDetails] = useState(false);

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
  };

  const textSizes = {
    sm: 'text-xl',
    md: 'text-3xl',
    lg: 'text-5xl',
  };

  const strokeWidth = {
    sm: 8,
    md: 6,
    lg: 4,
  };

  const radius = {
    sm: 30,
    md: 45,
    lg: 60,
  };

  const circumference = 2 * Math.PI * radius[size];
  const strokeDashoffset = circumference - (overallScore / 100) * circumference;

  return (
    <div className="space-y-3">
      {/* Score Circle */}
      <div className="flex flex-col items-center gap-2">
        <div className={`relative ${sizeClasses[size]}`}>
          <svg
            className="transform -rotate-90 drop-shadow-sm"
            width={size === 'sm' ? 64 : size === 'md' ? 96 : 128}
            height={size === 'sm' ? 64 : size === 'md' ? 96 : 128}
            viewBox={`0 0 ${size === 'sm' ? 64 : size === 'md' ? 96 : 128} ${size === 'sm' ? 64 : size === 'md' ? 96 : 128}`}
          >
            {/* Background circle */}
            <circle
              cx={size === 'sm' ? 32 : size === 'md' ? 48 : 64}
              cy={size === 'sm' ? 32 : size === 'md' ? 48 : 64}
              r={radius[size]}
              fill="none"
              stroke="currentColor"
              strokeWidth={strokeWidth[size]}
              className="text-gray-200"
            />
            {/* Progress circle */}
            <circle
              cx={size === 'sm' ? 32 : size === 'md' ? 48 : 64}
              cy={size === 'sm' ? 32 : size === 'md' ? 48 : 64}
              r={radius[size]}
              fill="none"
              stroke="currentColor"
              strokeWidth={strokeWidth[size]}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className={`transition-all duration-500 ${scoreColor}`}
            />
          </svg>

          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
            <div className={`font-bold ${textSizes[size]} ${scoreColor}`}>
              {overallScore}
            </div>
            {size !== 'sm' && <div className="text-xs text-gray-600 font-medium">/100</div>}
          </div>
        </div>

        {/* Label and description */}
        <div className="text-center">
          <div className={`font-semibold text-sm ${scoreColor}`}>{scoreLabel}</div>
          {showTooltip && (
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-xs text-indigo-600 hover:text-indigo-700 underline mt-1"
            >
              Why {overallScore}?
            </button>
          )}
        </div>
      </div>

      {/* Expanded Details */}
      {showDetails && (
        <div className={`p-3 rounded-lg ${bgColor} border border-gray-200 space-y-2`}>
          <p className="text-xs font-medium text-gray-700">{description}</p>

          {showBreakdown && (
            <div className="space-y-2 pt-2 border-t border-gray-300">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-700">ROI (40%)</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 transition-all"
                      style={{ width: `${breakdown.roi}%` }}
                    />
                  </div>
                  <span className="font-semibold text-gray-800 w-6">{breakdown.roi}</span>
                </div>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-700">Cash Flow (30%)</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 transition-all"
                      style={{ width: `${breakdown.cashFlowStability}%` }}
                    />
                  </div>
                  <span className="font-semibold text-gray-800 w-6">{breakdown.cashFlowStability}</span>
                </div>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-700">Break-Even (20%)</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-500 transition-all"
                      style={{ width: `${breakdown.breakEvenTimeline}%` }}
                    />
                  </div>
                  <span className="font-semibold text-gray-800 w-6">{breakdown.breakEvenTimeline}</span>
                </div>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-700">Risk (10%)</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-500 transition-all"
                      style={{ width: `${breakdown.riskScore}%` }}
                    />
                  </div>
                  <span className="font-semibold text-gray-800 w-6">{breakdown.riskScore}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
