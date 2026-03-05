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
          className="w-full flex items-center justify-between p-4 sm:p-6 text-left min-h-[56px] sm:min-h-[64px]"
        >
          <span className={`font-bold text-base sm:text-lg transition-colors pr-3 ${isOpen ? 'text-white' : 'text-zinc-200'}`}>
            {question}
          </span>
          <motion.svg
            className={`w-5 h-5 flex-shrink-0 ${isOpen ? 'text-emerald-400' : 'text-zinc-500'}`}
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
              <div className="px-4 sm:px-6 pb-4 sm:pb-6 text-sm sm:text-base text-zinc-400 leading-relaxed border-t border-zinc-800/50 pt-3 sm:pt-4">
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
      <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
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
              inputMode="numeric"
              value={purchasePrice.toLocaleString()}
              onChange={(e) => handleInputChange(setPurchasePrice, e.target.value)}
              className="w-full bg-zinc-800/50 border border-zinc-700/50 hover:border-zinc-600 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 rounded-lg pl-8 pr-4 py-3 min-h-[44px] text-white font-mono text-base sm:text-lg outline-none transition-all"
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
              inputMode="numeric"
              value={salePrice.toLocaleString()}
              onChange={(e) => handleInputChange(setSalePrice, e.target.value)}
              className="w-full bg-zinc-800/50 border border-zinc-700/50 hover:border-zinc-600 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 rounded-lg pl-8 pr-4 py-3 min-h-[44px] text-white font-mono text-base sm:text-lg outline-none transition-all"
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
              className="w-full h-3 sm:h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              style={{ touchAction: 'none' }}
            />
            <div className="flex justify-between mt-2">
              <span className="text-xs text-zinc-600">1 mo</span>
              <span className="text-base sm:text-lg font-mono text-white font-bold">{holdMonths} months</span>
              <span className="text-xs text-zinc-600">10 yrs</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Results */}
      <motion.div
        className="bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/30 rounded-xl p-4 sm:p-6"
        animate={isCalculating ? { scale: [1, 1.02, 1] } : {}}
        transition={{ duration: 0.3 }}
      >
        <div className="text-center">
          <p className="text-xs sm:text-sm text-zinc-400 mb-1 sm:mb-2">Your Annualized Return</p>
          <motion.p
            className={`text-3xl sm:text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r ${
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
            className={`text-xs sm:text-sm mt-1 sm:mt-2 ${profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}
            key={profit}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {profit >= 0 ? '+' : ''}{formatCurrency(profit)} in {holdMonths}mo
          </motion.p>
        </div>

        {/* Additional Metrics */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-emerald-500/20">
          <div className="text-center">
            <p className="text-[10px] sm:text-xs text-zinc-500">Total ROI</p>
            <p className={`text-base sm:text-lg font-bold ${totalROI >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {totalROI >= 0 ? '+' : ''}{totalROI.toFixed(1)}%
            </p>
          </div>
          <div className="text-center">
            <p className="text-[10px] sm:text-xs text-zinc-500">Monthly Gain</p>
            <p className={`text-base sm:text-lg font-bold ${profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {formatCurrency(profit / holdMonths)}/mo
            </p>
          </div>
        </div>
      </motion.div>

      {/* CTA */}
      <a
        href="#pricing"
        className="block w-full mt-3 sm:mt-4 py-3 min-h-[44px] text-center bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white text-sm sm:text-base font-bold rounded-lg transition-all shadow-lg shadow-emerald-500/20"
      >
        Get Full Analysis →
      </a>

      {/* Trust Badges */}
      <div className="flex items-center justify-center gap-4 sm:gap-6 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-zinc-800">
        {[
          { icon: '🔒', text: 'Secure' },
          { icon: '⚡', text: 'Instant' },
        ].map((badge, i) => (
          <div key={i} className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-zinc-500">
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
      answer: "Sure, if you want to spend 4-5 hours building formulas, debugging #REF errors, and still wonder if your XIRR calculation is correct. Most investors who switch from Excel tell us they save 20+ hours per month. At $19/month, that's less than $1 per hour saved. Plus, Excel doesn't give you instant scenario comparison, PDF exports for lenders, or mobile access when you're on-site at a property."
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
    <section className="py-12 sm:py-16 lg:py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white text-center mb-8 sm:mb-12"
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
          className="text-center mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-zinc-800"
        >
          <p className="text-sm sm:text-base text-zinc-400 mb-4">
            Still have questions? We're here to help.
          </p>
          <a
            href="mailto:hello@investlandgroup.com"
            className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 font-medium transition-colors py-2 min-h-[44px] text-sm sm:text-base"
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
          className="absolute top-16 sm:top-20 left-0 right-0 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white py-2 sm:py-3 px-3 sm:px-4 text-center text-xs sm:text-sm font-medium z-20"
        >
          <span className="inline-flex items-center gap-1 sm:gap-2 flex-wrap justify-center">
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              🔥
            </motion.span>
            <span className="hidden sm:inline">LIMITED: Free Pro Access for the next {timeLeft.hours}h {timeLeft.minutes}m —</span>
            <span className="sm:hidden">Free Pro: {timeLeft.hours}h {timeLeft.minutes}m left —</span>
            <span className="underline font-bold">Claim Your Spot</span>
          </span>
        </motion.div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-28 lg:pt-36 pb-12 sm:pb-16 z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">

            {/* Left Column - Copy */}
            <div>
              {/* Social Proof Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 mb-6 sm:mb-8 rounded-full bg-zinc-800/50 border border-zinc-700/50 backdrop-blur-sm"
              >
                <motion.span
                  className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0"
                  animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <div className="flex -space-x-2 mr-1 sm:mr-2 flex-shrink-0">
                  {['JK', 'MR', 'DL'].map((initials, i) => (
                    <div key={i} className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-[8px] sm:text-[10px] font-bold text-white border-2 border-zinc-800">
                      {initials}
                    </div>
                  ))}
                </div>
                <span className="text-xs sm:text-sm text-zinc-300">
                  <strong className="text-white">2,847</strong> <span className="hidden xs:inline">investors</span> analyzed deals
                </span>
              </motion.div>

              {/* Main Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-white leading-[1.1] mb-4 sm:mb-6"
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
                  className="block text-lg sm:text-xl lg:text-2xl xl:text-3xl mt-2 sm:mt-3 font-semibold text-zinc-400"
                >
                  (Before You Risk a Single Dollar)
                </motion.span>
              </motion.h1>

              {/* Subheadline */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-base sm:text-lg lg:text-xl text-zinc-400 mb-6 sm:mb-8 leading-relaxed"
              >
                The same calculator used by <strong className="text-white">$50M+ property investors</strong> to
                analyze villa flips, rental yields, and development deals —
                <span className="text-emerald-400 font-semibold"> without expensive consultants or complex spreadsheets.</span>
              </motion.p>

              {/* CTA Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="mb-6 flex flex-col sm:flex-row gap-3"
              >
                <Link
                  to="/signup"
                  className="inline-flex items-center justify-center gap-3 px-8 py-4 min-h-[52px] bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-bold text-lg rounded-xl hover:from-emerald-600 hover:to-cyan-600 transition-all duration-300 shadow-lg shadow-emerald-500/30"
                >
                  Start Free Now
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
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
                className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30"
                animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              >
                <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </motion.div>

              <motion.div
                className="absolute -bottom-4 -left-4 px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-sm z-10"
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
            className="mt-20 pt-12 border-t border-zinc-800 relative overflow-hidden z-20"
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
                      { name: 'diil.ai', logo: '/logos/diil-ai.svg' },
                    ].map((company) => (
                      <div
                        key={`${company.name}-${setIndex}`}
                        className="flex-shrink-0 flex items-center justify-center h-10 px-4 opacity-50 hover:opacity-80 transition-all duration-300"
                      >
                        <img
                          src={company.logo}
                          alt={company.name}
                          className="h-full w-auto max-w-[140px] object-contain"
                          style={{ filter: 'brightness(0) invert(1)', mixBlendMode: 'lighten' }}
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
      <section className="relative py-12 sm:py-16 lg:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
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
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-4 sm:mb-6">
              You're Probably Losing <span className="text-red-400">$47,000+</span> on Every Deal
            </h2>
            <p className="text-xl text-zinc-500">(And you don't even know it)</p>
          </motion.div>

          {/* Pain Points */}
          <div className="space-y-6 mb-12">
            {[
              { title: '"I thought I was getting 15% returns... it was actually 6%"', desc: 'Most investors calculate ROI wrong. They forget closing costs, renovation overruns, vacancy periods, and time value of money. One investor told us he "made $80,000" on a flip — until he realized his actual annualized return was worse than a savings account.' },
              { title: '"By the time I finished my spreadsheet, someone else bought it"', desc: 'Good deals don\'t wait. While you\'re fumbling with Excel formulas and Googling "how to calculate XIRR," your competitors are making offers. Speed kills in real estate — but only if your numbers are right.' },
              { title: '"I\'m basically gambling with six figures"', desc: 'You wouldn\'t invest $500,000 in stocks without analyzing the fundamentals. So why are you buying properties based on "it feels like a good deal"? Gut feelings don\'t compound. Precise calculations do.' },
            ].map((pain, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <GlassCard index={i} className="p-6 border-l-4 border-red-500/50">
                  <div>
                    <h3 className="font-bold text-lg text-white mb-2">{pain.title}</h3>
                    <p className="text-zinc-400">{pain.desc}</p>
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
            className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 sm:p-6 lg:p-8 text-center"
          >
            <p className="text-base sm:text-lg text-zinc-300 mb-4 sm:mb-6">Every day you operate on guesswork is another day you're:</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
              {[
                { value: '$47K', label: 'money left on table' },
                { value: '23 hrs', label: 'wasted monthly' },
                { value: '3-5 deals', label: 'missed annually' },
              ].map((stat, i) => (
                <div key={i} className="p-3 sm:p-4 bg-zinc-800/50 rounded-xl">
                  <p className="text-2xl sm:text-3xl font-bold text-red-400">
                    <CountingNumber value={stat.value} delay={0.3 + i * 0.2} />
                  </p>
                  <p className="text-xs sm:text-sm text-zinc-500">{stat.label}</p>
                </div>
              ))}
            </div>
            <p className="text-amber-400 font-bold text-base sm:text-lg">
              That's potentially $200,000+ in lost profits every year.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ============================================ */}
      {/* SECTION 3: SOLUTION */}
      {/* ============================================ */}
      <section id="how-it-works" className="relative py-12 sm:py-16 lg:py-24 px-4 sm:px-6 lg:px-8">
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
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-4 sm:mb-6">
              What If You Could Analyze <span className="gradient-text">Any Deal</span> in Under 60 Seconds?
            </h2>
            <p className="text-xl text-zinc-400 max-w-3xl mx-auto">
              Introducing ROI Calculate — the precision investment analysis tool that turns complex financial modeling into a simple 3-step process.
            </p>
          </motion.div>

          {/* Before/After */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-12 sm:mb-16">
            {/* Before */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="absolute -top-2.5 sm:-top-3 left-4 sm:left-6 px-3 sm:px-4 py-1 bg-red-500 text-white text-xs sm:text-sm font-bold rounded-full z-10">
                BEFORE
              </div>
              <GlassCard className="p-5 sm:p-6 lg:p-8 border-red-500/30">
                <h3 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6 mt-2">The Old Way</h3>
                <ul className="space-y-2.5 sm:space-y-4">
                  {[
                    'Hours building spreadsheets',
                    'Googling formulas constantly',
                    'Second-guessing calculations',
                    'Missing critical factors',
                    'Losing deals to competitors',
                    'Paying $500/hr consultants',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2 sm:gap-3 text-sm sm:text-base text-zinc-400">
                      <span className="text-red-400 text-lg sm:text-xl flex-shrink-0">✗</span>
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
              <div className="absolute -top-2.5 sm:-top-3 left-4 sm:left-6 px-3 sm:px-4 py-1 bg-emerald-500 text-white text-xs sm:text-sm font-bold rounded-full z-10">
                AFTER
              </div>
              <GlassCard className="p-5 sm:p-6 lg:p-8 border-emerald-500/30 glow-emerald">
                <h3 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6 mt-2">With ROI Calculate</h3>
                <ul className="space-y-2.5 sm:space-y-4">
                  {[
                    { text: '60-second analysis' },
                    { text: 'Institutional formulas' },
                    { text: '100% confidence' },
                    { text: 'XIRR, IRR, NPV, Cap Rate' },
                    { text: 'Beat competitors' },
                    { text: '$19/month vs. $500/hr' },
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2 sm:gap-3 text-sm sm:text-base text-zinc-300">
                      <span className="text-emerald-400 text-lg sm:text-xl flex-shrink-0">✓</span>
                      <span><strong className="text-white">{item.text}</strong></span>
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
            <GlassCard className="p-5 sm:p-6 lg:p-8 xl:p-12">
              <h3 className="text-xl sm:text-2xl font-bold text-white text-center mb-8 sm:mb-10 lg:mb-12">
                How It Works (3 Simple Steps)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
                {[
                  { num: '1', title: 'Enter Numbers', desc: 'Purchase price, returns, hold period. 30 seconds.' },
                  { num: '2', title: 'Get Analysis', desc: 'XIRR, ROI, projections — all automatic.' },
                  { num: '3', title: 'Decide Confidently', desc: 'Know your returns. Export PDF reports.' },
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
                      className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center text-xl sm:text-2xl font-bold text-white mx-auto mb-3 sm:mb-4"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                    >
                      {step.num}
                    </motion.div>
                    <h4 className="text-lg sm:text-xl font-bold text-white mb-1.5 sm:mb-2">{step.title}</h4>
                    <p className="text-sm sm:text-base text-zinc-400">{step.desc}</p>
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
      <section className="py-12 sm:py-16 lg:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">
              13 Professional Calculators. One Platform.
            </h2>
            <p className="text-xl text-zinc-400">
              Every tool you need to analyze any real estate investment scenario.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {[
              { name: 'XIRR Calculator', desc: 'Exact returns on villa flips with irregular cash flows', icon: 'calculate', color: 'purple', highlight: true },
              { name: 'Annualized ROI', desc: 'Project 10-year rental income and calculate annual returns', icon: 'trending_up', color: 'cyan', highlight: true },
              { name: 'Mortgage Calculator', desc: 'Analyze loan terms and full amortization schedules', icon: 'account_balance', color: 'emerald', highlight: false },
              { name: 'Cash Flow Projector', desc: 'Model rental income, expenses, and net cash flow', icon: 'payments', color: 'green', highlight: false },
              { name: 'Development Feasibility', desc: 'Evaluate construction costs, timelines, and ROI', icon: 'construction', color: 'orange', highlight: true },
              { name: 'Cap Rate Analysis', desc: 'Compare yields across different properties', icon: 'percent', color: 'amber', highlight: false },
              { name: 'IRR Calculator', desc: 'Annualized returns for any cash flow stream', icon: 'show_chart', color: 'blue', highlight: false },
              { name: 'NPV Calculator', desc: 'Net present value at any discount rate', icon: 'savings', color: 'teal', highlight: false },
              { name: 'Indonesia Tax Optimizer', desc: 'Optimize taxes with depreciation and deductions', icon: 'receipt_long', color: 'red', highlight: true },
              { name: 'Rental Income Projection', desc: 'Advanced vacation rental with seasonality', icon: 'calendar_month', color: 'indigo', highlight: false },
              { name: 'Financing Comparison', desc: 'Compare up to 4 loan options side-by-side', icon: 'account_balance', color: 'cyan', highlight: false },
              { name: 'Budget Tracker', desc: 'Track construction budgets and timelines', icon: 'track_changes', color: 'yellow', highlight: false },
              { name: 'Risk Assessment', desc: 'Comprehensive risk scoring with scenarios', icon: 'shield', color: 'rose', highlight: false },
            ].map((calc, i) => {
              const colorClasses: Record<string, string> = {
                emerald: 'bg-emerald-500/20 text-emerald-400',
                cyan: 'bg-cyan-500/20 text-cyan-400',
                purple: 'bg-purple-500/20 text-purple-400',
                green: 'bg-green-500/20 text-green-400',
                amber: 'bg-amber-500/20 text-amber-400',
                blue: 'bg-blue-500/20 text-blue-400',
                teal: 'bg-teal-500/20 text-teal-400',
                orange: 'bg-orange-500/20 text-orange-400',
                red: 'bg-red-500/20 text-red-400',
                indigo: 'bg-indigo-500/20 text-indigo-400',
                yellow: 'bg-yellow-500/20 text-yellow-400',
                rose: 'bg-rose-500/20 text-rose-400',
              };
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.03 }}
                >
                  <GlassCard index={i} className={`p-5 sm:p-6 h-full ${calc.highlight ? 'border-emerald-500/30' : ''}`}>
                    <div className={`w-10 h-10 rounded-lg ${colorClasses[calc.color]} flex items-center justify-center mb-3`}>
                      <span className="material-symbols-outlined text-xl">{calc.icon}</span>
                    </div>
                    <h3 className="font-bold text-base sm:text-lg text-white mb-2">{calc.name}</h3>
                    <p className="text-xs sm:text-sm text-zinc-400">{calc.desc}</p>
                    {calc.highlight && (
                      <span className="inline-block mt-3 sm:mt-4 text-[10px] sm:text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 sm:px-3 py-1 rounded-full">
                        MOST POPULAR
                      </span>
                    )}
                  </GlassCard>
                </motion.div>
              );
            })}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <a
              href="#pricing"
              className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 min-h-[44px] sm:py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-bold rounded-xl hover:from-emerald-600 hover:to-cyan-600 transition-all shadow-lg shadow-emerald-500/20 text-sm sm:text-base"
            >
              Try All Calculators Free
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
          </motion.div>
        </div>
      </section>

      {/* ============================================ */}
      {/* SECTION 5: TESTIMONIALS */}
      {/* ============================================ */}
      <section className="py-12 sm:py-16 lg:py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
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
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">
              Join 2,847+ Investors Making Smarter Decisions
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-8 sm:mb-12">
            {[
              {
                initials: 'RK',
                name: 'Ragnar Kenk',
                role: 'Director of Construction, Constructland',
                quote: 'I was skeptical about switching from our spreadsheets and WhatsApp groups. But once we migrated, I wondered why we waited so long. Project timelines, contractor updates, and cost tracking — all in one place instead of scattered across six different apps.',
                result: 'Cut admin time by 60%.',
                gradient: 'from-blue-500 to-violet-500',
              },
              {
                initials: 'AC',
                name: 'Alliyah Canta',
                role: 'Head of Business Development, Luup Design',
                quote: 'Before, we lost deals simply because follow-ups fell through the cracks. Now every inquiry gets tracked properly, and we know exactly when to reach out. We closed more deals last quarter than the entire previous year.',
                result: '3x faster lead response.',
                gradient: 'from-emerald-500 to-teal-500',
              },
              {
                initials: 'KS',
                name: 'Kevin Sooaluste',
                role: 'Founder, Pellago Real Estate Management',
                quote: 'Our investors used to call constantly asking for updates. Now they can see real-time returns and projections themselves. The trust we\'ve built has turned one-time investors into repeat clients.',
                result: '40% more investor renewals.',
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
                <GlassCard index={i} className="p-5 sm:p-8 h-full">
                  {/* Stars */}
                  <div className="flex gap-0.5 text-amber-400 mb-3 sm:mb-4 text-sm sm:text-base">
                    {'★★★★★'.split('').map((star, j) => <span key={j}>{star}</span>)}
                  </div>

                  {/* Quote */}
                  <p className="text-sm sm:text-base text-zinc-300 mb-3 sm:mb-4 leading-relaxed">
                    "{testimonial.quote}"
                    <span className="text-emerald-400 font-semibold"> {testimonial.result}</span>
                  </p>

                  {/* Author */}
                  <div className="flex items-center gap-3 sm:gap-4 mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-zinc-800">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br ${testimonial.gradient} flex items-center justify-center text-white text-sm sm:text-base font-bold flex-shrink-0`}>
                      {testimonial.initials}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-white text-sm sm:text-base">{testimonial.name}</p>
                      <p className="text-xs sm:text-sm text-zinc-500 truncate">{testimonial.role}</p>
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
            <GlassCard className="p-4 sm:p-6 lg:p-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 text-center">
                {[
                  { value: '2,847', label: 'Investors' },
                  { value: '$127M', label: 'Analyzed' },
                  { value: '47,293', label: 'Calculations' },
                  { value: '4.9/5', label: 'Rating' },
                ].map((stat, i) => (
                  <div key={i}>
                    <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
                      <CountingNumber value={stat.value} delay={0.2 + i * 0.1} />
                    </p>
                    <p className="text-zinc-500 text-xs sm:text-sm">{stat.label}</p>
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
      <section id="pricing" className="py-12 sm:py-16 lg:py-24 px-4 sm:px-6 lg:px-8 scroll-mt-20">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">
              Everything You Need to Invest with Confidence
            </h2>
            <p className="text-xl text-zinc-400">
              Start free, upgrade when you're ready.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {/* Free */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <GlassCard className="p-6 sm:p-8 h-full">
                <h3 className="text-lg sm:text-xl font-bold text-white mb-2">Free</h3>
                <p className="text-sm sm:text-base text-zinc-500 mb-4 sm:mb-6">Try before you commit</p>
                <div className="mb-4 sm:mb-6">
                  <span className="text-4xl sm:text-5xl font-black text-white">$0</span>
                  <span className="text-zinc-500">/forever</span>
                </div>
                <ul className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
                  {['3 calculations per month', 'All 13 calculators', 'Save 1 project'].map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm sm:text-base text-zinc-400">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/signup"
                  className="block w-full py-3.5 min-h-[44px] text-center border-2 border-zinc-700 text-white font-bold rounded-xl hover:bg-zinc-800 transition-colors text-sm sm:text-base"
                >
                  Get Started Free
                </Link>
                <p className="text-center text-[10px] sm:text-xs text-zinc-500 mt-2">
                  No credit card required
                </p>
              </GlassCard>
            </motion.div>

            {/* Pro */}
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 1.02 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              className="relative z-10 md:scale-105"
            >
              <div className="absolute -top-3 sm:-top-4 left-1/2 -translate-x-1/2 px-3 sm:px-4 py-1 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white text-xs sm:text-sm font-bold rounded-full z-20 whitespace-nowrap animate-pulse">
                MOST POPULAR - 73% Choose This
              </div>
              <div className="bg-gradient-to-b from-emerald-500 to-cyan-600 rounded-2xl p-6 sm:p-8 text-white shadow-xl shadow-emerald-500/30">
                <h3 className="text-lg sm:text-xl font-bold mb-2">Pro</h3>
                <p className="text-sm sm:text-base text-emerald-100 mb-4 sm:mb-6">For serious investors</p>
                <div className="mb-4 sm:mb-6">
                  <span className="text-4xl sm:text-5xl font-black">$19</span>
                  <span className="text-emerald-100">/month</span>
                  <p className="text-xs text-emerald-100/80 mt-1">or $149/year (save 35%)</p>
                </div>
                <ul className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
                  {[
                    'Unlimited calculations',
                    'All 13 calculators',
                    '25 saved projects',
                    'PDF export',
                    'Multi-currency support',
                    'Email support',
                  ].map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm sm:text-base">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/signup"
                  className="block w-full py-3.5 min-h-[44px] text-center bg-white text-emerald-600 font-bold rounded-xl hover:bg-emerald-50 transition-colors text-sm sm:text-base shadow-lg"
                >
                  Start Free - Upgrade Later
                </Link>
                <p className="text-center text-[10px] sm:text-xs text-emerald-100 mt-2 sm:mt-3">
                  Free 7-day trial, no credit card
                </p>
              </div>
            </motion.div>

            {/* Enterprise */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <GlassCard className="p-6 sm:p-8 h-full">
                <h3 className="text-lg sm:text-xl font-bold text-white mb-2">Enterprise</h3>
                <p className="text-sm sm:text-base text-zinc-500 mb-4 sm:mb-6">For teams & funds</p>
                <div className="mb-4 sm:mb-6">
                  <span className="text-4xl sm:text-5xl font-black text-white">$79</span>
                  <span className="text-zinc-500">/month</span>
                  <p className="text-xs text-zinc-500 mt-1">or $599/year (save 37%)</p>
                </div>
                <ul className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
                  {['Everything in Pro', 'Unlimited projects', 'Up to 5 team seats', 'API access', 'White-label option', '24/7 priority support'].map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm sm:text-base text-zinc-400">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/signup"
                  className="block w-full py-3.5 min-h-[44px] text-center border-2 border-zinc-700 text-white font-bold rounded-xl hover:bg-zinc-800 transition-colors text-sm sm:text-base"
                >
                  Start Enterprise Trial
                </Link>
                <p className="text-center text-[10px] sm:text-xs text-zinc-500 mt-2">
                  14-day free trial included
                </p>
              </GlassCard>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* SECTION 7: GUARANTEE */}
      {/* ============================================ */}
      <section className="py-12 sm:py-16 lg:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <GlassCard className="p-6 sm:p-8 lg:p-12 text-center border-emerald-500/30">
              <motion.div
                className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-6 sm:mb-8"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <svg className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </motion.div>

              <h2 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-white mb-4 sm:mb-6">
                The "Better Decisions or Free" Guarantee
              </h2>

              <p className="text-base sm:text-lg lg:text-xl text-zinc-300 mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed">
                Try ROI Calculate risk-free for <strong className="text-white">30 full days</strong>. If you don't feel more confident
                about your investment decisions — just email us and we'll refund every penny.
                <span className="text-emerald-400 font-bold"> No questions asked.</span>
              </p>

              <div className="flex flex-wrap justify-center gap-3 sm:gap-4 lg:gap-6 text-xs sm:text-sm text-zinc-400">
                {['30-day guarantee', 'Cancel anytime', 'No credit card'].map((text, i) => (
                  <span key={i} className="flex items-center gap-1.5 sm:gap-2">
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      <section className="py-12 sm:py-16 lg:py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <AnimatedBlobs />

        <div className="relative max-w-4xl mx-auto text-center z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            {/* Urgency Reminder */}
            <motion.div
              className="inline-block px-4 sm:px-6 py-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white text-xs sm:text-sm font-bold rounded-full mb-6 sm:mb-8"
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              ⏰ Free Pro: {timeLeft.hours}h {timeLeft.minutes}m left
            </motion.div>

            <h2 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-white mb-4 sm:mb-6 leading-tight">
              Still Analyzing Deals on Gut Feeling?
            </h2>

            <p className="text-base sm:text-lg lg:text-xl text-zinc-400 mb-8 sm:mb-12 max-w-2xl mx-auto">
              Every day you wait is another opportunity missed.
              The best time to start was yesterday. The second best time is right now.
            </p>

            <GlassCard className="p-5 sm:p-6 lg:p-8 max-w-xl mx-auto glow-emerald">
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="flex -space-x-2">
                  {['JK', 'MR', 'DL', 'AS'].map((initials, i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-[10px] font-bold text-white border-2 border-zinc-900">
                      {initials}
                    </div>
                  ))}
                </div>
                <span className="text-sm text-zinc-400">+47 joined today</span>
              </div>
              <p className="text-white font-bold mb-4 sm:mb-6 text-sm sm:text-base text-center">Start your free analysis in 60 seconds:</p>
              <Link
                to="/signup"
                className="block w-full py-4 min-h-[52px] bg-gradient-to-r from-emerald-500 to-cyan-500 text-white text-lg sm:text-xl font-bold rounded-xl hover:from-emerald-600 hover:to-cyan-600 transition-all shadow-lg shadow-emerald-500/30 text-center"
              >
                Create Free Account Now
              </Link>
              <div className="flex flex-wrap justify-center gap-4 mt-4 text-xs text-zinc-500">
                {['Free forever', 'No credit card', '60s results'].map((text, i) => (
                  <span key={i} className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {text}
                  </span>
                ))}
              </div>
            </GlassCard>

            {/* Final Trust Stack */}
            <div className="flex flex-wrap justify-center gap-3 sm:gap-4 lg:gap-6 text-xs sm:text-sm text-zinc-500 mt-8 sm:mt-12">
              {['256-bit Encryption', 'GDPR Compliant', '2,847+ Investors', '30-Day Guarantee'].map((text, i) => (
                <span key={i} className="flex items-center gap-1.5 sm:gap-2">
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
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
