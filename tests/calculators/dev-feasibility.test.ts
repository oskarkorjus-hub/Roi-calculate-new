/**
 * Development Feasibility Calculator Tests
 *
 * Tests the development feasibility calculations including
 * construction costs, soft costs, financing, and ROI analysis.
 */

import { describe, it, expect } from 'vitest';
import { approximatelyEqual } from '../utils/reference-implementations';

// =========================================================================
// DEV FEASIBILITY CALCULATION FUNCTIONS (extracted from calculator logic)
// =========================================================================

interface DevInputs {
  landSizeM2: number;
  landCost: number;
  costPerM2: number;
  avgVillaSize: number;
  avgSalePrice: number;
  avgAnnualRentalIncome: number;
  holdingPeriod: number;
  numVillas: number;
  architectureFeePercent: number;
  engineeringLegalPercent: number;
  marketingSalesCommissionPercent: number;
  pmFeePercent: number;
  permitsLicenses: number;
  infrastructureCost: number;
  loanPercent: number;
  interestRate: number;
  constructionMonths: number;
  saleSalesCommissionPercent: number;
  capitalGainsTaxPercent: number;
}

interface VillaScenario {
  numVillas: number;
  totalConstructionArea: number;
  constructionCost: number;
  softCosts: number;
  permitsCosts: number;
  financeCharges: number;
  totalProjectCost: number;
  revenueFromSale: number;
  exitCosts: number;
  grossProfit: number;
  roiFlip: number;
  rentalIncome: number;
  roiHold: number;
}

function calculateScenario(inputs: DevInputs, numVillas: number): VillaScenario {
  const {
    landCost,
    costPerM2,
    avgVillaSize,
    avgSalePrice,
    avgAnnualRentalIncome,
    holdingPeriod,
    architectureFeePercent,
    engineeringLegalPercent,
    marketingSalesCommissionPercent,
    pmFeePercent,
    permitsLicenses,
    infrastructureCost,
    loanPercent,
    interestRate,
    constructionMonths,
    saleSalesCommissionPercent,
    capitalGainsTaxPercent,
  } = inputs;

  const totalConstructionArea = numVillas * avgVillaSize;
  const constructionCost = totalConstructionArea * costPerM2;

  const softCostPercent = architectureFeePercent + engineeringLegalPercent +
    marketingSalesCommissionPercent + pmFeePercent;
  const softCosts = constructionCost * (softCostPercent / 100);
  const permitsCosts = permitsLicenses + infrastructureCost;

  let financeCharges = 0;
  if (loanPercent > 0) {
    const loanAmount = (landCost + permitsCosts + constructionCost + softCosts) * (loanPercent / 100);
    const monthlyRate = interestRate / 100 / 12;
    financeCharges = loanAmount * monthlyRate * constructionMonths;
  }

  const totalProjectCost = landCost + permitsCosts + constructionCost + softCosts + financeCharges;
  const revenueFromSale = numVillas * avgSalePrice;

  const salesCommission = revenueFromSale * (saleSalesCommissionPercent / 100);
  const gainOnSale = Math.max(0, revenueFromSale - totalProjectCost);
  const capitalGainsTax = gainOnSale * (capitalGainsTaxPercent / 100);
  const exitCosts = salesCommission + capitalGainsTax;

  const grossProfit = revenueFromSale - totalProjectCost - exitCosts;
  const roiFlip = totalProjectCost > 0 ? (grossProfit / totalProjectCost) * 100 : 0;

  const rentalIncome = numVillas * avgAnnualRentalIncome * holdingPeriod;
  const residualValue = revenueFromSale * 0.85; // 85% of sale price
  const netReturn = rentalIncome + residualValue - totalProjectCost;
  const roiHold = totalProjectCost > 0 ? (netReturn / totalProjectCost) * 100 : 0;

  return {
    numVillas,
    totalConstructionArea,
    constructionCost,
    softCosts,
    permitsCosts,
    financeCharges,
    totalProjectCost,
    revenueFromSale,
    exitCosts,
    grossProfit,
    roiFlip,
    rentalIncome,
    roiHold,
  };
}

describe('Development Feasibility Calculator', () => {
  // =========================================================================
  // BASIC CALCULATION TESTS
  // =========================================================================

  describe('Basic Cost Calculations', () => {
    it('should calculate construction cost correctly', () => {
      const inputs: DevInputs = {
        landSizeM2: 1000,
        landCost: 500000,
        costPerM2: 1500,
        avgVillaSize: 150,
        avgSalePrice: 400000,
        avgAnnualRentalIncome: 30000,
        holdingPeriod: 10,
        numVillas: 2,
        architectureFeePercent: 0,
        engineeringLegalPercent: 0,
        marketingSalesCommissionPercent: 0,
        pmFeePercent: 0,
        permitsLicenses: 0,
        infrastructureCost: 0,
        loanPercent: 0,
        interestRate: 0,
        constructionMonths: 12,
        saleSalesCommissionPercent: 0,
        capitalGainsTaxPercent: 0,
      };

      const result = calculateScenario(inputs, 2);

      // 2 villas * 150m2 * $1500/m2 = $450,000
      expect(result.constructionCost).toBe(450000);
    });

    it('should calculate soft costs correctly', () => {
      const inputs: DevInputs = {
        landSizeM2: 1000,
        landCost: 500000,
        costPerM2: 1000,
        avgVillaSize: 100,
        avgSalePrice: 400000,
        avgAnnualRentalIncome: 30000,
        holdingPeriod: 10,
        numVillas: 2,
        architectureFeePercent: 5,
        engineeringLegalPercent: 3,
        marketingSalesCommissionPercent: 2,
        pmFeePercent: 5,
        permitsLicenses: 0,
        infrastructureCost: 0,
        loanPercent: 0,
        interestRate: 0,
        constructionMonths: 12,
        saleSalesCommissionPercent: 0,
        capitalGainsTaxPercent: 0,
      };

      const result = calculateScenario(inputs, 2);

      // Construction: 2 * 100 * 1000 = 200,000
      // Soft costs: 200,000 * (5+3+2+5)% = 200,000 * 15% = 30,000
      expect(result.softCosts).toBe(30000);
    });

    it('should calculate total project cost correctly', () => {
      const inputs: DevInputs = {
        landSizeM2: 1000,
        landCost: 500000,
        costPerM2: 1000,
        avgVillaSize: 100,
        avgSalePrice: 400000,
        avgAnnualRentalIncome: 30000,
        holdingPeriod: 10,
        numVillas: 2,
        architectureFeePercent: 5,
        engineeringLegalPercent: 0,
        marketingSalesCommissionPercent: 0,
        pmFeePercent: 0,
        permitsLicenses: 20000,
        infrastructureCost: 30000,
        loanPercent: 0,
        interestRate: 0,
        constructionMonths: 12,
        saleSalesCommissionPercent: 0,
        capitalGainsTaxPercent: 0,
      };

      const result = calculateScenario(inputs, 2);

      // Land: 500,000
      // Construction: 200,000
      // Soft costs: 200,000 * 5% = 10,000
      // Permits: 50,000
      // Total: 760,000
      expect(result.totalProjectCost).toBe(760000);
    });
  });

  // =========================================================================
  // FINANCING TESTS
  // =========================================================================

  describe('Financing Calculations', () => {
    it('should calculate finance charges correctly', () => {
      const inputs: DevInputs = {
        landSizeM2: 1000,
        landCost: 500000,
        costPerM2: 1000,
        avgVillaSize: 100,
        avgSalePrice: 400000,
        avgAnnualRentalIncome: 30000,
        holdingPeriod: 10,
        numVillas: 2,
        architectureFeePercent: 0,
        engineeringLegalPercent: 0,
        marketingSalesCommissionPercent: 0,
        pmFeePercent: 0,
        permitsLicenses: 0,
        infrastructureCost: 0,
        loanPercent: 70,
        interestRate: 10,
        constructionMonths: 12,
        saleSalesCommissionPercent: 0,
        capitalGainsTaxPercent: 0,
      };

      const result = calculateScenario(inputs, 2);

      // Total cost before finance: 500,000 + 200,000 = 700,000
      // Loan: 700,000 * 70% = 490,000
      // Monthly rate: 10% / 12 = 0.833%
      // Finance charges: 490,000 * 0.00833 * 12 = 48,972
      expect(approximatelyEqual(result.financeCharges, 49000, 500)).toBe(true);
    });

    it('should handle 0% financing', () => {
      const inputs: DevInputs = {
        landSizeM2: 1000,
        landCost: 500000,
        costPerM2: 1000,
        avgVillaSize: 100,
        avgSalePrice: 400000,
        avgAnnualRentalIncome: 30000,
        holdingPeriod: 10,
        numVillas: 2,
        architectureFeePercent: 0,
        engineeringLegalPercent: 0,
        marketingSalesCommissionPercent: 0,
        pmFeePercent: 0,
        permitsLicenses: 0,
        infrastructureCost: 0,
        loanPercent: 0,
        interestRate: 10,
        constructionMonths: 12,
        saleSalesCommissionPercent: 0,
        capitalGainsTaxPercent: 0,
      };

      const result = calculateScenario(inputs, 2);

      expect(result.financeCharges).toBe(0);
    });
  });

  // =========================================================================
  // FLIP ROI TESTS
  // =========================================================================

  describe('Flip ROI Calculation', () => {
    it('should calculate flip ROI correctly', () => {
      const inputs: DevInputs = {
        landSizeM2: 1000,
        landCost: 200000,
        costPerM2: 1000,
        avgVillaSize: 100,
        avgSalePrice: 300000, // 300k per villa
        avgAnnualRentalIncome: 30000,
        holdingPeriod: 10,
        numVillas: 2,
        architectureFeePercent: 0,
        engineeringLegalPercent: 0,
        marketingSalesCommissionPercent: 0,
        pmFeePercent: 0,
        permitsLicenses: 0,
        infrastructureCost: 0,
        loanPercent: 0,
        interestRate: 0,
        constructionMonths: 12,
        saleSalesCommissionPercent: 0,
        capitalGainsTaxPercent: 0,
      };

      const result = calculateScenario(inputs, 2);

      // Total cost: 200,000 + 200,000 = 400,000
      // Revenue: 2 * 300,000 = 600,000
      // Profit: 600,000 - 400,000 = 200,000
      // ROI: 200,000 / 400,000 * 100 = 50%
      expect(result.roiFlip).toBe(50);
    });

    it('should calculate flip ROI with exit costs', () => {
      const inputs: DevInputs = {
        landSizeM2: 1000,
        landCost: 200000,
        costPerM2: 1000,
        avgVillaSize: 100,
        avgSalePrice: 300000,
        avgAnnualRentalIncome: 30000,
        holdingPeriod: 10,
        numVillas: 2,
        architectureFeePercent: 0,
        engineeringLegalPercent: 0,
        marketingSalesCommissionPercent: 0,
        pmFeePercent: 0,
        permitsLicenses: 0,
        infrastructureCost: 0,
        loanPercent: 0,
        interestRate: 0,
        constructionMonths: 12,
        saleSalesCommissionPercent: 5, // 5% sales commission
        capitalGainsTaxPercent: 10,    // 10% capital gains
      };

      const result = calculateScenario(inputs, 2);

      // Revenue: 600,000
      // Sales commission: 600,000 * 5% = 30,000
      // Profit before tax: 600,000 - 400,000 = 200,000
      // Capital gains tax: 200,000 * 10% = 20,000
      // Exit costs: 30,000 + 20,000 = 50,000
      expect(result.exitCosts).toBe(50000);

      // Net profit: 200,000 - 50,000 = 150,000
      // ROI: 150,000 / 400,000 * 100 = 37.5%
      expect(result.roiFlip).toBe(37.5);
    });
  });

  // =========================================================================
  // HOLD ROI TESTS
  // =========================================================================

  describe('Hold ROI Calculation', () => {
    it('should calculate hold ROI correctly', () => {
      const inputs: DevInputs = {
        landSizeM2: 1000,
        landCost: 200000,
        costPerM2: 1000,
        avgVillaSize: 100,
        avgSalePrice: 300000,
        avgAnnualRentalIncome: 30000, // 30k/year per villa
        holdingPeriod: 10,
        numVillas: 2,
        architectureFeePercent: 0,
        engineeringLegalPercent: 0,
        marketingSalesCommissionPercent: 0,
        pmFeePercent: 0,
        permitsLicenses: 0,
        infrastructureCost: 0,
        loanPercent: 0,
        interestRate: 0,
        constructionMonths: 12,
        saleSalesCommissionPercent: 0,
        capitalGainsTaxPercent: 0,
      };

      const result = calculateScenario(inputs, 2);

      // Total cost: 400,000
      // Rental income: 2 * 30,000 * 10 = 600,000
      // Residual: 600,000 * 85% = 510,000
      // Net return: 600,000 + 510,000 - 400,000 = 710,000
      // ROI: 710,000 / 400,000 * 100 = 177.5%
      expect(result.roiHold).toBe(177.5);
    });
  });

  // =========================================================================
  // REAL ESTATE SCENARIOS
  // =========================================================================

  describe('Real Estate Scenarios', () => {
    it('should analyze Bali villa development', () => {
      // Typical Bali development: 500m2 land, 2 villas
      const inputs: DevInputs = {
        landSizeM2: 500,
        landCost: 150000,
        costPerM2: 1200, // ~$1200/m2 construction
        avgVillaSize: 120,
        avgSalePrice: 350000,
        avgAnnualRentalIncome: 35000,
        holdingPeriod: 10,
        numVillas: 2,
        architectureFeePercent: 5,
        engineeringLegalPercent: 3,
        marketingSalesCommissionPercent: 3,
        pmFeePercent: 4,
        permitsLicenses: 15000,
        infrastructureCost: 25000,
        loanPercent: 50,
        interestRate: 8,
        constructionMonths: 12,
        saleSalesCommissionPercent: 3,
        capitalGainsTaxPercent: 5,
      };

      const result = calculateScenario(inputs, 2);

      // Should be profitable
      expect(result.grossProfit).toBeGreaterThan(0);
      expect(result.roiFlip).toBeGreaterThan(20); // Typical Bali dev ROI
      expect(result.roiHold).toBeGreaterThan(100); // Strong long-term
    });

    it('should analyze boutique hotel development', () => {
      // Larger development: 10 units
      const inputs: DevInputs = {
        landSizeM2: 2000,
        landCost: 500000,
        costPerM2: 1500,
        avgVillaSize: 80, // Smaller units for hotel
        avgSalePrice: 200000,
        avgAnnualRentalIncome: 25000,
        holdingPeriod: 10,
        numVillas: 10,
        architectureFeePercent: 6,
        engineeringLegalPercent: 4,
        marketingSalesCommissionPercent: 5,
        pmFeePercent: 5,
        permitsLicenses: 50000,
        infrastructureCost: 100000,
        loanPercent: 60,
        interestRate: 7,
        constructionMonths: 18,
        saleSalesCommissionPercent: 4,
        capitalGainsTaxPercent: 10,
      };

      const result = calculateScenario(inputs, 10);

      // Total project should be over $2M
      expect(result.totalProjectCost).toBeGreaterThan(2000000);

      // Large development may have tight margins due to financing costs
      expect(typeof result.roiFlip).toBe('number');
    });

    it('should handle break-even scenario', () => {
      // Marginal deal with high costs
      const inputs: DevInputs = {
        landSizeM2: 500,
        landCost: 300000, // Expensive land
        costPerM2: 2000,  // High construction
        avgVillaSize: 100,
        avgSalePrice: 400000,
        avgAnnualRentalIncome: 30000,
        holdingPeriod: 10,
        numVillas: 1,
        architectureFeePercent: 5,
        engineeringLegalPercent: 3,
        marketingSalesCommissionPercent: 5,
        pmFeePercent: 5,
        permitsLicenses: 25000,
        infrastructureCost: 50000,
        loanPercent: 70,
        interestRate: 12, // High interest
        constructionMonths: 14,
        saleSalesCommissionPercent: 5,
        capitalGainsTaxPercent: 15,
      };

      const result = calculateScenario(inputs, 1);

      // May be slightly negative or break-even
      expect(result.roiFlip).toBeLessThan(20);
    });
  });

  // =========================================================================
  // EDGE CASES
  // =========================================================================

  describe('Edge Cases', () => {
    it('should handle 0 villas', () => {
      const inputs: DevInputs = {
        landSizeM2: 500,
        landCost: 200000,
        costPerM2: 1000,
        avgVillaSize: 100,
        avgSalePrice: 300000,
        avgAnnualRentalIncome: 30000,
        holdingPeriod: 10,
        numVillas: 0,
        architectureFeePercent: 5,
        engineeringLegalPercent: 3,
        marketingSalesCommissionPercent: 0,
        pmFeePercent: 0,
        permitsLicenses: 20000,
        infrastructureCost: 0,
        loanPercent: 0,
        interestRate: 0,
        constructionMonths: 12,
        saleSalesCommissionPercent: 0,
        capitalGainsTaxPercent: 0,
      };

      const result = calculateScenario(inputs, 0);

      expect(result.constructionCost).toBe(0);
      expect(result.revenueFromSale).toBe(0);
    });

    it('should handle very high interest rate', () => {
      const inputs: DevInputs = {
        landSizeM2: 500,
        landCost: 200000,
        costPerM2: 1000,
        avgVillaSize: 100,
        avgSalePrice: 300000,
        avgAnnualRentalIncome: 30000,
        holdingPeriod: 10,
        numVillas: 2,
        architectureFeePercent: 0,
        engineeringLegalPercent: 0,
        marketingSalesCommissionPercent: 0,
        pmFeePercent: 0,
        permitsLicenses: 0,
        infrastructureCost: 0,
        loanPercent: 80,
        interestRate: 20, // Very high
        constructionMonths: 24,
        saleSalesCommissionPercent: 0,
        capitalGainsTaxPercent: 0,
      };

      const result = calculateScenario(inputs, 2);

      // Should still calculate
      expect(result.financeCharges).toBeGreaterThan(0);
      expect(typeof result.roiFlip).toBe('number');
    });
  });

  // =========================================================================
  // VALIDATION REPORT
  // =========================================================================

  describe('Validation Summary', () => {
    it('should generate development feasibility report', () => {
      // Profitable development scenario
      const baseInputs: DevInputs = {
        landSizeM2: 1000,
        landCost: 150000,
        costPerM2: 1000,
        avgVillaSize: 150,
        avgSalePrice: 450000,
        avgAnnualRentalIncome: 40000,
        holdingPeriod: 10,
        numVillas: 0,
        architectureFeePercent: 4,
        engineeringLegalPercent: 2,
        marketingSalesCommissionPercent: 2,
        pmFeePercent: 3,
        permitsLicenses: 15000,
        infrastructureCost: 20000,
        loanPercent: 40,
        interestRate: 6,
        constructionMonths: 10,
        saleSalesCommissionPercent: 2,
        capitalGainsTaxPercent: 5,
      };

      const scenarios = [1, 2, 3, 4].map(n => calculateScenario(baseInputs, n));

      console.log('\n========== DEV FEASIBILITY VALIDATION ==========');
      console.table(scenarios.map(s => ({
        Villas: s.numVillas,
        'Total Cost': `$${s.totalProjectCost.toLocaleString()}`,
        Revenue: `$${s.revenueFromSale.toLocaleString()}`,
        'Flip Profit': `$${s.grossProfit.toLocaleString()}`,
        'Flip ROI': `${s.roiFlip.toFixed(1)}%`,
        'Hold ROI': `${s.roiHold.toFixed(1)}%`,
      })));

      // Verify calculations produce numeric results
      scenarios.forEach(s => {
        expect(typeof s.roiFlip).toBe('number');
        expect(typeof s.roiHold).toBe('number');
      });

      // First scenario (1 villa) should be profitable with these inputs
      expect(scenarios[0].roiFlip).toBeGreaterThan(0);
    });
  });
});
