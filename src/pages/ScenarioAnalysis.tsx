import { useState, useMemo } from 'react';
import type { PortfolioProject, ProjectScenario } from '../types/portfolio';
import { usePortfolio } from '../hooks/usePortfolio';
import { useScenarios } from '../hooks/useScenarios';
import { ScenarioComparatorTable } from '../components/ScenarioComparatorTable';
import { ScenarioComparisonCharts } from '../components/ScenarioComparisonCharts';
import { Toast } from '../components/ui/Toast';

interface ScenarioAnalysisPageProps {
  projectId: string;
  onBack?: () => void;
}

export function ScenarioAnalysisPage({ projectId, onBack }: ScenarioAnalysisPageProps) {
  const { getProjectById, updateProject } = usePortfolio();
  const { deleteScenario, calculateWinner } = useScenarios();

  const project = getProjectById(projectId);
  const [selectedScenarioIds, setSelectedScenarioIds] = useState<string[]>([]);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [newName, setNewName] = useState('');

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Project Not Found</h2>
          <button
            onClick={onBack}
            className="px-4 py-2 text-indigo-600 hover:text-indigo-700 underline"
          >
            ← Back
          </button>
        </div>
      </div>
    );
  }

  const scenarios = project.scenarios || [];
  const selectedScenarios = scenarios.filter(s => selectedScenarioIds.includes(s.id));
  const baselineScenario: ProjectScenario = {
    id: project.id,
    name: 'Baseline (Original)',
    baseProjectId: project.id,
    inputs: project.data || {},
    results: {
      roi: project.roi,
      avgCashFlow: project.avgCashFlow,
      breakEvenMonths: project.breakEvenMonths,
      totalInvestment: project.totalInvestment,
    },
    createdAt: project.createdAt,
    isBaseline: true,
  };

  const winner = useMemo(
    () => calculateWinner([baselineScenario, ...selectedScenarios]),
    [selectedScenarios, baselineScenario, calculateWinner]
  );

  const handleDeleteScenario = (scenarioId: string) => {
    deleteScenario(projectId, scenarioId);
    setSelectedScenarioIds(prev => prev.filter(id => id !== scenarioId));
    setToast({ message: 'Scenario deleted', type: 'success' });
  };

  const handleRenameScenario = (scenarioId: string, newScenarioName: string) => {
    const updatedScenarios = (project.scenarios || []).map(s =>
      s.id === scenarioId ? { ...s, name: newScenarioName } : s
    );
    updateProject(projectId, { scenarios: updatedScenarios });
    setRenamingId(null);
    setNewName('');
    setToast({ message: 'Scenario renamed', type: 'success' });
  };

  const toggleScenarioSelection = (scenarioId: string) => {
    setSelectedScenarioIds(prev =>
      prev.includes(scenarioId)
        ? prev.filter(id => id !== scenarioId)
        : [...prev, scenarioId].slice(-4) // Max 4 scenarios selected
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="max-w-7xl mx-auto px-4 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{project.projectName}</h1>
            <p className="text-gray-600 mt-1">{project.location}</p>
          </div>
          {onBack && (
            <button
              onClick={onBack}
              className="px-4 py-2 text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-2"
            >
              ← Back
            </button>
          )}
        </div>

        {/* Scenario Selector */}
        {scenarios.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Scenarios to Compare</h2>
            <p className="text-sm text-gray-600 mb-4">
              Choose up to 4 scenarios. Selected: {selectedScenarios.length}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {scenarios.map(scenario => (
                <label
                  key={scenario.id}
                  className={`relative p-4 rounded-lg border-2 cursor-pointer transition ${
                    selectedScenarioIds.includes(scenario.id)
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedScenarioIds.includes(scenario.id)}
                    onChange={() => toggleScenarioSelection(scenario.id)}
                    disabled={
                      !selectedScenarioIds.includes(scenario.id) && selectedScenarioIds.length >= 4
                    }
                    className="absolute top-3 right-3 w-4 h-4 cursor-pointer"
                  />

                  <div className="pr-8">
                    <h3 className="font-semibold text-gray-900">{scenario.name}</h3>
                    <div className="mt-2 space-y-1 text-sm text-gray-600">
                      <div>ROI: {(scenario.results.roi || 0).toFixed(1)}%</div>
                      <div>Cash Flow: ${(scenario.results.avgCashFlow || 0).toLocaleString()}</div>
                      <div>Break-Even: {scenario.results.breakEvenMonths || 0}m</div>
                    </div>
                  </div>

                  {/* Action Menu */}
                  <div className="absolute top-3 left-3 flex gap-1 opacity-0 hover:opacity-100 transition">
                    <button
                      onClick={e => {
                        e.preventDefault();
                        setRenamingId(scenario.id);
                        setNewName(scenario.name);
                      }}
                      className="text-xs px-2 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={e => {
                        e.preventDefault();
                        if (confirm(`Delete "${scenario.name}"?`)) {
                          handleDeleteScenario(scenario.id);
                        }
                      }}
                      className="text-xs px-2 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200"
                    >
                      🗑️
                    </button>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Rename Modal */}
        {renamingId && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Rename Scenario</h3>
              <input
                type="text"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent mb-4"
                autoFocus
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setRenamingId(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleRenameScenario(renamingId, newName)}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Comparison Results */}
        {selectedScenarios.length > 0 && (
          <div className="space-y-8">
            {/* Winner Badge */}
            {winner && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 p-6 rounded-lg">
                <h3 className="text-lg font-bold text-green-900 mb-2">🏆 Best Overall Scenario</h3>
                <p className="text-green-800">
                  <span className="font-semibold">{winner.name}</span> is the most profitable scenario with a
                  composite score of {winner.score?.toFixed(0)}.
                </p>
              </div>
            )}

            {/* Metrics Table */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Comparison</h3>
              <ScenarioComparatorTable
                scenarios={selectedScenarios}
                baselineScenario={baselineScenario}
              />
            </div>

            {/* Charts */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Visual Analysis</h3>
              <ScenarioComparisonCharts
                scenarios={selectedScenarios}
                baselineScenario={baselineScenario}
              />
            </div>

            {/* Summary */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Analysis Summary</h3>
              <div className="space-y-3 text-sm text-gray-700">
                <p>
                  <strong>Scenarios Compared:</strong> {selectedScenarios.length + 1} (including baseline)
                </p>
                <p>
                  <strong>ROI Range:</strong> {Math.min(baselineScenario.results.roi, ...selectedScenarios.map(s => s.results.roi)).toFixed(1)}% -{' '}
                  {Math.max(baselineScenario.results.roi, ...selectedScenarios.map(s => s.results.roi)).toFixed(1)}%
                </p>
                <p>
                  <strong>Cash Flow Variation:</strong> ${(Math.max(baselineScenario.results.avgCashFlow, ...selectedScenarios.map(s => s.results.avgCashFlow)) - Math.min(baselineScenario.results.avgCashFlow, ...selectedScenarios.map(s => s.results.avgCashFlow))).toLocaleString()}/month
                </p>
                <p className="pt-2 italic text-gray-600">
                  All metrics are based on calculator inputs. Consider external factors when making investment decisions.
                </p>
              </div>
            </div>
          </div>
        )}

        {scenarios.length === 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Scenarios Yet</h3>
            <p className="text-gray-600">
              Create a scenario variant to compare different investment parameters and strategies.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
