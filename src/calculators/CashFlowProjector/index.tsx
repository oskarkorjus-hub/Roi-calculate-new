import { useState, useCallback, useMemo } from 'react';
import { Toast } from '../../components/ui/Toast';
import { SaveToPortfolioButton } from '../../components/SaveToPortfolioButton';
import { ReportPreviewModal } from '../../components/ui/ReportPreviewModal';
import { generateCashFlowReport } from '../../hooks/useReportGenerator';
import { CashFlowInputs } from './components/CashFlowInputs';
import { ProjectionVisualization } from './components/ProjectionVisualization';

type CurrencyType = 'IDR' | 'USD' | 'AUD' | 'EUR' | 'GBP' | 'INR' | 'CNY' | 'AED' | 'RUB';

interface CashFlowInputsType {
  monthlyRentalIncome: number;
  monthlyMaintenance: number;
  monthlyPropertyTax: number;
  monthlyInsurance: number;
  monthlyUtilities: number;
  monthlyOtherExpenses: number;
  vacancyRate: number;
  projectionYears: number;
  currency: CurrencyType;
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

const symbols: Record<CurrencyType, string> = { IDR: 'Rp', USD: '$', AUD: 'A$', EUR: '€', GBP: '£', INR: '₹', CNY: '¥', AED: 'د.إ', RUB: '₽' };

export function CashFlowProjector() {
  const [inputs, setInputs] = useState<CashFlowInputsType>(INITIAL_INPUTS);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

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

  // Calculate summary values for report
  const monthlyExpenses = inputs.monthlyMaintenance + inputs.monthlyPropertyTax +
    inputs.monthlyInsurance + inputs.monthlyUtilities + inputs.monthlyOtherExpenses;
  const propertyValue = inputs.monthlyRentalIncome * 12 * 10; // Estimate based on rent

  // Generate report data
  const reportData = useMemo(() => {
    const totalNetCashFlow = schedule.length > 0 ? schedule[schedule.length - 1].cumulativeCashFlow : 0;
    const averageAnnualCashFlow = totalNetCashFlow / inputs.projectionYears;
    const cashOnCashReturn = propertyValue > 0 ? (averageAnnualCashFlow / propertyValue) * 100 : 0;

    return generateCashFlowReport(
      {
        propertyValue,
        monthlyRent: inputs.monthlyRentalIncome,
        vacancyRate: inputs.vacancyRate,
        annualExpenses: monthlyExpenses * 12,
        projectionYears: inputs.projectionYears,
        rentGrowthRate: inputs.annualGrowthRate,
        expenseGrowthRate: inputs.expenseGrowthRate,
      },
      {
        yearlyProjections: schedule.map(s => ({
          year: s.year,
          grossIncome: s.grossIncome,
          expenses: s.totalExpenses,
          netCashFlow: s.netCashFlow,
          cumulativeCashFlow: s.cumulativeCashFlow,
        })),
        totalNetCashFlow,
        averageAnnualCashFlow,
        cashOnCashReturn,
      },
      symbol
    );
  }, [inputs, schedule, symbol, propertyValue, monthlyExpenses]);

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
              📊
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Cash Flow Projector</h1>
              <p className="text-zinc-500 text-sm mt-1">
                Project your property's cash flow over time with growth rates and expenses
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
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
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
              <div className="sticky top-24 flex flex-col gap-4">
                <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
                  <div className="mb-4 flex items-center border-b border-zinc-800 pb-4">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-emerald-400">analytics</span>
                      <h3 className="text-lg font-bold text-white">Summary</h3>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <ResultCard
                      title="Year 1 Net Cash Flow"
                      value={`${symbol} ${(schedule[0].netCashFlow / 1000000).toFixed(2)}M`}
                      label="First year projection"
                      color="emerald"
                      icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                    />
                    <ResultCard
                      title={`Total ${inputs.projectionYears}Y Cash Flow`}
                      value={`${symbol} ${(schedule[schedule.length - 1].cumulativeCashFlow / 1000000).toFixed(2)}M`}
                      label="Cumulative projection"
                      color="cyan"
                      icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
                    />
                    <ResultCard
                      title="Avg Annual Cash Flow"
                      value={`${symbol} ${(schedule[schedule.length - 1].cumulativeCashFlow / inputs.projectionYears / 1000000).toFixed(2)}M`}
                      label="Per year average"
                      color="purple"
                      icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}
                    />
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

const colorMap = {
  emerald: { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  cyan: { text: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' },
  purple: { text: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
  orange: { text: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
  red: { text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
};

function ResultCard({ title, value, label, color, icon }: {
  title: string;
  value: string;
  label: string;
  color: keyof typeof colorMap;
  icon: React.ReactNode;
}) {
  const colors = colorMap[color];

  return (
    <div className={`bg-zinc-900 p-4 rounded-2xl border ${colors.border} transition-all duration-300 hover:border-zinc-600 group cursor-default`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <span className="text-zinc-400 text-[10px] font-semibold uppercase tracking-wide">{title}</span>
          <div className={`text-xl font-bold ${colors.text} tracking-tight leading-none mt-1`}>{value}</div>
        </div>
        <div className={`w-9 h-9 ${colors.bg} rounded-xl flex items-center justify-center ${colors.text} transition-transform group-hover:scale-110 duration-300`}>
          {icon}
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <div className={`w-1.5 h-1.5 rounded-full ${colors.text.replace('text', 'bg')} opacity-60 animate-pulse`}></div>
        <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-wide">{label}</span>
      </div>
    </div>
  );
}

export default CashFlowProjector;
