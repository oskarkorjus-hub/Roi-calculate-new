import { useState, useCallback } from 'react';
import { Toast } from '../../components/ui/Toast';
import { SaveToPortfolioButton } from '../../components/SaveToPortfolioButton';
import { CashFlowInputs } from './components/CashFlowInputs';
import { ProjectionVisualization } from './components/ProjectionVisualization';

interface CashFlowInputsType {
  monthlyRentalIncome: number;
  monthlyMaintenance: number;
  monthlyPropertyTax: number;
  monthlyInsurance: number;
  monthlyUtilities: number;
  monthlyOtherExpenses: number;
  vacancyRate: number;
  projectionYears: number;
  currency: 'IDR' | 'USD' | 'AUD' | 'EUR';
  showAdvanced: boolean;
  annualGrowthRate: number;
  expenseGrowthRate: number;
  fixedExpensePercent: number;
  variableExpensePercent: number;
  seasonalMultiplier: number;
}

interface CashFlowYear {
  year: number;
  grossIncome: number;
  vacancyLoss: number;
  effectiveIncome: number;
  totalExpenses: number;
  netCashFlow: number;
  cumulativeCashFlow: number;
  adjustedGrossIncome?: number;
  adjustedExpenses?: number;
  adjustedNetCashFlow?: number;
}

const INITIAL_INPUTS: CashFlowInputsType = {
  monthlyRentalIncome: 10000000,
  monthlyMaintenance: 800000,
  monthlyPropertyTax: 500000,
  monthlyInsurance: 300000,
  monthlyUtilities: 200000,
  monthlyOtherExpenses: 400000,
  vacancyRate: 20,
  projectionYears: 10,
  currency: 'IDR',
  showAdvanced: false,
  annualGrowthRate: 3,
  expenseGrowthRate: 2,
  fixedExpensePercent: 60,
  variableExpensePercent: 40,
  seasonalMultiplier: 1,
};

const symbols = { IDR: 'Rp', USD: '$', AUD: 'A$', EUR: '€' };

export function CashFlowProjector() {
  const [inputs, setInputs] = useState<CashFlowInputsType>(INITIAL_INPUTS);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const calculateCashFlow = useCallback((): CashFlowYear[] => {
    const {
      monthlyRentalIncome,
      monthlyMaintenance,
      monthlyPropertyTax,
      monthlyInsurance,
      monthlyUtilities,
      monthlyOtherExpenses,
      vacancyRate,
      projectionYears,
      annualGrowthRate,
      expenseGrowthRate,
      fixedExpensePercent,
      variableExpensePercent,
      seasonalMultiplier,
      showAdvanced,
    } = inputs;

    const monthlyExpenses =
      monthlyMaintenance + monthlyPropertyTax + monthlyInsurance + monthlyUtilities + monthlyOtherExpenses;

    const yearlyBaseExpenses = monthlyExpenses * 12;
    const fixedExpenses = (yearlyBaseExpenses * fixedExpensePercent) / 100;
    const variableExpenses = (yearlyBaseExpenses * variableExpensePercent) / 100;

    const schedule: CashFlowYear[] = [];
    let cumulativeCashFlow = 0;

    const growthMultiplier = 1 + annualGrowthRate / 100;
    const expenseMultiplier = 1 + expenseGrowthRate / 100;

    for (let year = 1; year <= projectionYears; year++) {
      // Basic calculations with growth
      const yearlyGrossIncome = monthlyRentalIncome * 12 * Math.pow(growthMultiplier, year - 1) * seasonalMultiplier;
      const yearlyVacancyLoss = (yearlyGrossIncome * vacancyRate) / 100;
      const yearlyEffectiveIncome = yearlyGrossIncome - yearlyVacancyLoss;
      
      const yearlyExpenses = showAdvanced
        ? fixedExpenses + variableExpenses * Math.pow(expenseMultiplier, year - 1)
        : yearlyBaseExpenses * Math.pow(expenseMultiplier, year - 1);

      const netCashFlow = yearlyEffectiveIncome - yearlyExpenses;
      cumulativeCashFlow += netCashFlow;

      const row: CashFlowYear = {
        year,
        grossIncome: yearlyGrossIncome,
        vacancyLoss: yearlyVacancyLoss,
        effectiveIncome: yearlyEffectiveIncome,
        totalExpenses: yearlyExpenses,
        netCashFlow,
        cumulativeCashFlow,
      };

      if (showAdvanced) {
        row.adjustedGrossIncome = yearlyGrossIncome;
        row.adjustedExpenses = yearlyExpenses;
        row.adjustedNetCashFlow = netCashFlow;
      }

      schedule.push(row);
    }

    return schedule;
  }, [inputs]);

  const schedule = calculateCashFlow();
  const symbol = symbols[inputs.currency];

  const handleInputChange = (field: keyof CashFlowInputsType, value: string | number | boolean) => {
    setInputs(prev => ({
      ...prev,
      [field]: typeof value === 'string' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleReset = useCallback(() => {
    if (showResetConfirm) {
      setInputs(INITIAL_INPUTS);
      setShowResetConfirm(false);
      setToast({ message: 'All values reset', type: 'success' });
    } else {
      setShowResetConfirm(true);
      setTimeout(() => setShowResetConfirm(false), 3000);
    }
  }, [showResetConfirm]);

  const handleSaveDraft = useCallback(() => {
    setToast({ message: 'Draft saved successfully!', type: 'success' });
  }, []);

  return (
    <div className="min-h-screen bg-background text-text-primary selection:bg-primary-light selection:text-primary -mx-4 md:-mx-10 lg:-mx-20 -my-8 px-6 py-8">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="max-w-[100%] mx-auto">
        {/* Header */}
        <header className="mb-8 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="bg-primary p-2.5 rounded-lg shadow-sm">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text-primary tracking-tight">Cash Flow Projector</h1>
              <p className="text-text-muted text-xs mt-1 max-w-md">
                Project your property's cash flow over time with growth rates and expenses
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <button
              onClick={handleReset}
              className={`px-5 py-2 rounded-lg text-xs font-bold shadow-sm transition-all active:scale-95 ${
                showResetConfirm
                  ? 'bg-red-600 text-white animate-pulse'
                  : 'bg-red-500 text-white hover:bg-red-600'
              }`}
            >
              {showResetConfirm ? 'Click to Confirm' : 'Reset Values'}
            </button>

            <button
              onClick={handleSaveDraft}
              className="bg-primary text-white px-5 py-2 rounded-lg text-xs font-bold shadow-sm hover:bg-primary-dark transition-all active:scale-95"
            >
              Save Draft
            </button>

            <SaveToPortfolioButton
              calculatorType="cashflow"
              projectData={{
                ...inputs,
                schedule,
              }}
              defaultProjectName="Cash Flow Projection"
            />
          </div>
        </header>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-9">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <CashFlowInputs
                inputs={inputs}
                onInputChange={handleInputChange}
                symbol={symbol}
              />
            </div>
          </div>

          <div className="lg:col-span-3">
            {/* Quick Stats */}
            {schedule.length > 0 && (
              <div className="bg-indigo-50 rounded-lg shadow-sm p-6 border border-indigo-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Summary</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-gray-600">Year 1 Net Cash Flow</p>
                    <p className="text-lg font-bold text-green-600">
                      {symbol} {(schedule[0].netCashFlow / 1000000).toFixed(2)}M
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Total {inputs.projectionYears}-Year Cash Flow</p>
                    <p className="text-lg font-bold text-blue-600">
                      {symbol} {(schedule[schedule.length - 1].cumulativeCashFlow / 1000000).toFixed(2)}M
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Projections */}
        <div className="mt-8">
          <ProjectionVisualization
            schedule={schedule}
            currency={inputs.currency}
            symbol={symbol}
            showAdvanced={inputs.showAdvanced}
          />
        </div>
      </div>
    </div>
  );
}

export default CashFlowProjector;
