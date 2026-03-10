/**
 * Portfolio Test Data Seeder
 *
 * Utility to seed the portfolio with test projects for all user personas
 */

import { ALL_CALCULATOR_TEST_DATA, type TestScenario } from './calculatorTestData';
import { USER_PERSONAS, type UserPersona } from './userPersonas';

export interface SeedProject {
  projectName: string;
  calculatorId: string;
  strategy?: 'flip' | 'hold' | 'rental' | 'development';
  location: string;
  totalInvestment: number;
  roi: number;
  avgCashFlow: number;
  breakEvenMonths: number;
  data: Record<string, any>;
  investmentScore: number;
  persona: string;
}

/**
 * Generate seed projects for a specific persona
 */
export function generateSeedProjectsForPersona(personaId: string): SeedProject[] {
  const persona = USER_PERSONAS.find(p => p.id === personaId);
  if (!persona) return [];

  const projects: SeedProject[] = [];

  ALL_CALCULATOR_TEST_DATA.forEach(calculator => {
    const personaScenarios = calculator.scenarios.filter(s => s.persona === personaId);

    personaScenarios.forEach(scenario => {
      const project = convertScenarioToProject(scenario, calculator.calculatorId, persona);
      projects.push(project);
    });
  });

  return projects;
}

/**
 * Generate all seed projects for all personas
 */
export function generateAllSeedProjects(): SeedProject[] {
  const allProjects: SeedProject[] = [];

  USER_PERSONAS.forEach(persona => {
    const personaProjects = generateSeedProjectsForPersona(persona.id);
    allProjects.push(...personaProjects);
  });

  return allProjects;
}

/**
 * Convert a test scenario to a portfolio project
 */
function convertScenarioToProject(
  scenario: TestScenario,
  calculatorId: string,
  persona: UserPersona
): SeedProject {
  const { inputs, expectedResults, portfolioSave } = scenario;

  // Extract financial metrics based on calculator type
  let totalInvestment = 0;
  let roi = 0;
  let avgCashFlow = 0;
  let breakEvenMonths = 24;

  switch (calculatorId) {
    case 'mortgage':
      totalInvestment = inputs.loanAmount + (inputs.downPayment || 0);
      roi = 0;
      avgCashFlow = -(expectedResults.monthlyPayment || 0);
      breakEvenMonths = 0;
      break;

    case 'rental-roi':
      totalInvestment = inputs.initialInvestment || 0;
      roi = expectedResults.averageROI || inputs.y1Occupancy * 0.2;
      avgCashFlow = (expectedResults.totalProfit || 0) / ((inputs.projectionYears || 10) * 12);
      breakEvenMonths = (expectedResults.breakEvenYear || 5) * 12;
      break;

    case 'xirr':
      totalInvestment = inputs.property?.totalPrice || inputs.property?.purchasePrice || 0;
      roi = expectedResults.xirr || 15;
      avgCashFlow = (inputs.rental?.monthlyRent || 0) * ((inputs.rental?.occupancyRate || 60) / 100);
      breakEvenMonths = (inputs.exit?.holdPeriodYears || 3) * 12;
      break;

    case 'cashflow':
      totalInvestment = persona.investmentRange.min + (persona.investmentRange.max - persona.investmentRange.min) / 2;
      roi = expectedResults.cashOnCashReturn || 10;
      avgCashFlow = expectedResults.netMonthlyCashFlow || 0;
      breakEvenMonths = totalInvestment / (avgCashFlow * 12) * 12 || 60;
      break;

    case 'cap-rate':
      totalInvestment = inputs.propertyValue || 0;
      roi = expectedResults.capRate || 7;
      avgCashFlow = (expectedResults.monthlyNOI || expectedResults.yearlyNOI / 12) || 0;
      breakEvenMonths = totalInvestment / (avgCashFlow * 12) * 12 || 120;
      break;

    case 'irr':
      totalInvestment = Math.abs(inputs.initialInvestment || 0);
      roi = expectedResults.irr || 15;
      avgCashFlow = (expectedResults.totalReturn || 0) / (inputs.cashFlows?.length || 5) / 12;
      breakEvenMonths = (expectedResults.paybackPeriod || 5) * 12;
      break;

    case 'npv':
      const outflows = inputs.cashFlows?.filter((cf: any) => cf.amount < 0) || [];
      totalInvestment = Math.abs(outflows.reduce((sum: number, cf: any) => sum + cf.amount, 0));
      roi = (expectedResults.profitabilityIndex - 1) * 100 || 15;
      avgCashFlow = expectedResults.npv / ((inputs.cashFlows?.length || 5) * 12);
      breakEvenMonths = totalInvestment / (avgCashFlow * 12) * 12 || 48;
      break;

    case 'dev-feasibility':
      totalInvestment = expectedResults.totalProjectCost || inputs.landCost + inputs.buildableArea * inputs.constructionCostPerSqm;
      roi = expectedResults.roiFlip || 25;
      avgCashFlow = (expectedResults.grossProfit || 0) / (inputs.timelineMonths || 24);
      breakEvenMonths = inputs.timelineMonths || 24;
      break;

    case 'indonesia-tax':
      totalInvestment = inputs.purchasePrice || 0;
      roi = ((inputs.salePrice - inputs.purchasePrice - (expectedResults.totalTaxLiability || 0)) / inputs.purchasePrice) * 100;
      avgCashFlow = expectedResults.netProfit / ((inputs.holdPeriodYears || 3) * 12);
      breakEvenMonths = inputs.holdPeriodYears * 12;
      break;

    case 'rental-projection':
      totalInvestment = persona.investmentRange.min + (persona.investmentRange.max - persona.investmentRange.min) / 3;
      roi = ((expectedResults.annualNetIncome || 0) / totalInvestment) * 100;
      avgCashFlow = (expectedResults.annualNetIncome || 0) / 12;
      breakEvenMonths = expectedResults.breakEvenMonths || 18;
      break;

    case 'financing':
      totalInvestment = inputs.propertyValue || 0;
      roi = 0;
      avgCashFlow = -(expectedResults.lowestMonthlyPayment || 0);
      breakEvenMonths = 0;
      break;

    case 'dev-budget':
      totalInvestment = expectedResults.totalBudgeted || 0;
      roi = 0;
      avgCashFlow = 0;
      breakEvenMonths = 0;
      break;

    case 'risk-assessment':
      totalInvestment = inputs.propertyValue || 0;
      roi = expectedResults.adjustedReturn || inputs.expectedReturn || 15;
      avgCashFlow = (totalInvestment * roi / 100) / 12;
      breakEvenMonths = inputs.timeHorizon * 12 || 60;
      break;

    default:
      totalInvestment = persona.investmentRange.min;
      roi = 12;
  }

  // Calculate investment score based on roi and risk
  const investmentScore = calculateInvestmentScore(roi, avgCashFlow, totalInvestment, breakEvenMonths, calculatorId);

  return {
    projectName: portfolioSave.projectName,
    calculatorId,
    strategy: portfolioSave.strategy,
    location: portfolioSave.location,
    totalInvestment,
    roi,
    avgCashFlow,
    breakEvenMonths,
    data: {
      ...inputs,
      result: expectedResults,
    },
    investmentScore,
    persona: persona.id,
  };
}

/**
 * Calculate investment score for a project
 */
function calculateInvestmentScore(
  roi: number,
  avgCashFlow: number,
  totalInvestment: number,
  breakEvenMonths: number,
  calculatorId: string
): number {
  // Base score components
  const roiScore = Math.min(roi / 20, 1) * 35; // Up to 35 points for ROI
  const cashFlowScore = avgCashFlow > 0 ? Math.min(avgCashFlow / 5000, 1) * 25 : 0; // Up to 25 points
  const breakEvenScore = breakEvenMonths > 0 ? Math.max(0, (120 - breakEvenMonths) / 120) * 20 : 10; // Up to 20 points
  const sizeScore = Math.min(totalInvestment / 1000000, 1) * 10; // Up to 10 points for investment size
  const calculatorBonus = ['rental-roi', 'xirr', 'irr', 'cap-rate'].includes(calculatorId) ? 10 : 5;

  return Math.min(100, Math.round(roiScore + cashFlowScore + breakEvenScore + sizeScore + calculatorBonus));
}

/**
 * Get summary statistics for seed data
 */
export function getSeedDataSummary() {
  const allProjects = generateAllSeedProjects();

  return {
    totalProjects: allProjects.length,
    byPersona: USER_PERSONAS.map(p => ({
      persona: p.name,
      role: p.role,
      projectCount: allProjects.filter(proj => proj.persona === p.id).length,
    })),
    byCalculator: ALL_CALCULATOR_TEST_DATA.map(calc => ({
      calculator: calc.calculatorName,
      scenarioCount: calc.scenarios.length,
    })),
    investmentRanges: {
      min: Math.min(...allProjects.map(p => p.totalInvestment)),
      max: Math.max(...allProjects.map(p => p.totalInvestment)),
      avg: allProjects.reduce((sum, p) => sum + p.totalInvestment, 0) / allProjects.length,
    },
  };
}

/**
 * Export for use in browser console or testing
 */
export const TestDataUtils = {
  generateSeedProjectsForPersona,
  generateAllSeedProjects,
  getSeedDataSummary,
  USER_PERSONAS,
  ALL_CALCULATOR_TEST_DATA,
};

// Log summary when module loads (for debugging)
if (typeof window !== 'undefined') {
  console.log('📊 Test Data Seeder loaded');
  console.log('   Use TestDataUtils.getSeedDataSummary() to see statistics');
  console.log('   Use TestDataUtils.generateAllSeedProjects() to generate all test projects');
}
