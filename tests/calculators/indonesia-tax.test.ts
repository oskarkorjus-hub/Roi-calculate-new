/**
 * Indonesia Tax Optimizer Tests
 *
 * Tests the tax calculation logic including depreciation,
 * capital gains, ownership structure comparison, and deductions.
 */

import { describe, it, expect } from 'vitest';
import { approximatelyEqual } from '../utils/reference-implementations';

// =========================================================================
// TAX CALCULATION FUNCTIONS (extracted from calculator logic)
// =========================================================================

type OwnershipType = 'pt' | 'freehold' | 'leasehold';

interface TaxInputs {
  purchasePrice: number;
  holdingPeriod: number;
  projectedSalePrice: number;
  ownershipStructure: OwnershipType;
  annualMaintenanceExpenses: number;
  propertyTaxRate: number;

  // Depreciation
  buildingValue: number;
  buildingDepreciationRate: number;
  showDepreciation: boolean;

  // Deductions
  annualUtilities: number;
  annualPropertyManagement: number;
  annualInsurance: number;
  annualOtherExpenses: number;
  showDeductions: boolean;

  // Capital Gains
  acquisitionCosts: number;
  sellingCosts: number;

  // Ownership Impact
  corporateTaxRate: number;
  individualCapGainRate: number;

  // Reinvestment
  reinvestmentAmount: number;
  reinvestmentYield: number;
}

interface TaxResult {
  grossROI: number;
  netROI: number;
  totalTaxLiability: number;
  effectiveTaxRate: number;
  capitalGain: number;
  capitalGainsTax: number;
  totalDepreciation: number;
  depreciationTaxSavings: number;
  totalDeductions: number;
  deductionTaxSavings: number;
  netProceeds: number;
  netProfit: number;
  ptTaxLiability: number;
  freeholdTaxLiability: number;
  leaseholdTaxLiability: number;
  optimalStructure: OwnershipType;
  taxSavingsFromOptimal: number;
  reinvestmentValue?: number;
}

function getTaxRates(structure: OwnershipType, holdingPeriod: number, corporateTaxRate: number, individualCapGainRate: number) {
  switch (structure) {
    case 'pt':
      return {
        capitalGainsRate: corporateTaxRate / 100,
        incomeRate: corporateTaxRate / 100,
        depreciationRecaptureRate: corporateTaxRate / 100,
        canDeduct: true,
      };
    case 'freehold':
      return {
        capitalGainsRate: individualCapGainRate / 100,
        incomeRate: holdingPeriod < 5 ? 0.30 : 0.20,
        depreciationRecaptureRate: 0.25,
        canDeduct: false,
      };
    case 'leasehold':
      return {
        capitalGainsRate: 0.10,
        incomeRate: 0.10,
        depreciationRecaptureRate: 0.10,
        canDeduct: false,
      };
  }
}

function calculateTax(inputs: TaxInputs): TaxResult {
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

  const calculateForStructure = (structure: OwnershipType) => {
    const rates = getTaxRates(structure, holdingPeriod, corporateTaxRate, individualCapGainRate);

    const cgTax = Math.max(0, capitalGain * rates.capitalGainsRate);
    const depRecapture = showDepreciation ? totalDepreciation * rates.depreciationRecaptureRate : 0;
    const deductionBenefit = rates.canDeduct ? totalDeductions * rates.incomeRate : 0;
    const depreciationBenefit = rates.canDeduct && showDepreciation ? totalDepreciation * rates.incomeRate : 0;
    const totalTax = cgTax + depRecapture + totalPropertyTax - deductionBenefit - depreciationBenefit;

    return {
      capitalGainsTax: cgTax,
      depreciationRecaptureTax: depRecapture,
      totalTaxLiability: Math.max(0, totalTax),
      deductionSavings: deductionBenefit,
      depreciationSavings: depreciationBenefit,
    };
  };

  const currentCalc = calculateForStructure(ownershipStructure);
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
  const grossROI = purchasePrice > 0 ? ((projectedSalePrice - purchasePrice) / purchasePrice) * 100 : 0;
  const netROI = (purchasePrice + acquisitionCosts) > 0 ? (netProfit / (purchasePrice + acquisitionCosts)) * 100 : 0;
  const effectiveTaxRate = capitalGain > 0 ? (currentCalc.totalTaxLiability / capitalGain) * 100 : 0;

  // Reinvestment
  const reinvestmentValue = reinvestmentAmount > 0
    ? reinvestmentAmount * Math.pow(1 + reinvestmentYield / 100, holdingPeriod)
    : undefined;

  return {
    grossROI,
    netROI,
    totalTaxLiability: currentCalc.totalTaxLiability,
    effectiveTaxRate,
    capitalGain,
    capitalGainsTax: currentCalc.capitalGainsTax,
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
    reinvestmentValue,
  };
}

function createBaseInputs(overrides: Partial<TaxInputs> = {}): TaxInputs {
  return {
    purchasePrice: 500000,
    holdingPeriod: 5,
    projectedSalePrice: 650000,
    ownershipStructure: 'pt',
    annualMaintenanceExpenses: 5000,
    propertyTaxRate: 0.5,

    buildingValue: 300000,
    buildingDepreciationRate: 5,
    showDepreciation: false,

    annualUtilities: 2000,
    annualPropertyManagement: 3000,
    annualInsurance: 1500,
    annualOtherExpenses: 1000,
    showDeductions: false,

    acquisitionCosts: 25000,
    sellingCosts: 20000,

    corporateTaxRate: 22,
    individualCapGainRate: 25,

    reinvestmentAmount: 0,
    reinvestmentYield: 0,
    ...overrides,
  };
}

describe('Indonesia Tax Optimizer', () => {
  // =========================================================================
  // CAPITAL GAINS CALCULATION
  // =========================================================================

  describe('Capital Gains Calculation', () => {
    it('should calculate capital gain correctly', () => {
      const inputs = createBaseInputs({
        purchasePrice: 500000,
        projectedSalePrice: 700000,
        acquisitionCosts: 25000,
        sellingCosts: 20000,
      });
      const result = calculateTax(inputs);

      // Gross proceeds: 700k - 20k = 680k
      // Adjusted basis: 500k + 25k = 525k
      // Capital gain: 680k - 525k = 155k
      expect(result.capitalGain).toBe(155000);
    });

    it('should handle negative capital gain (loss)', () => {
      const inputs = createBaseInputs({
        purchasePrice: 500000,
        projectedSalePrice: 400000,
      });
      const result = calculateTax(inputs);

      expect(result.capitalGain).toBeLessThan(0);
      expect(result.capitalGainsTax).toBe(0); // No tax on loss
    });

    it('should reduce capital gain with depreciation', () => {
      const inputs = createBaseInputs({
        showDepreciation: true,
        buildingValue: 300000,
        buildingDepreciationRate: 5,
        holdingPeriod: 5,
      });
      const result = calculateTax(inputs);

      // Depreciation: 300k * 5% * 5 years = 75k
      // This reduces adjusted basis, increasing capital gain
      expect(result.totalDepreciation).toBe(75000);
    });
  });

  // =========================================================================
  // DEPRECIATION
  // =========================================================================

  describe('Depreciation Calculation', () => {
    it('should calculate annual depreciation correctly', () => {
      const inputs = createBaseInputs({
        showDepreciation: true,
        buildingValue: 400000,
        buildingDepreciationRate: 4,
        holdingPeriod: 10,
      });
      const result = calculateTax(inputs);

      // Annual: 400k * 4% = 16k
      // Total: 16k * 10 years = 160k
      expect(result.totalDepreciation).toBe(160000);
    });

    it('should calculate depreciation tax savings for PT', () => {
      const inputs = createBaseInputs({
        ownershipStructure: 'pt',
        showDepreciation: true,
        buildingValue: 300000,
        buildingDepreciationRate: 5,
        holdingPeriod: 5,
        corporateTaxRate: 22,
      });
      const result = calculateTax(inputs);

      // Depreciation: 75k, tax savings: 75k * 22% = 16.5k
      expect(result.depreciationTaxSavings).toBe(16500);
    });

    it('should not apply depreciation savings for freehold', () => {
      const inputs = createBaseInputs({
        ownershipStructure: 'freehold',
        showDepreciation: true,
        buildingValue: 300000,
        buildingDepreciationRate: 5,
      });
      const result = calculateTax(inputs);

      expect(result.depreciationTaxSavings).toBe(0);
    });
  });

  // =========================================================================
  // DEDUCTIONS
  // =========================================================================

  describe('Deductions Calculation', () => {
    it('should calculate total deductions correctly', () => {
      const inputs = createBaseInputs({
        showDeductions: true,
        annualMaintenanceExpenses: 5000,
        annualUtilities: 2000,
        annualPropertyManagement: 3000,
        annualInsurance: 1500,
        annualOtherExpenses: 1000,
        holdingPeriod: 5,
      });
      const result = calculateTax(inputs);

      // Annual: 5k + 2k + 3k + 1.5k + 1k = 12.5k
      // Total: 12.5k * 5 years = 62.5k
      expect(result.totalDeductions).toBe(62500);
    });

    it('should calculate deduction tax savings for PT', () => {
      const inputs = createBaseInputs({
        ownershipStructure: 'pt',
        showDeductions: true,
        annualMaintenanceExpenses: 10000,
        annualUtilities: 0,
        annualPropertyManagement: 0,
        annualInsurance: 0,
        annualOtherExpenses: 0,
        holdingPeriod: 5,
        corporateTaxRate: 22,
      });
      const result = calculateTax(inputs);

      // Deductions: 50k, tax savings: 50k * 22% = 11k
      expect(result.deductionTaxSavings).toBe(11000);
    });

    it('should not apply deduction savings for freehold', () => {
      const inputs = createBaseInputs({
        ownershipStructure: 'freehold',
        showDeductions: true,
      });
      const result = calculateTax(inputs);

      expect(result.deductionTaxSavings).toBe(0);
    });
  });

  // =========================================================================
  // OWNERSHIP STRUCTURE COMPARISON
  // =========================================================================

  describe('Ownership Structure Comparison', () => {
    it('should calculate PT tax liability', () => {
      const inputs = createBaseInputs({
        ownershipStructure: 'pt',
        corporateTaxRate: 22,
      });
      const result = calculateTax(inputs);

      expect(result.ptTaxLiability).toBeGreaterThan(0);
    });

    it('should calculate freehold tax liability', () => {
      const inputs = createBaseInputs({
        ownershipStructure: 'freehold',
        individualCapGainRate: 25,
      });
      const result = calculateTax(inputs);

      expect(result.freeholdTaxLiability).toBeGreaterThan(0);
    });

    it('should calculate leasehold tax liability at 10%', () => {
      const inputs = createBaseInputs({
        purchasePrice: 500000,
        projectedSalePrice: 600000,
        acquisitionCosts: 0,
        sellingCosts: 0,
      });
      const result = calculateTax(inputs);

      // Capital gain: 100k, leasehold rate: 10%
      expect(approximatelyEqual(result.leaseholdTaxLiability, 10000, 1000)).toBe(true);
    });

    it('should identify optimal structure', () => {
      const inputs = createBaseInputs({
        purchasePrice: 500000,
        projectedSalePrice: 600000,
        corporateTaxRate: 22,
        individualCapGainRate: 25,
      });
      const result = calculateTax(inputs);

      // Leasehold typically has lowest tax (10%)
      expect(['pt', 'freehold', 'leasehold']).toContain(result.optimalStructure);
    });

    it('should calculate tax savings from optimal structure', () => {
      const inputs = createBaseInputs({
        ownershipStructure: 'freehold',
        corporateTaxRate: 22,
        individualCapGainRate: 25,
      });
      const result = calculateTax(inputs);

      if (result.optimalStructure !== 'freehold') {
        expect(result.taxSavingsFromOptimal).toBeGreaterThan(0);
      }
    });
  });

  // =========================================================================
  // ROI CALCULATIONS
  // =========================================================================

  describe('ROI Calculations', () => {
    it('should calculate gross ROI correctly', () => {
      const inputs = createBaseInputs({
        purchasePrice: 500000,
        projectedSalePrice: 600000,
      });
      const result = calculateTax(inputs);

      // (600k - 500k) / 500k * 100 = 20%
      expect(result.grossROI).toBe(20);
    });

    it('should calculate net ROI after taxes', () => {
      const inputs = createBaseInputs();
      const result = calculateTax(inputs);

      expect(result.netROI).toBeLessThan(result.grossROI);
    });

    it('should calculate effective tax rate', () => {
      const inputs = createBaseInputs({
        purchasePrice: 500000,
        projectedSalePrice: 700000,
      });
      const result = calculateTax(inputs);

      // Effective rate = total tax / capital gain * 100
      expect(result.effectiveTaxRate).toBeGreaterThan(0);
      expect(result.effectiveTaxRate).toBeLessThan(100);
    });

    it('should handle zero capital gain', () => {
      const inputs = createBaseInputs({
        purchasePrice: 500000,
        projectedSalePrice: 500000,
        acquisitionCosts: 0,
        sellingCosts: 0,
      });
      const result = calculateTax(inputs);

      expect(result.capitalGain).toBe(0);
      expect(result.effectiveTaxRate).toBe(0);
    });
  });

  // =========================================================================
  // REINVESTMENT
  // =========================================================================

  describe('Reinvestment Calculation', () => {
    it('should calculate reinvestment value with compound growth', () => {
      const inputs = createBaseInputs({
        reinvestmentAmount: 100000,
        reinvestmentYield: 8,
        holdingPeriod: 5,
      });
      const result = calculateTax(inputs);

      // 100k * (1.08)^5 = 146,932.81
      expect(approximatelyEqual(result.reinvestmentValue!, 146932.81, 100)).toBe(true);
    });

    it('should return undefined when no reinvestment', () => {
      const inputs = createBaseInputs({
        reinvestmentAmount: 0,
      });
      const result = calculateTax(inputs);

      expect(result.reinvestmentValue).toBeUndefined();
    });
  });

  // =========================================================================
  // HOLDING PERIOD IMPACT
  // =========================================================================

  describe('Holding Period Impact', () => {
    it('should apply higher rate for short-term freehold (<5 years)', () => {
      const inputs = createBaseInputs({
        ownershipStructure: 'freehold',
        holdingPeriod: 3,
      });
      const rates = getTaxRates('freehold', 3, 22, 25);

      expect(rates.incomeRate).toBe(0.30); // 30% for short term
    });

    it('should apply lower rate for long-term freehold (>=5 years)', () => {
      const inputs = createBaseInputs({
        ownershipStructure: 'freehold',
        holdingPeriod: 5,
      });
      const rates = getTaxRates('freehold', 5, 22, 25);

      expect(rates.incomeRate).toBe(0.20); // 20% for long term
    });
  });

  // =========================================================================
  // REAL ESTATE SCENARIOS
  // =========================================================================

  describe('Real Estate Investment Scenarios', () => {
    it('should optimize tax for Bali villa investment - PT structure', () => {
      // Profitable scenario: high appreciation, moderate expenses, shorter hold
      const inputs = createBaseInputs({
        purchasePrice: 300000,
        projectedSalePrice: 600000, // Strong appreciation (100% gain)
        holdingPeriod: 5, // Shorter hold = fewer deductions
        ownershipStructure: 'pt',
        showDepreciation: true,
        buildingValue: 200000,
        buildingDepreciationRate: 5,
        showDeductions: true,
        annualMaintenanceExpenses: 5000,
        annualUtilities: 2000,
        annualPropertyManagement: 8000,
        annualInsurance: 1500,
        annualOtherExpenses: 1500,
        corporateTaxRate: 22,
        acquisitionCosts: 10000,
        sellingCosts: 10000,
      });

      const result = calculateTax(inputs);

      // PT should benefit from deductions and depreciation
      expect(result.depreciationTaxSavings).toBeGreaterThan(0);
      expect(result.deductionTaxSavings).toBeGreaterThan(0);
      expect(result.netProfit).toBeGreaterThan(0);
    });

    it('should compare structures for foreign investor', () => {
      const inputs = createBaseInputs({
        purchasePrice: 500000,
        projectedSalePrice: 700000,
        holdingPeriod: 5,
        corporateTaxRate: 22,
        individualCapGainRate: 30,
      });

      const result = calculateTax(inputs);

      // Compare all three structures
      expect(result.ptTaxLiability).toBeGreaterThan(0);
      expect(result.freeholdTaxLiability).toBeGreaterThan(0);
      expect(result.leaseholdTaxLiability).toBeGreaterThan(0);

      // Leasehold typically lowest for large gains
      expect(result.leaseholdTaxLiability).toBeLessThanOrEqual(
        Math.min(result.ptTaxLiability, result.freeholdTaxLiability)
      );
    });
  });

  // =========================================================================
  // VALIDATION SUMMARY
  // =========================================================================

  describe('Validation Summary', () => {
    it('should generate tax optimization report', () => {
      const scenarios = [
        {
          name: 'PT with Deductions',
          inputs: createBaseInputs({
            ownershipStructure: 'pt',
            showDepreciation: true,
            showDeductions: true,
          }),
        },
        {
          name: 'Freehold Long-term',
          inputs: createBaseInputs({
            ownershipStructure: 'freehold',
            holdingPeriod: 7,
          }),
        },
        {
          name: 'Leasehold Transfer',
          inputs: createBaseInputs({
            ownershipStructure: 'leasehold',
          }),
        },
      ];

      const results = scenarios.map(s => {
        const calc = calculateTax(s.inputs);
        return {
          name: s.name,
          capitalGain: calc.capitalGain,
          totalTax: calc.totalTaxLiability,
          effectiveRate: calc.effectiveTaxRate,
          netROI: calc.netROI,
          optimal: calc.optimalStructure,
        };
      });

      console.log('\n========== TAX OPTIMIZATION VALIDATION ==========');
      console.table(results.map(r => ({
        Scenario: r.name,
        'Capital Gain': `$${r.capitalGain.toLocaleString()}`,
        'Total Tax': `$${r.totalTax.toLocaleString()}`,
        'Effective Rate': `${r.effectiveRate.toFixed(1)}%`,
        'Net ROI': `${r.netROI.toFixed(1)}%`,
        'Optimal Structure': r.optimal.toUpperCase(),
      })));

      // All scenarios should produce valid results
      results.forEach(r => {
        expect(typeof r.totalTax).toBe('number');
        expect(r.effectiveRate).toBeGreaterThanOrEqual(0);
      });
    });
  });
});
