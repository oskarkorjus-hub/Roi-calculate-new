import { useState } from 'react';
import { usePortfolio } from '../hooks/usePortfolio';
import { generatePortfolioComparisionPDF } from '../utils/pdfExport';
import type { PortfolioProject } from '../types/portfolio';

interface ComparisonRow {
  label: string;
  key: string;
  format?: (value: any) => string;
}

const COMPARISON_ROWS: ComparisonRow[] = [
  {
    label: 'Total Investment',
    key: 'totalInvestment',
    format: (v) => formatCurrency(Number(v) || 0),
  },
  {
    label: 'ROI',
    key: 'roi',
    format: (v) => (Number(v) || 0).toFixed(1) + '%',
  },
  {
    label: 'Avg Cash Flow',
    key: 'avgCashFlow',
    format: (v) => formatCurrency(Number(v) || 0),
  },
  {
    label: 'Break-Even (months)',
    key: 'breakEvenMonths',
    format: (v) => (Number(v) || 0) + ' months',
  },
  {
    label: 'Investment Score',
    key: 'investmentScore',
    format: (v) => Math.round(Number(v) || 0) + '/100',
  },
];

export function ScenarioComparison() {
  const { projects } = usePortfolio();
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [showSavePrompt, setShowSavePrompt] = useState(false);
  const [comparisonName, setComparisonName] = useState('');

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

  const handleSaveComparison = () => {
    if (comparisonName.trim()) {
      // In a real app, this would be saved via usePortfolio
      setComparisonName('');
      setShowSavePrompt(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Selection Panel */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Select Projects to Compare</h2>
          {projects.length > 0 && (
            <button
              onClick={handleSelectAll}
              className="text-sm px-3 py-1.5 text-indigo-600 hover:bg-indigo-50 rounded border border-indigo-200"
            >
              {selectedProjects.length === projects.length ? 'Deselect All' : 'Select All'}
            </button>
          )}
        </div>

        {projects.length === 0 ? (
          <p className="text-gray-600 py-4">No projects available. Create some first!</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {projects.map(project => (
              <label key={project.id} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedProjects.includes(project.id)}
                  onChange={() => handleSelectProject(project.id)}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
                <div className="ml-3">
                  <div className="font-medium text-gray-900">{project.projectName}</div>
                  <div className="text-sm text-gray-600">{project.location}</div>
                </div>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Comparison Table */}
      {hasSelection && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 w-32">Metric</th>
                  {selectedProjectsList.map(project => (
                    <th
                      key={project.id}
                      className="px-6 py-3 text-left text-sm font-semibold text-gray-900 min-w-48"
                    >
                      <div className="font-bold">{project.projectName}</div>
                      <div className="text-xs text-gray-600 font-normal">{project.location}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map((row, idx) => {
                  const values = selectedProjectsList.map(p => p[row.key as keyof PortfolioProject]);
                  const maxValue = Math.max(...values.map(v => Number(v) || 0));
                  const minValue = Math.min(...values.map(v => Number(v) || 0));

                  return (
                    <tr key={row.key} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{row.label}</td>
                      {selectedProjectsList.map(project => {
                        const value = project[row.key as keyof PortfolioProject];
                        const numValue = Number(value) || 0;
                        const isMax = numValue === maxValue && maxValue !== minValue;
                        const isMin = numValue === minValue && maxValue !== minValue;

                        return (
                          <td
                            key={project.id}
                            className={`px-6 py-4 text-sm font-semibold ${
                              isMax ? 'bg-green-50 text-green-900' : isMin ? 'bg-red-50 text-red-900' : 'text-gray-900'
                            }`}
                          >
                            {row.format ? row.format(value ?? 0) : String(value ?? '-')}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Actions */}
          <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex gap-3">
            <button
              onClick={() => setShowSavePrompt(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium flex items-center gap-2"
            >
              💾 Save Comparison
            </button>
            <button
              onClick={() => generatePortfolioComparisionPDF(selectedProjectsList)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium flex items-center gap-2"
            >
              📊 PDF Report
            </button>
            <button
              onClick={() => {
                // Export to CSV
                exportComparison(selectedProjectsList);
              }}
              className="px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition font-medium flex items-center gap-2"
            >
              📥 CSV Export
            </button>
          </div>
        </div>
      )}

      {/* Save Comparison Modal */}
      {showSavePrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Save Comparison</h3>
            <input
              type="text"
              value={comparisonName}
              onChange={(e) => setComparisonName(e.target.value)}
              placeholder="e.g., Portfolio vs Alternatives"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent mb-4"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowSavePrompt(false)}
                className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveComparison}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function formatCurrency(value: number | undefined | null): string {
  const num = Number(value) || 0;
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1) + 'M';
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(0) + 'K';
  }
  return num.toFixed(0);
}

function exportComparison(projects: PortfolioProject[]) {
  // Generate CSV
  let csv = 'Metric,' + projects.map(p => p.projectName).join(',') + '\n';

  COMPARISON_ROWS.forEach(row => {
    const values = projects.map(p => {
      const value = p[row.key as keyof PortfolioProject];
      return row.format ? row.format(value ?? 0) : String(value ?? '-');
    });
    csv += row.label + ',' + values.join(',') + '\n';
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
