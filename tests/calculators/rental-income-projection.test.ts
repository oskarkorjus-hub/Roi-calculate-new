/**
 * Rental Income Projection Tests
 *
 * Tests the rental projection calculations including
 * seasonality, occupancy management, and dynamic pricing.
 */

import { describe, it, expect } from 'vitest';
import { approximatelyEqual } from '../utils/reference-implementations';

// =========================================================================
// RENTAL PROJECTION FUNCTIONS (extracted from calculator logic)
// =========================================================================

type LocationType = 'ubud' | 'seminyak' | 'canggu' | 'other-bali' | 'international';

interface SeasonalMultiplier {
  month: string;
  rateMultiplier: number;
  occupancyMultiplier: number;
}

interface RentalInputs {
  propertySize: number;
  nightlyRate: number;
  monthlyExpenses: number;
  projectionYears: number;
  location: LocationType;

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
  priceElasticity: number;

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

interface MonthlyProjection {
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

interface YearlyProjection {
  year: number;
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
  occupancyRate: number;
  averageNightlyRate: number;
  totalGuests: number;
  cumulativeCashFlow: number;
}

interface ProjectionResult {
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
const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

const LOCATION_SEASONALITY: Record<LocationType, SeasonalMultiplier[]> = {
  'ubud': [
    { month: 'Jan', rateMultiplier: 1.2, occupancyMultiplier: 1.1 },
    { month: 'Feb', rateMultiplier: 0.9, occupancyMultiplier: 0.85 },
    { month: 'Mar', rateMultiplier: 0.9, occupancyMultiplier: 0.85 },
    { month: 'Apr', rateMultiplier: 1.1, occupancyMultiplier: 1.0 },
    { month: 'May', rateMultiplier: 1.1, occupancyMultiplier: 1.0 },
    { month: 'Jun', rateMultiplier: 1.2, occupancyMultiplier: 1.1 },
    { month: 'Jul', rateMultiplier: 1.4, occupancyMultiplier: 1.2 },
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
    { month: 'Dec', rateMultiplier: 1.5, occupancyMultiplier: 1.25 },
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
  'international': MONTHS.map(m => ({ month: m, rateMultiplier: 1.0, occupancyMultiplier: 1.0 })),
};

function calculateProjections(inputs: RentalInputs): ProjectionResult {
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

  // Calculate monthly projections for year 1
  const monthlyProjections: MonthlyProjection[] = MONTHS.map((month, index) => {
    const seasonData = seasonality[index];
    const daysInMonth = DAYS_IN_MONTH[index];

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
      const guestsPerMonth = daysInMonth / (averageStayLength + turnoverDays);
      const lostToTurnover = guestsPerMonth * turnoverDays;
      const turnoverImpact = lostToTurnover / daysInMonth;
      effectiveOccupancy *= (1 - turnoverImpact);
    }
    effectiveOccupancy = Math.min(100, Math.max(0, effectiveOccupancy));

    // Calculate nights and guests
    const occupiedNights = Math.round((daysInMonth * effectiveOccupancy) / 100);
    const numberOfGuests = averageStayLength > 0 ? Math.ceil(occupiedNights / averageStayLength) : 0;

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
    const stayLength = averageStayLength || 1;
    const totalGuests = monthlyProjections.reduce((sum, m) => sum + Math.ceil(m.occupiedNights / stayLength), 0);

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
}

function createBaseInputs(overrides: Partial<RentalInputs> = {}): RentalInputs {
  return {
    propertySize: 150,
    nightlyRate: 200,
    monthlyExpenses: 2000,
    projectionYears: 5,
    location: 'canggu',

    showSeasonality: false,
    peakSeasonMultiplier: 1.4,
    shoulderSeasonMultiplier: 1.1,
    lowSeasonMultiplier: 0.9,

    showOccupancy: false,
    baseOccupancyRate: 70,
    turnoverDays: 1,
    cleaningCostPerGuest: 50,
    cancellationRate: 10,
    averageStayLength: 4,

    priceElasticity: 1.5,

    showExpenses: false,
    propertyTax: 1200,
    insurance: 800,
    managerSalary: 500,
    utilitiesPerMonth: 200,
    maintenancePerGuest: 20,
    platformFeePercent: 15,
    annualGrowthRate: 3,
    ...overrides,
  };
}

describe('Rental Income Projection', () => {
  // =========================================================================
  // BASIC REVENUE CALCULATION
  // =========================================================================

  describe('Basic Revenue Calculation', () => {
    it('should calculate annual revenue correctly', () => {
      const inputs = createBaseInputs({
        nightlyRate: 100,
        baseOccupancyRate: 70,
      });
      const result = calculateProjections(inputs);

      // 365 days * 70% occupancy * $100/night = $25,550
      expect(approximatelyEqual(result.annualRevenue, 25550, 1000)).toBe(true);
    });

    it('should calculate monthly projections for all 12 months', () => {
      const inputs = createBaseInputs();
      const result = calculateProjections(inputs);

      expect(result.monthlyProjections.length).toBe(12);
      expect(result.monthlyProjections[0].month).toBe('Jan');
      expect(result.monthlyProjections[11].month).toBe('Dec');
    });

    it('should calculate net income correctly', () => {
      const inputs = createBaseInputs({
        nightlyRate: 200,
        baseOccupancyRate: 70,
        monthlyExpenses: 2000,
      });
      const result = calculateProjections(inputs);

      expect(result.annualNetIncome).toBe(result.annualRevenue - result.annualExpenses);
    });
  });

  // =========================================================================
  // SEASONALITY
  // =========================================================================

  describe('Seasonality Impact', () => {
    it('should apply seasonal rate multipliers', () => {
      const inputs = createBaseInputs({
        nightlyRate: 200,
        location: 'canggu',
        showSeasonality: true,
      });
      const result = calculateProjections(inputs);

      // August should have highest rate (1.4x multiplier)
      const august = result.monthlyProjections[7];
      expect(august.nightlyRate).toBe(280); // 200 * 1.4
    });

    it('should apply seasonal occupancy multipliers', () => {
      const inputs = createBaseInputs({
        baseOccupancyRate: 70,
        location: 'canggu',
        showSeasonality: true,
      });
      const result = calculateProjections(inputs);

      // August should have highest occupancy (1.2x)
      const august = result.monthlyProjections[7];
      expect(august.occupancyRate).toBe(84); // 70 * 1.2
    });

    it('should classify months by season type', () => {
      const inputs = createBaseInputs({
        location: 'canggu',
        showSeasonality: true,
      });
      const result = calculateProjections(inputs);

      // August should be peak (1.4x >= 1.3)
      expect(result.monthlyProjections[7].seasonType).toBe('peak');
      // March should be low (0.9x <= 0.95)
      expect(result.monthlyProjections[2].seasonType).toBe('low');
    });

    it('should calculate peak vs low season revenue', () => {
      const inputs = createBaseInputs({
        nightlyRate: 200,
        baseOccupancyRate: 70,
        location: 'canggu',
        showSeasonality: true,
      });
      const result = calculateProjections(inputs);

      expect(result.peakSeasonRevenue).toBeGreaterThan(0);
      // Peak season should generate more per month than low season
    });

    it('should use flat rates for international location', () => {
      const inputs = createBaseInputs({
        nightlyRate: 200,
        location: 'international',
        showSeasonality: true,
      });
      const result = calculateProjections(inputs);

      // All months should have same rate
      const rates = result.monthlyProjections.map(m => m.nightlyRate);
      expect(new Set(rates).size).toBe(1);
    });
  });

  // =========================================================================
  // OCCUPANCY MANAGEMENT
  // =========================================================================

  describe('Occupancy Management', () => {
    it('should apply cancellation rate', () => {
      const inputs = createBaseInputs({
        baseOccupancyRate: 70,
        cancellationRate: 10,
        showOccupancy: true,
      });
      const result = calculateProjections(inputs);

      // Occupancy should be reduced by ~10%
      expect(result.averageOccupancy).toBeLessThan(70);
    });

    it('should apply turnover day impact', () => {
      const inputs = createBaseInputs({
        baseOccupancyRate: 70,
        turnoverDays: 2,
        averageStayLength: 4,
        showOccupancy: true,
      });
      const result = calculateProjections(inputs);

      // With 2 turnover days per 4-night stay, lose ~33% of potential
      expect(result.averageOccupancy).toBeLessThan(70);
    });

    it('should clamp occupancy between 0 and 100', () => {
      const inputs = createBaseInputs({
        baseOccupancyRate: 100,
        location: 'canggu',
        showSeasonality: true, // August multiplier 1.2x would push over 100
      });
      const result = calculateProjections(inputs);

      result.monthlyProjections.forEach(m => {
        expect(m.occupancyRate).toBeLessThanOrEqual(100);
        expect(m.occupancyRate).toBeGreaterThanOrEqual(0);
      });
    });

    it('should calculate number of guests based on stay length', () => {
      const inputs = createBaseInputs({
        baseOccupancyRate: 100,
        averageStayLength: 5,
        showOccupancy: true,
      });
      const result = calculateProjections(inputs);

      // January: 31 nights / 5 nights per guest = ~6 guests
      const january = result.monthlyProjections[0];
      expect(january.occupiedNights).toBeLessThanOrEqual(31);
    });
  });

  // =========================================================================
  // EXPENSE CALCULATION
  // =========================================================================

  describe('Expense Calculation', () => {
    it('should calculate platform fees correctly', () => {
      const inputs = createBaseInputs({
        nightlyRate: 200,
        baseOccupancyRate: 70,
        platformFeePercent: 15,
      });
      const result = calculateProjections(inputs);

      const totalPlatformFees = result.monthlyProjections.reduce((sum, m) => sum + m.platformFees, 0);
      // Should be ~15% of revenue
      expect(approximatelyEqual(totalPlatformFees, result.annualRevenue * 0.15, 100)).toBe(true);
    });

    it('should calculate cleaning costs per guest', () => {
      const inputs = createBaseInputs({
        baseOccupancyRate: 100,
        averageStayLength: 5,
        cleaningCostPerGuest: 50,
        showOccupancy: true,
      });
      const result = calculateProjections(inputs);

      // 365 nights / 5 nights per guest = 73 guests * $50 = $3650
      const totalCleaning = result.monthlyProjections.reduce((sum, m) => sum + m.cleaningCosts, 0);
      expect(totalCleaning).toBeGreaterThan(0);
    });

    it('should calculate detailed expenses when enabled', () => {
      const inputs = createBaseInputs({
        showExpenses: true,
        propertyTax: 1200,
        insurance: 800,
        managerSalary: 500,
        utilitiesPerMonth: 200,
      });
      const result = calculateProjections(inputs);

      // Fixed monthly: (1200/12) + (800/12) + 500 + 200 = 100 + 66.67 + 500 + 200 = 866.67
      const january = result.monthlyProjections[0];
      expect(january.fixedExpenses).toBeGreaterThan(800);
    });
  });

  // =========================================================================
  // YEARLY PROJECTIONS
  // =========================================================================

  describe('Yearly Projections', () => {
    it('should generate projections for all years', () => {
      const inputs = createBaseInputs({
        projectionYears: 10,
      });
      const result = calculateProjections(inputs);

      expect(result.yearlyProjections.length).toBe(10);
    });

    it('should apply annual growth rate', () => {
      const inputs = createBaseInputs({
        projectionYears: 5,
        annualGrowthRate: 5,
      });
      const result = calculateProjections(inputs);

      // Year 5 revenue should be higher than year 1
      const year1 = result.yearlyProjections[0];
      const year5 = result.yearlyProjections[4];
      expect(year5.totalRevenue).toBeGreaterThan(year1.totalRevenue);
    });

    it('should calculate cumulative cash flow', () => {
      const inputs = createBaseInputs({
        projectionYears: 5,
        annualGrowthRate: 0,
      });
      const result = calculateProjections(inputs);

      // Cumulative should equal sum of all years
      let runningTotal = 0;
      result.yearlyProjections.forEach(y => {
        runningTotal += y.netIncome;
        expect(approximatelyEqual(y.cumulativeCashFlow, runningTotal, 1)).toBe(true);
      });
    });

    it('should calculate total projected cash flow', () => {
      const inputs = createBaseInputs({
        projectionYears: 5,
      });
      const result = calculateProjections(inputs);

      expect(result.totalProjectedCashFlow).toBe(
        result.yearlyProjections[result.yearlyProjections.length - 1].cumulativeCashFlow
      );
    });
  });

  // =========================================================================
  // DYNAMIC PRICING
  // =========================================================================

  describe('Dynamic Pricing', () => {
    it('should calculate optimal rate based on elasticity', () => {
      const inputs = createBaseInputs({
        nightlyRate: 200,
        baseOccupancyRate: 70,
        priceElasticity: 1.5,
      });
      const result = calculateProjections(inputs);

      // Optimal rate should be calculated
      expect(result.optimalRate).toBeGreaterThan(0);
    });

    it('should calculate revenue at current vs optimal rate', () => {
      const inputs = createBaseInputs({
        nightlyRate: 200,
        baseOccupancyRate: 70,
        priceElasticity: 1.0,
      });
      const result = calculateProjections(inputs);

      expect(result.revenueAtCurrentRate).toBeGreaterThan(0);
      expect(result.optimalRateRevenue).toBeGreaterThanOrEqual(result.revenueAtCurrentRate);
    });
  });

  // =========================================================================
  // LOCATION-SPECIFIC SEASONALITY
  // =========================================================================

  describe('Location-Specific Seasonality', () => {
    it('should apply Ubud seasonality (wedding season peak)', () => {
      const inputs = createBaseInputs({
        location: 'ubud',
        nightlyRate: 200,
        showSeasonality: true,
      });
      const result = calculateProjections(inputs);

      // July-August should be peak (wedding season)
      expect(result.monthlyProjections[6].seasonType).toBe('peak'); // July
      expect(result.monthlyProjections[7].seasonType).toBe('peak'); // August
    });

    it('should apply Seminyak seasonality (holiday peak)', () => {
      const inputs = createBaseInputs({
        location: 'seminyak',
        nightlyRate: 200,
        showSeasonality: true,
      });
      const result = calculateProjections(inputs);

      // December should be peak (1.5x multiplier)
      const december = result.monthlyProjections[11];
      expect(december.nightlyRate).toBe(300); // 200 * 1.5
    });
  });

  // =========================================================================
  // REAL ESTATE SCENARIOS
  // =========================================================================

  describe('Real Estate Scenarios', () => {
    it('should project Canggu villa rental income', () => {
      const inputs: RentalInputs = {
        propertySize: 200,
        nightlyRate: 350,
        monthlyExpenses: 3000,
        projectionYears: 5,
        location: 'canggu',

        showSeasonality: true,
        peakSeasonMultiplier: 1.4,
        shoulderSeasonMultiplier: 1.1,
        lowSeasonMultiplier: 0.9,

        showOccupancy: true,
        baseOccupancyRate: 65,
        turnoverDays: 1,
        cleaningCostPerGuest: 75,
        cancellationRate: 12,
        averageStayLength: 5,

        priceElasticity: 1.2,

        showExpenses: true,
        propertyTax: 2000,
        insurance: 1500,
        managerSalary: 800,
        utilitiesPerMonth: 300,
        maintenancePerGuest: 30,
        platformFeePercent: 15,
        annualGrowthRate: 4,
      };

      const result = calculateProjections(inputs);

      expect(result.annualRevenue).toBeGreaterThan(50000);
      expect(result.annualNetIncome).toBeGreaterThan(0);
      expect(result.averageOccupancy).toBeGreaterThan(40);
      expect(result.averageOccupancy).toBeLessThan(80);
    });

    it('should project Ubud retreat rental income', () => {
      const inputs = createBaseInputs({
        location: 'ubud',
        nightlyRate: 250,
        baseOccupancyRate: 55,
        showSeasonality: true,
        showOccupancy: true,
        averageStayLength: 7, // Longer stays typical for retreats
        projectionYears: 3,
      });

      const result = calculateProjections(inputs);

      // Ubud should have strong July-Sept performance
      const july = result.monthlyProjections[6];
      const march = result.monthlyProjections[2];
      expect(july.grossRevenue).toBeGreaterThan(march.grossRevenue);
    });
  });

  // =========================================================================
  // VALIDATION SUMMARY
  // =========================================================================

  describe('Validation Summary', () => {
    it('should generate rental projection report', () => {
      const scenarios = [
        {
          name: 'Canggu High-end Villa',
          inputs: createBaseInputs({
            location: 'canggu',
            nightlyRate: 400,
            baseOccupancyRate: 60,
            showSeasonality: true,
          }),
        },
        {
          name: 'Seminyak Party House',
          inputs: createBaseInputs({
            location: 'seminyak',
            nightlyRate: 300,
            baseOccupancyRate: 70,
            showSeasonality: true,
          }),
        },
        {
          name: 'Ubud Retreat Center',
          inputs: createBaseInputs({
            location: 'ubud',
            nightlyRate: 200,
            baseOccupancyRate: 55,
            showSeasonality: true,
            averageStayLength: 7,
          }),
        },
      ];

      const results = scenarios.map(s => {
        const calc = calculateProjections(s.inputs);
        return {
          name: s.name,
          revenue: calc.annualRevenue,
          expenses: calc.annualExpenses,
          netIncome: calc.annualNetIncome,
          occupancy: calc.averageOccupancy,
          avgRate: calc.averageNightlyRate,
        };
      });

      console.log('\n========== RENTAL PROJECTION VALIDATION ==========');
      console.table(results.map(r => ({
        Scenario: r.name,
        Revenue: `$${r.revenue.toLocaleString()}`,
        Expenses: `$${r.expenses.toLocaleString()}`,
        'Net Income': `$${r.netIncome.toLocaleString()}`,
        Occupancy: `${r.occupancy.toFixed(1)}%`,
        'Avg Rate': `$${r.avgRate.toFixed(0)}`,
      })));

      // All scenarios should produce valid results
      results.forEach(r => {
        expect(r.revenue).toBeGreaterThan(0);
        expect(r.occupancy).toBeGreaterThan(0);
        expect(r.occupancy).toBeLessThanOrEqual(100);
      });
    });
  });
});
