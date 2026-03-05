import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface CalculatorFeature {
  id: string;
  name: string;
  tagline: string;
  description: string;
  keyFeatures: string[];
  bestFor: string[];
  category: 'analysis' | 'projections' | 'development' | 'specialized';
  // Image path for screenshot - add your images to /public/screenshots/
  image: string;
}

const calculatorData: CalculatorFeature[] = [
  // Analysis Category
  {
    id: 'cap-rate',
    name: 'Cap Rate Analysis',
    tagline: 'Compare property yields instantly',
    description: 'The capitalization rate is the most fundamental metric for comparing investment properties. Our Cap Rate calculator helps you evaluate potential returns by analyzing the relationship between net operating income and property value.',
    keyFeatures: [
      'Calculate cap rate from NOI and property value',
      'Reverse calculate: find property value from target cap rate',
      'Compare multiple properties side-by-side',
      'Market comparison benchmarks'
    ],
    bestFor: ['Quick property comparison', 'Initial screening', 'Valuation'],
    category: 'analysis',
    image: '/screenshots/xirr.png'
  },
  {
    id: 'irr',
    name: 'IRR Calculator',
    tagline: 'True annualized returns on any investment',
    description: 'Internal Rate of Return (IRR) gives you the true annualized return on an investment, accounting for the timing and magnitude of all cash flows. Essential for comparing investments with different time horizons.',
    keyFeatures: [
      'Handles irregular cash flow timing',
      'Multi-year projection support',
      'Compare IRR across different scenarios',
      'Sensitivity analysis on key variables'
    ],
    bestFor: ['Complex investments', 'Benchmarking', 'Long-term holds'],
    category: 'analysis',
    image: '/screenshots/npv.png'
  },
  {
    id: 'xirr',
    name: 'XIRR Calculator',
    tagline: 'Precise returns with exact dates',
    description: 'XIRR extends IRR to handle investments with irregular cash flows on specific dates. Perfect for villa flips, renovation projects, or any investment where timing varies from month to month.',
    keyFeatures: [
      'Date-specific cash flow entry',
      'Handles renovation/flip timelines',
      'Multiple exit scenario modeling',
      'Comparison with regular IRR'
    ],
    bestFor: ['Villa flips', 'Renovations', 'Variable timing'],
    category: 'analysis',
    image: '/screenshots/rental-roi.png'
  },
  {
    id: 'npv',
    name: 'NPV Calculator',
    tagline: 'Present value of future cash flows',
    description: 'Net Present Value discounts future cash flows to today\'s dollars, helping you understand the true value of an investment. A positive NPV means the investment exceeds your required return.',
    keyFeatures: [
      'Custom discount rate selection',
      'Multi-period cash flow modeling',
      'Break-even analysis',
      'Scenario comparison'
    ],
    bestFor: ['Investment decisions', 'Project valuation', 'Comparing timelines'],
    category: 'analysis',
    image: '/screenshots/cashflow.png'
  },

  // Projections Category
  {
    id: 'rental-roi',
    name: 'Annualized ROI',
    tagline: '10-year rental income projections',
    description: 'Project your rental property\'s performance over a decade. This calculator models rent growth, expense increases, and property appreciation to give you a comprehensive view of long-term returns.',
    keyFeatures: [
      '10-year projection timeline',
      'Rent growth modeling',
      'Expense escalation factors',
      'Property appreciation scenarios'
    ],
    bestFor: ['Long-term rentals', 'Buy-and-hold', 'Retirement planning'],
    category: 'projections',
    image: '/screenshots/rental-projection.png'
  },
  {
    id: 'cashflow',
    name: 'Cash Flow Projector',
    tagline: 'Monthly cash flow modeling',
    description: 'Understand your property\'s cash flow dynamics month by month. Model rental income, operating expenses, mortgage payments, and vacancy to see exactly how much cash you\'ll generate.',
    keyFeatures: [
      'Monthly income and expense tracking',
      'Vacancy rate modeling',
      'Operating expense breakdown',
      'Cash-on-cash return analysis'
    ],
    bestFor: ['Budget planning', 'Vacancy analysis', 'Expense optimization'],
    category: 'projections',
    image: '/screenshots/mortgage.png'
  },
  {
    id: 'rental-projection',
    name: 'Rental Income Projection',
    tagline: 'Vacation rental with seasonality',
    description: 'Advanced projection tool designed for vacation rentals and Airbnb properties. Model seasonal occupancy variations, dynamic pricing strategies, and peak vs off-peak performance.',
    keyFeatures: [
      'Seasonal occupancy curves',
      'Dynamic pricing by season',
      'Peak/shoulder/off-peak modeling',
      'Platform fee calculations'
    ],
    bestFor: ['Vacation rentals', 'Airbnb', 'Seasonal markets'],
    category: 'projections',
    image: '/screenshots/financing.png'
  },
  {
    id: 'mortgage',
    name: 'Mortgage Calculator',
    tagline: 'Loan analysis and amortization',
    description: 'Comprehensive mortgage analysis with full amortization schedules. Understand your monthly payments, total interest costs, and how extra payments can accelerate payoff.',
    keyFeatures: [
      'Monthly payment calculations',
      'Full amortization schedule',
      'Extra payment scenarios',
      'Interest vs principal breakdown'
    ],
    bestFor: ['Financing decisions', 'Payment planning', 'Refinancing'],
    category: 'projections',
    image: '/screenshots/dev-feasibility.png'
  },
  {
    id: 'financing',
    name: 'Financing Comparison',
    tagline: 'Compare up to 4 loan options',
    description: 'Side-by-side comparison of multiple financing options. Evaluate different banks, loan terms, and interest rates to find the optimal financing structure for your investment.',
    keyFeatures: [
      'Compare 4 loans simultaneously',
      'Different term lengths',
      'Fixed vs variable rate analysis',
      'Total cost comparison'
    ],
    bestFor: ['Bank shopping', 'Refinancing', 'Development financing'],
    category: 'projections',
    image: '/screenshots/dev-budget.png'
  },

  // Development Category
  {
    id: 'dev-feasibility',
    name: 'Development Feasibility',
    tagline: 'Full project feasibility analysis',
    description: 'Evaluate land development and construction projects from the ground up. Model land costs, construction expenses, timelines, and projected returns to determine if a project makes financial sense.',
    keyFeatures: [
      'Land acquisition costs',
      'Construction cost modeling',
      'Timeline and phasing',
      'Exit strategy comparison'
    ],
    bestFor: ['New construction', 'Land development', 'Villa building'],
    category: 'development',
    image: '/screenshots/indonesia-tax.png'
  },
  {
    id: 'dev-budget',
    name: 'Development Budget Tracker',
    tagline: 'Real-time construction tracking',
    description: 'Track your construction project in real-time. Monitor budget vs actual spending, timeline progress, and identify cost overruns before they become critical.',
    keyFeatures: [
      'Budget vs actual tracking',
      'Cost category breakdown',
      'Timeline milestone tracking',
      'Project health dashboard'
    ],
    bestFor: ['Active construction', 'Budget control', 'Contractor management'],
    category: 'development',
    image: '/screenshots/risk-assessment.png'
  },

  // Specialized Category
  {
    id: 'indonesia-tax',
    name: 'Indonesia Tax Optimizer',
    tagline: 'Indonesian tax planning',
    description: 'Navigate Indonesian real estate taxation with confidence. Model different ownership structures, calculate applicable taxes, and optimize your tax position for Bali investments.',
    keyFeatures: [
      'BPHTB and land tax calculations',
      'Rental income tax optimization',
      'Depreciation strategies',
      'PT PMA vs Nominee analysis'
    ],
    bestFor: ['Bali investments', 'Tax planning', 'Ownership structure'],
    category: 'specialized',
    image: '/screenshots/indonesia-tax-new.png'
  },
  {
    id: 'risk-assessment',
    name: 'Risk Assessment & Rating',
    tagline: 'Comprehensive risk scoring',
    description: 'Get a holistic view of investment risk with our comprehensive scoring system. Analyze market, financial, operational, and legal risks with sensitivity analysis and mitigation strategies.',
    keyFeatures: [
      'Multi-factor risk scoring',
      'Scenario stress testing',
      'Sensitivity analysis charts',
      'Risk mitigation recommendations'
    ],
    bestFor: ['Due diligence', 'Investment presentations', 'Risk management'],
    category: 'specialized',
    image: '/screenshots/risk-assessment-new.png'
  }
];

const categoryInfo = {
  analysis: {
    title: 'Financial Analysis',
    description: 'Core metrics for evaluating investment returns',
    color: 'emerald',
    gradient: 'from-emerald-500/20',
    border: 'border-emerald-500/30',
    text: 'text-emerald-400',
    bg: 'bg-emerald-500',
    bgLight: 'bg-emerald-500/10',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    )
  },
  projections: {
    title: 'Income & Cash Flow',
    description: 'Model rental income and financing scenarios',
    color: 'blue',
    gradient: 'from-blue-500/20',
    border: 'border-blue-500/30',
    text: 'text-blue-400',
    bg: 'bg-blue-500',
    bgLight: 'bg-blue-500/10',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    )
  },
  development: {
    title: 'Development Tools',
    description: 'Build and track construction projects',
    color: 'amber',
    gradient: 'from-amber-500/20',
    border: 'border-amber-500/30',
    text: 'text-amber-400',
    bg: 'bg-amber-500',
    bgLight: 'bg-amber-500/10',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    )
  },
  specialized: {
    title: 'Specialized Tools',
    description: 'Tax optimization and risk management',
    color: 'purple',
    gradient: 'from-purple-500/20',
    border: 'border-purple-500/30',
    text: 'text-purple-400',
    bg: 'bg-purple-500',
    bgLight: 'bg-purple-500/10',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    )
  }
};

// Icon components for each calculator
const calculatorIcons: Record<string, ReactNode> = {
  'cap-rate': (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  ),
  'irr': (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
    </svg>
  ),
  'xirr': (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  ),
  'npv': (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  'rental-roi': (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  ),
  'cashflow': (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  'rental-projection': (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  'mortgage': (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
  'financing': (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
    </svg>
  ),
  'dev-feasibility': (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  ),
  'dev-budget': (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
  ),
  'indonesia-tax': (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z" />
    </svg>
  ),
  'risk-assessment': (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  )
};

function CalculatorCard({ calculator, index }: { calculator: CalculatorFeature; index: number }) {
  const info = categoryInfo[calculator.category];
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);
  const navigate = useNavigate();

  const handleOpenCalculator = () => {
    localStorage.setItem('baliinvest_active_calculator', calculator.id);
    localStorage.setItem('baliinvest_active_view', 'calculator');
    navigate('/calculators');
  };

  return (
    <>
      {/* Lightbox Modal */}
      {showLightbox && imageLoaded && !imageError && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setShowLightbox(false)}
        >
          <button
            className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
            onClick={() => setShowLightbox(false)}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="max-w-6xl max-h-[90vh] overflow-auto">
            <img
              src={calculator.image}
              alt={`${calculator.name} screenshot`}
              className="w-full h-auto rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm bg-black/50 px-4 py-2 rounded-lg">
            {calculator.name} - Click anywhere to close
          </div>
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.05 }}
        className="bg-zinc-900/50 rounded-2xl border border-zinc-800 overflow-hidden hover:border-zinc-700 transition-all group"
      >
        {/* Screenshot Image at Top */}
        <div
          className="relative aspect-[16/10] bg-zinc-800 overflow-hidden cursor-zoom-in"
          onClick={() => imageLoaded && !imageError && setShowLightbox(true)}
        >
          {!imageError && (
            <img
              src={calculator.image}
              alt={`${calculator.name} screenshot`}
              className={`w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
            />
          )}
          {/* Loading/Error placeholder - just gradient, no icon */}
          {(!imageLoaded || imageError) && (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900">
              <span className="text-zinc-600 text-sm">{imageError ? 'Screenshot coming soon' : 'Loading...'}</span>
            </div>
          )}
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent opacity-60 pointer-events-none" />
          {/* Category badge */}
          <div className={`absolute top-3 left-3 px-2 py-1 ${info.bgLight} ${info.text} text-xs font-medium rounded-lg backdrop-blur-sm`}>
            {info.title}
          </div>
          {/* Click hint overlay */}
          {imageLoaded && !imageError && (
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
              <div className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 flex items-center gap-2 text-white font-medium">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                </svg>
                Click to enlarge
              </div>
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="p-6">
          {/* Header with icon */}
          <div className="flex items-start gap-3 mb-3">
            <div className={`w-10 h-10 rounded-xl ${info.bgLight} flex items-center justify-center flex-shrink-0 ${info.text}`}>
              {calculatorIcons[calculator.id]}
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">{calculator.name}</h3>
              <p className={`text-sm ${info.text}`}>{calculator.tagline}</p>
            </div>
          </div>

          <p className="text-zinc-400 text-sm mb-4 leading-relaxed">
            {calculator.description}
          </p>

          {/* Key Features */}
          <div className="mb-4">
            <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Key Features</h4>
            <ul className="space-y-1.5">
              {calculator.keyFeatures.map((feature, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                  <svg className={`w-4 h-4 ${info.text} flex-shrink-0 mt-0.5`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          {/* Best For Tags */}
          <div>
            <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Best For</h4>
            <div className="flex flex-wrap gap-2">
              {calculator.bestFor.map((use, i) => (
                <span key={i} className={`px-2.5 py-1 ${info.bgLight} ${info.text} text-xs rounded-full font-medium`}>
                  {use}
                </span>
              ))}
            </div>
          </div>

          {/* Try Calculator Button */}
          <button
            onClick={handleOpenCalculator}
            className={`mt-5 w-full py-2.5 ${info.bgLight} ${info.text} rounded-xl font-medium text-sm flex items-center justify-center gap-2 hover:opacity-80 transition-opacity`}
          >
            Try {calculator.name}
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </div>
      </motion.div>
    </>
  );
}

function CategorySection({ category, calculators }: { category: keyof typeof categoryInfo; calculators: CalculatorFeature[] }) {
  const info = categoryInfo[category];

  return (
    <section className="mb-20">
      <div className={`bg-gradient-to-r ${info.gradient} to-transparent border-l-4 ${info.border} px-6 py-4 mb-10 rounded-r-lg flex items-center gap-4`}>
        <div className={`w-12 h-12 rounded-xl ${info.bgLight} flex items-center justify-center ${info.text}`}>
          {info.icon}
        </div>
        <div>
          <h2 className={`text-2xl font-bold ${info.text}`}>{info.title}</h2>
          <p className="text-zinc-400 text-sm">{info.description}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {calculators.map((calc, index) => (
          <CalculatorCard key={calc.id} calculator={calc} index={index} />
        ))}
      </div>
    </section>
  );
}

export function CalculatorsGuide() {
  const analysisCalcs = calculatorData.filter(c => c.category === 'analysis');
  const projectionCalcs = calculatorData.filter(c => c.category === 'projections');
  const developmentCalcs = calculatorData.filter(c => c.category === 'development');
  const specializedCalcs = calculatorData.filter(c => c.category === 'specialized');

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-sm mb-6">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              13 Professional Calculators
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Every Tool You Need for{' '}
              <span className="text-emerald-400">Bali Real Estate</span>{' '}
              Investment Analysis
            </h1>

            <p className="text-xl text-zinc-400 mb-8 leading-relaxed">
              From quick cap rate calculations to comprehensive risk assessments,
              our suite of calculators covers every aspect of property investment analysis.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/calculators"
                className="px-8 py-4 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition font-bold text-lg inline-flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Try Calculators Free
              </Link>
              <Link
                to="/pricing"
                className="px-8 py-4 border border-zinc-700 text-zinc-300 rounded-xl hover:bg-zinc-800 transition font-medium text-lg inline-flex items-center justify-center gap-2"
              >
                View Pricing
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="py-12 border-y border-zinc-800 bg-zinc-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-emerald-400">13</div>
              <div className="text-zinc-400 text-sm">Calculators</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-400">4</div>
              <div className="text-zinc-400 text-sm">Categories</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-amber-400">50+</div>
              <div className="text-zinc-400 text-sm">Unique Features</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-400">100%</div>
              <div className="text-zinc-400 text-sm">Bali-Focused</div>
            </div>
          </div>
        </div>
      </section>

      {/* Calculator Categories */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <CategorySection category="analysis" calculators={analysisCalcs} />
          <CategorySection category="projections" calculators={projectionCalcs} />
          <CategorySection category="development" calculators={developmentCalcs} />
          <CategorySection category="specialized" calculators={specializedCalcs} />
        </div>
      </section>

      {/* How to Use Section */}
      <section className="py-20 bg-zinc-900/50 border-y border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">How to Get the Most from Our Calculators</h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">
              Follow this workflow to analyze any Bali property investment comprehensively
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              {
                step: '1',
                title: 'Initial Screening',
                description: 'Use Cap Rate Analysis to quickly compare properties and filter your shortlist',
                color: 'emerald',
                icon: (
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                )
              },
              {
                step: '2',
                title: 'Income Projection',
                description: 'Model expected rental income with Cash Flow or Rental Projection calculators',
                color: 'blue',
                icon: (
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                )
              },
              {
                step: '3',
                title: 'Return Analysis',
                description: 'Calculate IRR, NPV, and XIRR to understand true investment returns',
                color: 'amber',
                icon: (
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                )
              },
              {
                step: '4',
                title: 'Risk & Tax',
                description: 'Assess risks and optimize tax position before making final decisions',
                color: 'purple',
                icon: (
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                )
              }
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                <div className={`absolute -top-3 -left-3 w-8 h-8 rounded-full bg-${item.color}-500 flex items-center justify-center text-white font-bold text-sm z-10`}>
                  {item.step}
                </div>
                <div className="bg-zinc-800/50 rounded-xl p-6 pt-8 h-full border border-zinc-700/50">
                  <div className={`text-${item.color}-400 mb-3`}>
                    {item.icon}
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-zinc-400 text-sm">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Analyze Your Next Investment?
          </h2>
          <p className="text-zinc-400 text-lg mb-8">
            Get started with 3 free calculations per month, or upgrade to Pro for unlimited access.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/calculators"
              className="px-8 py-4 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition font-bold text-lg inline-flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Start Calculating
            </Link>
            <Link
              to="/pricing"
              className="px-8 py-4 border border-zinc-700 text-zinc-300 rounded-xl hover:bg-zinc-800 transition font-medium text-lg"
            >
              Compare Plans
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
