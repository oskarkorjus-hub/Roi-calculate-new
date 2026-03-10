import { useState, useMemo } from 'react';
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
  Legend,
  ReferenceLine,
  ComposedChart,
  Line,
} from 'recharts';
import {
  Filter,
  Eye,
  EyeOff,
  TrendingUp,
  DollarSign,
  Target,
  Clock,
  AlertTriangle,
  CheckCircle2,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import type { PortfolioProject } from '../types/portfolio';
import { getCalculatorLabel, extractUniversalMetrics } from '../utils/crossCalculatorComparison';

interface PortfolioChartsProps {
  projects: PortfolioProject[];
}

// Format numbers for display
const formatNumber = (value: number, decimals: number = 0): string => {
  if (Math.abs(value) >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(1)}B`;
  }
  if (Math.abs(value) >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(decimals > 0 ? 1 : 0)}M`;
  }
  if (Math.abs(value) >= 1_000) {
    return `${(value / 1_000).toFixed(0)}K`;
  }
  return value.toFixed(decimals);
};

const formatCurrency = (value: number): string => {
  return formatNumber(value, 0);
};

const formatPercent = (value: number): string => {
  return `${value.toFixed(1)}%`;
};

// Custom tooltip for dark theme
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 shadow-xl">
        <p className="text-zinc-300 text-sm font-medium mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color || '#10b981' }}>
            {entry.name}: {typeof entry.value === 'number' ?
              entry.name.toLowerCase().includes('roi') || entry.name.toLowerCase().includes('rate') || entry.name.toLowerCase().includes('%')
                ? formatPercent(entry.value)
                : entry.name.toLowerCase().includes('cash') || entry.name.toLowerCase().includes('investment')
                  ? `$${formatCurrency(entry.value)}`
                  : formatNumber(entry.value, 1)
              : entry.value
            }
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Calculator category colors
const CATEGORY_COLORS: Record<string, string> = {
  'return-analysis': '#10b981', // emerald
  'income-analysis': '#06b6d4', // cyan
  'financing-tool': '#f59e0b', // amber
  'risk-tool': '#8b5cf6', // purple
};

// Chart colors
const CHART_COLORS = ['#10b981', '#06b6d4', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899'];

export function PortfolioCharts({ projects }: PortfolioChartsProps) {
  const [showFilters, setShowFilters] = useState(true);
  const [excludedCalculators, setExcludedCalculators] = useState<Set<string>>(new Set());
  const [activeChartTab, setActiveChartTab] = useState<'overview' | 'performance' | 'distribution'>('overview');

  // Get unique calculators from projects
  const calculatorTypes = useMemo(() => {
    const types = new Map<string, { count: number; category: string }>();
    projects.forEach(p => {
      const metrics = extractUniversalMetrics(p);
      if (!types.has(p.calculatorId)) {
        types.set(p.calculatorId, { count: 1, category: metrics.category });
      } else {
        types.get(p.calculatorId)!.count++;
      }
    });
    return types;
  }, [projects]);

  // Filter projects based on excluded calculators
  const filteredProjects = useMemo(() => {
    return projects.filter(p => !excludedCalculators.has(p.calculatorId));
  }, [projects, excludedCalculators]);

  const toggleCalculator = (calcId: string) => {
    setExcludedCalculators(prev => {
      const next = new Set(prev);
      if (next.has(calcId)) {
        next.delete(calcId);
      } else {
        next.add(calcId);
      }
      return next;
    });
  };

  const includeAll = () => setExcludedCalculators(new Set());
  const excludeAll = () => setExcludedCalculators(new Set(calculatorTypes.keys()));

  // ============ METRICS CALCULATIONS ============

  // Portfolio Summary Metrics
  const portfolioMetrics = useMemo(() => {
    if (filteredProjects.length === 0) {
      return {
        totalInvestment: 0,
        avgROI: 0,
        avgCashFlow: 0,
        avgScore: 0,
        topPerformers: 0,
        needsAttention: 0,
        totalProjects: 0,
        avgBreakEven: 0,
      };
    }

    const projectsWithROI = filteredProjects.filter(p => (p.roi || 0) > 0);
    const projectsWithCashFlow = filteredProjects.filter(p => p.avgCashFlow !== undefined && p.avgCashFlow !== null);
    const projectsWithScore = filteredProjects.filter(p => (p.investmentScore || 0) > 0);
    const projectsWithBreakEven = filteredProjects.filter(p => (p.breakEvenMonths || 0) > 0);

    const totalInvestment = filteredProjects.reduce((sum, p) => sum + (Number(p.totalInvestment) || 0), 0);
    const avgROI = projectsWithROI.length > 0
      ? projectsWithROI.reduce((sum, p) => sum + (Number(p.roi) || 0), 0) / projectsWithROI.length
      : 0;
    const avgCashFlow = projectsWithCashFlow.length > 0
      ? projectsWithCashFlow.reduce((sum, p) => sum + (Number(p.avgCashFlow) || 0), 0) / projectsWithCashFlow.length
      : 0;
    const avgScore = projectsWithScore.length > 0
      ? projectsWithScore.reduce((sum, p) => sum + (Number(p.investmentScore) || 0), 0) / projectsWithScore.length
      : 0;
    const avgBreakEven = projectsWithBreakEven.length > 0
      ? projectsWithBreakEven.reduce((sum, p) => sum + (Number(p.breakEvenMonths) || 0), 0) / projectsWithBreakEven.length
      : 0;

    const topPerformers = filteredProjects.filter(p => (p.investmentScore || 0) >= 75 || (p.roi || 0) >= 20).length;
    const needsAttention = filteredProjects.filter(p => (p.investmentScore || 0) < 50 && (p.investmentScore || 0) > 0).length;

    return {
      totalInvestment,
      avgROI,
      avgCashFlow,
      avgScore,
      topPerformers,
      needsAttention,
      totalProjects: filteredProjects.length,
      avgBreakEven,
    };
  }, [filteredProjects]);

  // ROI Distribution Data
  const roiDistribution = useMemo(() => {
    const bins = [
      { range: '< 0%', min: -Infinity, max: 0, count: 0, fill: '#ef4444' },
      { range: '0-10%', min: 0, max: 10, count: 0, fill: '#f59e0b' },
      { range: '10-20%', min: 10, max: 20, count: 0, fill: '#84cc16' },
      { range: '20-30%', min: 20, max: 30, count: 0, fill: '#10b981' },
      { range: '30-50%', min: 30, max: 50, count: 0, fill: '#06b6d4' },
      { range: '50%+', min: 50, max: Infinity, count: 0, fill: '#8b5cf6' },
    ];

    filteredProjects.forEach(p => {
      const roi = Number(p.roi) || 0;
      const bin = bins.find(b => roi >= b.min && roi < b.max);
      if (bin) bin.count++;
    });

    return bins.filter(b => b.count > 0);
  }, [filteredProjects]);

  // Top Projects by ROI
  const topProjectsByROI = useMemo(() => {
    return [...filteredProjects]
      .filter(p => (p.roi || 0) > 0)
      .sort((a, b) => (Number(b.roi) || 0) - (Number(a.roi) || 0))
      .slice(0, 8)
      .map(p => ({
        name: p.projectName.length > 18 ? p.projectName.slice(0, 15) + '...' : p.projectName,
        fullName: p.projectName,
        roi: Math.round((Number(p.roi) || 0) * 10) / 10,
        calculator: getCalculatorLabel(p.calculatorId),
        fill: CATEGORY_COLORS[extractUniversalMetrics(p).category] || '#10b981',
      }));
  }, [filteredProjects]);

  // Calculators that produce meaningful monthly cash flow
  const CASH_FLOW_CALCULATORS = ['rental-roi', 'rental-projection', 'cap-rate', 'cashflow', 'xirr', 'irr'];

  // Cash Flow Data - only show projects with actual monthly cash flow
  const cashFlowData = useMemo(() => {
    return [...filteredProjects]
      .filter(p =>
        CASH_FLOW_CALCULATORS.includes(p.calculatorId) &&
        p.avgCashFlow !== undefined &&
        p.avgCashFlow !== null &&
        Math.abs(Number(p.avgCashFlow) || 0) > 0 // Must have non-zero cash flow
      )
      .sort((a, b) => (Number(b.avgCashFlow) || 0) - (Number(a.avgCashFlow) || 0))
      .slice(0, 8)
      .map(p => ({
        name: p.projectName.length > 15 ? p.projectName.slice(0, 12) + '...' : p.projectName,
        fullName: p.projectName,
        cashFlow: Math.round(Number(p.avgCashFlow) || 0),
        isPositive: (Number(p.avgCashFlow) || 0) >= 0,
        fill: (Number(p.avgCashFlow) || 0) >= 0 ? '#10b981' : '#ef4444',
      }));
  }, [filteredProjects]);

  // Investment by Calculator Type
  const investmentByCalculator = useMemo(() => {
    const breakdown: Record<string, { investment: number; count: number; category: string }> = {};

    filteredProjects.forEach(p => {
      const calcId = p.calculatorId;
      const metrics = extractUniversalMetrics(p);
      if (!breakdown[calcId]) {
        breakdown[calcId] = { investment: 0, count: 0, category: metrics.category };
      }
      breakdown[calcId].investment += Number(p.totalInvestment) || 0;
      breakdown[calcId].count++;
    });

    return Object.entries(breakdown)
      .filter(([, value]) => value.investment > 0)
      .map(([calcId, value], index) => ({
        name: getCalculatorLabel(calcId),
        value: Math.round(value.investment / 1_000_000 * 10) / 10,
        count: value.count,
        fill: CATEGORY_COLORS[value.category] || CHART_COLORS[index % CHART_COLORS.length],
      }))
      .sort((a, b) => b.value - a.value);
  }, [filteredProjects]);

  // Score vs ROI Quadrant Data
  const scoreVsROIData = useMemo(() => {
    return filteredProjects
      .filter(p => (p.investmentScore || 0) > 0 && p.roi !== undefined)
      .map(p => ({
        name: p.projectName,
        score: Number(p.investmentScore) || 0,
        roi: Number(p.roi) || 0,
        investment: Number(p.totalInvestment) || 0,
        calculator: getCalculatorLabel(p.calculatorId),
        fill: CATEGORY_COLORS[extractUniversalMetrics(p).category] || '#8b5cf6',
      }));
  }, [filteredProjects]);

  // Score Distribution
  const scoreDistribution = useMemo(() => {
    const scored = filteredProjects.filter(p => (p.investmentScore || 0) > 0);
    return {
      excellent: scored.filter(p => (p.investmentScore || 0) >= 85).length,
      veryGood: scored.filter(p => (p.investmentScore || 0) >= 70 && (p.investmentScore || 0) < 85).length,
      good: scored.filter(p => (p.investmentScore || 0) >= 60 && (p.investmentScore || 0) < 70).length,
      moderate: scored.filter(p => (p.investmentScore || 0) >= 50 && (p.investmentScore || 0) < 60).length,
      risky: scored.filter(p => (p.investmentScore || 0) < 50).length,
      total: scored.length,
    };
  }, [filteredProjects]);

  // Portfolio Performance Matrix
  const performanceMatrix = useMemo(() => {
    const categories = ['return-analysis', 'income-analysis', 'financing-tool', 'risk-tool'];
    return categories.map(cat => {
      const catProjects = filteredProjects.filter(p => extractUniversalMetrics(p).category === cat);
      const withROI = catProjects.filter(p => (p.roi || 0) > 0);
      const avgROI = withROI.length > 0
        ? withROI.reduce((sum, p) => sum + (Number(p.roi) || 0), 0) / withROI.length
        : 0;
      const totalInv = catProjects.reduce((sum, p) => sum + (Number(p.totalInvestment) || 0), 0);

      return {
        category: cat === 'return-analysis' ? 'Exit Returns'
          : cat === 'income-analysis' ? 'Rental Income'
          : cat === 'financing-tool' ? 'Financing'
          : 'Risk Tools',
        projects: catProjects.length,
        avgROI: Math.round(avgROI * 10) / 10,
        totalInvestment: totalInv,
        fill: CATEGORY_COLORS[cat],
      };
    }).filter(c => c.projects > 0);
  }, [filteredProjects]);

  // Break-even timeline distribution
  const breakEvenDistribution = useMemo(() => {
    const withBE = filteredProjects.filter(p => (p.breakEvenMonths || 0) > 0);
    return {
      quick: withBE.filter(p => (p.breakEvenMonths || 0) < 12).length,
      medium: withBE.filter(p => (p.breakEvenMonths || 0) >= 12 && (p.breakEvenMonths || 0) < 24).length,
      long: withBE.filter(p => (p.breakEvenMonths || 0) >= 24 && (p.breakEvenMonths || 0) < 36).length,
      veryLong: withBE.filter(p => (p.breakEvenMonths || 0) >= 36).length,
      total: withBE.length,
    };
  }, [filteredProjects]);

  if (projects.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header with Filters Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-emerald-400" />
            Portfolio Analytics
          </h2>
          <p className="text-zinc-500 text-sm mt-1">
            Analyzing {filteredProjects.length} of {projects.length} projects
          </p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-zinc-300 text-sm transition-colors"
        >
          <Filter className="h-4 w-4" />
          Filters
          {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      {/* Calculator Filter Section */}
      {showFilters && (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
              <Layers className="h-4 w-4" />
              Include/Exclude by Calculator Type
            </h3>
            <div className="flex gap-2">
              <button
                onClick={includeAll}
                className="px-2 py-1 text-xs bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 rounded transition-colors"
              >
                Include All
              </button>
              <button
                onClick={excludeAll}
                className="px-2 py-1 text-xs bg-zinc-700 text-zinc-400 hover:bg-zinc-600 rounded transition-colors"
              >
                Exclude All
              </button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {Array.from(calculatorTypes.entries()).map(([calcId, info]) => {
              const isIncluded = !excludedCalculators.has(calcId);
              return (
                <button
                  key={calcId}
                  onClick={() => toggleCalculator(calcId)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all ${
                    isIncluded
                      ? 'bg-zinc-800 border border-zinc-600 text-white'
                      : 'bg-zinc-900 border border-zinc-800 text-zinc-500 opacity-60'
                  }`}
                >
                  <span>{getCalculatorLabel(calcId)}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded ${
                    isIncluded ? 'bg-zinc-700 text-zinc-300' : 'bg-zinc-800 text-zinc-500'
                  }`}>
                    {info.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {filteredProjects.length === 0 ? (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-8 text-center">
          <AlertTriangle className="h-12 w-12 text-amber-400 mx-auto mb-3" />
          <p className="text-zinc-400">No projects selected. Adjust your filters above to see analytics.</p>
        </div>
      ) : (
        <>
          {/* Key Metrics Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/30 rounded-xl p-4">
              <div className="flex items-center gap-2 text-emerald-400 text-sm mb-1">
                <DollarSign className="h-4 w-4" />
                Total Investment
              </div>
              <p className="text-2xl font-bold text-white">
                ${formatCurrency(portfolioMetrics.totalInvestment)}
              </p>
              <p className="text-xs text-zinc-500 mt-1">
                Across {portfolioMetrics.totalProjects} projects
              </p>
            </div>

            <div className="bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 border border-cyan-500/30 rounded-xl p-4">
              <div className="flex items-center gap-2 text-cyan-400 text-sm mb-1">
                <TrendingUp className="h-4 w-4" />
                Average ROI
              </div>
              <p className="text-2xl font-bold text-white">
                {formatPercent(portfolioMetrics.avgROI)}
              </p>
              <p className="text-xs text-zinc-500 mt-1">
                {portfolioMetrics.avgROI >= 15 ? 'Strong performance' : portfolioMetrics.avgROI >= 10 ? 'Moderate returns' : 'Room for improvement'}
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/30 rounded-xl p-4">
              <div className="flex items-center gap-2 text-purple-400 text-sm mb-1">
                <Target className="h-4 w-4" />
                Average Score
              </div>
              <p className="text-2xl font-bold text-white">
                {portfolioMetrics.avgScore > 0 ? Math.round(portfolioMetrics.avgScore) : 'N/A'}
              </p>
              <p className="text-xs text-zinc-500 mt-1">
                {portfolioMetrics.avgScore >= 75 ? 'Excellent' : portfolioMetrics.avgScore >= 60 ? 'Good' : portfolioMetrics.avgScore > 0 ? 'Moderate' : 'No scores'}
              </p>
            </div>

            <div className="bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/30 rounded-xl p-4">
              <div className="flex items-center gap-2 text-amber-400 text-sm mb-1">
                <Clock className="h-4 w-4" />
                Avg Break-even
              </div>
              <p className="text-2xl font-bold text-white">
                {portfolioMetrics.avgBreakEven > 0 ? `${Math.round(portfolioMetrics.avgBreakEven)}mo` : 'N/A'}
              </p>
              <p className="text-xs text-zinc-500 mt-1">
                {portfolioMetrics.avgBreakEven > 0 && portfolioMetrics.avgBreakEven < 24 ? 'Quick recovery' : portfolioMetrics.avgBreakEven >= 24 ? 'Long term' : 'No data'}
              </p>
            </div>
          </div>

          {/* Portfolio Health Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-emerald-400" />
              </div>
              <div>
                <p className="text-sm text-zinc-400">Top Performers</p>
                <p className="text-xl font-bold text-emerald-400">{portfolioMetrics.topPerformers}</p>
                <p className="text-xs text-zinc-500">Score ≥75 or ROI ≥20%</p>
              </div>
            </div>

            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-amber-500/20 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-amber-400" />
              </div>
              <div>
                <p className="text-sm text-zinc-400">Needs Attention</p>
                <p className="text-xl font-bold text-amber-400">{portfolioMetrics.needsAttention}</p>
                <p className="text-xs text-zinc-500">Score &lt;50</p>
              </div>
            </div>

            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-cyan-500/20 flex items-center justify-center">
                <Activity className="h-6 w-6 text-cyan-400" />
              </div>
              <div>
                <p className="text-sm text-zinc-400">Avg Monthly Cash Flow</p>
                <p className={`text-xl font-bold ${portfolioMetrics.avgCashFlow >= 0 ? 'text-cyan-400' : 'text-red-400'}`}>
                  ${formatCurrency(Math.round(portfolioMetrics.avgCashFlow))}
                </p>
                <p className="text-xs text-zinc-500">Per project average</p>
              </div>
            </div>
          </div>

          {/* Chart Tabs */}
          <div className="flex gap-2 border-b border-zinc-800 pb-2">
            {(['overview', 'performance', 'distribution'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveChartTab(tab)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeChartTab === tab
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                }`}
              >
                {tab === 'overview' ? 'Overview' : tab === 'performance' ? 'Performance' : 'Distribution'}
              </button>
            ))}
          </div>

          {/* Charts Grid */}
          {activeChartTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Projects by ROI */}
              {topProjectsByROI.length > 0 && (
                <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-4">
                  <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-emerald-400" />
                    Top Projects by ROI
                  </h3>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={topProjectsByROI} layout="vertical" margin={{ left: 10, right: 30 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" horizontal={true} vertical={false} />
                      <XAxis
                        type="number"
                        stroke="#a1a1aa"
                        fontSize={11}
                        tickFormatter={(v) => `${v}%`}
                      />
                      <YAxis
                        dataKey="name"
                        type="category"
                        width={110}
                        fontSize={11}
                        stroke="#a1a1aa"
                        tick={{ fill: '#a1a1aa' }}
                      />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 shadow-xl">
                                <p className="text-white font-medium text-sm">{data.fullName}</p>
                                <p className="text-emerald-400 text-sm">ROI: {data.roi}%</p>
                                <p className="text-zinc-400 text-xs">{data.calculator}</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar dataKey="roi" radius={[0, 4, 4, 0]}>
                        {topProjectsByROI.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Investment by Calculator */}
              {investmentByCalculator.length > 0 && (
                <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-4">
                  <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                    <PieChartIcon className="h-4 w-4 text-cyan-400" />
                    Investment by Calculator Type
                  </h3>
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={investmentByCalculator}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value, percent }) =>
                          percent > 0.05 ? `${name}: $${value}M` : ''
                        }
                        outerRadius={90}
                        innerRadius={40}
                        fill="#8884d8"
                        dataKey="value"
                        stroke="#18181b"
                        strokeWidth={2}
                      >
                        {investmentByCalculator.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => [`$${value}M`, 'Investment']}
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

              {/* Cash Flow Analysis */}
              {cashFlowData.length > 0 && (
                <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-4">
                  <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-emerald-400" />
                    Monthly Cash Flow by Project
                  </h3>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={cashFlowData} layout="vertical" margin={{ left: 10, right: 30 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" horizontal={true} vertical={false} />
                      <XAxis
                        type="number"
                        stroke="#a1a1aa"
                        fontSize={11}
                        tickFormatter={(v) => `$${formatCurrency(v)}`}
                      />
                      <YAxis
                        dataKey="name"
                        type="category"
                        width={100}
                        fontSize={11}
                        stroke="#a1a1aa"
                      />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 shadow-xl">
                                <p className="text-white font-medium text-sm">{data.fullName}</p>
                                <p className={`text-sm ${data.isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                                  ${data.cashFlow.toLocaleString()}/month
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <ReferenceLine x={0} stroke="#71717a" />
                      <Bar dataKey="cashFlow" radius={[0, 4, 4, 0]}>
                        {cashFlowData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Performance Matrix by Category */}
              {performanceMatrix.length > 0 && (
                <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-4">
                  <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                    <Layers className="h-4 w-4 text-purple-400" />
                    Performance by Category
                  </h3>
                  <ResponsiveContainer width="100%" height={280}>
                    <ComposedChart data={performanceMatrix} margin={{ left: 10, right: 30 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
                      <XAxis
                        dataKey="category"
                        stroke="#a1a1aa"
                        fontSize={11}
                        angle={-20}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis
                        yAxisId="left"
                        stroke="#a1a1aa"
                        fontSize={11}
                        tickFormatter={(v) => `${v}%`}
                      />
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        stroke="#a1a1aa"
                        fontSize={11}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ fontSize: '12px' }} />
                      <Bar
                        yAxisId="left"
                        dataKey="avgROI"
                        name="Avg ROI %"
                        fill="#10b981"
                        radius={[4, 4, 0, 0]}
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="projects"
                        name="# Projects"
                        stroke="#8b5cf6"
                        strokeWidth={2}
                        dot={{ fill: '#8b5cf6', r: 4 }}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          )}

          {activeChartTab === 'performance' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Score vs ROI Quadrant */}
              {scoreVsROIData.length > 0 && (
                <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-4 lg:col-span-2">
                  <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                    <Target className="h-4 w-4 text-purple-400" />
                    Score vs ROI Analysis (Quadrant View)
                  </h3>
                  <p className="text-xs text-zinc-500 mb-4">
                    Top-right quadrant = best investments (high score + high ROI)
                  </p>
                  <ResponsiveContainer width="100%" height={350}>
                    <ScatterChart margin={{ top: 20, right: 40, bottom: 20, left: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
                      <XAxis
                        dataKey="score"
                        name="Score"
                        type="number"
                        stroke="#a1a1aa"
                        fontSize={11}
                        domain={[0, 100]}
                        label={{ value: 'Investment Score', position: 'bottom', fill: '#71717a', fontSize: 11 }}
                      />
                      <YAxis
                        dataKey="roi"
                        name="ROI %"
                        type="number"
                        stroke="#a1a1aa"
                        fontSize={11}
                        tickFormatter={(v) => `${v}%`}
                        label={{ value: 'ROI %', angle: -90, position: 'insideLeft', fill: '#71717a', fontSize: 11 }}
                      />
                      <ReferenceLine x={60} stroke="#3f3f46" strokeDasharray="5 5" />
                      <ReferenceLine y={15} stroke="#3f3f46" strokeDasharray="5 5" />
                      <Tooltip
                        cursor={{ strokeDasharray: '3 3', stroke: '#71717a' }}
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 shadow-xl">
                                <p className="text-white font-medium text-sm">{data.name}</p>
                                <p className="text-purple-400 text-sm">Score: {Math.round(data.score)}</p>
                                <p className="text-emerald-400 text-sm">ROI: {data.roi.toFixed(1)}%</p>
                                <p className="text-zinc-400 text-xs">{data.calculator}</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Scatter name="Projects" data={scoreVsROIData}>
                        {scoreVsROIData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Scatter>
                    </ScatterChart>
                  </ResponsiveContainer>
                  {/* Quadrant Legend */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4 text-xs">
                    <div className="bg-emerald-500/10 border border-emerald-500/30 rounded px-2 py-1 text-center">
                      <span className="text-emerald-400">↗ Stars</span>
                      <p className="text-zinc-500">High Score + High ROI</p>
                    </div>
                    <div className="bg-amber-500/10 border border-amber-500/30 rounded px-2 py-1 text-center">
                      <span className="text-amber-400">↙ Cash Cows</span>
                      <p className="text-zinc-500">Low Score + High ROI</p>
                    </div>
                    <div className="bg-cyan-500/10 border border-cyan-500/30 rounded px-2 py-1 text-center">
                      <span className="text-cyan-400">↗ Question Marks</span>
                      <p className="text-zinc-500">High Score + Low ROI</p>
                    </div>
                    <div className="bg-red-500/10 border border-red-500/30 rounded px-2 py-1 text-center">
                      <span className="text-red-400">↙ Dogs</span>
                      <p className="text-zinc-500">Low Score + Low ROI</p>
                    </div>
                  </div>
                </div>
              )}

              {/* ROI Distribution Histogram */}
              {roiDistribution.length > 0 && (
                <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-4">
                  <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-blue-400" />
                    ROI Distribution
                  </h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={roiDistribution}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
                      <XAxis dataKey="range" stroke="#a1a1aa" fontSize={11} />
                      <YAxis stroke="#a1a1aa" fontSize={11} allowDecimals={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="count" name="Projects" radius={[4, 4, 0, 0]}>
                        {roiDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Score Distribution Card */}
              {scoreDistribution.total > 0 && (
                <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-4">
                  <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                    <Target className="h-4 w-4 text-purple-400" />
                    Investment Score Distribution
                  </h3>
                  <div className="space-y-3">
                    {[
                      { label: 'Excellent (85+)', count: scoreDistribution.excellent, textColor: 'text-emerald-400', bgColor: '#10b981', percent: (scoreDistribution.excellent / scoreDistribution.total) * 100 },
                      { label: 'Very Good (70-84)', count: scoreDistribution.veryGood, textColor: 'text-cyan-400', bgColor: '#06b6d4', percent: (scoreDistribution.veryGood / scoreDistribution.total) * 100 },
                      { label: 'Good (60-69)', count: scoreDistribution.good, textColor: 'text-blue-400', bgColor: '#3b82f6', percent: (scoreDistribution.good / scoreDistribution.total) * 100 },
                      { label: 'Moderate (50-59)', count: scoreDistribution.moderate, textColor: 'text-amber-400', bgColor: '#f59e0b', percent: (scoreDistribution.moderate / scoreDistribution.total) * 100 },
                      { label: 'Risky (<50)', count: scoreDistribution.risky, textColor: 'text-red-400', bgColor: '#ef4444', percent: (scoreDistribution.risky / scoreDistribution.total) * 100 },
                    ].filter(item => item.count > 0).map((item, i) => (
                      <div key={i}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-zinc-400">{item.label}</span>
                          <span className={`font-bold ${item.textColor}`}>{item.count}</span>
                        </div>
                        <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{ width: `${item.percent}%`, backgroundColor: item.bgColor }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeChartTab === 'distribution' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Break-even Timeline */}
              {breakEvenDistribution.total > 0 && (
                <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-4">
                  <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-amber-400" />
                    Break-even Timeline Distribution
                  </h3>
                  <div className="space-y-4">
                    {[
                      { label: 'Quick (<12 months)', count: breakEvenDistribution.quick, color: '#10b981', desc: 'Fast recovery' },
                      { label: 'Medium (12-24 months)', count: breakEvenDistribution.medium, color: '#06b6d4', desc: 'Standard timeline' },
                      { label: 'Long (24-36 months)', count: breakEvenDistribution.long, color: '#f59e0b', desc: 'Extended period' },
                      { label: 'Very Long (36+ months)', count: breakEvenDistribution.veryLong, color: '#ef4444', desc: 'Long-term investment' },
                    ].filter(item => item.count > 0).map((item, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div
                          className="h-10 w-10 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                          style={{ backgroundColor: `${item.color}30`, color: item.color }}
                        >
                          {item.count}
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium">{item.label}</p>
                          <p className="text-zinc-500 text-xs">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  {breakEvenDistribution.total > 0 && (
                    <div className="mt-4 pt-4 border-t border-zinc-800">
                      <p className="text-zinc-400 text-sm">
                        Total projects with break-even data: <span className="text-white font-bold">{breakEvenDistribution.total}</span>
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Calculator Type Breakdown Table */}
              <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-4">
                <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                  <Layers className="h-4 w-4 text-cyan-400" />
                  Calculator Type Breakdown
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-zinc-800">
                        <th className="text-left py-2 text-zinc-400 font-medium">Calculator</th>
                        <th className="text-right py-2 text-zinc-400 font-medium">#</th>
                        <th className="text-right py-2 text-zinc-400 font-medium">Investment</th>
                        <th className="text-right py-2 text-zinc-400 font-medium">Avg ROI</th>
                      </tr>
                    </thead>
                    <tbody>
                      {investmentByCalculator.map((calc, i) => {
                        const catProjects = filteredProjects.filter(p => getCalculatorLabel(p.calculatorId) === calc.name);
                        const withROI = catProjects.filter(p => (p.roi || 0) > 0);
                        const avgROI = withROI.length > 0
                          ? withROI.reduce((sum, p) => sum + (Number(p.roi) || 0), 0) / withROI.length
                          : 0;
                        return (
                          <tr key={i} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                            <td className="py-2.5">
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-2 h-2 rounded-full"
                                  style={{ backgroundColor: calc.fill }}
                                />
                                <span className="text-white">{calc.name}</span>
                              </div>
                            </td>
                            <td className="text-right py-2.5 text-zinc-300">{calc.count}</td>
                            <td className="text-right py-2.5 text-zinc-300">${calc.value}M</td>
                            <td className="text-right py-2.5">
                              <span className={avgROI > 0 ? 'text-emerald-400' : 'text-zinc-500'}>
                                {avgROI > 0 ? `${avgROI.toFixed(1)}%` : 'N/A'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* ROI Statistics Card */}
              <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-4 lg:col-span-2">
                <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                  <Activity className="h-4 w-4 text-emerald-400" />
                  ROI Statistics Summary
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {(() => {
                    const rois = filteredProjects.map(p => Number(p.roi) || 0).filter(r => r !== 0);
                    const positiveROIs = rois.filter(r => r > 0);
                    const negativeROIs = rois.filter(r => r < 0);
                    const avgROI = positiveROIs.length > 0 ? positiveROIs.reduce((a, b) => a + b, 0) / positiveROIs.length : 0;
                    const maxROI = positiveROIs.length > 0 ? Math.max(...positiveROIs) : 0;
                    const minROI = rois.length > 0 ? Math.min(...rois) : 0;
                    const medianROI = positiveROIs.length > 0
                      ? [...positiveROIs].sort((a, b) => a - b)[Math.floor(positiveROIs.length / 2)]
                      : 0;

                    return (
                      <>
                        <div className="bg-zinc-800/50 rounded-lg p-3 text-center">
                          <p className="text-zinc-500 text-xs mb-1">Average ROI</p>
                          <p className="text-xl font-bold text-white">{avgROI.toFixed(1)}%</p>
                        </div>
                        <div className="bg-zinc-800/50 rounded-lg p-3 text-center">
                          <p className="text-zinc-500 text-xs mb-1">Median ROI</p>
                          <p className="text-xl font-bold text-cyan-400">{medianROI.toFixed(1)}%</p>
                        </div>
                        <div className="bg-zinc-800/50 rounded-lg p-3 text-center">
                          <p className="text-zinc-500 text-xs mb-1">Highest ROI</p>
                          <p className="text-xl font-bold text-emerald-400">{maxROI.toFixed(1)}%</p>
                        </div>
                        <div className="bg-zinc-800/50 rounded-lg p-3 text-center">
                          <p className="text-zinc-500 text-xs mb-1">Lowest ROI</p>
                          <p className={`text-xl font-bold ${minROI >= 0 ? 'text-amber-400' : 'text-red-400'}`}>
                            {minROI.toFixed(1)}%
                          </p>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
