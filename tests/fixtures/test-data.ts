/**
 * E2E Test Fixtures
 *
 * Re-exports test data from src/test-data for use in Playwright tests
 *
 * ============================================================================
 * REVERT INSTRUCTIONS:
 * This file is part of the E2E testing setup.
 * Delete the entire tests/ directory to remove all test files.
 * ============================================================================
 */

// Re-export all test data
export {
  USER_PERSONAS,
  getPersonaById,
  getPersonasForCalculator,
  type UserPersona,
} from '../../src/test-data/userPersonas';

export {
  ALL_CALCULATOR_TEST_DATA,
  getTestDataForCalculator,
  getScenariosForPersona,
  getTotalScenarioCount,
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
  type TestScenario,
  type CalculatorTestData,
} from '../../src/test-data/calculatorTestData';

export {
  generateSeedProjectsForPersona,
  generateAllSeedProjects,
  getSeedDataSummary,
  type SeedProject,
} from '../../src/test-data/portfolioSeeder';

/**
 * Calculator URL mapping
 */
export const CALCULATOR_URLS: Record<string, string> = {
  'mortgage': '/calculators/mortgage',
  'rental-roi': '/calculators/rental-roi',
  'xirr': '/calculators/xirr',
  'cashflow': '/calculators/cashflow',
  'cap-rate': '/calculators/cap-rate',
  'irr': '/calculators/irr',
  'npv': '/calculators/npv',
  'dev-feasibility': '/calculators/dev-feasibility',
  'indonesia-tax': '/calculators/indonesia-tax',
  'rental-projection': '/calculators/rental-projection',
  'financing': '/calculators/financing',
  'dev-budget': '/calculators/dev-budget',
  'risk-assessment': '/calculators/risk-assessment',
};

/**
 * Input field selectors by calculator type
 */
export const CALCULATOR_SELECTORS: Record<string, Record<string, string>> = {
  'mortgage': {
    loanAmount: 'input[name="loanAmount"], input[placeholder*="loan" i]',
    interestRate: 'input[name="interestRate"], input[placeholder*="rate" i]',
    loanTermYears: 'input[name="loanTermYears"], input[placeholder*="term" i]',
    downPayment: 'input[name="downPayment"], input[placeholder*="down" i]',
  },
  'npv': {
    discountRate: 'input[name="discountRate"], input[placeholder*="discount" i]',
    cashFlow: 'input[name="cashFlow"], input[placeholder*="cash" i]',
  },
  'rental-projection': {
    nightlyRate: 'input[name="nightlyRate"], input[placeholder*="nightly" i]',
    occupancyRate: 'input[name="baseOccupancyRate"], input[placeholder*="occupancy" i]',
    monthlyExpenses: 'input[name="monthlyExpenses"], input[placeholder*="expense" i]',
  },
  // Add more calculator selectors as needed
};

/**
 * Common test utilities
 */
export const TestUtils = {
  /**
   * Format number for input (removes commas, handles decimals)
   */
  formatForInput(value: number): string {
    return value.toString();
  },

  /**
   * Parse displayed currency value
   */
  parseCurrency(text: string): number {
    return parseFloat(text.replace(/[$,KMB]/g, '').trim()) || 0;
  },

  /**
   * Wait for calculator results to update
   */
  async waitForResults(page: any, timeout = 2000): Promise<void> {
    await page.waitForTimeout(timeout);
  },
};
