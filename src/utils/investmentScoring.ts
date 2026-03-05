/**
 * Investment Score Algorithm
 * Calculator-specific scoring for different investment types
 * Result: 0-100 scale
 */

export interface InvestmentScoreComponents {
  roi_score: number; // 0-5 points
  cashflow_score: number; // 0-3 points
  stability_score: number; // 0-2 points
  location_score: number; // 0-1 point
  investmentScore: number; // 0-100
}

// Calculator-specific scoring configurations
interface CalculatorScoringConfig {
  roiWeight: number;
  roiMax: number; // What ROI gives max score
  cashFlowWeight: number;
  cashFlowMax: number; // What cash flow % gives max score
  stabilityWeight: number;
  stabilityMax: number; // Break-even months for max score
  locationWeight: number;
  customMetrics?: {
    name: string;
    weight: number;
    evaluate: (results: Record<string, any>) => number; // Returns 0-1
  }[];
}

const CALCULATOR_SCORING_CONFIGS: Record<string, CalculatorScoringConfig> = {
  'rental-roi': {
    roiWeight: 35,
    roiMax: 15, // 15% ROI is excellent for rentals
    cashFlowWeight: 35,
    cashFlowMax: 8, // 8% cash flow yield is excellent
    stabilityWeight: 20,
    stabilityMax: 24, // 24 months break-even is good
    locationWeight: 10,
  },
  'rental-projection': {
    roiWeight: 30,
    roiMax: 12,
    cashFlowWeight: 40,
    cashFlowMax: 10,
    stabilityWeight: 20,
    stabilityMax: 36,
    locationWeight: 10,
  },
  'cashflow': {
    roiWeight: 20,
    roiMax: 10,
    cashFlowWeight: 50, // Cash flow is primary metric
    cashFlowMax: 8,
    stabilityWeight: 20,
    stabilityMax: 24,
    locationWeight: 10,
  },
  'cap-rate': {
    roiWeight: 50, // Cap rate IS the ROI here
    roiMax: 8, // 8% cap rate is excellent
    cashFlowWeight: 25,
    cashFlowMax: 6,
    stabilityWeight: 15,
    stabilityMax: 36,
    locationWeight: 10,
  },
  'xirr': {
    roiWeight: 45, // XIRR is the main metric
    roiMax: 12, // 12% XIRR is excellent for development
    cashFlowWeight: 25,
    cashFlowMax: 3, // Lower expectation for large projects
    stabilityWeight: 20,
    stabilityMax: 48, // Development projects take longer
    locationWeight: 10,
  },
  'irr': {
    roiWeight: 50, // IRR is primary
    roiMax: 15,
    cashFlowWeight: 20,
    cashFlowMax: 5,
    stabilityWeight: 20,
    stabilityMax: 36,
    locationWeight: 10,
  },
  'npv': {
    roiWeight: 30,
    roiMax: 20,
    cashFlowWeight: 30,
    cashFlowMax: 5,
    stabilityWeight: 30, // NPV considers time value
    stabilityMax: 36,
    locationWeight: 10,
    customMetrics: [{
      name: 'profitabilityIndex',
      weight: 20,
      evaluate: (results) => Math.min(1, (results.profitabilityIndex || 1) / 1.5), // PI > 1.5 is excellent
    }],
  },
  'dev-feasibility': {
    roiWeight: 35,
    roiMax: 25, // Development expects higher returns
    cashFlowWeight: 15, // Less about ongoing cash flow
    cashFlowMax: 5,
    stabilityWeight: 25,
    stabilityMax: 36,
    locationWeight: 15,
    customMetrics: [{
      name: 'profitMargin',
      weight: 20,
      evaluate: (results) => Math.min(1, (results.profitMargin || 0) / 20), // 20% margin is excellent
    }],
  },
  'mortgage': {
    roiWeight: 10, // Not really about ROI
    roiMax: 5, // Lower rate is better (inverted)
    cashFlowWeight: 40, // Monthly payment affordability
    cashFlowMax: 30, // Debt service ratio
    stabilityWeight: 40, // Loan term stability
    stabilityMax: 240, // 20 years
    locationWeight: 10,
  },
  'financing': {
    roiWeight: 10,
    roiMax: 5,
    cashFlowWeight: 40,
    cashFlowMax: 30,
    stabilityWeight: 40,
    stabilityMax: 240,
    locationWeight: 10,
  },
  'indonesia-tax': {
    roiWeight: 40,
    roiMax: 15,
    cashFlowWeight: 30,
    cashFlowMax: 8,
    stabilityWeight: 15,
    stabilityMax: 36,
    locationWeight: 15,
    customMetrics: [{
      name: 'effectiveTaxRate',
      weight: 20,
      evaluate: (results) => Math.max(0, 1 - (results.effectiveTaxRate || 0) / 30), // Lower tax = better
    }],
  },
  'dev-budget': {
    roiWeight: 20,
    roiMax: 20,
    cashFlowWeight: 20,
    cashFlowMax: 5,
    stabilityWeight: 30,
    stabilityMax: 24,
    locationWeight: 10,
    customMetrics: [{
      name: 'budgetVariance',
      weight: 30,
      evaluate: (results) => Math.max(0, 1 - Math.abs(results.variance || 0) / 20), // Under budget = better
    }],
  },
  'risk-assessment': {
    roiWeight: 30,
    roiMax: 15,
    cashFlowWeight: 20,
    cashFlowMax: 8,
    stabilityWeight: 20,
    stabilityMax: 36,
    locationWeight: 10,
    customMetrics: [{
      name: 'riskScore',
      weight: 30,
      evaluate: (results) => Math.max(0, 1 - (results.riskScore || 50) / 100), // Lower risk = better
    }],
  },
};

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
 * Now supports calculator-specific scoring
 */
export function calculateInvestmentScore(
  roiPercentage: number,
  annualCashFlow: number,
  propertyValue: number,
  breakEvenMonths: number,
  location: string,
  calculatorType?: string,
  results?: Record<string, any>
): InvestmentScoreComponents {
  // Get calculator-specific config or use default
  const config = calculatorType
    ? CALCULATOR_SCORING_CONFIGS[calculatorType]
    : null;

  if (config) {
    return calculateCalculatorSpecificScore(
      roiPercentage,
      annualCashFlow,
      propertyValue,
      breakEvenMonths,
      location,
      config,
      results
    );
  }

  // Fallback to generic scoring
  const roi_score = calculateRoiScore(roiPercentage);
  const cashflow_score = calculateCashFlowScore(annualCashFlow, propertyValue);
  const stability_score = calculateStabilityScore(breakEvenMonths);
  const location_score = calculateLocationQualityScore(location);

  // Weighted average: (40% + 30% + 20% + 10%) * 100 to normalize to 0-100 scale
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
 * Calculator-specific scoring algorithm
 */
function calculateCalculatorSpecificScore(
  roiPercentage: number,
  annualCashFlow: number,
  propertyValue: number,
  breakEvenMonths: number,
  location: string,
  config: CalculatorScoringConfig,
  results?: Record<string, any>
): InvestmentScoreComponents {
  // Calculate ROI score based on calculator-specific max
  const roiNormalized = Math.min(1, Math.max(0, roiPercentage / config.roiMax));
  const roi_score = roiNormalized * 5; // Normalize to 0-5 for components

  // Calculate cash flow score based on calculator-specific expectations
  const cashFlowPercentage = propertyValue > 0 ? (annualCashFlow / propertyValue) * 100 : 0;
  const cashFlowNormalized = Math.min(1, Math.max(0, cashFlowPercentage / config.cashFlowMax));
  const cashflow_score = cashFlowNormalized * 3; // Normalize to 0-3 for components

  // Calculate stability score based on calculator-specific break-even expectations
  const stabilityNormalized = breakEvenMonths > 0
    ? Math.max(0, 1 - (breakEvenMonths / config.stabilityMax) * 0.5) // Less penalty for longer break-even
    : 1;
  const stability_score = Math.min(2, stabilityNormalized * 2); // Normalize to 0-2 for components

  // Location score (same across calculators)
  const location_score = calculateLocationQualityScore(location);

  // Calculate weighted score
  let totalWeight = config.roiWeight + config.cashFlowWeight + config.stabilityWeight + config.locationWeight;
  let investmentScore =
    roiNormalized * config.roiWeight +
    cashFlowNormalized * config.cashFlowWeight +
    stabilityNormalized * config.stabilityWeight +
    location_score * config.locationWeight;

  // Add custom metric scores if available
  if (config.customMetrics && results) {
    for (const metric of config.customMetrics) {
      const metricScore = metric.evaluate(results);
      investmentScore += metricScore * metric.weight;
      totalWeight += metric.weight;
    }
  }

  // Normalize to 0-100 scale
  const normalizedScore = (investmentScore / totalWeight) * 100;

  return {
    roi_score,
    cashflow_score,
    stability_score,
    location_score,
    investmentScore: Math.round(Math.min(100, Math.max(0, normalizedScore))),
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
