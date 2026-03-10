import { useState, useCallback, useMemo, useEffect } from 'react';
import { Toast } from '../../components/ui/Toast';
import { CalculatorToolbar } from '../../components/ui/CalculatorToolbar';
import { ReportPreviewModal } from '../../components/ui/ReportPreviewModal';
import { DraftSelector } from '../../components/ui/DraftSelector';
import { ComparisonButtons } from '../../components/ui/ComparisonButtons';
import { generateIndonesiaTaxReport } from '../../hooks/useReportGenerator';
import { formatCurrency, parseDecimalInput } from '../../utils/numberParsing';
import { AdvancedSection } from '../../components/AdvancedSection';
import { Tooltip } from '../../components/ui/Tooltip';
import { TaxResults } from './components/TaxResults';
import { TaxProjectionTable } from './components/TaxProjectionTable';
import { OwnershipComparison } from './components/OwnershipComparison';
import { useArchivedDrafts, type ArchivedDraft } from '../../hooks/useArchivedDrafts';
import { useAuth } from '../../lib/auth-context';
import type { IndonesiaTaxComparisonData } from '../../lib/comparison-types';

type CurrencyType = 'IDR' | 'USD' | 'AUD' | 'EUR' | 'GBP';
type OwnershipType = 'pt' | 'freehold' | 'leasehold';

interface TaxInputs {
  // Basic inputs
  purchasePrice: number;
  holdingPeriod: number;
  projectedSalePrice: number;
  ownershipStructure: OwnershipType;
  annualMaintenanceExpenses: number;
  propertyTaxRate: number;
  currency: CurrencyType;

  // Advanced - Depreciation
  showDepreciation: boolean;
  buildingValue: number; // portion of purchase price that is building (vs land)
  buildingDepreciationRate: number; // typically 4-5% per year

  // Advanced - Deductions
  showDeductions: boolean;
  annualUtilities: number;
  annualPropertyManagement: number;
  annualInsurance: number;
  annualOtherExpenses: number;

  // Advanced - Capital Gains
  showCapitalGains: boolean;
  acquisitionCosts: number; // notary, legal, etc.
  sellingCosts: number; // agent fees, marketing

  // Advanced - Ownership Impact
  showOwnershipImpact: boolean;
  corporateTaxRate: number; // PT corporate tax rate
  individualCapGainRate: number; // individual capital gains rate

  // Advanced - Reinvestment
  showReinvestment: boolean;
  reinvestmentAmount: number;
  reinvestmentYield: number;
}

export interface YearlyTaxProjection {
  year: number;
  propertyValue: number;
  accumulatedDepreciation: number;
  adjustedBasis: number;
  grossIncome: number;
  totalDeductions: number;
  taxableIncome: number;
  annualTaxLiability: number;
  netIncome: number;
  cumulativeTaxPaid: number;
}

export interface TaxCalculationResult {
  // Summary metrics
  grossROI: number;
  netROI: number;
  totalTaxLiability: number;
  effectiveTaxRate: number;

  // Capital gains breakdown
  capitalGain: number;
  capitalGainsTax: number;
  depreciationRecapture: number;
  depreciationRecaptureTax: number;

  // Depreciation benefits
  totalDepreciation: number;
  depreciationTaxSavings: number;

  // Deduction summary
  totalDeductions: number;
  deductionTaxSavings: number;

  // Net amounts
  netProceeds: number;
  netProfit: number;

  // Ownership comparison
  ptTaxLiability: number;
  freeholdTaxLiability: number;
  leaseholdTaxLiability: number;
  optimalStructure: OwnershipType;
  taxSavingsFromOptimal: number;

  // Year-by-year projections
  yearlyProjections: YearlyTaxProjection[];

  // Reinvestment scenario
  reinvestmentValue?: number;
  reinvestmentTaxDeferred?: number;
}

const INITIAL_INPUTS: TaxInputs = {
  purchasePrice: 0,
  holdingPeriod: 0,
  projectedSalePrice: 0,
  ownershipStructure: 'pt',
  annualMaintenanceExpenses: 0,
  propertyTaxRate: 0,
  currency: 'IDR',

  showDepreciation: false,
  buildingValue: 0,
  buildingDepreciationRate: 0,

  showDeductions: false,
  annualUtilities: 0,
  annualPropertyManagement: 0,
  annualInsurance: 0,
  annualOtherExpenses: 0,

  showCapitalGains: false,
  acquisitionCosts: 0,
  sellingCosts: 0,

  showOwnershipImpact: false,
  corporateTaxRate: 0,
  individualCapGainRate: 0,

  showReinvestment: false,
  reinvestmentAmount: 0,
  reinvestmentYield: 0,
};

const symbols: Record<CurrencyType, string> = {
  IDR: 'Rp',
  USD: '$',
  AUD: 'A$',
  EUR: '€',
  GBP: '£',
};

const ownershipLabels: Record<OwnershipType, string> = {
  pt: 'PT (Company)',
  freehold: 'Freehold (Individual)',
  leasehold: 'Leasehold',
};

export function IndonesiaTaxOptimizer() {
  const [inputs, setInputs] = useState<TaxInputs>(INITIAL_INPUTS);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [currentDraftName, setCurrentDraftName] = useState<string | undefined>();

  const { user } = useAuth();
  const { drafts, saveDraft: saveArchivedDraft, deleteDraft } = useArchivedDrafts<TaxInputs>('indonesia-tax', user?.id);

  const handleSelectDraft = useCallback((draft: ArchivedDraft<TaxInputs>) => {
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

  const calculateTax = useCallback((): TaxCalculationResult => {
    const {
      purchasePrice,
      holdingPeriod,
      projectedSalePrice,
      ownershipStructure,
      annualMaintenanceExpenses,
      propertyTaxRate,
      buildingValue,
      buildingDepreciationRate,
      annualUtilities,
      annualPropertyManagement,
      annualInsurance,
      annualOtherExpenses,
      acquisitionCosts,
      sellingCosts,
      corporateTaxRate,
      individualCapGainRate,
      reinvestmentAmount,
      reinvestmentYield,
      showDepreciation,
      showDeductions,
    } = inputs;

    // Calculate depreciation
    const annualDepreciation = showDepreciation ? (buildingValue * buildingDepreciationRate) / 100 : 0;
    const totalDepreciation = annualDepreciation * holdingPeriod;
    const adjustedBasis = purchasePrice + acquisitionCosts - totalDepreciation;

    // Calculate capital gain
    const grossProceeds = projectedSalePrice - sellingCosts;
    const capitalGain = grossProceeds - adjustedBasis;

    // Calculate annual deductions
    const annualDeductions = showDeductions
      ? annualMaintenanceExpenses + annualUtilities + annualPropertyManagement + annualInsurance + annualOtherExpenses
      : annualMaintenanceExpenses;
    const totalDeductions = annualDeductions * holdingPeriod;
    const annualPropertyTax = (purchasePrice * propertyTaxRate) / 100;
    const totalPropertyTax = annualPropertyTax * holdingPeriod;

    // Tax rates by ownership structure
    const getTaxRates = (structure: OwnershipType) => {
      switch (structure) {
        case 'pt':
          return {
            capitalGainsRate: corporateTaxRate / 100, // Corporate tax rate applies
            incomeRate: corporateTaxRate / 100,
            depreciationRecaptureRate: corporateTaxRate / 100,
            canDeduct: true,
          };
        case 'freehold':
          return {
            capitalGainsRate: individualCapGainRate / 100,
            incomeRate: holdingPeriod < 5 ? 0.30 : 0.20, // Short vs long term
            depreciationRecaptureRate: 0.25,
            canDeduct: false,
          };
        case 'leasehold':
          return {
            capitalGainsRate: 0.10, // Flat 10% on leasehold transfer
            incomeRate: 0.10,
            depreciationRecaptureRate: 0.10,
            canDeduct: false,
          };
      }
    };

    const calculateForStructure = (structure: OwnershipType) => {
      const rates = getTaxRates(structure);

      // Capital gains tax
      const cgTax = Math.max(0, capitalGain * rates.capitalGainsRate);

      // Depreciation recapture (if depreciation was taken)
      const depRecapture = showDepreciation ? totalDepreciation * rates.depreciationRecaptureRate : 0;

      // Deduction benefits (only for PT)
      const deductionBenefit = rates.canDeduct ? totalDeductions * rates.incomeRate : 0;
      const depreciationBenefit = rates.canDeduct && showDepreciation ? totalDepreciation * rates.incomeRate : 0;

      // Total tax
      const totalTax = cgTax + depRecapture + totalPropertyTax - deductionBenefit - depreciationBenefit;

      return {
        capitalGainsTax: cgTax,
        depreciationRecaptureTax: depRecapture,
        totalTaxLiability: Math.max(0, totalTax),
        deductionSavings: deductionBenefit,
        depreciationSavings: depreciationBenefit,
      };
    };

    // Calculate for current structure
    const currentCalc = calculateForStructure(ownershipStructure);

    // Calculate for all structures (comparison)
    const ptCalc = calculateForStructure('pt');
    const freeholdCalc = calculateForStructure('freehold');
    const leaseholdCalc = calculateForStructure('leasehold');

    // Determine optimal structure
    const structures: { type: OwnershipType; tax: number }[] = [
      { type: 'pt', tax: ptCalc.totalTaxLiability },
      { type: 'freehold', tax: freeholdCalc.totalTaxLiability },
      { type: 'leasehold', tax: leaseholdCalc.totalTaxLiability },
    ];
    const optimal = structures.reduce((min, curr) => (curr.tax < min.tax ? curr : min));

    // Calculate ROIs
    const netProceeds = grossProceeds - currentCalc.totalTaxLiability;
    const netProfit = netProceeds - purchasePrice - acquisitionCosts - totalDeductions;
    const grossROI = ((projectedSalePrice - purchasePrice) / purchasePrice) * 100;
    const netROI = (netProfit / (purchasePrice + acquisitionCosts)) * 100;
    const effectiveTaxRate = capitalGain > 0 ? (currentCalc.totalTaxLiability / capitalGain) * 100 : 0;

    // Generate year-by-year projections
    const yearlyProjections: YearlyTaxProjection[] = [];
    let cumulativeTaxPaid = 0;

    for (let year = 1; year <= holdingPeriod; year++) {
      const appreciation = (projectedSalePrice - purchasePrice) / holdingPeriod;
      const propertyValue = purchasePrice + appreciation * year;
      const accumulatedDep = annualDepreciation * year;
      const adjBasis = purchasePrice + acquisitionCosts - accumulatedDep;

      // Assume rental income (simplified - 5% of property value)
      const grossIncome = propertyValue * 0.05;
      const yearDeductions = annualDeductions + annualPropertyTax + annualDepreciation;
      const taxableIncome = Math.max(0, grossIncome - yearDeductions);
      const rates = getTaxRates(ownershipStructure);
      const annualTax = taxableIncome * rates.incomeRate;
      cumulativeTaxPaid += annualTax;

      yearlyProjections.push({
        year,
        propertyValue,
        accumulatedDepreciation: accumulatedDep,
        adjustedBasis: adjBasis,
        grossIncome,
        totalDeductions: yearDeductions,
        taxableIncome,
        annualTaxLiability: annualTax,
        netIncome: grossIncome - yearDeductions - annualTax,
        cumulativeTaxPaid,
      });
    }

    // Reinvestment calculation
    const reinvestmentValue = reinvestmentAmount > 0
      ? reinvestmentAmount * Math.pow(1 + reinvestmentYield / 100, holdingPeriod)
      : undefined;
    const reinvestmentTaxDeferred = reinvestmentAmount > 0
      ? reinvestmentAmount * (individualCapGainRate / 100)
      : undefined;

    return {
      grossROI,
      netROI,
      totalTaxLiability: currentCalc.totalTaxLiability,
      effectiveTaxRate,
      capitalGain,
      capitalGainsTax: currentCalc.capitalGainsTax,
      depreciationRecapture: totalDepreciation,
      depreciationRecaptureTax: currentCalc.depreciationRecaptureTax,
      totalDepreciation,
      depreciationTaxSavings: currentCalc.depreciationSavings,
      totalDeductions,
      deductionTaxSavings: currentCalc.deductionSavings,
      netProceeds,
      netProfit,
      ptTaxLiability: ptCalc.totalTaxLiability,
      freeholdTaxLiability: freeholdCalc.totalTaxLiability,
      leaseholdTaxLiability: leaseholdCalc.totalTaxLiability,
      optimalStructure: optimal.type,
      taxSavingsFromOptimal: currentCalc.totalTaxLiability - optimal.tax,
      yearlyProjections,
      reinvestmentValue,
      reinvestmentTaxDeferred,
    };
  }, [inputs]);

  const result = calculateTax();
  const symbol = symbols[inputs.currency] || 'Rp';

  // Generate report data for PDF export
  const reportData = useMemo(() => {
    return generateIndonesiaTaxReport(inputs, result, symbol);
  }, [inputs, result, symbol]);

  const handleInputChange = (field: keyof TaxInputs, value: string | number | boolean) => {
    setInputs(prev => ({
      ...prev,
      [field]: typeof value === 'string' && field !== 'ownershipStructure' && field !== 'currency'
        ? parseDecimalInput(value) || 0
        : value,
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
        <header className="mb-6 sm:mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center text-2xl shadow-lg shadow-red-900/30">
              <span className="text-white font-bold text-lg">ID</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Indonesia Tax Optimizer</h1>
              <p className="text-zinc-500 text-sm mt-1">
                Optimize real estate taxes with depreciation, deductions, and ownership structure analysis
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
              calculatorType="indonesia-tax"
              projectData={{ ...inputs, result }}
              projectName="Tax Optimization Analysis"
              showResetConfirm={showResetConfirm}
            />
          </div>
        </header>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Input Section */}
          <div className="lg:col-span-9 space-y-6">
            {/* Basic Inputs */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
              <div className="mb-6 flex items-center border-b border-zinc-800 pb-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-red-400">receipt_long</span>
                  <h2 className="text-xl font-bold text-white">Property & Investment Details</h2>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <InputField
                  label="Purchase Price"
                  value={inputs.purchasePrice}
                  onChange={(v) => handleInputChange('purchasePrice', v)}
                  prefix={symbol}
                  tooltip="Total acquisition price of the property"
                />

                <InputField
                  label="Holding Period"
                  value={inputs.holdingPeriod}
                  onChange={(v) => handleInputChange('holdingPeriod', v)}
                  suffix="years"
                  tooltip="Number of years you plan to hold the property. Holding >5 years may qualify for lower capital gains rates"
                />

                <InputField
                  label="Projected Sale Price"
                  value={inputs.projectedSalePrice}
                  onChange={(v) => handleInputChange('projectedSalePrice', v)}
                  prefix={symbol}
                  tooltip="Expected sale price at end of holding period"
                />

                <div className="space-y-3">
                  <label className="flex items-center gap-1.5 text-sm font-medium text-zinc-400">
                    Ownership Structure
                    <Tooltip text="PT ownership allows deductions but incurs corporate tax. Individual has higher capital gains tax. Leasehold has lowest transfer tax." />
                  </label>
                  <select
                    value={inputs.ownershipStructure}
                    onChange={(e) => handleInputChange('ownershipStructure', e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl py-4 px-6 text-[16px] font-bold text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                  >
                    <option value="pt">PT (Company)</option>
                    <option value="freehold">Freehold (Individual)</option>
                    <option value="leasehold">Leasehold</option>
                  </select>
                </div>

                <InputField
                  label="Annual Maintenance"
                  value={inputs.annualMaintenanceExpenses}
                  onChange={(v) => handleInputChange('annualMaintenanceExpenses', v)}
                  prefix={symbol}
                  tooltip="Annual maintenance and repair expenses"
                />

                <InputField
                  label="Property Tax Rate"
                  value={inputs.propertyTaxRate}
                  onChange={(v) => handleInputChange('propertyTaxRate', v)}
                  suffix="%"
                  tooltip="Annual property tax rate (PBB - Pajak Bumi dan Bangunan)"
                />
              </div>
            </div>

            {/* Depreciation Section */}
            <AdvancedSection
              title="Depreciation Schedule"
                            isOpen={inputs.showDepreciation}
              onToggle={() => handleInputChange('showDepreciation', !inputs.showDepreciation)}
              description="Year-by-year depreciation impact"
            >
              <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                <p className="text-xs text-amber-400">
                  <strong>Tax Tip:</strong> Buildings depreciate 4-5% per year; land does not. Separating building value is key for tax planning. Depreciation reduces taxable income but may be recaptured at sale.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <InputField
                  label="Building Value"
                  value={inputs.buildingValue}
                  onChange={(v) => handleInputChange('buildingValue', v)}
                  prefix={symbol}
                  tooltip="Portion of purchase price allocated to building (not land). Typically 60-80% of total."
                />

                <InputField
                  label="Depreciation Rate"
                  value={inputs.buildingDepreciationRate}
                  onChange={(v) => handleInputChange('buildingDepreciationRate', v)}
                  suffix="% /year"
                  tooltip="Annual depreciation rate. Indonesian standard is 4-5% for residential buildings."
                />
              </div>

              {inputs.showDepreciation && (
                <div className="mt-4 p-4 bg-zinc-800 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-400 text-sm">Annual Depreciation:</span>
                    <span className="text-emerald-400 font-bold">
                      {symbol} {formatCurrency((inputs.buildingValue * inputs.buildingDepreciationRate) / 100, inputs.currency)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-zinc-400 text-sm">Total over {inputs.holdingPeriod} years:</span>
                    <span className="text-emerald-400 font-bold">
                      {symbol} {formatCurrency((inputs.buildingValue * inputs.buildingDepreciationRate * inputs.holdingPeriod) / 100, inputs.currency)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-zinc-400 text-sm">Tax Savings (at 22%):</span>
                    <span className="text-emerald-400 font-bold">
                      {symbol} {formatCurrency((inputs.buildingValue * inputs.buildingDepreciationRate * inputs.holdingPeriod * 0.22) / 100, inputs.currency)}
                    </span>
                  </div>
                </div>
              )}
            </AdvancedSection>

            {/* Deductions Section */}
            <AdvancedSection
              title="Deduction Categories"
                            isOpen={inputs.showDeductions}
              onToggle={() => handleInputChange('showDeductions', !inputs.showDeductions)}
              description="Itemize deductible expenses"
            >
              <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <p className="text-xs text-blue-400">
                  <strong>Tax Tip:</strong> Track maintenance, property tax, insurance, and management fees to reduce taxable income. Deductions only apply to PT (company) ownership structure.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-2">
                <InputField
                  label="Annual Utilities"
                  value={inputs.annualUtilities}
                  onChange={(v) => handleInputChange('annualUtilities', v)}
                  prefix={symbol}
                  tooltip="Electricity, water, internet costs"
                />

                <InputField
                  label="Property Management"
                  value={inputs.annualPropertyManagement}
                  onChange={(v) => handleInputChange('annualPropertyManagement', v)}
                  prefix={symbol}
                  tooltip="Property management fees"
                />

                <InputField
                  label="Insurance"
                  value={inputs.annualInsurance}
                  onChange={(v) => handleInputChange('annualInsurance', v)}
                  prefix={symbol}
                  tooltip="Property insurance premiums"
                />

                <InputField
                  label="Other Expenses"
                  value={inputs.annualOtherExpenses}
                  onChange={(v) => handleInputChange('annualOtherExpenses', v)}
                  prefix={symbol}
                  tooltip="Other deductible business expenses"
                />
              </div>

              {inputs.showDeductions && (
                <div className="mt-4 p-4 bg-zinc-800 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-400 text-sm">Total Annual Deductions:</span>
                    <span className="text-blue-400 font-bold">
                      {symbol} {formatCurrency(
                        inputs.annualMaintenanceExpenses + inputs.annualUtilities +
                        inputs.annualPropertyManagement + inputs.annualInsurance + inputs.annualOtherExpenses,
                        inputs.currency
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-zinc-400 text-sm">Total over {inputs.holdingPeriod} years:</span>
                    <span className="text-blue-400 font-bold">
                      {symbol} {formatCurrency(
                        (inputs.annualMaintenanceExpenses + inputs.annualUtilities +
                        inputs.annualPropertyManagement + inputs.annualInsurance + inputs.annualOtherExpenses) * inputs.holdingPeriod,
                        inputs.currency
                      )}
                    </span>
                  </div>
                </div>
              )}
            </AdvancedSection>

            {/* Capital Gains Section */}
            <AdvancedSection
              title="Capital Gains Tax"
                            isOpen={inputs.showCapitalGains}
              onToggle={() => handleInputChange('showCapitalGains', !inputs.showCapitalGains)}
              description="Acquisition and selling costs"
            >
              <div className="mb-4 p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                <p className="text-xs text-purple-400">
                  <strong>Tax Tip:</strong> Indonesian capital gains tax is 20-40% depending on ownership type and duration. Holding property {">"} 5 years may qualify for reduced rates.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <InputField
                  label="Acquisition Costs"
                  value={inputs.acquisitionCosts}
                  onChange={(v) => handleInputChange('acquisitionCosts', v)}
                  prefix={symbol}
                  tooltip="Notary fees, legal fees, BPHTB transfer tax, registration fees"
                />

                <InputField
                  label="Selling Costs"
                  value={inputs.sellingCosts}
                  onChange={(v) => handleInputChange('sellingCosts', v)}
                  prefix={symbol}
                  tooltip="Agent commissions, marketing costs, legal fees at sale"
                />
              </div>

              {inputs.showCapitalGains && (
                <div className="mt-4 p-4 bg-zinc-800 rounded-lg space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-400 text-sm">Adjusted Cost Basis:</span>
                    <span className="text-white font-bold">
                      {symbol} {formatCurrency(inputs.purchasePrice + inputs.acquisitionCosts, inputs.currency)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-400 text-sm">Net Proceeds (after selling costs):</span>
                    <span className="text-white font-bold">
                      {symbol} {formatCurrency(inputs.projectedSalePrice - inputs.sellingCosts, inputs.currency)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-zinc-700">
                    <span className="text-zinc-400 text-sm">Taxable Capital Gain:</span>
                    <span className={`font-bold ${result.capitalGain >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {symbol} {formatCurrency(result.capitalGain, inputs.currency)}
                    </span>
                  </div>
                </div>
              )}
            </AdvancedSection>

            {/* Ownership Impact Section */}
            <AdvancedSection
              title="Ownership Structure Impact"
                            isOpen={inputs.showOwnershipImpact}
              onToggle={() => handleInputChange('showOwnershipImpact', !inputs.showOwnershipImpact)}
              description="Compare tax by ownership type"
            >
              <div className="mb-4 p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
                <p className="text-xs text-cyan-400">
                  <strong>Tax Tip:</strong> PT ownership allows deductions but incurs 22% corporate tax. Individual ownership has 20-30% capital gains tax but no deductions. Leasehold has flat 10% transfer tax.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <InputField
                  label="Corporate Tax Rate (PT)"
                  value={inputs.corporateTaxRate}
                  onChange={(v) => handleInputChange('corporateTaxRate', v)}
                  suffix="%"
                  tooltip="Indonesian corporate income tax rate (currently 22%)"
                />

                <InputField
                  label="Individual Capital Gains Rate"
                  value={inputs.individualCapGainRate}
                  onChange={(v) => handleInputChange('individualCapGainRate', v)}
                  suffix="%"
                  tooltip="Capital gains tax rate for individual ownership (typically 20-30%)"
                />
              </div>

              {inputs.showOwnershipImpact && (
                <OwnershipComparison
                  result={result}
                  symbol={symbol}
                  currency={inputs.currency}
                  currentStructure={inputs.ownershipStructure}
                />
              )}
            </AdvancedSection>

            {/* Reinvestment Section */}
            <AdvancedSection
              title="Reinvestment Strategy"
                            isOpen={inputs.showReinvestment}
              onToggle={() => handleInputChange('showReinvestment', !inputs.showReinvestment)}
              description="Tax-deferred reinvestment scenarios"
            >
              <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                <p className="text-xs text-emerald-400">
                  <strong>Tax Tip:</strong> Reinvesting proceeds into qualifying properties may allow tax deferral. Consult a tax advisor for specific reinvestment rules in Indonesia.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <InputField
                  label="Reinvestment Amount"
                  value={inputs.reinvestmentAmount}
                  onChange={(v) => handleInputChange('reinvestmentAmount', v)}
                  prefix={symbol}
                  tooltip="Amount to reinvest from sale proceeds"
                />

                <InputField
                  label="Expected Yield"
                  value={inputs.reinvestmentYield}
                  onChange={(v) => handleInputChange('reinvestmentYield', v)}
                  suffix="%"
                  tooltip="Expected annual return on reinvestment"
                />
              </div>

              {inputs.showReinvestment && inputs.reinvestmentAmount > 0 && (
                <div className="mt-4 p-4 bg-zinc-800 rounded-lg space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-400 text-sm">Reinvestment Growth ({inputs.holdingPeriod} yrs at {inputs.reinvestmentYield}%):</span>
                    <span className="text-emerald-400 font-bold">
                      {symbol} {formatCurrency(result.reinvestmentValue || 0, inputs.currency)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-400 text-sm">Potential Tax Deferred:</span>
                    <span className="text-emerald-400 font-bold">
                      {symbol} {formatCurrency(result.reinvestmentTaxDeferred || 0, inputs.currency)}
                    </span>
                  </div>
                </div>
              )}
            </AdvancedSection>

            {/* Year-by-Year Projection Table */}
            <TaxProjectionTable
              projections={result.yearlyProjections}
              symbol={symbol}
              currency={inputs.currency}
            />
          </div>

          {/* Results Section */}
          <div className="lg:col-span-3">
            <div className="sticky top-24 space-y-4">
              <TaxResults
                result={result}
                inputs={inputs}
                symbol={symbol}
              />

              {/* Comparison Buttons */}
              <ComparisonButtons
                calculatorType="indonesia-tax"
                getComparisonData={() => {
                  const rating = result.effectiveTaxRate <= 15
                    ? { grade: 'A+', label: 'Tax Optimized' }
                    : result.effectiveTaxRate <= 20
                    ? { grade: 'A', label: 'Well Planned' }
                    : result.effectiveTaxRate <= 25
                    ? { grade: 'B+', label: 'Average' }
                    : result.effectiveTaxRate <= 30
                    ? { grade: 'B', label: 'High Tax' }
                    : { grade: 'C', label: 'Very High' };

                  return {
                    calculatorType: 'indonesia-tax' as const,
                    label: 'Tax Analysis',
                    currency: inputs.currency,
                    purchasePrice: inputs.purchasePrice,
                    projectedSalePrice: inputs.projectedSalePrice,
                    ownershipStructure: inputs.ownershipStructure,
                    totalTaxLiability: result.totalTaxLiability,
                    effectiveTaxRate: result.effectiveTaxRate,
                    netProfit: result.netProfit,
                    optimalStructure: result.optimalStructure,
                    investmentRating: rating,
                  } as Omit<IndonesiaTaxComparisonData, 'timestamp'>;
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Input Field Component
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
          className={`w-full bg-zinc-800 border border-zinc-700 rounded-2xl py-4 text-[16px] font-bold text-white placeholder:text-zinc-500 outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all tabular-nums ${prefix ? 'pl-12 pr-6' : suffix ? 'pl-6 pr-16' : 'px-6'}`}
        />
        {suffix && (
          <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[13px] font-bold text-zinc-500">{suffix}</span>
        )}
      </div>
    </div>
  );
}

export default IndonesiaTaxOptimizer;
