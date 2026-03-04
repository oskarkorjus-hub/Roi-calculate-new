import type { RiskFactor } from '../index';

interface Props {
  factors: RiskFactor[];
}

const categoryColors: Record<string, { bg: string; border: string; text: string; icon: string }> = {
  'Financial': { bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', text: 'text-cyan-400', icon: '💰' },
  'Market': { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400', icon: '📊' },
  'Regulatory': { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400', icon: '⚖️' },
  'Property': { bg: 'bg-pink-500/10', border: 'border-pink-500/30', text: 'text-pink-400', icon: '🏠' },
};

export function RiskBreakdown({ factors }: Props) {
  // Group factors by category
  const groupedFactors = factors.reduce((acc, factor) => {
    if (!acc[factor.category]) {
      acc[factor.category] = [];
    }
    acc[factor.category].push(factor);
    return acc;
  }, {} as Record<string, RiskFactor[]>);

  // Sort factors by score (highest risk first) within each category
  Object.keys(groupedFactors).forEach(category => {
    groupedFactors[category].sort((a, b) => (b.score / b.maxScore) - (a.score / a.maxScore));
  });

  // Get top risk factors across all categories
  const topRisks = [...factors]
    .sort((a, b) => (b.score / b.maxScore) - (a.score / a.maxScore))
    .slice(0, 5);

  const getImpactColor = (impact: string) => {
    if (impact === 'high') return 'bg-red-500 text-white';
    if (impact === 'moderate') return 'bg-amber-500 text-black';
    return 'bg-emerald-500 text-white';
  };

  const getScoreColor = (score: number, maxScore: number) => {
    const percent = (score / maxScore) * 100;
    if (percent <= 30) return 'text-emerald-400';
    if (percent <= 60) return 'text-amber-400';
    return 'text-red-400';
  };

  return (
    <div className="space-y-6">
      {/* Top Risk Factors */}
      <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-6">
        <h3 className="text-lg font-bold text-red-400 mb-4 flex items-center gap-2">
          <span>⚠️</span> Top Risk Factors
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          {topRisks.map((factor, index) => (
            <div
              key={index}
              className="bg-zinc-800/50 rounded-lg p-3 border border-zinc-700"
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${getImpactColor(factor.impact)}`}>
                  {factor.impact}
                </span>
                <span className={`text-sm font-bold ${getScoreColor(factor.score, factor.maxScore)}`}>
                  {factor.score}/{factor.maxScore}
                </span>
              </div>
              <p className="text-sm font-medium text-white">{factor.name}</p>
              <p className="text-[10px] text-zinc-500">{factor.category}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Risk Factors by Category */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(groupedFactors).map(([category, categoryFactors]) => {
          const colors = categoryColors[category] || categoryColors['Financial'];
          const categoryTotal = categoryFactors.reduce((sum, f) => sum + f.score, 0);
          const categoryMax = categoryFactors.reduce((sum, f) => sum + f.maxScore, 0);
          const categoryPercent = Math.round((categoryTotal / categoryMax) * 100);

          return (
            <div
              key={category}
              className={`rounded-xl border ${colors.border} ${colors.bg} p-6`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg font-bold ${colors.text} flex items-center gap-2`}>
                  <span>{colors.icon}</span> {category} Risk
                </h3>
                <div className="text-right">
                  <p className={`text-2xl font-bold ${
                    categoryPercent <= 30 ? 'text-emerald-400' :
                    categoryPercent <= 60 ? 'text-amber-400' : 'text-red-400'
                  }`}>
                    {categoryPercent}%
                  </p>
                  <p className="text-[10px] text-zinc-500">{categoryTotal}/{categoryMax} points</p>
                </div>
              </div>

              <div className="space-y-3">
                {categoryFactors.map((factor, index) => {
                  const percent = (factor.score / factor.maxScore) * 100;
                  return (
                    <div key={index} className="bg-zinc-800/50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-white">{factor.name}</span>
                        <span className={`text-xs font-bold ${getScoreColor(factor.score, factor.maxScore)}`}>
                          {factor.score}/{factor.maxScore}
                        </span>
                      </div>
                      <div className="h-1.5 bg-zinc-700 rounded-full overflow-hidden mb-1">
                        <div
                          className={`h-full ${
                            percent <= 30 ? 'bg-emerald-500' :
                            percent <= 60 ? 'bg-amber-500' : 'bg-red-500'
                          } transition-all`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-zinc-500">{factor.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Risk Heat Map */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
        <h3 className="text-lg font-bold text-white mb-4">Risk Heat Map</h3>
        <div className="grid grid-cols-5 gap-1">
          {factors.map((factor, index) => {
            const percent = (factor.score / factor.maxScore) * 100;
            const colors = categoryColors[factor.category];
            return (
              <div
                key={index}
                className={`aspect-square rounded-lg flex flex-col items-center justify-center p-2 cursor-pointer transition-transform hover:scale-105 ${
                  percent <= 30 ? 'bg-emerald-500/80' :
                  percent <= 60 ? 'bg-amber-500/80' : 'bg-red-500/80'
                }`}
                title={`${factor.name}: ${factor.score}/${factor.maxScore}`}
              >
                <span className="text-[10px] font-bold text-white text-center leading-tight">
                  {factor.name.split(' ').slice(0, 2).join(' ')}
                </span>
                <span className="text-xs text-white/80 mt-1">{percent.toFixed(0)}%</span>
              </div>
            );
          })}
        </div>
        <div className="flex justify-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-emerald-500" />
            <span className="text-xs text-zinc-400">Low (0-30%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-amber-500" />
            <span className="text-xs text-zinc-400">Moderate (30-60%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-red-500" />
            <span className="text-xs text-zinc-400">High (60-100%)</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RiskBreakdown;
