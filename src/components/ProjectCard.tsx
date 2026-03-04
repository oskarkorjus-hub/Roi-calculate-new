import type { PortfolioProject } from '../types/portfolio';
import { InvestmentScoreCard } from './InvestmentScoreCard';
import { generateProjectPDF } from '../utils/pdfExport';
import { ScenarioCreator } from './ScenarioCreator';
import { PitchDeckCustomizer } from './PitchDeckCustomizer';

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
  const getStrategyColor = (strategy?: string) => {
    switch (strategy) {
      case 'flip':
        return 'bg-red-500/20 text-red-400';
      case 'hold':
        return 'bg-cyan-500/20 text-cyan-400';
      case 'rental':
        return 'bg-emerald-500/20 text-emerald-400';
      case 'development':
        return 'bg-purple-500/20 text-purple-400';
      default:
        return 'bg-zinc-700 text-zinc-400';
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-500/20 text-emerald-400';
      case 'archived':
        return 'bg-zinc-700 text-zinc-400';
      case 'active':
      default:
        return 'bg-cyan-500/20 text-cyan-400';
    }
  };

  const formatCurrency = (value: number | undefined) => {
    if (!value || value === 0) return '0';
    if (value >= 1_000_000) return (value / 1_000_000).toFixed(1) + 'M';
    if (value >= 1_000) return (value / 1_000).toFixed(0) + 'K';
    return value.toFixed(0);
  };

  if (compact) {
    // Compact view for dashboards
    return (
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-4 hover:border-zinc-700 transition-all">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-bold text-white truncate text-sm">{project.projectName}</h3>
            <p className="text-xs text-zinc-500">{project.location}</p>
          </div>
          <div className="ml-2 flex-shrink-0">
            <div style={{ width: '60px', height: '60px' }}>
              <InvestmentScoreCard
                score={project.investmentScore}
                roi_score={project.roi_score}
                cashflow_score={project.cashflow_score}
                stability_score={project.stability_score}
                location_score={project.location_score}
                showBreakdown={false}
                size="sm"
                compact={true}
              />
            </div>
          </div>
        </div>

        <div className="space-y-1 text-xs mb-3">
          <div className="flex justify-between">
            <span className="text-zinc-500">Investment</span>
            <span className="font-semibold text-white">{formatCurrency(project.totalInvestment)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500">ROI</span>
            <span className={`font-semibold ${project.roi >= 20 ? 'text-emerald-400' : 'text-orange-400'}`}>
              {(project.roi || 0).toFixed(1)}%
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500">Break-even</span>
            <span className="font-semibold text-white">{project.breakEvenMonths}m</span>
          </div>
        </div>

        <div className="flex gap-1 flex-wrap">
          {onView && (
            <button
              onClick={() => onView(project)}
              className="flex-1 min-w-fit px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded text-xs hover:bg-emerald-500/30 transition font-medium"
            >
              View
            </button>
          )}
          <ScenarioCreator project={project} />
          {onDelete && (
            <button
              onClick={() => onDelete(project.id)}
              className="flex-1 min-w-fit px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs hover:bg-red-500/30 transition font-medium"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    );
  }

  // Full view
  return (
    <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden hover:border-zinc-700 transition-all">
      {/* Card Header */}
      <div className="bg-zinc-800/50 p-4 border-b border-zinc-800">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h3 className="font-bold text-white text-lg truncate">{project.projectName}</h3>
            <p className="text-sm text-zinc-400">{project.location}</p>
          </div>
          <div className="ml-4 flex gap-2">
            {project.strategy && (
              <span className={`px-2 py-1 rounded text-xs font-semibold whitespace-nowrap ${getStrategyColor(project.strategy)}`}>
                {project.strategy.charAt(0).toUpperCase() + project.strategy.slice(1)}
              </span>
            )}
            {project.status && (
              <span className={`px-2 py-1 rounded text-xs font-semibold whitespace-nowrap ${getStatusColor(project.status)}`}>
                {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
              </span>
            )}
          </div>
        </div>
        <p className="text-xs text-zinc-500">{project.calculatorId}</p>
      </div>

      {/* Card Content */}
      <div className="p-4 space-y-4">
        {/* Score Ring */}
        <div className="flex justify-center py-2">
          <div style={{ width: '100px', height: '100px' }}>
            <InvestmentScoreCard
              score={project.investmentScore}
              roi_score={project.roi_score}
              cashflow_score={project.cashflow_score}
              stability_score={project.stability_score}
              location_score={project.location_score}
              showBreakdown={true}
              size="md"
            />
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-3 text-sm border-t border-zinc-800 pt-4">
          <div>
            <div className="text-xs text-zinc-500">Investment</div>
            <div className="font-bold text-white">{formatCurrency(project.totalInvestment)}</div>
          </div>
          <div>
            <div className="text-xs text-zinc-500">ROI</div>
            <div className={`font-bold ${(project.roi || 0) >= 20 ? 'text-emerald-400' : 'text-orange-400'}`}>
              {(project.roi || 0).toFixed(1)}%
            </div>
          </div>
          <div>
            <div className="text-xs text-zinc-500">Avg Cash Flow</div>
            <div className="font-bold text-white">{formatCurrency(project.avgCashFlow)}</div>
          </div>
          <div>
            <div className="text-xs text-zinc-500">Break-Even</div>
            <div className={`font-bold ${project.breakEvenMonths <= 24 ? 'text-emerald-400' : 'text-orange-400'}`}>
              {project.breakEvenMonths} months
            </div>
          </div>
        </div>

        {/* Created date */}
        <div className="text-xs text-zinc-500 text-center border-t border-zinc-800 pt-3">
          Created: {new Date(project.createdAt).toLocaleDateString()}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2 pt-4 border-t border-zinc-800">
          {onView && (
            <button
              onClick={() => onView(project)}
              className="flex-1 min-w-fit px-3 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 transition text-sm font-medium"
            >
              View
            </button>
          )}
          <button
            onClick={() => generateProjectPDF(project)}
            className="flex-1 min-w-fit px-3 py-2 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition text-sm font-medium"
            title="Download project report as PDF"
          >
            PDF
          </button>
          <ScenarioCreator project={project} />
          <PitchDeckCustomizer project={project} />
          {(project.scenarios?.length ?? 0) > 0 && onViewScenarios && (
            <button
              onClick={() => onViewScenarios(project.id)}
              className="px-3 py-2 bg-amber-500/20 text-amber-400 rounded-lg hover:bg-amber-500/30 transition text-sm font-medium"
              title={`Compare ${project.scenarios?.length || 0} scenarios`}
            >
              Compare
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(project.id)}
              className="flex-1 min-w-fit px-3 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition text-sm font-medium"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
