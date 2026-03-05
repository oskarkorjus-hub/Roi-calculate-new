import { useState } from 'react';
import { usePortfolio } from '../lib/portfolio-context';
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
            {projects.map(project => (
              <label key={project.id} className="flex items-center p-3 border border-zinc-700 rounded-lg hover:bg-zinc-800 cursor-pointer transition">
                <input
                  type="checkbox"
                  checked={selectedProjects.includes(project.id)}
                  onChange={() => handleSelectProject(project.id)}
                  className="w-4 h-4 rounded border-zinc-600 bg-zinc-800 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-zinc-900"
                />
                <div className="ml-3">
                  <div className="font-medium text-white">{project.projectName}</div>
                  <div className="text-sm text-zinc-400">{project.location}</div>
                </div>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Comparison Table */}
      {hasSelection && (
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-zinc-800/50 border-b border-zinc-800">
                  <th className="px-6 py-3 text-left text-sm font-semibold text-white w-32">Metric</th>
                  {selectedProjectsList.map(project => (
                    <th
                      key={project.id}
                      className="px-6 py-3 text-left text-sm font-semibold text-white min-w-48"
                    >
                      <div className="font-bold">{project.projectName}</div>
                      <div className="text-xs text-zinc-400 font-normal">{project.location}</div>
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
                    <tr key={row.key} className={idx % 2 === 0 ? 'bg-zinc-900' : 'bg-zinc-800/30'}>
                      <td className="px-6 py-4 text-sm font-medium text-zinc-300">{row.label}</td>
                      {selectedProjectsList.map(project => {
                        const value = project[row.key as keyof PortfolioProject];
                        const numValue = Number(value) || 0;
                        const isMax = numValue === maxValue && maxValue !== minValue;
                        const isMin = numValue === minValue && maxValue !== minValue;

                        return (
                          <td
                            key={project.id}
                            className={`px-6 py-4 text-sm font-semibold ${
                              isMax ? 'bg-emerald-500/10 text-emerald-400' : isMin ? 'bg-red-500/10 text-red-400' : 'text-white'
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
              onClick={() => {
                // Export to CSV
                exportComparison(selectedProjectsList);
              }}
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
            <input
              type="text"
              value={comparisonName}
              onChange={(e) => setComparisonName(e.target.value)}
              placeholder="e.g., Portfolio vs Alternatives"
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder:text-zinc-500 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none mb-4"
              autoFocus
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
                className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-medium"
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
