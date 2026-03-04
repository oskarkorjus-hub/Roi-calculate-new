import { Link } from 'react-router-dom';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, useMotionValue, useSpring, useInView, animate, AnimatePresence } from 'framer-motion';

// ============================================
// ANIMATED COMPONENTS
// ============================================

// Counting Number Animation
const CountingNumber = ({ value, delay = 0 }: { value: string; delay?: number }) => {
  const [displayValue, setDisplayValue] = useState("0");
  const hasAnimated = useRef(false);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView || hasAnimated.current) return;
    hasAnimated.current = true;

    const numericMatch = value.match(/^[\d.]+/);
    const suffix = value.replace(/^[\d.]+/, '');

    if (numericMatch) {
      const targetNum = parseFloat(numericMatch[0]);
      const isDecimal = numericMatch[0].includes('.');

      const timeout = setTimeout(() => {
        animate(0, targetNum, {
          duration: 2,
          ease: [0.32, 0.72, 0, 1],
          onUpdate: (latest) => {
            if (isDecimal) {
              setDisplayValue(latest.toFixed(1) + suffix);
            } else {
              setDisplayValue(Math.round(latest) + suffix);
            }
          },
        });
      }, delay * 1000);

      return () => clearTimeout(timeout);
    } else {
      setDisplayValue(value);
    }
  }, [isInView, value, delay]);

  return <span ref={ref}>{displayValue}</span>;
};

// Magnetic Button
const MagneticButton = ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) => {
  const ref = useRef<HTMLAnchorElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { damping: 15, stiffness: 150 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set((e.clientX - centerX) * 0.3);
    y.set((e.clientY - centerY) * 0.3);
  }, [x, y]);

  const handleMouseLeave = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  return (
    <motion.a
      ref={ref}
      href={href}
      className={className}
      style={{ x: springX, y: springY }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileTap={{ scale: 0.98 }}
    >
      {children}
    </motion.a>
  );
};

// Glass Card with 3D Tilt
const GlassCard = ({ children, className = '', index = 0 }: { children: React.ReactNode; className?: string; index?: number }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });
  const [isHovering, setIsHovering] = useState(false);
  const isInView = useInView(cardRef, { once: true, margin: '-50px' });

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePosition({ x, y });
  }, []);

  const rotateX = isHovering ? (mousePosition.y - 50) * -0.1 : 0;
  const rotateY = isHovering ? (mousePosition.x - 50) * 0.1 : 0;

  return (
    <motion.div
      ref={cardRef}
      className={`group relative rounded-2xl border border-zinc-800/50 overflow-hidden ${className}`}
      style={{ transformStyle: 'preserve-3d', perspective: 1000 }}
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.215, 0.61, 0.355, 1] }}
      whileHover={{ rotateX, rotateY, scale: 1.02, transition: { duration: 0.2 } }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => { setIsHovering(false); setMousePosition({ x: 50, y: 50 }); }}
    >
      {/* Animated gradient border */}
      <motion.div
        className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-emerald-500/50 via-cyan-500/50 to-emerald-500/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ backgroundSize: '200% 200%' }}
        animate={isHovering ? { backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] } : {}}
        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
      />

      {/* Glass morphism background */}
      <div className="absolute inset-[1px] rounded-2xl bg-zinc-900/90 backdrop-blur-xl" />

      {/* Inner shadow for depth */}
      <div className="absolute inset-[1px] rounded-2xl pointer-events-none" style={{ boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.05), inset 0 -1px 1px rgba(0,0,0,0.3)' }} />

      {/* Cursor-following highlight */}
      <motion.div
        className="absolute inset-0 rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: `radial-gradient(400px circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(16, 185, 129, 0.15), transparent 40%)` }}
      />

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
};

// Floating Particle Background
const ParticleField = () => {
  const particles = useMemo(() => Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    duration: Math.random() * 20 + 15,
    delay: Math.random() * -20,
  })), []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            top: `${p.y}%`,
            background: `rgba(16, 185, 129, ${0.3 + Math.random() * 0.3})`,
            boxShadow: `0 0 ${p.size * 2}px rgba(16, 185, 129, 0.3)`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
};

// FAQ Accordion Item
const AccordionItem = ({
  question,
  answer,
  isOpen,
  onClick,
  index
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onClick: () => void;
  index: number;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <div
        className={`rounded-xl overflow-hidden transition-all duration-300 ${
          isOpen
            ? 'border-2 border-emerald-500 bg-zinc-900/80'
            : 'border border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'
        }`}
      >
        <button
          onClick={onClick}
          className="w-full flex items-center justify-between p-6 text-left"
        >
          <span className={`font-bold text-lg transition-colors ${isOpen ? 'text-white' : 'text-zinc-200'}`}>
            {question}
          </span>
          <motion.svg
            className={`w-5 h-5 flex-shrink-0 ml-4 ${isOpen ? 'text-emerald-400' : 'text-zinc-500'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </motion.svg>
        </button>

        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="overflow-hidden"
            >
              <div className="px-6 pb-6 text-zinc-400 leading-relaxed border-t border-zinc-800/50 pt-4">
                {answer}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

// Animated Background Blobs
const AnimatedBlobs = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <motion.div
      className="absolute -top-1/4 -left-1/4 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px]"
      animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3], x: [0, 50, 0], y: [0, 30, 0] }}
      transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
    />
    <motion.div
      className="absolute -top-1/4 -right-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px]"
      animate={{ scale: [1.2, 1, 1.2], opacity: [0.4, 0.2, 0.4], x: [0, -30, 0], y: [0, 50, 0] }}
      transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
    />
    <motion.div
      className="absolute bottom-0 left-1/3 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[100px]"
      animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
      transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
    />
  </div>
);

// Interactive Hero Calculator
const InteractiveCalculator = () => {
  const [purchasePrice, setPurchasePrice] = useState(450000);
  const [salePrice, setSalePrice] = useState(620000);
  const [holdMonths, setHoldMonths] = useState(18);
  const [isCalculating, setIsCalculating] = useState(false);

  // Calculate ROI metrics
  const profit = salePrice - purchasePrice;
  const totalROI = purchasePrice > 0 ? ((profit / purchasePrice) * 100) : 0;
  const annualizedReturn = purchasePrice > 0 && holdMonths > 0
    ? ((Math.pow(salePrice / purchasePrice, 12 / holdMonths) - 1) * 100)
    : 0;

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Handle input changes with animation
  const handleInputChange = (setter: (val: number) => void, value: string) => {
    const numValue = parseInt(value.replace(/[^0-9]/g, '')) || 0;
    setIsCalculating(true);
    setter(numValue);
    setTimeout(() => setIsCalculating(false), 300);
  };

  return (
    <GlassCard className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <span className="text-sm font-medium text-zinc-400">Quick ROI Analysis</span>
        <motion.span
          className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded"
          animate={{ opacity: isCalculating ? [1, 0.3, 1] : 1 }}
          transition={{ duration: 0.3 }}
        >
          {isCalculating ? 'CALCULATING...' : 'LIVE'}
        </motion.span>
      </div>

      {/* Inputs */}
      <div className="space-y-4 mb-6">
        {/* Purchase Price */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <label className="text-xs text-zinc-500 mb-1 block">Purchase Price</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">$</span>
            <input
              type="text"
              value={purchasePrice.toLocaleString()}
              onChange={(e) => handleInputChange(setPurchasePrice, e.target.value)}
              className="w-full bg-zinc-800/50 border border-zinc-700/50 hover:border-zinc-600 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 rounded-lg pl-8 pr-4 py-3 text-white font-mono text-lg outline-none transition-all"
            />
          </div>
        </motion.div>

        {/* Sale Price */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
        >
          <label className="text-xs text-zinc-500 mb-1 block">Expected Sale Price</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">$</span>
            <input
              type="text"
              value={salePrice.toLocaleString()}
              onChange={(e) => handleInputChange(setSalePrice, e.target.value)}
              className="w-full bg-zinc-800/50 border border-zinc-700/50 hover:border-zinc-600 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 rounded-lg pl-8 pr-4 py-3 text-white font-mono text-lg outline-none transition-all"
            />
          </div>
        </motion.div>

        {/* Hold Period */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8 }}
        >
          <label className="text-xs text-zinc-500 mb-1 block">Hold Period (months)</label>
          <div className="relative">
            <input
              type="range"
              min="1"
              max="120"
              value={holdMonths}
              onChange={(e) => {
                setIsCalculating(true);
                setHoldMonths(parseInt(e.target.value));
                setTimeout(() => setIsCalculating(false), 300);
              }}
              className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <div className="flex justify-between mt-2">
              <span className="text-xs text-zinc-600">1 mo</span>
              <span className="text-lg font-mono text-white font-bold">{holdMonths} months</span>
              <span className="text-xs text-zinc-600">10 yrs</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Results */}
      <motion.div
        className="bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/30 rounded-xl p-6"
        animate={isCalculating ? { scale: [1, 1.02, 1] } : {}}
        transition={{ duration: 0.3 }}
      >
        <div className="text-center">
          <p className="text-sm text-zinc-400 mb-2">Your Annualized Return</p>
          <motion.p
            className={`text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r ${
              annualizedReturn >= 0 ? 'from-emerald-400 to-cyan-400' : 'from-red-400 to-orange-400'
            }`}
            key={annualizedReturn.toFixed(1)}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            {annualizedReturn >= 0 ? '+' : ''}{annualizedReturn.toFixed(1)}%
          </motion.p>
          <motion.p
            className={`text-sm mt-2 ${profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}
            key={profit}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {profit >= 0 ? '+' : ''}{formatCurrency(profit)} profit in {holdMonths} months
          </motion.p>
        </div>

        {/* Additional Metrics */}
        <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-emerald-500/20">
          <div className="text-center">
            <p className="text-xs text-zinc-500">Total ROI</p>
            <p className={`text-lg font-bold ${totalROI >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {totalROI >= 0 ? '+' : ''}{totalROI.toFixed(1)}%
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-zinc-500">Monthly Gain</p>
            <p className={`text-lg font-bold ${profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {formatCurrency(profit / holdMonths)}/mo
            </p>
          </div>
        </div>
      </motion.div>

      {/* CTA */}
      <Link
        to="/calculators"
        className="block w-full mt-4 py-3 text-center bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-bold rounded-lg transition-all shadow-lg shadow-emerald-500/20"
      >
        Get Full Analysis →
      </Link>

      {/* Trust Badges */}
      <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-zinc-800">
        {[
          { icon: '🔒', text: 'Bank-Level Security' },
          { icon: '⚡', text: 'Instant Results' },
        ].map((badge, i) => (
          <div key={i} className="flex items-center gap-2 text-xs text-zinc-500">
            <span>{badge.icon}</span>
            {badge.text}
          </div>
        ))}
      </div>
    </GlassCard>
  );
};

// FAQ Section Component
const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0); // First item open by default

  const faqs = [
    {
      question: "Can't I just use Excel?",
      answer: "Sure, if you want to spend 4-5 hours building formulas, debugging #REF errors, and still wonder if your XIRR calculation is correct. Most investors who switch from Excel tell us they save 20+ hours per month. At $9/month, that's less than 50 cents per hour saved. Plus, Excel doesn't give you instant scenario comparison, PDF exports for lenders, or mobile access when you're on-site at a property."
    },
    {
      question: "Is this accurate for international investments?",
      answer: "Absolutely. We support multiple currencies (USD, EUR, IDR, SGD, AUD, GBP, and more) with proper handling of exchange rates. The calculators use the same institutional-grade formulas used by property funds managing billions in assets worldwide. Whether you're investing in Bali villas, London apartments, or Singapore condos — the math is the same."
    },
    {
      question: "What if I'm just getting started in real estate?",
      answer: "Perfect timing. Learning to analyze deals properly from day one will save you from the expensive mistakes that wipe out 73% of first-time investors. Our calculators include tooltips that explain every metric in plain English. You'll understand XIRR, cap rates, and cash-on-cash returns faster than any course could teach you — because you're learning by doing with real numbers."
    },
    {
      question: "How is this different from other ROI calculators?",
      answer: "Most free calculators online give you basic ROI — which is dangerously oversimplified. We calculate XIRR (time-weighted returns that account for WHEN cash flows happen), factor in ALL cash flows including closing costs and renovations, project 10-year scenarios with appreciation, handle irregular payment timings, and account for costs most calculators ignore. It's the difference between knowing you 'made money' and knowing your actual annualized return was 4.2% vs 18.3%."
    },
    {
      question: "Can I cancel anytime?",
      answer: "Yes, with one click from your account settings. No phone calls, no retention specialists, no guilt trips, no hidden fees. Cancel in 10 seconds flat. We earn your business every month. That confidence comes from knowing 94% of Pro users choose to stay for 12+ months — because the value is undeniable."
    },
    {
      question: "Is my financial data secure?",
      answer: "Bank-level secure. We use 256-bit AES encryption (the same standard used by major banks), all data is transmitted over TLS 1.3, and we never sell or share your information with third parties. We're fully GDPR and CCPA compliant. Your deal information stays yours — period. We also offer data export and deletion at any time."
    }
  ];

  return (
    <section className="py-24 px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl sm:text-4xl font-bold text-white text-center mb-12"
        >
          Frequently Asked Questions
        </motion.h2>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <AccordionItem
              key={i}
              question={faq.question}
              answer={faq.answer}
              isOpen={openIndex === i}
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              index={i}
            />
          ))}
        </div>

        {/* Additional Help CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12 pt-8 border-t border-zinc-800"
        >
          <p className="text-zinc-400 mb-4">
            Still have questions? We're here to help.
          </p>
          <a
            href="mailto:support@roicalculate.com"
            className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Contact Support
          </a>
        </motion.div>
      </div>
    </section>
  );
};

// ============================================
// MAIN LANDING PAGE COMPONENT
// ============================================

export function Landing() {
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });
  const heroRef = useRef<HTMLElement>(null);

  // Mouse tracking for hero
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!heroRef.current) return;
      const rect = heroRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setMousePosition({ x, y });
    };

    const hero = heroRef.current;
    if (hero) {
      hero.addEventListener('mousemove', handleMouseMove);
      return () => hero.removeEventListener('mousemove', handleMouseMove);
    }
  }, []);

  // Countdown timer for urgency
  const getTimeLeft = () => {
    const now = new Date();
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);
    const diff = endOfDay.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return { hours, minutes };
  };

  const [timeLeft, setTimeLeft] = useState(getTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(getTimeLeft()), 60000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a]">

      {/* ============================================ */}
      {/* SECTION 1: HERO */}
      {/* ============================================ */}
      <section ref={heroRef} className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background Effects */}
        <AnimatedBlobs />
        <ParticleField />

        {/* Mouse-following spotlight */}
        <motion.div
          className="absolute w-[800px] h-[800px] rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(16, 185, 129, 0.08) 0%, transparent 70%)',
            left: `${mousePosition.x}%`,
            top: `${mousePosition.y}%`,
            transform: 'translate(-50%, -50%)',
          }}
        />

        {/* Urgency Bar */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="absolute top-20 left-0 right-0 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white py-3 px-4 text-center text-sm font-medium z-20"
        >
          <span className="inline-flex items-center gap-2">
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              🔥
            </motion.span>
            LIMITED: Free Pro Access for the next {timeLeft.hours}h {timeLeft.minutes}m —
            <span className="underline ml-1 font-bold">Claim Your Spot Before Midnight</span>
          </span>
        </motion.div>

        <div className="relative max-w-6xl mx-auto px-6 lg:px-8 pt-36 pb-16 z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">

            {/* Left Column - Copy */}
            <div>
              {/* Social Proof Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full bg-zinc-800/50 border border-zinc-700/50 backdrop-blur-sm"
              >
                <motion.span
                  className="w-2 h-2 rounded-full bg-emerald-400"
                  animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <div className="flex -space-x-2 mr-2">
                  {['JK', 'MR', 'DL'].map((initials, i) => (
                    <div key={i} className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-[10px] font-bold text-white border-2 border-zinc-800">
                      {initials}
                    </div>
                  ))}
                </div>
                <span className="text-sm text-zinc-300">
                  <strong className="text-white">2,847 investors</strong> analyzed deals this week
                </span>
              </motion.div>

              {/* Main Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.1] mb-6"
              >
                Know Your{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                  Exact ROI
                </span>{' '}
                in 60 Seconds
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="block text-2xl sm:text-3xl mt-3 font-semibold text-zinc-400"
                >
                  (Before You Risk a Single Dollar)
                </motion.span>
              </motion.h1>

              {/* Subheadline */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-xl text-zinc-400 mb-8 leading-relaxed"
              >
                The same calculator used by <strong className="text-white">$50M+ property investors</strong> to
                analyze villa flips, rental yields, and development deals —
                <span className="text-emerald-400 font-semibold"> without expensive consultants or complex spreadsheets.</span>
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="flex flex-col sm:flex-row gap-4 mb-6"
              >
                <MagneticButton
                  href="/calculators"
                  className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-white text-zinc-900 font-semibold rounded-xl overflow-hidden"
                >
                  <motion.div
                    className="absolute -inset-[2px] rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ background: 'linear-gradient(90deg, #10b981, #06b6d4, #10b981)', backgroundSize: '300% 100%' }}
                    animate={{ backgroundPosition: ['0% 0%', '300% 0%'] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                  />
                  <span className="relative z-10 bg-white px-8 py-4 rounded-[10px] flex items-center gap-3 -m-[2px] group-hover:bg-gradient-to-r group-hover:from-emerald-500 group-hover:to-cyan-500 group-hover:text-white transition-all duration-300">
                    Calculate My ROI Now
                    <motion.svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </motion.svg>
                  </span>
                </MagneticButton>

                <motion.a
                  href="#how-it-works"
                  className="group inline-flex items-center justify-center gap-2 px-6 py-4 text-zinc-300 font-medium rounded-xl border border-zinc-800 hover:border-zinc-600 hover:bg-zinc-800/30 backdrop-blur-sm transition-all duration-300"
                  whileHover={{ y: -2, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  Watch 2-Min Demo
                </motion.a>
              </motion.div>

              {/* Trust indicators */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="flex flex-wrap items-center gap-4 text-sm text-zinc-500"
              >
                {['Free forever plan', 'No credit card required', 'Results in 60 seconds'].map((text, i) => (
                  <span key={i} className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {text}
                  </span>
                ))}
              </motion.div>
            </div>

            {/* Right Column - Interactive Calculator */}
            <motion.div
              initial={{ opacity: 0, x: 50, rotateY: -10 }}
              animate={{ opacity: 1, x: 0, rotateY: 0 }}
              transition={{ duration: 1, delay: 0.4 }}
              className="relative"
              style={{ perspective: 1000 }}
            >
              <InteractiveCalculator />

              {/* Floating elements */}
              <motion.div
                className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-2xl flex items-center justify-center text-3xl shadow-lg shadow-emerald-500/30"
                animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              >
                📈
              </motion.div>

              <motion.div
                className="absolute -bottom-4 -left-4 px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-sm"
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
              >
                <span className="text-emerald-400 font-bold">+847%</span>
                <span className="text-zinc-400 ml-2">avg ROI tracked</span>
              </motion.div>
            </motion.div>
          </div>

          {/* Logo Bar - Infinite Scroll Marquee */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="mt-20 pt-12 border-t border-zinc-800 relative overflow-hidden"
          >
            <p className="text-center text-xs text-zinc-500 uppercase tracking-wider mb-8">
              Trusted by innovative companies
            </p>

            {/* Gradient masks for fade effect */}
            <div className="absolute left-0 top-12 bottom-0 w-32 bg-gradient-to-r from-[#0a0a0a] to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-12 bottom-0 w-32 bg-gradient-to-l from-[#0a0a0a] to-transparent z-10 pointer-events-none" />

            {/* Scrolling track */}
            <div className="overflow-hidden">
              <motion.div
                className="flex items-center gap-16 whitespace-nowrap"
                animate={{
                  x: ['0%', '-50%'],
                }}
                transition={{
                  x: {
                    duration: 30,
                    repeat: Infinity,
                    ease: 'linear',
                  },
                }}
              >
                {/* Duplicate logos for seamless loop */}
                {[...Array(4)].map((_, setIndex) => (
                  <div key={setIndex} className="flex items-center gap-16">
                    {[
                      { name: 'Pellago', logo: '/logos/pellago.webp' },
                      { name: 'Investland Bali', logo: '/logos/investland-bali.webp' },
                      { name: 'Luup Design', logo: '/logos/luup-design.png' },
                      { name: 'Constructland Indonesia', logo: '/logos/constructland.png' },
                      { name: 'PropertyBase', logo: '/logos/propertybase.png' },
                    ].map((company) => (
                      <div
                        key={`${company.name}-${setIndex}`}
                        className="flex-shrink-0 flex items-center justify-center h-10 px-4 opacity-50 hover:opacity-80 transition-all duration-300"
                      >
                        <img
                          src={company.logo}
                          alt={company.name}
                          className="h-full w-auto max-w-[140px] object-contain brightness-0 invert"
                        />
                      </div>
                    ))}
                  </div>
                ))}
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Bottom gradient line */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />
      </section>

      {/* ============================================ */}
      {/* SECTION 2: PROBLEM AGITATION */}
      {/* ============================================ */}
      <section className="relative py-24 px-6 lg:px-8 overflow-hidden">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <span className="inline-block px-4 py-2 bg-red-500/10 text-red-400 font-bold text-sm rounded-full mb-6 border border-red-500/20">
              THE UNCOMFORTABLE TRUTH
            </span>
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
              You're Probably Losing <span className="text-red-400">$47,000+</span> on Every Deal
            </h2>
            <p className="text-xl text-zinc-500">(And you don't even know it)</p>
          </motion.div>

          {/* Pain Points */}
          <div className="space-y-6 mb-12">
            {[
              { emoji: '😰', title: '"I thought I was getting 15% returns... it was actually 6%"', desc: 'Most investors calculate ROI wrong. They forget closing costs, renovation overruns, vacancy periods, and time value of money. One investor told us he "made $80,000" on a flip — until he realized his actual annualized return was worse than a savings account.' },
              { emoji: '⏰', title: '"By the time I finished my spreadsheet, someone else bought it"', desc: 'Good deals don\'t wait. While you\'re fumbling with Excel formulas and Googling "how to calculate XIRR," your competitors are making offers. Speed kills in real estate — but only if your numbers are right.' },
              { emoji: '🎲', title: '"I\'m basically gambling with six figures"', desc: 'You wouldn\'t invest $500,000 in stocks without analyzing the fundamentals. So why are you buying properties based on "it feels like a good deal"? Gut feelings don\'t compound. Precise calculations do.' },
            ].map((pain, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <GlassCard index={i} className="p-6 border-l-4 border-red-500/50">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 text-3xl">{pain.emoji}</div>
                    <div>
                      <h3 className="font-bold text-lg text-white mb-2">{pain.title}</h3>
                      <p className="text-zinc-400">{pain.desc}</p>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>

          {/* Loss Amplifier */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center"
          >
            <p className="text-lg text-zinc-300 mb-6">Every day you operate on guesswork is another day you're:</p>
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              {[
                { value: '$47K', label: 'avg. money left on table per deal' },
                { value: '23 hrs', label: 'wasted on manual calculations/month' },
                { value: '3-5 deals', label: 'missed annually from slow analysis' },
              ].map((stat, i) => (
                <div key={i} className="p-4 bg-zinc-800/50 rounded-xl">
                  <p className="text-3xl font-bold text-red-400">
                    <CountingNumber value={stat.value} delay={0.3 + i * 0.2} />
                  </p>
                  <p className="text-sm text-zinc-500">{stat.label}</p>
                </div>
              ))}
            </div>
            <p className="text-amber-400 font-bold text-lg">
              That's potentially $200,000+ in lost profits every single year.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ============================================ */}
      {/* SECTION 3: SOLUTION */}
      {/* ============================================ */}
      <section id="how-it-works" className="relative py-24 px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="inline-block px-4 py-2 bg-emerald-500/10 text-emerald-400 font-bold text-sm rounded-full mb-6 border border-emerald-500/20">
              THE SOLUTION
            </span>
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
              What If You Could Analyze <span className="gradient-text">Any Deal</span> in Under 60 Seconds?
            </h2>
            <p className="text-xl text-zinc-400 max-w-3xl mx-auto">
              Introducing ROI Calculate — the precision investment analysis tool that turns complex financial modeling into a simple 3-step process.
            </p>
          </motion.div>

          {/* Before/After */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {/* Before */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="absolute -top-3 left-6 px-4 py-1 bg-red-500 text-white text-sm font-bold rounded-full z-10">
                BEFORE
              </div>
              <GlassCard className="p-8 border-red-500/30">
                <h3 className="text-xl font-bold text-white mb-6 mt-2">The Old Way (Painful)</h3>
                <ul className="space-y-4">
                  {[
                    'Hours building custom spreadsheets from scratch',
                    'Googling formulas you\'ll forget next week',
                    'Second-guessing your calculations constantly',
                    'Missing critical factors like time value',
                    'Losing deals to faster competitors',
                    'Paying $500/hr consultants for basic analysis',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-zinc-400">
                      <span className="text-red-400 text-xl">✗</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </GlassCard>
            </motion.div>

            {/* After */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="absolute -top-3 left-6 px-4 py-1 bg-emerald-500 text-white text-sm font-bold rounded-full z-10">
                AFTER
              </div>
              <GlassCard className="p-8 border-emerald-500/30 glow-emerald">
                <h3 className="text-xl font-bold text-white mb-6 mt-2">With ROI Calculate (Easy)</h3>
                <ul className="space-y-4">
                  {[
                    { text: '60-second analysis', bold: true },
                    { text: 'Institutional-grade formulas', bold: true },
                    { text: '100% confidence', bold: true },
                    { text: 'XIRR, IRR, NPV, Cap Rate', bold: true },
                    { text: 'Beat competitors', bold: true },
                    { text: '$9/month vs. $500/hr', bold: true },
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-zinc-300">
                      <span className="text-emerald-400 text-xl">✓</span>
                      <span><strong className="text-white">{item.text}</strong> — built in automatically</span>
                    </li>
                  ))}
                </ul>
              </GlassCard>
            </motion.div>
          </div>

          {/* 3 Steps */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <GlassCard className="p-8 lg:p-12">
              <h3 className="text-2xl font-bold text-white text-center mb-12">
                How It Works (3 Simple Steps)
              </h3>
              <div className="grid md:grid-cols-3 gap-8">
                {[
                  { num: '1', title: 'Enter Your Numbers', desc: 'Purchase price, expected returns, hold period. Takes 30 seconds.' },
                  { num: '2', title: 'Get Instant Analysis', desc: 'XIRR, ROI, cash flow projections, cap rate — all calculated automatically.' },
                  { num: '3', title: 'Make Confident Decisions', desc: 'Know exactly what you\'ll make. Export PDF reports for partners and lenders.' },
                ].map((step, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="text-center"
                  >
                    <motion.div
                      className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center text-2xl font-bold text-white mx-auto mb-4"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                    >
                      {step.num}
                    </motion.div>
                    <h4 className="text-xl font-bold text-white mb-2">{step.title}</h4>
                    <p className="text-zinc-400">{step.desc}</p>
                  </motion.div>
                ))}
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </section>

      {/* ============================================ */}
      {/* SECTION 4: FEATURES */}
      {/* ============================================ */}
      <section className="py-24 px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              8 Professional Calculators. One Platform.
            </h2>
            <p className="text-xl text-zinc-400">
              Every tool you need to analyze any real estate investment scenario.
            </p>
          </motion.div>

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
            ].map((calc, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <GlassCard index={i} className={`p-6 h-full ${calc.highlight ? 'border-emerald-500/30' : ''}`}>
                  <div className="text-4xl mb-4">{calc.icon}</div>
                  <h3 className="font-bold text-lg text-white mb-2">{calc.name}</h3>
                  <p className="text-sm text-zinc-400">{calc.desc}</p>
                  {calc.highlight && (
                    <span className="inline-block mt-4 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full">
                      MOST POPULAR
                    </span>
                  )}
                </GlassCard>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <Link
              to="/calculators"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-bold rounded-xl hover:from-emerald-600 hover:to-cyan-600 transition-all shadow-lg shadow-emerald-500/20"
            >
              Try All Calculators Free
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ============================================ */}
      {/* SECTION 5: TESTIMONIALS */}
      {/* ============================================ */}
      <section className="py-24 px-6 lg:px-8 relative overflow-hidden">
        <AnimatedBlobs />

        <div className="relative max-w-6xl mx-auto z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="inline-block px-4 py-2 bg-cyan-500/10 text-cyan-400 font-bold text-sm rounded-full mb-6 border border-cyan-500/20">
              REAL RESULTS
            </span>
            <h2 className="text-4xl font-bold text-white mb-4">
              Join 2,847+ Investors Making Smarter Decisions
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {[
              {
                initials: 'JK',
                name: 'James K.',
                role: 'Villa Investor, Bali • 12 properties',
                quote: 'I was about to pay $480K for a villa that my gut said was a good deal. ROI Calculate showed me the actual XIRR was only 4.2% — worse than bonds. I walked away and found a deal with 18.3% returns instead.',
                result: 'This tool literally saved me $127,000.',
                gradient: 'from-blue-500 to-violet-500',
              },
              {
                initials: 'MR',
                name: 'Michael R.',
                role: 'Portfolio Manager, Singapore • $23M AUM',
                quote: 'Used to spend 4-5 hours building spreadsheets for each deal. Now I analyze opportunities in under 2 minutes. Last month, I made an offer same-day and beat 3 other buyers.',
                result: 'Closed at 8% under asking.',
                gradient: 'from-emerald-500 to-teal-500',
              },
              {
                initials: 'DL',
                name: 'David L.',
                role: 'Fund Manager, Hong Kong • $50M+ fund',
                quote: 'I run a $50M property fund. We used to pay analysts $80K/year for deal screening. Now my team uses ROI Calculate for first-pass analysis — we screen 3x more deals and our hit rate improved by 40%.',
                result: 'Best $9/month I\'ve ever spent.',
                gradient: 'from-amber-500 to-orange-500',
              },
            ].map((testimonial, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <GlassCard index={i} className="p-8 h-full">
                  {/* Stars */}
                  <div className="flex gap-1 text-amber-400 mb-4">
                    {'★★★★★'.split('').map((star, j) => <span key={j}>{star}</span>)}
                  </div>

                  {/* Quote */}
                  <p className="text-zinc-300 mb-4 leading-relaxed">
                    "{testimonial.quote}"
                    <span className="text-emerald-400 font-semibold"> {testimonial.result}</span>
                  </p>

                  {/* Author */}
                  <div className="flex items-center gap-4 mt-6 pt-4 border-t border-zinc-800">
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${testimonial.gradient} flex items-center justify-center text-white font-bold`}>
                      {testimonial.initials}
                    </div>
                    <div>
                      <p className="font-bold text-white">{testimonial.name}</p>
                      <p className="text-sm text-zinc-500">{testimonial.role}</p>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>

          {/* Stats Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <GlassCard className="p-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                {[
                  { value: '2,847', label: 'Active Investors' },
                  { value: '$127M', label: 'Deals Analyzed' },
                  { value: '47,293', label: 'Calculations Run' },
                  { value: '4.9/5', label: 'Average Rating' },
                ].map((stat, i) => (
                  <div key={i}>
                    <p className="text-3xl sm:text-4xl font-bold text-white">
                      <CountingNumber value={stat.value} delay={0.2 + i * 0.1} />
                    </p>
                    <p className="text-zinc-500 text-sm">{stat.label}</p>
                  </div>
                ))}
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </section>

      {/* ============================================ */}
      {/* SECTION 6: PRICING */}
      {/* ============================================ */}
      <section className="py-24 px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Everything You Need to Invest with Confidence
            </h2>
            <p className="text-xl text-zinc-400">
              Start free, upgrade when you're ready.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Free */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <GlassCard className="p-8 h-full">
                <h3 className="text-xl font-bold text-white mb-2">Free</h3>
                <p className="text-zinc-500 mb-6">Try before you commit</p>
                <div className="mb-6">
                  <span className="text-5xl font-black text-white">$0</span>
                  <span className="text-zinc-500">/forever</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {['3 calculations per month', 'All 8 calculators', 'Save 1 project'].map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-zinc-400">
                      <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/calculators"
                  className="block w-full py-3 text-center border-2 border-zinc-700 text-white font-bold rounded-xl hover:bg-zinc-800 transition-colors"
                >
                  Start Free
                </Link>
              </GlassCard>
            </motion.div>

            {/* Pro */}
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 1.02 }}
              whileInView={{ opacity: 1, y: 0, scale: 1.05 }}
              viewport={{ once: true }}
              className="relative z-10"
            >
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white text-sm font-bold rounded-full z-20">
                MOST POPULAR
              </div>
              <div className="bg-gradient-to-b from-emerald-500 to-cyan-600 rounded-2xl p-8 text-white shadow-xl shadow-emerald-500/20">
                <h3 className="text-xl font-bold mb-2">Pro</h3>
                <p className="text-emerald-100 mb-6">For serious investors</p>
                <div className="mb-6">
                  <span className="text-5xl font-black">$9</span>
                  <span className="text-emerald-100">/month</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {[
                    'Unlimited calculations',
                    'All 8 calculators',
                    '25 saved projects',
                    'PDF export',
                    'Scenario comparison',
                    'Priority support',
                  ].map((feature, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/calculators"
                  className="block w-full py-3 text-center bg-white text-emerald-600 font-bold rounded-xl hover:bg-emerald-50 transition-colors"
                >
                  Start 7-Day Free Trial
                </Link>
                <p className="text-center text-xs text-emerald-100 mt-3">
                  No credit card required
                </p>
              </div>
            </motion.div>

            {/* Enterprise */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <GlassCard className="p-8 h-full">
                <h3 className="text-xl font-bold text-white mb-2">Enterprise</h3>
                <p className="text-zinc-500 mb-6">For teams & funds</p>
                <div className="mb-6">
                  <span className="text-5xl font-black text-white">Custom</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {['Everything in Pro', 'Unlimited team members', 'API access', 'White-label option', 'Dedicated support'].map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-zinc-400">
                      <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                <a
                  href="mailto:hello@roicalculate.com"
                  className="block w-full py-3 text-center border-2 border-zinc-700 text-white font-bold rounded-xl hover:bg-zinc-800 transition-colors"
                >
                  Contact Sales
                </a>
              </GlassCard>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* SECTION 7: GUARANTEE */}
      {/* ============================================ */}
      <section className="py-24 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <GlassCard className="p-12 text-center border-emerald-500/30">
              <motion.div
                className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-8"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </motion.div>

              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                The "Better Decisions or Free" Guarantee
              </h2>

              <p className="text-xl text-zinc-300 mb-8 max-w-2xl mx-auto leading-relaxed">
                Try ROI Calculate risk-free for <strong className="text-white">30 full days</strong>. If you don't feel more confident
                about your investment decisions, if you don't save hours on deal analysis, if you're not
                completely satisfied for any reason — just email us and we'll refund every penny.
                <span className="text-emerald-400 font-bold"> No questions asked.</span>
              </p>

              <div className="flex flex-wrap justify-center gap-6 text-sm text-zinc-400">
                {['30-day money-back guarantee', 'Cancel anytime', 'No credit card for free plan'].map((text, i) => (
                  <span key={i} className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {text}
                  </span>
                ))}
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </section>

      {/* ============================================ */}
      {/* SECTION 8: FAQ - OBJECTION HANDLING */}
      {/* ============================================ */}
      <FAQSection />

      {/* ============================================ */}
      {/* SECTION 9: FINAL CTA */}
      {/* ============================================ */}
      <section className="py-24 px-6 lg:px-8 relative overflow-hidden">
        <AnimatedBlobs />

        <div className="relative max-w-4xl mx-auto text-center z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            {/* Urgency Reminder */}
            <motion.div
              className="inline-block px-6 py-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white text-sm font-bold rounded-full mb-8"
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              ⏰ Free Pro trial expires in {timeLeft.hours}h {timeLeft.minutes}m
            </motion.div>

            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6 leading-tight">
              Still Analyzing Deals on Gut Feeling?
            </h2>

            <p className="text-xl text-zinc-400 mb-12 max-w-2xl mx-auto">
              Every day you wait is another deal analyzed wrong, another opportunity missed,
              another competitor who moved faster. The best time to start was yesterday.
              The second best time is right now.
            </p>

            <GlassCard className="p-8 max-w-xl mx-auto glow-emerald">
              <p className="text-white font-bold mb-6">Start your free analysis in 60 seconds:</p>
              <Link
                to="/calculators"
                className="block w-full py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white text-xl font-bold rounded-xl hover:from-emerald-600 hover:to-cyan-600 transition-all shadow-lg shadow-emerald-500/30"
              >
                Get My Exact ROI Now →
              </Link>
              <p className="text-zinc-500 text-sm mt-4">
                Free forever plan • No credit card • Results in 60 seconds
              </p>
            </GlassCard>

            {/* Final Trust Stack */}
            <div className="flex flex-wrap justify-center gap-6 text-sm text-zinc-500 mt-12">
              {['256-bit Encryption', 'GDPR Compliant', '2,847+ Happy Investors', '30-Day Guarantee'].map((text, i) => (
                <span key={i} className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  {text}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-zinc-800">
        <div className="max-w-6xl mx-auto text-center text-zinc-600 text-sm">
          <p>© 2024 ROI Calculate. Built for serious property investors.</p>
        </div>
      </footer>
    </div>
  );
}
