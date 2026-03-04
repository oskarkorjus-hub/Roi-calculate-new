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
        return 'bg-red-100 text-red-700';
      case 'hold':
        return 'bg-blue-100 text-blue-700';
      case 'rental':
        return 'bg-green-100 text-green-700';
      case 'development':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'archived':
        return 'bg-gray-100 text-gray-700';
      case 'active':
      default:
        return 'bg-blue-100 text-blue-700';
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
      <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-bold text-gray-900 truncate text-sm">{project.projectName}</h3>
            <p className="text-xs text-gray-600">{project.location}</p>
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
            <span className="text-gray-600">Investment</span>
            <span className="font-semibold">{formatCurrency(project.totalInvestment)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">ROI</span>
            <span className={`font-semibold ${project.roi >= 20 ? 'text-green-600' : 'text-orange-600'}`}>
              {(project.roi || 0).toFixed(1)}%
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Break-even</span>
            <span className="font-semibold">{project.breakEvenMonths}m</span>
          </div>
        </div>

        <div className="flex gap-1 flex-wrap">
          {onView && (
            <button
              onClick={() => onView(project)}
              className="flex-1 min-w-fit px-2 py-1 bg-indigo-50 text-indigo-600 rounded text-xs hover:bg-indigo-100 transition font-medium"
            >
              View
            </button>
          )}
          <ScenarioCreator project={project} />
          {onDelete && (
            <button
              onClick={() => onDelete(project.id)}
              className="flex-1 min-w-fit px-2 py-1 bg-red-50 text-red-600 rounded text-xs hover:bg-red-100 transition font-medium"
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
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
      {/* Card Header */}
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-4 border-b border-gray-200">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h3 className="font-bold text-gray-900 text-lg truncate">{project.projectName}</h3>
            <p className="text-sm text-gray-600">{project.location}</p>
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
        <p className="text-xs text-gray-500">{project.calculatorId}</p>
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
        <div className="grid grid-cols-2 gap-3 text-sm border-t border-gray-200 pt-4">
          <div>
            <div className="text-xs text-gray-600">Investment</div>
            <div className="font-bold text-gray-900">{formatCurrency(project.totalInvestment)}</div>
          </div>
          <div>
            <div className="text-xs text-gray-600">ROI</div>
            <div className={`font-bold ${(project.roi || 0) >= 20 ? 'text-green-600' : 'text-orange-600'}`}>
              {(project.roi || 0).toFixed(1)}%
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-600">Avg Cash Flow</div>
            <div className="font-bold text-gray-900">{formatCurrency(project.avgCashFlow)}</div>
          </div>
          <div>
            <div className="text-xs text-gray-600">Break-Even</div>
            <div className={`font-bold ${project.breakEvenMonths <= 24 ? 'text-green-600' : 'text-orange-600'}`}>
              {project.breakEvenMonths} months
            </div>
          </div>
        </div>

        {/* Created date */}
        <div className="text-xs text-gray-500 text-center border-t border-gray-200 pt-3">
          Created: {new Date(project.createdAt).toLocaleDateString()}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200">
          {onView && (
            <button
              onClick={() => onView(project)}
              className="flex-1 min-w-fit px-3 py-2 bg-indigo-50 text-indigo-600 rounded hover:bg-indigo-100 transition text-sm font-medium"
            >
              View
            </button>
          )}
          <button
            onClick={() => generateProjectPDF(project)}
            className="flex-1 min-w-fit px-3 py-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition text-sm font-medium"
            title="Download project report as PDF"
          >
            📄 PDF
          </button>
          <ScenarioCreator project={project} />
          <PitchDeckCustomizer project={project} />
          {(project.scenarios?.length ?? 0) > 0 && onViewScenarios && (
            <button
              onClick={() => onViewScenarios(project.id)}
              className="px-3 py-2 bg-amber-50 text-amber-600 rounded hover:bg-amber-100 transition text-sm font-medium"
              title={`Compare ${project.scenarios?.length || 0} scenarios`}
            >
              ⚖️ Compare
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(project.id)}
              className="flex-1 min-w-fit px-3 py-2 bg-red-50 text-red-600 rounded hover:bg-red-100 transition text-sm font-medium"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
