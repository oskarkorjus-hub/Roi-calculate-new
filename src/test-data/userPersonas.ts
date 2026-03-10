/**
 * Test User Personas / ICPs (Ideal Customer Profiles)
 *
 * These personas represent the core user groups for ROI Calculate testing
 */

export interface UserPersona {
  id: string;
  name: string;
  role: string;
  description: string;
  goals: string[];
  painPoints: string[];
  typicalCalculators: string[];
  portfolioSize: 'small' | 'medium' | 'large';
  investmentRange: { min: number; max: number };
  location: string;
}

export const USER_PERSONAS: UserPersona[] = [
  // ===== PERSONA 1: Real Estate Developer =====
  {
    id: 'developer',
    name: 'Marcus Chen',
    role: 'Real Estate Developer',
    description: 'Experienced property developer building villas and boutique hotels in Bali. Manages multiple projects simultaneously with budgets ranging from $500K to $5M.',
    goals: [
      'Track construction budgets and timelines',
      'Analyze development feasibility before purchasing land',
      'Compare financing options from multiple banks',
      'Calculate expected ROI on completed developments',
      'Manage risk across multiple projects',
    ],
    painPoints: [
      'Budget overruns and timeline delays',
      'Complex tax implications in Indonesia',
      'Comparing multiple financing options',
      'Presenting professional reports to investors',
    ],
    typicalCalculators: ['dev-budget', 'dev-feasibility', 'financing', 'indonesia-tax', 'risk-assessment', 'npv'],
    portfolioSize: 'large',
    investmentRange: { min: 500000, max: 5000000 },
    location: 'Canggu, Bali',
  },

  // ===== PERSONA 2: Quick Calculator User =====
  {
    id: 'quick-calc',
    name: 'Sarah Williams',
    role: 'Individual Investor',
    description: 'Part-time investor looking to evaluate potential rental properties. Wants quick answers without complex setup. Usually comparing 2-3 properties.',
    goals: [
      'Quickly compare rental yields on properties',
      'Calculate monthly mortgage payments',
      'Understand break-even timeline',
      'Get instant ROI estimates',
    ],
    painPoints: [
      'Limited time for complex analysis',
      'Not familiar with advanced financial metrics',
      'Needs simple, clear results',
      'Wants to save calculations for later',
    ],
    typicalCalculators: ['mortgage', 'cap-rate', 'cashflow', 'rental-projection'],
    portfolioSize: 'small',
    investmentRange: { min: 100000, max: 500000 },
    location: 'Seminyak, Bali',
  },

  // ===== PERSONA 3: Real Estate Agent =====
  {
    id: 'agent',
    name: 'David Hartono',
    role: 'Real Estate Agent',
    description: 'Luxury real estate agent in Bali specializing in villa sales to international investors. Needs professional reports to present investment opportunities.',
    goals: [
      'Generate professional PDF reports for clients',
      'Show investment potential with clear metrics',
      'Compare multiple properties for clients',
      'Present tax implications to foreign investors',
    ],
    painPoints: [
      'Creating professional investor presentations',
      'Explaining complex returns simply',
      'Managing multiple client portfolios',
      'Keeping up with tax regulation changes',
    ],
    typicalCalculators: ['rental-roi', 'xirr', 'cap-rate', 'indonesia-tax', 'rental-projection'],
    portfolioSize: 'medium',
    investmentRange: { min: 300000, max: 2000000 },
    location: 'Ubud, Bali',
  },

  // ===== PERSONA 4: Institutional Investor / Fund Manager =====
  {
    id: 'institutional',
    name: 'Jennifer Park',
    role: 'Fund Manager',
    description: 'Manages a real estate investment fund focused on Southeast Asian hospitality properties. Requires detailed financial analysis and risk assessment.',
    goals: [
      'Comprehensive DCF analysis with NPV/IRR',
      'Risk-adjusted return calculations',
      'Portfolio-level scenario analysis',
      'Detailed due diligence reporting',
      'Compare opportunities across multiple markets',
    ],
    painPoints: [
      'Need institutional-grade analysis',
      'Multiple stakeholder reporting requirements',
      'Complex cash flow modeling',
      'Regulatory compliance documentation',
    ],
    typicalCalculators: ['npv', 'irr', 'xirr', 'risk-assessment', 'dev-feasibility', 'financing'],
    portfolioSize: 'large',
    investmentRange: { min: 1000000, max: 10000000 },
    location: 'Multiple - Bali, Lombok, Phuket',
  },
];

/**
 * Get persona by ID
 */
export function getPersonaById(id: string): UserPersona | undefined {
  return USER_PERSONAS.find(p => p.id === id);
}

/**
 * Get personas that typically use a specific calculator
 */
export function getPersonasForCalculator(calculatorId: string): UserPersona[] {
  return USER_PERSONAS.filter(p => p.typicalCalculators.includes(calculatorId));
}
