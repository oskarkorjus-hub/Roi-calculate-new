import { useState, useMemo } from 'react';
import type { PortfolioProject } from '../types/portfolio';
import { useScenarios } from '../hooks/useScenarios';
import { Toast } from './ui/Toast';

interface ScenarioCreatorProps {
  project: PortfolioProject;
  onScenarioCreated?: () => void;
  variant?: 'default' | 'minimal';
}

export function ScenarioCreator({ project, onScenarioCreated, variant = 'default' }: ScenarioCreatorProps) {
  const { createScenario } = useScenarios();
  const [showModal, setShowModal] = useState(false);
  const [scenarioName, setScenarioName] = useState('');
  const [inputs, setInputs] = useState<Record<string, any>>(project.data || {});
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const hasCriticalChanges = useMemo(() => {
    if (!project.data) return false;
    const keyFields = ['propertyPrice', 'purchasePrice', 'rentalIncome', 'monthlyRentalIncome', 'investmentAmount', 'loanAmount'];
    return keyFields.some(field => inputs[field] !== project.data[field]);
  }, [inputs, project.data]);

  const handleInputChange = (key: string, value: any) => {
    setInputs(prev => ({ ...prev, [key]: value }));
  };

  const handleCreate = async () => {
    if (!scenarioName.trim()) {
      setToast({ message: 'Scenario name is required', type: 'error' });
      return;
    }

    setIsSaving(true);
    try {
      createScenario(project, scenarioName, inputs);
      setToast({ message: `Scenario "${scenarioName}" created successfully!`, type: 'success' });
      setShowModal(false);
      setScenarioName('');
      setInputs(project.data || {});
      onScenarioCreated?.();
    } catch (error) {
      setToast({ message: 'Failed to create scenario', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const buttonClass = variant === 'minimal'
    ? 'px-3 py-1.5 text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg transition'
    : 'px-3 py-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition text-sm font-medium';

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <button
        onClick={() => setShowModal(true)}
        className={buttonClass}
        title="Create a scenario variant of this project"
      >
        {variant === 'minimal' ? 'Scenario' : '🔀 Create Scenario'}
      </button>

      {/* Modal - Dark Theme */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-white mb-4">Create Scenario Variant</h3>

            <div className="space-y-4 mb-6">
              {/* Scenario Name */}
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Scenario Name *
                </label>
                <input
                  type="text"
                  value={scenarioName}
                  onChange={e => setScenarioName(e.target.value)}
                  placeholder="e.g., 3 villas instead of 5, 10-year hold"
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder:text-zinc-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  autoFocus
                />
              </div>

              {/* Key Input Fields */}
              <div className="bg-zinc-800/50 p-4 rounded-lg border border-zinc-700">
                <h4 className="font-semibold text-white text-sm mb-3">Key Parameters</h4>
                <div className="space-y-3">
                  {Object.entries(project.data || {})
                    .slice(0, 6) // Show first 6 fields
                    .map(([key, value]) => (
                      <div key={key} className="flex items-center gap-3">
                        <label className="flex-1 text-sm font-medium text-zinc-400 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </label>
                        <input
                          type="number"
                          value={inputs[key] || ''}
                          onChange={e => handleInputChange(key, parseFloat(e.target.value) || '')}
                          className="w-32 px-3 py-1.5 bg-zinc-700 border border-zinc-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                        />
                      </div>
                    ))}
                </div>
              </div>

              {/* Change Summary */}
              {hasCriticalChanges && (
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                  <p className="text-xs text-blue-400">
                    This scenario differs from the baseline. Changes will be tracked for comparison.
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                disabled={isSaving}
                className="flex-1 px-4 py-2 border border-zinc-700 text-zinc-300 rounded-lg hover:bg-zinc-800 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={isSaving || !scenarioName.trim()}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
              >
                {isSaving ? 'Creating...' : 'Create Scenario'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
