interface Props {
  score: number;
  investorProfile: string;
  benchmark: number;
  propertyType: string;
  categoryScores: {
    financial: number;
    market: number;
    regulatory: number;
    property: number;
  };
}

export function RiskScorePanel({ score, investorProfile, benchmark, propertyType, categoryScores }: Props) {
  const getRiskColor = (s: number) => {
    if (s <= 30) return { text: 'text-emerald-400', bg: 'bg-emerald-500', ring: 'ring-emerald-500/30' };
    if (s <= 60) return { text: 'text-amber-400', bg: 'bg-amber-500', ring: 'ring-amber-500/30' };
    return { text: 'text-red-400', bg: 'bg-red-500', ring: 'ring-red-500/30' };
  };

  const getRiskLabel = (s: number) => {
    if (s <= 30) return 'Low Risk';
    if (s <= 60) return 'Moderate Risk';
    return 'High Risk';
  };

  const colors = getRiskColor(score);
  const riskDiff = score - benchmark;

  // Calculate gauge rotation (0-100 maps to -90deg to 90deg)
  const gaugeRotation = (score / 100) * 180 - 90;

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 mb-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Score Display */}
        <div className="lg:col-span-1 flex flex-col items-center justify-center">
          <div className={`relative w-48 h-24 overflow-hidden`}>
            {/* Gauge Background */}
            <div className="absolute bottom-0 left-0 right-0 h-24">
              <svg viewBox="0 0 200 100" className="w-full h-full">
                {/* Background arc */}
                <path
                  d="M 20 100 A 80 80 0 0 1 180 100"
                  fill="none"
                  stroke="#3f3f46"
                  strokeWidth="12"
                  strokeLinecap="round"
                />
                {/* Green zone (0-30) */}
                <path
                  d="M 20 100 A 80 80 0 0 1 56 35"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="12"
                  strokeLinecap="round"
                />
                {/* Yellow zone (30-60) */}
                <path
                  d="M 56 35 A 80 80 0 0 1 144 35"
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="12"
                  strokeLinecap="round"
                />
                {/* Red zone (60-100) */}
                <path
                  d="M 144 35 A 80 80 0 0 1 180 100"
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="12"
                  strokeLinecap="round"
                />
                {/* Needle */}
                <line
                  x1="100"
                  y1="100"
                  x2="100"
                  y2="30"
                  stroke="white"
                  strokeWidth="3"
                  strokeLinecap="round"
                  transform={`rotate(${gaugeRotation}, 100, 100)`}
                />
                {/* Center circle */}
                <circle cx="100" cy="100" r="8" fill="white" />
              </svg>
            </div>
          </div>

          <div className="text-center mt-4">
            <p className={`text-5xl font-bold ${colors.text}`}>{score}</p>
            <p className="text-xs text-zinc-500 uppercase tracking-wider mt-1">out of 100</p>
            <div className={`mt-3 px-4 py-1.5 rounded-full ${colors.bg}/20 ${colors.text} text-sm font-bold inline-block`}>
              {getRiskLabel(score)}
            </div>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="lg:col-span-1 space-y-3">
          <h4 className="text-sm font-medium text-zinc-400 mb-4">Risk by Category</h4>

          <CategoryBar label="Financial Risk" score={categoryScores.financial} weight="40%" color="cyan" />
          <CategoryBar label="Market Risk" score={categoryScores.market} weight="30%" color="purple" />
          <CategoryBar label="Regulatory Risk" score={categoryScores.regulatory} weight="15%" color="amber" />
          <CategoryBar label="Property Risk" score={categoryScores.property} weight="15%" color="pink" />
        </div>

        {/* Summary Info */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-zinc-800/50 rounded-lg p-4">
            <p className="text-xs text-zinc-500 uppercase mb-1">Investor Profile</p>
            <p className="text-sm font-medium text-white">{investorProfile}</p>
          </div>

          <div className="bg-zinc-800/50 rounded-lg p-4">
            <p className="text-xs text-zinc-500 uppercase mb-1">vs Market Benchmark</p>
            <div className="flex items-center gap-2">
              <span className={`text-lg font-bold ${riskDiff > 0 ? 'text-red-400' : riskDiff < 0 ? 'text-emerald-400' : 'text-zinc-400'}`}>
                {riskDiff > 0 ? '+' : ''}{riskDiff}
              </span>
              <span className="text-xs text-zinc-400">
                {riskDiff > 0 ? 'riskier' : riskDiff < 0 ? 'safer' : 'same as'} typical {propertyType}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="bg-emerald-500/10 rounded-lg p-2 text-center">
              <p className="text-[10px] text-emerald-400 uppercase">Low</p>
              <p className="text-xs text-zinc-400">0-30</p>
            </div>
            <div className="bg-amber-500/10 rounded-lg p-2 text-center">
              <p className="text-[10px] text-amber-400 uppercase">Moderate</p>
              <p className="text-xs text-zinc-400">30-60</p>
            </div>
            <div className="bg-red-500/10 rounded-lg p-2 text-center">
              <p className="text-[10px] text-red-400 uppercase">High</p>
              <p className="text-xs text-zinc-400">60-100</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CategoryBar({ label, score, weight, color }: {
  label: string;
  score: number;
  weight: string;
  color: 'cyan' | 'purple' | 'amber' | 'pink';
}) {
  const colorClasses = {
    cyan: { bar: 'bg-cyan-500', text: 'text-cyan-400' },
    purple: { bar: 'bg-purple-500', text: 'text-purple-400' },
    amber: { bar: 'bg-amber-500', text: 'text-amber-400' },
    pink: { bar: 'bg-pink-500', text: 'text-pink-400' },
  };

  const getBarColor = (s: number) => {
    if (s <= 30) return 'bg-emerald-500';
    if (s <= 60) return 'bg-amber-500';
    return 'bg-red-500';
  };

  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-zinc-300">{label}</span>
        <span className="text-zinc-500">{weight}</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className={`h-full ${getBarColor(score)} transition-all duration-500`}
            style={{ width: `${score}%` }}
          />
        </div>
        <span className={`text-xs font-bold w-8 text-right ${
          score <= 30 ? 'text-emerald-400' : score <= 60 ? 'text-amber-400' : 'text-red-400'
        }`}>
          {score}
        </span>
      </div>
    </div>
  );
}

export default RiskScorePanel;
