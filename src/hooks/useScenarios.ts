import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { ProjectScenario, PortfolioProject } from '../types/portfolio';
import { usePortfolio } from '../lib/portfolio-context';
import { calculateInvestmentScore } from '../utils/investmentScoring';

export function useScenarios() {
  const { updateProject, getProjectById } = usePortfolio();
  const [selectedScenarios, setSelectedScenarios] = useState<string[]>([]);

  const createScenario = useCallback(
    (baseProject: PortfolioProject, scenarioName: string, newInputs: Record<string, any>) => {
      if (!baseProject.scenarios) {
        baseProject.scenarios = [];
      }

      // Calculate new results based on new inputs
      const newResults = calculateResultsFromInputs(newInputs, baseProject.calculatorId);

      const scenario: ProjectScenario = {
        id: uuidv4(),
        name: scenarioName,
        baseProjectId: baseProject.id,
        inputs: newInputs,
        results: newResults,
        createdAt: new Date().toISOString(),
        isBaseline: false,
      };

      const updatedProject = {
        ...baseProject,
        scenarios: [...baseProject.scenarios, scenario],
      };

      updateProject(baseProject.id, updatedProject);
      return scenario;
    },
    [updateProject]
  );

  const updateScenario = useCallback(
    (projectId: string, scenarioId: string, updates: Partial<ProjectScenario>) => {
      const project = getProjectById(projectId);
      if (!project || !project.scenarios) return;

      const updatedScenarios = project.scenarios.map(s =>
        s.id === scenarioId ? { ...s, ...updates } : s
      );

      updateProject(projectId, { scenarios: updatedScenarios });
    },
    [getProjectById, updateProject]
  );

  const deleteScenario = useCallback(
    (projectId: string, scenarioId: string) => {
      const project = getProjectById(projectId);
      if (!project || !project.scenarios) return;

      const updatedScenarios = project.scenarios.filter(s => s.id !== scenarioId);
      updateProject(projectId, { scenarios: updatedScenarios });
    },
    [getProjectById, updateProject]
  );

  const getScenarioComparison = useCallback(
    (project: PortfolioProject, scenarioIds: string[]) => {
      if (!project.scenarios) return [];

      return scenarioIds
        .map(id => project.scenarios?.find(s => s.id === id))
        .filter((s): s is ProjectScenario => s !== undefined);
    },
    []
  );

  const calculateWinner = useCallback((scenarios: ProjectScenario[]) => {
    if (scenarios.length === 0) return null;

    // Score based on ROI, cash flow, and break-even
    const scores = scenarios.map(s => ({
      id: s.id,
      name: s.name,
      score: (s.results.roi || 0) * 0.5 + (s.results.avgCashFlow || 0) * 0.3 - (s.results.breakEvenMonths || 0) * 0.2,
    }));

    return scores.reduce((a, b) => (a.score > b.score ? a : b));
  }, []);

  return {
    selectedScenarios,
    setSelectedScenarios,
    createScenario,
    updateScenario,
    deleteScenario,
    getScenarioComparison,
    calculateWinner,
  };
}

// Calculator-specific result calculations
function calculateResultsFromInputs(inputs: Record<string, any>, calculatorType: string): Record<string, any> {
  const baseResults: Record<string, any> = {
    currency: inputs.currency || 'IDR',
  };

  switch (calculatorType) {
    case 'mortgage':
    case 'financing': {
      const principal = inputs.loanAmount || inputs.totalInvestment || 0;
      const annualRate = (inputs.interestRate || 0) / 100;
      const monthlyRate = annualRate / 12;
      const termMonths = (inputs.loanTermYears || 0) * 12;

      let monthlyPayment = 0;
      let totalInterest = 0;

      if (monthlyRate > 0 && termMonths > 0 && principal > 0) {
        monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, termMonths)) /
                        (Math.pow(1 + monthlyRate, termMonths) - 1);
        totalInterest = (monthlyPayment * termMonths) - principal;
      } else if (termMonths > 0 && principal > 0) {
        monthlyPayment = principal / termMonths;
      }

      return {
        ...baseResults,
        totalInvestment: principal,
        monthlyPayment: Math.round(monthlyPayment),
        totalInterest: Math.round(totalInterest),
        totalCost: Math.round(principal + totalInterest),
        roi: annualRate * 100,
        effectiveRate: annualRate * 100,
      };
    }

    case 'rental-roi': {
      const investment = inputs.initialInvestment || 0;
      const dailyRate = inputs.y1ADR || 0;
      const occupancy = (inputs.y1Occupancy || 0) / 100;
      const annualRevenue = dailyRate * 365 * occupancy;
      const incentiveFee = (inputs.incentiveFeePct || 0) / 100;
      const netIncome = annualRevenue * (1 - incentiveFee);
      const roi = investment > 0 ? (netIncome / investment) * 100 : 0;

      return {
        ...baseResults,
        totalInvestment: investment,
        roi: roi,
        avgCashFlow: Math.round(netIncome),
        annualRevenue: Math.round(annualRevenue),
        totalRevenue: Math.round(annualRevenue * 10), // 10-year projection
        occupancyRate: inputs.y1Occupancy || 0,
      };
    }

    case 'rental-projection': {
      const nightlyRate = inputs.nightlyRate || 0;
      const occupancy = (inputs.baseOccupancyRate || 0) / 100;
      const years = inputs.projectionYears || 1;
      const monthlyExpenses = inputs.monthlyExpenses || 0;
      const platformFee = (inputs.platformFeePercent || 0) / 100;

      const annualRevenue = nightlyRate * 365 * occupancy * (1 - platformFee);
      const annualExpenses = monthlyExpenses * 12;
      const annualNetIncome = annualRevenue - annualExpenses;

      return {
        ...baseResults,
        totalInvestment: inputs.totalInvestment || 0,
        annualRevenue: Math.round(annualRevenue),
        avgCashFlow: Math.round(annualNetIncome),
        occupancyRate: inputs.baseOccupancyRate || 0,
        averageNightlyRate: nightlyRate,
        totalProjectedCashFlow: Math.round(annualNetIncome * years),
      };
    }

    case 'cashflow': {
      const monthlyIncome = inputs.monthlyRentalIncome || 0;
      const monthlyMortgage = inputs.monthlyMortgage || 0;
      const monthlyMaintenance = inputs.monthlyMaintenance || 0;
      const monthlyTax = inputs.monthlyPropertyTax || 0;
      const monthlyInsurance = inputs.monthlyInsurance || 0;
      const totalExpenses = monthlyMortgage + monthlyMaintenance + monthlyTax + monthlyInsurance;
      const monthlyCashFlow = monthlyIncome - totalExpenses;

      return {
        ...baseResults,
        totalInvestment: inputs.totalInvestment || 0,
        avgCashFlow: Math.round(monthlyCashFlow),
        annualCashFlow: Math.round(monthlyCashFlow * 12),
        occupancyRate: inputs.occupancyRate || 100,
        expenseRatio: monthlyIncome > 0 ? (totalExpenses / monthlyIncome) * 100 : 0,
      };
    }

    case 'cap-rate': {
      const propertyValue = inputs.propertyValue || 0;
      const noi = inputs.annualNOI || 0;
      const capRate = propertyValue > 0 ? (noi / propertyValue) * 100 : 0;
      const grm = noi > 0 ? propertyValue / noi : 0;

      return {
        ...baseResults,
        totalInvestment: propertyValue,
        capRate: capRate,
        noi: noi,
        grm: grm,
        roi: capRate,
      };
    }

    case 'xirr': {
      const totalPrice = inputs.property?.totalPrice || inputs.totalInvestment || 0;
      const exitPrice = inputs.exit?.exitPrice || 0;
      const monthlyRental = inputs.rental?.monthlyRate || 0;
      const occupancy = (inputs.rental?.occupancyRate || 100) / 100;
      const netProfit = exitPrice - totalPrice + (monthlyRental * 12 * occupancy);
      const roi = totalPrice > 0 ? (netProfit / totalPrice) * 100 : 0;

      return {
        ...baseResults,
        totalInvestment: totalPrice,
        roi: roi,
        totalReturn: exitPrice,
        netProfit: Math.round(netProfit),
        avgCashFlow: Math.round(monthlyRental * occupancy),
      };
    }

    case 'irr': {
      const investment = inputs.initialInvestment || 0;
      const irr = inputs.irr || inputs.roi || 0;
      const npv = inputs.npv || 0;
      const payback = inputs.paybackPeriod || inputs.holdingPeriodYears || 0;

      return {
        ...baseResults,
        totalInvestment: investment,
        irr: irr,
        npv: npv,
        roi: irr,
        paybackPeriod: payback,
      };
    }

    case 'npv': {
      const investment = inputs.initialInvestment || 0;
      const npv = inputs.npv || 0;
      const discountRate = inputs.discountRate || 0;
      const pi = investment > 0 ? (npv + investment) / investment : 0;

      return {
        ...baseResults,
        totalInvestment: investment,
        npv: npv,
        discountRate: discountRate,
        profitabilityIndex: pi,
        roi: investment > 0 ? (npv / investment) * 100 : 0,
      };
    }

    case 'dev-feasibility': {
      const landCost = inputs.landCost || 0;
      const constructionCost = inputs.constructionCost || 0;
      const softCosts = inputs.softCosts || 0;
      const contingency = (inputs.contingencyPercent || 0) / 100;
      const totalCost = (landCost + constructionCost + softCosts) * (1 + contingency);
      const salePrice = inputs.expectedSalePrice || 0;
      const profit = salePrice - totalCost;
      const roi = totalCost > 0 ? (profit / totalCost) * 100 : 0;
      const margin = salePrice > 0 ? (profit / salePrice) * 100 : 0;

      return {
        ...baseResults,
        totalInvestment: Math.round(totalCost),
        roi: roi,
        projectedValue: salePrice,
        profitMargin: margin,
        avgCashFlow: Math.round(profit),
      };
    }

    case 'indonesia-tax': {
      const purchasePrice = inputs.purchasePrice || 0;
      const salePrice = inputs.salePrice || 0;
      const rentalIncome = inputs.annualRentalIncome || 0;
      const holdingYears = inputs.holdingPeriodYears || 1;

      // Simplified tax calculation (actual would be more complex)
      const capitalGains = salePrice - purchasePrice;
      const totalIncome = rentalIncome * holdingYears + capitalGains;
      const estimatedTax = totalIncome * 0.1; // 10% simplified rate
      const effectiveRate = totalIncome > 0 ? (estimatedTax / totalIncome) * 100 : 0;

      return {
        ...baseResults,
        totalInvestment: purchasePrice,
        effectiveTaxRate: effectiveRate,
        totalTax: Math.round(estimatedTax),
        taxSavings: 0, // Would need base comparison
        netIncome: Math.round(totalIncome - estimatedTax),
        roi: purchasePrice > 0 ? ((totalIncome - estimatedTax) / purchasePrice) * 100 : 0,
      };
    }

    case 'dev-budget': {
      const totalBudget = inputs.totalBudget || 0;
      const actualSpent = inputs.actualSpent || 0;
      const variance = totalBudget > 0 ? ((actualSpent - totalBudget) / totalBudget) * 100 : 0;
      const completion = inputs.completionPct || 0;

      return {
        ...baseResults,
        totalBudget: totalBudget,
        actualSpent: actualSpent,
        variance: variance,
        completionPct: completion,
        totalInvestment: totalBudget,
      };
    }

    case 'risk-assessment': {
      const propertyValue = inputs.propertyValue || 0;
      const expectedReturn = inputs.expectedReturn || 0;
      const riskScore = inputs.riskScore || 50;

      return {
        ...baseResults,
        totalInvestment: propertyValue,
        riskScore: riskScore,
        roi: expectedReturn,
        volatility: inputs.volatility || 0,
        sharpeRatio: inputs.sharpeRatio || 0,
      };
    }

    default:
      // Generic fallback
      return {
        ...baseResults,
        roi: inputs.roi || 0,
        avgCashFlow: inputs.avgCashFlow || inputs.monthlyPayment || 0,
        breakEvenMonths: inputs.breakEvenMonths || 0,
        totalInvestment: inputs.totalInvestment || inputs.loanAmount || 0,
      };
  }
}
