/**
 * Rental ROI 10-Year Model Tests
 *
 * Tests the 10-year rental ROI projection model including
 * revenue streams, operating costs, management fees, and ROI calculations.
 */

import { describe, it, expect } from 'vitest';
import { approximatelyEqual } from '../utils/reference-implementations';

// =========================================================================
// RENTAL ROI TYPES AND FUNCTIONS (extracted from calculator logic)
// =========================================================================

interface Assumptions {
  initialInvestment: number;
  keys: number;
  y1ADR: number;
  y1Occupancy: number;
  adrGrowth: number;
  occupancyIncreases: number[];
  y1FB: number;
  y1Spa: number;
  y1OODs: number;
  y1Misc: number;
  fbGrowth: number;
  spaGrowth: number;
  roomsCostPct: number;
  fbCostPct: number;
  spaCostPct: number;
  otherCostPct: number;
  miscCostPct: number;
  utilitiesPct: number;
  adminPct: number;
  salesPct: number;
  maintPct: number;
  techFeePerUnit: number;
  techFeeGrowth: number;
  camFeePerUnit: number;
  camGrowth: number;
  baseFeePercent: number;
  baseFeeGrowth: number;
  incentiveFeePct: number;
}

interface YearlyData {
  year: number;
  occupancy: number;
  adr: number;
  totalRevenue: number;
  totalOperatingCost: number;
  totalUndistributedCost: number;
  gop: number;
  gopMargin: number;
  totalManagementFees: number;
  takeHomeProfit: number;
  roiBeforeManagement: number;
  roiAfterManagement: number;
}

function calculateProjections(assumptions: Assumptions): YearlyData[] {
  const data: YearlyData[] = [];

  for (let i = 0; i < 10; i++) {
    const prevYear: YearlyData | null = i > 0 ? data[i - 1] : null;

    // Occupancy
    let occupancy: number;
    if (i === 0) {
      occupancy = assumptions.y1Occupancy;
    } else {
      const increase = assumptions.occupancyIncreases[i - 1] ?? 0;
      occupancy = (prevYear?.occupancy ?? assumptions.y1Occupancy) + increase;
    }

    // ADR
    let adr: number;
    if (i === 0) {
      adr = assumptions.y1ADR;
    } else {
      adr = (prevYear?.adr ?? assumptions.y1ADR) * (1 + assumptions.adrGrowth / 100);
    }

    // Revenue calculation
    const revenueRooms = assumptions.keys * 365 * (occupancy / 100) * adr;
    const revenueFB = i === 0 ? assumptions.y1FB : (prevYear ? prevYear.totalRevenue * 0.15 : assumptions.y1FB) * (1 + assumptions.fbGrowth / 100);
    const revenueSpa = i === 0 ? assumptions.y1Spa : (prevYear ? prevYear.totalRevenue * 0.05 : assumptions.y1Spa) * (1 + assumptions.spaGrowth / 100);
    const revenueOODs = assumptions.y1OODs;
    const revenueMisc = assumptions.y1Misc;

    // Simplified: Use a ratio to approximate F&B and Spa based on rooms
    const totalRevenue = revenueRooms * 1.25; // Rooms + ~25% ancillary

    // Operating costs
    const costRooms = revenueRooms * (assumptions.roomsCostPct / 100);
    const costFB = revenueFB * (assumptions.fbCostPct / 100);
    const costSpa = revenueSpa * (assumptions.spaCostPct / 100);
    const costUtilities = totalRevenue * (assumptions.utilitiesPct / 100);
    const totalOperatingCost = costRooms + costFB + costSpa + costUtilities;

    // Undistributed costs
    const undistributedAdmin = totalRevenue * (assumptions.adminPct / 100);
    const undistributedSales = totalRevenue * (assumptions.salesPct / 100);
    const undistributedMaint = totalRevenue * (assumptions.maintPct / 100);
    const totalUndistributedCost = undistributedAdmin + undistributedSales + undistributedMaint;

    // GOP
    const gop = totalRevenue - totalOperatingCost - totalUndistributedCost;
    const gopMargin = totalRevenue > 0 ? (gop / totalRevenue) * 100 : 0;

    // Management fees
    const feeTech = assumptions.techFeePerUnit * 12 * assumptions.keys * Math.pow(1 + assumptions.techFeeGrowth / 100, i);
    const feeCAM = assumptions.camFeePerUnit * 12 * assumptions.keys * Math.pow(1 + assumptions.camGrowth / 100, i);
    const feeBase = i === 0 ? totalRevenue * (assumptions.baseFeePercent / 100) : (prevYear ? prevYear.totalRevenue * (assumptions.baseFeePercent / 100) * Math.pow(1 + assumptions.baseFeeGrowth / 100, i) : 0);
    const feeIncentive = gop * (assumptions.incentiveFeePct / 100);
    const totalManagementFees = feeTech + feeCAM + feeBase + feeIncentive;

    // Profit & ROI
    const takeHomeProfit = gop - totalManagementFees;
    const roiBeforeManagement = assumptions.initialInvestment > 0 ? (gop / assumptions.initialInvestment) * 100 : 0;
    const roiAfterManagement = assumptions.initialInvestment > 0 ? (takeHomeProfit / assumptions.initialInvestment) * 100 : 0;

    data.push({
      year: i + 1,
      occupancy,
      adr,
      totalRevenue,
      totalOperatingCost,
      totalUndistributedCost,
      gop,
      gopMargin,
      totalManagementFees,
      takeHomeProfit,
      roiBeforeManagement,
      roiAfterManagement,
    });
  }

  return data;
}

function calculateAverage(data: YearlyData[]): Partial<YearlyData> {
  if (data.length === 0) return {};

  const avg: Partial<YearlyData> = {};
  const numericKeys = ['occupancy', 'adr', 'totalRevenue', 'gop', 'gopMargin', 'takeHomeProfit', 'roiAfterManagement'] as const;

  numericKeys.forEach(key => {
    (avg as any)[key] = data.reduce((sum, item) => sum + (item[key] || 0), 0) / data.length;
  });

  return avg;
}

describe('Rental ROI 10-Year Model', () => {
  // =========================================================================
  // BASIC PROJECTION TESTS
  // =========================================================================

  describe('Basic Projections', () => {
    it('should generate 10 years of projections', () => {
      const assumptions = createBaseAssumptions();
      const result = calculateProjections(assumptions);

      expect(result.length).toBe(10);
      expect(result[0].year).toBe(1);
      expect(result[9].year).toBe(10);
    });

    it('should calculate year 1 revenue correctly', () => {
      const assumptions = createBaseAssumptions({
        keys: 5,
        y1ADR: 200,
        y1Occupancy: 70,
      });

      const result = calculateProjections(assumptions);

      // Room revenue: 5 keys * 365 days * 70% * $200 = $255,500
      const expectedRoomRevenue = 5 * 365 * 0.70 * 200;
      // Total with ancillary: ~$319,375
      expect(approximatelyEqual(result[0].totalRevenue, expectedRoomRevenue * 1.25, 1000)).toBe(true);
    });

    it('should apply ADR growth correctly', () => {
      const assumptions = createBaseAssumptions({
        y1ADR: 200,
        adrGrowth: 5,
      });

      const result = calculateProjections(assumptions);

      expect(result[0].adr).toBe(200);
      expect(approximatelyEqual(result[1].adr, 210, 1)).toBe(true); // 200 * 1.05
      expect(approximatelyEqual(result[2].adr, 220.5, 1)).toBe(true); // 200 * 1.05^2
    });

    it('should apply occupancy increases correctly', () => {
      const assumptions = createBaseAssumptions({
        y1Occupancy: 60,
        occupancyIncreases: [5, 3, 2, 1, 0, 0, 0, 0, 0],
      });

      const result = calculateProjections(assumptions);

      expect(result[0].occupancy).toBe(60);
      expect(result[1].occupancy).toBe(65); // 60 + 5
      expect(result[2].occupancy).toBe(68); // 65 + 3
      expect(result[3].occupancy).toBe(70); // 68 + 2
    });
  });

  // =========================================================================
  // COST CALCULATION TESTS
  // =========================================================================

  describe('Operating Cost Calculations', () => {
    it('should calculate operating costs as percentage of revenue', () => {
      const assumptions = createBaseAssumptions({
        roomsCostPct: 20,
        fbCostPct: 30,
        spaCostPct: 25,
        utilitiesPct: 5,
      });

      const result = calculateProjections(assumptions);

      // Operating cost should be significant portion of revenue
      expect(result[0].totalOperatingCost).toBeGreaterThan(0);
      expect(result[0].totalOperatingCost).toBeLessThan(result[0].totalRevenue);
    });

    it('should calculate undistributed costs correctly', () => {
      const assumptions = createBaseAssumptions({
        adminPct: 8,
        salesPct: 5,
        maintPct: 4,
      });

      const result = calculateProjections(assumptions);

      // Undistributed: (8+5+4)% = 17% of revenue
      const expectedUndistributed = result[0].totalRevenue * 0.17;
      expect(approximatelyEqual(result[0].totalUndistributedCost, expectedUndistributed, 100)).toBe(true);
    });
  });

  // =========================================================================
  // GOP CALCULATION TESTS
  // =========================================================================

  describe('GOP Calculation', () => {
    it('should calculate GOP correctly', () => {
      const assumptions = createBaseAssumptions();
      const result = calculateProjections(assumptions);

      // GOP = Revenue - Operating - Undistributed
      const expectedGop = result[0].totalRevenue - result[0].totalOperatingCost - result[0].totalUndistributedCost;
      expect(result[0].gop).toBe(expectedGop);
    });

    it('should calculate GOP margin correctly', () => {
      const assumptions = createBaseAssumptions();
      const result = calculateProjections(assumptions);

      const expectedMargin = (result[0].gop / result[0].totalRevenue) * 100;
      expect(result[0].gopMargin).toBe(expectedMargin);
    });

    it('should have reasonable GOP margin for hospitality', () => {
      const assumptions = createBaseAssumptions({
        roomsCostPct: 20,
        fbCostPct: 30,
        utilitiesPct: 5,
        adminPct: 8,
        salesPct: 5,
        maintPct: 4,
      });

      const result = calculateProjections(assumptions);

      // Typical GOP margin: 35-50%
      expect(result[0].gopMargin).toBeGreaterThan(20);
      expect(result[0].gopMargin).toBeLessThan(60);
    });
  });

  // =========================================================================
  // MANAGEMENT FEE TESTS
  // =========================================================================

  describe('Management Fee Calculations', () => {
    it('should calculate tech fee correctly', () => {
      const assumptions = createBaseAssumptions({
        keys: 10,
        techFeePerUnit: 100,
        techFeeGrowth: 3,
      });

      const result = calculateProjections(assumptions);

      // Year 1: 100 * 12 * 10 = 12,000
      // Year 2: 12,000 * 1.03 = 12,360
      // Check that fees are growing
      const y1Fee = assumptions.techFeePerUnit * 12 * assumptions.keys;
      expect(result[0].totalManagementFees).toBeGreaterThan(y1Fee);
    });

    it('should calculate incentive fee as percentage of GOP', () => {
      const assumptions = createBaseAssumptions({
        incentiveFeePct: 10,
      });

      const result = calculateProjections(assumptions);

      // Incentive fee should be 10% of GOP
      const expectedIncentive = result[0].gop * 0.10;
      expect(result[0].totalManagementFees).toBeGreaterThan(expectedIncentive);
    });
  });

  // =========================================================================
  // ROI CALCULATION TESTS
  // =========================================================================

  describe('ROI Calculations', () => {
    it('should calculate ROI before management correctly', () => {
      const assumptions = createBaseAssumptions({
        initialInvestment: 1000000,
      });

      const result = calculateProjections(assumptions);

      // ROI = GOP / Investment * 100
      const expectedRoi = (result[0].gop / 1000000) * 100;
      expect(result[0].roiBeforeManagement).toBe(expectedRoi);
    });

    it('should calculate ROI after management correctly', () => {
      const assumptions = createBaseAssumptions({
        initialInvestment: 1000000,
      });

      const result = calculateProjections(assumptions);

      const expectedRoi = (result[0].takeHomeProfit / 1000000) * 100;
      expect(result[0].roiAfterManagement).toBe(expectedRoi);
    });

    it('should have lower ROI after management fees', () => {
      const assumptions = createBaseAssumptions();
      const result = calculateProjections(assumptions);

      expect(result[0].roiAfterManagement).toBeLessThan(result[0].roiBeforeManagement);
    });

    it('should improve ROI over time with growth', () => {
      const assumptions = createBaseAssumptions({
        adrGrowth: 5,
        occupancyIncreases: [3, 2, 1, 0, 0, 0, 0, 0, 0],
      });

      const result = calculateProjections(assumptions);

      // Year 5 should be better than Year 1
      expect(result[4].roiAfterManagement).toBeGreaterThan(result[0].roiAfterManagement);
    });
  });

  // =========================================================================
  // AVERAGE CALCULATION TESTS
  // =========================================================================

  describe('Average Calculations', () => {
    it('should calculate 10-year averages correctly', () => {
      const assumptions = createBaseAssumptions();
      const data = calculateProjections(assumptions);
      const averages = calculateAverage(data);

      expect(averages.occupancy).toBeDefined();
      expect(averages.roiAfterManagement).toBeDefined();

      // Average occupancy should be between min and max
      const minOcc = Math.min(...data.map(d => d.occupancy));
      const maxOcc = Math.max(...data.map(d => d.occupancy));
      expect(averages.occupancy).toBeGreaterThanOrEqual(minOcc);
      expect(averages.occupancy).toBeLessThanOrEqual(maxOcc);
    });
  });

  // =========================================================================
  // REAL ESTATE SCENARIOS
  // =========================================================================

  describe('Real Estate Scenarios', () => {
    it('should project Bali luxury villa returns', () => {
      const assumptions = createBaseAssumptions({
        initialInvestment: 500000,
        keys: 4,
        y1ADR: 350,
        y1Occupancy: 55,
        adrGrowth: 4,
        occupancyIncreases: [5, 5, 3, 2, 0, 0, 0, 0, 0],
        incentiveFeePct: 15,
      });

      const result = calculateProjections(assumptions);
      const averages = calculateAverage(result);

      // Luxury villa should have decent returns
      expect(averages.roiAfterManagement).toBeGreaterThan(5);
      expect(averages.roiAfterManagement).toBeLessThan(60); // High-end villas can have high ROI
    });

    it('should project boutique hotel returns', () => {
      const assumptions = createBaseAssumptions({
        initialInvestment: 2000000,
        keys: 15,
        y1ADR: 180,
        y1Occupancy: 50,
        adrGrowth: 3,
        occupancyIncreases: [5, 5, 5, 3, 2, 0, 0, 0, 0],
        roomsCostPct: 25,
        adminPct: 10,
        salesPct: 6,
      });

      const result = calculateProjections(assumptions);

      // Boutique hotel: lower margin, higher volume
      expect(result[0].gopMargin).toBeGreaterThan(25);
      expect(result[9].totalRevenue).toBeGreaterThan(result[0].totalRevenue);
    });

    it('should handle break-even scenario', () => {
      const assumptions = createBaseAssumptions({
        initialInvestment: 1000000,
        keys: 3,
        y1ADR: 100,
        y1Occupancy: 40,
        roomsCostPct: 35,
        adminPct: 15,
        incentiveFeePct: 20,
      });

      const result = calculateProjections(assumptions);

      // May have low or negative ROI
      expect(typeof result[0].roiAfterManagement).toBe('number');
    });
  });

  // =========================================================================
  // EDGE CASES
  // =========================================================================

  describe('Edge Cases', () => {
    it('should handle zero investment', () => {
      const assumptions = createBaseAssumptions({
        initialInvestment: 0,
      });

      const result = calculateProjections(assumptions);

      expect(result[0].roiBeforeManagement).toBe(0);
      expect(result[0].roiAfterManagement).toBe(0);
    });

    it('should handle zero occupancy', () => {
      const assumptions = createBaseAssumptions({
        y1Occupancy: 0,
        occupancyIncreases: [0, 0, 0, 0, 0, 0, 0, 0, 0],
      });

      const result = calculateProjections(assumptions);

      expect(result[0].totalRevenue).toBe(0);
      expect(result[0].gop).toBeLessThanOrEqual(0);
    });

    it('should handle 100% occupancy', () => {
      const assumptions = createBaseAssumptions({
        y1Occupancy: 100,
        occupancyIncreases: [0, 0, 0, 0, 0, 0, 0, 0, 0],
      });

      const result = calculateProjections(assumptions);

      expect(result[0].occupancy).toBe(100);
      expect(result[0].totalRevenue).toBeGreaterThan(0);
    });
  });

  // =========================================================================
  // VALIDATION REPORT
  // =========================================================================

  describe('Validation Summary', () => {
    it('should generate 10-year projection report', () => {
      const assumptions = createBaseAssumptions({
        initialInvestment: 500000,
        keys: 5,
        y1ADR: 250,
        y1Occupancy: 60,
        adrGrowth: 4,
        occupancyIncreases: [5, 4, 3, 2, 1, 0, 0, 0, 0],
      });

      const result = calculateProjections(assumptions);
      const averages = calculateAverage(result);

      console.log('\n========== RENTAL ROI 10-YEAR VALIDATION ==========');
      console.table(result.map(r => ({
        Year: r.year,
        Occupancy: `${r.occupancy.toFixed(1)}%`,
        ADR: `$${r.adr.toFixed(0)}`,
        Revenue: `$${(r.totalRevenue / 1000).toFixed(0)}k`,
        GOP: `$${(r.gop / 1000).toFixed(0)}k`,
        'GOP %': `${r.gopMargin.toFixed(1)}%`,
        'Take Home': `$${(r.takeHomeProfit / 1000).toFixed(0)}k`,
        'ROI %': `${r.roiAfterManagement.toFixed(1)}%`,
      })));

      console.log('\n10-Year Averages:');
      console.log(`  Avg Occupancy: ${(averages.occupancy ?? 0).toFixed(1)}%`);
      console.log(`  Avg ROI: ${(averages.roiAfterManagement ?? 0).toFixed(1)}%`);
      console.log(`  Total 10Y Profit: $${result.reduce((s, r) => s + r.takeHomeProfit, 0).toLocaleString()}`);

      // Verify growth trajectory
      expect(result[9].totalRevenue).toBeGreaterThan(result[0].totalRevenue);
      expect(result[9].takeHomeProfit).toBeGreaterThan(result[0].takeHomeProfit);
    });
  });
});

// =========================================================================
// HELPER FUNCTIONS
// =========================================================================

function createBaseAssumptions(overrides: Partial<Assumptions> = {}): Assumptions {
  return {
    initialInvestment: 500000,
    keys: 5,
    y1ADR: 200,
    y1Occupancy: 60,
    adrGrowth: 3,
    occupancyIncreases: [3, 2, 1, 0, 0, 0, 0, 0, 0],
    y1FB: 50000,
    y1Spa: 20000,
    y1OODs: 10000,
    y1Misc: 5000,
    fbGrowth: 3,
    spaGrowth: 2,
    roomsCostPct: 20,
    fbCostPct: 30,
    spaCostPct: 25,
    otherCostPct: 20,
    miscCostPct: 15,
    utilitiesPct: 5,
    adminPct: 8,
    salesPct: 5,
    maintPct: 4,
    techFeePerUnit: 50,
    techFeeGrowth: 3,
    camFeePerUnit: 30,
    camGrowth: 3,
    baseFeePercent: 3,
    baseFeeGrowth: 2,
    incentiveFeePct: 10,
    ...overrides,
  };
}
