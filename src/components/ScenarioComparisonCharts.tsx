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

  const colors = ['#4f46e5', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

  return (
    <div className="space-y-6">
      {/* ROI & Cash Flow Comparison */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">ROI & Cash Flow Comparison</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={comparisonData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
            <YAxis yAxisId="left" label={{ value: 'ROI %', angle: -90, position: 'insideLeft' }} />
            <YAxis yAxisId="right" orientation="right" label={{ value: 'Monthly Cash Flow', angle: 90, position: 'insideRight' }} />
            <Tooltip />
            <Legend />
            <Bar yAxisId="left" dataKey="roi" fill="#4f46e5" name="ROI %" />
            <Bar yAxisId="right" dataKey="cashFlow" fill="#10b981" name="Monthly Cash Flow" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Break-Even Comparison */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Break-Even Timeline</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={comparisonData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
            <YAxis label={{ value: 'Months', angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Bar dataKey="breakEven" fill="#ef4444" name="Break-Even (months)" radius={[8, 8, 0, 0]}>
              {comparisonData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={index === 0 ? '#6366f1' : colors[index % colors.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 10-Year Cash Flow Projection */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">10-Year Projection (First 12 Months)</h3>
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
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" label={{ value: 'Month', position: 'insideBottom', offset: -5 }} />
            <YAxis label={{ value: 'Investment Value', angle: -90, position: 'insideLeft' }} />
            <Tooltip formatter={(value: any) => `$${(value / 1000000).toFixed(2)}M`} />
            <Legend />
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
        />
        <ScenarioWinnerCard
          title="Best Cash Flow"
          winner={allScenarios.reduce((a, b) => (a.results.avgCashFlow || 0) > (b.results.avgCashFlow || 0) ? a : b)}
          metric={(s) => formatCurrency(s.results.avgCashFlow || 0)}
        />
        <ScenarioWinnerCard
          title="Fastest Break-Even"
          winner={allScenarios.reduce((a, b) => (a.results.breakEvenMonths || 999) < (b.results.breakEvenMonths || 999) ? a : b)}
          metric={(s) => `${s.results.breakEvenMonths || 0} months`}
        />
      </div>
    </div>
  );
}

function ScenarioWinnerCard({
  title,
  winner,
  metric,
}: {
  title: string;
  winner: ProjectScenario;
  metric: (s: ProjectScenario) => string;
}) {
  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200 p-4">
      <h4 className="text-sm font-semibold text-gray-900 mb-2">{title}</h4>
      <div className="space-y-1">
        <div className="text-2xl font-bold text-green-600">🏆</div>
        <div className="text-sm font-semibold text-gray-900">{winner.name}</div>
        <div className="text-xs text-gray-600">{metric(winner)}</div>
      </div>
    </div>
  );
}

function formatCurrency(value: number) {
  if (value >= 1_000_000) return (value / 1_000_000).toFixed(1) + 'M';
  if (value >= 1_000) return (value / 1_000).toFixed(0) + 'K';
  return value.toFixed(0);
}
