import { useState, useCallback, useMemo } from 'react';
import { AdvancedSection } from '../../components/AdvancedSection';
import { Toast } from '../../components/ui/Toast';
import { DraftSelector } from '../../components/ui/DraftSelector';
import { CalculatorToolbar } from '../../components/ui/CalculatorToolbar';
import { ReportPreviewModal } from '../../components/ui/ReportPreviewModal';
import { ComparisonButtons } from '../../components/ui/ComparisonButtons';
import { generateIRRReport } from '../../hooks/useReportGenerator';
import { useArchivedDrafts, type ArchivedDraft } from '../../hooks/useArchivedDrafts';
import { useAuth } from '../../lib/auth-context';
import { parseDecimalInput } from '../../utils/numberParsing';
import { CashFlowInputs } from './components/CashFlowInputs';
import { IRRResults } from './components/IRRResults';
import type { IRRComparisonData } from '../../lib/comparison-types';

interface CashFlow {
  year: number;
  amount: number;
}

interface IRRResult {
  irr: number;
  npv: number;
  paybackPeriod: number;
  totalCashFlow: number;
  totalInvested: number;
  mirr?: number;
  profitabilityIndex?: number;
}

type CurrencyType = 'IDR' | 'USD' | 'AUD' | 'EUR' | 'GBP' | 'INR' | 'CNY' | 'AED' | 'RUB';

const symbols: Record<CurrencyType, string> = { IDR: 'Rp', USD: '$', AUD: 'A$', EUR: '€', GBP: '£', INR: '₹', CNY: '¥', AED: 'د.إ', RUB: '₽' };

const INITIAL_CASH_FLOWS: CashFlow[] = [
  { year: 0, amount: 0 },
  { year: 1, amount: 0 },
  { year: 2, amount: 0 },
  { year: 3, amount: 0 },
  { year: 4, amount: 0 },
  { year: 5, amount: 0 },
];

interface IRRInputs {
  currency: CurrencyType;
  discountRate: number;
  cashFlows: CashFlow[];
  showAdvanced: boolean;
  reinvestmentRate: number;
  alternativeDiscountRate: number;
}

export function IRRCalculator() {
  const { user } = useAuth();
  const [currency, setCurrency] = useState<CurrencyType>('USD');
  const [discountRate, setDiscountRate] = useState(0);
  const [cashFlows, setCashFlows] = useState<CashFlow[]>(INITIAL_CASH_FLOWS);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [reinvestmentRate, setReinvestmentRate] = useState(0);
  const [alternativeDiscountRate, setAlternativeDiscountRate] = useState(0);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [currentDraftName, setCurrentDraftName] = useState<string | undefined>();

  const { drafts, saveDraft: saveArchivedDraft, deleteDraft } = useArchivedDrafts<IRRInputs>('irr', user?.id);

  const handleSelectDraft = useCallback((draft: ArchivedDraft<IRRInputs>) => {
    setCurrency(draft.data.currency);
    setDiscountRate(draft.data.discountRate);
    setCashFlows(draft.data.cashFlows);
    setShowAdvanced(draft.data.showAdvanced);
    setReinvestmentRate(draft.data.reinvestmentRate);
    setAlternativeDiscountRate(draft.data.alternativeDiscountRate);
    setCurrentDraftName(draft.name);
    setToast({ message: `Loaded "${draft.name}"`, type: 'success' });
  }, []);

  const handleSaveArchive = useCallback((name: string) => {
    saveArchivedDraft(name, { currency, discountRate, cashFlows, showAdvanced, reinvestmentRate, alternativeDiscountRate });
    setCurrentDraftName(name);
    setToast({ message: `Saved "${name}"`, type: 'success' });
  }, [saveArchivedDraft, currency, discountRate, cashFlows, showAdvanced, reinvestmentRate, alternativeDiscountRate]);

  const handleDeleteDraft = useCallback((id: string) => {
    deleteDraft(id);
    setToast({ message: 'Draft deleted', type: 'success' });
  }, [deleteDraft]);

  const calculateNPV = (flows: CashFlow[], rate: number) => {
    return flows.reduce((npv, cf) => {
      return npv + cf.amount / Math.pow(1 + rate / 100, cf.year);
    }, 0);
  };

  const calculateIRR = (flows: CashFlow[]): number => {
    let rate = 0.1;
    const maxIterations = 100;
    const tolerance = 0.0001;

    for (let i = 0; i < maxIterations; i++) {
      const npv = calculateNPV(flows, rate * 100);
      const derivative = flows.reduce((sum, cf) => {
        return sum - cf.year * (cf.amount / Math.pow(1 + rate, cf.year + 1));
      }, 0);

      if (Math.abs(derivative) < tolerance) break;

      const newRate = rate - npv / derivative;
      if (Math.abs(newRate - rate) < tolerance) {
        return newRate * 100;
      }
      rate = newRate;
    }

    return rate * 100;
  };

  const calculateMIRR = (flows: CashFlow[], financeRate: number, reinvestRate: number): number => {
    const maxYear = Math.max(...flows.map(cf => cf.year));

    let positiveFlows = 0;
    let negativeFlows = 0;

    for (const cf of flows) {
      const discountedNegative = cf.amount < 0
        ? cf.amount / Math.pow(1 + financeRate / 100, cf.year)
        : 0;
      const compoundedPositive = cf.amount > 0
        ? cf.amount * Math.pow(1 + reinvestRate / 100, maxYear - cf.year)
        : 0;

      negativeFlows += discountedNegative;
      positiveFlows += compoundedPositive;
    }

    if (negativeFlows === 0) return 0;

    const mirr = (Math.pow(positiveFlows / Math.abs(negativeFlows), 1 / maxYear) - 1) * 100;
    return isNaN(mirr) ? 0 : mirr;
  };

  const calculateProfitabilityIndex = (flows: CashFlow[], rate: number): number => {
    let pv = 0;
    let initialInvestment = 0;

    for (const cf of flows) {
      if (cf.year === 0 && cf.amount < 0) {
        initialInvestment += Math.abs(cf.amount);
      } else {
        pv += cf.amount / Math.pow(1 + rate / 100, cf.year);
      }
    }

    return initialInvestment > 0 ? pv / initialInvestment : 0;
  };

  const irr = calculateIRR(cashFlows);
  const npv = calculateNPV(cashFlows, discountRate);
  const totalCashFlow = cashFlows.reduce((sum, cf) => sum + cf.amount, 0);
  const totalInvested = Math.abs(cashFlows.find(cf => cf.amount < 0)?.amount || 0);

  let cumulative = 0;
  let paybackPeriod = 0;
  for (const cf of cashFlows) {
    cumulative += cf.amount;
    if (cumulative >= 0) {
      paybackPeriod = cf.year;
      break;
    }
  }

  const mirr = showAdvanced ? calculateMIRR(cashFlows, discountRate, reinvestmentRate) : undefined;
  const npvAlt = showAdvanced ? calculateNPV(cashFlows, alternativeDiscountRate) : undefined;
  const profitabilityIndex = showAdvanced ? calculateProfitabilityIndex(cashFlows, discountRate) : undefined;

  const result: IRRResult = {
    irr: isNaN(irr) ? 0 : irr,
    npv,
    paybackPeriod: paybackPeriod || cashFlows[cashFlows.length - 1].year,
    totalCashFlow,
    totalInvested,
    mirr: mirr ? (isNaN(mirr) ? 0 : mirr) : undefined,
    profitabilityIndex,
  };

  const symbol = symbols[currency] || 'Rp';

  // Generate report data
  const reportData = useMemo(() => {
    return generateIRRReport(
      {
        initialInvestment: totalInvested,
        cashFlows: cashFlows.filter(cf => cf.year > 0).map(cf => ({ year: cf.year, amount: cf.amount })),
        discountRate,
      },
      {
        irr: result.irr,
        npv: result.npv,
        mirr: result.mirr,
        paybackPeriod: result.paybackPeriod,
        profitabilityIndex: result.profitabilityIndex || 0,
      },
      symbol
    );
  }, [cashFlows, discountRate, result, symbol, totalInvested]);

  const handleCashFlowChange = (index: number, field: keyof CashFlow, value: string) => {
    const newFlows = [...cashFlows];
    newFlows[index] = {
      ...newFlows[index],
      [field]: field === 'year' ? parseInt(value) : parseDecimalInput(value) || 0,
    };
    setCashFlows(newFlows);
  };

  const handleAddCashFlow = useCallback(() => {
    const lastYear = Math.max(...cashFlows.map(cf => cf.year));
    setCashFlows([...cashFlows, { year: lastYear + 1, amount: 0 }]);
  }, [cashFlows]);

  const handleRemoveCashFlow = useCallback((index: number) => {
    if (cashFlows.length > 1) {
      setCashFlows(cashFlows.filter((_, i) => i !== index));
    }
  }, [cashFlows]);

  const handleReset = useCallback(() => {
    if (showResetConfirm) {
      setCashFlows(INITIAL_CASH_FLOWS);
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
        <header className="mb-6 sm:mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-600 to-cyan-800 flex items-center justify-center shadow-lg shadow-cyan-900/30">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">IRR Calculator</h1>
              <p className="text-zinc-500 text-sm mt-1">
                Calculate Internal Rate of Return and NPV for your investment project
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
              currency={currency}
              onCurrencyChange={(c) => setCurrency(c as CurrencyType)}
              onReset={handleReset}
              onOpenReport={() => setShowReportModal(true)}
              calculatorType="irr"
              projectData={{ projectName: "IRR Analysis", totalInvestment: result.totalInvested, roi: result.irr, breakEvenMonths: Math.round(result.paybackPeriod * 12), currency }}
              projectName="IRR Analysis"
              showResetConfirm={showResetConfirm}
            />
          </div>
        </header>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-9 space-y-6">
            {/* Description */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
              <div className="mb-6 flex items-center border-b border-zinc-800 pb-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-400">info</span>
                  <h2 className="text-xl font-bold text-white">IRR (Internal Rate of Return)</h2>
                </div>
              </div>
              <p className="text-sm text-zinc-400 mb-3">
                IRR is the discount rate that makes NPV = 0. It represents the annualized return on your investment.
              </p>
              <p className="text-sm text-zinc-400">
                NPV at {discountRate}% discount rate shows the present value of all future cash flows.
              </p>
            </div>

            {/* Settings */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
              <div className="mb-6 flex items-center border-b border-zinc-800 pb-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-400">tune</span>
                  <h2 className="text-xl font-bold text-white">Settings</h2>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="flex items-center gap-1.5 text-sm font-medium text-zinc-400">
                    Discount Rate for NPV Calculation (%)
                  </label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={discountRate === 0 ? '' : discountRate}
                    onChange={(e) => setDiscountRate(parseDecimalInput(e.target.value) || 0)}
                    placeholder="0"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-6 py-4 text-[16px] font-bold text-white placeholder:text-zinc-500 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all tabular-nums"
                  />
                  <p className="text-xs text-zinc-500">Typically 8-12%. Higher = more conservative.</p>
                </div>

                <AdvancedSection
                  title="Advanced Assumptions"
                                    isOpen={showAdvanced}
                  onToggle={() => setShowAdvanced(!showAdvanced)}
                  description="MIRR and sensitivity analysis"
                >
                  <div className="space-y-6 pt-4">
                    <div className="space-y-3">
                      <label className="flex items-center gap-1.5 text-sm font-medium text-zinc-400">
                        Reinvestment Rate for MIRR (%)
                      </label>
                      <input
                        type="text"
                        inputMode="decimal"
                        value={reinvestmentRate === 0 ? '' : reinvestmentRate}
                        onChange={(e) => setReinvestmentRate(parseDecimalInput(e.target.value) || 0)}
                        placeholder="0"
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-6 py-4 text-[16px] font-bold text-white placeholder:text-zinc-500 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all tabular-nums"
                      />
                      <p className="text-xs text-zinc-500">Rate at which positive cash flows are reinvested</p>
                    </div>

                    <div className="space-y-3">
                      <label className="flex items-center gap-1.5 text-sm font-medium text-zinc-400">
                        Alternative Discount Rate (%)
                      </label>
                      <input
                        type="text"
                        inputMode="decimal"
                        value={alternativeDiscountRate === 0 ? '' : alternativeDiscountRate}
                        onChange={(e) => setAlternativeDiscountRate(parseDecimalInput(e.target.value) || 0)}
                        placeholder="0"
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-6 py-4 text-[16px] font-bold text-white placeholder:text-zinc-500 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all tabular-nums"
                      />
                      <p className="text-xs text-zinc-500">Scenario analysis with different discount rate</p>
                    </div>
                  </div>
                </AdvancedSection>
              </div>
            </div>

            {/* Cash Flows */}
            <CashFlowInputs
              cashFlows={cashFlows}
              onCashFlowChange={handleCashFlowChange}
              onAddCashFlow={handleAddCashFlow}
              onRemoveCashFlow={handleRemoveCashFlow}
              currency={currency}
            />
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
                <IRRResults
                  result={result}
                  discountRate={discountRate}
                  alternativeDiscountRate={alternativeDiscountRate}
                  npvAlt={npvAlt}
                  showAdvanced={showAdvanced}
                  reinvestmentRate={reinvestmentRate}
                />

                {/* Comparison Buttons */}
                <ComparisonButtons
                  calculatorType="irr"
                  getComparisonData={() => {
                    const rating = result.irr >= 20
                      ? { grade: 'A+', label: 'Excellent' }
                      : result.irr >= 15
                      ? { grade: 'A', label: 'Great' }
                      : result.irr >= 10
                      ? { grade: 'B+', label: 'Good' }
                      : result.irr >= 5
                      ? { grade: 'B', label: 'Fair' }
                      : { grade: 'C', label: 'Low' };

                    return {
                      calculatorType: 'irr' as const,
                      label: 'IRR Analysis',
                      currency,
                      totalInvested: result.totalInvested,
                      irr: result.irr,
                      npv: result.npv,
                      paybackPeriod: result.paybackPeriod,
                      investmentRating: rating,
                    } as Omit<IRRComparisonData, 'timestamp'>;
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default IRRCalculator;
