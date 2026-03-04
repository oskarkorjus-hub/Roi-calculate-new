export interface ProjectScenario {
  id: string;
  name: string; // "5 villas flip" or "3 villas hold"
  baseProjectId: string; // links to original
  inputs: Record<string, any>; // all calculator inputs
  results: Record<string, any>; // all outputs
  createdAt: string;
  isBaseline: boolean;
}

export interface PortfolioProject {
  id: string;
  calculatorId: string;
  projectName: string;
  location: string;
  strategy?: 'flip' | 'hold' | 'rental' | 'development'; // Investment strategy
  totalInvestment: number;
  roi: number;
  avgCashFlow: number;
  breakEvenMonths: number;
  investmentScore: number;
  // Score component breakdown
  roi_score?: number; // 0-5
  cashflow_score?: number; // 0-3
  stability_score?: number; // 0-2
  location_score?: number; // 0-1
  currency: string;
  createdAt: string;
  updatedAt: string;
  data: any; // Raw calculator data for editing/comparing
  status?: 'active' | 'archived' | 'completed'; // Project status
  scenarios?: ProjectScenario[]; // array of scenario versions
}

export interface InvestmentScoreFactors {
  roi: number; // 40% weight
  cashFlowStability: number; // 30% weight
  breakEvenTimeline: number; // 20% weight
  riskScore: number; // 10% weight
}

export interface ComparisonSnapshot {
  id: string;
  name: string;
  projects: PortfolioProject[];
  createdAt: string;
}

export interface EmailLog {
  email: string;
  name?: string;
  propertyName: string;
  reportType: string;
  sentAt: string;
}
