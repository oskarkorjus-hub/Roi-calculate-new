import { useState, useCallback } from 'react';
import { Toast } from '../../components/ui/Toast';
import { SaveToPortfolioButton } from '../../components/SaveToPortfolioButton';
import { formatCurrency } from '../../utils/numberParsing';
import { PropertyInputs } from './components/PropertyInputs';
import { CapRateResults } from './components/CapRateResults';

interface CapRateInputs {
  propertyValue: number;
  annualNOI: number;
  currency: 'IDR' | 'USD' | 'AUD' | 'EUR';
  showAdvanced: boolean;
  vacancyRatePercent: number;
  maintenanceReservePercent: number;
  annualPropertyTaxes: number;
  annualInsurance: number;
  annualUtilities: number;
}

interface CapRateResult {
  capRate: number;
  monthlyNOI: number;
  yearlyNOI: number;
  pricePerNOI: number;
  grossAnnualIncome: number;
  vacancyLoss: number;
  effectiveGrossIncome: number;
  annualExpenses: number;
  adjustedAnnualNOI: number;
  adjustedCapRate: number;
  adjustedMonthlyNOI: number;
}

const INITIAL_INPUTS: CapRateInputs = {
  propertyValue: 1_000_000,
  annualNOI: 100_000,
  currency: 'USD',
  showAdvanced: false,
  vacancyRatePercent: 5,
  maintenanceReservePercent: 10,
  annualPropertyTaxes: 0,
  annualInsurance: 0,
  annualUtilities: 0,
};

export function CapRateCalculator() {
  const [inputs, setInputs] = useState<CapRateInputs>(INITIAL_INPUTS);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const calculateResults = useCallback((): CapRateResult => {
    const {
      propertyValue,
      annualNOI,
      vacancyRatePercent,
      maintenanceReservePercent,
      annualPropertyTaxes,
      annualInsurance,
      annualUtilities,
    } = inputs;

    // Basic calculations (NOI as provided)
    const basicCapRate = propertyValue > 0 ? (annualNOI / propertyValue) * 100 : 0;
    const basicMonthlyNOI = annualNOI / 12;
    const basicPricePerNOI = annualNOI > 0 ? propertyValue / annualNOI : 0;

    // Advanced calculations
    // Back-calculate gross income from NOI
    const grossAnnualIncome = annualNOI / (1 - (vacancyRatePercent + maintenanceReservePercent) / 100);
    const vacancyLoss = (grossAnnualIncome * vacancyRatePercent) / 100;
    const effectiveGrossIncome = grossAnnualIncome - vacancyLoss;
    const annualExpenses = annualPropertyTaxes + annualInsurance + annualUtilities +
      (grossAnnualIncome * maintenanceReservePercent) / 100;
    const adjustedAnnualNOI = effectiveGrossIncome - annualExpenses;
    const adjustedCapRate = propertyValue > 0 ? (adjustedAnnualNOI / propertyValue) * 100 : 0;
    const adjustedMonthlyNOI = adjustedAnnualNOI / 12;

    return {
      capRate: basicCapRate,
      monthlyNOI: basicMonthlyNOI,
      yearlyNOI: annualNOI,
      pricePerNOI: basicPricePerNOI,
      grossAnnualIncome,
      vacancyLoss,
      effectiveGrossIncome,
      annualExpenses,
      adjustedAnnualNOI,
      adjustedCapRate,
      adjustedMonthlyNOI,
    };
  }, [inputs]);

  const result = calculateResults();

  const handleInputChange = (field: keyof CapRateInputs, value: string | number | boolean) => {
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6M5 5h.01M5 12h.01M5 19h.01M12 19h.01M19 12h.01" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text-primary tracking-tight">Cap Rate Calculator</h1>
              <p className="text-text-muted text-xs mt-1 max-w-md">
                Calculate capitalization rate to evaluate real estate investment returns
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
              calculatorType="cap-rate"
              projectData={{
                ...inputs,
                result,
              }}
              defaultProjectName="Cap Rate Analysis"
            />
          </div>
        </header>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-9">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Cap Rate Calculator</h2>
              <p className="text-sm text-gray-600 mb-6">
                Cap Rate = Annual NOI / Property Value. Measures annual return on real estate investment.
              </p>
              <PropertyInputs
                inputs={inputs}
                onInputChange={handleInputChange}
              />
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="bg-indigo-50 rounded-lg shadow-sm p-6 border border-indigo-200">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Results</h3>
              <CapRateResults
                result={result}
                showAdvanced={inputs.showAdvanced}
              />
            </div>
          </div>
        </div>

        {/* Interpretation */}
        <div className="mt-8 bg-indigo-50 border border-indigo-200 rounded-lg p-6">
          <h3 className="font-semibold text-indigo-900 mb-3">Cap Rate Analysis</h3>
          <ul className="space-y-2 text-sm text-indigo-800">
            <li>✓ <strong>Cap Rate</strong>: {result.capRate.toFixed(2)}% annual return on investment</li>
            <li>✓ <strong>Monthly Cash Flow</strong>: {formatCurrency(result.monthlyNOI)} per month</li>
            <li>✓ <strong>Payback Period</strong>: {(1 / (result.capRate / 100)).toFixed(1)} years</li>
            <li>✓ <strong>Industry Benchmark</strong>: Cap rates typically range from 3% to 12% depending on market</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default CapRateCalculator;
