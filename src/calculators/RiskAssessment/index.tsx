import { useState, useCallback, useMemo, useEffect } from 'react';
import { Toast } from '../../components/ui/Toast';
import { UsageBadge } from '../../components/ui/UsageBadge';
import { SaveToPortfolioButton } from '../../components/SaveToPortfolioButton';
import { ReportPreviewModal } from '../../components/ui/ReportPreviewModal';
import { generateRiskAssessmentReport } from '../../hooks/useReportGenerator';
import { formatCurrency, parseDecimalInput } from '../../utils/numberParsing';
import { Tooltip } from '../../components/ui/Tooltip';
import { RiskScorePanel } from './components/RiskScorePanel';
import { RiskBreakdown } from './components/RiskBreakdown';
import { ScenarioAnalysis } from './components/ScenarioAnalysis';
import { SensitivityChart } from './components/SensitivityChart';
import { RiskMitigation } from './components/RiskMitigation';

type CurrencyType = 'IDR' | 'USD' | 'AUD' | 'EUR' | 'GBP';
type PropertyType = 'villa' | 'apartment' | 'land' | 'commercial' | 'hotel';
type MarketLocation = 'bali-seminyak' | 'bali-canggu' | 'bali-ubud' | 'bali-uluwatu' | 'jakarta' | 'lombok' | 'other';
type CashFlowType = 'stable' | 'moderate' | 'volatile';
type RentalStrategy = 'str' | 'ltr' | 'mixed';
type OwnershipType = 'freehold' | 'leasehold' | 'pt-pma';

export interface RiskInputs {
  currency: CurrencyType;

  // Basic Inputs
  projectROI: number;
  annualCashFlow: number;
  cashFlowType: CashFlowType;
  breakEvenMonths: number;
  investmentAmount: number;
  marketLocation: MarketLocation;
  propertyType: PropertyType;

  // Financial Risk Factors
  debtServiceCoverageRatio: number;
  leverageRatio: number;
  equityAmount: number;
  debtAmount: number;
  monthlyDebtService: number;

  // Market Risk Factors
  marketStability: 'growing' | 'stable' | 'declining';
  rentalStrategy: RentalStrategy;
  averageOccupancy: number;
  priceVolatility: 'low' | 'moderate' | 'high';
  demandTrend: 'increasing' | 'stable' | 'decreasing';

  // Regulatory Risk Factors
  strAllowed: boolean;
  ownershipType: OwnershipType;
  taxIncentivesExpiring: boolean;
  permitDifficulty: 'easy' | 'moderate' | 'difficult';
  politicalStability: 'stable' | 'moderate' | 'unstable';

  // Property-Specific Risk Factors
  propertyAge: number;
  propertyCondition: 'excellent' | 'good' | 'fair' | 'poor';
  locationQuality: 'prime' | 'good' | 'average' | 'remote';
  amenityLevel: 'luxury' | 'standard' | 'basic';
  managementBurden: 'low' | 'moderate' | 'high';
  exitLiquidity: 'high' | 'moderate' | 'low';
}

export interface RiskScore {
  overall: number;
  financial: number;
  market: number;
  regulatory: number;
  propertySpecific: number;
  factors: RiskFactor[];
}

export interface RiskFactor {
  category: string;
  name: string;
  score: number;
  maxScore: number;
  impact: 'low' | 'moderate' | 'high';
  description: string;
}

export interface ScenarioResult {
  name: string;
  roi: number;
  riskScore: number;
  cashFlow: number;
  description: string;
}

const INITIAL_INPUTS: RiskInputs = {
  currency: 'IDR',

  // Basic
  projectROI: 0,
  annualCashFlow: 0,
  cashFlowType: 'moderate',
  breakEvenMonths: 0,
  investmentAmount: 0,
  marketLocation: 'bali-canggu',
  propertyType: 'villa',

  // Financial
  debtServiceCoverageRatio: 0,
  leverageRatio: 0,
  equityAmount: 0,
  debtAmount: 0,
  monthlyDebtService: 0,

  // Market
  marketStability: 'growing',
  rentalStrategy: 'str',
  averageOccupancy: 0,
  priceVolatility: 'moderate',
  demandTrend: 'increasing',

  // Regulatory
  strAllowed: true,
  ownershipType: 'leasehold',
  taxIncentivesExpiring: false,
  permitDifficulty: 'moderate',
  politicalStability: 'stable',

  // Property
  propertyAge: 0,
  propertyCondition: 'excellent',
  locationQuality: 'prime',
  amenityLevel: 'luxury',
  managementBurden: 'moderate',
  exitLiquidity: 'moderate',
};

const symbols: Record<CurrencyType, string> = {
  IDR: 'Rp',
  USD: '$',
  AUD: 'A$',
  EUR: '€',
  GBP: '£',
};

const locationLabels: Record<MarketLocation, string> = {
  'bali-seminyak': 'Bali - Seminyak',
  'bali-canggu': 'Bali - Canggu',
  'bali-ubud': 'Bali - Ubud',
  'bali-uluwatu': 'Bali - Uluwatu',
  'jakarta': 'Jakarta',
  'lombok': 'Lombok',
  'other': 'Other Location',
};

const propertyLabels: Record<PropertyType, string> = {
  'villa': 'Villa',
  'apartment': 'Apartment',
  'land': 'Land',
  'commercial': 'Commercial',
  'hotel': 'Hotel/Resort',
};

// Market benchmarks for comparison
const MARKET_BENCHMARKS: Record<PropertyType, number> = {
  'villa': 45,
  'apartment': 35,
  'land': 55,
  'commercial': 40,
  'hotel': 50,
};

export function RiskAssessment() {
  const [inputs, setInputs] = useState<RiskInputs>(INITIAL_INPUTS);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'breakdown' | 'scenarios' | 'mitigation'>('overview');

  // Calculate risk scores
  const riskScore = useMemo((): RiskScore => {
    const factors: RiskFactor[] = [];

    // === FINANCIAL RISK (40% weight) ===
    let financialScore = 0;

    // ROI Quality (0-20 points)
    let roiScore = 0;
    if (inputs.projectROI >= 20) roiScore = 0;
    else if (inputs.projectROI >= 15) roiScore = 5;
    else if (inputs.projectROI >= 10) roiScore = 10;
    else if (inputs.projectROI >= 5) roiScore = 15;
    else roiScore = 20;
    factors.push({
      category: 'Financial',
      name: 'ROI Quality',
      score: roiScore,
      maxScore: 20,
      impact: roiScore > 12 ? 'high' : roiScore > 6 ? 'moderate' : 'low',
      description: inputs.projectROI >= 20 ? 'Excellent ROI above 20%' :
                   inputs.projectROI >= 10 ? 'Moderate ROI between 10-20%' : 'Low ROI below 10%',
    });
    financialScore += roiScore;

    // Cash Flow Consistency (0-15 points)
    let cfScore = inputs.cashFlowType === 'stable' ? 0 : inputs.cashFlowType === 'moderate' ? 8 : 15;
    factors.push({
      category: 'Financial',
      name: 'Cash Flow Consistency',
      score: cfScore,
      maxScore: 15,
      impact: cfScore > 10 ? 'high' : cfScore > 5 ? 'moderate' : 'low',
      description: inputs.cashFlowType === 'stable' ? 'Predictable, steady cash flow' :
                   inputs.cashFlowType === 'moderate' ? 'Some seasonal variation' : 'Highly variable cash flow',
    });
    financialScore += cfScore;

    // DSCR (0-15 points)
    let dscrScore = 0;
    if (inputs.debtServiceCoverageRatio >= 1.5) dscrScore = 0;
    else if (inputs.debtServiceCoverageRatio >= 1.25) dscrScore = 5;
    else if (inputs.debtServiceCoverageRatio >= 1.0) dscrScore = 10;
    else dscrScore = 15;
    factors.push({
      category: 'Financial',
      name: 'Debt Service Coverage',
      score: dscrScore,
      maxScore: 15,
      impact: dscrScore > 10 ? 'high' : dscrScore > 5 ? 'moderate' : 'low',
      description: `DSCR of ${inputs.debtServiceCoverageRatio.toFixed(2)}x - ${
        inputs.debtServiceCoverageRatio >= 1.25 ? 'healthy buffer' : 'tight margin'}`,
    });
    financialScore += dscrScore;

    // Leverage Ratio (0-15 points)
    let leverageScore = 0;
    if (inputs.leverageRatio <= 0.5) leverageScore = 0;
    else if (inputs.leverageRatio <= 0.7) leverageScore = 5;
    else if (inputs.leverageRatio <= 0.8) leverageScore = 10;
    else leverageScore = 15;
    factors.push({
      category: 'Financial',
      name: 'Leverage Ratio',
      score: leverageScore,
      maxScore: 15,
      impact: leverageScore > 10 ? 'high' : leverageScore > 5 ? 'moderate' : 'low',
      description: `${(inputs.leverageRatio * 100).toFixed(0)}% debt to total investment`,
    });
    financialScore += leverageScore;

    // Break-even Timeline (0-15 points)
    let beScore = 0;
    if (inputs.breakEvenMonths <= 12) beScore = 0;
    else if (inputs.breakEvenMonths <= 24) beScore = 5;
    else if (inputs.breakEvenMonths <= 36) beScore = 10;
    else beScore = 15;
    factors.push({
      category: 'Financial',
      name: 'Break-even Timeline',
      score: beScore,
      maxScore: 15,
      impact: beScore > 10 ? 'high' : beScore > 5 ? 'moderate' : 'low',
      description: `${inputs.breakEvenMonths} months to break even`,
    });
    financialScore += beScore;

    // === MARKET RISK (30% weight) ===
    let marketScore = 0;

    // Market Stability (0-15 points)
    let stabilityScore = inputs.marketStability === 'growing' ? 0 : inputs.marketStability === 'stable' ? 5 : 15;
    factors.push({
      category: 'Market',
      name: 'Market Stability',
      score: stabilityScore,
      maxScore: 15,
      impact: stabilityScore > 10 ? 'high' : stabilityScore > 5 ? 'moderate' : 'low',
      description: `Market is ${inputs.marketStability}`,
    });
    marketScore += stabilityScore;

    // Seasonal Volatility (0-15 points)
    let seasonalScore = inputs.rentalStrategy === 'ltr' ? 0 : inputs.rentalStrategy === 'mixed' ? 8 : 15;
    factors.push({
      category: 'Market',
      name: 'Seasonal Volatility',
      score: seasonalScore,
      maxScore: 15,
      impact: seasonalScore > 10 ? 'high' : seasonalScore > 5 ? 'moderate' : 'low',
      description: inputs.rentalStrategy === 'str' ? 'High STR seasonal variation (40%+)' :
                   inputs.rentalStrategy === 'mixed' ? 'Mixed strategy reduces volatility' : 'LTR provides stable income',
    });
    marketScore += seasonalScore;

    // Occupancy Risk (0-15 points)
    let occScore = 0;
    if (inputs.averageOccupancy >= 75) occScore = 0;
    else if (inputs.averageOccupancy >= 60) occScore = 5;
    else if (inputs.averageOccupancy >= 45) occScore = 10;
    else occScore = 15;
    factors.push({
      category: 'Market',
      name: 'Occupancy Risk',
      score: occScore,
      maxScore: 15,
      impact: occScore > 10 ? 'high' : occScore > 5 ? 'moderate' : 'low',
      description: `${inputs.averageOccupancy}% average occupancy`,
    });
    marketScore += occScore;

    // Price Volatility (0-10 points)
    let priceVolScore = inputs.priceVolatility === 'low' ? 0 : inputs.priceVolatility === 'moderate' ? 5 : 10;
    factors.push({
      category: 'Market',
      name: 'Price Volatility',
      score: priceVolScore,
      maxScore: 10,
      impact: priceVolScore > 6 ? 'high' : priceVolScore > 3 ? 'moderate' : 'low',
      description: `${inputs.priceVolatility.charAt(0).toUpperCase() + inputs.priceVolatility.slice(1)} price fluctuations`,
    });
    marketScore += priceVolScore;

    // Demand Trend (0-10 points)
    let demandScore = inputs.demandTrend === 'increasing' ? 0 : inputs.demandTrend === 'stable' ? 5 : 10;
    factors.push({
      category: 'Market',
      name: 'Demand Trend',
      score: demandScore,
      maxScore: 10,
      impact: demandScore > 6 ? 'high' : demandScore > 3 ? 'moderate' : 'low',
      description: `Demand is ${inputs.demandTrend}`,
    });
    marketScore += demandScore;

    // === REGULATORY RISK (15% weight) ===
    let regulatoryScore = 0;

    // STR Restrictions (0-10 points)
    let strScore = inputs.strAllowed ? 0 : (inputs.rentalStrategy === 'str' ? 10 : 5);
    factors.push({
      category: 'Regulatory',
      name: 'STR Restrictions',
      score: strScore,
      maxScore: 10,
      impact: strScore > 6 ? 'high' : strScore > 3 ? 'moderate' : 'low',
      description: inputs.strAllowed ? 'Short-term rentals allowed' : 'STR restrictions in place',
    });
    regulatoryScore += strScore;

    // Ownership Structure Risk (0-10 points)
    let ownershipScore = inputs.ownershipType === 'freehold' ? 0 : inputs.ownershipType === 'leasehold' ? 5 : 8;
    factors.push({
      category: 'Regulatory',
      name: 'Ownership Structure',
      score: ownershipScore,
      maxScore: 10,
      impact: ownershipScore > 6 ? 'high' : ownershipScore > 3 ? 'moderate' : 'low',
      description: `${inputs.ownershipType === 'freehold' ? 'Freehold ownership' :
                     inputs.ownershipType === 'leasehold' ? 'Leasehold - renewal risk' : 'PT PMA - complex structure'}`,
    });
    regulatoryScore += ownershipScore;

    // Tax Law Changes (0-8 points)
    let taxScore = inputs.taxIncentivesExpiring ? 8 : 0;
    factors.push({
      category: 'Regulatory',
      name: 'Tax Law Changes',
      score: taxScore,
      maxScore: 8,
      impact: taxScore > 5 ? 'high' : taxScore > 2 ? 'moderate' : 'low',
      description: inputs.taxIncentivesExpiring ? 'Tax incentives may expire' : 'No imminent tax changes',
    });
    regulatoryScore += taxScore;

    // Permit Requirements (0-8 points)
    let permitScore = inputs.permitDifficulty === 'easy' ? 0 : inputs.permitDifficulty === 'moderate' ? 4 : 8;
    factors.push({
      category: 'Regulatory',
      name: 'Permit Requirements',
      score: permitScore,
      maxScore: 8,
      impact: permitScore > 5 ? 'high' : permitScore > 2 ? 'moderate' : 'low',
      description: `${inputs.permitDifficulty.charAt(0).toUpperCase() + inputs.permitDifficulty.slice(1)} permit process`,
    });
    regulatoryScore += permitScore;

    // Political Stability (0-8 points)
    let politicalScore = inputs.politicalStability === 'stable' ? 0 : inputs.politicalStability === 'moderate' ? 4 : 8;
    factors.push({
      category: 'Regulatory',
      name: 'Political Stability',
      score: politicalScore,
      maxScore: 8,
      impact: politicalScore > 5 ? 'high' : politicalScore > 2 ? 'moderate' : 'low',
      description: `${inputs.politicalStability.charAt(0).toUpperCase() + inputs.politicalStability.slice(1)} political environment`,
    });
    regulatoryScore += politicalScore;

    // === PROPERTY-SPECIFIC RISK (15% weight) ===
    let propertyScore = 0;

    // Age & Condition (0-10 points)
    let ageScore = 0;
    if (inputs.propertyAge <= 5 && inputs.propertyCondition === 'excellent') ageScore = 0;
    else if (inputs.propertyAge <= 10 && ['excellent', 'good'].includes(inputs.propertyCondition)) ageScore = 3;
    else if (inputs.propertyAge <= 20) ageScore = 6;
    else ageScore = 10;
    factors.push({
      category: 'Property',
      name: 'Age & Condition',
      score: ageScore,
      maxScore: 10,
      impact: ageScore > 6 ? 'high' : ageScore > 3 ? 'moderate' : 'low',
      description: `${inputs.propertyAge} year old property in ${inputs.propertyCondition} condition`,
    });
    propertyScore += ageScore;

    // Location Quality (0-10 points)
    let locQualScore = inputs.locationQuality === 'prime' ? 0 : inputs.locationQuality === 'good' ? 3 :
                       inputs.locationQuality === 'average' ? 6 : 10;
    factors.push({
      category: 'Property',
      name: 'Location Quality',
      score: locQualScore,
      maxScore: 10,
      impact: locQualScore > 6 ? 'high' : locQualScore > 3 ? 'moderate' : 'low',
      description: `${inputs.locationQuality.charAt(0).toUpperCase() + inputs.locationQuality.slice(1)} location`,
    });
    propertyScore += locQualScore;

    // Amenities (0-8 points)
    let amenityScore = inputs.amenityLevel === 'luxury' ? 0 : inputs.amenityLevel === 'standard' ? 4 : 8;
    factors.push({
      category: 'Property',
      name: 'Amenity Level',
      score: amenityScore,
      maxScore: 8,
      impact: amenityScore > 5 ? 'high' : amenityScore > 2 ? 'moderate' : 'low',
      description: `${inputs.amenityLevel.charAt(0).toUpperCase() + inputs.amenityLevel.slice(1)} amenities`,
    });
    propertyScore += amenityScore;

    // Management Burden (0-8 points)
    let mgmtScore = inputs.managementBurden === 'low' ? 0 : inputs.managementBurden === 'moderate' ? 4 : 8;
    factors.push({
      category: 'Property',
      name: 'Management Burden',
      score: mgmtScore,
      maxScore: 8,
      impact: mgmtScore > 5 ? 'high' : mgmtScore > 2 ? 'moderate' : 'low',
      description: `${inputs.managementBurden.charAt(0).toUpperCase() + inputs.managementBurden.slice(1)} management requirements`,
    });
    propertyScore += mgmtScore;

    // Exit Liquidity (0-8 points)
    let exitScore = inputs.exitLiquidity === 'high' ? 0 : inputs.exitLiquidity === 'moderate' ? 4 : 8;
    factors.push({
      category: 'Property',
      name: 'Exit Liquidity',
      score: exitScore,
      maxScore: 8,
      impact: exitScore > 5 ? 'high' : exitScore > 2 ? 'moderate' : 'low',
      description: `${inputs.exitLiquidity.charAt(0).toUpperCase() + inputs.exitLiquidity.slice(1)} liquidity for exit`,
    });
    propertyScore += exitScore;

    // Calculate weighted overall score
    // Financial: 40%, Market: 30%, Regulatory: 15%, Property: 15%
    // Max scores: Financial=80, Market=65, Regulatory=44, Property=44
    const financialNormalized = (financialScore / 80) * 40;
    const marketNormalized = (marketScore / 65) * 30;
    const regulatoryNormalized = (regulatoryScore / 44) * 15;
    const propertyNormalized = (propertyScore / 44) * 15;

    const overall = financialNormalized + marketNormalized + regulatoryNormalized + propertyNormalized;

    return {
      overall: Math.round(overall),
      financial: Math.round((financialScore / 80) * 100),
      market: Math.round((marketScore / 65) * 100),
      regulatory: Math.round((regulatoryScore / 44) * 100),
      propertySpecific: Math.round((propertyScore / 44) * 100),
      factors,
    };
  }, [inputs]);

  // Generate scenarios
  const scenarios = useMemo((): ScenarioResult[] => {
    const baseRoi = inputs.projectROI;
    const baseCashFlow = inputs.annualCashFlow;

    return [
      {
        name: 'Best Case',
        roi: baseRoi * 1.3,
        riskScore: Math.max(0, riskScore.overall - 20),
        cashFlow: baseCashFlow * 1.25,
        description: 'Market rises 20%, occupancy increases to 80%+',
      },
      {
        name: 'Base Case',
        roi: baseRoi,
        riskScore: riskScore.overall,
        cashFlow: baseCashFlow,
        description: 'Current assumptions maintained',
      },
      {
        name: 'Worst Case',
        roi: baseRoi * 0.5,
        riskScore: Math.min(100, riskScore.overall + 25),
        cashFlow: baseCashFlow * 0.6,
        description: 'Occupancy drops 30%, market softens',
      },
    ];
  }, [inputs, riskScore]);

  const symbol = symbols[inputs.currency] || 'Rp';
  const benchmark = MARKET_BENCHMARKS[inputs.propertyType];
  const riskDiff = riskScore.overall - benchmark;

  // Report data
  const reportData = useMemo(() => {
    return generateRiskAssessmentReport(
      {
        investmentAmount: inputs.investmentAmount,
        projectROI: inputs.projectROI,
        propertyType: propertyLabels[inputs.propertyType],
        location: locationLabels[inputs.marketLocation],
      },
      riskScore,
      scenarios,
      benchmark,
      symbol
    );
  }, [inputs, riskScore, scenarios, benchmark, symbol]);

  const handleInputChange = (field: keyof RiskInputs, value: string | number | boolean) => {
    setInputs(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleReset = useCallback(() => {
    if (showResetConfirm) {
      setInputs(INITIAL_INPUTS);
      setShowResetConfirm(false);
      setToast({ message: 'All values reset', type: 'success' });
    } else {
      setShowResetConfirm(true);
      setTimeout(() => setShowResetConfirm(false), 3000);
    }
  }, [showResetConfirm]);

  const getInvestorProfile = (score: number): string => {
    if (score <= 30) return 'Suitable for: Conservative investors';
    if (score <= 50) return 'Suitable for: Moderate risk investors';
    if (score <= 70) return 'Suitable for: Aggressive investors';
    return 'Suitable for: Speculative investors only';
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white -mx-4 md:-mx-10 lg:-mx-20 -my-8 px-6 py-8">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <ReportPreviewModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        reportData={reportData}
      />

      <div className="max-w-[100%] mx-auto">
        {/* Header */}
        <header className="mb-6 sm:mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-600 to-orange-600 flex items-center justify-center shadow-lg shadow-red-900/30">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Risk Assessment & Investment Rating</h1>
              <p className="text-zinc-500 text-sm mt-1">
                Comprehensive risk analysis with scenario modeling
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <UsageBadge />

            <div className="flex items-center bg-zinc-800 px-4 py-2 rounded-lg border border-zinc-700">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mr-3">Currency</span>
              <select
                value={inputs.currency}
                onChange={(e) => handleInputChange('currency', e.target.value as CurrencyType)}
                className="bg-transparent text-white text-xs font-bold focus:outline-none cursor-pointer"
              >
                <option value="IDR" className="bg-zinc-800">Rp IDR</option>
                <option value="USD" className="bg-zinc-800">$ USD</option>
                <option value="EUR" className="bg-zinc-800">€ EUR</option>
                <option value="AUD" className="bg-zinc-800">A$ AUD</option>
                <option value="GBP" className="bg-zinc-800">£ GBP</option>
              </select>
            </div>

            <button
              onClick={handleReset}
              className={`px-3 sm:px-4 py-3 min-h-[44px] rounded-lg text-xs sm:text-sm font-medium transition-all ${
                showResetConfirm
                  ? 'bg-red-500 text-white'
                  : 'bg-zinc-800 text-zinc-300 border border-zinc-700 hover:bg-zinc-700'
              }`}
            >
              {showResetConfirm ? 'Click to Confirm' : 'Reset'}
            </button>

            <button
              onClick={() => setShowReportModal(true)}
              className="px-3 sm:px-4 py-3 min-h-[44px] rounded-lg text-xs sm:text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-all flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              PDF Report
            </button>

            <SaveToPortfolioButton
              calculatorType="cap-rate"
              projectData={{
                ...inputs,
                riskScore,
                scenarios,
              }}
              defaultProjectName="Risk Assessment"
            />
          </div>
        </header>

        {/* Main Risk Score Panel */}
        <RiskScorePanel
          score={riskScore.overall}
          investorProfile={getInvestorProfile(riskScore.overall)}
          benchmark={benchmark}
          propertyType={propertyLabels[inputs.propertyType]}
          categoryScores={{
            financial: riskScore.financial,
            market: riskScore.market,
            regulatory: riskScore.regulatory,
            property: riskScore.propertySpecific,
          }}
        />

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 my-4 sm:my-6">
          {(['overview', 'breakdown', 'scenarios', 'mitigation'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 sm:px-4 py-3 min-h-[44px] rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === tab
                  ? 'bg-red-600 text-white'
                  : 'bg-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              {tab === 'overview' && 'Overview'}
              {tab === 'breakdown' && 'Risk Breakdown'}
              {tab === 'scenarios' && 'Scenarios'}
              {tab === 'mitigation' && 'Mitigation'}
            </button>
          ))}
        </div>

        {/* Overview Tab - Input Form */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Inputs */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
              <h3 className="text-lg font-bold text-white mb-4">Basic Metrics</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField
                  label="Project ROI"
                  value={inputs.projectROI}
                  onChange={(v) => handleInputChange('projectROI', v)}
                  suffix="%"
                  tooltip="Expected annual return on investment"
                />
                <InputField
                  label="Break-even"
                  value={inputs.breakEvenMonths}
                  onChange={(v) => handleInputChange('breakEvenMonths', v)}
                  suffix="months"
                  tooltip="Time to recover initial investment"
                />
                <InputField
                  label="Investment Amount"
                  value={inputs.investmentAmount}
                  onChange={(v) => handleInputChange('investmentAmount', v)}
                  prefix={symbol}
                />
                <InputField
                  label="Annual Cash Flow"
                  value={inputs.annualCashFlow}
                  onChange={(v) => handleInputChange('annualCashFlow', v)}
                  prefix={symbol}
                />
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Property Type</label>
                  <select
                    value={inputs.propertyType}
                    onChange={(e) => handleInputChange('propertyType', e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white"
                  >
                    {Object.entries(propertyLabels).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Market Location</label>
                  <select
                    value={inputs.marketLocation}
                    onChange={(e) => handleInputChange('marketLocation', e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white"
                  >
                    {Object.entries(locationLabels).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Cash Flow Type</label>
                  <select
                    value={inputs.cashFlowType}
                    onChange={(e) => handleInputChange('cashFlowType', e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white"
                  >
                    <option value="stable">Stable</option>
                    <option value="moderate">Moderate Variation</option>
                    <option value="volatile">Volatile</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Financial Risk Factors */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
              <h3 className="text-lg font-bold text-white mb-4">
                Financial Factors <span className="text-xs text-zinc-500 font-normal">(40% weight)</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField
                  label="DSCR"
                  value={inputs.debtServiceCoverageRatio}
                  onChange={(v) => handleInputChange('debtServiceCoverageRatio', v)}
                  suffix="x"
                  tooltip="Debt Service Coverage Ratio. Banks want >1.25"
                />
                <InputField
                  label="Leverage Ratio"
                  value={inputs.leverageRatio}
                  onChange={(v) => handleInputChange('leverageRatio', v)}
                  tooltip="Debt/Total Investment. Banks want <0.8"
                />
                <InputField
                  label="Equity Amount"
                  value={inputs.equityAmount}
                  onChange={(v) => handleInputChange('equityAmount', v)}
                  prefix={symbol}
                />
                <InputField
                  label="Debt Amount"
                  value={inputs.debtAmount}
                  onChange={(v) => handleInputChange('debtAmount', v)}
                  prefix={symbol}
                />
              </div>
            </div>

            {/* Market Risk Factors */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
              <h3 className="text-lg font-bold text-white mb-4">
                Market Factors <span className="text-xs text-zinc-500 font-normal">(30% weight)</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Market Stability</label>
                  <select
                    value={inputs.marketStability}
                    onChange={(e) => handleInputChange('marketStability', e.target.value as any)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white"
                  >
                    <option value="growing">Growing</option>
                    <option value="stable">Stable</option>
                    <option value="declining">Declining</option>
                  </select>
                </div>
                <div>
                  <label className="flex items-center gap-1 text-xs text-zinc-400 mb-1">
                    Rental Strategy
                    <Tooltip text="STR=40% seasonal variance; LTR=10%" />
                  </label>
                  <select
                    value={inputs.rentalStrategy}
                    onChange={(e) => handleInputChange('rentalStrategy', e.target.value as any)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white"
                  >
                    <option value="str">Short-term Rental (STR)</option>
                    <option value="ltr">Long-term Rental (LTR)</option>
                    <option value="mixed">Mixed Strategy</option>
                  </select>
                </div>
                <InputField
                  label="Avg Occupancy"
                  value={inputs.averageOccupancy}
                  onChange={(v) => handleInputChange('averageOccupancy', v)}
                  suffix="%"
                />
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Price Volatility</label>
                  <select
                    value={inputs.priceVolatility}
                    onChange={(e) => handleInputChange('priceVolatility', e.target.value as any)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white"
                  >
                    <option value="low">Low</option>
                    <option value="moderate">Moderate</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-zinc-400 mb-1 block">Demand Trend</label>
                  <select
                    value={inputs.demandTrend}
                    onChange={(e) => handleInputChange('demandTrend', e.target.value as any)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white"
                  >
                    <option value="increasing">Increasing</option>
                    <option value="stable">Stable</option>
                    <option value="decreasing">Decreasing</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Regulatory Risk Factors */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
              <h3 className="text-lg font-bold text-white mb-4">
                Regulatory Factors <span className="text-xs text-zinc-500 font-normal">(15% weight)</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={inputs.strAllowed}
                      onChange={(e) => handleInputChange('strAllowed', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                  <span className="text-xs text-zinc-400">STR Allowed</span>
                </div>
                <div className="flex items-center gap-3">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={inputs.taxIncentivesExpiring}
                      onChange={(e) => handleInputChange('taxIncentivesExpiring', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-red-500"></div>
                  </label>
                  <span className="text-xs text-zinc-400">Tax Incentives Expiring</span>
                </div>
                <div>
                  <label className="flex items-center gap-1 text-xs text-zinc-400 mb-1">
                    Ownership Type
                    <Tooltip text="Freehold is safest; PT PMA has complex structure" />
                  </label>
                  <select
                    value={inputs.ownershipType}
                    onChange={(e) => handleInputChange('ownershipType', e.target.value as any)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white"
                  >
                    <option value="freehold">Freehold</option>
                    <option value="leasehold">Leasehold</option>
                    <option value="pt-pma">PT PMA</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Permit Difficulty</label>
                  <select
                    value={inputs.permitDifficulty}
                    onChange={(e) => handleInputChange('permitDifficulty', e.target.value as any)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white"
                  >
                    <option value="easy">Easy</option>
                    <option value="moderate">Moderate</option>
                    <option value="difficult">Difficult</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Property-Specific Risk Factors */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 lg:col-span-2">
              <h3 className="text-lg font-bold text-white mb-4">
                Property Factors <span className="text-xs text-zinc-500 font-normal">(15% weight)</span>
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <InputField
                  label="Property Age"
                  value={inputs.propertyAge}
                  onChange={(v) => handleInputChange('propertyAge', v)}
                  suffix="years"
                />
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Condition</label>
                  <select
                    value={inputs.propertyCondition}
                    onChange={(e) => handleInputChange('propertyCondition', e.target.value as any)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white"
                  >
                    <option value="excellent">Excellent</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                    <option value="poor">Poor</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Location Quality</label>
                  <select
                    value={inputs.locationQuality}
                    onChange={(e) => handleInputChange('locationQuality', e.target.value as any)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white"
                  >
                    <option value="prime">Prime</option>
                    <option value="good">Good</option>
                    <option value="average">Average</option>
                    <option value="remote">Remote</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Amenity Level</label>
                  <select
                    value={inputs.amenityLevel}
                    onChange={(e) => handleInputChange('amenityLevel', e.target.value as any)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white"
                  >
                    <option value="luxury">Luxury</option>
                    <option value="standard">Standard</option>
                    <option value="basic">Basic</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Management Burden</label>
                  <select
                    value={inputs.managementBurden}
                    onChange={(e) => handleInputChange('managementBurden', e.target.value as any)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white"
                  >
                    <option value="low">Low</option>
                    <option value="moderate">Moderate</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Exit Liquidity</label>
                  <select
                    value={inputs.exitLiquidity}
                    onChange={(e) => handleInputChange('exitLiquidity', e.target.value as any)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white"
                  >
                    <option value="high">High</option>
                    <option value="moderate">Moderate</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Breakdown Tab */}
        {activeTab === 'breakdown' && (
          <div className="space-y-6">
            <RiskBreakdown factors={riskScore.factors} />
            <SensitivityChart
              baseScore={riskScore.overall}
              factors={riskScore.factors}
            />
          </div>
        )}

        {/* Scenarios Tab */}
        {activeTab === 'scenarios' && (
          <ScenarioAnalysis
            scenarios={scenarios}
            symbol={symbol}
            currency={inputs.currency}
          />
        )}

        {/* Mitigation Tab */}
        {activeTab === 'mitigation' && (
          <RiskMitigation
            factors={riskScore.factors}
            riskScore={riskScore.overall}
          />
        )}

        {/* Benchmark Comparison */}
        <div className="mt-8 rounded-xl border border-zinc-800 bg-zinc-900 p-6">
          <h3 className="text-lg font-bold text-white mb-4">Market Comparison</h3>
          <div className="flex items-center gap-6">
            <div>
              <p className="text-xs text-zinc-400 uppercase mb-1">Your Risk Score</p>
              <p className={`text-3xl font-bold ${
                riskScore.overall <= 30 ? 'text-emerald-400' :
                riskScore.overall <= 60 ? 'text-amber-400' : 'text-red-400'
              }`}>
                {riskScore.overall}
              </p>
            </div>
            <div className="text-zinc-600 text-2xl">vs</div>
            <div>
              <p className="text-xs text-zinc-400 uppercase mb-1">Typical {propertyLabels[inputs.propertyType]}</p>
              <p className="text-3xl font-bold text-zinc-400">{benchmark}</p>
            </div>
            <div className="flex-1">
              <p className={`text-sm ${riskDiff > 0 ? 'text-red-400' : riskDiff < 0 ? 'text-emerald-400' : 'text-zinc-400'}`}>
                {riskDiff > 0
                  ? `${riskDiff} points riskier than market average`
                  : riskDiff < 0
                    ? `${Math.abs(riskDiff)} points safer than market average`
                    : 'Equal to market average'
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Input Field Component
function InputField({ label, value, onChange, prefix, suffix, tooltip }: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  prefix?: string;
  suffix?: string;
  tooltip?: string;
}) {
  const [localValue, setLocalValue] = useState(value === 0 ? '' : String(value));

  useEffect(() => {
    const currentParsed = parseDecimalInput(localValue);
    if (value !== currentParsed && !isNaN(value)) {
      setLocalValue(value === 0 ? '' : String(value));
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === '' || /^-?[0-9]*[.,]?[0-9]*$/.test(val)) {
      setLocalValue(val);
      if (val === '' || val === '-') {
        onChange(0);
      } else {
        const parsed = parseDecimalInput(val);
        if (!isNaN(parsed)) {
          onChange(parsed);
        }
      }
    }
  };

  return (
    <div>
      <label className="flex items-center gap-1 text-xs text-zinc-400 mb-1">
        {label}
        {tooltip && <Tooltip text={tooltip} />}
      </label>
      <div className="relative">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500">{prefix}</span>
        )}
        <input
          type="text"
          inputMode="decimal"
          value={localValue}
          onChange={handleChange}
          placeholder="0"
          className={`w-full bg-zinc-800 border border-zinc-700 rounded-lg py-2 text-sm text-white ${
            prefix ? 'pl-10 pr-3' : suffix ? 'pl-3 pr-12' : 'px-3'
          }`}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500">{suffix}</span>
        )}
      </div>
    </div>
  );
}

export default RiskAssessment;
