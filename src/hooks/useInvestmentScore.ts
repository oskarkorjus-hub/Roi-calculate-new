import { useMemo } from 'react';
import type { InvestmentScoreFactors } from '../types/portfolio';

export interface ScoreInput {
  roi: number; // Percentage, e.g., 25 for 25%
  cashFlowStability: number; // 0-100, higher is more stable
  breakEvenMonths: number; // Number of months to break even
  riskScore: number; // 0-100, 0 is high risk, 100 is low risk
}

export function useInvestmentScore(input: ScoreInput) {
  const factors = useMemo<InvestmentScoreFactors>(() => {
    // Safely extract values with NaN fallback
    const roi = isNaN(input.roi) ? 0 : input.roi;
    const cashFlowStability = isNaN(input.cashFlowStability) ? 0 : input.cashFlowStability;
    const breakEvenMonths = isNaN(input.breakEvenMonths) ? 0 : input.breakEvenMonths;
    const riskScore = isNaN(input.riskScore) ? 0 : input.riskScore;

    // ROI Score (0-100, normalized from percentage)
    // Assume 50% ROI = 100 score, linear scale from 0% to 50%
    const roiScore = Math.min(100, Math.max(0, (roi / 50) * 100));

    // Cash Flow Stability (already 0-100)
    const stabilityScore = Math.min(100, Math.max(0, cashFlowStability));

    // Break-Even Timeline Score (0-100, inversed)
    // Assume 0-12 months = good, 12-60 months = acceptable, 60+ = poor
    let breakEvenScore: number;
    if (breakEvenMonths <= 12) {
      breakEvenScore = 100;
    } else if (breakEvenMonths <= 60) {
      breakEvenScore = 100 - ((breakEvenMonths - 12) / 48) * 50; // 100 to 50
    } else {
      breakEvenScore = Math.max(0, 50 - ((breakEvenMonths - 60) / 60) * 50); // 50 to 0
    }

    // Risk Score (already 0-100)
    const riskScoreSafe = Math.min(100, Math.max(0, riskScore));

    return {
      roi: roiScore,
      cashFlowStability: stabilityScore,
      breakEvenTimeline: breakEvenScore,
      riskScore: riskScoreSafe,
    };
  }, [input]);

  const overallScore = useMemo(() => {
    const weighted =
      factors.roi * 0.4 +
      factors.cashFlowStability * 0.3 +
      factors.breakEvenTimeline * 0.2 +
      factors.riskScore * 0.1;
    const score = Math.round(weighted);
    return isNaN(score) ? 0 : score;
  }, [factors]);

  const breakdown = useMemo(() => {
    return {
      roi: Math.round(factors.roi),
      cashFlowStability: Math.round(factors.cashFlowStability),
      breakEvenTimeline: Math.round(factors.breakEvenTimeline),
      riskScore: Math.round(factors.riskScore),
    };
  }, [factors]);

  const scoreLabel = useMemo(() => {
    if (overallScore >= 90) return 'Excellent';
    if (overallScore >= 75) return 'Very Good';
    if (overallScore >= 60) return 'Good';
    if (overallScore >= 45) return 'Acceptable';
    if (overallScore >= 30) return 'Risky';
    return 'Very Risky';
  }, [overallScore]);

  const scoreColor = useMemo(() => {
    if (overallScore >= 90) return 'text-green-700';
    if (overallScore >= 75) return 'text-green-600';
    if (overallScore >= 60) return 'text-blue-600';
    if (overallScore >= 45) return 'text-yellow-600';
    if (overallScore >= 30) return 'text-orange-600';
    return 'text-red-600';
  }, [overallScore]);

  const bgColor = useMemo(() => {
    if (overallScore >= 90) return 'bg-green-50';
    if (overallScore >= 75) return 'bg-green-50';
    if (overallScore >= 60) return 'bg-blue-50';
    if (overallScore >= 45) return 'bg-yellow-50';
    if (overallScore >= 30) return 'bg-orange-50';
    return 'bg-red-50';
  }, [overallScore]);

  return {
    overallScore,
    breakdown,
    factors,
    scoreLabel,
    scoreColor,
    bgColor,
    description: getScoreDescription(overallScore, breakdown),
  };
}

function getScoreDescription(_score: number, breakdown: Record<string, number>): string {
  const reasons: string[] = [];

  if (breakdown.roi >= 80) {
    reasons.push('Excellent ROI potential');
  } else if (breakdown.roi < 40) {
    reasons.push('Low ROI');
  }

  if (breakdown.cashFlowStability >= 80) {
    reasons.push('Strong cash flow stability');
  } else if (breakdown.cashFlowStability < 40) {
    reasons.push('Unstable cash flow');
  }

  if (breakdown.breakEvenTimeline >= 80) {
    reasons.push('Quick break-even timeline');
  } else if (breakdown.breakEvenTimeline < 40) {
    reasons.push('Long break-even period');
  }

  if (breakdown.riskScore >= 80) {
    reasons.push('Low risk profile');
  } else if (breakdown.riskScore < 40) {
    reasons.push('High risk profile');
  }

  if (reasons.length === 0) {
    reasons.push('Mixed profile - review details');
  }

  return reasons.join('. ');
}
