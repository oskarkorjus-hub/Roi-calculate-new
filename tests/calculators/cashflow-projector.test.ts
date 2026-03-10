/**
 * Cash Flow Projector Tests
 *
 * Tests the cash flow projection calculations including
 * rental income, expenses, vacancy, and growth rates.
 */

import { describe, it, expect } from 'vitest';
import { approximatelyEqual } from '../utils/reference-implementations';

// =========================================================================
// CASH FLOW CALCULATION FUNCTIONS (extracted from calculator logic)
// =========================================================================

interface CashFlowInputs {
  monthlyRentalIncome: number;
  monthlyMaintenance: number;
  monthlyPropertyTax: number;
  monthlyInsurance: number;
  monthlyUtilities: number;
  monthlyOtherExpenses: number;
  vacancyRate: number;
  projectionYears: number;
  annualGrowthRate: number;
  expenseGrowthRate: number;
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
}

function calculateCashFlow(inputs: CashFlowInputs): CashFlowYear[] {
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
    seasonalMultiplier,
  } = inputs;

  const monthlyExpenses = monthlyMaintenance + monthlyPropertyTax +
    monthlyInsurance + monthlyUtilities + monthlyOtherExpenses;
  const yearlyBaseExpenses = monthlyExpenses * 12;

  const schedule: CashFlowYear[] = [];
  let cumulativeCashFlow = 0;

  const growthMultiplier = 1 + annualGrowthRate / 100;
  const expenseMultiplier = 1 + expenseGrowthRate / 100;

  for (let year = 1; year <= projectionYears; year++) {
    const yearlyGrossIncome = monthlyRentalIncome * 12 *
      Math.pow(growthMultiplier, year - 1) * seasonalMultiplier;
    const yearlyVacancyLoss = (yearlyGrossIncome * vacancyRate) / 100;
    const yearlyEffectiveIncome = yearlyGrossIncome - yearlyVacancyLoss;
    const yearlyExpenses = yearlyBaseExpenses * Math.pow(expenseMultiplier, year - 1);
    const netCashFlow = yearlyEffectiveIncome - yearlyExpenses;
    cumulativeCashFlow += netCashFlow;

    schedule.push({
      year,
      grossIncome: yearlyGrossIncome,
      vacancyLoss: yearlyVacancyLoss,
      effectiveIncome: yearlyEffectiveIncome,
      totalExpenses: yearlyExpenses,
      netCashFlow,
      cumulativeCashFlow,
    });
  }

  return schedule;
}

describe('Cash Flow Projector', () => {
  // =========================================================================
  // BASIC CALCULATION TESTS
  // =========================================================================

  describe('Basic Cash Flow Calculation', () => {
    it('should calculate year 1 cash flow correctly', () => {
      const inputs: CashFlowInputs = {
        monthlyRentalIncome: 5000,
        monthlyMaintenance: 200,
        monthlyPropertyTax: 300,
        monthlyInsurance: 150,
        monthlyUtilities: 100,
        monthlyOtherExpenses: 50,
        vacancyRate: 10,
        projectionYears: 1,
        annualGrowthRate: 0,
        expenseGrowthRate: 0,
        seasonalMultiplier: 1,
      };

      const result = calculateCashFlow(inputs);

      expect(result.length).toBe(1);

      // Gross: 5000 * 12 = 60000
      expect(result[0].grossIncome).toBe(60000);

      // Vacancy: 60000 * 10% = 6000
      expect(result[0].vacancyLoss).toBe(6000);

      // Effective: 60000 - 6000 = 54000
      expect(result[0].effectiveIncome).toBe(54000);

      // Expenses: (200+300+150+100+50) * 12 = 9600
      expect(result[0].totalExpenses).toBe(9600);

      // Net: 54000 - 9600 = 44400
      expect(result[0].netCashFlow).toBe(44400);
    });

    it('should apply rent growth rate correctly', () => {
      const inputs: CashFlowInputs = {
        monthlyRentalIncome: 5000,
        monthlyMaintenance: 0,
        monthlyPropertyTax: 0,
        monthlyInsurance: 0,
        monthlyUtilities: 0,
        monthlyOtherExpenses: 0,
        vacancyRate: 0,
        projectionYears: 3,
        annualGrowthRate: 5,
        expenseGrowthRate: 0,
        seasonalMultiplier: 1,
      };

      const result = calculateCashFlow(inputs);

      // Year 1: 5000 * 12 = 60000
      expect(result[0].grossIncome).toBe(60000);

      // Year 2: 60000 * 1.05 = 63000
      expect(approximatelyEqual(result[1].grossIncome, 63000, 1)).toBe(true);

      // Year 3: 60000 * 1.05^2 = 66150
      expect(approximatelyEqual(result[2].grossIncome, 66150, 1)).toBe(true);
    });

    it('should apply expense growth rate correctly', () => {
      const inputs: CashFlowInputs = {
        monthlyRentalIncome: 10000,
        monthlyMaintenance: 500,
        monthlyPropertyTax: 0,
        monthlyInsurance: 0,
        monthlyUtilities: 0,
        monthlyOtherExpenses: 0,
        vacancyRate: 0,
        projectionYears: 3,
        annualGrowthRate: 0,
        expenseGrowthRate: 3,
        seasonalMultiplier: 1,
      };

      const result = calculateCashFlow(inputs);

      // Year 1: 500 * 12 = 6000
      expect(result[0].totalExpenses).toBe(6000);

      // Year 2: 6000 * 1.03 = 6180
      expect(approximatelyEqual(result[1].totalExpenses, 6180, 1)).toBe(true);

      // Year 3: 6000 * 1.03^2 = 6365.4
      expect(approximatelyEqual(result[2].totalExpenses, 6365.4, 1)).toBe(true);
    });
  });

  // =========================================================================
  // VACANCY RATE TESTS
  // =========================================================================

  describe('Vacancy Rate', () => {
    it('should calculate 0% vacancy correctly', () => {
      const inputs: CashFlowInputs = {
        monthlyRentalIncome: 5000,
        monthlyMaintenance: 0,
        monthlyPropertyTax: 0,
        monthlyInsurance: 0,
        monthlyUtilities: 0,
        monthlyOtherExpenses: 0,
        vacancyRate: 0,
        projectionYears: 1,
        annualGrowthRate: 0,
        expenseGrowthRate: 0,
        seasonalMultiplier: 1,
      };

      const result = calculateCashFlow(inputs);

      expect(result[0].vacancyLoss).toBe(0);
      expect(result[0].effectiveIncome).toBe(result[0].grossIncome);
    });

    it('should calculate high vacancy rate correctly', () => {
      const inputs: CashFlowInputs = {
        monthlyRentalIncome: 5000,
        monthlyMaintenance: 0,
        monthlyPropertyTax: 0,
        monthlyInsurance: 0,
        monthlyUtilities: 0,
        monthlyOtherExpenses: 0,
        vacancyRate: 30,
        projectionYears: 1,
        annualGrowthRate: 0,
        expenseGrowthRate: 0,
        seasonalMultiplier: 1,
      };

      const result = calculateCashFlow(inputs);

      const grossIncome = 5000 * 12;
      expect(result[0].vacancyLoss).toBe(grossIncome * 0.30);
      expect(result[0].effectiveIncome).toBe(grossIncome * 0.70);
    });
  });

  // =========================================================================
  // CUMULATIVE CASH FLOW TESTS
  // =========================================================================

  describe('Cumulative Cash Flow', () => {
    it('should calculate cumulative cash flow correctly', () => {
      const inputs: CashFlowInputs = {
        monthlyRentalIncome: 5000,
        monthlyMaintenance: 500,
        monthlyPropertyTax: 0,
        monthlyInsurance: 0,
        monthlyUtilities: 0,
        monthlyOtherExpenses: 0,
        vacancyRate: 0,
        projectionYears: 5,
        annualGrowthRate: 0,
        expenseGrowthRate: 0,
        seasonalMultiplier: 1,
      };

      const result = calculateCashFlow(inputs);

      // Each year: (5000 * 12) - (500 * 12) = 54000
      expect(result[0].cumulativeCashFlow).toBe(54000);
      expect(result[1].cumulativeCashFlow).toBe(108000);
      expect(result[2].cumulativeCashFlow).toBe(162000);
      expect(result[4].cumulativeCashFlow).toBe(270000);
    });

    it('should handle negative cumulative cash flow', () => {
      const inputs: CashFlowInputs = {
        monthlyRentalIncome: 3000,
        monthlyMaintenance: 4000, // Expenses > Income
        monthlyPropertyTax: 0,
        monthlyInsurance: 0,
        monthlyUtilities: 0,
        monthlyOtherExpenses: 0,
        vacancyRate: 0,
        projectionYears: 3,
        annualGrowthRate: 0,
        expenseGrowthRate: 0,
        seasonalMultiplier: 1,
      };

      const result = calculateCashFlow(inputs);

      expect(result[0].netCashFlow).toBeLessThan(0);
      expect(result[2].cumulativeCashFlow).toBeLessThan(0);
    });
  });

  // =========================================================================
  // REAL ESTATE SCENARIOS
  // =========================================================================

  describe('Real Estate Scenarios', () => {
    it('should project Bali villa rental cash flow', () => {
      // Typical Bali villa: $4000/month rent, moderate expenses
      const inputs: CashFlowInputs = {
        monthlyRentalIncome: 4000,
        monthlyMaintenance: 300,
        monthlyPropertyTax: 100,
        monthlyInsurance: 100,
        monthlyUtilities: 150,
        monthlyOtherExpenses: 100,
        vacancyRate: 25, // High vacancy typical for STR
        projectionYears: 10,
        annualGrowthRate: 3, // Modest rent growth
        expenseGrowthRate: 2, // Inflation
        seasonalMultiplier: 1,
      };

      const result = calculateCashFlow(inputs);

      // Year 1 should be profitable
      expect(result[0].netCashFlow).toBeGreaterThan(0);

      // 10-year cumulative should be significant
      expect(result[9].cumulativeCashFlow).toBeGreaterThan(200000);

      // Cash flow should grow over time
      expect(result[9].netCashFlow).toBeGreaterThan(result[0].netCashFlow);
    });

    it('should handle high expense property', () => {
      // Older property with high maintenance
      const inputs: CashFlowInputs = {
        monthlyRentalIncome: 3000,
        monthlyMaintenance: 800,
        monthlyPropertyTax: 400,
        monthlyInsurance: 200,
        monthlyUtilities: 300,
        monthlyOtherExpenses: 200,
        vacancyRate: 15,
        projectionYears: 5,
        annualGrowthRate: 2,
        expenseGrowthRate: 4, // Expenses growing faster
        seasonalMultiplier: 1,
      };

      const result = calculateCashFlow(inputs);

      // Should still be positive but tighter margins
      expect(result[0].netCashFlow).toBeGreaterThan(0);

      // Margin should decrease over time due to expense growth
      const margin1 = result[0].netCashFlow / result[0].effectiveIncome;
      const margin5 = result[4].netCashFlow / result[4].effectiveIncome;
      expect(margin5).toBeLessThan(margin1);
    });

    it('should project apartment complex cash flow', () => {
      // Multi-unit: $20k/month rent, professional management
      const inputs: CashFlowInputs = {
        monthlyRentalIncome: 20000,
        monthlyMaintenance: 2000,
        monthlyPropertyTax: 1500,
        monthlyInsurance: 800,
        monthlyUtilities: 500,
        monthlyOtherExpenses: 1200, // Management fees etc
        vacancyRate: 8, // Lower for LTR
        projectionYears: 10,
        annualGrowthRate: 4,
        expenseGrowthRate: 3,
        seasonalMultiplier: 1,
      };

      const result = calculateCashFlow(inputs);

      // Should generate strong returns
      expect(result[0].netCashFlow).toBeGreaterThan(100000);
      expect(result[9].cumulativeCashFlow).toBeGreaterThan(1000000);
    });
  });

  // =========================================================================
  // SEASONAL MULTIPLIER TESTS
  // =========================================================================

  describe('Seasonal Multiplier', () => {
    it('should apply seasonal boost correctly', () => {
      const baseInputs: CashFlowInputs = {
        monthlyRentalIncome: 5000,
        monthlyMaintenance: 0,
        monthlyPropertyTax: 0,
        monthlyInsurance: 0,
        monthlyUtilities: 0,
        monthlyOtherExpenses: 0,
        vacancyRate: 0,
        projectionYears: 1,
        annualGrowthRate: 0,
        expenseGrowthRate: 0,
        seasonalMultiplier: 1,
      };

      const boosted = calculateCashFlow({ ...baseInputs, seasonalMultiplier: 1.2 });
      const normal = calculateCashFlow(baseInputs);

      expect(boosted[0].grossIncome).toBe(normal[0].grossIncome * 1.2);
    });
  });

  // =========================================================================
  // EDGE CASES
  // =========================================================================

  describe('Edge Cases', () => {
    it('should handle zero rental income', () => {
      const inputs: CashFlowInputs = {
        monthlyRentalIncome: 0,
        monthlyMaintenance: 500,
        monthlyPropertyTax: 0,
        monthlyInsurance: 0,
        monthlyUtilities: 0,
        monthlyOtherExpenses: 0,
        vacancyRate: 10,
        projectionYears: 3,
        annualGrowthRate: 5,
        expenseGrowthRate: 0,
        seasonalMultiplier: 1,
      };

      const result = calculateCashFlow(inputs);

      expect(result[0].grossIncome).toBe(0);
      expect(result[0].netCashFlow).toBe(-6000);
    });

    it('should handle zero expenses', () => {
      const inputs: CashFlowInputs = {
        monthlyRentalIncome: 5000,
        monthlyMaintenance: 0,
        monthlyPropertyTax: 0,
        monthlyInsurance: 0,
        monthlyUtilities: 0,
        monthlyOtherExpenses: 0,
        vacancyRate: 10,
        projectionYears: 1,
        annualGrowthRate: 0,
        expenseGrowthRate: 0,
        seasonalMultiplier: 1,
      };

      const result = calculateCashFlow(inputs);

      expect(result[0].totalExpenses).toBe(0);
      expect(result[0].netCashFlow).toBe(result[0].effectiveIncome);
    });

    it('should handle 100% vacancy', () => {
      const inputs: CashFlowInputs = {
        monthlyRentalIncome: 5000,
        monthlyMaintenance: 500,
        monthlyPropertyTax: 0,
        monthlyInsurance: 0,
        monthlyUtilities: 0,
        monthlyOtherExpenses: 0,
        vacancyRate: 100,
        projectionYears: 1,
        annualGrowthRate: 0,
        expenseGrowthRate: 0,
        seasonalMultiplier: 1,
      };

      const result = calculateCashFlow(inputs);

      expect(result[0].effectiveIncome).toBe(0);
      expect(result[0].netCashFlow).toBe(-6000); // Only expenses
    });
  });

  // =========================================================================
  // VALIDATION REPORT
  // =========================================================================

  describe('Validation Summary', () => {
    it('should generate comprehensive validation report', () => {
      const scenarios = [
        {
          name: 'Luxury Villa',
          inputs: {
            monthlyRentalIncome: 8000,
            monthlyMaintenance: 500,
            monthlyPropertyTax: 200,
            monthlyInsurance: 200,
            monthlyUtilities: 300,
            monthlyOtherExpenses: 200,
            vacancyRate: 30,
            projectionYears: 10,
            annualGrowthRate: 4,
            expenseGrowthRate: 2,
            seasonalMultiplier: 1,
          },
        },
        {
          name: 'Budget Apartment',
          inputs: {
            monthlyRentalIncome: 2000,
            monthlyMaintenance: 200,
            monthlyPropertyTax: 150,
            monthlyInsurance: 100,
            monthlyUtilities: 100,
            monthlyOtherExpenses: 50,
            vacancyRate: 10,
            projectionYears: 10,
            annualGrowthRate: 2,
            expenseGrowthRate: 3,
            seasonalMultiplier: 1,
          },
        },
        {
          name: 'Commercial Space',
          inputs: {
            monthlyRentalIncome: 15000,
            monthlyMaintenance: 1500,
            monthlyPropertyTax: 1000,
            monthlyInsurance: 500,
            monthlyUtilities: 800,
            monthlyOtherExpenses: 500,
            vacancyRate: 15,
            projectionYears: 10,
            annualGrowthRate: 3,
            expenseGrowthRate: 2.5,
            seasonalMultiplier: 1,
          },
        },
      ];

      const results = scenarios.map(s => {
        const cashFlow = calculateCashFlow(s.inputs as CashFlowInputs);
        const y1 = cashFlow[0];
        const y10 = cashFlow[9];

        return {
          Scenario: s.name,
          'Y1 Net CF': `$${y1.netCashFlow.toLocaleString()}`,
          'Y10 Net CF': `$${y10.netCashFlow.toLocaleString()}`,
          '10Y Total': `$${y10.cumulativeCashFlow.toLocaleString()}`,
          'Growth %': ((y10.netCashFlow / y1.netCashFlow - 1) * 100).toFixed(1),
        };
      });

      console.log('\n========== CASH FLOW PROJECTOR VALIDATION ==========');
      console.table(results);

      // All scenarios should have positive 10-year cumulative
      scenarios.forEach(s => {
        const result = calculateCashFlow(s.inputs as CashFlowInputs);
        expect(result[9].cumulativeCashFlow).toBeGreaterThan(0);
      });
    });
  });
});
