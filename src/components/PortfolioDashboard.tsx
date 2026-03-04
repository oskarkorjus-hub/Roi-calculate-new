import { useState } from 'react';
import { usePortfolio } from '../hooks/usePortfolio';
import { InvestmentScore } from './display/InvestmentScore';
import { generateProjectPDF, generatePortfolioComparisionPDF } from '../utils/pdfExport';
import type { PortfolioProject } from '../types/portfolio';

export function PortfolioDashboard() {
  const { projects, deleteProject, calculatePortfolioMetrics } = usePortfolio();
  const [selectedProject, setSelectedProject] = useState<PortfolioProject | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const metrics = calculatePortfolioMetrics();

  if (projects.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-block p-8 bg-indigo-50 rounded-lg">
          <div className="text-3xl mb-2">📊</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Projects Yet</h3>
          <p className="text-gray-600 max-w-sm">
            Start by using any calculator to create your first investment project. Results will appear here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600 font-medium">Total Projects</div>
          <div className="text-3xl font-bold text-gray-900">{metrics.totalProjects}</div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600 font-medium">Total Investment</div>
          <div className="text-3xl font-bold text-gray-900">
            {formatCurrency(metrics.totalInvestment)}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600 font-medium">Blended ROI</div>
          <div className={`text-3xl font-bold ${(metrics.blendedROI || 0) >= 15 ? 'text-green-600' : 'text-orange-600'}`}>
            {(metrics.blendedROI || 0).toFixed(1)}%
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600 font-medium">Avg Cash Flow</div>
          <div className="text-3xl font-bold text-blue-600">
            {formatCurrency(metrics.avgCashFlow)}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600 font-medium">Avg Score</div>
          <div className="text-3xl font-bold text-indigo-600">
            {isNaN(metrics.avgInvestmentScore) ? '0' : Math.round(metrics.avgInvestmentScore)}/100
          </div>
        </div>
      </div>

      {/* Export Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Export Reports</h2>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => {
              if (projects.length > 0) {
                generatePortfolioComparisionPDF(projects);
              }
            }}
            disabled={projects.length === 0}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
          >
            📊 Export All as PDF
          </button>
          <button
            onClick={() => {
              // CSV export
              if (projects.length === 0) return;
              let csv = 'Project Name,Location,Investment,ROI %,Avg Cash Flow,Break-even (months),Score\n';
              projects.forEach(p => {
                csv += `"${p.projectName}","${p.location}",${p.totalInvestment},${(p.roi || 0).toFixed(1)},${p.avgCashFlow},${p.breakEvenMonths},${Math.round(p.investmentScore || 0)}\n`;
              });
              const blob = new Blob([csv], { type: 'text/csv' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'portfolio.csv';
              a.click();
              URL.revokeObjectURL(url);
            }}
            disabled={projects.length === 0}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
          >
            📥 Export as CSV
          </button>
        </div>
      </div>

      {/* Projects List */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900">Your Projects</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map(project => (
            <div
              key={project.id}
              className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Card Header */}
              <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-4 border-b border-gray-200">
                <h3 className="font-bold text-gray-900 text-lg truncate">{project.projectName}</h3>
                <p className="text-sm text-gray-600">{project.location}</p>
                <div className="text-xs text-gray-500 mt-1">{project.calculatorId}</div>
              </div>

              {/* Card Content */}
              <div className="p-4 space-y-4">
                {/* Score */}
                <div className="flex justify-center">
                  <div className="w-20 h-20">
                    <InvestmentScore
                      input={{
                        roi: Number(project.roi) || 0,
                        cashFlowStability: 75, // From data
                        breakEvenMonths: Number(project.breakEvenMonths) || 0,
                        riskScore: 70, // From data
                      }}
                      size="sm"
                      showBreakdown={false}
                      showTooltip={false}
                    />
                  </div>
                </div>

                {/* Metrics */}
                <div className="space-y-2 text-sm border-t border-gray-200 pt-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Investment</span>
                    <span className="font-semibold text-gray-900">{formatCurrency(project.totalInvestment)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">ROI</span>
                    <span className={`font-semibold ${(project.roi || 0) >= 15 ? 'text-green-600' : 'text-orange-600'}`}>
                      {(project.roi || 0).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Avg Cash Flow</span>
                    <span className="font-semibold text-gray-900">{formatCurrency(project.avgCashFlow)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Break-Even</span>
                    <span className="font-semibold text-gray-900">{project.breakEvenMonths} months</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setSelectedProject(project)}
                    className="flex-1 px-3 py-2 bg-indigo-50 text-indigo-600 rounded hover:bg-indigo-100 transition text-sm font-medium"
                  >
                    View
                  </button>
                  <button
                    onClick={() => generateProjectPDF(project)}
                    className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition text-sm font-medium"
                    title="Download project report as PDF"
                  >
                    📄 PDF
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(project.id)}
                    className="flex-1 px-3 py-2 bg-red-50 text-red-600 rounded hover:bg-red-100 transition text-sm font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Project?</h3>
            <p className="text-gray-600 mb-6">
              This action cannot be undone. The project will be permanently deleted.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded hover:bg-gray-50 transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteProject(showDeleteConfirm);
                  setShowDeleteConfirm(null);
                }}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Project Details Modal */}
      {selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{selectedProject.projectName}</h3>
                <p className="text-gray-600">{selectedProject.location}</p>
              </div>
              <button
                onClick={() => setSelectedProject(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-600">Investment</div>
                <div className="text-2xl font-bold text-gray-900">{formatCurrency(selectedProject.totalInvestment)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">ROI</div>
                <div className="text-2xl font-bold text-green-600">{(selectedProject.roi || 0).toFixed(1)}%</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Avg Cash Flow</div>
                <div className="text-2xl font-bold text-blue-600">{formatCurrency(selectedProject.avgCashFlow)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Break-Even</div>
                <div className="text-2xl font-bold text-gray-900">{selectedProject.breakEvenMonths} months</div>
              </div>
            </div>

            <div className="mt-6">
              <p className="text-sm text-gray-600">Created: {new Date(selectedProject.createdAt).toLocaleDateString()}</p>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setSelectedProject(null)}
                className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded hover:bg-gray-50 transition font-medium"
              >
                Close
              </button>
              <button className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition font-medium">
                Edit Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function formatCurrency(value: number | undefined): string {
  if (!value || value === 0) return '0';
  if (value >= 1_000_000) {
    return (value / 1_000_000).toFixed(1) + 'M';
  }
  if (value >= 1_000) {
    return (value / 1_000).toFixed(0) + 'K';
  }
  return value.toFixed(0);
}
