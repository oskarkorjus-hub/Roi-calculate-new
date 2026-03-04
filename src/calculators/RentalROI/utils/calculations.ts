
import type { Assumptions, YearlyData } from '../types';

// Helper to parse purchase date
function getPurchaseDate(assumptions: Assumptions): { year: number; month: number } {
  if (assumptions.purchaseDate) {
    const [year, month] = assumptions.purchaseDate.split('-').map(Number);
    return { year, month };
  }
  return { year: new Date().getFullYear(), month: 1 };
}

// Helper to derive baseYear from purchaseDate
function getBaseYear(assumptions: Assumptions): number {
  return getPurchaseDate(assumptions).year;
}

// Calculate the factor for partial year operations based on purchase date
// This is used when property IS ready at purchase
function getPurchaseYearFactor(calendarYear: number, assumptions: Assumptions): number {
  const { year: purchaseYear, month: purchaseMonth } = getPurchaseDate(assumptions);

  // Before purchase year: no operations
  if (calendarYear < purchaseYear) return 0;

  // Purchase year: prorate from purchase month
  if (calendarYear === purchaseYear) {
    const monthsOperational = 13 - purchaseMonth; // e.g., July (7) = 6 months
    return monthsOperational / 12;
  }

  // After purchase year: full year
  return 1;
}

// Calculate operational months factor for a year based on property ready date AND purchase date
function getOperationalFactor(calendarYear: number, assumptions: Assumptions): number {
  const { year: purchaseYear } = getPurchaseDate(assumptions);

  // Before purchase year: no operations possible
  if (calendarYear < purchaseYear) return 0;

  // If property is ready at purchase, use purchase date for proration
  if (assumptions.isPropertyReady) {
    return getPurchaseYearFactor(calendarYear, assumptions);
  }

  // Property is NOT ready - use property ready date
  if (!assumptions.propertyReadyDate) {
    // No ready date set but property not ready - use purchase date factor as fallback
    return getPurchaseYearFactor(calendarYear, assumptions);
  }

  const [readyYear, readyMonth] = assumptions.propertyReadyDate.split('-').map(Number);

  // If ready date is before this calendar year, full year operational
  // (but still consider purchase year for Y1)
  if (readyYear < calendarYear) {
    return getPurchaseYearFactor(calendarYear, assumptions);
  }

  // If ready date is after this calendar year, no operations
  if (readyYear > calendarYear) return 0;

  // Ready date is within this calendar year
  // Calculate months operational (from ready month to December)
  const monthsOperational = 13 - readyMonth;
  return monthsOperational / 12;
}

export function calculateProjections(assumptions: Assumptions): YearlyData[] {
  const data: YearlyData[] = [];
  const baseYear = getBaseYear(assumptions);

  // Pre-calculate first operational year index (used for growth calculations)
  let firstOperationalYearIndex = -1;
  for (let j = 0; j < 10; j++) {
    if (getOperationalFactor(baseYear + j, assumptions) > 0) {
      firstOperationalYearIndex = j;
      break;
    }
  }

  for (let i = 0; i < 10; i++) {
    const calendarYear = baseYear + i;
    const prevYear: YearlyData | null = i > 0 ? data[i - 1] : null;

    // Get operational factor for this year (affects occupancy due to property readiness)
    const operationalFactor = getOperationalFactor(calendarYear, assumptions);

    // Determine if operational now and if was operational last year
    const isOperational = operationalFactor > 0;
    const wasOperationalLastYear = prevYear ? getOperationalFactor(calendarYear - 1, assumptions) > 0 : false;

    // Operational Metrics
    const keys = assumptions.keys;

    // Occupancy calculation - matches spreadsheet logic:
    // - Development phase: 0% (property not operational)
    // - First operational year: y1Occupancy (base)
    // - Subsequent operational years: previous occupancy + yearly increase
    let occupancy: number;
    let occupancyIncrease: number;

    if (!isOperational) {
      // Development phase: no occupancy
      occupancy = 0;
      occupancyIncrease = 0;
    } else if (!wasOperationalLastYear) {
      // First operational year: use base occupancy (prorated if partial year)
      occupancy = assumptions.y1Occupancy * operationalFactor;
      occupancyIncrease = assumptions.y1Occupancy; // Show the base as the "increase" from 0
    } else {
      // Subsequent operational years: previous + increase
      // Get the occupancy increase for this year relative to first operational year
      const operationalYearNumber = i - firstOperationalYearIndex;
      occupancyIncrease = operationalYearNumber > 0 ? (assumptions.occupancyIncreases[operationalYearNumber - 1] ?? 0) : 0;

      // Un-prorate previous occupancy if it was a partial year
      const prevOpFactor = getOperationalFactor(calendarYear - 1, assumptions);
      const prevBaseOccupancy = prevOpFactor > 0 ? (prevYear?.occupancy || 0) / prevOpFactor : assumptions.y1Occupancy;

      occupancy = prevBaseOccupancy + occupancyIncrease;
    }

    let adr: number;
    let adrGrowth: number;

    if (!isOperational) {
      // Pre-operational years: ADR is 0
      adr = 0;
      adrGrowth = 0;
    } else if (!wasOperationalLastYear) {
      // First operational year: use base ADR, no growth yet
      adr = assumptions.y1ADR;
      adrGrowth = 0;
    } else {
      // Subsequent operational years: apply growth
      adrGrowth = assumptions.adrGrowth;
      adr = (prevYear?.adr || assumptions.y1ADR) * (1 + adrGrowth / 100);
    }
    
    // Key Performance Indicators
    const revpar = adr * (occupancy / 100);
    
    // Revenue Categories (prorated by operational factor when property not ready)
    const revenueRooms = keys * 365 * (occupancy / 100) * adr;


    // F&B, Spa, etc. grow from the BASE value (not from prorated output)
    // During development: output is 0 but base value still grows
    // First operational year: use base value (which has been growing)
    // Spreadsheet pattern: base value in first operational year, then grows
    let baseFB: number;
    let baseSpa: number;
    let baseOODs: number;
    let baseMisc: number;

    if (!isOperational) {
      // Development phase: calculate what the base WOULD be (for tracking growth)
      // but output will be 0
      if (i === 0) {
        baseFB = assumptions.y1FB;
        baseSpa = assumptions.y1Spa;
        baseOODs = assumptions.y1OODs;
        baseMisc = assumptions.y1Misc;
      } else {
        // During development, F&B doesn't grow (matches spreadsheet - growth starts from operational)
        baseFB = assumptions.y1FB;
        baseSpa = assumptions.y1Spa;
        baseOODs = assumptions.y1OODs;
        baseMisc = assumptions.y1Misc;
      }
    } else if (!wasOperationalLastYear) {
      // First operational year: use base Y1 values
      baseFB = assumptions.y1FB;
      baseSpa = assumptions.y1Spa;
      baseOODs = assumptions.y1OODs;
      baseMisc = assumptions.y1Misc;
    } else {
      // Subsequent operational years: grow from previous year's BASE (un-prorated)
      const prevOpFactor = getOperationalFactor(calendarYear - 1, assumptions);
      const prevBaseFB = prevOpFactor > 0 ? (prevYear?.revenueFB || 0) / prevOpFactor : assumptions.y1FB;
      const prevBaseSpa = prevOpFactor > 0 ? (prevYear?.revenueSpa || 0) / prevOpFactor : assumptions.y1Spa;

      baseFB = prevBaseFB * (1 + assumptions.fbGrowth / 100);
      baseSpa = prevBaseSpa * (1 + assumptions.spaGrowth / 100);
      baseOODs = prevYear?.revenueOODs || assumptions.y1OODs;
      baseMisc = prevYear?.revenueMisc || assumptions.y1Misc;
    }

    // Apply operational factor to get actual revenue (0 during development)
    const revenueFB = baseFB * operationalFactor;
    const revenueSpa = baseSpa * operationalFactor;
    const revenueOODs = baseOODs * operationalFactor;
    const revenueMisc = baseMisc * operationalFactor;
    
    const totalRevenue = revenueRooms + revenueFB + revenueSpa + revenueOODs + revenueMisc;
    const trevpar = totalRevenue / (keys * 365);
    const revenueGrowth = prevYear ? ((totalRevenue / prevYear.totalRevenue) - 1) * 100 : 0;

    // Percentages of Revenue
    const revenueRoomsPercent = totalRevenue ? (revenueRooms / totalRevenue) * 100 : 0;
    const revenueFBPercent = totalRevenue ? (revenueFB / totalRevenue) * 100 : 0;
    const revenueSpaPercent = totalRevenue ? (revenueSpa / totalRevenue) * 100 : 0;
    const revenueOODsPercent = totalRevenue ? (revenueOODs / totalRevenue) * 100 : 0;
    const revenueMiscPercent = totalRevenue ? (revenueMisc / totalRevenue) * 100 : 0;

    // Direct Operating Costs
    const costRooms = revenueRooms * (assumptions.roomsCostPct / 100);
    const costFB = revenueFB * (assumptions.fbCostPct / 100);
    const costSpa = revenueSpa * (assumptions.spaCostPct / 100);
    const costOther = revenueOODs * (assumptions.otherCostPct / 100);
    const costMisc = revenueMisc * (assumptions.miscCostPct / 100);
    const costUtilities = totalRevenue * (assumptions.utilitiesPct / 100);
    
    const totalOperatingCost = costRooms + costFB + costSpa + costOther + costMisc + costUtilities;
    const operatingCostPercent = totalRevenue ? (totalOperatingCost / totalRevenue) * 100 : 0;

    // Undistributed Expenses
    const undistributedAdmin = totalRevenue * (assumptions.adminPct / 100);
    const undistributedSales = totalRevenue * (assumptions.salesPct / 100);
    const undistributedMaintenance = totalRevenue * (assumptions.maintPct / 100);
    
    const totalUndistributedCost = undistributedAdmin + undistributedSales + undistributedMaintenance;
    const undistributedCostPercent = totalRevenue ? (totalUndistributedCost / totalRevenue) * 100 : 0;

    // GOP Calculation
    const gop = totalRevenue - totalOperatingCost - totalUndistributedCost;
    const gopMargin = totalRevenue ? (gop / totalRevenue) * 100 : 0;

    // Management & Ownership Fees
    // Following the spreadsheet logic:
    // - Tech Fee: Always charged (even during development), but growth only starts from first operational year
    // - CAM Fee: Only when operational, grows from previous year
    // - Base Fee: First operational year = % of revenue, then grows from that base

    const purchaseYearFactor = getPurchaseYearFactor(calendarYear, assumptions);

    // Tech Fee: Charged from year 1 (even during development)
    // But growth only applies AFTER the first operational year (matching spreadsheet)
    // Formula: techFeePerUnit × 12 × keys, grows with techFeeGrowth from first operational year
    let feeTech: number;
    const baseAnnualTechFee = assumptions.techFeePerUnit * 12 * assumptions.keys;

    if (i === 0) {
      // First year: base tech fee (prorated for partial year if purchased mid-year)
      feeTech = baseAnnualTechFee * purchaseYearFactor;
    } else if (firstOperationalYearIndex < 0 || i <= firstOperationalYearIndex) {
      // Development phase OR first operational year: full base fee, no growth
      feeTech = baseAnnualTechFee;
    } else {
      // After first operational year: compound growth from first operational year
      const yearsOfGrowth = i - firstOperationalYearIndex;
      feeTech = baseAnnualTechFee * Math.pow(1 + assumptions.techFeeGrowth / 100, yearsOfGrowth);
    }

    // CAM Fee: Only when property is operational
    // Formula: camFeePerUnit × 12 × keys (only when operational), grows with camGrowth
    let feeCAM: number;
    if (!isOperational) {
      // Not operational yet: no CAM fee
      feeCAM = 0;
    } else if (!wasOperationalLastYear) {
      // First operational year: base CAM fee (prorated by operational factor)
      feeCAM = assumptions.camFeePerUnit * 12 * assumptions.keys * operationalFactor;
    } else {
      // Subsequent operational years: grow from previous year
      const prevOpFactor = getOperationalFactor(calendarYear - 1, assumptions);
      const prevUnprorated = prevOpFactor > 0 ? (prevYear?.feeCAM || 0) / prevOpFactor : assumptions.camFeePerUnit * 12 * assumptions.keys;
      feeCAM = prevUnprorated * (1 + assumptions.camGrowth / 100) * operationalFactor;
    }

    // Base Fee: Percentage of total revenue (first operational year), then grows
    // Formula: baseFeePercent × totalRevenue (first year), then grows with baseFeeGrowth
    let feeBase: number;
    if (!isOperational || totalRevenue === 0) {
      // Not operational or no revenue: no base fee
      feeBase = 0;
    } else if (!wasOperationalLastYear) {
      // First operational year: calculate as % of revenue
      feeBase = totalRevenue * (assumptions.baseFeePercent / 100);
    } else {
      // Subsequent operational years: grow from previous year's base fee
      // Note: We grow from the actual previous fee, not recalculate from revenue
      const prevBaseFee = prevYear?.feeBase || 0;
      feeBase = prevBaseFee * (1 + assumptions.baseFeeGrowth / 100);
    }

    // Incentive Fee: % of GOP (only when operational)
    const feeIncentive = isOperational ? gop * (assumptions.incentiveFeePct / 100) : 0;
    
    const totalManagementFees = feeCAM + feeBase + feeTech + feeIncentive;
    const managementFeesPercent = totalRevenue ? (totalManagementFees / totalRevenue) * 100 : 0;

    // Final Profit & ROI
    const takeHomeProfit = gop - totalManagementFees;
    const profitMargin = totalRevenue ? (takeHomeProfit / totalRevenue) * 100 : 0;

    const roiBeforeManagement = assumptions.initialInvestment ? (gop / assumptions.initialInvestment) * 100 : 0;
    const roiAfterManagement = assumptions.initialInvestment ? (takeHomeProfit / assumptions.initialInvestment) * 100 : 0;

    data.push({
      year: i + 1,
      calendarYear,
      keys,
      occupancy,
      occupancyIncrease,
      adr,
      adrGrowth,
      revpar,
      trevpar,
      revenueRooms, revenueRoomsPercent,
      revenueFB, revenueFBPercent,
      revenueSpa, revenueSpaPercent,
      revenueOODs, revenueOODsPercent,
      revenueMisc, revenueMiscPercent,
      totalRevenue, revenueGrowth,
      costRooms, costRoomsPercent: assumptions.roomsCostPct,
      costFB, costFBPercent: assumptions.fbCostPct,
      costSpa, costSpaPercent: assumptions.spaCostPct,
      costOther, costOtherPercent: assumptions.otherCostPct,
      costMisc, costMiscPercent: assumptions.miscCostPct,
      costUtilities, costUtilitiesPercent: assumptions.utilitiesPct,
      totalOperatingCost, operatingCostPercent,
      undistributedAdmin, undistributedAdminPercent: assumptions.adminPct,
      undistributedSales, undistributedSalesPercent: assumptions.salesPct,
      undistributedMaintenance, undistributedMaintenancePercent: assumptions.maintPct,
      totalUndistributedCost, undistributedCostPercent,
      gop, gopMargin,
      feeCAM, feeCAMPercent: totalRevenue ? (feeCAM / totalRevenue) * 100 : 0,
      feeBase, feeBasePercent: totalRevenue ? (feeBase / totalRevenue) * 100 : 0,
      feeTech, feeTechPercent: totalRevenue ? (feeTech / totalRevenue) * 100 : 0,
      feeIncentive, feeIncentivePercent: assumptions.incentiveFeePct,
      totalManagementFees, managementFeesPercent,
      takeHomeProfit, profitMargin,
      roiBeforeManagement, roiAfterManagement
    });
  }

  return data;
}

export function calculateAverage(data: YearlyData[]): Partial<YearlyData> {
  const avg: any = {};
  const count = data.length;
  if (count === 0) return avg;

  const numericKeys = [
    'occupancy', 'adr', 'revpar', 'trevpar', 
    'totalRevenue', 'totalOperatingCost', 'totalUndistributedCost', 
    'gop', 'gopMargin', 'totalManagementFees', 'takeHomeProfit', 
    'profitMargin', 'roiBeforeManagement', 'roiAfterManagement'
  ];
  
  numericKeys.forEach(k => {
    avg[k] = data.reduce((sum, item) => sum + ((item as any)[k] || 0), 0) / count;
  });

  return avg;
}
