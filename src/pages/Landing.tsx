import { Link } from 'react-router-dom';
import { useState } from 'react';

export function Landing() {
  const [email, setEmail] = useState('');
  const [showVideo, setShowVideo] = useState(false);

  // Countdown timer for urgency (resets daily)
  const getTimeLeft = () => {
    const now = new Date();
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);
    const diff = endOfDay.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return { hours, minutes };
  };

  const timeLeft = getTimeLeft();

  return (
    <div className="min-h-screen bg-white">

      {/* ============================================ */}
      {/* SECTION 1: HERO - Pattern Interrupt + Hook */}
      {/* ============================================ */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white">
        {/* Urgency Bar */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-black py-2 px-4 text-center text-sm font-bold">
          <span className="animate-pulse inline-block mr-2">🔥</span>
          LIMITED: Free Pro Access for the next {timeLeft.hours}h {timeLeft.minutes}m —
          <span className="underline ml-1">Claim Your Spot Before Midnight</span>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">

            {/* Left Column - Copy */}
            <div>
              {/* Social Proof Badge */}
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-6">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-bold">JK</div>
                  <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-xs font-bold">MR</div>
                  <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-xs font-bold">DL</div>
                </div>
                <span className="text-sm text-white/90">
                  <strong className="text-white">2,847 investors</strong> analyzed deals this week
                </span>
              </div>

              {/* Main Headline - Specific Outcome + Timeframe */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.1] mb-6">
                Know Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Exact ROI</span> in 60 Seconds
                <span className="block text-2xl sm:text-3xl lg:text-4xl mt-3 font-bold text-white/90">
                  (Before You Risk a Single Dollar)
                </span>
              </h1>

              {/* Subheadline - Target Audience + Pain */}
              <p className="text-xl text-slate-300 mb-8 leading-relaxed">
                The same calculator used by <strong className="text-white">$50M+ property investors</strong> to
                analyze villa flips, rental yields, and development deals —
                <span className="text-amber-400 font-semibold"> without expensive consultants or complex spreadsheets.</span>
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <Link
                  to="/calculators"
                  className="group relative inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white text-lg font-bold rounded-lg hover:from-emerald-600 hover:to-cyan-600 transition-all shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-105"
                >
                  <span>Calculate My ROI Now</span>
                  <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <button
                  onClick={() => setShowVideo(true)}
                  className="inline-flex items-center justify-center px-6 py-4 border-2 border-white/30 text-white font-semibold rounded-lg hover:bg-white/10 transition-all"
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                  Watch 2-Min Demo
                </button>
              </div>

              {/* Risk Reversal Micro-Copy */}
              <p className="text-sm text-slate-400 flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Free forever plan • No credit card required • Results in 60 seconds
              </p>
            </div>

            {/* Right Column - Calculator Preview */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 blur-3xl rounded-full"></div>
              <div className="relative bg-slate-800/80 backdrop-blur-sm border border-slate-700 rounded-2xl p-6 shadow-2xl">
                {/* Mini Calculator Demo */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-slate-400">Quick ROI Analysis</span>
                  <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded">LIVE</span>
                </div>

                <div className="space-y-4 mb-6">
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">Purchase Price</label>
                    <div className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white font-mono text-lg">$450,000</div>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">Expected Sale Price</label>
                    <div className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white font-mono text-lg">$620,000</div>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">Hold Period</label>
                    <div className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white font-mono text-lg">18 months</div>
                  </div>
                </div>

                {/* Results */}
                <div className="bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/30 rounded-xl p-4">
                  <div className="text-center">
                    <p className="text-sm text-slate-400 mb-1">Your Annualized Return</p>
                    <p className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">24.7%</p>
                    <p className="text-sm text-emerald-400 mt-2">+$170,000 profit in 18 months</p>
                  </div>
                </div>

                {/* Trust Badge */}
                <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-slate-700">
                  <div className="flex items-center gap-1 text-xs text-slate-400">
                    <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    Bank-Level Security
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-400">
                    <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Instant Results
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Logo Bar - Social Proof */}
          <div className="mt-16 pt-12 border-t border-slate-700">
            <p className="text-center text-sm text-slate-500 mb-8">TRUSTED BY INVESTORS AT</p>
            <div className="flex flex-wrap justify-center items-center gap-8 lg:gap-16 opacity-60">
              <span className="text-xl font-bold text-slate-400">CBRE</span>
              <span className="text-xl font-bold text-slate-400">Knight Frank</span>
              <span className="text-xl font-bold text-slate-400">Colliers</span>
              <span className="text-xl font-bold text-slate-400">JLL</span>
              <span className="text-xl font-bold text-slate-400">Savills</span>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* SECTION 2: PROBLEM AGITATION */}
      {/* ============================================ */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-2 bg-red-100 text-red-700 font-bold text-sm rounded-full mb-4">
              THE UNCOMFORTABLE TRUTH
            </span>
            <h2 className="text-4xl sm:text-5xl font-black text-slate-900 mb-6">
              You're Probably Losing <span className="text-red-600">$47,000+</span> on Every Deal
            </h2>
            <p className="text-xl text-slate-600">
              (And you don't even know it)
            </p>
          </div>

          {/* Pain Points - Specific and Emotional */}
          <div className="space-y-6 mb-12">
            <div className="flex gap-4 p-6 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
              <div className="flex-shrink-0 text-3xl">😰</div>
              <div>
                <h3 className="font-bold text-lg text-slate-900 mb-2">
                  "I thought I was getting 15% returns... it was actually 6%"
                </h3>
                <p className="text-slate-600">
                  Most investors calculate ROI wrong. They forget closing costs, renovation overruns,
                  vacancy periods, and time value of money. One investor told us he "made $80,000" on a flip —
                  until he realized his <strong>actual annualized return was worse than a savings account.</strong>
                </p>
              </div>
            </div>

            <div className="flex gap-4 p-6 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
              <div className="flex-shrink-0 text-3xl">⏰</div>
              <div>
                <h3 className="font-bold text-lg text-slate-900 mb-2">
                  "By the time I finished my spreadsheet, someone else bought it"
                </h3>
                <p className="text-slate-600">
                  Good deals don't wait. While you're fumbling with Excel formulas and Googling
                  "how to calculate XIRR," your competitors are making offers.
                  <strong> Speed kills in real estate — but only if your numbers are right.</strong>
                </p>
              </div>
            </div>

            <div className="flex gap-4 p-6 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
              <div className="flex-shrink-0 text-3xl">🎲</div>
              <div>
                <h3 className="font-bold text-lg text-slate-900 mb-2">
                  "I'm basically gambling with six figures"
                </h3>
                <p className="text-slate-600">
                  You wouldn't invest $500,000 in stocks without analyzing the fundamentals.
                  So why are you buying properties based on "it feels like a good deal"?
                  <strong> Gut feelings don't compound. Precise calculations do.</strong>
                </p>
              </div>
            </div>
          </div>

          {/* Agitation Amplifier */}
          <div className="bg-slate-900 text-white p-8 rounded-2xl text-center">
            <p className="text-lg mb-4">
              Every day you operate on guesswork is another day you're:
            </p>
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <div className="p-4 bg-white/10 rounded-lg">
                <p className="text-3xl font-bold text-red-400">$47K</p>
                <p className="text-sm text-slate-300">avg. money left on table per deal</p>
              </div>
              <div className="p-4 bg-white/10 rounded-lg">
                <p className="text-3xl font-bold text-red-400">23 hrs</p>
                <p className="text-sm text-slate-300">wasted on manual calculations/month</p>
              </div>
              <div className="p-4 bg-white/10 rounded-lg">
                <p className="text-3xl font-bold text-red-400">3-5 deals</p>
                <p className="text-sm text-slate-300">missed annually from slow analysis</p>
              </div>
            </div>
            <p className="text-amber-400 font-bold">
              That's potentially $200,000+ in lost profits every single year.
            </p>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* SECTION 3: SOLUTION INTRODUCTION */}
      {/* ============================================ */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-emerald-100 text-emerald-700 font-bold text-sm rounded-full mb-4">
              THE SOLUTION
            </span>
            <h2 className="text-4xl sm:text-5xl font-black text-slate-900 mb-6">
              What If You Could Analyze <span className="text-emerald-600">Any Deal</span> in Under 60 Seconds?
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Introducing ROI Calculate — the precision investment analysis tool that turns
              complex financial modeling into a simple 3-step process.
            </p>
          </div>

          {/* Before/After Transformation */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {/* Before */}
            <div className="bg-white border-2 border-red-200 rounded-2xl p-8 relative">
              <div className="absolute -top-4 left-6 bg-red-500 text-white px-4 py-1 rounded-full text-sm font-bold">
                BEFORE
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-6 mt-2">The Old Way (Painful)</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <span className="text-red-500 text-xl">✗</span>
                  <span className="text-slate-600">Hours building custom spreadsheets from scratch</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-500 text-xl">✗</span>
                  <span className="text-slate-600">Googling formulas you'll forget next week</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-500 text-xl">✗</span>
                  <span className="text-slate-600">Second-guessing your calculations constantly</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-500 text-xl">✗</span>
                  <span className="text-slate-600">Missing critical factors like time value</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-500 text-xl">✗</span>
                  <span className="text-slate-600">Losing deals to faster competitors</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-500 text-xl">✗</span>
                  <span className="text-slate-600">Paying $500/hr consultants for basic analysis</span>
                </li>
              </ul>
            </div>

            {/* After */}
            <div className="bg-white border-2 border-emerald-200 rounded-2xl p-8 relative shadow-lg shadow-emerald-100">
              <div className="absolute -top-4 left-6 bg-emerald-500 text-white px-4 py-1 rounded-full text-sm font-bold">
                AFTER
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-6 mt-2">With ROI Calculate (Easy)</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <span className="text-emerald-500 text-xl">✓</span>
                  <span className="text-slate-600"><strong>60-second analysis</strong> with pre-built calculators</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-500 text-xl">✓</span>
                  <span className="text-slate-600"><strong>Institutional-grade formulas</strong> built in automatically</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-500 text-xl">✓</span>
                  <span className="text-slate-600"><strong>100% confidence</strong> in your numbers</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-500 text-xl">✓</span>
                  <span className="text-slate-600"><strong>XIRR, IRR, NPV, Cap Rate</strong> — all included</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-500 text-xl">✓</span>
                  <span className="text-slate-600"><strong>Beat competitors</strong> with instant decisions</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-500 text-xl">✓</span>
                  <span className="text-slate-600"><strong>$9/month</strong> vs. $500/hr consultants</span>
                </li>
              </ul>
            </div>
          </div>

          {/* How It Works - 3 Simple Steps */}
          <div className="bg-slate-900 rounded-3xl p-8 lg:p-12">
            <h3 className="text-2xl font-bold text-white text-center mb-12">
              How It Works (3 Simple Steps)
            </h3>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center text-2xl font-bold text-white mx-auto mb-4">
                  1
                </div>
                <h4 className="text-xl font-bold text-white mb-2">Enter Your Numbers</h4>
                <p className="text-slate-400">
                  Purchase price, expected returns, hold period. Takes 30 seconds.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center text-2xl font-bold text-white mx-auto mb-4">
                  2
                </div>
                <h4 className="text-xl font-bold text-white mb-2">Get Instant Analysis</h4>
                <p className="text-slate-400">
                  XIRR, ROI, cash flow projections, cap rate — all calculated automatically.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center text-2xl font-bold text-white mx-auto mb-4">
                  3
                </div>
                <h4 className="text-xl font-bold text-white mb-2">Make Confident Decisions</h4>
                <p className="text-slate-400">
                  Know exactly what you'll make. Export PDF reports for partners and lenders.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* SECTION 4: FEATURE SHOWCASE */}
      {/* ============================================ */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-slate-900 mb-4">
              8 Professional Calculators. One Platform.
            </h2>
            <p className="text-xl text-slate-600">
              Every tool you need to analyze any real estate investment scenario.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: '📈', name: 'XIRR Calculator', desc: 'Exact returns on villa flips with irregular cash flows', highlight: true },
              { icon: '🏠', name: '10-Year Rental ROI', desc: 'Project decade-long rental income and appreciation', highlight: true },
              { icon: '💰', name: 'Mortgage Calculator', desc: 'Analyze loan terms and full amortization schedules', highlight: false },
              { icon: '💸', name: 'Cash Flow Projector', desc: 'Model income, expenses, and net cash flow', highlight: false },
              { icon: '🏗️', name: 'Development Feasibility', desc: 'Evaluate construction costs, timelines, and ROI', highlight: true },
              { icon: '📊', name: 'Cap Rate Analysis', desc: 'Compare yields across different properties', highlight: false },
              { icon: '🎯', name: 'IRR Calculator', desc: 'Annualized returns for any cash flow stream', highlight: false },
              { icon: '🔢', name: 'NPV Calculator', desc: 'Net present value at any discount rate', highlight: false },
            ].map((calc, idx) => (
              <div
                key={idx}
                className={`p-6 rounded-xl border-2 transition-all hover:shadow-lg ${
                  calc.highlight
                    ? 'border-emerald-300 bg-emerald-50'
                    : 'border-slate-200 bg-white hover:border-indigo-300'
                }`}
              >
                <div className="text-4xl mb-4">{calc.icon}</div>
                <h3 className="font-bold text-lg text-slate-900 mb-2">{calc.name}</h3>
                <p className="text-sm text-slate-600">{calc.desc}</p>
                {calc.highlight && (
                  <span className="inline-block mt-3 text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-1 rounded">
                    MOST POPULAR
                  </span>
                )}
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/calculators"
              className="inline-flex items-center gap-2 px-8 py-4 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 transition-all"
            >
              Try All Calculators Free
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* SECTION 5: SOCIAL PROOF - TESTIMONIALS */}
      {/* ============================================ */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-indigo-100 text-indigo-700 font-bold text-sm rounded-full mb-4">
              REAL RESULTS
            </span>
            <h2 className="text-4xl font-black text-slate-900 mb-4">
              Join 2,847+ Investors Making Smarter Decisions
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {/* Testimonial 1 - Specific Result */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex items-center gap-1 text-amber-400 mb-4">
                {'★★★★★'.split('').map((star, i) => <span key={i}>{star}</span>)}
              </div>
              <p className="text-slate-700 mb-6 leading-relaxed">
                "I was about to pay <strong>$480K for a villa</strong> that my gut said was a good deal.
                ROI Calculate showed me the actual XIRR was <strong>only 4.2%</strong> — worse than bonds.
                I walked away and found a deal with <strong>18.3% returns</strong> instead.
                <span className="text-emerald-600 font-bold"> This tool literally saved me $127,000.</span>"
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold">
                  JK
                </div>
                <div>
                  <p className="font-bold text-slate-900">James K.</p>
                  <p className="text-sm text-slate-500">Villa Investor, Bali • 12 properties</p>
                </div>
              </div>
            </div>

            {/* Testimonial 2 - Speed */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex items-center gap-1 text-amber-400 mb-4">
                {'★★★★★'.split('').map((star, i) => <span key={i}>{star}</span>)}
              </div>
              <p className="text-slate-700 mb-6 leading-relaxed">
                "Used to spend <strong>4-5 hours</strong> building spreadsheets for each deal.
                Now I analyze opportunities in <strong>under 2 minutes</strong>.
                Last month, I made an offer <strong>same-day</strong> and beat 3 other buyers.
                <span className="text-emerald-600 font-bold"> Closed at 8% under asking.</span>"
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold">
                  MR
                </div>
                <div>
                  <p className="font-bold text-slate-900">Michael R.</p>
                  <p className="text-sm text-slate-500">Portfolio Manager, Singapore • $23M AUM</p>
                </div>
              </div>
            </div>

            {/* Testimonial 3 - Professional */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex items-center gap-1 text-amber-400 mb-4">
                {'★★★★★'.split('').map((star, i) => <span key={i}>{star}</span>)}
              </div>
              <p className="text-slate-700 mb-6 leading-relaxed">
                "I run a <strong>$50M property fund</strong>. We used to pay analysts $80K/year
                for deal screening. Now my team uses ROI Calculate for <strong>first-pass analysis</strong> —
                we screen 3x more deals and our hit rate improved by <strong>40%</strong>.
                <span className="text-emerald-600 font-bold"> Best $9/month I've ever spent.</span>"
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center text-white font-bold">
                  DL
                </div>
                <div>
                  <p className="font-bold text-slate-900">David L.</p>
                  <p className="text-sm text-slate-500">Fund Manager, Hong Kong • $50M+ fund</p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="bg-slate-900 rounded-2xl p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <p className="text-4xl font-black text-white">2,847</p>
                <p className="text-slate-400 text-sm">Active Investors</p>
              </div>
              <div>
                <p className="text-4xl font-black text-white">$127M</p>
                <p className="text-slate-400 text-sm">Deals Analyzed</p>
              </div>
              <div>
                <p className="text-4xl font-black text-white">47,293</p>
                <p className="text-slate-400 text-sm">Calculations Run</p>
              </div>
              <div>
                <p className="text-4xl font-black text-white">4.9/5</p>
                <p className="text-slate-400 text-sm">Average Rating</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* SECTION 6: VALUE STACK + PRICING */}
      {/* ============================================ */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black text-slate-900 mb-4">
              Everything You Need to Invest with Confidence
            </h2>
            <p className="text-xl text-slate-600">
              Here's what you get when you start using ROI Calculate today:
            </p>
          </div>

          {/* Value Stack */}
          <div className="bg-slate-50 rounded-3xl p-8 lg:p-12 mb-12">
            <div className="space-y-6">
              {[
                { item: '8 Professional-Grade Calculators', value: '$2,400', desc: '(vs. hiring an analyst)' },
                { item: 'XIRR & IRR for Complex Cash Flows', value: '$500', desc: '(vs. financial consultant)' },
                { item: '10-Year Rental Projections', value: '$300', desc: '(vs. custom modeling)' },
                { item: 'Multi-Currency Support', value: '$200', desc: '(IDR, USD, EUR, etc.)' },
                { item: 'PDF Report Export', value: '$150', desc: '(professional presentations)' },
                { item: 'Unlimited Scenario Comparisons', value: '$400', desc: '(side-by-side analysis)' },
                { item: 'Portfolio Tracking Dashboard', value: '$250', desc: '(all deals in one place)' },
                { item: 'Priority Email Support', value: '$200', desc: '(answers within 24 hours)' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between py-4 border-b border-slate-200 last:border-0">
                  <div className="flex items-center gap-4">
                    <svg className="w-6 h-6 text-emerald-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <div>
                      <span className="font-semibold text-slate-900">{item.item}</span>
                      <span className="text-sm text-slate-500 ml-2">{item.desc}</span>
                    </div>
                  </div>
                  <span className="text-slate-400 line-through font-medium">{item.value}</span>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-8 border-t-2 border-slate-300">
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-slate-900">Total Value:</span>
                <span className="text-2xl font-bold text-slate-400 line-through">$4,400/year</span>
              </div>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-8">
            {/* Free */}
            <div className="bg-white border-2 border-slate-200 rounded-2xl p-8">
              <h3 className="text-xl font-bold text-slate-900 mb-2">Free</h3>
              <p className="text-slate-500 mb-6">Try before you commit</p>
              <div className="mb-6">
                <span className="text-5xl font-black text-slate-900">$0</span>
                <span className="text-slate-500">/forever</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-slate-600">
                  <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  3 calculations per month
                </li>
                <li className="flex items-center gap-2 text-slate-600">
                  <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  All 8 calculators
                </li>
                <li className="flex items-center gap-2 text-slate-600">
                  <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Save 1 project
                </li>
              </ul>
              <Link
                to="/calculators"
                className="block w-full py-3 text-center border-2 border-slate-900 text-slate-900 font-bold rounded-lg hover:bg-slate-50 transition-colors"
              >
                Start Free
              </Link>
            </div>

            {/* Pro - Highlighted */}
            <div className="bg-gradient-to-b from-emerald-500 to-cyan-600 rounded-2xl p-8 text-white relative transform md:scale-105 shadow-xl">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-amber-400 text-slate-900 px-4 py-1 rounded-full text-sm font-bold">
                MOST POPULAR
              </div>
              <h3 className="text-xl font-bold mb-2">Pro</h3>
              <p className="text-emerald-100 mb-6">For serious investors</p>
              <div className="mb-6">
                <span className="text-5xl font-black">$9</span>
                <span className="text-emerald-100">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <strong>Unlimited</strong> calculations
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  All 8 calculators
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <strong>25 saved projects</strong>
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <strong>PDF export</strong>
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Scenario comparison
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Priority support
                </li>
              </ul>
              <Link
                to="/calculators"
                className="block w-full py-3 text-center bg-white text-emerald-600 font-bold rounded-lg hover:bg-emerald-50 transition-colors"
              >
                Start 7-Day Free Trial
              </Link>
              <p className="text-center text-xs text-emerald-100 mt-3">
                No credit card required
              </p>
            </div>

            {/* Enterprise */}
            <div className="bg-white border-2 border-slate-200 rounded-2xl p-8">
              <h3 className="text-xl font-bold text-slate-900 mb-2">Enterprise</h3>
              <p className="text-slate-500 mb-6">For teams & funds</p>
              <div className="mb-6">
                <span className="text-5xl font-black text-slate-900">Custom</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-slate-600">
                  <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Everything in Pro
                </li>
                <li className="flex items-center gap-2 text-slate-600">
                  <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Unlimited team members
                </li>
                <li className="flex items-center gap-2 text-slate-600">
                  <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  API access
                </li>
                <li className="flex items-center gap-2 text-slate-600">
                  <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  White-label option
                </li>
                <li className="flex items-center gap-2 text-slate-600">
                  <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Dedicated support
                </li>
              </ul>
              <Link
                to="/contact"
                className="block w-full py-3 text-center border-2 border-slate-900 text-slate-900 font-bold rounded-lg hover:bg-slate-50 transition-colors"
              >
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* SECTION 7: RISK REVERSAL - GUARANTEE */}
      {/* ============================================ */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-emerald-50">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block mb-6">
            <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
          </div>

          <h2 className="text-4xl font-black text-slate-900 mb-6">
            The "Better Decisions or Free" Guarantee
          </h2>

          <p className="text-xl text-slate-700 mb-8 max-w-2xl mx-auto leading-relaxed">
            Try ROI Calculate risk-free for <strong>30 full days</strong>. If you don't feel more confident
            about your investment decisions, if you don't save hours on deal analysis, if you're not
            completely satisfied for any reason — just email us and we'll refund every penny.
            <span className="text-emerald-600 font-bold"> No questions asked. No hoops to jump through.</span>
          </p>

          <div className="flex flex-wrap justify-center gap-6 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              30-day money-back guarantee
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Cancel anytime, no penalties
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              No credit card for free plan
            </div>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* SECTION 8: FAQ - OBJECTION HANDLING */}
      {/* ============================================ */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-black text-slate-900 text-center mb-12">
            Frequently Asked Questions
          </h2>

          <div className="space-y-6">
            {[
              {
                q: "Can't I just use Excel?",
                a: "Sure, if you want to spend 4-5 hours building formulas, debugging #REF errors, and still wonder if your XIRR calculation is correct. Most investors who switch from Excel tell us they save 20+ hours per month. At $9/month, that's less than 50 cents per hour saved — not counting the deals you'll close faster."
              },
              {
                q: "Is this accurate for international investments?",
                a: "Absolutely. We support multiple currencies (USD, EUR, IDR, SGD, etc.) with proper handling of exchange rates. The calculators use the same institutional-grade formulas used by property funds worldwide — just without the $500/hour consultant fees."
              },
              {
                q: "What if I'm just getting started in real estate?",
                a: "Perfect timing. Learning to analyze deals properly from day one will save you from the expensive mistakes that wipe out first-time investors. Our calculators include tooltips that explain every metric, so you'll build investment literacy while making better decisions."
              },
              {
                q: "How is this different from other ROI calculators?",
                a: "Most free calculators online give you basic ROI (sale price minus purchase price). That's dangerously oversimplified. We calculate XIRR (time-weighted returns), factor in all cash flows, project 10-year scenarios, handle irregular timings, and account for costs most calculators ignore. It's the difference between amateur and professional analysis."
              },
              {
                q: "Can I cancel anytime?",
                a: "Yes, with one click. No phone calls, no retention specialists, no guilt trips. We believe if we're not providing value, you should leave. That confidence comes from knowing 94% of Pro users stay for 12+ months."
              },
              {
                q: "Is my financial data secure?",
                a: "Bank-level secure. We use 256-bit encryption, never sell your data, and are fully GDPR compliant. Your deal information stays yours — we make money from subscriptions, not from selling investor data."
              },
            ].map((faq, idx) => (
              <details key={idx} className="group bg-slate-50 rounded-xl">
                <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                  <span className="font-bold text-slate-900">{faq.q}</span>
                  <svg className="w-5 h-5 text-slate-500 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-6 pb-6 text-slate-600 leading-relaxed">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* SECTION 9: FINAL CTA - URGENCY */}
      {/* ============================================ */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900">
        <div className="max-w-4xl mx-auto text-center">
          {/* Urgency Reminder */}
          <div className="inline-block bg-amber-500 text-slate-900 px-6 py-2 rounded-full text-sm font-bold mb-8">
            ⏰ Free Pro trial expires in {timeLeft.hours}h {timeLeft.minutes}m
          </div>

          <h2 className="text-4xl sm:text-5xl font-black text-white mb-6 leading-tight">
            Still Analyzing Deals on Gut Feeling?
          </h2>

          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Every day you wait is another deal analyzed wrong, another opportunity missed,
            another competitor who moved faster. The best time to start was yesterday.
            The second best time is right now.
          </p>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 mb-8 max-w-xl mx-auto">
            <p className="text-white font-bold mb-4">Start your free analysis in 60 seconds:</p>
            <Link
              to="/calculators"
              className="block w-full py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white text-xl font-bold rounded-lg hover:from-emerald-600 hover:to-cyan-600 transition-all shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50"
            >
              Get My Exact ROI Now →
            </Link>
            <p className="text-slate-400 text-sm mt-4">
              Free forever plan • No credit card • Results in 60 seconds
            </p>
          </div>

          {/* Final Trust Stack */}
          <div className="flex flex-wrap justify-center gap-6 text-sm text-slate-400">
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              256-bit Encryption
            </span>
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              GDPR Compliant
            </span>
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              2,847+ Happy Investors
            </span>
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              30-Day Guarantee
            </span>
          </div>
        </div>
      </section>

      {/* Video Modal */}
      {showVideo && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setShowVideo(false)}
        >
          <div className="bg-slate-900 rounded-2xl p-4 max-w-4xl w-full">
            <div className="flex justify-between items-center mb-4">
              <span className="text-white font-bold">Product Demo</span>
              <button
                onClick={() => setShowVideo(false)}
                className="text-slate-400 hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="aspect-video bg-slate-800 rounded-lg flex items-center justify-center">
              <p className="text-slate-400">Video placeholder — add your demo video here</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
