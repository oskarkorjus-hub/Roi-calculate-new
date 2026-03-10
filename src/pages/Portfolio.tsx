import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePortfolio } from '../lib/portfolio-context';
import { PortfolioStats } from '../components/PortfolioStats';
import { PortfolioFilters } from '../components/PortfolioFilters';
import { PortfolioCharts } from '../components/PortfolioCharts';
import { ProjectCard } from '../components/ProjectCard';
import { ProjectDetailsModal } from '../components/ProjectDetailsModal';
import { ScenarioAnalysisPage } from './ScenarioAnalysis';
import type { PortfolioProject } from '../types/portfolio';
import { generatePortfolioComparisionPDF } from '../utils/pdfExport';
import {
  extractUniversalMetrics,
  formatMetricValue,
  formatCashFlow,
  formatTimeMetric,
  generateComparisonInsights,
} from '../utils/crossCalculatorComparison';

// Custom easing for premium animations
const premiumEase: [number, number, number, number] = [0.16, 1, 0.3, 1];

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: premiumEase,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: premiumEase,
    },
  },
};

// Cross-Calculator Comparison Component
function CrossCalculatorComparison({ projects }: { projects: PortfolioProject[] }) {
  const comparisonData = useMemo(() => {
    return projects.map(project => ({
      project,
      metrics: extractUniversalMetrics(project),
    }));
  }, [projects]);

  const insights = useMemo(() => {
    return generateComparisonInsights(projects);
  }, [projects]);

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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="card-premium rounded-2xl p-6 mt-6 space-y-5"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="section-icon">
            <span className="material-symbols-outlined text-emerald-400">compare</span>
          </div>
          <h3 className="section-title">Cross-Calculator Comparison</h3>
        </div>
        <span className="text-xs text-zinc-500 font-body">Smart metric mapping across different analysis types</span>
      </div>

      {/* Comparison Insights */}
      {insights.length > 0 && (
        <div className="space-y-2">
          {insights.map((insight, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`flex items-start gap-2 px-4 py-3 rounded-xl text-sm font-body ${
                insight.type === 'warning'
                  ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                  : insight.type === 'comparison'
                    ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                    : 'bg-zinc-800/50 text-zinc-400 border border-zinc-700/50'
              }`}
            >
              <span className="text-xs font-medium uppercase tracking-wide opacity-60">
                {insight.type === 'warning' ? 'Note' : insight.type === 'comparison' ? 'Insight' : 'Info'}
              </span>
              <span>{insight.message}</span>
            </motion.div>
          ))}
        </div>
      )}

      {/* Main Comparison Table */}
      <div className="overflow-x-auto -mx-6 px-6">
        <table className="w-full text-sm min-w-[800px]">
          <thead className="bg-zinc-800/50 border-b border-zinc-700/50">
            <tr>
              <th className="px-4 py-4 text-left font-display font-semibold text-zinc-300">Project</th>
              <th className="px-4 py-4 text-center font-display font-semibold text-zinc-300">Type</th>
              <th className="px-4 py-4 text-right font-display font-semibold text-zinc-300">Capital</th>
              <th className="px-4 py-4 text-right font-display font-semibold text-zinc-300">
                <span className="block">Primary Return</span>
                <span className="block text-[10px] text-zinc-500 font-normal font-body">Calculator-specific</span>
              </th>
              <th className="px-4 py-4 text-right font-display font-semibold text-zinc-300">
                <span className="block">Cash Flow</span>
                <span className="block text-[10px] text-zinc-500 font-normal font-body">Net amount</span>
              </th>
              <th className="px-4 py-4 text-right font-display font-semibold text-zinc-300">Timeline</th>
              <th className="px-4 py-4 text-right font-display font-semibold text-zinc-300">Score</th>
            </tr>
          </thead>
          <tbody>
            {comparisonData.map(({ project, metrics }, idx) => (
              <motion.tr
                key={project.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: idx * 0.05 }}
                className={`border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors ${idx % 2 === 0 ? 'bg-zinc-900/30' : 'bg-zinc-800/20'}`}
              >
                <td className="px-4 py-4">
                  <div className="font-display font-semibold text-white">{project.projectName}</div>
                  {project.strategy && (
                    <div className="text-xs text-zinc-500 capitalize mt-0.5 font-body">
                      {project.strategy}
                    </div>
                  )}
                </td>
                <td className="px-4 py-4 text-center">
                  <span
                    className={`inline-block px-2.5 py-1 rounded-lg text-xs font-medium border ${getCategoryStyles(metrics.category)}`}
                    title={metrics.calculatorPurpose}
                  >
                    {metrics.categoryLabel}
                  </span>
                </td>
                <td className="px-4 py-4 text-right">
                  <div className="text-zinc-300 font-mono font-medium">
                    {formatMetricValue(metrics.capitalRequired, 'currency')}
                  </div>
                  <div className="text-xs text-zinc-500 font-body">{metrics.capitalLabel}</div>
                </td>
                <td className="px-4 py-4 text-right">
                  {metrics.primaryReturn !== null ? (
                    <>
                      <div
                        className={`font-mono font-bold ${
                          metrics.primaryReturnFormat === 'percent' && metrics.primaryReturn >= 15
                            ? 'text-emerald-400'
                            : metrics.primaryReturnFormat === 'currency' && metrics.primaryReturn > 0
                              ? 'text-emerald-400'
                              : metrics.primaryReturnFormat === 'percent' && metrics.primaryReturn >= 8
                                ? 'text-cyan-400'
                                : metrics.primaryReturn < 0
                                  ? 'text-red-400'
                                  : 'text-orange-400'
                        }`}
                      >
                        {formatMetricValue(metrics.primaryReturn, metrics.primaryReturnFormat)}
                      </div>
                      <div className="text-xs text-zinc-500 font-body">{metrics.primaryReturnLabel}</div>
                    </>
                  ) : (
                    <span className="text-zinc-600">N/A</span>
                  )}
                </td>
                <td className="px-4 py-4 text-right">
                  {metrics.cashFlowIndicator !== null ? (
                    <>
                      <div
                        className={`font-mono font-medium ${
                          metrics.cashFlowIndicator > 0 ? 'text-emerald-400' : metrics.cashFlowIndicator < 0 ? 'text-red-400' : 'text-zinc-400'
                        }`}
                      >
                        {formatCashFlow(metrics.cashFlowIndicator, metrics.cashFlowPeriod)}
                      </div>
                      <div className="text-xs text-zinc-500 font-body">{metrics.cashFlowLabel}</div>
                    </>
                  ) : (
                    <span className="text-zinc-600">N/A</span>
                  )}
                </td>
                <td className="px-4 py-4 text-right">
                  {metrics.timeMetric !== null && metrics.timeMetricUnit !== null ? (
                    <>
                      <div className="text-zinc-300 font-mono">
                        {formatTimeMetric(metrics.timeMetric, metrics.timeMetricUnit)}
                      </div>
                      <div className="text-xs text-zinc-500 font-body">{metrics.timeMetricLabel}</div>
                    </>
                  ) : (
                    <span className="text-zinc-600">N/A</span>
                  )}
                </td>
                <td className="px-4 py-4 text-right">
                  {project.investmentScore > 0 ? (
                    <span
                      className={`inline-block px-3 py-1.5 rounded-lg text-sm font-mono font-bold ${
                        project.investmentScore >= 85
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : project.investmentScore >= 70
                            ? 'bg-cyan-500/20 text-cyan-400'
                            : project.investmentScore >= 50
                              ? 'bg-orange-500/20 text-orange-400'
                              : 'bg-red-500/20 text-red-400'
                      }`}
                    >
                      {Math.round(project.investmentScore)}
                    </span>
                  ) : (
                    <span className="text-zinc-600 text-xs">N/A</span>
                  )}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 pt-4 border-t border-zinc-800/50">
        <span className="text-xs text-zinc-500 font-body">Analysis Types:</span>
        <span className="inline-flex items-center gap-1.5 text-xs font-body">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          <span className="text-zinc-400">Exit Return</span>
        </span>
        <span className="inline-flex items-center gap-1.5 text-xs font-body">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-500"></span>
          <span className="text-zinc-400">Income Analysis</span>
        </span>
        <span className="inline-flex items-center gap-1.5 text-xs font-body">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
          <span className="text-zinc-400">Financing</span>
        </span>
        <span className="inline-flex items-center gap-1.5 text-xs font-body">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
          <span className="text-zinc-400">Risk Analysis</span>
        </span>
      </div>
    </motion.div>
  );
}

export function Portfolio() {
  const { projects, deleteProject } = usePortfolio();
  const [filteredProjects, setFilteredProjects] = useState<PortfolioProject[]>(projects);
  const [selectedProject, setSelectedProject] = useState<PortfolioProject | null>(null);
  const [scenarioViewProjectId, setScenarioViewProjectId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [selectedForComparison, setSelectedForComparison] = useState<Set<string>>(new Set());
  const [showComparisonView, setShowComparisonView] = useState(false);
  const comparisonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (showComparisonView && comparisonRef.current) {
      setTimeout(() => {
        comparisonRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [showComparisonView]);

  const handleDeleteProject = useCallback((projectId: string) => {
    deleteProject(projectId);
    setShowDeleteConfirm(null);
    if (selectedProject?.id === projectId) {
      setSelectedProject(null);
    }
  }, [deleteProject, selectedProject]);

  const handleToggleComparison = useCallback((projectId: string) => {
    const newSet = new Set(selectedForComparison);
    if (newSet.has(projectId)) {
      newSet.delete(projectId);
    } else if (newSet.size < 3) {
      newSet.add(projectId);
    }
    setSelectedForComparison(newSet);
  }, [selectedForComparison]);

  const projectsForComparison = useMemo(() => {
    return projects.filter(p => selectedForComparison.has(p.id));
  }, [projects, selectedForComparison]);

  const downloadCSV = useCallback(() => {
    if (filteredProjects.length === 0) return;

    let csv = 'Project Name,Location,Strategy,Investment,ROI %,Avg Cash Flow,Break-even (months),Score,Status\n';
    filteredProjects.forEach(p => {
      csv += `"${p.projectName}","${p.location}","${p.strategy || 'N/A'}",${p.totalInvestment},${(p.roi || 0).toFixed(1)},${p.avgCashFlow},${p.breakEvenMonths},${Math.round(p.investmentScore || 0)},"${p.status || 'active'}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `portfolio_${new Date().toISOString().split('T')[0]}.csv`);
    link.click();
    URL.revokeObjectURL(url);
  }, [filteredProjects]);

  // Scenario Analysis View
  if (scenarioViewProjectId) {
    return (
      <ScenarioAnalysisPage
        projectId={scenarioViewProjectId}
        onBack={() => setScenarioViewProjectId(null)}
      />
    );
  }

  // Empty State
  if (projects.length === 0) {
    return (
      <div className="min-h-screen bg-mesh-gradient text-white -mx-4 md:-mx-10 lg:-mx-20 -my-8 px-6 py-8">
        {/* Atmospheric effects */}
        <div className="fixed inset-0 bg-grid-pattern opacity-20 pointer-events-none" />
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-40 left-1/3 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-float" />
        </div>

        <div className="relative z-10 max-w-[100%] mx-auto">
          <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8 flex items-center gap-4"
          >
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600/20 to-purple-800/20 border border-purple-500/30 flex items-center justify-center shadow-lg">
              <svg className="w-7 h-7 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-display font-bold text-white tracking-tight">Investment Portfolio</h1>
              <p className="text-zinc-400 text-sm mt-1 font-body">
                Track, analyze, and compare your investment projects
              </p>
            </div>
          </motion.header>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex items-center justify-center py-20"
          >
            <div className="text-center p-10 card-premium rounded-2xl max-w-md">
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-zinc-800/80 flex items-center justify-center">
                <span className="material-symbols-outlined text-3xl text-zinc-500">folder_open</span>
              </div>
              <h3 className="text-2xl font-display font-bold text-white mb-3">No Projects Yet</h3>
              <p className="text-zinc-400 font-body mb-6">
                Start by using any calculator to create your first investment project. Your portfolio analytics will appear here.
              </p>
              <div className="stat-card text-left">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-emerald-400">lightbulb</span>
                  <p className="text-sm text-zinc-400 font-body">
                    <span className="text-zinc-300 font-medium">Tip:</span> Save projects from the calculator results to build your portfolio!
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mesh-gradient text-white -mx-4 md:-mx-10 lg:-mx-20 -my-8 px-6 py-8">
      {/* Atmospheric effects */}
      <div className="fixed inset-0 bg-grid-pattern opacity-20 pointer-events-none" />
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-40 left-1/3 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 max-w-[100%] mx-auto space-y-8"
      >
        {/* Header */}
        <motion.header
          variants={itemVariants}
          className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6"
        >
          <div className="flex items-center gap-4">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.6, ease: premiumEase, delay: 0.2 }}
              className="relative"
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600/20 to-purple-800/20 border border-purple-500/30 flex items-center justify-center shadow-lg">
                <svg className="w-7 h-7 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-purple-500 border-2 border-zinc-900 flex items-center justify-center">
                <span className="text-[8px] font-mono font-bold text-white">{projects.length}</span>
              </div>
            </motion.div>
            <div>
              <h1 className="text-3xl font-display font-bold text-white tracking-tight">Investment Portfolio</h1>
              <p className="text-zinc-400 text-sm mt-1 font-body">
                Track, analyze, and compare your investment projects
              </p>
            </div>
          </div>

          <motion.div
            variants={itemVariants}
            className="flex items-center gap-3 flex-wrap"
          >
            <button
              onClick={() => generatePortfolioComparisionPDF(projects)}
              disabled={projects.length === 0}
              className="btn-premium px-4 py-3 text-sm flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-lg">picture_as_pdf</span>
              Portfolio PDF
            </button>
            <button
              onClick={downloadCSV}
              disabled={filteredProjects.length === 0}
              className="btn-ghost px-4 py-3 text-sm flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-lg">download</span>
              Download CSV
            </button>
            {selectedForComparison.size > 1 && (
              <button
                onClick={() => generatePortfolioComparisionPDF(projectsForComparison)}
                className="px-4 py-3 bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-xl hover:bg-cyan-500/30 transition font-display font-medium flex items-center gap-2 text-sm"
              >
                <span className="material-symbols-outlined text-lg">compare_arrows</span>
                Compare ({selectedForComparison.size})
              </button>
            )}
          </motion.div>
        </motion.header>

        {/* Portfolio Summary Stats */}
        <motion.div variants={itemVariants}>
          <PortfolioStats projects={projects} />
        </motion.div>

        {/* Filters & Sorting */}
        <motion.div variants={itemVariants}>
          <PortfolioFilters projects={projects} onFiltersChange={setFilteredProjects} />
        </motion.div>

        {/* Analytics Charts */}
        <motion.div variants={itemVariants}>
          <PortfolioCharts projects={filteredProjects} />
        </motion.div>

        {/* Projects Grid */}
        <motion.div variants={itemVariants} className="space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="section-icon">
                <span className="material-symbols-outlined text-emerald-400">grid_view</span>
              </div>
              <h2 className="section-title">
                Projects <span className="text-zinc-500">({filteredProjects.length})</span>
              </h2>
            </div>
            {selectedForComparison.size > 0 && (
              <button
                onClick={() => setShowComparisonView(!showComparisonView)}
                className={`px-4 py-2.5 border rounded-xl text-sm font-display font-medium transition-all flex items-center gap-2 ${
                  showComparisonView
                    ? 'bg-cyan-500 text-white border-cyan-400 shadow-lg shadow-cyan-500/20'
                    : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/20'
                }`}
              >
                <span className="material-symbols-outlined text-lg">
                  {showComparisonView ? 'expand_less' : 'expand_more'}
                </span>
                {showComparisonView ? 'Hide Comparison' : `Compare ${selectedForComparison.size} projects`}
              </button>
            )}
          </div>

          {filteredProjects.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="card-premium rounded-2xl p-10 text-center"
            >
              <span className="material-symbols-outlined text-4xl text-zinc-600 mb-3">filter_list_off</span>
              <p className="text-zinc-400 font-body">No projects match your filters</p>
            </motion.div>
          ) : (
            <>
              {/* Grid View */}
              <motion.div
                variants={containerVariants}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
              >
                {filteredProjects.map((project, idx) => (
                  <motion.div
                    key={project.id}
                    variants={cardVariants}
                    className="relative"
                  >
                    {selectedForComparison.has(project.id) && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-2 -right-2 z-10"
                      >
                        <div className="w-7 h-7 bg-gradient-to-br from-emerald-500 to-cyan-500 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-lg">
                          ✓
                        </div>
                      </motion.div>
                    )}
                    <div
                      className={`cursor-pointer transition-all ${selectedForComparison.has(project.id) ? 'ring-2 ring-emerald-500/50 rounded-xl' : ''}`}
                      onClick={() => handleToggleComparison(project.id)}
                    >
                      <ProjectCard
                        project={project}
                        onView={setSelectedProject}
                        onViewScenarios={setScenarioViewProjectId}
                        onDelete={() => setShowDeleteConfirm(project.id)}
                      />
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              {/* Comparison View */}
              <AnimatePresence>
                {showComparisonView && projectsForComparison.length > 1 && (
                  <div ref={comparisonRef}>
                    <CrossCalculatorComparison projects={projectsForComparison} />
                  </div>
                )}
              </AnimatePresence>
            </>
          )}
        </motion.div>

        {/* Project Details Modal */}
        <AnimatePresence>
          {selectedProject && (
            <ProjectDetailsModal
              project={selectedProject}
              onClose={() => setSelectedProject(null)}
              onDelete={(id) => setShowDeleteConfirm(id)}
            />
          )}
        </AnimatePresence>

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {showDeleteConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ duration: 0.3, ease: premiumEase }}
                className="card-premium rounded-2xl p-6 max-w-sm w-full"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
                    <span className="material-symbols-outlined text-red-400">warning</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-display font-bold text-white">Delete Project?</h3>
                    <p className="text-sm text-zinc-400 font-body">This action cannot be undone</p>
                  </div>
                </div>
                <p className="text-zinc-400 mb-6 font-body">
                  The project and all its data will be permanently deleted.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteConfirm(null)}
                    className="flex-1 btn-ghost py-3 text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDeleteProject(showDeleteConfirm)}
                    className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition font-display font-medium text-sm"
                  >
                    Delete
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
