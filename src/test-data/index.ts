/**
 * Test Data Module
 *
 * Comprehensive test data for ROI Calculate platform testing
 *
 * Usage in browser console:
 *   import('./test-data').then(m => m.seedTestData())
 *
 * Or use individual exports:
 *   - USER_PERSONAS: 4 ICPs (Developer, Quick-Calc, Agent, Institutional)
 *   - ALL_CALCULATOR_TEST_DATA: 52 test scenarios (4 per calculator)
 *   - generateAllSeedProjects(): Generate portfolio-ready projects
 */

// Export all user personas
export { USER_PERSONAS, getPersonaById, getPersonasForCalculator } from './userPersonas';
export type { UserPersona } from './userPersonas';

// Export all calculator test data
export {
  ALL_CALCULATOR_TEST_DATA,
  getTestDataForCalculator,
  getScenariosForPersona,
  getTotalScenarioCount,
  // Individual calculator exports
  mortgageTestData,
  rentalRoiTestData,
  xirrTestData,
  cashflowTestData,
  capRateTestData,
  irrTestData,
  npvTestData,
  devFeasibilityTestData,
  indonesiaTaxTestData,
  rentalProjectionTestData,
  financingTestData,
  devBudgetTestData,
  riskAssessmentTestData,
} from './calculatorTestData';
export type { TestScenario, CalculatorTestData } from './calculatorTestData';

// Export portfolio seeder utilities
export {
  generateSeedProjectsForPersona,
  generateAllSeedProjects,
  getSeedDataSummary,
  TestDataUtils,
} from './portfolioSeeder';
export type { SeedProject } from './portfolioSeeder';

/**
 * Quick summary of available test data
 */
export function getTestDataOverview() {
  return {
    personas: {
      total: 4,
      types: [
        'Real Estate Developer - Large-scale projects ($500K-$5M)',
        'Quick Calculator - Simple evaluations ($100K-$500K)',
        'Real Estate Agent - Client presentations ($300K-$2M)',
        'Institutional Investor - Fund-level analysis ($1M-$10M)',
      ],
    },
    calculators: {
      total: 13,
      list: [
        'Mortgage Calculator',
        'Annualized ROI',
        'XIRR Calculator',
        'Cash Flow Projector',
        'Cap Rate Analysis',
        'IRR Calculator',
        'NPV Calculator',
        'Development Feasibility',
        'Indonesia Tax Optimizer',
        'Rental Income Projection',
        'Financing Comparison',
        'Development Budget Tracker',
        'Risk Assessment & Rating',
      ],
    },
    scenarios: {
      total: 52,
      perCalculator: 4,
      perPersona: 13,
    },
  };
}

/**
 * Print test data summary to console
 */
export function printTestDataSummary() {
  const overview = getTestDataOverview();

  console.log('\n📊 ROI Calculate Test Data Summary');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  console.log('\n👥 User Personas:');
  overview.personas.types.forEach((p, i) => console.log(`   ${i + 1}. ${p}`));

  console.log('\n🧮 Calculators:');
  overview.calculators.list.forEach((c, i) => console.log(`   ${i + 1}. ${c}`));

  console.log('\n📈 Test Scenarios:');
  console.log(`   • Total scenarios: ${overview.scenarios.total}`);
  console.log(`   • Per calculator: ${overview.scenarios.perCalculator}`);
  console.log(`   • Per persona: ${overview.scenarios.perPersona}`);

  console.log('\n✅ Ready for testing!\n');
}
