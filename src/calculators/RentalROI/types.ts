
export type CurrencyCode = 'USD' | 'EUR' | 'AUD' | 'INR' | 'IDR' | 'CNY' | 'AED' | 'GBP' | 'RUB';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  locale: string;
  rate: number; // Rate relative to IDR (1 unit of currency = X IDR)
}

export type { User } from '../../lib/auth-store';

export interface YearlyData {
  year: number;
  calendarYear: number;
  
  // Operational Metrics
  keys: number;
  occupancy: number;
  occupancyIncrease: number;
  adr: number;
  adrGrowth: number;
  revpar: number;
  trevpar: number;

  // Revenue
  revenueRooms: number;
  revenueRoomsPercent: number;
  revenueFB: number;
  revenueFBPercent: number;
  revenueSpa: number;
  revenueSpaPercent: number;
  revenueOODs: number;
  revenueOODsPercent: number;
  revenueMisc: number;
  revenueMiscPercent: number;
  totalRevenue: number;
  revenueGrowth: number;

  // Operating Expenses
  costRooms: number;
  costRoomsPercent: number;
  costFB: number;
  costFBPercent: number;
  costSpa: number;
  costSpaPercent: number;
  costOther: number;
  costOtherPercent: number;
  costMisc: number;
  costMiscPercent: number;
  costUtilities: number;
  costUtilitiesPercent: number;
  totalOperatingCost: number;
  operatingCostPercent: number;

  // Undistributed Expenses
  undistributedAdmin: number;
  undistributedAdminPercent: number;
  undistributedSales: number;
  undistributedSalesPercent: number;
  undistributedMaintenance: number;
  undistributedMaintenancePercent: number;
  totalUndistributedCost: number;
  undistributedCostPercent: number;

  // GOP
  gop: number;
  gopMargin: number;

  // Management Fees
  feeCAM: number;
  feeCAMPercent: number;
  feeBase: number;
  feeBasePercent: number;
  feeTech: number;
  feeTechPercent: number;
  feeIncentive: number;
  feeIncentivePercent: number;
  totalManagementFees: number;
  managementFeesPercent: number;

  // Net Profit
  takeHomeProfit: number;
  profitMargin: number;

  // Summary ROI
  roiBeforeManagement: number;
  roiAfterManagement: number;
}

export interface Assumptions {
  initialInvestment: number;
  purchaseDate: string; // YYYY-MM format, purchase/investment start date
  keys: number;

  // Property Readiness
  isPropertyReady: boolean; // true = ready now, false = not ready yet
  propertyReadyDate: string; // YYYY-MM format, when property will be ready

  // Year 1 Bases
  y1Occupancy: number;
  y1ADR: number;
  y1FB: number;
  y1Spa: number;
  y1OODs: number;
  y1Misc: number;

  // Growth/Increases
  occupancyIncreases: (number | null)[]; // Index 1-9 (Y2 to Y10), null = unset (uses placeholder)
  adrGrowth: number;
  fbGrowth: number;
  spaGrowth: number;
  camGrowth: number;
  baseFeeGrowth: number;
  techFeeGrowth: number;

  // Cost Percentages
  roomsCostPct: number;
  fbCostPct: number;
  spaCostPct: number;
  otherCostPct: number;
  miscCostPct: number;
  utilitiesPct: number;

  // Undistributed Pct of Revenue
  adminPct: number;
  salesPct: number;
  maintPct: number;

  // Management Fee Bases (Y1)
  // CAM Fee: monthly per-unit fee × 12 × keys (only when operational)
  camFeePerUnit: number; // Monthly CAM fee per unit in IDR
  // Base Fee: percentage of total revenue (first operational year), then grows
  baseFeePercent: number; // % of total revenue (e.g., 2 for 2%)
  // Tech Fee: monthly per-unit fee × 12 × keys (charged even during development)
  techFeePerUnit: number; // Monthly tech fee per unit in IDR
  incentiveFeePct: number; // % of GOP
}
