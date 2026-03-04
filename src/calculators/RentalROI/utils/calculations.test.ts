/**
 * Extensive test suite for RentalROI calculations
 * Values taken directly from the Sanuuri Apartment spreadsheet
 */

import { calculateProjections } from './calculations';
import type { Assumptions } from '../types';

// Spreadsheet input values
const SPREADSHEET_ASSUMPTIONS: Assumptions = {
  initialInvestment: 15087472000, // Total investment for all units (from UNIT SCHEDULE)
  purchaseDate: '2026-01',
  keys: 18,

  isPropertyReady: false,
  propertyReadyDate: '2028-01', // Year 3 is first operational

  // Year 1 operational bases (first operational year = 2028)
  y1Occupancy: 70,
  y1ADR: 1900000,
  y1FB: 216000000,
  y1Spa: 64800000, // Wellness/Sports/Health
  y1OODs: 0,
  y1Misc: 0,

  // Occupancy increases for operational years 2-9 (Y4-Y10 in calendar)
  // From spreadsheet: 5.5, 5.25, 4.5, 3, 1, 0.5, 0.25, 0
  occupancyIncreases: [5.5, 5.25, 4.5, 3, 1, 0.5, 0.25, 0, 0],

  // Growth rates
  adrGrowth: 5,
  fbGrowth: 3,
  spaGrowth: 4, // Wellness growth
  camGrowth: 2,
  baseFeeGrowth: 3,
  techFeeGrowth: 3,

  // Cost percentages
  roomsCostPct: 20,
  fbCostPct: 80,
  spaCostPct: 80,
  otherCostPct: 80,
  miscCostPct: 80,
  utilitiesPct: 7,

  // Undistributed percentages
  adminPct: 1,
  salesPct: 2.5,
  maintPct: 2,

  // Management fees
  camFeePerUnit: 1250000, // 1.25M per unit per month
  baseFeePercent: 2, // 2% of revenue
  techFeePerUnit: 1200000, // 1.2M per unit per month
  incentiveFeePct: 0,
};

// Expected values from spreadsheet (all in IDR)
const EXPECTED_VALUES = {
  // Year 1 (2026) - Development
  year1: {
    calendarYear: 2026,
    occupancy: 0,
    adr: 0,
    revenueRooms: 0,
    revenueFB: 0,
    revenueSpa: 0,
    totalRevenue: 0,
    totalOperatingCost: 0,
    totalUndistributedCost: 0,
    gop: 0,
    feeCAM: 0,
    feeBase: 0,
    feeTech: 259200000,
    totalManagementFees: 259200000,
    takeHomeProfit: -259200000,
  },

  // Year 2 (2027) - Development
  year2: {
    calendarYear: 2027,
    occupancy: 0,
    adr: 0,
    revenueRooms: 0,
    revenueFB: 0,
    revenueSpa: 0,
    totalRevenue: 0,
    totalOperatingCost: 0,
    totalUndistributedCost: 0,
    gop: 0,
    feeCAM: 0,
    feeBase: 0,
    feeTech: 259200000,
    totalManagementFees: 259200000,
    takeHomeProfit: -259200000,
  },

  // Year 3 (2028) - First Operational
  year3: {
    calendarYear: 2028,
    occupancy: 70,
    adr: 1900000,
    revenueRooms: 8738100000,
    revenueFB: 216000000,
    revenueSpa: 64800000,
    totalRevenue: 9018900000,
    costRooms: 1747620000,
    costFB: 172800000,
    costSpa: 51840000,
    costUtilities: 631323000,
    totalOperatingCost: 2603583000,
    undistributedAdmin: 90189000,
    undistributedSales: 225472500,
    undistributedMaintenance: 180378000,
    totalUndistributedCost: 496039500,
    gop: 5919277500,
    feeCAM: 270000000,
    feeBase: 180378000,
    feeTech: 259200000,
    totalManagementFees: 709578000,
    takeHomeProfit: 5209699500,
  },

  // Year 4 (2029)
  year4: {
    calendarYear: 2029,
    occupancy: 75.5,
    adr: 1995000,
    revenueRooms: 9895898250,
    revenueFB: 222480000,
    revenueSpa: 67392000,
    totalRevenue: 10185770250,
    costRooms: 1979179650,
    costFB: 177984000,
    costSpa: 53913600,
    costUtilities: 713003918, // 7% of total revenue (rounded)
    totalOperatingCost: 2924081168,
    undistributedAdmin: 101857703, // 1% (rounded)
    undistributedSales: 254644256, // 2.5% (rounded)
    undistributedMaintenance: 203715405, // 2% (rounded)
    totalUndistributedCost: 560217364,
    gop: 6701471719,
    feeCAM: 275400000,
    feeBase: 185789340,
    feeTech: 266976000,
    totalManagementFees: 728165340,
    takeHomeProfit: 5973306379,
  },

  // Year 5 (2030)
  year5: {
    calendarYear: 2030,
    occupancy: 80.75,
    adr: 2094750,
    revenueRooms: 11113224806,
    revenueFB: 229154400,
    revenueSpa: 70087680,
    totalRevenue: 11412466886,
    gop: 7523869900,
    feeCAM: 280908000,
    feeBase: 191363020,
    feeTech: 274985280,
    totalManagementFees: 747256300,
    takeHomeProfit: 6776613600,
  },

  // Year 6 (2031)
  year6: {
    calendarYear: 2031,
    occupancy: 85.25,
    adr: 2199488,
    revenueRooms: 12319164526,
    revenueFB: 236029032,
    revenueSpa: 72891187,
    totalRevenue: 12628084745,
    gop: 8338605071,
    feeCAM: 286526160,
    feeBase: 197103911,
    feeTech: 283234838,
    totalManagementFees: 766864909,
    takeHomeProfit: 7571740162,
  },

  // Year 7 (2032)
  year7: {
    calendarYear: 2032,
    occupancy: 88.25,
    adr: 2309462,
    revenueRooms: 13390317688,
    revenueFB: 243109903,
    revenueSpa: 75806835,
    totalRevenue: 13709234425,
    gop: 9062383195,
    feeCAM: 292256683,
    feeBase: 203017028,
    feeTech: 291731884,
    totalManagementFees: 787005595,
    takeHomeProfit: 8275377600,
  },

  // Year 8 (2033)
  year8: {
    calendarYear: 2033,
    occupancy: 89.25,
    adr: 2424935,
    revenueRooms: 14219151800,
    revenueFB: 250403200,
    revenueSpa: 78839108,
    totalRevenue: 14548394108,
    gop: 9622620638,
    feeCAM: 298101817,
    feeBase: 209107539,
    feeTech: 300483840,
    totalManagementFees: 807693196,
    takeHomeProfit: 8814927442,
  },

  // Year 9 (2034)
  year9: {
    calendarYear: 2034,
    occupancy: 89.75,
    adr: 2546182,
    revenueRooms: 15013751459,
    revenueFB: 257915296,
    revenueSpa: 81992672,
    totalRevenue: 15353659427,
    gop: 10159775332,
    feeCAM: 304063853,
    feeBase: 215380765,
    feeTech: 309498355,
    totalManagementFees: 828942974,
    takeHomeProfit: 9330832359,
  },

  // Year 10 (2035)
  year10: {
    calendarYear: 2035,
    occupancy: 90,
    adr: 2673491,
    revenueRooms: 15808351118,
    revenueFB: 265652755,
    revenueSpa: 85272379,
    totalRevenue: 16159276253,
    gop: 10696956390,
    feeCAM: 310145130,
    feeBase: 221842188,
    feeTech: 318783306,
    totalManagementFees: 850770624,
    takeHomeProfit: 9846185766,
  },
};

// Helper function to check if values are close enough (within 1 IDR tolerance for rounding)
function isClose(actual: number, expected: number, tolerance: number = 1): boolean {
  return Math.abs(actual - expected) <= tolerance;
}

// Helper to format numbers for display
function formatIDR(n: number): string {
  return n.toLocaleString('id-ID');
}

// Run all tests
function runTests(): void {
  console.log('='.repeat(80));
  console.log('RENTAL ROI CALCULATION TEST SUITE');
  console.log('Comparing against Sanuuri Apartment Spreadsheet');
  console.log('='.repeat(80));
  console.log('');

  const results = calculateProjections(SPREADSHEET_ASSUMPTIONS);

  let totalTests = 0;
  let passedTests = 0;
  const failures: string[] = [];

  // Test each year
  const expectedYears = [
    { idx: 0, data: EXPECTED_VALUES.year1, name: 'Year 1 (2026) - Development' },
    { idx: 1, data: EXPECTED_VALUES.year2, name: 'Year 2 (2027) - Development' },
    { idx: 2, data: EXPECTED_VALUES.year3, name: 'Year 3 (2028) - First Operational' },
    { idx: 3, data: EXPECTED_VALUES.year4, name: 'Year 4 (2029)' },
    { idx: 4, data: EXPECTED_VALUES.year5, name: 'Year 5 (2030)' },
    { idx: 5, data: EXPECTED_VALUES.year6, name: 'Year 6 (2031)' },
    { idx: 6, data: EXPECTED_VALUES.year7, name: 'Year 7 (2032)' },
    { idx: 7, data: EXPECTED_VALUES.year8, name: 'Year 8 (2033)' },
    { idx: 8, data: EXPECTED_VALUES.year9, name: 'Year 9 (2034)' },
    { idx: 9, data: EXPECTED_VALUES.year10, name: 'Year 10 (2035)' },
  ];

  for (const { idx, data: expected, name } of expectedYears) {
    console.log(`\n${'─'.repeat(60)}`);
    console.log(`Testing ${name}`);
    console.log('─'.repeat(60));

    const actual = results[idx];

    for (const [key, expectedValue] of Object.entries(expected)) {
      const actualValue = (actual as any)[key];
      totalTests++;

      // Use higher tolerance for larger numbers (rounding differences)
      const tolerance = expectedValue > 1000000 ? Math.max(1, Math.abs(expectedValue) * 0.0001) : 1;

      if (isClose(actualValue, expectedValue as number, tolerance)) {
        passedTests++;
        console.log(`  ✓ ${key}: ${formatIDR(actualValue)}`);
      } else {
        const diff = actualValue - (expectedValue as number);
        const pctDiff = expectedValue !== 0 ? ((diff / (expectedValue as number)) * 100).toFixed(4) : 'N/A';
        failures.push(`${name} - ${key}: Expected ${formatIDR(expectedValue as number)}, got ${formatIDR(actualValue)} (diff: ${formatIDR(diff)}, ${pctDiff}%)`);
        console.log(`  ✗ ${key}:`);
        console.log(`      Expected: ${formatIDR(expectedValue as number)}`);
        console.log(`      Actual:   ${formatIDR(actualValue)}`);
        console.log(`      Diff:     ${formatIDR(diff)} (${pctDiff}%)`);
      }
    }
  }

  // Summary
  console.log('\n' + '='.repeat(80));
  console.log('TEST SUMMARY');
  console.log('='.repeat(80));
  console.log(`Total Tests: ${totalTests}`);
  console.log(`Passed: ${passedTests}`);
  console.log(`Failed: ${totalTests - passedTests}`);
  console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(2)}%`);

  if (failures.length > 0) {
    console.log('\n' + '─'.repeat(60));
    console.log('FAILURES:');
    console.log('─'.repeat(60));
    failures.forEach(f => console.log(`  • ${f}`));
  }

  console.log('\n' + '='.repeat(80));

  // Additional detailed output for verification
  console.log('\nDETAILED YEAR-BY-YEAR OUTPUT:');
  console.log('='.repeat(80));

  results.forEach((year, idx) => {
    console.log(`\nYear ${idx + 1} (${year.calendarYear}):`);
    console.log(`  Occupancy: ${year.occupancy.toFixed(2)}%`);
    console.log(`  ADR: Rp ${formatIDR(year.adr)}`);
    console.log(`  Room Revenue: Rp ${formatIDR(year.revenueRooms)}`);
    console.log(`  F&B Revenue: Rp ${formatIDR(year.revenueFB)}`);
    console.log(`  Wellness Revenue: Rp ${formatIDR(year.revenueSpa)}`);
    console.log(`  Total Revenue: Rp ${formatIDR(year.totalRevenue)}`);
    console.log(`  Total Operating Cost: Rp ${formatIDR(year.totalOperatingCost)}`);
    console.log(`  Total Undistributed: Rp ${formatIDR(year.totalUndistributedCost)}`);
    console.log(`  GOP: Rp ${formatIDR(year.gop)}`);
    console.log(`  CAM Fee: Rp ${formatIDR(year.feeCAM)}`);
    console.log(`  Base Fee: Rp ${formatIDR(year.feeBase)}`);
    console.log(`  Tech Fee: Rp ${formatIDR(year.feeTech)}`);
    console.log(`  Total Mgmt Fees: Rp ${formatIDR(year.totalManagementFees)}`);
    console.log(`  Take Home Profit: Rp ${formatIDR(year.takeHomeProfit)}`);
    console.log(`  ROI: ${year.roiAfterManagement.toFixed(2)}%`);
  });

  // Calculate 10-year totals
  const totalProfit = results.reduce((sum, y) => sum + y.takeHomeProfit, 0);
  const totalRevenue = results.reduce((sum, y) => sum + y.totalRevenue, 0);
  console.log('\n' + '─'.repeat(60));
  console.log('10-YEAR TOTALS:');
  console.log('─'.repeat(60));
  console.log(`  Total Revenue: Rp ${formatIDR(totalRevenue)}`);
  console.log(`  Total Profit: Rp ${formatIDR(totalProfit)}`);

  // Expected from spreadsheet: 61,280,282,807 (sum of profit distribution)
  const expectedTotalProfit = 61280282807;
  console.log(`  Expected Total Profit: Rp ${formatIDR(expectedTotalProfit)}`);
  console.log(`  Difference: Rp ${formatIDR(totalProfit - expectedTotalProfit)}`);
}

// Export for use
export { runTests, SPREADSHEET_ASSUMPTIONS, EXPECTED_VALUES };

// Run if executed directly
runTests();
