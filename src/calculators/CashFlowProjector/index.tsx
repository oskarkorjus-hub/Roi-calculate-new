import { useState, useCallback, useMemo } from 'react';
import { Toast } from '../../components/ui/Toast';
import { DraftSelector } from '../../components/ui/DraftSelector';
import { CalculatorToolbar } from '../../components/ui/CalculatorToolbar';
import { ReportPreviewModal } from '../../components/ui/ReportPreviewModal';
import { ComparisonButtons } from '../../components/ui/ComparisonButtons';
import { generateCashFlowReport } from '../../hooks/useReportGenerator';
import { useArchivedDrafts, type ArchivedDraft } from '../../hooks/useArchivedDrafts';
import { useAutoSave, loadAutoSave } from '../../hooks/useAutoSave';
import { useAuth } from '../../lib/auth-context';
import { parseDecimalInput } from '../../utils/numberParsing';
import { CashFlowInputs } from './components/CashFlowInputs';
import { ProjectionVisualization } from './components/ProjectionVisualization';
import type { CashFlowComparisonData } from '../../lib/comparison-types';

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
  monthlyRentalIncome: 0,
  monthlyMaintenance: 0,
  monthlyPropertyTax: 0,
  monthlyInsurance: 0,
  monthlyUtilities: 0,
  monthlyOtherExpenses: 0,
  vacancyRate: 0,
  projectionYears: 0,
  currency: 'IDR',
  showAdvanced: false,
  annualGrowthRate: 0,
  expenseGrowthRate: 0,
  fixedExpensePercent: 0,
  variableExpensePercent: 0,
  seasonalMultiplier: 0,
};

const symbols: Record<CurrencyType, string> = { IDR: 'Rp', USD: '$', AUD: 'A$', EUR: '€', GBP: '£', INR: '₹', CNY: '¥', AED: 'د.إ', RUB: '₽' };

export function CashFlowProjector() {
  const { user } = useAuth();
  const [inputs, setInputs] = useState<CashFlowInputsType>(() => {
    const saved = loadAutoSave<CashFlowInputsType>('cashflow');
    return saved?.data || INITIAL_INPUTS;
  });
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [currentDraftName, setCurrentDraftName] = useState<string | undefined>();

  const { drafts, saveDraft: saveArchivedDraft, deleteDraft } = useArchivedDrafts<CashFlowInputsType>('cashflow', user?.id);

  // Auto-save for "Continue Where You Left Off"
  useAutoSave('cashflow', inputs, (data) => ({
    monthlyIncome: data.monthlyRentalIncome,
    projectionYears: data.projectionYears,
    currency: data.currency,
  }));

  const handleSelectDraft = useCallback((draft: ArchivedDraft<CashFlowInputsType>) => {
    setInputs(draft.data);
    setCurrentDraftName(draft.name);
    setToast({ message: `Loaded "${draft.name}"`, type: 'success' });
  }, []);

  const handleSaveArchive = useCallback((name: string) => {
    saveArchivedDraft(name, inputs);
    setCurrentDraftName(name);
    setToast({ message: `Saved "${name}"`, type: 'success' });
  }, [saveArchivedDraft, inputs]);

  const handleDeleteDraft = useCallback((id: string) => {
    deleteDraft(id);
    setToast({ message: 'Draft deleted', type: 'success' });
  }, [deleteDraft]);

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
  const symbol = symbols[inputs.currency] || 'Rp';

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
      [field]: field === 'currency' ? value : (typeof value === 'string' ? parseDecimalInput(value) || 0 : value),
    }));
  };

  const handleReset = useCallback(() => {
    if (showResetConfirm) {
      setInputs(INITIAL_INPUTS);
      setCurrentDraftName(undefined);
      setShowResetConfirm(false);
      setToast({ message: 'All values reset', type: 'success' });
    } else {
      setShowResetConfirm(true);
      setTimeout(() => setShowResetConfirm(false), 3000);
    }
  }, [showResetConfirm]);

  return (
    <div className="text-white w-full overflow-hidden">
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
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center shadow-lg shadow-blue-900/30">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Cash Flow Projector</h1>
              <p className="text-zinc-500 text-sm mt-1">
                Project your property's cash flow over time with growth rates and expenses
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {user && (
              <DraftSelector
                drafts={drafts}
                onSelect={handleSelectDraft}
                onSave={handleSaveArchive}
                onDelete={handleDeleteDraft}
                currentName={currentDraftName}
              />
            )}

            <CalculatorToolbar
              currency={inputs.currency}
              onCurrencyChange={(c) => handleInputChange('currency', c)}
              onReset={handleReset}
              onOpenReport={() => setShowReportModal(true)}
              calculatorType="cashflow"
              projectData={{ ...inputs, schedule }}
              projectName="Cash Flow Projection"
              showResetConfirm={showResetConfirm}
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

                  {/* Comparison Buttons */}
                  <ComparisonButtons
                    calculatorType="cashflow"
                    getComparisonData={() => {
                      const totalCashFlow = schedule[schedule.length - 1]?.cumulativeCashFlow || 0;
                      const avgAnnualCashFlow = totalCashFlow / inputs.projectionYears;
                      const y1CashFlow = schedule[0]?.netCashFlow || 0;

                      const rating = avgAnnualCashFlow > 0
                        ? avgAnnualCashFlow >= inputs.monthlyRentalIncome * 12 * 0.5
                          ? { grade: 'A+', label: 'Excellent' }
                          : avgAnnualCashFlow >= inputs.monthlyRentalIncome * 12 * 0.3
                          ? { grade: 'A', label: 'Great' }
                          : avgAnnualCashFlow >= inputs.monthlyRentalIncome * 12 * 0.2
                          ? { grade: 'B+', label: 'Good' }
                          : { grade: 'B', label: 'Fair' }
                        : { grade: 'C', label: 'Negative' };

                      return {
                        calculatorType: 'cashflow' as const,
                        label: 'Cash Flow Projection',
                        currency: inputs.currency,
                        monthlyRentalIncome: inputs.monthlyRentalIncome,
                        vacancyRate: inputs.vacancyRate,
                        projectionYears: inputs.projectionYears,
                        y1NetCashFlow: y1CashFlow,
                        totalCashFlow,
                        avgAnnualCashFlow,
                        investmentRating: rating,
                      } as Omit<CashFlowComparisonData, 'timestamp'>;
                    }}
                  />
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
