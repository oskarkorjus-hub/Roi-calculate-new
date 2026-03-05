import { useState, useCallback, useMemo } from 'react';
import { usePortfolio } from '../lib/portfolio-context';
import { PortfolioStats } from '../components/PortfolioStats';
import { PortfolioFilters } from '../components/PortfolioFilters';
import { PortfolioCharts } from '../components/PortfolioCharts';
import { ProjectCard } from '../components/ProjectCard';
import { ProjectDetailsModal } from '../components/ProjectDetailsModal';
import { ScenarioAnalysisPage } from './ScenarioAnalysis';
import type { PortfolioProject } from '../types/portfolio';
import { generatePortfolioComparisionPDF } from '../utils/pdfExport';

export function Portfolio() {
  const { projects, deleteProject } = usePortfolio();
  const [filteredProjects, setFilteredProjects] = useState<PortfolioProject[]>(projects);
  const [selectedProject, setSelectedProject] = useState<PortfolioProject | null>(null);
  const [scenarioViewProjectId, setScenarioViewProjectId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [selectedForComparison, setSelectedForComparison] = useState<Set<string>>(new Set());
  const [showComparisonView, setShowComparisonView] = useState(false);

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

  if (projects.length === 0) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white -mx-4 md:-mx-10 lg:-mx-20 -my-8 px-6 py-8">
        <div className="max-w-[100%] mx-auto">
          <header className="mb-8 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center shadow-lg shadow-purple-900/30">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Investment Portfolio</h1>
              <p className="text-zinc-500 text-sm mt-1">
                Track, analyze, and compare your investment projects
              </p>
            </div>
          </header>

          <div className="flex items-center justify-center py-20">
            <div className="text-center p-8 bg-zinc-900 rounded-xl border border-zinc-800">
              <h3 className="text-2xl font-bold text-white mb-3">No Projects Yet</h3>
              <p className="text-zinc-400 max-w-sm mb-4">
                Start by using any calculator to create your first investment project. Your portfolio analytics will appear here.
              </p>
              <p className="text-sm text-zinc-500">
                Tip: Save projects from the calculator results to build your portfolio!
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white -mx-4 md:-mx-10 lg:-mx-20 -my-8 px-6 py-8">
      <div className="max-w-[100%] mx-auto space-y-6">
        {/* Header */}
        <header className="mb-6 sm:mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center shadow-lg shadow-purple-900/30">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Investment Portfolio</h1>
              <p className="text-zinc-500 text-sm mt-1">
                Track, analyze, and compare your investment projects
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => generatePortfolioComparisionPDF(projects)}
              disabled={projects.length === 0}
              className="px-3 sm:px-4 py-3 min-h-[44px] bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-medium disabled:bg-zinc-700 disabled:cursor-not-allowed flex items-center gap-2 text-xs sm:text-sm"
            >
              Portfolio PDF
            </button>
            <button
              onClick={downloadCSV}
              disabled={filteredProjects.length === 0}
              className="px-3 sm:px-4 py-3 min-h-[44px] bg-zinc-800 text-zinc-300 border border-zinc-700 rounded-lg hover:bg-zinc-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-xs sm:text-sm"
            >
              Download CSV
            </button>
            {selectedForComparison.size > 1 && (
              <button
                onClick={() => generatePortfolioComparisionPDF(projectsForComparison)}
                className="px-3 sm:px-4 py-3 min-h-[44px] bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition font-medium flex items-center gap-2 text-xs sm:text-sm"
              >
                Compare ({selectedForComparison.size})
              </button>
            )}
          </div>
        </header>

        {/* Portfolio Summary Stats */}
        <PortfolioStats projects={projects} />

      {/* Filters & Sorting */}
      <PortfolioFilters projects={projects} onFiltersChange={setFilteredProjects} />

      {/* Analytics Charts */}
      <PortfolioCharts projects={filteredProjects} />

      {/* Projects Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">
            Projects ({filteredProjects.length})
          </h2>
          {selectedForComparison.size > 0 && (
            <button
              onClick={() => setShowComparisonView(!showComparisonView)}
              className="px-3 py-2 min-h-[44px] bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-lg text-xs sm:text-sm font-medium hover:bg-cyan-500/30 transition"
            >
              Comparing {selectedForComparison.size} projects
            </button>
          )}
        </div>

        {filteredProjects.length === 0 ? (
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-8 text-center">
            <p className="text-zinc-400">No projects match your filters</p>
          </div>
        ) : (
          <>
            {/* Grid View */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProjects.map(project => (
                <div key={project.id} className="relative">
                  {selectedForComparison.has(project.id) && (
                    <div className="absolute -top-2 -right-2 z-10">
                      <div className="w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                        ✓
                      </div>
                    </div>
                  )}
                  <div
                    className={`cursor-pointer transition-opacity ${selectedForComparison.has(project.id) ? 'opacity-100 ring-2 ring-emerald-500 rounded-xl' : 'opacity-100'}`}
                    onClick={() => handleToggleComparison(project.id)}
                  >
                    <ProjectCard
                      project={project}
                      onView={setSelectedProject}
                      onViewScenarios={setScenarioViewProjectId}
                      onDelete={() => setShowDeleteConfirm(project.id)}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Comparison View */}
            {showComparisonView && projectsForComparison.length > 1 && (
              <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-4 sm:p-6 mt-6">
                <h3 className="text-lg font-bold text-white mb-4">Project Comparison</h3>
                <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
                  <table className="w-full text-xs sm:text-sm min-w-[640px]">
                    <thead className="bg-zinc-800 border-b border-zinc-700">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold text-zinc-300">Project</th>
                        <th className="px-4 py-3 text-right font-semibold text-zinc-300">Investment</th>
                        <th className="px-4 py-3 text-right font-semibold text-zinc-300">ROI %</th>
                        <th className="px-4 py-3 text-right font-semibold text-zinc-300">Cash Flow</th>
                        <th className="px-4 py-3 text-right font-semibold text-zinc-300">Break-even</th>
                        <th className="px-4 py-3 text-right font-semibold text-zinc-300">Score</th>
                        <th className="px-4 py-3 text-right font-semibold text-zinc-300">Strategy</th>
                      </tr>
                    </thead>
                    <tbody>
                      {projectsForComparison.map((project, idx) => (
                        <tr key={project.id} className={`border-b border-zinc-800 ${idx % 2 === 0 ? 'bg-zinc-900' : 'bg-zinc-800/50'}`}>
                          <td className="px-4 py-3 font-semibold text-white">{project.projectName}</td>
                          <td className="px-4 py-3 text-right text-zinc-400">
                            {(project.totalInvestment / 1_000_000).toFixed(1)}M
                          </td>
                          <td className={`px-4 py-3 text-right font-semibold ${(project.roi || 0) >= 20 ? 'text-emerald-400' : 'text-orange-400'}`}>
                            {(project.roi || 0).toFixed(1)}%
                          </td>
                          <td className="px-4 py-3 text-right text-zinc-400">
                            {(project.avgCashFlow / 1_000).toFixed(0)}K
                          </td>
                          <td className="px-4 py-3 text-right text-zinc-400">{project.breakEvenMonths}m</td>
                          <td className="px-4 py-3 text-right font-bold">
                            <span className={`px-2 py-1 rounded ${project.investmentScore >= 85 ? 'bg-emerald-500/20 text-emerald-400' : project.investmentScore >= 70 ? 'bg-cyan-500/20 text-cyan-400' : 'bg-orange-500/20 text-orange-400'}`}>
                              {project.investmentScore}/100
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right text-zinc-400 capitalize">
                            {project.strategy || 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Project Details Modal */}
      {selectedProject && (
        <ProjectDetailsModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
          onDelete={(id) => setShowDeleteConfirm(id)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold text-white mb-2">Delete Project?</h3>
            <p className="text-zinc-400 mb-6">
              This action cannot be undone. The project and all its data will be permanently deleted.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 px-3 sm:px-4 py-3 min-h-[44px] text-zinc-300 border border-zinc-700 rounded-lg hover:bg-zinc-800 transition font-medium text-xs sm:text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteProject(showDeleteConfirm)}
                className="flex-1 px-3 sm:px-4 py-3 min-h-[44px] bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium text-xs sm:text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      </div>
    </div>
  );
}
