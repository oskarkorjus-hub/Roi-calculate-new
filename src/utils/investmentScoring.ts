/**
 * Investment Score Algorithm
 * Score = (ROI × 0.4) + (CashFlow × 0.3) + (Stability × 0.2) + (LocationQuality × 0.1)
 * Result: 0-100 scale
 */

export interface InvestmentScoreComponents {
  roi_score: number; // 0-5 points
  cashflow_score: number; // 0-3 points
  stability_score: number; // 0-2 points
  location_score: number; // 0-1 point
  investmentScore: number; // 0-100
}

export interface InvestmentRisk {
  level: 'excellent' | 'very-good' | 'good' | 'moderate-risk' | 'high-risk';
  range: string;
  color: string;
  bgColor: string;
  interpretation: string;
}

/**
 * Calculate ROI score (0-5 points)
 * Raw ROI % divided by 20, capped at 5 points
 * Example: 50% ROI = 50/20 = 2.5 points
 */
export function calculateRoiScore(roiPercentage: number): number {
  const score = roiPercentage / 20;
  return Math.min(5, Math.max(0, score));
}

/**
 * Calculate cash flow score (0-3 points)
 * Normalized to property value (larger properties expected to have higher absolute cash flow)
 * Example: $50k annual = 3 points (max)
 */
export function calculateCashFlowScore(
  annualCashFlow: number,
  propertyValue: number
): number {
  if (propertyValue === 0) return 0;
  
  // Normalize cash flow as percentage of property value
  const cashFlowPercentage = (annualCashFlow / propertyValue) * 100;
  
  // Scale: 0-5% = 0 points, 5-10% = 3 points (max), 10%+ = 3 points
  let score: number;
  if (cashFlowPercentage <= 0) {
    score = 0;
  } else if (cashFlowPercentage >= 10) {
    score = 3;
  } else {
    score = (cashFlowPercentage / 10) * 3;
  }
  
  return Math.min(3, Math.max(0, score));
}

/**
 * Calculate stability score (0-2 points)
 * Based on break-even months
 * <12 months = 2 points (low risk)
 * 12-24 months = 1.5 points
 * 24-36 months = 1 point
 * >36 months = 0.5 points
 */
export function calculateStabilityScore(breakEvenMonths: number): number {
  if (breakEvenMonths < 12) return 2;
  if (breakEvenMonths < 24) return 1.5;
  if (breakEvenMonths < 36) return 1;
  return 0.5;
}

/**
 * Calculate location quality score (0-1 point)
 * Bali premium areas (Ubud, Seminyak, Canggu) = 1 point
 * Mid-tier areas = 0.67 point
 * Other = 0.33 point
 * Default = 0.5 (if location not specified)
 */
export function calculateLocationQualityScore(location: string): number {
  if (!location) return 0.5;

  const normalizedLocation = location.toLowerCase().trim();

  // Premium areas
  const premiumAreas = ['ubud', 'seminyak', 'canggu', 'sanur'];
  if (premiumAreas.some(area => normalizedLocation.includes(area))) {
    return 1;
  }

  // Mid-tier areas
  const midTierAreas = ['legian', 'kuta', 'padang', 'jimbaran', 'uluwatu', 'nusa dua'];
  if (midTierAreas.some(area => normalizedLocation.includes(area))) {
    return 0.67;
  }

  // Other Bali areas
  if (normalizedLocation.includes('bali')) {
    return 0.33;
  }

  // Non-Bali locations default
  return 0.5;
}

/**
 * Calculate full investment score (0-100)
 */
export function calculateInvestmentScore(
  roiPercentage: number,
  annualCashFlow: number,
  propertyValue: number,
  breakEvenMonths: number,
  location: string
): InvestmentScoreComponents {
  const roi_score = calculateRoiScore(roiPercentage);
  const cashflow_score = calculateCashFlowScore(annualCashFlow, propertyValue);
  const stability_score = calculateStabilityScore(breakEvenMonths);
  const location_score = calculateLocationQualityScore(location);

  // Weighted average: (40% + 30% + 20% + 10%) * 100 to normalize to 0-100 scale
  // Multiply each component by its max value's weight to get 0-100 scale
  const investmentScore = 
    (roi_score / 5) * 40 +      // ROI: 0-5 points → 0-40
    (cashflow_score / 3) * 30 + // CashFlow: 0-3 points → 0-30
    (stability_score / 2) * 20 + // Stability: 0-2 points → 0-20
    (location_score / 1) * 10;   // Location: 0-1 point → 0-10

  return {
    roi_score,
    cashflow_score,
    stability_score,
    location_score,
    investmentScore: Math.round(investmentScore),
  };
}

/**
 * Get investment risk level and interpretation
 */
export function getInvestmentRisk(score: number): InvestmentRisk {
  if (score >= 85) {
    return {
      level: 'excellent',
      range: '85-100',
      color: 'text-green-700',
      bgColor: 'bg-green-50',
      interpretation: 'Excellent investment opportunity with strong fundamentals and low risk profile.',
    };
  }
  if (score >= 70) {
    return {
      level: 'very-good',
      range: '70-84',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      interpretation: 'Very good investment with solid cash flow and reasonable risk profile.',
    };
  }
  if (score >= 60) {
    return {
      level: 'good',
      range: '60-69',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      interpretation: 'Good investment opportunity but requires careful monitoring of key metrics.',
    };
  }
  if (score >= 50) {
    return {
      level: 'moderate-risk',
      range: '50-59',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      interpretation: 'Moderate risk profile. Review break-even timeline and cash flow stability.',
    };
  }
  return {
    level: 'high-risk',
    range: '<50',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    interpretation: 'High risk investment. Consider addressing weak ROI, cash flow, or long break-even timeline.',
  };
}

/**
 * Generate detailed score interpretation
 */
export function generateScoreInterpretation(
  score: number,
  components: InvestmentScoreComponents,
  roi: number,
  breakEvenMonths: number,
  _location: string
): string {
  const risk = getInvestmentRisk(score);
  const strengths: string[] = [];
  const weaknesses: string[] = [];

  // Analyze components
  if (components.roi_score >= 3) strengths.push('excellent ROI');
  else if (components.roi_score < 1) weaknesses.push('low ROI');

  if (components.cashflow_score >= 2.5) strengths.push('strong cash flow');
  else if (components.cashflow_score < 1) weaknesses.push('weak cash flow');

  if (components.stability_score >= 1.5) strengths.push('quick break-even');
  else if (components.stability_score <= 1) weaknesses.push('long break-even timeline');

  if (components.location_score >= 0.8) strengths.push('premium location quality');
  else if (components.location_score < 0.5) weaknesses.push('lower location quality');

  let interpretation = `Score: ${score}/100 (${risk.range} - ${risk.level.replace(/-/g, ' ')}). `;

  if (strengths.length > 0) {
    interpretation += `Strengths: ${strengths.join(', ')}. `;
  }

  if (weaknesses.length > 0) {
    interpretation += `Areas to improve: ${weaknesses.join(', ')}. `;
  }

  // Add specific insights
  if (roi >= 50) {
    interpretation += `With ${roi.toFixed(1)}% ROI and ${breakEvenMonths} months to break-even, this could be a strong flip or development opportunity. `;
  }

  if (breakEvenMonths <= 12) {
    interpretation += 'Quick liquidity makes this suitable for short-term strategies. ';
  } else if (breakEvenMonths > 36) {
    interpretation += 'Long break-even period suggests a long-term hold strategy. ';
  }

  interpretation += risk.interpretation;

  return interpretation;
}

/**
 * Get color for score ring visualization
 */
export function getScoreColor(score: number): string {
  if (score >= 85) return '#10b981'; // green-500
  if (score >= 70) return '#3b82f6'; // blue-500
  if (score >= 60) return '#eab308'; // yellow-500
  if (score >= 50) return '#f97316'; // orange-500
  return '#ef4444'; // red-500
}

/**
 * Get background color for score ring visualization
 */
export function getScoreBgColor(score: number): string {
  if (score >= 85) return 'bg-green-50';
  if (score >= 70) return 'bg-blue-50';
  if (score >= 60) return 'bg-yellow-50';
  if (score >= 50) return 'bg-orange-50';
  return 'bg-red-50';
}
