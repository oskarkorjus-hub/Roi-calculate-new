import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { PortfolioProject } from '../types/portfolio';

interface PortfolioChartsProps {
  projects: PortfolioProject[];
}

// Custom tooltip for dark theme
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 shadow-lg">
        <p className="text-zinc-300 text-sm font-medium">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-emerald-400 text-sm">
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function PortfolioCharts({ projects }: PortfolioChartsProps) {
  // Define calculator categories for filtering
  // Investment calculators have ROI, cash flow, score, break-even
  const investmentCalculators = [
    'rental-roi', 'xirr', 'cap-rate', 'irr', 'dev-feasibility',
    'rental-projection', 'cashflow'
  ];

  // Calculators with meaningful cash flow
  const cashFlowCalculators = [
    'rental-roi', 'xirr', 'cap-rate', 'irr', 'dev-feasibility',
    'rental-projection', 'cashflow'
  ];

  // Calculators with investment scores
  const scoredCalculators = [
    'rental-roi', 'xirr', 'cap-rate', 'irr', 'dev-feasibility',
    'rental-projection', 'cashflow'
  ];

  // Filter projects by calculator type
  const investmentProjects = useMemo(() =>
    projects.filter(p => investmentCalculators.includes(p.calculatorId)),
    [projects]
  );

  const cashFlowProjects = useMemo(() =>
    projects.filter(p => cashFlowCalculators.includes(p.calculatorId) && (p.avgCashFlow || 0) > 0),
    [projects]
  );

  const scoredProjects = useMemo(() =>
    projects.filter(p => scoredCalculators.includes(p.calculatorId) && (p.investmentScore || 0) > 0),
    [projects]
  );

  // Chart 1: ROI Distribution (Histogram) - Only investment calculators
  const roiDistribution = useMemo(() => {
    const bins = [
      { range: '<10%', min: 0, max: 10, count: 0 },
      { range: '10-20%', min: 10, max: 20, count: 0 },
      { range: '20-30%', min: 20, max: 30, count: 0 },
      { range: '30-40%', min: 30, max: 40, count: 0 },
      { range: '40%+', min: 40, max: Infinity, count: 0 },
    ];

    investmentProjects.forEach(p => {
      const roi = Number(p.roi) || 0;
      if (roi > 0) {
        const bin = bins.find(b => roi >= b.min && roi < b.max);
        if (bin) bin.count++;
      }
    });

    return bins.filter(b => b.count > 0);
  }, [investmentProjects]);

  // Chart 2: Cash Flow by Project - Only cash flow calculators with positive cash flow
  const cashFlowData = useMemo(() => {
    return cashFlowProjects
      .sort((a, b) => (b.avgCashFlow || 0) - (a.avgCashFlow || 0))
      .slice(0, 10)
      .map(p => ({
        name: p.projectName.length > 15 ? p.projectName.slice(0, 12) + '...' : p.projectName,
        cashFlow: Number(p.avgCashFlow) || 0,
      }));
  }, [cashFlowProjects]);

  // Chart 3: Investment Breakdown by Strategy - Only investment calculators
  const strategyBreakdown = useMemo(() => {
    const breakdown: Record<string, number> = {
      'Flip': 0,
      'Hold': 0,
      'Rental': 0,
      'Development': 0,
      'Unknown': 0,
    };

    investmentProjects.forEach(p => {
      const key = p.strategy ? p.strategy.charAt(0).toUpperCase() + p.strategy.slice(1) : 'Unknown';
      breakdown[key] = (breakdown[key] || 0) + (Number(p.totalInvestment) || 0);
    });

    return Object.entries(breakdown)
      .filter(([, value]) => value > 0)
      .map(([name, value]) => ({
        name,
        value: Math.round(value / 1_000_000 * 10) / 10, // Convert to millions
      }));
  }, [investmentProjects]);

  // Chart 4: Score vs ROI Scatter - Only scored calculators
  const scoreVsROI = useMemo(() => {
    return scoredProjects
      .map(p => ({
        name: p.projectName,
        score: p.investmentScore,
        roi: Number(p.roi) || 0,
      }))
      .filter(p => p.score > 0 && p.roi > 0);
  }, [scoredProjects]);

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

  if (projects.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white">Portfolio Analytics</h2>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ROI Distribution */}
        {roiDistribution.length > 0 && (
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-4">
            <h3 className="font-semibold text-white mb-4">ROI Distribution</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={roiDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
                <XAxis dataKey="range" stroke="#a1a1aa" fontSize={12} />
                <YAxis stroke="#a1a1aa" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Cash Flow by Project */}
        {cashFlowData.length > 0 && (
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-4">
            <h3 className="font-semibold text-white mb-4">Top Cash Flow Projects</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={cashFlowData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
                <XAxis type="number" stroke="#a1a1aa" fontSize={12} />
                <YAxis dataKey="name" type="category" width={100} fontSize={12} stroke="#a1a1aa" />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="cashFlow" fill="#10b981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Investment Breakdown by Strategy */}
        {strategyBreakdown.length > 0 && (
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-4">
            <h3 className="font-semibold text-white mb-4">Investment by Strategy</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={strategyBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name} ($${value}M)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  stroke="#18181b"
                  strokeWidth={2}
                >
                  {strategyBreakdown.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => `$${value}M`}
                  contentStyle={{
                    backgroundColor: '#27272a',
                    border: '1px solid #3f3f46',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: '#a1a1aa' }}
                  itemStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Score vs ROI Scatter */}
        {scoreVsROI.length > 0 && (
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-4">
            <h3 className="font-semibold text-white mb-4">Score vs ROI Analysis</h3>
            <ResponsiveContainer width="100%" height={250}>
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
                <XAxis dataKey="score" name="Score" type="number" stroke="#a1a1aa" fontSize={12} />
                <YAxis dataKey="roi" name="ROI %" type="number" stroke="#a1a1aa" fontSize={12} />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3', stroke: '#71717a' }}
                  contentStyle={{
                    backgroundColor: '#27272a',
                    border: '1px solid #3f3f46',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: '#a1a1aa' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Scatter name="Projects" data={scoreVsROI} fill="#8b5cf6" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Additional insights - Only show if there are relevant projects */}
      {scoredProjects.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Score distribution - Only scored calculators */}
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-4">
            <h4 className="font-semibold text-white mb-3">Score Distribution</h4>
            <div className="space-y-2 text-sm">
              {(() => {
                const excellent = scoredProjects.filter(p => p.investmentScore >= 85).length;
                const veryGood = scoredProjects.filter(p => p.investmentScore >= 70 && p.investmentScore < 85).length;
                const good = scoredProjects.filter(p => p.investmentScore >= 60 && p.investmentScore < 70).length;
                const moderate = scoredProjects.filter(p => p.investmentScore >= 50 && p.investmentScore < 60).length;
                const highRisk = scoredProjects.filter(p => p.investmentScore < 50).length;

                return (
                  <>
                    {excellent > 0 && (
                      <div className="flex justify-between">
                        <span className="text-zinc-400">Excellent (85+)</span>
                        <span className="font-bold text-emerald-400">{excellent}</span>
                      </div>
                    )}
                    {veryGood > 0 && (
                      <div className="flex justify-between">
                        <span className="text-zinc-400">Very Good (70-84)</span>
                        <span className="font-bold text-blue-400">{veryGood}</span>
                      </div>
                    )}
                    {good > 0 && (
                      <div className="flex justify-between">
                        <span className="text-zinc-400">Good (60-69)</span>
                        <span className="font-bold text-yellow-400">{good}</span>
                      </div>
                    )}
                    {moderate > 0 && (
                      <div className="flex justify-between">
                        <span className="text-zinc-400">Moderate (50-59)</span>
                        <span className="font-bold text-orange-400">{moderate}</span>
                      </div>
                    )}
                    {highRisk > 0 && (
                      <div className="flex justify-between">
                        <span className="text-zinc-400">High Risk (&lt;50)</span>
                        <span className="font-bold text-red-400">{highRisk}</span>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          </div>

          {/* ROI Statistics - Only investment calculators */}
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-4">
            <h4 className="font-semibold text-white mb-3">ROI Statistics</h4>
            <div className="space-y-2 text-sm">
              {(() => {
                const rois = investmentProjects.map(p => Number(p.roi) || 0).filter(r => r > 0);
                const avgROI = rois.length > 0 ? rois.reduce((a, b) => a + b, 0) / rois.length : 0;
                const maxROI = rois.length > 0 ? Math.max(...rois) : 0;
                const minROI = rois.length > 0 ? Math.min(...rois) : 0;

                if (rois.length === 0) {
                  return (
                    <div className="text-zinc-500 text-center py-2">
                      No ROI data available
                    </div>
                  );
                }

                return (
                  <>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Average ROI</span>
                      <span className="font-bold text-white">{avgROI.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Max ROI</span>
                      <span className="font-bold text-emerald-400">{maxROI.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Min ROI</span>
                      <span className="font-bold text-orange-400">{minROI.toFixed(1)}%</span>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>

          {/* Break-Even Statistics - Only investment calculators */}
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-4">
            <h4 className="font-semibold text-white mb-3">Break-Even Timeline</h4>
            <div className="space-y-2 text-sm">
              {(() => {
                const projectsWithBEM = investmentProjects.filter(p => (p.breakEvenMonths || 0) > 0);
                const bems = projectsWithBEM.map(p => Number(p.breakEvenMonths) || 0);
                const avgBEM = bems.length > 0 ? bems.reduce((a, b) => a + b, 0) / bems.length : 0;
                const quickBreakEven = projectsWithBEM.filter(p => (p.breakEvenMonths || 0) > 0 && (p.breakEvenMonths || 0) < 12).length;
                const mediumBreakEven = projectsWithBEM.filter(p => (p.breakEvenMonths || 0) >= 12 && (p.breakEvenMonths || 0) < 36).length;
                const slowBreakEven = projectsWithBEM.filter(p => (p.breakEvenMonths || 0) >= 36).length;

                if (bems.length === 0) {
                  return (
                    <div className="text-zinc-500 text-center py-2">
                      No break-even data available
                    </div>
                  );
                }

                return (
                  <>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Average</span>
                      <span className="font-bold text-white">{Math.round(avgBEM)} months</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Quick (&lt;12m)</span>
                      <span className="font-bold text-emerald-400">{quickBreakEven}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Medium (12-36m)</span>
                      <span className="font-bold text-yellow-400">{mediumBreakEven}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Long (36m+)</span>
                      <span className="font-bold text-orange-400">{slowBreakEven}</span>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
