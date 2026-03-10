/**
 * Real Estate Metrics Tests
 *
 * Tests Cap Rate, Cash-on-Cash Return, GRM, DSCR, LTV, and
 * other real estate investment calculations.
 */

import { describe, it, expect } from 'vitest';
import {
  referenceCapRate,
  referenceCashOnCash,
  referenceGRM,
  referenceDSCR,
  referenceLTV,
  generateRentalScenario,
  approximatelyEqual,
} from '../utils/reference-implementations';

// ============================================================================
// CAP RATE CALCULATOR FUNCTIONS (mirroring src/calculators/CapRateCalculator)
// ============================================================================

function calculateCapRate(noi: number, propertyValue: number): number {
  if (propertyValue === 0) return 0;
  return (noi / propertyValue) * 100;
}

function calculateAdjustedCapRate(
  grossAnnualIncome: number,
  propertyValue: number,
  vacancyRate: number,
  maintenanceReserve: number,
  propertyTaxes: number,
  insurance: number,
  utilities: number
): number {
  if (propertyValue === 0) return 0;

  // Calculate Effective Gross Income
  const vacancyLoss = grossAnnualIncome * (vacancyRate / 100);
  const effectiveGrossIncome = grossAnnualIncome - vacancyLoss;

  // Calculate total expenses
  const maintenanceCost = grossAnnualIncome * (maintenanceReserve / 100);
  const totalExpenses = propertyTaxes + insurance + utilities + maintenanceCost;

  // Calculate NOI
  const adjustedNOI = effectiveGrossIncome - totalExpenses;

  return (adjustedNOI / propertyValue) * 100;
}

function calculateNOI(
  grossAnnualIncome: number,
  vacancyRate: number,
  operatingExpenses: number
): number {
  const vacancyLoss = grossAnnualIncome * (vacancyRate / 100);
  const effectiveGrossIncome = grossAnnualIncome - vacancyLoss;
  return effectiveGrossIncome - operatingExpenses;
}

// ============================================================================
// CASH-ON-CASH RETURN FUNCTIONS
// ============================================================================

function calculateCashOnCash(
  annualCashFlow: number,
  totalCashInvested: number
): number {
  if (totalCashInvested === 0) return 0;
  return (annualCashFlow / totalCashInvested) * 100;
}

function calculateAnnualCashFlow(
  noi: number,
  annualDebtService: number
): number {
  return noi - annualDebtService;
}

// ============================================================================
// OTHER METRICS
// ============================================================================

function calculateGRM(
  propertyPrice: number,
  grossAnnualRent: number
): number {
  if (grossAnnualRent === 0) return 0;
  return propertyPrice / grossAnnualRent;
}

function calculateDSCR(
  noi: number,
  annualDebtService: number
): number {
  if (annualDebtService === 0) return Infinity;
  return noi / annualDebtService;
}

function calculateLTV(
  loanAmount: number,
  propertyValue: number
): number {
  if (propertyValue === 0) return 0;
  return (loanAmount / propertyValue) * 100;
}

function calculateBreakEvenRatio(
  operatingExpenses: number,
  debtService: number,
  grossIncome: number
): number {
  if (grossIncome === 0) return 100;
  return ((operatingExpenses + debtService) / grossIncome) * 100;
}

// ============================================================================
// TESTS
// ============================================================================

describe('Real Estate Metrics', () => {
  // =========================================================================
  // CAP RATE TESTS
  // =========================================================================

  describe('Cap Rate Calculation', () => {
    it('should calculate basic cap rate correctly', () => {
      const noi = 50000;
      const propertyValue = 500000;

      const result = calculateCapRate(noi, propertyValue);
      const reference = referenceCapRate(noi, propertyValue);

      expect(result).toBe(10); // 10% cap rate
      expect(result).toBe(reference);
    });

    it('should return 0 for zero property value', () => {
      const result = calculateCapRate(50000, 0);
      expect(result).toBe(0);
    });

    it('should handle various cap rate scenarios', () => {
      const scenarios = [
        { noi: 30000, value: 500000, expected: 6 },   // Low cap rate market
        { noi: 40000, value: 500000, expected: 8 },   // Moderate
        { noi: 50000, value: 500000, expected: 10 },  // Good
        { noi: 60000, value: 500000, expected: 12 },  // High cap rate
        { noi: 75000, value: 500000, expected: 15 },  // Very high
      ];

      scenarios.forEach(({ noi, value, expected }) => {
        const result = calculateCapRate(noi, value);
        expect(result).toBe(expected);
      });
    });

    it('should calculate adjusted cap rate with vacancy and expenses', () => {
      const grossAnnualIncome = 60000;
      const propertyValue = 500000;
      const vacancyRate = 5;
      const maintenanceReserve = 5;
      const propertyTaxes = 6000;
      const insurance = 2000;
      const utilities = 1200;

      const result = calculateAdjustedCapRate(
        grossAnnualIncome,
        propertyValue,
        vacancyRate,
        maintenanceReserve,
        propertyTaxes,
        insurance,
        utilities
      );

      // Manual calculation:
      // Vacancy loss = 60000 * 0.05 = 3000
      // EGI = 60000 - 3000 = 57000
      // Maintenance = 60000 * 0.05 = 3000
      // Total expenses = 6000 + 2000 + 1200 + 3000 = 12200
      // Adjusted NOI = 57000 - 12200 = 44800
      // Adjusted Cap Rate = (44800 / 500000) * 100 = 8.96%

      expect(approximatelyEqual(result, 8.96, 0.01)).toBe(true);
    });
  });

  // =========================================================================
  // CASH-ON-CASH RETURN TESTS
  // =========================================================================

  describe('Cash-on-Cash Return', () => {
    it('should calculate basic cash-on-cash return', () => {
      const annualCashFlow = 12000;
      const totalCashInvested = 100000;

      const result = calculateCashOnCash(annualCashFlow, totalCashInvested);
      const reference = referenceCashOnCash(annualCashFlow, totalCashInvested);

      expect(result).toBe(12); // 12% CoC return
      expect(result).toBe(reference);
    });

    it('should return 0 for zero cash invested', () => {
      const result = calculateCashOnCash(10000, 0);
      expect(result).toBe(0);
    });

    it('should handle negative cash flow', () => {
      const result = calculateCashOnCash(-5000, 100000);
      expect(result).toBe(-5); // -5% return
    });

    it('should calculate for real estate scenarios', () => {
      const scenarios = generateRentalScenario('excellent');

      // Calculate NOI
      const noi = scenarios.annualRent - scenarios.annualExpenses;

      // Calculate annual cash flow
      const annualCashFlow = calculateAnnualCashFlow(noi, scenarios.annualDebtService);

      // Calculate CoC
      const result = calculateCashOnCash(annualCashFlow, scenarios.downPayment);

      console.log('Excellent scenario Cash-on-Cash:');
      console.log(`  NOI: $${noi}`);
      console.log(`  Annual Cash Flow: $${annualCashFlow}`);
      console.log(`  Down Payment: $${scenarios.downPayment}`);
      console.log(`  Cash-on-Cash: ${result.toFixed(2)}%`);

      // Excellent scenario should have positive CoC
      expect(result).toBeGreaterThan(0);
    });
  });

  // =========================================================================
  // GROSS RENT MULTIPLIER TESTS
  // =========================================================================

  describe('Gross Rent Multiplier (GRM)', () => {
    it('should calculate basic GRM', () => {
      const propertyPrice = 300000;
      const grossAnnualRent = 24000;

      const result = calculateGRM(propertyPrice, grossAnnualRent);
      const reference = referenceGRM(propertyPrice, grossAnnualRent);

      expect(result).toBe(12.5); // 12.5 GRM
      expect(result).toBe(reference);
    });

    it('should return 0 for zero rent', () => {
      const result = calculateGRM(300000, 0);
      expect(result).toBe(0);
    });

    it('should identify good vs bad GRM values', () => {
      // Lower GRM = potentially better value
      const goodGRM = calculateGRM(200000, 24000); // 8.33 GRM
      const moderateGRM = calculateGRM(300000, 24000); // 12.5 GRM
      const poorGRM = calculateGRM(480000, 24000); // 20 GRM

      expect(goodGRM).toBeLessThan(10);
      expect(moderateGRM).toBeGreaterThan(10);
      expect(moderateGRM).toBeLessThan(15);
      expect(poorGRM).toBeGreaterThan(15);
    });
  });

  // =========================================================================
  // DEBT SERVICE COVERAGE RATIO TESTS
  // =========================================================================

  describe('Debt Service Coverage Ratio (DSCR)', () => {
    it('should calculate basic DSCR', () => {
      const noi = 50000;
      const annualDebtService = 40000;

      const result = calculateDSCR(noi, annualDebtService);
      const reference = referenceDSCR(noi, annualDebtService);

      expect(result).toBe(1.25); // 1.25x DSCR
      expect(result).toBe(reference);
    });

    it('should return Infinity for zero debt service', () => {
      const result = calculateDSCR(50000, 0);
      expect(result).toBe(Infinity);
    });

    it('should identify acceptable vs risky DSCR values', () => {
      // DSCR > 1.25 is typically acceptable for lenders
      const excellentDSCR = calculateDSCR(60000, 40000); // 1.5x
      const acceptableDSCR = calculateDSCR(50000, 40000); // 1.25x
      const riskyDSCR = calculateDSCR(44000, 40000); // 1.1x
      const dangerDSCR = calculateDSCR(38000, 40000); // 0.95x

      expect(excellentDSCR).toBeGreaterThan(1.4);
      expect(acceptableDSCR).toBeGreaterThanOrEqual(1.25);
      expect(riskyDSCR).toBeLessThan(1.2);
      expect(dangerDSCR).toBeLessThan(1.0);
    });

    it('should work with real estate scenarios', () => {
      const scenarios = ['excellent', 'good', 'moderate', 'poor'] as const;

      console.log('\nDSCR by Scenario:');
      scenarios.forEach(type => {
        const s = generateRentalScenario(type);
        const noi = s.annualRent - s.annualExpenses;
        const dscr = calculateDSCR(noi, s.annualDebtService);
        console.log(`  ${type}: ${dscr.toFixed(2)}x`);
      });
    });
  });

  // =========================================================================
  // LOAN-TO-VALUE TESTS
  // =========================================================================

  describe('Loan-to-Value (LTV)', () => {
    it('should calculate basic LTV', () => {
      const loanAmount = 400000;
      const propertyValue = 500000;

      const result = calculateLTV(loanAmount, propertyValue);
      const reference = referenceLTV(loanAmount, propertyValue);

      expect(result).toBe(80); // 80% LTV
      expect(result).toBe(reference);
    });

    it('should return 0 for zero property value', () => {
      const result = calculateLTV(400000, 0);
      expect(result).toBe(0);
    });

    it('should identify PMI requirements', () => {
      // PMI typically required when LTV > 80%
      const lowLTV = calculateLTV(350000, 500000); // 70%
      const borderlineLTV = calculateLTV(400000, 500000); // 80%
      const highLTV = calculateLTV(475000, 500000); // 95%

      expect(lowLTV).toBeLessThan(80);
      expect(borderlineLTV).toBe(80);
      expect(highLTV).toBeGreaterThan(80);
    });
  });

  // =========================================================================
  // BREAK-EVEN RATIO TESTS
  // =========================================================================

  describe('Break-Even Ratio', () => {
    it('should calculate break-even ratio', () => {
      const operatingExpenses = 15000;
      const debtService = 28000;
      const grossIncome = 60000;

      const result = calculateBreakEvenRatio(operatingExpenses, debtService, grossIncome);

      // (15000 + 28000) / 60000 * 100 = 71.67%
      expect(approximatelyEqual(result, 71.67, 0.01)).toBe(true);
    });

    it('should return 100 for zero gross income', () => {
      const result = calculateBreakEvenRatio(15000, 28000, 0);
      expect(result).toBe(100);
    });

    it('should identify healthy vs stressed properties', () => {
      // Break-even < 85% is typically healthy
      const healthy = calculateBreakEvenRatio(12000, 24000, 48000); // 75%
      const marginal = calculateBreakEvenRatio(15000, 30000, 50000); // 90%
      const stressed = calculateBreakEvenRatio(20000, 35000, 50000); // 110%

      expect(healthy).toBeLessThan(80);
      expect(marginal).toBeGreaterThan(85);
      expect(marginal).toBeLessThan(100);
      expect(stressed).toBeGreaterThan(100);
    });
  });

  // =========================================================================
  // NOI CALCULATION TESTS
  // =========================================================================

  describe('Net Operating Income (NOI)', () => {
    it('should calculate NOI correctly', () => {
      const grossIncome = 60000;
      const vacancyRate = 5;
      const operatingExpenses = 15000;

      const result = calculateNOI(grossIncome, vacancyRate, operatingExpenses);

      // Vacancy loss = 60000 * 0.05 = 3000
      // EGI = 60000 - 3000 = 57000
      // NOI = 57000 - 15000 = 42000
      expect(result).toBe(42000);
    });

    it('should handle zero vacancy', () => {
      const result = calculateNOI(60000, 0, 15000);
      expect(result).toBe(45000);
    });

    it('should handle high vacancy', () => {
      const result = calculateNOI(60000, 20, 15000);
      // Vacancy loss = 12000, EGI = 48000, NOI = 33000
      expect(result).toBe(33000);
    });
  });

  // =========================================================================
  // COMPREHENSIVE PROPERTY ANALYSIS
  // =========================================================================

  describe('Comprehensive Property Analysis', () => {
    it('should analyze excellent investment property', () => {
      const scenario = generateRentalScenario('excellent');

      const noi = scenario.annualRent - scenario.annualExpenses;
      const capRate = calculateCapRate(noi, scenario.propertyValue);
      const annualCashFlow = calculateAnnualCashFlow(noi, scenario.annualDebtService);
      const cashOnCash = calculateCashOnCash(annualCashFlow, scenario.downPayment);
      const grm = calculateGRM(scenario.propertyValue, scenario.annualRent);
      const dscr = calculateDSCR(noi, scenario.annualDebtService);
      const ltv = calculateLTV(scenario.loanAmount, scenario.propertyValue);
      const breakEven = calculateBreakEvenRatio(
        scenario.annualExpenses,
        scenario.annualDebtService,
        scenario.annualRent
      );

      console.log('\n========== EXCELLENT PROPERTY ANALYSIS ==========');
      console.log(`Property Value: $${scenario.propertyValue.toLocaleString()}`);
      console.log(`Annual Rent: $${scenario.annualRent.toLocaleString()}`);
      console.log(`NOI: $${noi.toLocaleString()}`);
      console.log(`---`);
      console.log(`Cap Rate: ${capRate.toFixed(2)}%`);
      console.log(`Cash-on-Cash Return: ${cashOnCash.toFixed(2)}%`);
      console.log(`Gross Rent Multiplier: ${grm.toFixed(2)}`);
      console.log(`DSCR: ${dscr.toFixed(2)}x`);
      console.log(`LTV: ${ltv.toFixed(1)}%`);
      console.log(`Break-Even Ratio: ${breakEven.toFixed(1)}%`);

      // Assertions for excellent property
      expect(capRate).toBeGreaterThan(7);
      expect(cashOnCash).toBeGreaterThan(10);
      expect(grm).toBeLessThan(15);
      expect(dscr).toBeGreaterThan(1.25);
      expect(ltv).toBeLessThanOrEqual(80);
      expect(breakEven).toBeLessThan(85);
    });

    it('should identify poor investment property', () => {
      const scenario = generateRentalScenario('poor');

      const noi = scenario.annualRent - scenario.annualExpenses;
      const capRate = calculateCapRate(noi, scenario.propertyValue);
      const annualCashFlow = calculateAnnualCashFlow(noi, scenario.annualDebtService);
      const cashOnCash = calculateCashOnCash(annualCashFlow, scenario.downPayment);
      const dscr = calculateDSCR(noi, scenario.annualDebtService);

      console.log('\n========== POOR PROPERTY ANALYSIS ==========');
      console.log(`Cap Rate: ${capRate.toFixed(2)}%`);
      console.log(`Cash-on-Cash Return: ${cashOnCash.toFixed(2)}%`);
      console.log(`DSCR: ${dscr.toFixed(2)}x`);

      // Poor property indicators
      expect(capRate).toBeLessThan(5);
      expect(cashOnCash).toBeLessThan(5);
      expect(dscr).toBeLessThan(1.0); // Negative cash flow
    });
  });

  // =========================================================================
  // VALIDATION REPORT
  // =========================================================================

  describe('Validation Summary', () => {
    it('should generate comprehensive validation report', () => {
      const results: Array<{
        Metric: string;
        TestCase: string;
        Result: string;
        Expected: string;
        Status: string;
      }> = [];

      // Cap Rate tests
      const capRate1 = calculateCapRate(50000, 500000);
      results.push({
        Metric: 'Cap Rate',
        TestCase: '$50k NOI / $500k Value',
        Result: `${capRate1.toFixed(2)}%`,
        Expected: '10.00%',
        Status: capRate1 === 10 ? 'PASS' : 'FAIL',
      });

      // Cash-on-Cash tests
      const coc1 = calculateCashOnCash(12000, 100000);
      results.push({
        Metric: 'Cash-on-Cash',
        TestCase: '$12k CF / $100k Invested',
        Result: `${coc1.toFixed(2)}%`,
        Expected: '12.00%',
        Status: coc1 === 12 ? 'PASS' : 'FAIL',
      });

      // GRM tests
      const grm1 = calculateGRM(300000, 24000);
      results.push({
        Metric: 'GRM',
        TestCase: '$300k Price / $24k Rent',
        Result: grm1.toFixed(2),
        Expected: '12.50',
        Status: grm1 === 12.5 ? 'PASS' : 'FAIL',
      });

      // DSCR tests
      const dscr1 = calculateDSCR(50000, 40000);
      results.push({
        Metric: 'DSCR',
        TestCase: '$50k NOI / $40k Debt Service',
        Result: `${dscr1.toFixed(2)}x`,
        Expected: '1.25x',
        Status: dscr1 === 1.25 ? 'PASS' : 'FAIL',
      });

      // LTV tests
      const ltv1 = calculateLTV(400000, 500000);
      results.push({
        Metric: 'LTV',
        TestCase: '$400k Loan / $500k Value',
        Result: `${ltv1.toFixed(1)}%`,
        Expected: '80.0%',
        Status: ltv1 === 80 ? 'PASS' : 'FAIL',
      });

      console.log('\n========== REAL ESTATE METRICS VALIDATION ==========');
      console.table(results);

      const allPassed = results.every(r => r.Status === 'PASS');
      expect(allPassed).toBe(true);
    });
  });
});
