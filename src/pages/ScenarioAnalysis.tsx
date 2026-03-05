import { useState, useMemo } from 'react';
import type { PortfolioProject, ProjectScenario } from '../types/portfolio';
import { usePortfolio } from '../lib/portfolio-context';
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
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Project Not Found</h2>
          <button
            onClick={onBack}
            className="px-4 py-2 text-emerald-400 hover:text-emerald-300 underline"
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
    <div className="min-h-screen bg-[#0a0a0a] text-white -mx-4 md:-mx-10 lg:-mx-20 -my-8 px-6 py-8">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="max-w-[100%] mx-auto space-y-8">
        {/* Header */}
        <header className="mb-6 sm:mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center text-2xl">
              📊
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{project.projectName}</h1>
              <p className="text-zinc-500 text-sm mt-1">{project.location}</p>
            </div>
          </div>
          {onBack && (
            <button
              onClick={onBack}
              className="px-3 sm:px-4 py-3 min-h-[44px] bg-zinc-800 text-zinc-300 border border-zinc-700 rounded-lg hover:bg-zinc-700 transition font-medium flex items-center gap-2 text-xs sm:text-sm"
            >
              ← Back to Portfolio
            </button>
          )}
        </header>

        {/* Scenario Selector */}
        {scenarios.length > 0 && (
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
            <div className="mb-6 flex items-center border-b border-zinc-800 pb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-400">compare_arrows</span>
                <h2 className="text-xl font-bold text-white">Select Scenarios to Compare</h2>
              </div>
            </div>
            <p className="text-sm text-zinc-400 mb-4">
              Choose up to 4 scenarios. Selected: {selectedScenarios.length}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {scenarios.map(scenario => (
                <label
                  key={scenario.id}
                  className={`group relative p-4 rounded-xl border-2 cursor-pointer transition ${
                    selectedScenarioIds.includes(scenario.id)
                      ? 'border-emerald-500 bg-emerald-500/10'
                      : 'border-zinc-700 bg-zinc-800 hover:border-zinc-600'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedScenarioIds.includes(scenario.id)}
                    onChange={() => toggleScenarioSelection(scenario.id)}
                    disabled={
                      !selectedScenarioIds.includes(scenario.id) && selectedScenarioIds.length >= 4
                    }
                    className="absolute top-3 right-3 w-4 h-4 cursor-pointer accent-emerald-500"
                  />

                  <div className="pr-8">
                    <h3 className="font-semibold text-white">{scenario.name}</h3>
                    <div className="mt-2 space-y-1 text-sm text-zinc-400">
                      <div>ROI: <span className="text-emerald-400">{(scenario.results.roi || 0).toFixed(1)}%</span></div>
                      <div>Cash Flow: ${(scenario.results.avgCashFlow || 0).toLocaleString()}</div>
                      <div>Break-Even: {scenario.results.breakEvenMonths || 0}m</div>
                    </div>
                  </div>

                  {/* Action Menu */}
                  <div className="absolute top-3 left-3 flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition">
                    <button
                      onClick={e => {
                        e.preventDefault();
                        setRenamingId(scenario.id);
                        setNewName(scenario.name);
                      }}
                      className="text-xs px-3 py-2 min-w-[44px] min-h-[44px] bg-cyan-500/20 text-cyan-400 rounded hover:bg-cyan-500/30 flex items-center justify-center"
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
                      className="text-xs px-3 py-2 min-w-[44px] min-h-[44px] bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 flex items-center justify-center"
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
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6 max-w-sm w-full">
              <h3 className="text-lg font-bold text-white mb-4">Rename Scenario</h3>
              <input
                type="text"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent mb-4 outline-none"
                autoFocus
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setRenamingId(null)}
                  className="flex-1 px-4 py-2 border border-zinc-700 text-zinc-300 rounded-lg hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleRenameScenario(renamingId, newName)}
                  className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
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
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6">
                <h3 className="text-lg font-bold text-emerald-400 mb-2">🏆 Best Overall Scenario</h3>
                <p className="text-zinc-300">
                  <span className="font-semibold text-white">{winner.name}</span> is the most profitable scenario with a
                  composite score of {winner.score?.toFixed(0)}.
                </p>
              </div>
            )}

            {/* Metrics Table */}
            <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
              <div className="mb-6 flex items-center border-b border-zinc-800 pb-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-400">table_chart</span>
                  <h3 className="text-xl font-bold text-white">Detailed Comparison</h3>
                </div>
              </div>
              <ScenarioComparatorTable
                scenarios={selectedScenarios}
                baselineScenario={baselineScenario}
                calculatorId={project.calculatorId}
              />
            </div>

            {/* Charts */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Visual Analysis</h3>
              <ScenarioComparisonCharts
                scenarios={selectedScenarios}
                baselineScenario={baselineScenario}
              />
            </div>

            {/* Summary */}
            <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
              <div className="mb-6 flex items-center border-b border-zinc-800 pb-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-400">summarize</span>
                  <h3 className="text-xl font-bold text-white">Analysis Summary</h3>
                </div>
              </div>
              <div className="space-y-3 text-sm text-zinc-400">
                <p>
                  <strong className="text-white">Scenarios Compared:</strong> {selectedScenarios.length + 1} (including baseline)
                </p>
                <p>
                  <strong className="text-white">ROI Range:</strong> <span className="text-emerald-400">{Math.min(baselineScenario.results.roi, ...selectedScenarios.map(s => s.results.roi)).toFixed(1)}%</span> -{' '}
                  <span className="text-emerald-400">{Math.max(baselineScenario.results.roi, ...selectedScenarios.map(s => s.results.roi)).toFixed(1)}%</span>
                </p>
                <p>
                  <strong className="text-white">Cash Flow Variation:</strong> ${(Math.max(baselineScenario.results.avgCashFlow, ...selectedScenarios.map(s => s.results.avgCashFlow)) - Math.min(baselineScenario.results.avgCashFlow, ...selectedScenarios.map(s => s.results.avgCashFlow))).toLocaleString()}/month
                </p>
                <p className="pt-2 italic text-zinc-500">
                  All metrics are based on calculator inputs. Consider external factors when making investment decisions.
                </p>
              </div>
            </div>
          </div>
        )}

        {scenarios.length === 0 && (
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-12 text-center">
            <h3 className="text-lg font-semibold text-white mb-2">No Scenarios Yet</h3>
            <p className="text-zinc-400">
              Create a scenario variant to compare different investment parameters and strategies.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
