import { useState, useMemo } from 'react';
import type { PortfolioProject } from '../types/portfolio';
import { useScenarios } from '../hooks/useScenarios';
import { Toast } from './ui/Toast';

interface ScenarioCreatorProps {
  project: PortfolioProject;
  onScenarioCreated?: () => void;
}

export function ScenarioCreator({ project, onScenarioCreated }: ScenarioCreatorProps) {
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

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <button
        onClick={() => setShowModal(true)}
        className="px-3 py-2 bg-purple-50 text-purple-600 rounded hover:bg-purple-100 transition text-sm font-medium"
        title="Create a scenario variant of this project"
      >
        🔀 Create Scenario
      </button>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-96 overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Create Scenario Variant</h3>

            <div className="space-y-4 mb-6">
              {/* Scenario Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Scenario Name *
                </label>
                <input
                  type="text"
                  value={scenarioName}
                  onChange={e => setScenarioName(e.target.value)}
                  placeholder="e.g., 3 villas instead of 5, 10-year hold"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  autoFocus
                />
              </div>

              {/* Key Input Fields */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-900 text-sm mb-3">Key Parameters</h4>
                <div className="space-y-3">
                  {Object.entries(project.data || {})
                    .slice(0, 6) // Show first 6 fields
                    .map(([key, value]) => (
                      <div key={key} className="flex gap-2">
                        <label className="flex-1 text-sm font-medium text-gray-700 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </label>
                        <input
                          type="number"
                          value={inputs[key] || ''}
                          onChange={e => handleInputChange(key, parseFloat(e.target.value) || '')}
                          className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      </div>
                    ))}
                </div>
              </div>

              {/* Change Summary */}
              {hasCriticalChanges && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-xs text-blue-800">
                    ℹ️ This scenario differs from the baseline. Changes will be tracked for comparison.
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                disabled={isSaving}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
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
