import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';
import type { RiskFactor } from '../index';

interface Props {
  baseScore: number;
  factors: RiskFactor[];
}

export function SensitivityChart({ baseScore, factors }: Props) {
  // Calculate sensitivity - how much each factor could impact the overall score
  // Higher score = higher impact potential
  const sensitivityData = factors
    .map(factor => {
      const currentPercent = (factor.score / factor.maxScore) * 100;
      const potentialImprovement = factor.score; // If reduced to 0
      const potentialWorsen = factor.maxScore - factor.score; // If increased to max

      // Weight by max score to show relative impact
      const impactWeight = factor.maxScore / 15; // Normalize based on typical max

      return {
        name: factor.name,
        category: factor.category,
        improvement: Math.round(potentialImprovement * impactWeight * 0.5),
        worsen: Math.round(potentialWorsen * impactWeight * 0.5),
        current: factor.score,
        max: factor.maxScore,
      };
    })
    .sort((a, b) => (b.improvement + b.worsen) - (a.improvement + a.worsen))
    .slice(0, 10); // Top 10 most impactful

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = sensitivityData.find(d => d.name === label);
      return (
        <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-3 shadow-lg">
          <p className="text-white font-medium mb-2">{label}</p>
          <p className="text-xs text-zinc-500 mb-2">{data?.category}</p>
          <div className="space-y-1 text-sm">
            <p className="text-emerald-400">
              If improved: Risk -{data?.improvement} pts
            </p>
            <p className="text-red-400">
              If worsened: Risk +{data?.worsen} pts
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-white">Sensitivity Analysis</h3>
          <p className="text-xs text-zinc-500">Which factors have the biggest impact on your risk score?</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-zinc-500">Current Score</p>
          <p className={`text-2xl font-bold ${
            baseScore <= 30 ? 'text-emerald-400' : baseScore <= 60 ? 'text-amber-400' : 'text-red-400'
          }`}>
            {baseScore}
          </p>
        </div>
      </div>

      {/* Tornado Chart */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={sensitivityData}
            layout="vertical"
            margin={{ top: 20, right: 30, left: 100, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={true} vertical={false} />
            <XAxis
              type="number"
              tick={{ fill: '#9ca3af', fontSize: 11 }}
              domain={[-20, 20]}
              tickFormatter={(v) => v > 0 ? `+${v}` : `${v}`}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fill: '#9ca3af', fontSize: 11 }}
              width={90}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine x={0} stroke="#666" />
            <Bar dataKey="improvement" stackId="a" name="Potential Improvement">
              {sensitivityData.map((entry, index) => (
                <Cell key={`cell-improvement-${index}`} fill="#10b981" />
              ))}
            </Bar>
            <Bar dataKey="worsen" stackId="b" name="Potential Worsening">
              {sensitivityData.map((entry, index) => (
                <Cell key={`cell-worsen-${index}`} fill="#ef4444" />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-3 rounded bg-emerald-500" />
          <span className="text-xs text-zinc-400">Potential improvement (reduce risk)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-3 rounded bg-red-500" />
          <span className="text-xs text-zinc-400">Potential worsening (increase risk)</span>
        </div>
      </div>

      {/* Insights */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4">
          <h4 className="font-medium text-emerald-400 mb-2 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            Highest Impact Improvements
          </h4>
          <ul className="space-y-1">
            {sensitivityData.slice(0, 3).map((item, index) => (
              <li key={index} className="text-xs text-zinc-300 flex items-center gap-2">
                <span className="text-emerald-400">→</span>
                Improving {item.name.toLowerCase()} could reduce risk by {item.improvement} pts
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <h4 className="font-medium text-red-400 mb-2 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Biggest Risk Exposures
          </h4>
          <ul className="space-y-1">
            {sensitivityData
              .sort((a, b) => b.worsen - a.worsen)
              .slice(0, 3)
              .map((item, index) => (
                <li key={index} className="text-xs text-zinc-300 flex items-center gap-2">
                  <span className="text-red-400">→</span>
                  Worsening {item.name.toLowerCase()} could increase risk by {item.worsen} pts
                </li>
              ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default SensitivityChart;
