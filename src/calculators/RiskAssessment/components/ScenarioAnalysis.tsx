import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { formatCurrency } from '../../../utils/numberParsing';
import type { ScenarioResult } from '../index';

interface Props {
  scenarios: ScenarioResult[];
  symbol: string;
  currency: 'IDR' | 'USD' | 'AUD' | 'EUR' | 'GBP';
}

const scenarioColors: Record<string, { bg: string; border: string; text: string; bar: string }> = {
  'Best Case': { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', bar: '#10b981' },
  'Base Case': { bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', text: 'text-cyan-400', bar: '#06b6d4' },
  'Worst Case': { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400', bar: '#ef4444' },
};

export function ScenarioAnalysis({ scenarios, symbol, currency }: Props) {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const scenario = scenarios.find(s => s.name === label);
      return (
        <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-3 shadow-lg">
          <p className="text-white font-medium mb-2">{label}</p>
          <div className="space-y-1 text-sm">
            <p className="text-zinc-400">
              ROI: <span className="text-white">{scenario?.roi.toFixed(1)}%</span>
            </p>
            <p className="text-zinc-400">
              Risk Score: <span className="text-white">{scenario?.riskScore}</span>
            </p>
            <p className="text-zinc-400">
              Cash Flow: <span className="text-white">{symbol} {formatCurrency(scenario?.cashFlow || 0, currency)}</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  const roiData = scenarios.map(s => ({
    name: s.name,
    value: s.roi,
    color: scenarioColors[s.name]?.bar || '#3b82f6',
  }));

  const riskData = scenarios.map(s => ({
    name: s.name,
    value: s.riskScore,
    color: scenarioColors[s.name]?.bar || '#3b82f6',
  }));

  return (
    <div className="space-y-6">
      {/* Scenario Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {scenarios.map((scenario, index) => {
          const colors = scenarioColors[scenario.name] || scenarioColors['Base Case'];
          const isBase = scenario.name === 'Base Case';

          return (
            <div
              key={index}
              className={`rounded-xl border ${colors.border} ${colors.bg} p-6 ${isBase ? 'ring-2 ring-cyan-500/50' : ''}`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg font-bold ${colors.text}`}>{scenario.name}</h3>
                {isBase && (
                  <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-400 text-[10px] font-bold rounded-full uppercase">
                    Current
                  </span>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-[10px] text-zinc-500 uppercase mb-1">Expected ROI</p>
                  <p className={`text-3xl font-bold ${scenario.roi >= 15 ? 'text-emerald-400' : scenario.roi >= 8 ? 'text-amber-400' : 'text-red-400'}`}>
                    {scenario.roi.toFixed(1)}%
                  </p>
                </div>

                <div>
                  <p className="text-[10px] text-zinc-500 uppercase mb-1">Risk Score</p>
                  <div className="flex items-center gap-2">
                    <p className={`text-2xl font-bold ${
                      scenario.riskScore <= 30 ? 'text-emerald-400' :
                      scenario.riskScore <= 60 ? 'text-amber-400' : 'text-red-400'
                    }`}>
                      {scenario.riskScore}
                    </p>
                    <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          scenario.riskScore <= 30 ? 'bg-emerald-500' :
                          scenario.riskScore <= 60 ? 'bg-amber-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${scenario.riskScore}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-[10px] text-zinc-500 uppercase mb-1">Annual Cash Flow</p>
                  <p className="text-xl font-bold text-white">
                    {symbol} {formatCurrency(scenario.cashFlow, currency)}
                  </p>
                </div>

                <p className="text-xs text-zinc-400 pt-2 border-t border-zinc-700">
                  {scenario.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Comparison Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ROI Comparison */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
          <h4 className="text-sm font-medium text-zinc-300 mb-4">ROI by Scenario</h4>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={roiData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {roiData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Score Comparison */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
          <h4 className="text-sm font-medium text-zinc-300 mb-4">Risk Score by Scenario</h4>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={riskData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} domain={[0, 100]} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {riskData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Scenario Assumptions */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
        <h4 className="text-sm font-medium text-zinc-300 mb-4">Scenario Assumptions</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-4">
            <h5 className="font-medium text-emerald-400 mb-2">Best Case</h5>
            <ul className="text-xs text-zinc-400 space-y-1">
              <li>• Market appreciation +20%</li>
              <li>• Occupancy increases to 80%+</li>
              <li>• Rental rates increase 15%</li>
              <li>• No unexpected expenses</li>
              <li>• Favorable regulatory changes</li>
            </ul>
          </div>
          <div className="bg-cyan-500/5 border border-cyan-500/20 rounded-lg p-4">
            <h5 className="font-medium text-cyan-400 mb-2">Base Case</h5>
            <ul className="text-xs text-zinc-400 space-y-1">
              <li>• Current market conditions persist</li>
              <li>• Occupancy remains stable</li>
              <li>• Normal maintenance costs</li>
              <li>• No major regulatory changes</li>
              <li>• Inflation-adjusted growth</li>
            </ul>
          </div>
          <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-4">
            <h5 className="font-medium text-red-400 mb-2">Worst Case</h5>
            <ul className="text-xs text-zinc-400 space-y-1">
              <li>• Occupancy drops 30%</li>
              <li>• Market softens 15%</li>
              <li>• Major repairs needed</li>
              <li>• STR restrictions implemented</li>
              <li>• Financing costs increase</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ScenarioAnalysis;
