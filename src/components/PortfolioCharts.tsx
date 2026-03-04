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

export function PortfolioCharts({ projects }: PortfolioChartsProps) {
  // Chart 1: ROI Distribution (Histogram)
  const roiDistribution = useMemo(() => {
    const bins = [
      { range: '<10%', min: 0, max: 10, count: 0 },
      { range: '10-20%', min: 10, max: 20, count: 0 },
      { range: '20-30%', min: 20, max: 30, count: 0 },
      { range: '30-40%', min: 30, max: 40, count: 0 },
      { range: '40%+', min: 40, max: Infinity, count: 0 },
    ];

    projects.forEach(p => {
      const roi = Number(p.roi) || 0;
      const bin = bins.find(b => roi >= b.min && roi < b.max);
      if (bin) bin.count++;
    });

    return bins.filter(b => b.count > 0);
  }, [projects]);

  // Chart 2: Cash Flow by Project
  const cashFlowData = useMemo(() => {
    return projects
      .sort((a, b) => (b.avgCashFlow || 0) - (a.avgCashFlow || 0))
      .slice(0, 10)
      .map(p => ({
        name: p.projectName.length > 15 ? p.projectName.slice(0, 12) + '...' : p.projectName,
        cashFlow: Number(p.avgCashFlow) || 0,
      }));
  }, [projects]);

  // Chart 3: Investment Breakdown by Strategy
  const strategyBreakdown = useMemo(() => {
    const breakdown: Record<string, number> = {
      'Flip': 0,
      'Hold': 0,
      'Rental': 0,
      'Development': 0,
      'Unknown': 0,
    };

    projects.forEach(p => {
      const key = p.strategy ? p.strategy.charAt(0).toUpperCase() + p.strategy.slice(1) : 'Unknown';
      breakdown[key] = (breakdown[key] || 0) + (Number(p.totalInvestment) || 0);
    });

    return Object.entries(breakdown)
      .filter(([, value]) => value > 0)
      .map(([name, value]) => ({
        name,
        value: Math.round(value / 1_000_000 * 10) / 10, // Convert to millions
      }));
  }, [projects]);

  // Chart 4: Score vs ROI Scatter
  const scoreVsROI = useMemo(() => {
    return projects
      .map(p => ({
        name: p.projectName,
        score: p.investmentScore,
        roi: Number(p.roi) || 0,
      }))
      .filter(p => p.score > 0 && p.roi >= 0);
  }, [projects]);

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

  if (projects.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">Portfolio Analytics</h2>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ROI Distribution */}
        {roiDistribution.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 mb-4">ROI Distribution</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={roiDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Cash Flow by Project */}
        {cashFlowData.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 mb-4">Top Cash Flow Projects</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={cashFlowData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} fontSize={12} />
                <Tooltip />
                <Bar dataKey="cashFlow" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Investment Breakdown by Strategy */}
        {strategyBreakdown.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 mb-4">Investment by Strategy</h3>
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
                >
                  {strategyBreakdown.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `$${value}M`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Score vs ROI Scatter */}
        {scoreVsROI.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 mb-4">Score vs ROI Analysis</h3>
            <ResponsiveContainer width="100%" height={250}>
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="score" name="Score" type="number" />
                <YAxis dataKey="roi" name="ROI %" type="number" />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Scatter name="Projects" data={scoreVsROI} fill="#8b5cf6" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Additional insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Score distribution */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h4 className="font-semibold text-gray-900 mb-3">Score Distribution</h4>
          <div className="space-y-2 text-sm">
            {(() => {
              const excellent = projects.filter(p => p.investmentScore >= 85).length;
              const veryGood = projects.filter(p => p.investmentScore >= 70 && p.investmentScore < 85).length;
              const good = projects.filter(p => p.investmentScore >= 60 && p.investmentScore < 70).length;
              const moderate = projects.filter(p => p.investmentScore >= 50 && p.investmentScore < 60).length;
              const highRisk = projects.filter(p => p.investmentScore < 50).length;

              return (
                <>
                  {excellent > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Excellent (85+)</span>
                      <span className="font-bold text-green-600">{excellent}</span>
                    </div>
                  )}
                  {veryGood > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Very Good (70-84)</span>
                      <span className="font-bold text-blue-600">{veryGood}</span>
                    </div>
                  )}
                  {good > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Good (60-69)</span>
                      <span className="font-bold text-yellow-600">{good}</span>
                    </div>
                  )}
                  {moderate > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Moderate (50-59)</span>
                      <span className="font-bold text-orange-600">{moderate}</span>
                    </div>
                  )}
                  {highRisk > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">High Risk (&lt;50)</span>
                      <span className="font-bold text-red-600">{highRisk}</span>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        </div>

        {/* ROI Statistics */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h4 className="font-semibold text-gray-900 mb-3">ROI Statistics</h4>
          <div className="space-y-2 text-sm">
            {(() => {
              const rois = projects.map(p => Number(p.roi) || 0).filter(r => r >= 0);
              const avgROI = rois.length > 0 ? rois.reduce((a, b) => a + b, 0) / rois.length : 0;
              const maxROI = rois.length > 0 ? Math.max(...rois) : 0;
              const minROI = rois.length > 0 ? Math.min(...rois) : 0;

              return (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Average ROI</span>
                    <span className="font-bold text-gray-900">{avgROI.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Max ROI</span>
                    <span className="font-bold text-green-600">{maxROI.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Min ROI</span>
                    <span className="font-bold text-orange-600">{minROI.toFixed(1)}%</span>
                  </div>
                </>
              );
            })()}
          </div>
        </div>

        {/* Break-Even Statistics */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h4 className="font-semibold text-gray-900 mb-3">Break-Even Timeline</h4>
          <div className="space-y-2 text-sm">
            {(() => {
              const bems = projects.map(p => Number(p.breakEvenMonths) || 0).filter(b => b > 0);
              const avgBEM = bems.length > 0 ? bems.reduce((a, b) => a + b, 0) / bems.length : 0;
              const quickBreakEven = projects.filter(p => (p.breakEvenMonths || 0) < 12).length;
              const mediumBreakEven = projects.filter(p => (p.breakEvenMonths || 0) >= 12 && (p.breakEvenMonths || 0) < 36).length;
              const slowBreakEven = projects.filter(p => (p.breakEvenMonths || 0) >= 36).length;

              return (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Average</span>
                    <span className="font-bold text-gray-900">{Math.round(avgBEM)} months</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Quick (&lt;12m)</span>
                    <span className="font-bold text-green-600">{quickBreakEven}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Medium (12-36m)</span>
                    <span className="font-bold text-yellow-600">{mediumBreakEven}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Long (36m+)</span>
                    <span className="font-bold text-orange-600">{slowBreakEven}</span>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}
