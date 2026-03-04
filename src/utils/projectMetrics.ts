import type { CashFlow } from '../types/investment';
import type { TimelineDataPoint } from '../components/display/TimelineAnalysis';

/**
 * Calculate break-even timeline in months based on cash flows
 */
export function calculateBreakEvenMonths(cashFlows: CashFlow[]): number {
  let cumulative = 0;
  
  for (let i = 0; i < cashFlows.length; i++) {
    cumulative += cashFlows[i].amount;
    if (cumulative >= 0) {
      return i + 1;
    }
  }
  
  // If never breaks even, return a large number
  return cashFlows.length * 2;
}

/**
 * Calculate cash flow stability score (0-100)
 * Higher score = more stable/consistent positive cash flow
 */
export function calculateCashFlowStability(cashFlows: CashFlow[]): number {
  if (cashFlows.length === 0) return 0;

  // Calculate average positive cash flow
  const positiveFlows = cashFlows.filter(cf => cf.amount > 0);
  if (positiveFlows.length === 0) return 0;

  const avgPositive = positiveFlows.reduce((sum, cf) => sum + cf.amount, 0) / positiveFlows.length;
  const avgNegative = cashFlows.filter(cf => cf.amount < 0).length > 0
    ? Math.abs(cashFlows.filter(cf => cf.amount < 0).reduce((sum, cf) => sum + cf.amount, 0) / 
        cashFlows.filter(cf => cf.amount < 0).length)
    : 0;

  // Ratio of positive to negative average flows
  const ratio = avgNegative > 0 ? avgPositive / avgNegative : 100;
  
  // Convert ratio to 0-100 score
  // ratio of 1:1 = 50 score, 2:1 = 75 score, 3:1 = 90 score
  const stabilityScore = Math.min(100, (ratio - 1) * 33.33 + 50);
  
  return Math.max(0, stabilityScore);
}

/**
 * Generate timeline data points for chart visualization
 * Shows cumulative cash flow by month from project start to year 5
 */
export function generateTimelineData(
  cashFlows: CashFlow[],
  projectStartDate: Date
): TimelineDataPoint[] {
  const timelineData: TimelineDataPoint[] = [];
  let cumulative = 0;
  
  // Generate 60 months of data
  for (let month = 0; month < 60; month++) {
    const monthDate = new Date(projectStartDate);
    monthDate.setMonth(monthDate.getMonth() + month);
    
    // Find cash flows for this month
    const monthFlows = cashFlows.filter(cf => {
      const cfDate = new Date(cf.date);
      return cfDate.getFullYear() === monthDate.getFullYear() &&
             cfDate.getMonth() === monthDate.getMonth();
    });
    
    // Add flows for this month
    const monthTotal = monthFlows.reduce((sum, cf) => sum + cf.amount, 0);
    cumulative += monthTotal;
    
    const monthLabel = monthDate.toLocaleDateString('en-US', {
      year: '2-digit',
      month: 'short',
    });
    
    timelineData.push({
      month: month + 1,
      monthLabel,
      cumulativeCashFlow: cumulative,
      isBreakEven: cumulative >= 0,
    });
  }
  
  return timelineData;
}

/**
 * Calculate average monthly cash flow during rental period
 */
export function calculateAverageCashFlow(cashFlows: CashFlow[], months: number): number {
  if (months === 0) return 0;
  const total = cashFlows.reduce((sum, cf) => sum + cf.amount, 0);
  return total / months;
}

/**
 * Calculate risk score based on various factors
 * Returns 0-100 score where 100 is low risk
 */
export function calculateRiskScore(
  roi: number,
  breakEvenMonths: number,
  cashFlowStability: number
): number {
  let score = 50; // Start with neutral
  
  // ROI risk: higher ROI typically means higher risk
  if (roi < 5) {
    score += 20; // Very low return = low risk but poor return
  } else if (roi < 15) {
    score += 10; // Low return = some safety
  } else if (roi < 30) {
    score -= 10; // Moderate risk for moderate return
  } else {
    score -= 20; // High ROI = higher risk
  }
  
  // Break-even risk
  if (breakEvenMonths > 36) {
    score -= 20; // Long break-even = higher risk
  } else if (breakEvenMonths > 12) {
    score -= 10; // Moderate break-even time
  } else {
    score += 10; // Quick break-even = lower risk
  }
  
  // Stability helps reduce risk
  score += (cashFlowStability - 50) * 0.2;
  
  return Math.min(100, Math.max(0, score));
}

/**
 * Create a summary project object from investment calculator data
 */
export function createProjectSummary(
  calculatorId: string,
  data: any,
  result: any,
  currency: string = 'IDR'
) {
  // Extract or calculate key metrics
  const projectName = data.property?.projectName || 'Unnamed Project';
  const location = data.property?.location || '';
  const totalInvestment = data.property?.totalPrice || 0;
  
  // These would come from the specific calculator
  const roi = result?.rate || 0;
  const breakEvenMonths = calculateBreakEvenMonths(data.additionalCashFlows || []);
  const cashFlowStability = calculateCashFlowStability(data.additionalCashFlows || []);
  const riskScore = calculateRiskScore(roi * 100, breakEvenMonths, cashFlowStability);
  
  // Average monthly cash flow (assume during holding period)
  const holdPeriodMonths = (data.exit?.holdPeriodYears || 10) * 12;
  const avgCashFlow = calculateAverageCashFlow(data.additionalCashFlows || [], holdPeriodMonths);

  return {
    calculatorId,
    projectName,
    location,
    totalInvestment,
    roi,
    avgCashFlow,
    breakEvenMonths,
    investmentScore: calculateInvestmentScore({
      roi: roi * 100,
      cashFlowStability,
      breakEvenMonths,
      riskScore,
    }),
    currency,
    data,
  };
}

interface ScoreFactors {
  roi: number;
  cashFlowStability: number;
  breakEvenMonths: number;
  riskScore: number;
}

/**
 * Calculate the investment score (1-100)
 */
export function calculateInvestmentScore(factors: ScoreFactors): number {
  // ROI Score (0-100, normalized)
  const roiScore = Math.min(100, Math.max(0, (factors.roi / 50) * 100));
  
  // Stability Score
  const stabilityScore = Math.min(100, Math.max(0, factors.cashFlowStability));
  
  // Break-even Score
  let breakEvenScore: number;
  if (factors.breakEvenMonths <= 12) {
    breakEvenScore = 100;
  } else if (factors.breakEvenMonths <= 60) {
    breakEvenScore = 100 - ((factors.breakEvenMonths - 12) / 48) * 50;
  } else {
    breakEvenScore = Math.max(0, 50 - ((factors.breakEvenMonths - 60) / 60) * 50);
  }
  
  // Risk Score
  const riskScore = Math.min(100, Math.max(0, factors.riskScore));
  
  // Weighted average
  const weighted =
    roiScore * 0.4 +
    stabilityScore * 0.3 +
    breakEvenScore * 0.2 +
    riskScore * 0.1;
  
  return Math.round(weighted);
}
