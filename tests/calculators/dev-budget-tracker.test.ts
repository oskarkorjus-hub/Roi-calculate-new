/**
 * Development Budget Tracker Tests
 *
 * Tests the budget tracking calculations including
 * variance analysis, health scoring, and timeline progress.
 */

import { describe, it, expect } from 'vitest';
import { approximatelyEqual } from '../utils/reference-implementations';

// =========================================================================
// BUDGET TRACKER CALCULATION FUNCTIONS (extracted from calculator logic)
// =========================================================================

interface BudgetInputs {
  landCost: number;
  landActual: number;
  constructionHard: number;
  constructionHardActual: number;
  softCosts: number;
  softCostsActual: number;
  contingency: number;
  contingencyActual: number;
  financing: number;
  financingActual: number;
  marketing: number;
  marketingActual: number;
  currentMonth: number;
  totalProjectDuration: number;
  phases: ConstructionPhase[];
}

interface ConstructionPhase {
  id: string;
  name: string;
  startMonth: number;
  duration: number;
  budgetPercent: number;
  status: 'not-started' | 'in-progress' | 'completed' | 'delayed';
  completionPercent: number;
}

interface BudgetCalculations {
  totalBudgeted: number;
  totalActual: number;
  variance: number;
  variancePercent: number;
  expectedSpend: number;
  spendVariance: number;
  completedPhases: number;
  delayedPhases: number;
  overallCompletion: number;
  contingencyRemaining: number;
  contingencyUsedPercent: number;
  healthScore: number;
  timelineProgress: number;
}

function calculateBudgetMetrics(inputs: BudgetInputs): BudgetCalculations {
  const totalBudgeted = inputs.landCost + inputs.constructionHard + inputs.softCosts +
    inputs.contingency + inputs.financing + inputs.marketing;
  const totalActual = inputs.landActual + inputs.constructionHardActual + inputs.softCostsActual +
    inputs.contingencyActual + inputs.financingActual + inputs.marketingActual;
  const variance = totalActual - totalBudgeted;
  const variancePercent = totalBudgeted > 0 ? (variance / totalBudgeted) * 100 : 0;

  // Expected spend based on timeline
  const timelineProgress = inputs.totalProjectDuration > 0
    ? inputs.currentMonth / inputs.totalProjectDuration
    : 0;
  const expectedSpend = totalBudgeted * timelineProgress;
  const spendVariance = totalActual - expectedSpend;

  // Phase completion
  const completedPhases = inputs.phases.filter(p => p.status === 'completed').length;
  const delayedPhases = inputs.phases.filter(p => p.status === 'delayed').length;
  const overallCompletion = inputs.phases.reduce((sum, p) =>
    sum + (p.completionPercent * p.budgetPercent / 100), 0);

  // Contingency analysis
  const contingencyRemaining = inputs.contingency - inputs.contingencyActual;
  const contingencyUsedPercent = inputs.contingency > 0
    ? (inputs.contingencyActual / inputs.contingency) * 100
    : 0;

  // Project health score
  let healthScore = 100;
  if (variancePercent > 0) healthScore -= Math.min(variancePercent * 2, 30);
  if (delayedPhases > 0) healthScore -= delayedPhases * 10;
  if (contingencyUsedPercent > 50) healthScore -= (contingencyUsedPercent - 50) / 2;
  healthScore = Math.max(0, Math.min(100, healthScore));

  return {
    totalBudgeted,
    totalActual,
    variance,
    variancePercent,
    expectedSpend,
    spendVariance,
    completedPhases,
    delayedPhases,
    overallCompletion,
    contingencyRemaining,
    contingencyUsedPercent,
    healthScore,
    timelineProgress: timelineProgress * 100,
  };
}

function getHealthLabel(score: number): string {
  if (score >= 80) return 'Healthy';
  if (score >= 60) return 'At Risk';
  return 'Critical';
}

function createDefaultPhases(): ConstructionPhase[] {
  return [
    { id: '1', name: 'Site Preparation', startMonth: 1, duration: 1, budgetPercent: 5, status: 'completed', completionPercent: 100 },
    { id: '2', name: 'Foundation', startMonth: 2, duration: 2, budgetPercent: 15, status: 'completed', completionPercent: 100 },
    { id: '3', name: 'Structure', startMonth: 4, duration: 3, budgetPercent: 25, status: 'in-progress', completionPercent: 60 },
    { id: '4', name: 'MEP Rough-in', startMonth: 6, duration: 2, budgetPercent: 15, status: 'not-started', completionPercent: 0 },
    { id: '5', name: 'Interior Finish', startMonth: 8, duration: 3, budgetPercent: 25, status: 'not-started', completionPercent: 0 },
    { id: '6', name: 'Landscaping & Final', startMonth: 10, duration: 2, budgetPercent: 15, status: 'not-started', completionPercent: 0 },
  ];
}

function createBaseInputs(overrides: Partial<BudgetInputs> = {}): BudgetInputs {
  return {
    landCost: 200000,
    landActual: 200000,
    constructionHard: 500000,
    constructionHardActual: 480000,
    softCosts: 50000,
    softCostsActual: 55000,
    contingency: 75000,
    contingencyActual: 20000,
    financing: 60000,
    financingActual: 58000,
    marketing: 30000,
    marketingActual: 25000,
    currentMonth: 5,
    totalProjectDuration: 12,
    phases: createDefaultPhases(),
    ...overrides,
  };
}

describe('Development Budget Tracker', () => {
  // =========================================================================
  // BUDGET TOTALS
  // =========================================================================

  describe('Budget Totals Calculation', () => {
    it('should calculate total budgeted correctly', () => {
      const inputs = createBaseInputs();
      const result = calculateBudgetMetrics(inputs);

      // 200k + 500k + 50k + 75k + 60k + 30k = 915k
      expect(result.totalBudgeted).toBe(915000);
    });

    it('should calculate total actual correctly', () => {
      const inputs = createBaseInputs();
      const result = calculateBudgetMetrics(inputs);

      // 200k + 480k + 55k + 20k + 58k + 25k = 838k
      expect(result.totalActual).toBe(838000);
    });

    it('should handle zero budgets', () => {
      const inputs = createBaseInputs({
        landCost: 0,
        constructionHard: 0,
        softCosts: 0,
        contingency: 0,
        financing: 0,
        marketing: 0,
      });
      const result = calculateBudgetMetrics(inputs);

      expect(result.totalBudgeted).toBe(0);
      expect(result.variancePercent).toBe(0);
    });
  });

  // =========================================================================
  // VARIANCE ANALYSIS
  // =========================================================================

  describe('Variance Analysis', () => {
    it('should calculate positive variance (over budget)', () => {
      const inputs = createBaseInputs({
        constructionHardActual: 600000, // Over by 100k
      });
      const result = calculateBudgetMetrics(inputs);

      expect(result.variance).toBeGreaterThan(0);
      expect(result.variancePercent).toBeGreaterThan(0);
    });

    it('should calculate negative variance (under budget)', () => {
      const inputs = createBaseInputs();
      const result = calculateBudgetMetrics(inputs);

      // Total actual (838k) < Total budgeted (915k)
      expect(result.variance).toBeLessThan(0);
      expect(result.variancePercent).toBeLessThan(0);
    });

    it('should calculate variance percent correctly', () => {
      const inputs = createBaseInputs({
        landCost: 100000,
        landActual: 110000,
        constructionHard: 0,
        constructionHardActual: 0,
        softCosts: 0,
        softCostsActual: 0,
        contingency: 0,
        contingencyActual: 0,
        financing: 0,
        financingActual: 0,
        marketing: 0,
        marketingActual: 0,
      });
      const result = calculateBudgetMetrics(inputs);

      // 10k over on 100k budget = 10%
      expect(result.variancePercent).toBe(10);
    });
  });

  // =========================================================================
  // TIMELINE PROGRESS
  // =========================================================================

  describe('Timeline Progress', () => {
    it('should calculate timeline progress correctly', () => {
      const inputs = createBaseInputs({
        currentMonth: 6,
        totalProjectDuration: 12,
      });
      const result = calculateBudgetMetrics(inputs);

      expect(result.timelineProgress).toBe(50);
    });

    it('should calculate expected spend based on progress', () => {
      const inputs = createBaseInputs({
        currentMonth: 6,
        totalProjectDuration: 12,
      });
      const result = calculateBudgetMetrics(inputs);

      // 50% progress * 915k budget = 457.5k expected
      expect(result.expectedSpend).toBe(457500);
    });

    it('should handle zero duration', () => {
      const inputs = createBaseInputs({
        totalProjectDuration: 0,
      });
      const result = calculateBudgetMetrics(inputs);

      expect(result.timelineProgress).toBe(0);
      expect(result.expectedSpend).toBe(0);
    });

    it('should calculate spend variance', () => {
      const inputs = createBaseInputs({
        currentMonth: 6,
        totalProjectDuration: 12,
      });
      const result = calculateBudgetMetrics(inputs);

      // Actual (838k) - Expected (457.5k) = 380.5k ahead of expected
      expect(result.spendVariance).toBeGreaterThan(0);
    });
  });

  // =========================================================================
  // PHASE COMPLETION
  // =========================================================================

  describe('Phase Completion', () => {
    it('should count completed phases', () => {
      const inputs = createBaseInputs();
      const result = calculateBudgetMetrics(inputs);

      // Default phases have 2 completed
      expect(result.completedPhases).toBe(2);
    });

    it('should count delayed phases', () => {
      const phases = createDefaultPhases();
      phases[3].status = 'delayed';
      phases[4].status = 'delayed';

      const inputs = createBaseInputs({ phases });
      const result = calculateBudgetMetrics(inputs);

      expect(result.delayedPhases).toBe(2);
    });

    it('should calculate overall completion weighted by budget', () => {
      const phases: ConstructionPhase[] = [
        { id: '1', name: 'Phase A', startMonth: 1, duration: 2, budgetPercent: 50, status: 'completed', completionPercent: 100 },
        { id: '2', name: 'Phase B', startMonth: 3, duration: 2, budgetPercent: 50, status: 'in-progress', completionPercent: 50 },
      ];

      const inputs = createBaseInputs({ phases });
      const result = calculateBudgetMetrics(inputs);

      // (100 * 50/100) + (50 * 50/100) = 50 + 25 = 75%
      expect(result.overallCompletion).toBe(75);
    });
  });

  // =========================================================================
  // CONTINGENCY TRACKING
  // =========================================================================

  describe('Contingency Tracking', () => {
    it('should calculate contingency remaining', () => {
      const inputs = createBaseInputs({
        contingency: 100000,
        contingencyActual: 30000,
      });
      const result = calculateBudgetMetrics(inputs);

      expect(result.contingencyRemaining).toBe(70000);
    });

    it('should calculate contingency used percent', () => {
      const inputs = createBaseInputs({
        contingency: 100000,
        contingencyActual: 25000,
      });
      const result = calculateBudgetMetrics(inputs);

      expect(result.contingencyUsedPercent).toBe(25);
    });

    it('should handle zero contingency budget', () => {
      const inputs = createBaseInputs({
        contingency: 0,
        contingencyActual: 0,
      });
      const result = calculateBudgetMetrics(inputs);

      expect(result.contingencyUsedPercent).toBe(0);
    });

    it('should handle over-used contingency', () => {
      const inputs = createBaseInputs({
        contingency: 50000,
        contingencyActual: 75000,
      });
      const result = calculateBudgetMetrics(inputs);

      expect(result.contingencyRemaining).toBe(-25000);
      expect(result.contingencyUsedPercent).toBe(150);
    });
  });

  // =========================================================================
  // HEALTH SCORE
  // =========================================================================

  describe('Health Score Calculation', () => {
    it('should start at 100 for perfect project', () => {
      const phases: ConstructionPhase[] = [
        { id: '1', name: 'Phase A', startMonth: 1, duration: 2, budgetPercent: 100, status: 'completed', completionPercent: 100 },
      ];

      const inputs = createBaseInputs({
        landCost: 100000,
        landActual: 100000, // Exact budget
        constructionHard: 0,
        constructionHardActual: 0,
        softCosts: 0,
        softCostsActual: 0,
        contingency: 50000,
        contingencyActual: 0, // No contingency used
        financing: 0,
        financingActual: 0,
        marketing: 0,
        marketingActual: 0,
        phases,
      });
      const result = calculateBudgetMetrics(inputs);

      expect(result.healthScore).toBe(100);
    });

    it('should penalize budget overruns', () => {
      const phases: ConstructionPhase[] = [
        { id: '1', name: 'Phase A', startMonth: 1, duration: 2, budgetPercent: 100, status: 'completed', completionPercent: 100 },
      ];

      const inputs = createBaseInputs({
        landCost: 100000,
        landActual: 120000, // 20% over budget
        constructionHard: 0,
        constructionHardActual: 0,
        softCosts: 0,
        softCostsActual: 0,
        contingency: 0, // No contingency budget to avoid confusing the totals
        contingencyActual: 0,
        financing: 0,
        financingActual: 0,
        marketing: 0,
        marketingActual: 0,
        phases,
      });
      const result = calculateBudgetMetrics(inputs);

      // Budget: 100k, Actual: 120k, Variance: 20%
      // 20% variance * 2 = 40 points deduction, capped at 30
      expect(result.variance).toBe(20000);
      expect(result.variancePercent).toBe(20);
      expect(result.healthScore).toBeLessThan(100);
      expect(result.healthScore).toBeGreaterThanOrEqual(70);
    });

    it('should penalize delayed phases', () => {
      const phases: ConstructionPhase[] = [
        { id: '1', name: 'Phase A', startMonth: 1, duration: 2, budgetPercent: 50, status: 'completed', completionPercent: 100 },
        { id: '2', name: 'Phase B', startMonth: 3, duration: 2, budgetPercent: 50, status: 'delayed', completionPercent: 50 },
      ];

      const inputs = createBaseInputs({
        landCost: 100000,
        landActual: 100000,
        constructionHard: 0,
        constructionHardActual: 0,
        softCosts: 0,
        softCostsActual: 0,
        contingency: 50000,
        contingencyActual: 0,
        financing: 0,
        financingActual: 0,
        marketing: 0,
        marketingActual: 0,
        phases,
      });
      const result = calculateBudgetMetrics(inputs);

      // 1 delayed phase = -10 points
      expect(result.healthScore).toBe(90);
    });

    it('should penalize high contingency usage', () => {
      const phases: ConstructionPhase[] = [
        { id: '1', name: 'Phase A', startMonth: 1, duration: 2, budgetPercent: 100, status: 'completed', completionPercent: 100 },
      ];

      const inputs = createBaseInputs({
        landCost: 100000,
        landActual: 100000,
        constructionHard: 0,
        constructionHardActual: 0,
        softCosts: 0,
        softCostsActual: 0,
        contingency: 100000,
        contingencyActual: 80000, // 80% used
        financing: 0,
        financingActual: 0,
        marketing: 0,
        marketingActual: 0,
        phases,
      });
      const result = calculateBudgetMetrics(inputs);

      // (80 - 50) / 2 = 15 points deduction
      expect(result.healthScore).toBe(85);
    });

    it('should clamp health score between 0 and 100', () => {
      const phases: ConstructionPhase[] = [
        { id: '1', name: 'Phase A', startMonth: 1, duration: 2, budgetPercent: 25, status: 'delayed', completionPercent: 0 },
        { id: '2', name: 'Phase B', startMonth: 3, duration: 2, budgetPercent: 25, status: 'delayed', completionPercent: 0 },
        { id: '3', name: 'Phase C', startMonth: 5, duration: 2, budgetPercent: 25, status: 'delayed', completionPercent: 0 },
        { id: '4', name: 'Phase D', startMonth: 7, duration: 2, budgetPercent: 25, status: 'delayed', completionPercent: 0 },
      ];

      const inputs = createBaseInputs({
        landCost: 100000,
        landActual: 200000, // 100% over
        constructionHard: 0,
        constructionHardActual: 0,
        softCosts: 0,
        softCostsActual: 0,
        contingency: 50000,
        contingencyActual: 50000, // 100% used
        financing: 0,
        financingActual: 0,
        marketing: 0,
        marketingActual: 0,
        phases,
      });
      const result = calculateBudgetMetrics(inputs);

      expect(result.healthScore).toBeGreaterThanOrEqual(0);
      expect(result.healthScore).toBeLessThanOrEqual(100);
    });
  });

  // =========================================================================
  // HEALTH LABELS
  // =========================================================================

  describe('Health Labels', () => {
    it('should return Healthy for score >= 80', () => {
      expect(getHealthLabel(100)).toBe('Healthy');
      expect(getHealthLabel(80)).toBe('Healthy');
    });

    it('should return At Risk for score 60-79', () => {
      expect(getHealthLabel(79)).toBe('At Risk');
      expect(getHealthLabel(60)).toBe('At Risk');
    });

    it('should return Critical for score < 60', () => {
      expect(getHealthLabel(59)).toBe('Critical');
      expect(getHealthLabel(0)).toBe('Critical');
    });
  });

  // =========================================================================
  // REAL ESTATE SCENARIOS
  // =========================================================================

  describe('Real Estate Development Scenarios', () => {
    it('should track Bali villa development budget', () => {
      const phases: ConstructionPhase[] = [
        { id: '1', name: 'Land & Permits', startMonth: 1, duration: 2, budgetPercent: 25, status: 'completed', completionPercent: 100 },
        { id: '2', name: 'Foundation & Structure', startMonth: 3, duration: 4, budgetPercent: 35, status: 'in-progress', completionPercent: 70 },
        { id: '3', name: 'Finishing & MEP', startMonth: 7, duration: 3, budgetPercent: 30, status: 'not-started', completionPercent: 0 },
        { id: '4', name: 'Landscaping & Pool', startMonth: 10, duration: 2, budgetPercent: 10, status: 'not-started', completionPercent: 0 },
      ];

      const inputs: BudgetInputs = {
        landCost: 150000,
        landActual: 155000, // Slight overrun
        constructionHard: 280000,
        constructionHardActual: 200000, // In progress
        softCosts: 40000,
        softCostsActual: 42000,
        contingency: 50000,
        contingencyActual: 15000,
        financing: 35000,
        financingActual: 18000,
        marketing: 20000,
        marketingActual: 5000,
        currentMonth: 6,
        totalProjectDuration: 12,
        phases,
      };

      const result = calculateBudgetMetrics(inputs);

      expect(result.totalBudgeted).toBe(575000);
      expect(result.overallCompletion).toBeGreaterThan(40);
      expect(result.healthScore).toBeGreaterThan(70);
    });

    it('should track boutique hotel development', () => {
      const phases: ConstructionPhase[] = [
        { id: '1', name: 'Site Acquisition', startMonth: 1, duration: 3, budgetPercent: 20, status: 'completed', completionPercent: 100 },
        { id: '2', name: 'Design & Permits', startMonth: 4, duration: 4, budgetPercent: 10, status: 'completed', completionPercent: 100 },
        { id: '3', name: 'Construction Phase 1', startMonth: 8, duration: 6, budgetPercent: 30, status: 'in-progress', completionPercent: 40 },
        { id: '4', name: 'Construction Phase 2', startMonth: 14, duration: 6, budgetPercent: 25, status: 'not-started', completionPercent: 0 },
        { id: '5', name: 'FF&E & Opening', startMonth: 20, duration: 4, budgetPercent: 15, status: 'not-started', completionPercent: 0 },
      ];

      const inputs: BudgetInputs = {
        landCost: 800000,
        landActual: 820000,
        constructionHard: 2000000,
        constructionHardActual: 900000,
        softCosts: 200000,
        softCostsActual: 210000,
        contingency: 300000,
        contingencyActual: 50000,
        financing: 250000,
        financingActual: 120000,
        marketing: 100000,
        marketingActual: 30000,
        currentMonth: 12,
        totalProjectDuration: 24,
        phases,
      };

      const result = calculateBudgetMetrics(inputs);

      expect(result.totalBudgeted).toBe(3650000);
      expect(result.timelineProgress).toBe(50);
      expect(result.completedPhases).toBe(2);
    });
  });

  // =========================================================================
  // VALIDATION SUMMARY
  // =========================================================================

  describe('Validation Summary', () => {
    it('should generate budget tracking report', () => {
      const scenarios = [
        {
          name: 'On Budget Project',
          inputs: createBaseInputs({
            landCost: 200000,
            landActual: 200000,
            constructionHard: 500000,
            constructionHardActual: 500000,
            softCosts: 50000,
            softCostsActual: 50000,
            contingency: 75000,
            contingencyActual: 10000,
            financing: 60000,
            financingActual: 60000,
            marketing: 30000,
            marketingActual: 30000,
          }),
        },
        {
          name: 'Over Budget Project',
          inputs: createBaseInputs({
            landCost: 200000,
            landActual: 250000,
            constructionHard: 500000,
            constructionHardActual: 600000,
            softCosts: 50000,
            softCostsActual: 65000,
          }),
        },
        {
          name: 'Delayed Project',
          inputs: createBaseInputs({
            phases: [
              { id: '1', name: 'Phase 1', startMonth: 1, duration: 2, budgetPercent: 33, status: 'delayed', completionPercent: 80 },
              { id: '2', name: 'Phase 2', startMonth: 3, duration: 2, budgetPercent: 33, status: 'delayed', completionPercent: 30 },
              { id: '3', name: 'Phase 3', startMonth: 5, duration: 2, budgetPercent: 34, status: 'not-started', completionPercent: 0 },
            ],
          }),
        },
      ];

      const results = scenarios.map(s => {
        const calc = calculateBudgetMetrics(s.inputs);
        return {
          name: s.name,
          budget: calc.totalBudgeted,
          actual: calc.totalActual,
          variance: calc.variancePercent,
          health: calc.healthScore,
          label: getHealthLabel(calc.healthScore),
        };
      });

      console.log('\n========== BUDGET TRACKER VALIDATION ==========');
      console.table(results.map(r => ({
        Scenario: r.name,
        Budget: `$${r.budget.toLocaleString()}`,
        Actual: `$${r.actual.toLocaleString()}`,
        'Variance %': `${r.variance.toFixed(1)}%`,
        'Health Score': r.health.toFixed(0),
        Status: r.label,
      })));

      // On budget should be healthy
      expect(results[0].health).toBeGreaterThan(80);
      // Over budget should be at risk
      expect(results[1].health).toBeLessThan(100);
      // Delayed should be penalized
      expect(results[2].health).toBeLessThan(90);
    });
  });
});
