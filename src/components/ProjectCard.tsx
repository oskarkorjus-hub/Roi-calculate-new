import { useState } from 'react';
import type { PortfolioProject } from '../types/portfolio';
import { generateProjectPDF } from '../utils/pdfExport';
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

export function ProjectCard({
  project,
  onDelete,
  onView,
  onViewScenarios,
  compact = false,
}: ProjectCardProps) {
  const [showActions, setShowActions] = useState(false);

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

  const formatCurrency = (value: number | undefined) => {
    if (!value || value === 0) return '$0';
    if (value >= 1_000_000) return '$' + (value / 1_000_000).toFixed(1) + 'M';
    if (value >= 1_000) return '$' + (value / 1_000).toFixed(0) + 'K';
    return '$' + value.toFixed(0);
  };

  const strategyConfig = getStrategyConfig(project.strategy);
  const statusConfig = getStatusConfig(project.status);
  const riskInfo = getRiskLabel(project.investmentScore || 0);
  const scoreColor = getScoreColor(project.investmentScore || 0);

  // Compact view for dashboards
  if (compact) {
    return (
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-4 hover:border-zinc-700 transition-all group">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-white truncate text-sm">{project.projectName}</h3>
            <p className="text-xs text-zinc-500 mt-0.5">{project.location}</p>
          </div>
          <div
            className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm"
            style={{ backgroundColor: `${scoreColor}15`, color: scoreColor }}
          >
            {Math.round(project.investmentScore || 0)}
          </div>
        </div>

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-zinc-800">
          <div className="flex items-center gap-3 text-xs">
            <span className="text-zinc-400">
              <span className="text-white font-medium">{formatCurrency(project.totalInvestment)}</span>
            </span>
            <span className={`font-medium ${(project.roi || 0) >= 15 ? 'text-emerald-400' : 'text-orange-400'}`}>
              {(project.roi || 0).toFixed(1)}% ROI
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
      onMouseLeave={() => setShowActions(false)}
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
              <span className="text-zinc-500 capitalize">{project.calculatorId?.replace('-', ' ')}</span>
            </div>
          </div>

          {/* Score Badge */}
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

      {/* Metrics Grid */}
      <div className="grid grid-cols-4 gap-px bg-zinc-800">
        <div className="bg-zinc-900 p-3 text-center">
          <div className="text-xs text-zinc-500 mb-1">Investment</div>
          <div className="text-sm font-semibold text-white">{formatCurrency(project.totalInvestment)}</div>
        </div>
        <div className="bg-zinc-900 p-3 text-center">
          <div className="text-xs text-zinc-500 mb-1">ROI</div>
          <div className={`text-sm font-semibold ${(project.roi || 0) >= 15 ? 'text-emerald-400' : (project.roi || 0) >= 8 ? 'text-yellow-400' : 'text-orange-400'}`}>
            {(project.roi || 0).toFixed(1)}%
          </div>
        </div>
        <div className="bg-zinc-900 p-3 text-center">
          <div className="text-xs text-zinc-500 mb-1">Cash Flow</div>
          <div className="text-sm font-semibold text-white">{formatCurrency(project.avgCashFlow)}</div>
        </div>
        <div className="bg-zinc-900 p-3 text-center">
          <div className="text-xs text-zinc-500 mb-1">Break-Even</div>
          <div className={`text-sm font-semibold ${(project.breakEvenMonths || 0) <= 24 ? 'text-emerald-400' : 'text-orange-400'}`}>
            {project.breakEvenMonths || 0}mo
          </div>
        </div>
      </div>

      {/* Score Breakdown - Compact */}
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

      {/* Footer with Actions */}
      <div className="px-4 py-3 border-t border-zinc-800 flex items-center justify-between">
        <span className="text-xs text-zinc-500">
          {new Date(project.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </span>

        <div className="flex items-center gap-1">
          {onView && (
            <button
              onClick={() => onView(project)}
              className="px-3 py-1.5 text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg transition"
            >
              Details
            </button>
          )}
          <button
            onClick={() => generateProjectPDF(project)}
            className="px-3 py-1.5 text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg transition"
            title="Download PDF"
          >
            PDF
          </button>
          <ScenarioCreator project={project} variant="minimal" />
          <PitchDeckCustomizer project={project} variant="minimal" />
          {(project.scenarios?.length ?? 0) > 0 && onViewScenarios && (
            <button
              onClick={() => onViewScenarios(project.id)}
              className="px-3 py-1.5 text-xs font-medium text-amber-400 hover:bg-amber-500/10 rounded-lg transition"
              title={`Compare ${project.scenarios?.length || 0} scenarios`}
            >
              {project.scenarios?.length} Scenarios
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(project.id)}
              className="px-2 py-1.5 text-xs font-medium text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
              title="Delete project"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
