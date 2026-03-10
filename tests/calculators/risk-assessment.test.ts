/**
 * Risk Assessment Calculator Tests
 *
 * Tests the investment risk scoring algorithm including
 * financial, market, regulatory, and property-specific risk factors.
 */

import { describe, it, expect } from 'vitest';
import { approximatelyEqual } from '../utils/reference-implementations';

// =========================================================================
// RISK ASSESSMENT TYPES AND FUNCTIONS (extracted from calculator logic)
// =========================================================================

interface RiskInputs {
  // Financial factors (40% weight)
  projectROI: number;
  cashFlowType: 'stable' | 'moderate' | 'volatile';
  debtServiceCoverageRatio: number;
  leverageRatio: number;
  breakEvenMonths: number;

  // Market factors (30% weight)
  marketStability: 'growing' | 'stable' | 'declining';
  rentalStrategy: 'str' | 'ltr' | 'mixed';
  averageOccupancy: number;
  priceVolatility: 'low' | 'moderate' | 'high';
  demandTrend: 'increasing' | 'stable' | 'decreasing';

  // Regulatory factors (15% weight)
  strAllowed: boolean;
  ownershipType: 'freehold' | 'leasehold' | 'pt-pma';
  taxIncentivesExpiring: boolean;
  permitDifficulty: 'easy' | 'moderate' | 'difficult';

  // Property factors (15% weight)
  propertyAge: number;
  propertyCondition: 'excellent' | 'good' | 'fair' | 'poor';
  locationQuality: 'prime' | 'good' | 'average' | 'remote';
  managementBurden: 'low' | 'moderate' | 'high';
  exitLiquidity: 'high' | 'moderate' | 'low';
}

interface RiskScore {
  overall: number;
  financial: number;
  market: number;
  regulatory: number;
  propertySpecific: number;
}

function calculateRiskScore(inputs: RiskInputs): RiskScore {
  // === FINANCIAL RISK (40% weight, max 80 points) ===
  let financialScore = 0;

  // ROI Quality (0-20 points)
  if (inputs.projectROI >= 20) financialScore += 0;
  else if (inputs.projectROI >= 15) financialScore += 5;
  else if (inputs.projectROI >= 10) financialScore += 10;
  else if (inputs.projectROI >= 5) financialScore += 15;
  else financialScore += 20;

  // Cash Flow Consistency (0-15 points)
  if (inputs.cashFlowType === 'stable') financialScore += 0;
  else if (inputs.cashFlowType === 'moderate') financialScore += 8;
  else financialScore += 15;

  // DSCR (0-15 points)
  if (inputs.debtServiceCoverageRatio >= 1.5) financialScore += 0;
  else if (inputs.debtServiceCoverageRatio >= 1.25) financialScore += 5;
  else if (inputs.debtServiceCoverageRatio >= 1.0) financialScore += 10;
  else financialScore += 15;

  // Leverage Ratio (0-15 points)
  if (inputs.leverageRatio <= 0.5) financialScore += 0;
  else if (inputs.leverageRatio <= 0.7) financialScore += 5;
  else if (inputs.leverageRatio <= 0.8) financialScore += 10;
  else financialScore += 15;

  // Break-even Timeline (0-15 points)
  if (inputs.breakEvenMonths <= 12) financialScore += 0;
  else if (inputs.breakEvenMonths <= 24) financialScore += 5;
  else if (inputs.breakEvenMonths <= 36) financialScore += 10;
  else financialScore += 15;

  // === MARKET RISK (30% weight, max 65 points) ===
  let marketScore = 0;

  // Market Stability (0-15 points)
  if (inputs.marketStability === 'growing') marketScore += 0;
  else if (inputs.marketStability === 'stable') marketScore += 5;
  else marketScore += 15;

  // Seasonal Volatility (0-15 points)
  if (inputs.rentalStrategy === 'ltr') marketScore += 0;
  else if (inputs.rentalStrategy === 'mixed') marketScore += 8;
  else marketScore += 15;

  // Occupancy Risk (0-15 points)
  if (inputs.averageOccupancy >= 75) marketScore += 0;
  else if (inputs.averageOccupancy >= 60) marketScore += 5;
  else if (inputs.averageOccupancy >= 45) marketScore += 10;
  else marketScore += 15;

  // Price Volatility (0-10 points)
  if (inputs.priceVolatility === 'low') marketScore += 0;
  else if (inputs.priceVolatility === 'moderate') marketScore += 5;
  else marketScore += 10;

  // Demand Trend (0-10 points)
  if (inputs.demandTrend === 'increasing') marketScore += 0;
  else if (inputs.demandTrend === 'stable') marketScore += 5;
  else marketScore += 10;

  // === REGULATORY RISK (15% weight, max 44 points) ===
  let regulatoryScore = 0;

  // STR Restrictions (0-10 points)
  if (inputs.strAllowed) regulatoryScore += 0;
  else if (inputs.rentalStrategy === 'str') regulatoryScore += 10;
  else regulatoryScore += 5;

  // Ownership Structure (0-10 points)
  if (inputs.ownershipType === 'freehold') regulatoryScore += 0;
  else if (inputs.ownershipType === 'leasehold') regulatoryScore += 5;
  else regulatoryScore += 8;

  // Tax Law Changes (0-8 points)
  if (inputs.taxIncentivesExpiring) regulatoryScore += 8;
  else regulatoryScore += 0;

  // Permit Difficulty (0-8 points)
  if (inputs.permitDifficulty === 'easy') regulatoryScore += 0;
  else if (inputs.permitDifficulty === 'moderate') regulatoryScore += 4;
  else regulatoryScore += 8;

  // === PROPERTY-SPECIFIC RISK (15% weight, max 44 points) ===
  let propertyScore = 0;

  // Age & Condition (0-10 points)
  if (inputs.propertyAge <= 5 && inputs.propertyCondition === 'excellent') propertyScore += 0;
  else if (inputs.propertyAge <= 10 && ['excellent', 'good'].includes(inputs.propertyCondition)) propertyScore += 3;
  else if (inputs.propertyAge <= 20) propertyScore += 6;
  else propertyScore += 10;

  // Location Quality (0-10 points)
  if (inputs.locationQuality === 'prime') propertyScore += 0;
  else if (inputs.locationQuality === 'good') propertyScore += 3;
  else if (inputs.locationQuality === 'average') propertyScore += 6;
  else propertyScore += 10;

  // Management Burden (0-8 points)
  if (inputs.managementBurden === 'low') propertyScore += 0;
  else if (inputs.managementBurden === 'moderate') propertyScore += 4;
  else propertyScore += 8;

  // Exit Liquidity (0-8 points)
  if (inputs.exitLiquidity === 'high') propertyScore += 0;
  else if (inputs.exitLiquidity === 'moderate') propertyScore += 4;
  else propertyScore += 8;

  // Calculate weighted overall score
  const financialNormalized = (financialScore / 80) * 40;
  const marketNormalized = (marketScore / 65) * 30;
  const regulatoryNormalized = (regulatoryScore / 44) * 15;
  const propertyNormalized = (propertyScore / 44) * 15;

  const overall = financialNormalized + marketNormalized + regulatoryNormalized + propertyNormalized;

  return {
    overall: Math.round(overall),
    financial: Math.round((financialScore / 80) * 100),
    market: Math.round((marketScore / 65) * 100),
    regulatory: Math.round((regulatoryScore / 44) * 100),
    propertySpecific: Math.round((propertyScore / 44) * 100),
  };
}

function getRiskLevel(score: number): 'low' | 'moderate' | 'high' | 'very-high' {
  if (score <= 30) return 'low';
  if (score <= 50) return 'moderate';
  if (score <= 70) return 'high';
  return 'very-high';
}

function getInvestorProfile(score: number): string {
  if (score <= 30) return 'Conservative investors';
  if (score <= 50) return 'Moderate risk investors';
  if (score <= 70) return 'Aggressive investors';
  return 'Speculative investors only';
}

describe('Risk Assessment Calculator', () => {
  // =========================================================================
  // BASIC RISK CALCULATION TESTS
  // =========================================================================

  describe('Basic Risk Calculation', () => {
    it('should calculate low risk for ideal investment', () => {
      const inputs: RiskInputs = {
        projectROI: 25,
        cashFlowType: 'stable',
        debtServiceCoverageRatio: 2.0,
        leverageRatio: 0.3,
        breakEvenMonths: 10,
        marketStability: 'growing',
        rentalStrategy: 'ltr',
        averageOccupancy: 85,
        priceVolatility: 'low',
        demandTrend: 'increasing',
        strAllowed: true,
        ownershipType: 'freehold',
        taxIncentivesExpiring: false,
        permitDifficulty: 'easy',
        propertyAge: 3,
        propertyCondition: 'excellent',
        locationQuality: 'prime',
        managementBurden: 'low',
        exitLiquidity: 'high',
      };

      const result = calculateRiskScore(inputs);

      expect(result.overall).toBeLessThan(20);
      expect(getRiskLevel(result.overall)).toBe('low');
    });

    it('should calculate high risk for poor investment', () => {
      const inputs: RiskInputs = {
        projectROI: 3,
        cashFlowType: 'volatile',
        debtServiceCoverageRatio: 0.8,
        leverageRatio: 0.9,
        breakEvenMonths: 48,
        marketStability: 'declining',
        rentalStrategy: 'str',
        averageOccupancy: 35,
        priceVolatility: 'high',
        demandTrend: 'decreasing',
        strAllowed: false,
        ownershipType: 'pt-pma',
        taxIncentivesExpiring: true,
        permitDifficulty: 'difficult',
        propertyAge: 30,
        propertyCondition: 'poor',
        locationQuality: 'remote',
        managementBurden: 'high',
        exitLiquidity: 'low',
      };

      const result = calculateRiskScore(inputs);

      expect(result.overall).toBeGreaterThan(70);
      expect(getRiskLevel(result.overall)).toBe('very-high');
    });

    it('should calculate moderate risk for average investment', () => {
      const inputs: RiskInputs = {
        projectROI: 12,
        cashFlowType: 'moderate',
        debtServiceCoverageRatio: 1.3,
        leverageRatio: 0.6,
        breakEvenMonths: 20,
        marketStability: 'stable',
        rentalStrategy: 'mixed',
        averageOccupancy: 65,
        priceVolatility: 'moderate',
        demandTrend: 'stable',
        strAllowed: true,
        ownershipType: 'leasehold',
        taxIncentivesExpiring: false,
        permitDifficulty: 'moderate',
        propertyAge: 8,
        propertyCondition: 'good',
        locationQuality: 'good',
        managementBurden: 'moderate',
        exitLiquidity: 'moderate',
      };

      const result = calculateRiskScore(inputs);

      expect(result.overall).toBeGreaterThan(30);
      expect(result.overall).toBeLessThan(60);
      expect(getRiskLevel(result.overall)).toBe('moderate');
    });
  });

  // =========================================================================
  // FINANCIAL RISK TESTS
  // =========================================================================

  describe('Financial Risk Factors', () => {
    it('should penalize low ROI', () => {
      const highRoiInputs = createBaseInputs({ projectROI: 25 });
      const lowRoiInputs = createBaseInputs({ projectROI: 3 });

      const highRoiScore = calculateRiskScore(highRoiInputs);
      const lowRoiScore = calculateRiskScore(lowRoiInputs);

      expect(lowRoiScore.financial).toBeGreaterThan(highRoiScore.financial);
      expect(lowRoiScore.overall).toBeGreaterThan(highRoiScore.overall);
    });

    it('should penalize volatile cash flow', () => {
      const stableInputs = createBaseInputs({ cashFlowType: 'stable' });
      const volatileInputs = createBaseInputs({ cashFlowType: 'volatile' });

      const stableScore = calculateRiskScore(stableInputs);
      const volatileScore = calculateRiskScore(volatileInputs);

      expect(volatileScore.financial).toBeGreaterThan(stableScore.financial);
    });

    it('should penalize high leverage', () => {
      const lowLeverageInputs = createBaseInputs({ leverageRatio: 0.4 });
      const highLeverageInputs = createBaseInputs({ leverageRatio: 0.85 });

      const lowScore = calculateRiskScore(lowLeverageInputs);
      const highScore = calculateRiskScore(highLeverageInputs);

      expect(highScore.financial).toBeGreaterThan(lowScore.financial);
    });

    it('should penalize low DSCR', () => {
      const healthyDscr = createBaseInputs({ debtServiceCoverageRatio: 1.8 });
      const lowDscr = createBaseInputs({ debtServiceCoverageRatio: 0.9 });

      const healthyScore = calculateRiskScore(healthyDscr);
      const lowScore = calculateRiskScore(lowDscr);

      expect(lowScore.financial).toBeGreaterThan(healthyScore.financial);
    });
  });

  // =========================================================================
  // MARKET RISK TESTS
  // =========================================================================

  describe('Market Risk Factors', () => {
    it('should penalize declining market', () => {
      const growingInputs = createBaseInputs({ marketStability: 'growing' });
      const decliningInputs = createBaseInputs({ marketStability: 'declining' });

      const growingScore = calculateRiskScore(growingInputs);
      const decliningScore = calculateRiskScore(decliningInputs);

      expect(decliningScore.market).toBeGreaterThan(growingScore.market);
    });

    it('should penalize STR strategy', () => {
      const ltrInputs = createBaseInputs({ rentalStrategy: 'ltr' });
      const strInputs = createBaseInputs({ rentalStrategy: 'str' });

      const ltrScore = calculateRiskScore(ltrInputs);
      const strScore = calculateRiskScore(strInputs);

      expect(strScore.market).toBeGreaterThan(ltrScore.market);
    });

    it('should penalize low occupancy', () => {
      const highOcc = createBaseInputs({ averageOccupancy: 80 });
      const lowOcc = createBaseInputs({ averageOccupancy: 40 });

      const highScore = calculateRiskScore(highOcc);
      const lowScore = calculateRiskScore(lowOcc);

      expect(lowScore.market).toBeGreaterThan(highScore.market);
    });
  });

  // =========================================================================
  // REGULATORY RISK TESTS
  // =========================================================================

  describe('Regulatory Risk Factors', () => {
    it('should penalize STR restrictions for STR strategy', () => {
      const allowedInputs = createBaseInputs({ strAllowed: true, rentalStrategy: 'str' });
      const restrictedInputs = createBaseInputs({ strAllowed: false, rentalStrategy: 'str' });

      const allowedScore = calculateRiskScore(allowedInputs);
      const restrictedScore = calculateRiskScore(restrictedInputs);

      expect(restrictedScore.regulatory).toBeGreaterThan(allowedScore.regulatory);
    });

    it('should penalize PT PMA ownership', () => {
      const freeholdInputs = createBaseInputs({ ownershipType: 'freehold' });
      const ptPmaInputs = createBaseInputs({ ownershipType: 'pt-pma' });

      const freeholdScore = calculateRiskScore(freeholdInputs);
      const ptPmaScore = calculateRiskScore(ptPmaInputs);

      expect(ptPmaScore.regulatory).toBeGreaterThan(freeholdScore.regulatory);
    });

    it('should penalize expiring tax incentives', () => {
      const stableInputs = createBaseInputs({ taxIncentivesExpiring: false });
      const expiringInputs = createBaseInputs({ taxIncentivesExpiring: true });

      const stableScore = calculateRiskScore(stableInputs);
      const expiringScore = calculateRiskScore(expiringInputs);

      expect(expiringScore.regulatory).toBeGreaterThan(stableScore.regulatory);
    });
  });

  // =========================================================================
  // PROPERTY RISK TESTS
  // =========================================================================

  describe('Property Risk Factors', () => {
    it('should penalize old properties', () => {
      const newInputs = createBaseInputs({ propertyAge: 2, propertyCondition: 'excellent' });
      const oldInputs = createBaseInputs({ propertyAge: 25, propertyCondition: 'fair' });

      const newScore = calculateRiskScore(newInputs);
      const oldScore = calculateRiskScore(oldInputs);

      expect(oldScore.propertySpecific).toBeGreaterThan(newScore.propertySpecific);
    });

    it('should penalize remote locations', () => {
      const primeInputs = createBaseInputs({ locationQuality: 'prime' });
      const remoteInputs = createBaseInputs({ locationQuality: 'remote' });

      const primeScore = calculateRiskScore(primeInputs);
      const remoteScore = calculateRiskScore(remoteInputs);

      expect(remoteScore.propertySpecific).toBeGreaterThan(primeScore.propertySpecific);
    });

    it('should penalize low liquidity', () => {
      const highLiqInputs = createBaseInputs({ exitLiquidity: 'high' });
      const lowLiqInputs = createBaseInputs({ exitLiquidity: 'low' });

      const highScore = calculateRiskScore(highLiqInputs);
      const lowScore = calculateRiskScore(lowLiqInputs);

      expect(lowScore.propertySpecific).toBeGreaterThan(highScore.propertySpecific);
    });
  });

  // =========================================================================
  // INVESTOR PROFILE TESTS
  // =========================================================================

  describe('Investor Profile', () => {
    it('should recommend conservative investors for low risk', () => {
      expect(getInvestorProfile(20)).toBe('Conservative investors');
    });

    it('should recommend moderate risk investors for moderate risk', () => {
      expect(getInvestorProfile(40)).toBe('Moderate risk investors');
    });

    it('should recommend aggressive investors for high risk', () => {
      expect(getInvestorProfile(60)).toBe('Aggressive investors');
    });

    it('should warn speculative only for very high risk', () => {
      expect(getInvestorProfile(85)).toBe('Speculative investors only');
    });
  });

  // =========================================================================
  // REAL ESTATE SCENARIOS
  // =========================================================================

  describe('Real Estate Scenarios', () => {
    it('should assess Bali villa investment risk', () => {
      const baliVilla: RiskInputs = {
        projectROI: 18,
        cashFlowType: 'moderate',
        debtServiceCoverageRatio: 1.4,
        leverageRatio: 0.5,
        breakEvenMonths: 18,
        marketStability: 'growing',
        rentalStrategy: 'str',
        averageOccupancy: 65,
        priceVolatility: 'moderate',
        demandTrend: 'increasing',
        strAllowed: true,
        ownershipType: 'leasehold',
        taxIncentivesExpiring: false,
        permitDifficulty: 'moderate',
        propertyAge: 5,
        propertyCondition: 'excellent',
        locationQuality: 'prime',
        managementBurden: 'high',
        exitLiquidity: 'moderate',
      };

      const result = calculateRiskScore(baliVilla);

      // Bali villa: moderate risk due to STR volatility and leasehold
      expect(result.overall).toBeGreaterThan(25);
      expect(result.overall).toBeLessThan(55);
    });

    it('should assess stable commercial investment', () => {
      const commercial: RiskInputs = {
        projectROI: 8,
        cashFlowType: 'stable',
        debtServiceCoverageRatio: 1.6,
        leverageRatio: 0.6,
        breakEvenMonths: 36,
        marketStability: 'stable',
        rentalStrategy: 'ltr',
        averageOccupancy: 90,
        priceVolatility: 'low',
        demandTrend: 'stable',
        strAllowed: true,
        ownershipType: 'freehold',
        taxIncentivesExpiring: false,
        permitDifficulty: 'easy',
        propertyAge: 10,
        propertyCondition: 'good',
        locationQuality: 'good',
        managementBurden: 'low',
        exitLiquidity: 'high',
      };

      const result = calculateRiskScore(commercial);

      // Commercial LTR: lower risk despite lower ROI
      expect(result.overall).toBeLessThan(40);
      expect(result.market).toBeLessThan(30);
    });

    it('should assess speculative land investment', () => {
      const land: RiskInputs = {
        projectROI: 0,
        cashFlowType: 'volatile',
        debtServiceCoverageRatio: 0,
        leverageRatio: 0.4,
        breakEvenMonths: 60,
        marketStability: 'stable',
        rentalStrategy: 'str',
        averageOccupancy: 0,
        priceVolatility: 'high',
        demandTrend: 'stable',
        strAllowed: true,
        ownershipType: 'leasehold',
        taxIncentivesExpiring: false,
        permitDifficulty: 'difficult',
        propertyAge: 0,
        propertyCondition: 'good',
        locationQuality: 'average',
        managementBurden: 'low',
        exitLiquidity: 'low',
      };

      const result = calculateRiskScore(land);

      // Land: high risk due to no income
      expect(result.overall).toBeGreaterThan(50);
    });
  });

  // =========================================================================
  // WEIGHT DISTRIBUTION TESTS
  // =========================================================================

  describe('Weight Distribution', () => {
    it('should weight financial factors at 40%', () => {
      const maxFinancialRisk = createBaseInputs({
        projectROI: 0,
        cashFlowType: 'volatile',
        debtServiceCoverageRatio: 0.5,
        leverageRatio: 0.95,
        breakEvenMonths: 60,
      });

      const result = calculateRiskScore(maxFinancialRisk);

      // Financial at 100% risk = 40 points contribution
      expect(result.financial).toBeGreaterThan(80);
    });

    it('should weight market factors at 30%', () => {
      const maxMarketRisk = createBaseInputs({
        marketStability: 'declining',
        rentalStrategy: 'str',
        averageOccupancy: 30,
        priceVolatility: 'high',
        demandTrend: 'decreasing',
      });

      const result = calculateRiskScore(maxMarketRisk);

      expect(result.market).toBeGreaterThan(80);
    });
  });

  // =========================================================================
  // VALIDATION REPORT
  // =========================================================================

  describe('Validation Summary', () => {
    it('should generate risk assessment report', () => {
      const scenarios = [
        { name: 'Low Risk Villa', inputs: createLowRiskInputs() },
        { name: 'Moderate Risk STR', inputs: createModerateRiskInputs() },
        { name: 'High Risk Development', inputs: createHighRiskInputs() },
      ];

      const results = scenarios.map(s => ({
        Scenario: s.name,
        ...calculateRiskScore(s.inputs),
        Level: getRiskLevel(calculateRiskScore(s.inputs).overall),
      }));

      console.log('\n========== RISK ASSESSMENT VALIDATION ==========');
      console.table(results.map(r => ({
        Scenario: r.Scenario,
        Overall: r.overall,
        Financial: `${r.financial}%`,
        Market: `${r.market}%`,
        Regulatory: `${r.regulatory}%`,
        Property: `${r.propertySpecific}%`,
        Level: r.Level,
      })));

      // Verify ordering
      expect(results[0].overall).toBeLessThan(results[1].overall);
      expect(results[1].overall).toBeLessThan(results[2].overall);
    });
  });
});

// =========================================================================
// HELPER FUNCTIONS
// =========================================================================

function createBaseInputs(overrides: Partial<RiskInputs> = {}): RiskInputs {
  return {
    projectROI: 15,
    cashFlowType: 'moderate',
    debtServiceCoverageRatio: 1.3,
    leverageRatio: 0.6,
    breakEvenMonths: 24,
    marketStability: 'stable',
    rentalStrategy: 'mixed',
    averageOccupancy: 60,
    priceVolatility: 'moderate',
    demandTrend: 'stable',
    strAllowed: true,
    ownershipType: 'leasehold',
    taxIncentivesExpiring: false,
    permitDifficulty: 'moderate',
    propertyAge: 10,
    propertyCondition: 'good',
    locationQuality: 'good',
    managementBurden: 'moderate',
    exitLiquidity: 'moderate',
    ...overrides,
  };
}

function createLowRiskInputs(): RiskInputs {
  return {
    projectROI: 20,
    cashFlowType: 'stable',
    debtServiceCoverageRatio: 1.8,
    leverageRatio: 0.4,
    breakEvenMonths: 12,
    marketStability: 'growing',
    rentalStrategy: 'ltr',
    averageOccupancy: 80,
    priceVolatility: 'low',
    demandTrend: 'increasing',
    strAllowed: true,
    ownershipType: 'freehold',
    taxIncentivesExpiring: false,
    permitDifficulty: 'easy',
    propertyAge: 3,
    propertyCondition: 'excellent',
    locationQuality: 'prime',
    managementBurden: 'low',
    exitLiquidity: 'high',
  };
}

function createModerateRiskInputs(): RiskInputs {
  return {
    projectROI: 15,
    cashFlowType: 'moderate',
    debtServiceCoverageRatio: 1.25,
    leverageRatio: 0.65,
    breakEvenMonths: 24,
    marketStability: 'stable',
    rentalStrategy: 'str',
    averageOccupancy: 60,
    priceVolatility: 'moderate',
    demandTrend: 'stable',
    strAllowed: true,
    ownershipType: 'leasehold',
    taxIncentivesExpiring: false,
    permitDifficulty: 'moderate',
    propertyAge: 8,
    propertyCondition: 'good',
    locationQuality: 'good',
    managementBurden: 'moderate',
    exitLiquidity: 'moderate',
  };
}

function createHighRiskInputs(): RiskInputs {
  return {
    projectROI: 5,
    cashFlowType: 'volatile',
    debtServiceCoverageRatio: 0.9,
    leverageRatio: 0.85,
    breakEvenMonths: 48,
    marketStability: 'declining',
    rentalStrategy: 'str',
    averageOccupancy: 40,
    priceVolatility: 'high',
    demandTrend: 'decreasing',
    strAllowed: false,
    ownershipType: 'pt-pma',
    taxIncentivesExpiring: true,
    permitDifficulty: 'difficult',
    propertyAge: 20,
    propertyCondition: 'fair',
    locationQuality: 'average',
    managementBurden: 'high',
    exitLiquidity: 'low',
  };
}
