import { useState, useMemo } from 'react';
import { usePortfolio } from '../lib/portfolio-context';
import { generatePortfolioComparisionPDF } from '../utils/pdfExport';
import type { PortfolioProject } from '../types/portfolio';
import {
  extractUniversalMetrics,
  formatMetricValue,
  formatCashFlow,
  formatTimeMetric,
  generateComparisonInsights,
  getCalculatorLabel,
} from '../utils/crossCalculatorComparison';

export function ScenarioComparison() {
  const { projects, savedComparisons, saveComparison, deleteComparison } = usePortfolio();
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [showSavePrompt, setShowSavePrompt] = useState(false);
  const [comparisonName, setComparisonName] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const handleSelectProject = (id: string) => {
    setSelectedProjects(prev =>
      prev.includes(id)
        ? prev.filter(pid => pid !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedProjects.length === projects.length) {
      setSelectedProjects([]);
    } else {
      setSelectedProjects(projects.map(p => p.id));
    }
  };

  const selectedProjectsList = projects.filter(p => selectedProjects.includes(p.id));
  const hasSelection = selectedProjectsList.length > 0;

  // Extract universal metrics for all selected projects
  const comparisonData = useMemo(() => {
    return selectedProjectsList.map(project => ({
      project,
      metrics: extractUniversalMetrics(project),
    }));
  }, [selectedProjectsList]);

  // Generate insights about the comparison
  const insights = useMemo(() => {
    return generateComparisonInsights(selectedProjectsList);
  }, [selectedProjectsList]);

  const handleSaveComparison = () => {
    if (comparisonName.trim() && selectedProjects.length >= 2) {
      const saved = saveComparison(comparisonName, selectedProjects);
      if (saved) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
      setComparisonName('');
      setShowSavePrompt(false);
    }
  };

  const handleLoadComparison = (projectIds: string[]) => {
    // Only select projects that still exist
    const validIds = projectIds.filter(id => projects.some(p => p.id === id));
    setSelectedProjects(validIds);
  };

  const handleDeleteComparison = (id: string) => {
    deleteComparison(id);
    setShowDeleteConfirm(null);
  };

  const getCategoryStyles = (category: string) => {
    switch (category) {
      case 'return-analysis':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case 'income-analysis':
        return 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30';
      case 'financing-tool':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      case 'risk-tool':
        return 'bg-purple-500/15 text-purple-400 border-purple-500/30';
      default:
        return 'bg-zinc-500/15 text-zinc-400 border-zinc-500/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {saveSuccess && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-4 py-3 rounded-lg flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Comparison saved successfully!
        </div>
      )}

      {/* Saved Comparisons */}
      {savedComparisons.length > 0 && (
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
          <h2 className="text-lg font-bold text-white mb-4">Saved Comparisons</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {savedComparisons.map(comparison => (
              <div
                key={comparison.id}
                className="border border-zinc-700 rounded-lg p-4 hover:border-zinc-600 transition"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-white">{comparison.name}</h3>
                  <button
                    onClick={() => setShowDeleteConfirm(comparison.id)}
                    className="text-zinc-500 hover:text-red-400 transition p-1"
                    title="Delete comparison"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
                <p className="text-xs text-zinc-500 mb-3">
                  {comparison.projects.length} projects • {new Date(comparison.createdAt).toLocaleDateString()}
                </p>
                <div className="flex flex-wrap gap-1 mb-3">
                  {comparison.projects.slice(0, 3).map(p => (
                    <span key={p.id} className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded">
                      {p.projectName.length > 15 ? p.projectName.slice(0, 15) + '...' : p.projectName}
                    </span>
                  ))}
                  {comparison.projects.length > 3 && (
                    <span className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded">
                      +{comparison.projects.length - 3} more
                    </span>
                  )}
                </div>
                <button
                  onClick={() => handleLoadComparison(comparison.projects.map(p => p.id))}
                  className="w-full text-sm px-3 py-2 bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 rounded-lg hover:bg-cyan-500/20 transition"
                >
                  Load Comparison
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Selection Panel */}
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Select Projects to Compare</h2>
          {projects.length > 0 && (
            <button
              onClick={handleSelectAll}
              className="text-sm px-3 py-1.5 text-emerald-400 hover:bg-emerald-500/10 rounded border border-emerald-500/30"
            >
              {selectedProjects.length === projects.length ? 'Deselect All' : 'Select All'}
            </button>
          )}
        </div>

        {projects.length === 0 ? (
          <p className="text-zinc-400 py-4">No projects available. Create some first!</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {projects.map(project => {
              const metrics = extractUniversalMetrics(project);
              return (
                <label
                  key={project.id}
                  className={`flex items-center p-3 border rounded-lg cursor-pointer transition ${
                    selectedProjects.includes(project.id)
                      ? 'border-emerald-500/50 bg-emerald-500/10'
                      : 'border-zinc-700 hover:bg-zinc-800'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedProjects.includes(project.id)}
                    onChange={() => handleSelectProject(project.id)}
                    className="w-5 h-5 rounded border-2 border-zinc-600 bg-zinc-800 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-zinc-900 accent-emerald-500 checked:bg-emerald-500 checked:border-emerald-500 cursor-pointer"
                  />
                  <div className="ml-3 flex-1">
                    <div className="font-medium text-white">{project.projectName}</div>
                    <div className="text-sm text-zinc-400">{project.location}</div>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded border ${getCategoryStyles(metrics.category)}`}>
                    {metrics.categoryLabel}
                  </span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* Comparison Insights */}
      {hasSelection && insights.length > 0 && (
        <div className="space-y-2">
          {insights.map((insight, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-2 px-4 py-3 rounded-lg text-sm ${
                insight.type === 'warning'
                  ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                  : insight.type === 'comparison'
                    ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                    : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
              }`}
            >
              <span className="mt-0.5">
                {insight.type === 'warning' ? '⚠️' : insight.type === 'comparison' ? '📊' : 'ℹ️'}
              </span>
              <span>{insight.message}</span>
            </div>
          ))}
        </div>
      )}

      {/* Smart Comparison Table */}
      {hasSelection && (
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
          <div className="px-6 py-4 border-b border-zinc-800 bg-zinc-800/30">
            <h3 className="text-lg font-bold text-white">Cross-Calculator Comparison</h3>
            <p className="text-xs text-zinc-500 mt-1">Metrics are mapped to universal categories for meaningful comparison</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-zinc-800/50 border-b border-zinc-800">
                  <th className="px-6 py-3 text-left text-sm font-semibold text-white w-40">Metric</th>
                  {comparisonData.map(({ project, metrics }) => (
                    <th
                      key={project.id}
                      className="px-6 py-3 text-left text-sm font-semibold text-white min-w-52"
                    >
                      <div className="font-bold">{project.projectName}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-zinc-400 font-normal">{project.location}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded border ${getCategoryStyles(metrics.category)}`}>
                          {metrics.categoryLabel}
                        </span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Capital Required Row */}
                <tr className="bg-zinc-900 border-b border-zinc-800/50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-zinc-300">Capital Required</div>
                    <div className="text-[10px] text-zinc-500">Investment/Loan amount</div>
                  </td>
                  {comparisonData.map(({ project, metrics }) => {
                    const values = comparisonData.map(d => d.metrics.capitalRequired);
                    const maxVal = Math.max(...values);
                    const minVal = Math.min(...values);
                    const isMax = metrics.capitalRequired === maxVal && maxVal !== minVal;
                    const isMin = metrics.capitalRequired === minVal && maxVal !== minVal;

                    return (
                      <td
                        key={project.id}
                        className={`px-6 py-4 ${isMax ? 'bg-amber-500/10' : isMin ? 'bg-emerald-500/10' : ''}`}
                      >
                        <div className={`text-sm font-semibold ${isMin ? 'text-emerald-400' : isMax ? 'text-amber-400' : 'text-white'}`}>
                          {formatMetricValue(metrics.capitalRequired, 'currency')}
                        </div>
                        <div className="text-[10px] text-zinc-500">{metrics.capitalLabel}</div>
                      </td>
                    );
                  })}
                </tr>

                {/* Primary Return Row */}
                <tr className="bg-zinc-800/30 border-b border-zinc-800/50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-zinc-300">Primary Return</div>
                    <div className="text-[10px] text-zinc-500">Calculator-specific metric</div>
                  </td>
                  {comparisonData.map(({ project, metrics }) => {
                    const validValues = comparisonData
                      .filter(d => d.metrics.primaryReturn !== null && d.metrics.primaryReturnFormat === metrics.primaryReturnFormat)
                      .map(d => d.metrics.primaryReturn as number);
                    const maxVal = validValues.length > 0 ? Math.max(...validValues) : 0;
                    const minVal = validValues.length > 0 ? Math.min(...validValues) : 0;
                    const isMax = metrics.primaryReturn === maxVal && maxVal !== minVal && validValues.length > 1;
                    const isMin = metrics.primaryReturn === minVal && maxVal !== minVal && validValues.length > 1;

                    return (
                      <td
                        key={project.id}
                        className={`px-6 py-4 ${isMax ? 'bg-emerald-500/10' : isMin ? 'bg-red-500/10' : ''}`}
                      >
                        {metrics.primaryReturn !== null ? (
                          <>
                            <div className={`text-sm font-bold ${
                              isMax ? 'text-emerald-400' :
                              isMin ? 'text-red-400' :
                              metrics.primaryReturnFormat === 'percent' && metrics.primaryReturn >= 15 ? 'text-emerald-400' :
                              metrics.primaryReturnFormat === 'currency' && metrics.primaryReturn > 0 ? 'text-emerald-400' :
                              metrics.primaryReturn < 0 ? 'text-red-400' : 'text-white'
                            }`}>
                              {formatMetricValue(metrics.primaryReturn, metrics.primaryReturnFormat)}
                            </div>
                            <div className="text-[10px] text-zinc-500">{metrics.primaryReturnLabel}</div>
                          </>
                        ) : (
                          <span className="text-zinc-600 text-sm">N/A</span>
                        )}
                      </td>
                    );
                  })}
                </tr>

                {/* Cash Flow Row */}
                <tr className="bg-zinc-900 border-b border-zinc-800/50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-zinc-300">Cash Flow</div>
                    <div className="text-[10px] text-zinc-500">Net income/expense</div>
                  </td>
                  {comparisonData.map(({ project, metrics }) => {
                    const validValues = comparisonData
                      .filter(d => d.metrics.cashFlowIndicator !== null)
                      .map(d => d.metrics.cashFlowIndicator as number);
                    const maxVal = validValues.length > 0 ? Math.max(...validValues) : 0;
                    const minVal = validValues.length > 0 ? Math.min(...validValues) : 0;
                    const isMax = metrics.cashFlowIndicator === maxVal && maxVal !== minVal && validValues.length > 1;
                    const isMin = metrics.cashFlowIndicator === minVal && maxVal !== minVal && validValues.length > 1;

                    return (
                      <td
                        key={project.id}
                        className={`px-6 py-4 ${isMax && (metrics.cashFlowIndicator || 0) > 0 ? 'bg-emerald-500/10' : isMin && (metrics.cashFlowIndicator || 0) < 0 ? 'bg-red-500/10' : ''}`}
                      >
                        {metrics.cashFlowIndicator !== null ? (
                          <>
                            <div className={`text-sm font-semibold ${
                              metrics.cashFlowIndicator > 0 ? 'text-emerald-400' :
                              metrics.cashFlowIndicator < 0 ? 'text-red-400' : 'text-white'
                            }`}>
                              {formatCashFlow(metrics.cashFlowIndicator, metrics.cashFlowPeriod)}
                            </div>
                            <div className="text-[10px] text-zinc-500">{metrics.cashFlowLabel}</div>
                          </>
                        ) : (
                          <span className="text-zinc-600 text-sm">N/A</span>
                        )}
                      </td>
                    );
                  })}
                </tr>

                {/* Timeline Row */}
                <tr className="bg-zinc-800/30 border-b border-zinc-800/50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-zinc-300">Timeline</div>
                    <div className="text-[10px] text-zinc-500">Duration/Break-even</div>
                  </td>
                  {comparisonData.map(({ project, metrics }) => (
                    <td key={project.id} className="px-6 py-4">
                      {metrics.timeMetric !== null && metrics.timeMetricUnit !== null ? (
                        <>
                          <div className="text-sm font-semibold text-white">
                            {formatTimeMetric(metrics.timeMetric, metrics.timeMetricUnit)}
                          </div>
                          <div className="text-[10px] text-zinc-500">{metrics.timeMetricLabel}</div>
                        </>
                      ) : (
                        <span className="text-zinc-600 text-sm">N/A</span>
                      )}
                    </td>
                  ))}
                </tr>

                {/* Investment Score Row */}
                <tr className="bg-zinc-900">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-zinc-300">Investment Score</div>
                    <div className="text-[10px] text-zinc-500">Overall rating</div>
                  </td>
                  {comparisonData.map(({ project }) => {
                    const validScores = comparisonData
                      .filter(d => d.project.investmentScore > 0)
                      .map(d => d.project.investmentScore);
                    const maxScore = validScores.length > 0 ? Math.max(...validScores) : 0;
                    const minScore = validScores.length > 0 ? Math.min(...validScores) : 0;
                    const isMax = project.investmentScore === maxScore && maxScore !== minScore && validScores.length > 1;
                    const isMin = project.investmentScore === minScore && maxScore !== minScore && validScores.length > 1;

                    return (
                      <td
                        key={project.id}
                        className={`px-6 py-4 ${isMax ? 'bg-emerald-500/10' : isMin ? 'bg-red-500/10' : ''}`}
                      >
                        {project.investmentScore > 0 ? (
                          <span className={`inline-block px-3 py-1.5 rounded-lg text-sm font-bold ${
                            project.investmentScore >= 85 ? 'bg-emerald-500/20 text-emerald-400' :
                            project.investmentScore >= 70 ? 'bg-cyan-500/20 text-cyan-400' :
                            project.investmentScore >= 50 ? 'bg-orange-500/20 text-orange-400' :
                            'bg-red-500/20 text-red-400'
                          }`}>
                            {Math.round(project.investmentScore)}/100
                          </span>
                        ) : (
                          <span className="text-zinc-600 text-sm">N/A</span>
                        )}
                      </td>
                    );
                  })}
                </tr>

                {/* Strategy Row */}
                <tr className="bg-zinc-800/30">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-zinc-300">Strategy</div>
                    <div className="text-[10px] text-zinc-500">Investment approach</div>
                  </td>
                  {comparisonData.map(({ project }) => (
                    <td key={project.id} className="px-6 py-4">
                      {project.strategy ? (
                        <span className="text-sm text-white capitalize">{project.strategy}</span>
                      ) : (
                        <span className="text-zinc-600 text-sm">Not set</span>
                      )}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          {/* Legend */}
          <div className="px-6 py-3 border-t border-zinc-800 bg-zinc-800/20">
            <div className="flex flex-wrap items-center gap-4 text-[11px]">
              <span className="text-zinc-500">Analysis Types:</span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span className="text-zinc-400">Exit Return (XIRR, IRR, NPV)</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
                <span className="text-zinc-400">Income (Rental, Cap Rate)</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                <span className="text-zinc-400">Financing</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                <span className="text-zinc-400">Risk</span>
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-zinc-800/50 border-t border-zinc-800 px-6 py-4 flex gap-3">
            <button
              onClick={() => setShowSavePrompt(true)}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-medium flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              Save Comparison
            </button>
            <button
              onClick={() => generatePortfolioComparisionPDF(selectedProjectsList)}
              className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition font-medium flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              PDF Report
            </button>
            <button
              onClick={() => exportComparison(selectedProjectsList, comparisonData)}
              className="px-4 py-2 bg-zinc-700 text-zinc-200 rounded-lg hover:bg-zinc-600 transition font-medium flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              CSV Export
            </button>
          </div>
        </div>
      )}

      {/* Save Comparison Modal */}
      {showSavePrompt && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold text-white mb-4">Save Comparison</h3>
            <p className="text-sm text-zinc-400 mb-4">
              Save this comparison of {selectedProjects.length} projects for quick access later.
            </p>
            <input
              type="text"
              value={comparisonName}
              onChange={(e) => setComparisonName(e.target.value)}
              placeholder="e.g., Portfolio vs Alternatives"
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder:text-zinc-500 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none mb-4"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleSaveComparison()}
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowSavePrompt(false)}
                className="flex-1 px-4 py-2 text-zinc-300 border border-zinc-700 rounded-lg hover:bg-zinc-800 transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveComparison}
                disabled={!comparisonName.trim()}
                className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Comparison Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold text-white mb-2">Delete Comparison?</h3>
            <p className="text-zinc-400 mb-6">
              This will permanently delete this saved comparison. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 px-4 py-2 text-zinc-300 border border-zinc-700 rounded-lg hover:bg-zinc-800 transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteComparison(showDeleteConfirm)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function exportComparison(
  projects: PortfolioProject[],
  comparisonData: Array<{ project: PortfolioProject; metrics: ReturnType<typeof extractUniversalMetrics> }>
) {
  // Generate CSV with universal metrics
  let csv = 'Project Name,Location,Calculator Type,Capital Required,Primary Return,Return Type,Cash Flow,Timeline,Investment Score,Strategy\n';

  comparisonData.forEach(({ project, metrics }) => {
    csv += `"${project.projectName}",`;
    csv += `"${project.location}",`;
    csv += `"${metrics.categoryLabel}",`;
    csv += `${metrics.capitalRequired},`;
    csv += `${metrics.primaryReturn ?? 'N/A'},`;
    csv += `"${metrics.primaryReturnLabel}",`;
    csv += `${metrics.cashFlowIndicator ?? 'N/A'},`;
    csv += `${metrics.timeMetric ?? 'N/A'},`;
    csv += `${project.investmentScore || 'N/A'},`;
    csv += `"${project.strategy || 'N/A'}"\n`;
  });

  // Download
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `comparison-${Date.now()}.csv`;
  a.click();
  window.URL.revokeObjectURL(url);
}
