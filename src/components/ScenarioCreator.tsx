import { useState, useMemo } from 'react';
import type { PortfolioProject } from '../types/portfolio';
import { useScenarios } from '../hooks/useScenarios';
import { Toast } from './ui/Toast';

interface ScenarioCreatorProps {
  project: PortfolioProject;
  onScenarioCreated?: () => void;
  variant?: 'default' | 'minimal' | 'menu-item';
  onClose?: () => void;
}

// Calculator-specific field configurations with friendly labels and descriptions
// Key can use dot notation for nested paths (e.g., 'property.totalPrice')
const CALCULATOR_FIELDS: Record<string, Array<{
  key: string;
  label: string;
  description?: string;
  type: 'number' | 'percent' | 'currency' | 'years' | 'months';
  prefix?: string;
  suffix?: string;
}>> = {
  'mortgage': [
    { key: 'loanAmount', label: 'Loan Amount', type: 'currency', description: 'Total amount borrowed' },
    { key: 'interestRate', label: 'Interest Rate', type: 'percent', suffix: '%', description: 'Annual interest rate' },
    { key: 'loanTermYears', label: 'Loan Term', type: 'years', suffix: ' years', description: 'Length of the loan' },
    { key: 'propertyTax', label: 'Property Tax', type: 'currency' },
    { key: 'insurance', label: 'Annual Insurance', type: 'currency' },
  ],
  'rental-roi': [
    { key: 'initialInvestment', label: 'Initial Investment', type: 'currency', description: 'Total initial investment' },
    { key: 'y1ADR', label: 'Year 1 Daily Rate', type: 'currency', description: 'Average daily rate in year 1' },
    { key: 'y1Occupancy', label: 'Year 1 Occupancy', type: 'percent', suffix: '%' },
    { key: 'adrGrowth', label: 'ADR Growth Rate', type: 'percent', suffix: '%' },
    { key: 'incentiveFeePct', label: 'Incentive Fee', type: 'percent', suffix: '%' },
  ],
  'cashflow': [
    { key: 'monthlyRentalIncome', label: 'Monthly Rental Income', type: 'currency' },
    { key: 'monthlyMortgage', label: 'Monthly Mortgage', type: 'currency' },
    { key: 'monthlyMaintenance', label: 'Monthly Maintenance', type: 'currency' },
    { key: 'monthlyPropertyTax', label: 'Monthly Property Tax', type: 'currency' },
    { key: 'monthlyInsurance', label: 'Monthly Insurance', type: 'currency' },
  ],
  'dev-feasibility': [
    { key: 'landCost', label: 'Land Cost', type: 'currency', description: 'Cost of land acquisition' },
    { key: 'constructionCost', label: 'Construction Cost', type: 'currency', description: 'Total build cost' },
    { key: 'softCosts', label: 'Soft Costs', type: 'currency', description: 'Permits, fees, design' },
    { key: 'expectedSalePrice', label: 'Expected Sale Price', type: 'currency' },
    { key: 'contingencyPercent', label: 'Contingency', type: 'percent', suffix: '%' },
  ],
  'cap-rate': [
    { key: 'propertyValue', label: 'Property Value', type: 'currency' },
    { key: 'annualNOI', label: 'Annual NOI', type: 'currency' },
    { key: 'vacancyRatePercent', label: 'Vacancy Rate', type: 'percent', suffix: '%' },
    { key: 'annualPropertyTaxes', label: 'Annual Property Taxes', type: 'currency' },
    { key: 'annualInsurance', label: 'Annual Insurance', type: 'currency' },
  ],
  'xirr': [
    { key: 'property.totalPrice', label: 'Total Property Price', type: 'currency' },
    { key: 'property.propertySize', label: 'Property Size', type: 'number', suffix: ' m²' },
    { key: 'payment.downPaymentPercent', label: 'Down Payment', type: 'percent', suffix: '%' },
    { key: 'exit.exitPrice', label: 'Exit Price', type: 'currency' },
    { key: 'rental.monthlyRate', label: 'Monthly Rental Rate', type: 'currency' },
    { key: 'rental.occupancyRate', label: 'Occupancy Rate', type: 'percent', suffix: '%' },
  ],
  'irr': [
    { key: 'initialInvestment', label: 'Initial Investment', type: 'currency' },
    { key: 'cashFlows', label: 'Annual Cash Flows', type: 'currency', description: 'Comma-separated values' },
    { key: 'holdingPeriodYears', label: 'Holding Period', type: 'years', suffix: ' years' },
  ],
  'npv': [
    { key: 'initialInvestment', label: 'Initial Investment', type: 'currency' },
    { key: 'discountRate', label: 'Discount Rate', type: 'percent', suffix: '%' },
    { key: 'cashFlows', label: 'Cash Flows', type: 'currency' },
  ],
  'rental-projection': [
    { key: 'nightlyRate', label: 'Nightly Rate', type: 'currency' },
    { key: 'baseOccupancyRate', label: 'Base Occupancy', type: 'percent', suffix: '%' },
    { key: 'projectionYears', label: 'Projection Years', type: 'years', suffix: ' years' },
    { key: 'monthlyExpenses', label: 'Monthly Expenses', type: 'currency' },
    { key: 'platformFeePercent', label: 'Platform Fee', type: 'percent', suffix: '%' },
    { key: 'annualGrowthRate', label: 'Annual Growth Rate', type: 'percent', suffix: '%' },
  ],
  'financing': [
    { key: 'loanAmount', label: 'Loan Amount', type: 'currency' },
    { key: 'interestRate', label: 'Interest Rate', type: 'percent', suffix: '%' },
    { key: 'loanTermYears', label: 'Loan Term', type: 'years', suffix: ' years' },
    { key: 'downPayment', label: 'Down Payment', type: 'currency' },
  ],
  'indonesia-tax': [
    { key: 'purchasePrice', label: 'Purchase Price', type: 'currency' },
    { key: 'salePrice', label: 'Sale Price', type: 'currency' },
    { key: 'holdingPeriodYears', label: 'Holding Period', type: 'years', suffix: ' years' },
    { key: 'annualRentalIncome', label: 'Annual Rental Income', type: 'currency' },
  ],
  'dev-budget': [
    { key: 'projectName', label: 'Project Name', type: 'number' },
    { key: 'contingencyPercent', label: 'Contingency', type: 'percent', suffix: '%' },
  ],
  'risk-assessment': [
    { key: 'propertyValue', label: 'Property Value', type: 'currency' },
    { key: 'expectedReturn', label: 'Expected Return', type: 'percent', suffix: '%' },
    { key: 'investmentHorizon', label: 'Investment Horizon', type: 'years', suffix: ' years' },
  ],
};

// Default fields for any calculator not specifically configured
const DEFAULT_FIELDS: Array<{
  key: string;
  label: string;
  description?: string;
  type: 'number' | 'percent' | 'currency' | 'years' | 'months';
  prefix?: string;
  suffix?: string;
}> = [
  { key: 'investmentAmount', label: 'Investment Amount', type: 'currency' },
  { key: 'expectedReturn', label: 'Expected Return', type: 'percent', suffix: '%' },
  { key: 'timeline', label: 'Timeline', type: 'years', suffix: ' years' },
];

// Helper to get nested value from object using dot notation
const getNestedValue = (obj: any, path: string): any => {
  if (!obj || !path) return undefined;
  return path.split('.').reduce((current, key) => current?.[key], obj);
};

// Helper to set nested value in object using dot notation
const setNestedValue = (obj: any, path: string, value: any): any => {
  const keys = path.split('.');
  const result = { ...obj };
  let current = result;

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    current[key] = { ...current[key] };
    current = current[key];
  }

  current[keys[keys.length - 1]] = value;
  return result;
};

export function ScenarioCreator({ project, onScenarioCreated, variant = 'default', onClose }: ScenarioCreatorProps) {
  const { createScenario } = useScenarios();
  const [showModal, setShowModal] = useState(false);
  const [scenarioName, setScenarioName] = useState('');
  const [inputs, setInputs] = useState<Record<string, any>>(project.data || {});
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Get calculator-specific fields
  const fields = useMemo(() => {
    const calculatorFields = CALCULATOR_FIELDS[project.calculatorId] || DEFAULT_FIELDS;
    // Filter to only fields that have values in the project data (supports nested paths)
    return calculatorFields.filter(field => {
      const value = getNestedValue(project.data, field.key);
      return value !== undefined && value !== null;
    });
  }, [project.calculatorId, project.data]);

  // Check if there are meaningful changes
  const changedFields = useMemo(() => {
    if (!project.data) return [];
    return fields.filter(field => {
      const original = getNestedValue(project.data, field.key);
      const current = getNestedValue(inputs, field.key);
      return original !== current && current !== undefined && current !== '';
    });
  }, [inputs, project.data, fields]);

  const handleInputChange = (key: string, value: any) => {
    setInputs(prev => setNestedValue(prev, key, value));
  };

  const handleCreate = async () => {
    if (!scenarioName.trim()) {
      setToast({ message: 'Please enter a scenario name', type: 'error' });
      return;
    }

    setIsSaving(true);
    try {
      createScenario(project, scenarioName, inputs);
      setToast({ message: `Scenario "${scenarioName}" created!`, type: 'success' });
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

  const handleOpenModal = () => {
    setShowModal(true);
    onClose?.();
  };

  const formatValue = (value: any, type: string) => {
    if (value === undefined || value === null || value === '') return '';
    return value;
  };

  // Render the trigger button based on variant
  const renderTrigger = () => {
    if (variant === 'menu-item') {
      return (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleOpenModal();
          }}
          className="w-full px-3 py-2.5 text-left text-xs text-zinc-300 hover:bg-zinc-700 flex items-center gap-2"
        >
          <svg className="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
          What-if Scenario
        </button>
      );
    }

    const buttonClass = variant === 'minimal'
      ? 'px-3 py-1.5 text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg transition'
      : 'px-3 py-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition text-sm font-medium flex items-center gap-2';

    return (
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleOpenModal();
        }}
        className={buttonClass}
        title="Create a what-if scenario with different values"
      >
        {variant === 'minimal' ? (
          'What-if'
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            What-if Scenario
          </>
        )}
      </button>
    );
  };

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {renderTrigger()}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6 max-w-lg w-full max-h-[85vh] overflow-y-auto">
            {/* Header */}
            <div className="mb-6">
              <h3 className="text-xl font-bold text-white mb-2">Create What-if Scenario</h3>
              <p className="text-sm text-zinc-400">
                Adjust the values below to see how different assumptions affect your results.
              </p>
            </div>

            <div className="space-y-5">
              {/* Scenario Name */}
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Scenario Name
                </label>
                <input
                  type="text"
                  value={scenarioName}
                  onChange={e => setScenarioName(e.target.value)}
                  placeholder="e.g., Higher occupancy, Lower interest rate"
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder:text-zinc-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  autoFocus
                />
              </div>

              {/* Parameters */}
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-3">
                  Adjust Parameters
                </label>
                <div className="space-y-3">
                  {fields.length > 0 ? (
                    fields.map((field) => {
                      const originalValue = getNestedValue(project.data, field.key);
                      const currentValue = getNestedValue(inputs, field.key);
                      const hasChanged = originalValue !== currentValue && currentValue !== undefined && currentValue !== '';

                      return (
                        <div
                          key={field.key}
                          className={`p-3 rounded-xl border transition-colors ${
                            hasChanged
                              ? 'bg-purple-500/10 border-purple-500/30'
                              : 'bg-zinc-800/50 border-zinc-700/50'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-white">{field.label}</div>
                              {field.description && (
                                <div className="text-xs text-zinc-500 mt-0.5">{field.description}</div>
                              )}
                              {originalValue !== undefined && (
                                <div className="text-xs text-zinc-500 mt-1">
                                  Original: {originalValue.toLocaleString()}{field.suffix || ''}
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                value={formatValue(currentValue, field.type)}
                                onChange={e => handleInputChange(field.key, parseFloat(e.target.value) || '')}
                                placeholder={originalValue?.toString() || '0'}
                                className="w-28 px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white text-sm text-right focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                              />
                              {field.suffix && (
                                <span className="text-sm text-zinc-400 w-8">{field.suffix}</span>
                              )}
                            </div>
                          </div>
                          {hasChanged && (
                            <div className="mt-2 flex items-center gap-2 text-xs text-purple-400">
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Changed from {originalValue?.toLocaleString()}{field.suffix || ''}
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-6 text-zinc-500 text-sm">
                      No adjustable parameters found for this calculation.
                    </div>
                  )}
                </div>
              </div>

              {/* Summary */}
              {changedFields.length > 0 && (
                <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm font-medium text-purple-400">
                      {changedFields.length} parameter{changedFields.length !== 1 ? 's' : ''} modified
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400">
                    This scenario will be saved alongside your original calculation for comparison.
                  </p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowModal(false);
                  setInputs(project.data || {});
                }}
                disabled={isSaving}
                className="flex-1 px-4 py-3 border border-zinc-700 text-zinc-300 rounded-xl hover:bg-zinc-800 transition disabled:opacity-50 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={isSaving || !scenarioName.trim()}
                className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition disabled:opacity-50 font-bold"
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
