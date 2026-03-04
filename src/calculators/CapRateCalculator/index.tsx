import { useState, useCallback, useMemo } from 'react';
import { Toast } from '../../components/ui/Toast';
import { SaveToPortfolioButton } from '../../components/SaveToPortfolioButton';
import { ReportPreviewModal } from '../../components/ui/ReportPreviewModal';
import { generateCapRateReport } from '../../hooks/useReportGenerator';
import { formatCurrency } from '../../utils/numberParsing';
import { PropertyInputs } from './components/PropertyInputs';
import { CapRateResults } from './components/CapRateResults';

type CurrencyType = 'IDR' | 'USD' | 'AUD' | 'EUR' | 'GBP' | 'INR' | 'CNY' | 'AED' | 'RUB';

const symbols: Record<CurrencyType, string> = { IDR: 'Rp', USD: '$', AUD: 'A$', EUR: '€', GBP: '£', INR: '₹', CNY: '¥', AED: 'د.إ', RUB: '₽' };

interface CapRateInputs {
  propertyValue: number;
  annualNOI: number;
  currency: CurrencyType;
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
  const [showReportModal, setShowReportModal] = useState(false);

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
  const symbol = symbols[inputs.currency];

  // Generate report data
  const reportData = useMemo(() => {
    return generateCapRateReport(
      {
        propertyValue: inputs.propertyValue,
        grossRentalIncome: result.grossAnnualIncome,
        vacancyRate: inputs.vacancyRatePercent,
        operatingExpenses: result.annualExpenses,
        propertyTaxes: inputs.annualPropertyTaxes,
        insurance: inputs.annualInsurance,
        maintenance: inputs.propertyValue * (inputs.maintenanceReservePercent / 100),
        utilities: inputs.annualUtilities,
      },
      {
        noi: result.yearlyNOI,
        capRate: result.capRate,
        effectiveGrossIncome: result.effectiveGrossIncome,
        totalExpenses: result.annualExpenses,
      },
      symbol
    );
  }, [inputs, result, symbol]);

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
    <div className="min-h-screen bg-[#0a0a0a] text-white -mx-4 md:-mx-10 lg:-mx-20 -my-8 px-6 py-8">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <ReportPreviewModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        reportData={reportData}
      />

      <div className="max-w-[100%] mx-auto">
        {/* Header */}
        <header className="mb-8 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center text-2xl">
              📉
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Cap Rate Calculator</h1>
              <p className="text-zinc-500 text-sm mt-1">
                Calculate capitalization rate to evaluate real estate investment returns
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center bg-zinc-800 px-4 py-2 rounded-lg border border-zinc-700">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mr-3">Currency</span>
              <select
                value={inputs.currency}
                onChange={(e) => handleInputChange('currency', e.target.value as CurrencyType)}
                className="bg-transparent text-white text-xs font-bold focus:outline-none cursor-pointer"
              >
                <option value="IDR" className="bg-zinc-800 text-white">Rp IDR</option>
                <option value="USD" className="bg-zinc-800 text-white">$ USD</option>
                <option value="EUR" className="bg-zinc-800 text-white">€ EUR</option>
                <option value="AUD" className="bg-zinc-800 text-white">A$ AUD</option>
                <option value="GBP" className="bg-zinc-800 text-white">£ GBP</option>
                <option value="INR" className="bg-zinc-800 text-white">₹ INR</option>
                <option value="CNY" className="bg-zinc-800 text-white">¥ CNY</option>
                <option value="AED" className="bg-zinc-800 text-white">د.إ AED</option>
                <option value="RUB" className="bg-zinc-800 text-white">₽ RUB</option>
              </select>
            </div>

            <button
              onClick={handleReset}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                showResetConfirm
                  ? 'bg-red-500 text-white'
                  : 'bg-zinc-800 text-zinc-300 border border-zinc-700 hover:bg-zinc-700'
              }`}
            >
              {showResetConfirm ? 'Click to Confirm' : 'Reset'}
            </button>

            <button
              onClick={handleSaveDraft}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-zinc-800 text-zinc-300 border border-zinc-700 hover:bg-zinc-700 transition-all"
            >
              Save Draft
            </button>

            <button
              onClick={() => setShowReportModal(true)}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-cyan-600 text-white hover:bg-cyan-700 transition-all flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              PDF Report
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
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
              <div className="mb-6 flex items-center border-b border-zinc-800 pb-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-400">info</span>
                  <h2 className="text-xl font-bold text-white">Cap Rate Calculator</h2>
                </div>
              </div>
              <p className="text-sm text-zinc-400 mb-6">
                Cap Rate = Annual NOI / Property Value. Measures annual return on real estate investment.
              </p>
              <PropertyInputs
                inputs={inputs}
                onInputChange={handleInputChange}
                symbol={symbol}
              />
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="sticky top-24 flex flex-col gap-4">
              <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
                <div className="mb-4 flex items-center border-b border-zinc-800 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-emerald-400">analytics</span>
                    <h3 className="text-lg font-bold text-white">Results</h3>
                  </div>
                </div>
                <CapRateResults
                  result={result}
                  showAdvanced={inputs.showAdvanced}
                />
              </div>

              {/* Interpretation */}
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="material-symbols-outlined text-emerald-400 text-lg">insights</span>
                  <h3 className="font-bold text-emerald-400 text-sm">Analysis</h3>
                </div>
                <ul className="space-y-1.5 text-xs text-zinc-300">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 mt-0.5">•</span>
                    <span><strong className="text-white">Cap Rate</strong>: {result.capRate.toFixed(2)}% annual return</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 mt-0.5">•</span>
                    <span><strong className="text-white">Monthly</strong>: {formatCurrency(result.monthlyNOI)}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 mt-0.5">•</span>
                    <span><strong className="text-white">Payback</strong>: {(1 / (result.capRate / 100)).toFixed(1)} years</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CapRateCalculator;
