import { useState, useCallback, useMemo, useEffect } from 'react';
import { Toast } from '../../components/ui/Toast';
import { CalculatorToolbar } from '../../components/ui/CalculatorToolbar';
import { ReportPreviewModal } from '../../components/ui/ReportPreviewModal';
import { DraftSelector } from '../../components/ui/DraftSelector';
import { ComparisonButtons } from '../../components/ui/ComparisonButtons';
import { generateDevFeasibilityReport } from '../../hooks/useReportGenerator';
import { formatCurrency, parseDecimalInput } from '../../utils/numberParsing';
import { AdvancedSection } from '../../components/AdvancedSection';
import { Tooltip } from '../../components/ui/Tooltip';
import { useArchivedDrafts, type ArchivedDraft } from '../../hooks/useArchivedDrafts';
import { useAutoSave, loadAutoSave } from '../../hooks/useAutoSave';
import { useAuth } from '../../lib/auth-context';
import type { DevFeasibilityComparisonData } from '../../lib/comparison-types';

interface DevInputs {
  landSizeM2: number;
  landCost: number;
  costPerM2: number;
  avgVillaSize: number;
  avgSalePrice: number;
  avgAnnualRentalIncome: number;
  holdingPeriod: number;
  numVillas: number;
  currency: 'IDR' | 'USD' | 'AUD' | 'EUR' | 'GBP' | 'INR' | 'CNY' | 'AED' | 'RUB';
  showSoftCosts: boolean;
  architectureFeePercent: number;
  engineeringLegalPercent: number;
  marketingSalesCommissionPercent: number;
  pmFeePercent: number;
  showPermits: boolean;
  permitsLicenses: number;
  infrastructureCost: number;
  showFinancing: boolean;
  loanPercent: number;
  interestRate: number;
  constructionMonths: number;
  showExitCosts: boolean;
  saleSalesCommissionPercent: number;
  capitalGainsTaxPercent: number;
}

interface VillaScenario {
  numVillas: number;
  totalConstructionArea: number;
  usableArea: number;
  constructionCost: number;
  softCosts: number;
  permitsCosts: number;
  financeCharges: number;
  totalProjectCost: number;
  revenueFromSale: number;
  exitCosts: number;
  grossProfit: number;
  roiFlip: number;
  rentalIncome10Year: number;
  rentalPlusResidual: number;
  roiHold: number;
}

const INITIAL_INPUTS: DevInputs = {
  landSizeM2: 0,
  landCost: 0,
  costPerM2: 0,
  avgVillaSize: 0,
  avgSalePrice: 0,
  avgAnnualRentalIncome: 0,
  holdingPeriod: 0,
  numVillas: 0,
  currency: 'IDR',
  showSoftCosts: false,
  architectureFeePercent: 0,
  engineeringLegalPercent: 0,
  marketingSalesCommissionPercent: 0,
  pmFeePercent: 0,
  showPermits: false,
  permitsLicenses: 0,
  infrastructureCost: 0,
  showFinancing: false,
  loanPercent: 0,
  interestRate: 0,
  constructionMonths: 0,
  showExitCosts: false,
  saleSalesCommissionPercent: 0,
  capitalGainsTaxPercent: 0,
};

type CurrencyType = 'IDR' | 'USD' | 'AUD' | 'EUR' | 'GBP' | 'INR' | 'CNY' | 'AED' | 'RUB';

const symbols: Record<CurrencyType, string> = { IDR: 'Rp', USD: '$', AUD: 'A$', EUR: '€', GBP: '£', INR: '₹', CNY: '¥', AED: 'د.إ', RUB: '₽' };

export function DevFeasibilityCalculator() {
  const [inputs, setInputs] = useState<DevInputs>(() => {
    const saved = loadAutoSave<DevInputs>('dev-feasibility');
    return saved?.data || INITIAL_INPUTS;
  });
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [currentDraftName, setCurrentDraftName] = useState<string | undefined>();

  const { user } = useAuth();
  const { drafts, saveDraft: saveArchivedDraft, deleteDraft } = useArchivedDrafts<DevInputs>('dev-feasibility', user?.id);

  // Auto-save for "Continue Where You Left Off"
  useAutoSave('dev-feasibility', inputs, (data) => ({
    landCost: data.landCost,
    avgSalePrice: data.avgSalePrice,
    currency: data.currency,
  }));

  const handleSelectDraft = useCallback((draft: ArchivedDraft<DevInputs>) => {
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

  const calculateScenarios = useCallback((): VillaScenario[] => {
    const {
      landSizeM2,
      landCost,
      costPerM2,
      avgVillaSize,
      avgSalePrice,
      avgAnnualRentalIncome,
      holdingPeriod,
      numVillas,
      showSoftCosts,
      architectureFeePercent,
      engineeringLegalPercent,
      marketingSalesCommissionPercent,
      pmFeePercent,
      showPermits,
      permitsLicenses,
      infrastructureCost,
      showFinancing,
      loanPercent,
      interestRate,
      constructionMonths,
      showExitCosts,
      saleSalesCommissionPercent,
      capitalGainsTaxPercent,
    } = inputs;

    const scenarios: VillaScenario[] = [];
    const maxVillas = Math.floor((landSizeM2 * 0.4) / avgVillaSize);
    const showAllScenarios = numVillas === 0;
    const villasToShow = showAllScenarios ? Math.min(maxVillas, 10) : Math.min(numVillas, maxVillas);
    const startVilla = showAllScenarios ? 1 : Math.max(1, numVillas - 1);
    const endVilla = showAllScenarios ? villasToShow : Math.min(villasToShow, numVillas + 2);

    for (let villas = startVilla; villas <= endVilla; villas++) {
      const totalConstructionArea = villas * avgVillaSize;
      const usableArea = landSizeM2 * 0.4;
      const constructionCost = totalConstructionArea * costPerM2;

      const softCosts = showSoftCosts
        ? constructionCost * ((architectureFeePercent + engineeringLegalPercent + marketingSalesCommissionPercent + pmFeePercent) / 100)
        : 0;

      const permitsCosts = showPermits ? permitsLicenses + infrastructureCost : 0;

      let financeCharges = 0;
      if (showFinancing && loanPercent > 0) {
        const loanAmount = (landCost + permitsCosts + constructionCost + softCosts) * (loanPercent / 100);
        const monthlyRate = interestRate / 100 / 12;
        financeCharges = loanAmount * monthlyRate * constructionMonths;
      }

      const totalProjectCost = landCost + permitsCosts + constructionCost + softCosts + financeCharges;
      const revenueFromSale = villas * avgSalePrice;

      let exitCosts = 0;
      if (showExitCosts) {
        const salesCommission = revenueFromSale * (saleSalesCommissionPercent / 100);
        const gainOnSale = Math.max(0, revenueFromSale - totalProjectCost);
        const capitalGainsTax = gainOnSale * (capitalGainsTaxPercent / 100);
        exitCosts = salesCommission + capitalGainsTax;
      }

      const grossProfit = revenueFromSale - totalProjectCost - exitCosts;
      const roiFlip = (grossProfit / totalProjectCost) * 100;

      const rentalIncome10Year = villas * avgAnnualRentalIncome * holdingPeriod;
      const residualValue = revenueFromSale * 0.85;
      const rentalPlusResidual = rentalIncome10Year + residualValue;
      const netReturn = rentalPlusResidual - totalProjectCost;
      const roiHold = (netReturn / totalProjectCost) * 100;

      scenarios.push({
        numVillas: villas,
        totalConstructionArea,
        usableArea,
        constructionCost,
        softCosts,
        permitsCosts,
        financeCharges,
        totalProjectCost,
        revenueFromSale,
        exitCosts,
        grossProfit,
        roiFlip,
        rentalIncome10Year,
        rentalPlusResidual,
        roiHold,
      });
    }

    return scenarios;
  }, [inputs]);

  const scenarios = calculateScenarios();

  const defaultScenario: VillaScenario = {
    numVillas: 0,
    totalConstructionArea: 0,
    usableArea: 0,
    constructionCost: 0,
    softCosts: 0,
    permitsCosts: 0,
    financeCharges: 0,
    totalProjectCost: 0,
    revenueFromSale: 0,
    exitCosts: 0,
    grossProfit: 0,
    roiFlip: 0,
    rentalIncome10Year: 0,
    rentalPlusResidual: 0,
    roiHold: 0,
  };

  const bestFlipScenario = scenarios.length > 0
    ? scenarios.reduce((best, current) => (current.roiFlip > best.roiFlip ? current : best))
    : defaultScenario;
  const bestHoldScenario = scenarios.length > 0
    ? scenarios.reduce((best, current) => (current.roiHold > best.roiHold ? current : best))
    : defaultScenario;

  const handleInputChange = (field: keyof DevInputs, value: string | number | boolean) => {
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

  const symbol = symbols[inputs.currency] || 'Rp';

  // Generate report data for PDF export
  const reportData = useMemo(() => {
    return generateDevFeasibilityReport(
      {
        landSizeM2: inputs.landSizeM2,
        landCost: inputs.landCost,
        costPerM2: inputs.costPerM2,
        avgVillaSize: inputs.avgVillaSize,
        avgSalePrice: inputs.avgSalePrice,
        avgAnnualRentalIncome: inputs.avgAnnualRentalIncome,
        holdingPeriod: inputs.holdingPeriod,
        numVillas: inputs.numVillas,
      },
      bestFlipScenario,
      bestHoldScenario,
      scenarios,
      symbol
    );
  }, [inputs, bestFlipScenario, bestHoldScenario, scenarios, symbol]);

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
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-600 to-orange-800 flex items-center justify-center shadow-lg shadow-orange-900/30">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Dev Feasibility</h1>
              <p className="text-zinc-500 text-sm mt-1">
                Analyze property development scenarios for flip and hold strategies
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
              calculatorType="dev-feasibility"
              projectData={{ ...inputs, scenarios }}
              projectName="Development Feasibility"
              showResetConfirm={showResetConfirm}
            />
          </div>
        </header>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Input Section */}
          <div className="lg:col-span-9 space-y-6">
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
              <div className="mb-6 flex items-center border-b border-zinc-800 pb-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-400">landscape</span>
                  <h2 className="text-xl font-bold text-white">Land & Construction</h2>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <InputField
                  label="Land Size"
                  value={inputs.landSizeM2}
                  onChange={(v) => handleInputChange('landSizeM2', v)}
                  suffix="m²"
                  tooltip="Total land area in square meters"
                />

                <InputField
                  label="Land Cost"
                  value={inputs.landCost}
                  onChange={(v) => handleInputChange('landCost', v)}
                  prefix={symbol}
                  tooltip="Total cost to acquire the land"
                />

                <InputField
                  label="Construction Cost"
                  value={inputs.costPerM2}
                  onChange={(v) => handleInputChange('costPerM2', v)}
                  prefix={symbol}
                  suffix="/m²"
                  tooltip="Construction cost per square meter"
                />
              </div>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
              <div className="mb-6 flex items-center border-b border-zinc-800 pb-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-400">home</span>
                  <h2 className="text-xl font-bold text-white">Villa Configuration</h2>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <InputField
                  label="Number of Villas"
                  value={inputs.numVillas}
                  onChange={(v) => handleInputChange('numVillas', v)}
                  tooltip="Number of villas to build (0 for auto scenarios)"
                />

                <InputField
                  label="Average Villa Size"
                  value={inputs.avgVillaSize}
                  onChange={(v) => handleInputChange('avgVillaSize', v)}
                  suffix="m²"
                  tooltip="Average built area per villa"
                />

                <InputField
                  label="Sale Price (per villa)"
                  value={inputs.avgSalePrice}
                  onChange={(v) => handleInputChange('avgSalePrice', v)}
                  prefix={symbol}
                  tooltip="Expected sale price per villa"
                />

                <InputField
                  label="Annual Rental Income"
                  value={inputs.avgAnnualRentalIncome}
                  onChange={(v) => handleInputChange('avgAnnualRentalIncome', v)}
                  prefix={symbol}
                  tooltip="Expected annual rental income per villa"
                />

                <InputField
                  label="Hold Period"
                  value={inputs.holdingPeriod}
                  onChange={(v) => handleInputChange('holdingPeriod', v)}
                  suffix="years"
                  tooltip="Investment holding period for rental strategy"
                />
              </div>
            </div>

            {/* Advanced Sections */}
            <AdvancedSection
              title="Permits & Infrastructure"
                            isOpen={inputs.showPermits}
              onToggle={() => handleInputChange('showPermits', !inputs.showPermits)}
              description="Permits, licenses, and infrastructure costs"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                <InputField
                  label="Permits & Licenses"
                  value={inputs.permitsLicenses}
                  onChange={(v) => handleInputChange('permitsLicenses', v)}
                  prefix={symbol}
                  tooltip="Cost for building permits and licenses"
                />

                <InputField
                  label="Infrastructure Cost"
                  value={inputs.infrastructureCost}
                  onChange={(v) => handleInputChange('infrastructureCost', v)}
                  prefix={symbol}
                  tooltip="Roads, utilities, landscaping costs"
                />
              </div>
            </AdvancedSection>

            <AdvancedSection
              title="Soft Costs"
                            isOpen={inputs.showSoftCosts}
              onToggle={() => handleInputChange('showSoftCosts', !inputs.showSoftCosts)}
              description="Professional fees and commissions"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
                <InputField
                  label="Architecture Fee"
                  value={inputs.architectureFeePercent}
                  onChange={(v) => handleInputChange('architectureFeePercent', v)}
                  suffix="%"
                  tooltip="Architect fees as % of construction"
                />

                <InputField
                  label="Engineering/Legal"
                  value={inputs.engineeringLegalPercent}
                  onChange={(v) => handleInputChange('engineeringLegalPercent', v)}
                  suffix="%"
                  tooltip="Engineering and legal fees"
                />

                <InputField
                  label="Marketing/Sales"
                  value={inputs.marketingSalesCommissionPercent}
                  onChange={(v) => handleInputChange('marketingSalesCommissionPercent', v)}
                  suffix="%"
                  tooltip="Marketing and sales commission"
                />

                <InputField
                  label="Project Management"
                  value={inputs.pmFeePercent}
                  onChange={(v) => handleInputChange('pmFeePercent', v)}
                  suffix="%"
                  tooltip="Project management fees"
                />
              </div>
            </AdvancedSection>

            <AdvancedSection
              title="Financing"
                            isOpen={inputs.showFinancing}
              onToggle={() => handleInputChange('showFinancing', !inputs.showFinancing)}
              description="Loan and interest calculations"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                <InputField
                  label="Loan % of Project"
                  value={inputs.loanPercent}
                  onChange={(v) => handleInputChange('loanPercent', v)}
                  suffix="%"
                  tooltip="Percentage of project financed"
                />

                <InputField
                  label="Interest Rate"
                  value={inputs.interestRate}
                  onChange={(v) => handleInputChange('interestRate', v)}
                  suffix="%"
                  tooltip="Annual interest rate on loan"
                />

                <InputField
                  label="Construction Period"
                  value={inputs.constructionMonths}
                  onChange={(v) => handleInputChange('constructionMonths', v)}
                  suffix="months"
                  tooltip="Duration of construction"
                />
              </div>
            </AdvancedSection>

            <AdvancedSection
              title="Exit Costs"
                            isOpen={inputs.showExitCosts}
              onToggle={() => handleInputChange('showExitCosts', !inputs.showExitCosts)}
              description="Sales commissions and taxes"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                <InputField
                  label="Sales Commission"
                  value={inputs.saleSalesCommissionPercent}
                  onChange={(v) => handleInputChange('saleSalesCommissionPercent', v)}
                  suffix="%"
                  tooltip="Agent commission on sale"
                />

                <InputField
                  label="Capital Gains Tax"
                  value={inputs.capitalGainsTaxPercent}
                  onChange={(v) => handleInputChange('capitalGainsTaxPercent', v)}
                  suffix="%"
                  tooltip="Tax on profit from sale"
                />
              </div>
            </AdvancedSection>
          </div>

          {/* Results Section */}
          <div className="lg:col-span-3">
            <div className="sticky top-20 flex flex-col gap-4">
              {/* Comparison Buttons */}
              <ComparisonButtons
                calculatorType="dev-feasibility"
                getComparisonData={() => {
                  const rating = bestFlipScenario.roiFlip >= 50
                    ? { grade: 'A+', label: 'Excellent' }
                    : bestFlipScenario.roiFlip >= 35
                    ? { grade: 'A', label: 'Great' }
                    : bestFlipScenario.roiFlip >= 20
                    ? { grade: 'B+', label: 'Good' }
                    : bestFlipScenario.roiFlip >= 10
                    ? { grade: 'B', label: 'Fair' }
                    : { grade: 'C', label: 'Low' };

                  return {
                    calculatorType: 'dev-feasibility' as const,
                    label: 'Dev Feasibility',
                    currency: inputs.currency,
                    landCost: inputs.landCost,
                    numVillas: bestFlipScenario.numVillas,
                    totalProjectCost: bestFlipScenario.totalProjectCost,
                    revenueFromSale: bestFlipScenario.revenueFromSale,
                    flipProfit: bestFlipScenario.grossProfit,
                    flipROI: bestFlipScenario.roiFlip,
                    holdROI: bestHoldScenario.roiHold,
                    investmentRating: rating,
                  } as Omit<DevFeasibilityComparisonData, 'timestamp'>;
                }}
              />

              <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
                <div className="mb-4 flex items-center border-b border-zinc-800 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-emerald-400">analytics</span>
                    <h3 className="text-lg font-bold text-white">Results</h3>
                  </div>
                </div>

                <div className="space-y-4">
                  <ResultCard
                    title="Best Flip ROI"
                    value={`${bestFlipScenario.roiFlip.toFixed(1)}%`}
                    label={`${bestFlipScenario.numVillas} villas • ${symbol} ${formatCurrency(bestFlipScenario.grossProfit, inputs.currency)} profit`}
                    color="purple"
                    icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}
                  />

                  <ResultCard
                    title={`Best Hold ROI (${inputs.holdingPeriod}yr)`}
                    value={`${bestHoldScenario.roiHold.toFixed(1)}%`}
                    label={`${bestHoldScenario.numVillas} villas • ${symbol} ${formatCurrency(bestHoldScenario.rentalPlusResidual - bestHoldScenario.totalProjectCost, inputs.currency)} return`}
                    color="emerald"
                    icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                  />

                  <MiniCard
                    title="Total Project Cost"
                    value={`${symbol} ${formatCurrency(bestFlipScenario.totalProjectCost, inputs.currency)}`}
                    color="zinc"
                  />

                  <MiniCard
                    title="Sale Revenue"
                    value={`${symbol} ${formatCurrency(bestFlipScenario.revenueFromSale, inputs.currency)}`}
                    color="cyan"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Scenarios Table */}
        <div className="mt-6">
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
            <div className="mb-6 flex items-center border-b border-zinc-800 pb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-400">table_chart</span>
                <h3 className="text-xl font-bold text-white">Development Scenarios</h3>
              </div>
            </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-zinc-800 border-b border-zinc-700">
                    <tr>
                      <th className="px-3 py-2 text-left font-semibold text-zinc-300">Villas</th>
                      <th className="px-3 py-2 text-right font-semibold text-zinc-300">Build Cost</th>
                      <th className="px-3 py-2 text-right font-semibold text-zinc-300">Soft Costs</th>
                      <th className="px-3 py-2 text-right font-semibold text-zinc-300">Permits</th>
                      <th className="px-3 py-2 text-right font-semibold text-zinc-300">Finance</th>
                      <th className="px-3 py-2 text-right font-semibold text-zinc-300">Total Cost</th>
                      <th className="px-3 py-2 text-right font-semibold text-zinc-300">Sale Revenue</th>
                      <th className="px-3 py-2 text-right font-semibold text-zinc-300">Exit Cost</th>
                      <th className="px-3 py-2 text-right font-semibold text-zinc-300">Flip Profit</th>
                      <th className="px-3 py-2 text-right font-semibold text-zinc-300">Flip ROI</th>
                      <th className="px-3 py-2 text-right font-semibold text-zinc-300">Hold ROI</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scenarios.map(scenario => (
                      <tr
                        key={scenario.numVillas}
                        className={`border-b border-zinc-800 hover:bg-zinc-800/50 ${
                          scenario.numVillas === bestFlipScenario.numVillas || scenario.numVillas === bestHoldScenario.numVillas
                            ? 'bg-emerald-500/10'
                            : ''
                        }`}
                      >
                        <td className="px-3 py-2 font-medium text-white">{scenario.numVillas}</td>
                        <td className="px-3 py-2 text-right text-zinc-400">
                          {symbol} {formatCurrency(scenario.constructionCost, inputs.currency)}
                        </td>
                        <td className="px-3 py-2 text-right text-zinc-400">
                          {symbol} {formatCurrency(scenario.softCosts, inputs.currency)}
                        </td>
                        <td className="px-3 py-2 text-right text-zinc-400">
                          {symbol} {formatCurrency(scenario.permitsCosts, inputs.currency)}
                        </td>
                        <td className="px-3 py-2 text-right text-zinc-400">
                          {symbol} {formatCurrency(scenario.financeCharges, inputs.currency)}
                        </td>
                        <td className="px-3 py-2 text-right font-medium text-white">
                          {symbol} {formatCurrency(scenario.totalProjectCost, inputs.currency)}
                        </td>
                        <td className="px-3 py-2 text-right text-emerald-400">
                          {symbol} {formatCurrency(scenario.revenueFromSale, inputs.currency)}
                        </td>
                        <td className="px-3 py-2 text-right text-red-400">
                          {symbol} {formatCurrency(scenario.exitCosts, inputs.currency)}
                        </td>
                        <td className="px-3 py-2 text-right font-medium text-white">
                          {symbol} {formatCurrency(scenario.grossProfit, inputs.currency)}
                        </td>
                        <td className="px-3 py-2 text-right font-bold text-purple-400">
                          {scenario.roiFlip.toFixed(1)}%
                        </td>
                        <td className="px-3 py-2 text-right font-bold text-emerald-400">
                          {scenario.roiHold.toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
          </div>
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
  zinc: { text: 'text-zinc-300', bg: 'bg-zinc-800', border: 'border-zinc-700' },
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

function MiniCard({ title, value, color }: { title: string; value: string; color: keyof typeof colorMap }) {
  const colors = colorMap[color];

  return (
    <div className="bg-zinc-800 rounded-xl p-3 border border-zinc-700">
      <p className="text-xs text-zinc-400 mb-1">{title}</p>
      <p className={`font-bold ${colors.text} text-sm tabular-nums`}>{value}</p>
    </div>
  );
}

function InputField({ label, value, onChange, prefix, suffix, tooltip }: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  prefix?: string;
  suffix?: string;
  tooltip?: string;
}) {
  const [localValue, setLocalValue] = useState(value === 0 ? '' : String(value));

  useEffect(() => {
    const currentParsed = parseDecimalInput(localValue);
    if (value !== currentParsed && !isNaN(value)) {
      setLocalValue(value === 0 ? '' : String(value));
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === '' || /^-?[0-9]*[.,]?[0-9]*$/.test(val)) {
      setLocalValue(val);
      if (val === '' || val === '-') {
        onChange(0);
      } else {
        const parsed = parseDecimalInput(val);
        if (!isNaN(parsed)) {
          onChange(parsed);
        }
      }
    }
  };

  return (
    <div className="space-y-3">
      <label className="flex items-center gap-1.5 text-sm font-medium text-zinc-400">
        {label}
        {tooltip && <Tooltip text={tooltip} />}
      </label>
      <div className="relative">
        {prefix && (
          <span className="absolute left-5 top-1/2 -translate-y-1/2 text-[13px] font-bold text-zinc-500">{prefix}</span>
        )}
        <input
          type="text"
          inputMode="decimal"
          value={localValue}
          onChange={handleChange}
          placeholder="0"
          className={`w-full bg-zinc-800 border border-zinc-700 rounded-2xl py-4 text-[16px] font-bold text-white placeholder:text-zinc-500 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all tabular-nums ${prefix ? 'pl-12 pr-6' : suffix ? 'pl-6 pr-16' : 'px-6'}`}
        />
        {suffix && (
          <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[13px] font-bold text-zinc-500">{suffix}</span>
        )}
      </div>
    </div>
  );
}

export default DevFeasibilityCalculator;
