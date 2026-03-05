import { useState } from 'react';
import type { PortfolioProject } from '../types/portfolio';
import { generateProjectPDF } from '../utils/pdfExport';
import { generateEnterpriseReport, generatePitchDeck } from '../utils/enterprisePdfGenerator';
import { ScenarioCreator } from './ScenarioCreator';
import { PitchDeckCustomizer } from './PitchDeckCustomizer';
import { getScoreColor } from '../utils/investmentScoring';

interface ProjectCardProps {
  project: PortfolioProject;
  onDelete?: (projectId: string) => void;
  onView?: (project: PortfolioProject) => void;
  onViewScenarios?: (projectId: string) => void;
  compact?: boolean;
}

// Calculator category configuration
type CalculatorCategory = 'investment' | 'financing' | 'budget' | 'tax' | 'risk' | 'npv';

interface MetricConfig {
  label: string;
  getValue: (project: PortfolioProject) => string | number;
  getColor?: (project: PortfolioProject) => string;
}

interface CategoryConfig {
  category: CalculatorCategory;
  showScore: boolean;
  showScoreBreakdown: boolean;
  accentColor: string;
  metrics: MetricConfig[];
}

// Get calculator category
const getCalculatorCategory = (calculatorId: string): CalculatorCategory => {
  switch (calculatorId) {
    case 'mortgage':
    case 'financing':
      return 'financing';
    case 'dev-budget':
      return 'budget';
    case 'indonesia-tax':
      return 'tax';
    case 'risk-assessment':
      return 'risk';
    case 'npv':
      return 'npv';
    default:
      return 'investment';
  }
};

// Format currency helper
const formatCurrency = (value: number | undefined, short = true) => {
  if (!value || value === 0) return '$0';
  if (short) {
    if (Math.abs(value) >= 1_000_000) return '$' + (value / 1_000_000).toFixed(1) + 'M';
    if (Math.abs(value) >= 1_000) return '$' + (value / 1_000).toFixed(0) + 'K';
  }
  return '$' + value.toLocaleString();
};

// Calculator-specific metric configurations
const getCategoryConfig = (calculatorId: string): CategoryConfig => {
  const category = getCalculatorCategory(calculatorId);

  switch (category) {
    case 'financing':
      return {
        category: 'financing',
        showScore: false,
        showScoreBreakdown: false,
        accentColor: '#3b82f6', // blue
        metrics: [
          {
            label: 'Loan Amount',
            getValue: (p) => formatCurrency(p.data?.loanAmount || p.totalInvestment),
          },
          {
            label: 'Monthly Payment',
            getValue: (p) => formatCurrency(p.data?.result?.monthlyPayment || p.data?.monthlyPayment || 0),
          },
          {
            label: 'Interest Rate',
            getValue: (p) => `${(p.data?.interestRate || 0).toFixed(2)}%`,
            getColor: (p) => (p.data?.interestRate || 0) <= 5 ? 'text-emerald-400' : (p.data?.interestRate || 0) <= 8 ? 'text-yellow-400' : 'text-orange-400',
          },
          {
            label: 'Total Interest',
            getValue: (p) => formatCurrency(p.data?.result?.totalInterest || 0),
            getColor: () => 'text-orange-400',
          },
        ],
      };

    case 'budget':
      return {
        category: 'budget',
        showScore: false,
        showScoreBreakdown: false,
        accentColor: '#eab308', // yellow
        metrics: [
          {
            label: 'Total Budget',
            getValue: (p) => formatCurrency(p.data?.calculations?.totalBudgeted || p.totalInvestment),
          },
          {
            label: 'Spent',
            getValue: (p) => formatCurrency(p.data?.calculations?.totalActual || 0),
          },
          {
            label: 'Variance',
            getValue: (p) => {
              const variance = p.data?.calculations?.variancePercent || 0;
              return `${variance > 0 ? '+' : ''}${variance.toFixed(1)}%`;
            },
            getColor: (p) => (p.data?.calculations?.variancePercent || 0) > 0 ? 'text-red-400' : 'text-emerald-400',
          },
          {
            label: 'Health',
            getValue: (p) => `${(p.data?.calculations?.healthScore || 0).toFixed(0)}%`,
            getColor: (p) => {
              const score = p.data?.calculations?.healthScore || 0;
              return score >= 80 ? 'text-emerald-400' : score >= 60 ? 'text-yellow-400' : 'text-red-400';
            },
          },
        ],
      };

    case 'tax':
      return {
        category: 'tax',
        showScore: false,
        showScoreBreakdown: false,
        accentColor: '#f97316', // orange
        metrics: [
          {
            label: 'Property Value',
            getValue: (p) => formatCurrency(p.data?.purchasePrice || p.totalInvestment),
          },
          {
            label: 'Total Tax',
            getValue: (p) => formatCurrency(p.data?.result?.totalTaxLiability || 0),
            getColor: () => 'text-orange-400',
          },
          {
            label: 'Effective Rate',
            getValue: (p) => `${(p.data?.result?.effectiveTaxRate || 0).toFixed(1)}%`,
          },
          {
            label: 'Net Profit',
            getValue: (p) => formatCurrency(p.data?.result?.netProfit || 0),
            getColor: (p) => (p.data?.result?.netProfit || 0) >= 0 ? 'text-emerald-400' : 'text-red-400',
          },
        ],
      };

    case 'risk':
      return {
        category: 'risk',
        showScore: true, // Show risk score instead of investment score
        showScoreBreakdown: false,
        accentColor: '#f43f5e', // rose
        metrics: [
          {
            label: 'Investment',
            getValue: (p) => formatCurrency(p.totalInvestment),
          },
          {
            label: 'Risk Score',
            getValue: (p) => `${p.data?.result?.riskScore || p.investmentScore || 0}/100`,
            getColor: (p) => {
              const score = p.data?.result?.riskScore || p.investmentScore || 0;
              return score >= 70 ? 'text-emerald-400' : score >= 50 ? 'text-yellow-400' : 'text-red-400';
            },
          },
          {
            label: 'Risk Level',
            getValue: (p) => p.data?.result?.riskLevel || 'Unknown',
            getColor: (p) => {
              const level = p.data?.result?.riskLevel?.toLowerCase() || '';
              if (level.includes('low')) return 'text-emerald-400';
              if (level.includes('medium')) return 'text-yellow-400';
              return 'text-red-400';
            },
          },
          {
            label: 'Expected Return',
            getValue: (p) => `${(p.data?.expectedReturn || p.roi || 0).toFixed(1)}%`,
            getColor: (p) => (p.data?.expectedReturn || p.roi || 0) >= 15 ? 'text-emerald-400' : 'text-yellow-400',
          },
        ],
      };

    case 'npv':
      return {
        category: 'npv',
        showScore: true,
        showScoreBreakdown: false,
        accentColor: '#14b8a6', // teal
        metrics: [
          {
            label: 'Initial Investment',
            getValue: (p) => formatCurrency(p.data?.result?.totalCashOutflows || p.totalInvestment),
          },
          {
            label: 'NPV',
            getValue: (p) => formatCurrency(p.data?.result?.npv || 0),
            getColor: (p) => (p.data?.result?.npv || 0) >= 0 ? 'text-emerald-400' : 'text-red-400',
          },
          {
            label: 'Discount Rate',
            getValue: (p) => `${(p.data?.discountRate || 0).toFixed(1)}%`,
          },
          {
            label: 'Profitability',
            getValue: (p) => `${(p.data?.result?.profitabilityIndex || 0).toFixed(2)}x`,
            getColor: (p) => (p.data?.result?.profitabilityIndex || 0) >= 1 ? 'text-emerald-400' : 'text-red-400',
          },
        ],
      };

    // Investment calculators (rental-roi, xirr, cap-rate, irr, dev-feasibility, rental-projection, cashflow)
    default:
      return {
        category: 'investment',
        showScore: true,
        showScoreBreakdown: true,
        accentColor: '#10b981', // emerald
        metrics: [
          {
            label: 'Investment',
            getValue: (p) => formatCurrency(p.totalInvestment),
          },
          {
            label: 'ROI',
            getValue: (p) => `${(p.roi || 0).toFixed(1)}%`,
            getColor: (p) => (p.roi || 0) >= 15 ? 'text-emerald-400' : (p.roi || 0) >= 8 ? 'text-yellow-400' : 'text-orange-400',
          },
          {
            label: 'Cash Flow',
            getValue: (p) => formatCurrency(p.avgCashFlow),
          },
          {
            label: 'Break-Even',
            getValue: (p) => `${p.breakEvenMonths || 0}mo`,
            getColor: (p) => (p.breakEvenMonths || 0) <= 24 ? 'text-emerald-400' : 'text-orange-400',
          },
        ],
      };
  }
};

// Get friendly calculator name
const getCalculatorDisplayName = (calculatorId: string): string => {
  const names: Record<string, string> = {
    'rental-roi': 'Rental ROI',
    'xirr': 'XIRR',
    'mortgage': 'Mortgage',
    'cashflow': 'Cash Flow',
    'dev-feasibility': 'Dev Feasibility',
    'cap-rate': 'Cap Rate',
    'irr': 'IRR',
    'npv': 'NPV',
    'indonesia-tax': 'Tax Optimizer',
    'rental-projection': 'Rental Projection',
    'financing': 'Financing',
    'dev-budget': 'Budget Tracker',
    'risk-assessment': 'Risk Assessment',
  };
  return names[calculatorId] || calculatorId?.replace('-', ' ') || 'Calculator';
};

export function ProjectCard({
  project,
  onDelete,
  onView,
  onViewScenarios,
  compact = false,
}: ProjectCardProps) {
  const [showActions, setShowActions] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const categoryConfig = getCategoryConfig(project.calculatorId);

  const getStrategyConfig = (strategy?: string) => {
    switch (strategy) {
      case 'flip':
        return { bg: 'bg-red-500/10', border: 'border-red-500/20', text: 'text-red-400', icon: '↗' };
      case 'hold':
        return { bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', text: 'text-cyan-400', icon: '◆' };
      case 'rental':
        return { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400', icon: '⌂' };
      case 'development':
        return { bg: 'bg-purple-500/10', border: 'border-purple-500/20', text: 'text-purple-400', icon: '▲' };
      default:
        return { bg: 'bg-zinc-800', border: 'border-zinc-700', text: 'text-zinc-400', icon: '○' };
    }
  };

  const getStatusConfig = (status?: string) => {
    switch (status) {
      case 'completed':
        return { bg: 'bg-emerald-500/10', text: 'text-emerald-400', dot: 'bg-emerald-400' };
      case 'archived':
        return { bg: 'bg-zinc-700/50', text: 'text-zinc-500', dot: 'bg-zinc-500' };
      case 'active':
      default:
        return { bg: 'bg-cyan-500/10', text: 'text-cyan-400', dot: 'bg-cyan-400' };
    }
  };

  const getRiskLabel = (score: number) => {
    if (score >= 85) return { label: 'Excellent', color: 'text-emerald-400' };
    if (score >= 70) return { label: 'Very Good', color: 'text-cyan-400' };
    if (score >= 60) return { label: 'Good', color: 'text-blue-400' };
    if (score >= 50) return { label: 'Moderate', color: 'text-yellow-400' };
    return { label: 'High Risk', color: 'text-red-400' };
  };

  const strategyConfig = getStrategyConfig(project.strategy);
  const statusConfig = getStatusConfig(project.status);
  const riskInfo = getRiskLabel(project.investmentScore || 0);
  const scoreColor = categoryConfig.showScore ? getScoreColor(project.investmentScore || 0) : categoryConfig.accentColor;

  // Compact view for dashboards
  if (compact) {
    return (
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-4 hover:border-zinc-700 transition-all group">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-white truncate text-sm">{project.projectName}</h3>
            <p className="text-xs text-zinc-500 mt-0.5">{project.location}</p>
          </div>
          {categoryConfig.showScore && (
            <div
              className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm"
              style={{ backgroundColor: `${scoreColor}15`, color: scoreColor }}
            >
              {Math.round(project.investmentScore || 0)}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-zinc-800">
          <div className="flex items-center gap-3 text-xs">
            <span className="text-zinc-400">
              <span className="text-white font-medium">{categoryConfig.metrics[0].getValue(project)}</span>
            </span>
            <span className={categoryConfig.metrics[1].getColor?.(project) || 'text-white'}>
              {categoryConfig.metrics[1].getValue(project)}
            </span>
          </div>
          {onView && (
            <button
              onClick={() => onView(project)}
              className="text-xs text-zinc-400 hover:text-white transition"
            >
              View →
            </button>
          )}
        </div>
      </div>
    );
  }

  // Full enterprise-level view
  return (
    <div
      className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden hover:border-zinc-700/80 transition-all group"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => {
        setShowActions(false);
        setShowExportMenu(false);
      }}
    >
      {/* Header */}
      <div className="p-4 pb-3">
        <div className="flex items-start justify-between gap-3">
          {/* Project Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {project.strategy && (
                <span className={`w-5 h-5 rounded flex items-center justify-center text-xs ${strategyConfig.bg} ${strategyConfig.text}`}>
                  {strategyConfig.icon}
                </span>
              )}
              <h3 className="font-semibold text-white truncate">{project.projectName}</h3>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-zinc-500">{project.location}</span>
              <span className="text-zinc-700">•</span>
              <span
                className="px-1.5 py-0.5 rounded text-[10px] font-medium"
                style={{ backgroundColor: `${categoryConfig.accentColor}20`, color: categoryConfig.accentColor }}
              >
                {getCalculatorDisplayName(project.calculatorId)}
              </span>
            </div>
          </div>

          {/* Score Badge - only for scored calculators */}
          {categoryConfig.showScore && (
            <div className="flex-shrink-0 text-right">
              <div
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg"
                style={{ backgroundColor: `${scoreColor}12` }}
              >
                <span className="text-lg font-bold" style={{ color: scoreColor }}>
                  {Math.round(project.investmentScore || 0)}
                </span>
                <span className="text-xs text-zinc-500">/100</span>
              </div>
              <div className={`text-xs font-medium mt-1 ${riskInfo.color}`}>
                {riskInfo.label}
              </div>
            </div>
          )}

          {/* Category Badge - for non-scored calculators */}
          {!categoryConfig.showScore && (
            <div className="flex-shrink-0">
              <div
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg"
                style={{ backgroundColor: `${categoryConfig.accentColor}15` }}
              >
                <span className="text-sm font-bold" style={{ color: categoryConfig.accentColor }}>
                  {categoryConfig.category === 'financing' && '💰'}
                  {categoryConfig.category === 'budget' && '📊'}
                  {categoryConfig.category === 'tax' && '🧾'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Status Tag */}
        <div className="flex items-center gap-2 mt-3">
          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`}></span>
            {(project.status || 'active').charAt(0).toUpperCase() + (project.status || 'active').slice(1)}
          </span>
          {project.strategy && (
            <span className={`px-2 py-0.5 rounded text-xs font-medium border ${strategyConfig.bg} ${strategyConfig.border} ${strategyConfig.text}`}>
              {project.strategy.charAt(0).toUpperCase() + project.strategy.slice(1)}
            </span>
          )}
        </div>
      </div>

      {/* Calculator-Specific Metrics Grid */}
      <div className="grid grid-cols-4 gap-px bg-zinc-800">
        {categoryConfig.metrics.map((metric, idx) => (
          <div key={idx} className="bg-zinc-900 p-3 text-center">
            <div className="text-xs text-zinc-500 mb-1">{metric.label}</div>
            <div className={`text-sm font-semibold ${metric.getColor?.(project) || 'text-white'}`}>
              {metric.getValue(project)}
            </div>
          </div>
        ))}
      </div>

      {/* Score Breakdown - Only for investment calculators */}
      {categoryConfig.showScoreBreakdown && (
        <div className="px-4 py-3 bg-zinc-800/30">
          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center gap-1">
              <span className="text-xs text-zinc-500 w-8">ROI</span>
              <div className="flex-1 h-1 bg-zinc-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all"
                  style={{ width: `${Math.min(((project.roi_score || 0) / 5) * 100, 100)}%` }}
                />
              </div>
            </div>
            <div className="flex-1 flex items-center gap-1">
              <span className="text-xs text-zinc-500 w-8">Cash</span>
              <div className="flex-1 h-1 bg-zinc-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all"
                  style={{ width: `${Math.min(((project.cashflow_score || 0) / 3) * 100, 100)}%` }}
                />
              </div>
            </div>
            <div className="flex-1 flex items-center gap-1">
              <span className="text-xs text-zinc-500 w-8">Stab</span>
              <div className="flex-1 h-1 bg-zinc-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-500 rounded-full transition-all"
                  style={{ width: `${Math.min(((project.stability_score || 0) / 2) * 100, 100)}%` }}
                />
              </div>
            </div>
            <div className="flex-1 flex items-center gap-1">
              <span className="text-xs text-zinc-500 w-8">Loc</span>
              <div className="flex-1 h-1 bg-zinc-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-500 rounded-full transition-all"
                  style={{ width: `${Math.min((project.location_score || 0) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Budget Progress Bar - Only for budget calculator */}
      {categoryConfig.category === 'budget' && (
        <div className="px-4 py-3 bg-zinc-800/30">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-zinc-500">Budget Progress</span>
            <span className="text-zinc-400">
              {((project.data?.calculations?.totalActual || 0) / (project.data?.calculations?.totalBudgeted || 1) * 100).toFixed(0)}%
            </span>
          </div>
          <div className="h-2 bg-zinc-700 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                (project.data?.calculations?.variancePercent || 0) > 10 ? 'bg-red-500' :
                (project.data?.calculations?.variancePercent || 0) > 0 ? 'bg-yellow-500' : 'bg-emerald-500'
              }`}
              style={{
                width: `${Math.min(((project.data?.calculations?.totalActual || 0) / (project.data?.calculations?.totalBudgeted || 1) * 100), 100)}%`
              }}
            />
          </div>
        </div>
      )}

      {/* Footer with Actions */}
      <div className="px-4 py-3 border-t border-zinc-800 flex items-center justify-between">
        <span className="text-xs text-zinc-500">
          {new Date(project.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </span>

        <div className="flex items-center gap-2">
          {/* Primary Action */}
          {onView && (
            <button
              onClick={() => onView(project)}
              className="px-3 py-1.5 text-xs font-medium text-white bg-zinc-800 hover:bg-zinc-700 rounded-lg transition"
            >
              Details
            </button>
          )}

          {/* Scenarios Badge (if any) */}
          {(project.scenarios?.length ?? 0) > 0 && onViewScenarios && (
            <button
              onClick={() => onViewScenarios(project.id)}
              className="px-2 py-1.5 text-xs font-medium text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 rounded-lg transition"
              title={`Compare ${project.scenarios?.length || 0} scenarios`}
            >
              {project.scenarios?.length} Scenarios
            </button>
          )}

          {/* Actions Menu */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition"
              title="More actions"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
            {showExportMenu && (
              <div className="absolute right-0 bottom-full mb-2 w-48 bg-zinc-800 border border-zinc-700 rounded-xl shadow-xl z-50 overflow-hidden">
                {/* Export Section */}
                <div className="px-3 py-2 border-b border-zinc-700">
                  <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Export</span>
                </div>
                <button
                  onClick={() => {
                    generateProjectPDF(project);
                    setShowExportMenu(false);
                  }}
                  className="w-full px-3 py-2.5 text-left text-xs text-zinc-300 hover:bg-zinc-700 flex items-center gap-2"
                >
                  <svg className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Summary PDF
                </button>
                <button
                  onClick={() => {
                    generateEnterpriseReport(project);
                    setShowExportMenu(false);
                  }}
                  className="w-full px-3 py-2.5 text-left text-xs text-zinc-300 hover:bg-zinc-700 flex items-center gap-2"
                >
                  <svg className="w-4 h-4 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  Enterprise Report
                </button>
                <button
                  onClick={() => {
                    generatePitchDeck(project);
                    setShowExportMenu(false);
                  }}
                  className="w-full px-3 py-2.5 text-left text-xs text-zinc-300 hover:bg-zinc-700 flex items-center gap-2"
                >
                  <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                  </svg>
                  Pitch Deck
                </button>

                {/* Tools Section */}
                <div className="px-3 py-2 border-t border-b border-zinc-700">
                  <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Tools</span>
                </div>
                <ScenarioCreator project={project} variant="menu-item" onClose={() => setShowExportMenu(false)} />
                <PitchDeckCustomizer project={project} variant="menu-item" onClose={() => setShowExportMenu(false)} />

                {/* Delete */}
                {onDelete && (
                  <>
                    <div className="border-t border-zinc-700" />
                    <button
                      onClick={() => {
                        onDelete(project.id);
                        setShowExportMenu(false);
                      }}
                      className="w-full px-3 py-2.5 text-left text-xs text-red-400 hover:bg-red-500/10 flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete Project
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
