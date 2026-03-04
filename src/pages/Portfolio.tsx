import { useState, useCallback, useMemo } from 'react';
import { usePortfolio } from '../hooks/usePortfolio';
import { PortfolioStats } from '../components/PortfolioStats';
import { PortfolioFilters } from '../components/PortfolioFilters';
import { PortfolioCharts } from '../components/PortfolioCharts';
import { ProjectCard } from '../components/ProjectCard';
import { ScenarioAnalysisPage } from './ScenarioAnalysis';
import type { PortfolioProject } from '../types/portfolio';
import { generateProjectPDF, generatePortfolioComparisionPDF } from '../utils/pdfExport';

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
      <div className="text-center py-12">
        <div className="inline-block p-8 bg-indigo-50 rounded-lg">
          <div className="text-4xl mb-3">📊</div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">No Projects Yet</h3>
          <p className="text-gray-600 max-w-sm mb-4">
            Start by using any calculator to create your first investment project. Your portfolio analytics will appear here.
          </p>
          <p className="text-sm text-gray-500">
            💡 Tip: Save projects from the calculator results to build your portfolio!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Investment Portfolio</h1>
        <p className="text-gray-600">Track, analyze, and compare your investment projects</p>
      </div>

      {/* Portfolio Summary Stats */}
      <PortfolioStats projects={projects} />

      {/* Export Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h2 className="font-bold text-gray-900 mb-3">📥 Export & Reports</h2>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => generatePortfolioComparisionPDF(projects)}
            disabled={projects.length === 0}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
          >
            📊 Portfolio PDF Report
          </button>
          <button
            onClick={downloadCSV}
            disabled={filteredProjects.length === 0}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
          >
            📥 Download CSV
          </button>
          {selectedForComparison.size > 1 && (
            <button
              onClick={() => generatePortfolioComparisionPDF(projectsForComparison)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium flex items-center gap-2"
            >
              ⚖️ Compare ({selectedForComparison.size})
            </button>
          )}
        </div>
      </div>

      {/* Filters & Sorting */}
      <PortfolioFilters projects={projects} onFiltersChange={setFilteredProjects} />

      {/* Analytics Charts */}
      <PortfolioCharts projects={filteredProjects} />

      {/* Projects Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            Projects ({filteredProjects.length})
          </h2>
          {selectedForComparison.size > 0 && (
            <button
              onClick={() => setShowComparisonView(!showComparisonView)}
              className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition"
            >
              Comparing {selectedForComparison.size} projects
            </button>
          )}
        </div>

        {filteredProjects.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <p className="text-gray-600">No projects match your filters</p>
          </div>
        ) : (
          <>
            {/* Grid View */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProjects.map(project => (
                <div key={project.id} className="relative">
                  {selectedForComparison.has(project.id) && (
                    <div className="absolute -top-2 -right-2 z-10">
                      <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                        ✓
                      </div>
                    </div>
                  )}
                  <div
                    className={`cursor-pointer transition-opacity ${selectedForComparison.has(project.id) ? 'opacity-100 ring-2 ring-blue-500 rounded-lg' : 'opacity-100'}`}
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
              <div className="bg-white rounded-lg border border-gray-200 p-6 mt-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Project Comparison</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold text-gray-900">Project</th>
                        <th className="px-4 py-3 text-right font-semibold text-gray-900">Investment</th>
                        <th className="px-4 py-3 text-right font-semibold text-gray-900">ROI %</th>
                        <th className="px-4 py-3 text-right font-semibold text-gray-900">Cash Flow</th>
                        <th className="px-4 py-3 text-right font-semibold text-gray-900">Break-even</th>
                        <th className="px-4 py-3 text-right font-semibold text-gray-900">Score</th>
                        <th className="px-4 py-3 text-right font-semibold text-gray-900">Strategy</th>
                      </tr>
                    </thead>
                    <tbody>
                      {projectsForComparison.map((project, idx) => (
                        <tr key={project.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-4 py-3 font-semibold text-gray-900">{project.projectName}</td>
                          <td className="px-4 py-3 text-right text-gray-700">
                            {(project.totalInvestment / 1_000_000).toFixed(1)}M
                          </td>
                          <td className={`px-4 py-3 text-right font-semibold ${(project.roi || 0) >= 20 ? 'text-green-600' : 'text-orange-600'}`}>
                            {(project.roi || 0).toFixed(1)}%
                          </td>
                          <td className="px-4 py-3 text-right text-gray-700">
                            {(project.avgCashFlow / 1_000).toFixed(0)}K
                          </td>
                          <td className="px-4 py-3 text-right text-gray-700">{project.breakEvenMonths}m</td>
                          <td className="px-4 py-3 text-right font-bold">
                            <span className={`px-2 py-1 rounded ${project.investmentScore >= 85 ? 'bg-green-100 text-green-700' : project.investmentScore >= 70 ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                              {project.investmentScore}/100
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right text-gray-700 capitalize">
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-start">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{selectedProject.projectName}</h3>
                <p className="text-gray-600">{selectedProject.location}</p>
              </div>
              <button
                onClick={() => setSelectedProject(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Key Metrics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-xs text-gray-600 font-medium">Investment</div>
                  <div className="text-2xl font-bold text-gray-900 mt-1">
                    ${(selectedProject.totalInvestment / 1_000_000).toFixed(1)}M
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-xs text-gray-600 font-medium">ROI</div>
                  <div className={`text-2xl font-bold mt-1 ${(selectedProject.roi || 0) >= 20 ? 'text-green-600' : 'text-orange-600'}`}>
                    {(selectedProject.roi || 0).toFixed(1)}%
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-xs text-gray-600 font-medium">Score</div>
                  <div className="text-2xl font-bold text-gray-900 mt-1">
                    {Math.round(selectedProject.investmentScore)}/100
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-xs text-gray-600 font-medium">Annual Cash Flow</div>
                  <div className="text-2xl font-bold text-gray-900 mt-1">
                    ${(selectedProject.avgCashFlow / 1_000).toFixed(0)}K
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-xs text-gray-600 font-medium">Break-Even</div>
                  <div className="text-2xl font-bold text-gray-900 mt-1">
                    {selectedProject.breakEvenMonths} months
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-xs text-gray-600 font-medium">Status</div>
                  <div className="text-lg font-bold text-gray-900 mt-1 capitalize">
                    {selectedProject.status || 'Active'}
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="text-xs text-gray-600 font-medium mb-2">Score Breakdown</div>
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div>
                    <div className="text-sm font-bold text-gray-900">
                      {Math.round((selectedProject.roi_score || 0 / 5) * 100)}%
                    </div>
                    <div className="text-xs text-gray-600">ROI</div>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-gray-900">
                      {Math.round((selectedProject.cashflow_score || 0 / 3) * 100)}%
                    </div>
                    <div className="text-xs text-gray-600">Cash Flow</div>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-gray-900">
                      {Math.round((selectedProject.stability_score || 0 / 2) * 100)}%
                    </div>
                    <div className="text-xs text-gray-600">Stability</div>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-gray-900">
                      {Math.round((selectedProject.location_score || 0) * 100)}%
                    </div>
                    <div className="text-xs text-gray-600">Location</div>
                  </div>
                </div>
              </div>

              <div className="text-xs text-gray-500 border-t border-gray-200 pt-4">
                Created: {new Date(selectedProject.createdAt).toLocaleDateString()}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 border-t border-gray-200 pt-4">
                <button
                  onClick={() => setSelectedProject(null)}
                  className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded hover:bg-gray-50 transition font-medium"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    generateProjectPDF(selectedProject);
                    setSelectedProject(null);
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition font-medium"
                >
                  Download PDF
                </button>
                <button
                  onClick={() => {
                    setShowDeleteConfirm(selectedProject.id);
                    setSelectedProject(null);
                  }}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Project?</h3>
            <p className="text-gray-600 mb-6">
              This action cannot be undone. The project and all its data will be permanently deleted.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded hover:bg-gray-50 transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteProject(showDeleteConfirm)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition font-medium"
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
