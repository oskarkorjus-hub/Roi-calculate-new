import { useState, useCallback, useMemo, useEffect } from 'react';
import { Toast } from '../../components/ui/Toast';
import { CalculatorToolbar } from '../../components/ui/CalculatorToolbar';
import { ReportPreviewModal } from '../../components/ui/ReportPreviewModal';
import { DraftSelector } from '../../components/ui/DraftSelector';
import { generateRentalProjectionReport } from '../../hooks/useReportGenerator';
import { formatCurrency, parseDecimalInput } from '../../utils/numberParsing';
import { AdvancedSection } from '../../components/AdvancedSection';
import { Tooltip } from '../../components/ui/Tooltip';
import { SeasonalityChart } from './components/SeasonalityChart';
import { OccupancyHeatmap } from './components/OccupancyHeatmap';
import { CashFlowChart } from './components/CashFlowChart';
import { ProjectionResults } from './components/ProjectionResults';
import { useArchivedDrafts, type ArchivedDraft } from '../../hooks/useArchivedDrafts';
import { useAuth } from '../../lib/auth-context';

type CurrencyType = 'IDR' | 'USD' | 'AUD' | 'EUR' | 'GBP';
type LocationType = 'ubud' | 'seminyak' | 'canggu' | 'other-bali' | 'international';

interface SeasonalMultiplier {
  month: string;
  rateMultiplier: number;
  occupancyMultiplier: number;
}

interface RentalInputs {
  // Basic inputs
  propertySize: number;
  nightlyRate: number;
  monthlyExpenses: number;
  projectionYears: number;
  location: LocationType;
  currency: CurrencyType;

  // Seasonality
  showSeasonality: boolean;
  peakSeasonMultiplier: number;
  shoulderSeasonMultiplier: number;
  lowSeasonMultiplier: number;

  // Occupancy Management
  showOccupancy: boolean;
  baseOccupancyRate: number;
  turnoverDays: number;
  cleaningCostPerGuest: number;
  cancellationRate: number;
  averageStayLength: number;

  // Dynamic Pricing
  showDynamicPricing: boolean;
  priceElasticity: number; // How much occupancy drops per % rate increase
  optimalRateMultiplier: number;

  // Expenses
  showExpenses: boolean;
  propertyTax: number;
  insurance: number;
  managerSalary: number;
  utilitiesPerMonth: number;
  maintenancePerGuest: number;
  platformFeePercent: number;
  annualGrowthRate: number;
}

export interface MonthlyProjection {
  month: string;
  monthIndex: number;
  nightlyRate: number;
  occupancyRate: number;
  occupiedNights: number;
  grossRevenue: number;
  platformFees: number;
  cleaningCosts: number;
  maintenanceCosts: number;
  fixedExpenses: number;
  totalExpenses: number;
  netIncome: number;
  seasonType: 'peak' | 'shoulder' | 'low';
}

export interface YearlyProjection {
  year: number;
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
  occupancyRate: number;
  averageNightlyRate: number;
  totalGuests: number;
  cumulativeCashFlow: number;
}

export interface ProjectionResult {
  monthlyProjections: MonthlyProjection[];
  yearlyProjections: YearlyProjection[];
  annualRevenue: number;
  annualExpenses: number;
  annualNetIncome: number;
  averageOccupancy: number;
  averageNightlyRate: number;
  breakEvenMonths: number;
  peakSeasonRevenue: number;
  lowSeasonRevenue: number;
  optimalRate: number;
  optimalRateRevenue: number;
  revenueAtCurrentRate: number;
  totalProjectedCashFlow: number;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Bali-specific seasonality defaults
const LOCATION_SEASONALITY: Record<LocationType, SeasonalMultiplier[]> = {
  'ubud': [
    { month: 'Jan', rateMultiplier: 1.2, occupancyMultiplier: 1.1 },
    { month: 'Feb', rateMultiplier: 0.9, occupancyMultiplier: 0.85 },
    { month: 'Mar', rateMultiplier: 0.9, occupancyMultiplier: 0.85 },
    { month: 'Apr', rateMultiplier: 1.1, occupancyMultiplier: 1.0 },
    { month: 'May', rateMultiplier: 1.1, occupancyMultiplier: 1.0 },
    { month: 'Jun', rateMultiplier: 1.2, occupancyMultiplier: 1.1 },
    { month: 'Jul', rateMultiplier: 1.4, occupancyMultiplier: 1.2 }, // Wedding season peak
    { month: 'Aug', rateMultiplier: 1.4, occupancyMultiplier: 1.2 },
    { month: 'Sep', rateMultiplier: 1.3, occupancyMultiplier: 1.15 },
    { month: 'Oct', rateMultiplier: 1.1, occupancyMultiplier: 1.0 },
    { month: 'Nov', rateMultiplier: 1.0, occupancyMultiplier: 0.95 },
    { month: 'Dec', rateMultiplier: 1.3, occupancyMultiplier: 1.1 },
  ],
  'seminyak': [
    { month: 'Jan', rateMultiplier: 1.3, occupancyMultiplier: 1.15 },
    { month: 'Feb', rateMultiplier: 1.0, occupancyMultiplier: 0.9 },
    { month: 'Mar', rateMultiplier: 0.9, occupancyMultiplier: 0.85 },
    { month: 'Apr', rateMultiplier: 1.1, occupancyMultiplier: 1.0 },
    { month: 'May', rateMultiplier: 1.0, occupancyMultiplier: 0.95 },
    { month: 'Jun', rateMultiplier: 1.1, occupancyMultiplier: 1.05 },
    { month: 'Jul', rateMultiplier: 1.3, occupancyMultiplier: 1.15 },
    { month: 'Aug', rateMultiplier: 1.4, occupancyMultiplier: 1.2 },
    { month: 'Sep', rateMultiplier: 1.1, occupancyMultiplier: 1.0 },
    { month: 'Oct', rateMultiplier: 1.0, occupancyMultiplier: 0.95 },
    { month: 'Nov', rateMultiplier: 1.0, occupancyMultiplier: 0.9 },
    { month: 'Dec', rateMultiplier: 1.5, occupancyMultiplier: 1.25 }, // Holiday peak
  ],
  'canggu': [
    { month: 'Jan', rateMultiplier: 1.2, occupancyMultiplier: 1.1 },
    { month: 'Feb', rateMultiplier: 0.95, occupancyMultiplier: 0.9 },
    { month: 'Mar', rateMultiplier: 0.9, occupancyMultiplier: 0.85 },
    { month: 'Apr', rateMultiplier: 1.1, occupancyMultiplier: 1.0 },
    { month: 'May', rateMultiplier: 1.15, occupancyMultiplier: 1.05 },
    { month: 'Jun', rateMultiplier: 1.25, occupancyMultiplier: 1.1 },
    { month: 'Jul', rateMultiplier: 1.35, occupancyMultiplier: 1.18 },
    { month: 'Aug', rateMultiplier: 1.4, occupancyMultiplier: 1.2 },
    { month: 'Sep', rateMultiplier: 1.2, occupancyMultiplier: 1.05 },
    { month: 'Oct', rateMultiplier: 1.1, occupancyMultiplier: 1.0 },
    { month: 'Nov', rateMultiplier: 1.0, occupancyMultiplier: 0.92 },
    { month: 'Dec', rateMultiplier: 1.35, occupancyMultiplier: 1.15 },
  ],
  'other-bali': [
    { month: 'Jan', rateMultiplier: 1.15, occupancyMultiplier: 1.05 },
    { month: 'Feb', rateMultiplier: 0.9, occupancyMultiplier: 0.85 },
    { month: 'Mar', rateMultiplier: 0.85, occupancyMultiplier: 0.8 },
    { month: 'Apr', rateMultiplier: 1.0, occupancyMultiplier: 0.95 },
    { month: 'May', rateMultiplier: 1.05, occupancyMultiplier: 1.0 },
    { month: 'Jun', rateMultiplier: 1.15, occupancyMultiplier: 1.05 },
    { month: 'Jul', rateMultiplier: 1.3, occupancyMultiplier: 1.15 },
    { month: 'Aug', rateMultiplier: 1.35, occupancyMultiplier: 1.2 },
    { month: 'Sep', rateMultiplier: 1.15, occupancyMultiplier: 1.05 },
    { month: 'Oct', rateMultiplier: 1.0, occupancyMultiplier: 0.95 },
    { month: 'Nov', rateMultiplier: 0.95, occupancyMultiplier: 0.9 },
    { month: 'Dec', rateMultiplier: 1.25, occupancyMultiplier: 1.1 },
  ],
  'international': [
    { month: 'Jan', rateMultiplier: 1.0, occupancyMultiplier: 1.0 },
    { month: 'Feb', rateMultiplier: 1.0, occupancyMultiplier: 1.0 },
    { month: 'Mar', rateMultiplier: 1.0, occupancyMultiplier: 1.0 },
    { month: 'Apr', rateMultiplier: 1.0, occupancyMultiplier: 1.0 },
    { month: 'May', rateMultiplier: 1.0, occupancyMultiplier: 1.0 },
    { month: 'Jun', rateMultiplier: 1.0, occupancyMultiplier: 1.0 },
    { month: 'Jul', rateMultiplier: 1.0, occupancyMultiplier: 1.0 },
    { month: 'Aug', rateMultiplier: 1.0, occupancyMultiplier: 1.0 },
    { month: 'Sep', rateMultiplier: 1.0, occupancyMultiplier: 1.0 },
    { month: 'Oct', rateMultiplier: 1.0, occupancyMultiplier: 1.0 },
    { month: 'Nov', rateMultiplier: 1.0, occupancyMultiplier: 1.0 },
    { month: 'Dec', rateMultiplier: 1.0, occupancyMultiplier: 1.0 },
  ],
};

const INITIAL_INPUTS: RentalInputs = {
  propertySize: 0,
  nightlyRate: 0,
  monthlyExpenses: 0,
  projectionYears: 0,
  location: 'canggu',
  currency: 'IDR',

  showSeasonality: false,
  peakSeasonMultiplier: 0,
  shoulderSeasonMultiplier: 0,
  lowSeasonMultiplier: 0,

  showOccupancy: false,
  baseOccupancyRate: 0,
  turnoverDays: 0,
  cleaningCostPerGuest: 0,
  cancellationRate: 0,
  averageStayLength: 0,

  showDynamicPricing: false,
  priceElasticity: 0,
  optimalRateMultiplier: 0,

  showExpenses: false,
  propertyTax: 0,
  insurance: 0,
  managerSalary: 0,
  utilitiesPerMonth: 0,
  maintenancePerGuest: 0,
  platformFeePercent: 0,
  annualGrowthRate: 0,
};

const symbols: Record<CurrencyType, string> = {
  IDR: 'Rp',
  USD: '$',
  AUD: 'A$',
  EUR: '€',
  GBP: '£',
};

const locationLabels: Record<LocationType, string> = {
  'ubud': 'Ubud',
  'seminyak': 'Seminyak',
  'canggu': 'Canggu',
  'other-bali': 'Other Bali',
  'international': 'International',
};

export function RentalIncomeProjection() {
  const [inputs, setInputs] = useState<RentalInputs>(INITIAL_INPUTS);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [currentDraftName, setCurrentDraftName] = useState<string | undefined>();

  const { user } = useAuth();
  const { drafts, saveDraft: saveArchivedDraft, deleteDraft } = useArchivedDrafts<RentalInputs>('rental-projection', user?.id);

  const handleSelectDraft = useCallback((draft: ArchivedDraft<RentalInputs>) => {
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

  const calculateProjections = useCallback((): ProjectionResult => {
    const {
      nightlyRate,
      projectionYears,
      location,
      baseOccupancyRate,
      turnoverDays,
      cleaningCostPerGuest,
      cancellationRate,
      averageStayLength,
      priceElasticity,
      propertyTax,
      insurance,
      managerSalary,
      utilitiesPerMonth,
      maintenancePerGuest,
      platformFeePercent,
      annualGrowthRate,
      showSeasonality,
      showOccupancy,
      showExpenses,
    } = inputs;

    const seasonality = LOCATION_SEASONALITY[location];
    const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

    // Calculate monthly projections for year 1
    const monthlyProjections: MonthlyProjection[] = MONTHS.map((month, index) => {
      const seasonData = seasonality[index];

      // Apply seasonality to rate
      const seasonalRate = showSeasonality
        ? nightlyRate * seasonData.rateMultiplier
        : nightlyRate;

      // Calculate occupancy
      let effectiveOccupancy = baseOccupancyRate;
      if (showSeasonality) {
        effectiveOccupancy = baseOccupancyRate * seasonData.occupancyMultiplier;
      }
      if (showOccupancy) {
        // Apply cancellation rate
        effectiveOccupancy *= (1 - cancellationRate / 100);
        // Apply turnover impact
        const potentialNights = daysInMonth[index];
        const guestsPerMonth = potentialNights / (averageStayLength + turnoverDays);
        const lostToTurnover = guestsPerMonth * turnoverDays;
        const turnoverImpact = lostToTurnover / potentialNights;
        effectiveOccupancy *= (1 - turnoverImpact);
      }
      effectiveOccupancy = Math.min(100, Math.max(0, effectiveOccupancy));

      // Calculate nights and guests
      const totalNights = daysInMonth[index];
      const occupiedNights = Math.round((totalNights * effectiveOccupancy) / 100);
      const numberOfGuests = Math.ceil(occupiedNights / averageStayLength);

      // Calculate revenue
      const grossRevenue = occupiedNights * seasonalRate;
      const platformFees = (grossRevenue * platformFeePercent) / 100;

      // Calculate expenses
      const cleaningCosts = numberOfGuests * cleaningCostPerGuest;
      const maintenanceCosts = numberOfGuests * maintenancePerGuest;
      const fixedExpenses = showExpenses
        ? (propertyTax / 12) + (insurance / 12) + managerSalary + utilitiesPerMonth
        : inputs.monthlyExpenses;
      const totalExpenses = platformFees + cleaningCosts + maintenanceCosts + fixedExpenses;

      // Determine season type
      let seasonType: 'peak' | 'shoulder' | 'low' = 'shoulder';
      if (seasonData.rateMultiplier >= 1.3) seasonType = 'peak';
      else if (seasonData.rateMultiplier <= 0.95) seasonType = 'low';

      return {
        month,
        monthIndex: index,
        nightlyRate: seasonalRate,
        occupancyRate: effectiveOccupancy,
        occupiedNights,
        grossRevenue,
        platformFees,
        cleaningCosts,
        maintenanceCosts,
        fixedExpenses,
        totalExpenses,
        netIncome: grossRevenue - totalExpenses,
        seasonType,
      };
    });

    // Calculate yearly projections
    const yearlyProjections: YearlyProjection[] = [];
    let cumulativeCashFlow = 0;

    for (let year = 1; year <= projectionYears; year++) {
      const growthFactor = Math.pow(1 + annualGrowthRate / 100, year - 1);

      const yearRevenue = monthlyProjections.reduce((sum, m) => sum + m.grossRevenue, 0) * growthFactor;
      const yearExpenses = monthlyProjections.reduce((sum, m) => sum + m.totalExpenses, 0) * growthFactor;
      const netIncome = yearRevenue - yearExpenses;
      cumulativeCashFlow += netIncome;

      const avgOccupancy = monthlyProjections.reduce((sum, m) => sum + m.occupancyRate, 0) / 12;
      const avgRate = monthlyProjections.reduce((sum, m) => sum + m.nightlyRate, 0) / 12 * growthFactor;
      const totalGuests = monthlyProjections.reduce((sum, m) => sum + Math.ceil(m.occupiedNights / averageStayLength), 0);

      yearlyProjections.push({
        year,
        totalRevenue: yearRevenue,
        totalExpenses: yearExpenses,
        netIncome,
        occupancyRate: avgOccupancy,
        averageNightlyRate: avgRate,
        totalGuests,
        cumulativeCashFlow,
      });
    }

    // Calculate summary metrics
    const annualRevenue = monthlyProjections.reduce((sum, m) => sum + m.grossRevenue, 0);
    const annualExpenses = monthlyProjections.reduce((sum, m) => sum + m.totalExpenses, 0);
    const annualNetIncome = annualRevenue - annualExpenses;
    const averageOccupancy = monthlyProjections.reduce((sum, m) => sum + m.occupancyRate, 0) / 12;
    const averageNightlyRate = monthlyProjections.reduce((sum, m) => sum + m.nightlyRate, 0) / 12;

    // Calculate break-even
    const monthlyNet = annualNetIncome / 12;
    const breakEvenMonths = monthlyNet > 0 ? Math.ceil(inputs.propertySize * nightlyRate * 100 / monthlyNet) : 999;

    // Peak vs low season revenue
    const peakSeasonRevenue = monthlyProjections
      .filter(m => m.seasonType === 'peak')
      .reduce((sum, m) => sum + m.grossRevenue, 0);
    const lowSeasonRevenue = monthlyProjections
      .filter(m => m.seasonType === 'low')
      .reduce((sum, m) => sum + m.grossRevenue, 0);

    // Optimal pricing calculation
    // If we increase rate by X%, occupancy drops by X * elasticity %
    // Revenue = Rate * Occupancy
    // Find the multiplier that maximizes revenue
    let optimalRate = nightlyRate;
    let optimalRateRevenue = annualRevenue;
    for (let mult = 0.8; mult <= 1.5; mult += 0.05) {
      const testRate = nightlyRate * mult;
      const rateIncrease = (mult - 1) * 100;
      const occupancyDrop = rateIncrease * priceElasticity;
      const testOccupancy = Math.max(20, averageOccupancy - occupancyDrop);
      const testRevenue = testRate * (testOccupancy / 100) * 365;
      if (testRevenue > optimalRateRevenue) {
        optimalRate = testRate;
        optimalRateRevenue = testRevenue;
      }
    }

    const revenueAtCurrentRate = nightlyRate * (averageOccupancy / 100) * 365;
    const totalProjectedCashFlow = yearlyProjections[yearlyProjections.length - 1]?.cumulativeCashFlow || 0;

    return {
      monthlyProjections,
      yearlyProjections,
      annualRevenue,
      annualExpenses,
      annualNetIncome,
      averageOccupancy,
      averageNightlyRate,
      breakEvenMonths,
      peakSeasonRevenue,
      lowSeasonRevenue,
      optimalRate,
      optimalRateRevenue,
      revenueAtCurrentRate,
      totalProjectedCashFlow,
    };
  }, [inputs]);

  const result = calculateProjections();
  const symbol = symbols[inputs.currency] || 'Rp';

  // Generate report data for PDF export
  const reportData = useMemo(() => {
    return generateRentalProjectionReport(inputs, result, symbol);
  }, [inputs, result, symbol]);

  const handleInputChange = (field: keyof RentalInputs, value: string | number | boolean) => {
    setInputs(prev => ({
      ...prev,
      [field]: typeof value === 'string' && field !== 'location' && field !== 'currency'
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
        <header className="mb-6 sm:mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center shadow-lg shadow-purple-900/30">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Rental Income Projection</h1>
              <p className="text-zinc-500 text-sm mt-1">
                Advanced vacation rental projections with seasonality, occupancy curves, and dynamic pricing
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
              calculatorType="rental-projection"
              projectData={{ ...inputs, result }}
              projectName="Rental Income Projection"
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
                  <span className="material-symbols-outlined text-purple-400">home</span>
                  <h2 className="text-xl font-bold text-white">Property & Revenue Basics</h2>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <InputField
                  label="Property Size"
                  value={inputs.propertySize}
                  onChange={(v) => handleInputChange('propertySize', v)}
                  suffix="m²"
                  tooltip="Total property area in square meters"
                />

                <InputField
                  label="Base Nightly Rate"
                  value={inputs.nightlyRate}
                  onChange={(v) => handleInputChange('nightlyRate', v)}
                  prefix={symbol}
                  tooltip="Standard nightly rate before seasonal adjustments"
                />

                <InputField
                  label="Monthly Operating Expenses"
                  value={inputs.monthlyExpenses}
                  onChange={(v) => handleInputChange('monthlyExpenses', v)}
                  prefix={symbol}
                  tooltip="Fixed monthly expenses (if not using detailed breakdown)"
                />

                <div className="space-y-3">
                  <label className="flex items-center gap-1.5 text-sm font-medium text-zinc-400">
                    Location
                    <Tooltip text="Location affects seasonal patterns. Ubud peaks Jul-Sept (weddings); Seminyak peaks Dec-Feb (holidays)." />
                  </label>
                  <select
                    value={inputs.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl py-4 px-6 text-[16px] font-bold text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                  >
                    <option value="ubud">Ubud</option>
                    <option value="seminyak">Seminyak</option>
                    <option value="canggu">Canggu</option>
                    <option value="other-bali">Other Bali</option>
                    <option value="international">International</option>
                  </select>
                </div>

                <InputField
                  label="Projection Period"
                  value={inputs.projectionYears}
                  onChange={(v) => handleInputChange('projectionYears', v)}
                  suffix="years"
                  tooltip="Number of years to project cash flows"
                />

                <InputField
                  label="Annual Growth Rate"
                  value={inputs.annualGrowthRate}
                  onChange={(v) => handleInputChange('annualGrowthRate', v)}
                  suffix="%"
                  tooltip="Expected annual increase in rates and revenue"
                />
              </div>
            </div>

            {/* Seasonality Section */}
            <AdvancedSection
              title="Seasonality Profile"
                            isOpen={inputs.showSeasonality}
              onToggle={() => handleInputChange('showSeasonality', !inputs.showSeasonality)}
              description="Peak, shoulder, and low season adjustments"
            >
              <div className="mb-4 p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                <p className="text-xs text-purple-400">
                  <strong>Bali Tip:</strong> Ubud peaks Jul-Sept (wedding season). Seminyak peaks Dec-Feb (holiday season). Canggu is steady year-round with digital nomads.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                <InputField
                  label="Peak Season Multiplier"
                  value={inputs.peakSeasonMultiplier}
                  onChange={(v) => handleInputChange('peakSeasonMultiplier', v)}
                  suffix="x"
                  tooltip="Rate multiplier for peak months (Jul-Aug, Dec-Jan). 1.4x = 40% higher rates."
                />

                <InputField
                  label="Shoulder Season Multiplier"
                  value={inputs.shoulderSeasonMultiplier}
                  onChange={(v) => handleInputChange('shoulderSeasonMultiplier', v)}
                  suffix="x"
                  tooltip="Rate multiplier for shoulder months (Apr-Jun, Sep-Nov). 1.1-1.2x typical."
                />

                <InputField
                  label="Low Season Multiplier"
                  value={inputs.lowSeasonMultiplier}
                  onChange={(v) => handleInputChange('lowSeasonMultiplier', v)}
                  suffix="x"
                  tooltip="Rate multiplier for low season (Feb-Mar). 0.8-0.9x typical."
                />
              </div>

              {inputs.showSeasonality && (
                <SeasonalityChart
                  monthlyProjections={result.monthlyProjections}
                  symbol={symbol}
                  currency={inputs.currency}
                />
              )}
            </AdvancedSection>

            {/* Occupancy Management */}
            <AdvancedSection
              title="Occupancy Management"
                            isOpen={inputs.showOccupancy}
              onToggle={() => handleInputChange('showOccupancy', !inputs.showOccupancy)}
              description="Vacancy, turnover, and cancellations"
            >
              <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <p className="text-xs text-blue-400">
                  <strong>Industry Benchmarks:</strong> Typical STR occupancy in Bali: 60-75%. High performers: 75-85%. 10-15% cancellation rate is normal.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 pt-2">
                <InputField
                  label="Base Occupancy Rate"
                  value={inputs.baseOccupancyRate}
                  onChange={(v) => handleInputChange('baseOccupancyRate', v)}
                  suffix="%"
                  tooltip="Expected occupancy before seasonal adjustments (60-80% typical)"
                />

                <InputField
                  label="Avg Stay Length"
                  value={inputs.averageStayLength}
                  onChange={(v) => handleInputChange('averageStayLength', v)}
                  suffix="nights"
                  tooltip="Average guest booking length (3-5 nights typical for Bali)"
                />

                <InputField
                  label="Turnover Days"
                  value={inputs.turnoverDays}
                  onChange={(v) => handleInputChange('turnoverDays', v)}
                  suffix="days"
                  tooltip="Days between guests for cleaning/prep (1-2 days typical)"
                />

                <InputField
                  label="Cleaning Cost"
                  value={inputs.cleaningCostPerGuest}
                  onChange={(v) => handleInputChange('cleaningCostPerGuest', v)}
                  prefix={symbol}
                  tooltip="Cost per guest checkout (cleaning + linen = ~250K IDR)"
                />

                <InputField
                  label="Cancellation Rate"
                  value={inputs.cancellationRate}
                  onChange={(v) => handleInputChange('cancellationRate', v)}
                  suffix="%"
                  tooltip="Expected cancellation rate (10-15% typical; higher in low season)"
                />
              </div>

              {inputs.showOccupancy && (
                <OccupancyHeatmap
                  monthlyProjections={result.monthlyProjections}
                  baseRate={inputs.nightlyRate}
                  baseOccupancy={inputs.baseOccupancyRate}
                  symbol={symbol}
                  currency={inputs.currency}
                />
              )}
            </AdvancedSection>

            {/* Dynamic Pricing */}
            <AdvancedSection
              title="Dynamic Pricing Impact"
                            isOpen={inputs.showDynamicPricing}
              onToggle={() => handleInputChange('showDynamicPricing', !inputs.showDynamicPricing)}
              description="Rate vs occupancy optimization"
            >
              <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                <p className="text-xs text-emerald-400">
                  <strong>Pricing Insight:</strong> For every 10% rate increase, occupancy typically drops 10-20%. Find the sweet spot that maximizes total revenue.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <InputField
                  label="Price Elasticity"
                  value={inputs.priceElasticity}
                  onChange={(v) => handleInputChange('priceElasticity', v)}
                  suffix="%"
                  tooltip="Occupancy drop per 1% rate increase. 1.5 = 1.5% occupancy drop for every 1% rate increase."
                />

                <div className="bg-zinc-800 rounded-xl p-4 border border-zinc-700">
                  <p className="text-xs text-zinc-400 uppercase tracking-wider mb-2">AI Recommendation</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-emerald-400">
                      {symbol} {formatCurrency(result.optimalRate, inputs.currency)}
                    </span>
                    <span className="text-sm text-zinc-500">/night</span>
                  </div>
                  <p className="text-xs text-zinc-500 mt-1">
                    Optimal rate for maximum revenue
                  </p>
                  {result.optimalRate !== inputs.nightlyRate && (
                    <p className="text-xs text-emerald-400 mt-2">
                      +{symbol} {formatCurrency(result.optimalRateRevenue - result.revenueAtCurrentRate, inputs.currency)} potential annual gain
                    </p>
                  )}
                </div>
              </div>
            </AdvancedSection>

            {/* Detailed Expenses */}
            <AdvancedSection
              title="Expense Breakdown"
                            isOpen={inputs.showExpenses}
              onToggle={() => handleInputChange('showExpenses', !inputs.showExpenses)}
              description="Fixed and variable costs"
            >
              <div className="mb-4 p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                <p className="text-xs text-orange-400">
                  <strong>Cost Guide:</strong> Platform fees: 10-18%. Cleaning: 200-300K IDR. Property management: 15-25% of revenue or fixed monthly.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
                <InputField
                  label="Property Tax (Annual)"
                  value={inputs.propertyTax}
                  onChange={(v) => handleInputChange('propertyTax', v)}
                  prefix={symbol}
                  tooltip="Annual property tax (PBB)"
                />

                <InputField
                  label="Insurance (Annual)"
                  value={inputs.insurance}
                  onChange={(v) => handleInputChange('insurance', v)}
                  prefix={symbol}
                  tooltip="Annual property and liability insurance"
                />

                <InputField
                  label="Manager Salary (Monthly)"
                  value={inputs.managerSalary}
                  onChange={(v) => handleInputChange('managerSalary', v)}
                  prefix={symbol}
                  tooltip="Property manager monthly salary"
                />

                <InputField
                  label="Utilities (Monthly)"
                  value={inputs.utilitiesPerMonth}
                  onChange={(v) => handleInputChange('utilitiesPerMonth', v)}
                  prefix={symbol}
                  tooltip="Electricity, water, internet, etc."
                />

                <InputField
                  label="Maintenance/Guest"
                  value={inputs.maintenancePerGuest}
                  onChange={(v) => handleInputChange('maintenancePerGuest', v)}
                  prefix={symbol}
                  tooltip="Variable maintenance cost per guest"
                />

                <InputField
                  label="Platform Fee"
                  value={inputs.platformFeePercent}
                  onChange={(v) => handleInputChange('platformFeePercent', v)}
                  suffix="%"
                  tooltip="Airbnb/Booking.com fees (10-18% typical)"
                />
              </div>
            </AdvancedSection>

            {/* Cash Flow Chart */}
            <CashFlowChart
              yearlyProjections={result.yearlyProjections}
              symbol={symbol}
              currency={inputs.currency}
              projectionYears={inputs.projectionYears}
            />
          </div>

          {/* Results Section */}
          <div className="lg:col-span-3">
            <div className="sticky top-24">
              <ProjectionResults
                result={result}
                inputs={inputs}
                symbol={symbol}
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
          className={`w-full bg-zinc-800 border border-zinc-700 rounded-2xl py-4 text-[16px] font-bold text-white placeholder:text-zinc-500 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all tabular-nums ${prefix ? 'pl-12 pr-6' : suffix ? 'pl-6 pr-16' : 'px-6'}`}
        />
        {suffix && (
          <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[13px] font-bold text-zinc-500">{suffix}</span>
        )}
      </div>
    </div>
  );
}

export default RentalIncomeProjection;
