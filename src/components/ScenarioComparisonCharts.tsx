import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import type { ProjectScenario } from '../types/portfolio';

interface ScenarioComparisonChartsProps {
  scenarios: ProjectScenario[];
  baselineScenario: ProjectScenario;
}

export function ScenarioComparisonCharts({
  scenarios,
  baselineScenario,
}: ScenarioComparisonChartsProps) {
  const allScenarios = [baselineScenario, ...scenarios];

  // ROI & Cash Flow Comparison
  const comparisonData = allScenarios.map(s => ({
    name: s.name,
    roi: (s.results.roi || 0).toFixed(1),
    cashFlow: s.results.avgCashFlow || 0,
    breakEven: s.results.breakEvenMonths || 0,
  }));

  // Timeline projection (simplified 10-year projection)
  const generateTimelineData = () => {
    return allScenarios.map(scenario => ({
      name: scenario.name,
      months: Array.from({ length: 121 }, (_, i) => {
        const monthlyRate = (scenario.results.roi || 0) / 12 / 100;
        return (scenario.results.totalInvestment || 0) * (1 + monthlyRate) ** i;
      }),
    }));
  };

  // Dark theme colors - purple for baseline, then emerald, cyan, amber, rose
  const colors = ['#a855f7', '#10b981', '#06b6d4', '#f59e0b', '#f43f5e'];

  // Custom tooltip styles for dark theme
  const tooltipStyle = {
    backgroundColor: '#18181b',
    border: '1px solid #3f3f46',
    borderRadius: '8px',
    color: '#fff',
  };

  return (
    <div className="space-y-6">
      {/* ROI & Cash Flow Comparison */}
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">ROI & Cash Flow Comparison</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={comparisonData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} tick={{ fill: '#a1a1aa' }} />
            <YAxis yAxisId="left" tick={{ fill: '#a1a1aa' }} label={{ value: 'ROI %', angle: -90, position: 'insideLeft', fill: '#a1a1aa' }} />
            <YAxis yAxisId="right" orientation="right" tick={{ fill: '#a1a1aa' }} label={{ value: 'Monthly Cash Flow', angle: 90, position: 'insideRight', fill: '#a1a1aa' }} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ color: '#a1a1aa' }} />
            <Bar yAxisId="left" dataKey="roi" fill="#a855f7" name="ROI %" radius={[4, 4, 0, 0]} />
            <Bar yAxisId="right" dataKey="cashFlow" fill="#10b981" name="Monthly Cash Flow" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Break-Even Comparison */}
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Break-Even Timeline</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={comparisonData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} tick={{ fill: '#a1a1aa' }} />
            <YAxis tick={{ fill: '#a1a1aa' }} label={{ value: 'Months', angle: -90, position: 'insideLeft', fill: '#a1a1aa' }} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="breakEven" fill="#ef4444" name="Break-Even (months)" radius={[8, 8, 0, 0]}>
              {comparisonData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={colors[index % colors.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 10-Year Cash Flow Projection */}
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">10-Year Projection (First 12 Months)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={generateTimelineData()[0]?.months?.map((_, i) => ({
              month: i,
              ...allScenarios.reduce((acc, scenario, idx) => {
                const months = generateTimelineData()[idx]?.months || [];
                acc[scenario.name] = months[i] || 0;
                return acc;
              }, {} as Record<string, number>),
            })) || []}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
            <XAxis dataKey="month" tick={{ fill: '#a1a1aa' }} label={{ value: 'Month', position: 'insideBottom', offset: -5, fill: '#a1a1aa' }} />
            <YAxis tick={{ fill: '#a1a1aa' }} label={{ value: 'Investment Value', angle: -90, position: 'insideLeft', fill: '#a1a1aa' }} />
            <Tooltip contentStyle={tooltipStyle} formatter={(value: any) => `$${(value / 1000000).toFixed(2)}M`} />
            <Legend wrapperStyle={{ color: '#a1a1aa' }} />
            {allScenarios.map((scenario, idx) => (
              <Line
                key={scenario.id}
                type="monotone"
                dataKey={scenario.name}
                stroke={colors[idx % colors.length]}
                strokeWidth={2}
                dot={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Scenario Winners */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ScenarioWinnerCard
          title="Best ROI"
          winner={allScenarios.reduce((a, b) => (a.results.roi || 0) > (b.results.roi || 0) ? a : b)}
          metric={(s) => `${(s.results.roi || 0).toFixed(1)}%`}
          color="emerald"
        />
        <ScenarioWinnerCard
          title="Best Cash Flow"
          winner={allScenarios.reduce((a, b) => (a.results.avgCashFlow || 0) > (b.results.avgCashFlow || 0) ? a : b)}
          metric={(s) => formatCurrency(s.results.avgCashFlow || 0)}
          color="cyan"
        />
        <ScenarioWinnerCard
          title="Fastest Break-Even"
          winner={allScenarios.reduce((a, b) => (a.results.breakEvenMonths || 999) < (b.results.breakEvenMonths || 999) ? a : b)}
          metric={(s) => `${s.results.breakEvenMonths || 0} months`}
          color="amber"
        />
      </div>
    </div>
  );
}

function ScenarioWinnerCard({
  title,
  winner,
  metric,
  color,
}: {
  title: string;
  winner: ProjectScenario;
  metric: (s: ProjectScenario) => string;
  color: 'emerald' | 'cyan' | 'amber';
}) {
  const colorClasses = {
    emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
    cyan: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400',
    amber: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
  };

  return (
    <div className={`rounded-xl border p-4 ${colorClasses[color]}`}>
      <h4 className="text-sm font-semibold text-zinc-300 mb-2">{title}</h4>
      <div className="space-y-1">
        <div className="text-2xl font-bold">🏆</div>
        <div className="text-sm font-semibold text-white">{winner.name}</div>
        <div className={`text-xs ${colorClasses[color].split(' ').pop()}`}>{metric(winner)}</div>
      </div>
    </div>
  );
}

function formatCurrency(value: number) {
  if (value >= 1_000_000) return (value / 1_000_000).toFixed(1) + 'M';
  if (value >= 1_000) return (value / 1_000).toFixed(0) + 'K';
  return value.toFixed(0);
}
