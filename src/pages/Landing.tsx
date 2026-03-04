import { Link } from 'react-router-dom';

export function Landing() {

  const calculators = [
    {
      id: 'xirr',
      name: 'XIRR Calculator',
      icon: '📈',
      description: 'Calculate exact internal rate of return on villa flips and property investments',
      useCases: 'Villa flips, property sales, irregular cash flows',
    },
    {
      id: 'rental-roi',
      name: 'Annualized ROI',
      icon: '🏠',
      description: 'Project 10-year rental income and calculate annual returns with precision',
      useCases: 'Long-term rentals, income projections, hold strategies',
    },
    {
      id: 'mortgage',
      name: 'Mortgage Calculator',
      icon: '💰',
      description: 'Analyze loan terms, monthly payments, and full amortization schedules',
      useCases: 'Financing decisions, payment planning, loan comparison',
    },
    {
      id: 'cashflow',
      name: 'Cash Flow Projector',
      icon: '💸',
      description: 'Model rental income, expenses, and net cash flow over multiple years',
      useCases: 'Expense planning, vacancy analysis, monthly cash flow',
    },
    {
      id: 'dev-feasibility',
      name: 'Development Feasibility',
      icon: '🏗️',
      description: 'Evaluate land development projects: construction costs, timelines, ROI',
      useCases: 'New projects, construction feasibility, multi-unit analysis',
    },
    {
      id: 'cap-rate',
      name: 'Cap Rate Analysis',
      icon: '📊',
      description: 'Calculate capitalization rate to compare investment property yields',
      useCases: 'Property comparison, yield analysis, valuation',
    },
    {
      id: 'irr',
      name: 'IRR Calculator',
      icon: '🎯',
      description: 'Determine annualized return across any investment cash flow stream',
      useCases: 'Complex investments, benchmarking, discount rate analysis',
    },
    {
      id: 'npv',
      name: 'NPV Calculator',
      icon: '🔢',
      description: 'Calculate net present value of future cash flows at any discount rate',
      useCases: 'Project valuation, investment decisions, scenario testing',
    },
  ];

  const testimonials = [
    {
      quote: "ROI Calculate eliminated the guesswork. I now close deals 40% faster with exact numbers.",
      author: 'Villa Investor, Bali',
      role: 'Property Developer',
    },
    {
      quote: "The XIRR calculator is a game-changer. It shows me exactly what I'll make before I even make an offer.",
      author: 'David M.',
      role: 'Portfolio Manager',
    },
    {
      quote: "Multi-currency support + PDF export = my entire deal analysis workflow in one tool.",
      author: 'Strategic Investor',
      role: 'Property Fund Manager',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Problem Hook */}
          <div className="text-center mb-12">
            <div className="inline-block mb-4 px-4 py-2 bg-indigo-50 rounded-full">
              <span className="text-sm font-semibold text-indigo-700">⚠️ THE PROBLEM</span>
            </div>
            <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Bad calculations = Lost millions.
            </h1>
            <p className="text-xl text-gray-600 mb-4">
              Villa investors lose 40% in expected returns because they make deals on gut feeling, not precision.
            </p>
            <p className="text-lg text-gray-500">
              You're leaving money on the table with every single investment decision.
            </p>
          </div>

          {/* Emotional Resonance */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-red-50 p-6 rounded-lg border border-red-100">
              <p className="text-red-900 font-semibold">❌ "I thought this deal made sense. It didn't."</p>
              <p className="text-sm text-red-700 mt-2">Overpaying for properties based on incomplete analysis.</p>
            </div>
            <div className="bg-red-50 p-6 rounded-lg border border-red-100">
              <p className="text-red-900 font-semibold">❌ "My competitor said yes in 48 hours."</p>
              <p className="text-sm text-red-700 mt-2">Slow deal analysis means missing windows of opportunity.</p>
            </div>
            <div className="bg-red-50 p-6 rounded-lg border border-red-100">
              <p className="text-red-900 font-semibold">❌ "I have no idea if this will actually work."</p>
              <p className="text-sm text-red-700 mt-2">Making 10-year projections with calculator guesses.</p>
            </div>
          </div>

          {/* Solution Intro */}
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-8 rounded-xl border border-indigo-100 text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">✅ THE SOLUTION: Precision Confidence</h2>
            <p className="text-lg text-gray-700">
              ROI Calculate gives you <strong>exact numbers</strong> for every deal. No guessing. No spreadsheets. 
              <br />Just <strong>clear math that shows exactly what you'll make</strong>.
            </p>
          </div>

          {/* Main CTA */}
          <div className="text-center mb-16">
            <Link
              to="/calculators"
              className="inline-block px-8 py-4 bg-indigo-600 text-white text-lg font-bold rounded-lg hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-xl"
            >
              → Start Calculating Free
            </Link>
            <p className="text-sm text-gray-500 mt-4">
              No credit card. 3 free calculations. Takes 60 seconds.
            </p>
          </div>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">What You Get</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="flex gap-4">
              <div className="flex-shrink-0 text-2xl">🎯</div>
              <div>
                <h3 className="font-bold text-lg mb-2">Know Exactly What You'll Make</h3>
                <p className="text-gray-600">XIRR, annualized ROI, cap rates—see returns before you make the offer. No surprises.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 text-2xl">⚡</div>
              <div>
                <h3 className="font-bold text-lg mb-2">Close Deals 3x Faster</h3>
                <p className="text-gray-600">60-second calculations replace hours of spreadsheet work. Make faster decisions than competitors.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 text-2xl">🌍</div>
              <div>
                <h3 className="font-bold text-lg mb-2">Multi-Currency Support</h3>
                <p className="text-gray-600">Work with USD, EUR, IDR, or any currency. Perfect for international property portfolios.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 text-2xl">📄</div>
              <div>
                <h3 className="font-bold text-lg mb-2">Export & Share Results</h3>
                <p className="text-gray-600">PDF exports for clients, lenders, and partners. Professional reports in seconds.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 text-2xl">📊</div>
              <div>
                <h3 className="font-bold text-lg mb-2">10-Year Projections</h3>
                <p className="text-gray-600">Model cash flow, expenses, vacancy rates, and growth over a decade of investment.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 text-2xl">🔒</div>
              <div>
                <h3 className="font-bold text-lg mb-2">Enterprise-Grade Security</h3>
                <p className="text-gray-600">Your financial data is encrypted, never sold, and fully compliant with data protection laws.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid: 8 Calculators */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">8 Powerful Calculators in One Platform</h2>
          <p className="text-center text-gray-600 mb-12 max-w-3xl mx-auto">
            Every calculator you need to analyze villa investments, rentals, development projects, and complex deal scenarios.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {calculators.map((calc) => (
              <Link
                key={calc.id}
                to="/calculators"
                className="p-6 border border-gray-200 rounded-lg hover:shadow-lg hover:border-indigo-300 transition-all group cursor-pointer"
              >
                <div className="text-3xl mb-3">{calc.icon}</div>
                <h3 className="font-bold text-lg mb-2 group-hover:text-indigo-600 transition-colors">
                  {calc.name}
                </h3>
                <p className="text-sm text-gray-600 mb-3">{calc.description}</p>
                <p className="text-xs text-gray-500 italic">Use for: {calc.useCases}</p>
              </Link>
            ))}
          </div>

          <div className="text-center">
            <Link
              to="/calculators"
              className="inline-block px-8 py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Explore All Calculators →
            </Link>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-indigo-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Why Villa Investors Choose ROI Calculate</h2>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {testimonials.map((testimonial, idx) => (
              <div key={idx} className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
                <p className="text-gray-600 mb-4 italic">"{testimonial.quote}"</p>
                <div>
                  <p className="font-semibold text-gray-900">{testimonial.author}</p>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-indigo-600">1000+</div>
              <p className="text-gray-600">Deals Analyzed</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-indigo-600">40%</div>
              <p className="text-gray-600">Faster Decision Making</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-indigo-600">15M+</div>
              <p className="text-gray-600">USD in Investments Evaluated</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Teaser */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Get Started Your Way</h2>
          <p className="text-lg text-gray-600 mb-8">
            Start free. Upgrade when you need more power. No surprise charges, ever.
          </p>

          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div className="p-6 border border-gray-200 rounded-lg">
              <h3 className="font-bold text-lg mb-4">FREE</h3>
              <div className="text-3xl font-bold mb-4">$0</div>
              <ul className="text-sm text-gray-600 space-y-2 mb-6">
                <li>✓ 3 calculator uses/month</li>
                <li>✓ Basic features</li>
                <li>✓ Save 1 project</li>
              </ul>
              <button className="w-full px-4 py-2 border border-indigo-600 text-indigo-600 rounded font-semibold hover:bg-indigo-50">
                Get Started
              </button>
            </div>

            <div className="p-6 border-2 border-indigo-600 rounded-lg bg-indigo-50 relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-indigo-600 text-white px-4 py-1 rounded-full text-xs font-bold">
                MOST POPULAR
              </div>
              <h3 className="font-bold text-lg mb-4">PRO</h3>
              <div className="text-3xl font-bold mb-1">$9</div>
              <p className="text-gray-600 text-sm mb-4">/month</p>
              <ul className="text-sm text-gray-600 space-y-2 mb-6">
                <li>✓ Unlimited calculators</li>
                <li>✓ 25 saved projects</li>
                <li>✓ PDF export</li>
                <li>✓ Advanced modes</li>
              </ul>
              <button className="w-full px-4 py-2 bg-indigo-600 text-white rounded font-semibold hover:bg-indigo-700">
                Start Free Trial
              </button>
            </div>

            <div className="p-6 border border-gray-200 rounded-lg">
              <h3 className="font-bold text-lg mb-4">ENTERPRISE</h3>
              <div className="text-3xl font-bold mb-4">Custom</div>
              <ul className="text-sm text-gray-600 space-y-2 mb-6">
                <li>✓ Custom integrations</li>
                <li>✓ API access</li>
                <li>✓ Dedicated support</li>
                <li>✓ White-label options</li>
              </ul>
              <button className="w-full px-4 py-2 border border-indigo-600 text-indigo-600 rounded font-semibold hover:bg-indigo-50">
                Contact Sales
              </button>
            </div>
          </div>

          <Link to="/pricing" className="text-indigo-600 font-semibold hover:underline">
            View Full Pricing Comparison →
          </Link>
        </div>
      </section>

      {/* Trust Signals */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-5xl mx-auto text-center">
          <h3 className="text-lg font-semibold text-gray-700 mb-8">Trusted By Professional Investors</h3>
          <div className="flex flex-wrap justify-center gap-8 items-center text-gray-500">
            <span className="text-sm">✓ SOC 2 Compliant</span>
            <span className="text-sm">✓ 256-Bit Encryption</span>
            <span className="text-sm">✓ GDPR Compliant</span>
            <span className="text-sm">✓ 99.9% Uptime</span>
            <span className="text-sm">✓ No Credit Card Required</span>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-indigo-600 to-blue-600">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-4xl font-bold mb-6">
            Stop Losing Money to Bad Calculations.
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Start analyzing deals with precision. Catch profit opportunities your competitors miss.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link
              to="/calculators"
              className="px-8 py-4 bg-white text-indigo-600 font-bold rounded-lg hover:bg-gray-100 transition-colors"
            >
              → Start Calculating Free
            </Link>
            <Link
              to="/faq"
              className="px-8 py-4 border-2 border-white text-white font-bold rounded-lg hover:bg-white hover:bg-opacity-10 transition-colors"
            >
              View FAQ
            </Link>
          </div>

          <p className="text-sm opacity-75">
            No credit card. 3 free calculations. Upgrade anytime.
          </p>
        </div>
      </section>
    </div>
  );
}
