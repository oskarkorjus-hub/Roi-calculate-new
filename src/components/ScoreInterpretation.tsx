import { generateScoreInterpretation, getInvestmentRisk } from '../utils/investmentScoring';

interface ScoreInterpretationProps {
  score: number;
  roi_score?: number;
  cashflow_score?: number;
  stability_score?: number;
  location_score?: number;
  roi: number;
  breakEvenMonths: number;
  location: string;
  className?: string;
}

export function ScoreInterpretation({
  score,
  roi_score = 0,
  cashflow_score = 0,
  stability_score = 0,
  location_score = 0,
  roi,
  breakEvenMonths,
  location,
  className = '',
}: ScoreInterpretationProps) {
  const risk = getInvestmentRisk(score);
  const interpretation = generateScoreInterpretation(
    score,
    { roi_score, cashflow_score, stability_score, location_score, investmentScore: score },
    roi,
    breakEvenMonths,
    location
  );

  return (
    <div className={`${risk.bgColor} border border-gray-200 rounded-lg p-4 ${className}`}>
      {/* Score badge */}
      <div className="flex items-center gap-3 mb-3">
        <div className="flex-shrink-0">
          <div className={`text-2xl font-bold ${risk.color}`}>{Math.round(score)}</div>
          <div className="text-xs text-gray-600">/ 100</div>
        </div>
        <div>
          <div className={`text-sm font-bold ${risk.color} capitalize`}>
            {risk.level.replace(/-/g, ' ')}
          </div>
          <div className="text-xs text-gray-600">{risk.range}</div>
        </div>
      </div>

      {/* Interpretation text */}
      <div className="text-sm text-gray-700 leading-relaxed">
        {interpretation}
      </div>

      {/* Risk indicator bar */}
      <div className="mt-4 pt-4 border-t border-gray-300">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="font-semibold text-gray-700">Risk Profile</span>
          <span className={`font-semibold ${risk.color}`}>{risk.level.toUpperCase().replace(/-/g, ' ')}</span>
        </div>
        <div className="h-2 bg-gray-300 rounded-full overflow-hidden">
          <div
            className="h-full transition-all"
            style={{
              width: `${(score / 100) * 100}%`,
              backgroundColor: (() => {
                if (score >= 85) return '#10b981';
                if (score >= 70) return '#3b82f6';
                if (score >= 60) return '#eab308';
                if (score >= 50) return '#f97316';
                return '#ef4444';
              })(),
            }}
          />
        </div>
      </div>

      {/* Key metrics summary */}
      <div className="mt-4 grid grid-cols-2 gap-3 pt-4 border-t border-gray-300">
        <div className="text-center">
          <div className="text-xs text-gray-600">ROI Impact</div>
          <div className={`text-sm font-bold ${score >= 70 ? 'text-green-600' : 'text-orange-600'}`}>
            {Math.round((roi_score / 5) * 100)}%
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs text-gray-600">Cash Flow</div>
          <div className={`text-sm font-bold ${score >= 70 ? 'text-green-600' : 'text-orange-600'}`}>
            {Math.round((cashflow_score / 3) * 100)}%
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs text-gray-600">Stability</div>
          <div className={`text-sm font-bold ${breakEvenMonths <= 24 ? 'text-green-600' : 'text-orange-600'}`}>
            {breakEvenMonths}m
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs text-gray-600">Location</div>
          <div className={`text-sm font-bold ${location_score >= 0.67 ? 'text-green-600' : 'text-orange-600'}`}>
            {location_score >= 0.8 ? 'Premium' : location_score >= 0.67 ? 'Mid' : 'Other'}
          </div>
        </div>
      </div>
    </div>
  );
}
