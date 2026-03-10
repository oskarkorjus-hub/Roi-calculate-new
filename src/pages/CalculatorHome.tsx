import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalculatorGrid } from '../components/CalculatorGrid';
import { useAuth } from '../lib/auth-context';

const RECENT_CALCULATORS_KEY = 'baliinvest_recent_calculators';
const MAX_RECENT = 5;
const CURRENCY_KEY = 'baliinvest_default_currency';

interface CalculatorHomeProps {
  onSelectCalculator: (id: string) => void;
}

// Custom easing for premium animations
const premiumEase: [number, number, number, number] = [0.16, 1, 0.3, 1];

// Stagger animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: premiumEase,
    },
  },
};

export function CalculatorHome({ onSelectCalculator }: CalculatorHomeProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [defaultCurrency, setDefaultCurrency] = useState(
    localStorage.getItem(CURRENCY_KEY) || 'USD'
  );
  const { user, signOut } = useAuth();

  const recentCalculators = JSON.parse(
    localStorage.getItem(RECENT_CALCULATORS_KEY) || '[]'
  ) as string[];

  const handleSelectCalculator = (id: string) => {
    const updated = [id, ...recentCalculators.filter(c => c !== id)].slice(0, MAX_RECENT);
    localStorage.setItem(RECENT_CALCULATORS_KEY, JSON.stringify(updated));
    onSelectCalculator(id);
  };

  return (
    <div className="min-h-screen bg-mesh-gradient">
      {/* Subtle grid overlay */}
      <div className="fixed inset-0 bg-grid-pattern opacity-30 pointer-events-none" />

      {/* Floating gradient orbs for atmosphere */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-40 right-1/4 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Premium Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: premiumEase }}
          className="border-b border-zinc-800/50 backdrop-blur-xl bg-zinc-900/30"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div className="flex items-center gap-4">
                {/* Animated icon */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
                  className="relative"
                >
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/10 border border-emerald-500/30 flex items-center justify-center">
                    <span className="material-symbols-outlined text-2xl text-emerald-400">
                      calculate
                    </span>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-zinc-900 animate-pulse" />
                </motion.div>

                <div>
                  <motion.h1
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="text-3xl font-display font-bold text-white tracking-tight"
                  >
                    Calculators
                  </motion.h1>
                  <motion.p
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="text-zinc-400 mt-1 font-body"
                  >
                    Professional real estate investment analysis tools
                  </motion.p>
                </div>
              </div>

              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="flex items-center gap-3"
              >
                <a
                  href="/contact"
                  className="group flex items-center gap-2 px-4 py-2.5 text-sm text-zinc-400 hover:text-white border border-zinc-800/50 rounded-xl hover:border-zinc-700 hover:bg-zinc-800/50 transition-all duration-300"
                >
                  <span className="material-symbols-outlined text-lg group-hover:text-emerald-400 transition-colors">help</span>
                  <span className="hidden sm:inline font-body">Help</span>
                </a>
                <button
                  onClick={() => setShowSettings(true)}
                  className="group flex items-center gap-2 px-4 py-2.5 text-sm bg-zinc-800/50 text-white rounded-xl hover:bg-zinc-800 border border-zinc-700/50 hover:border-zinc-600 transition-all duration-300"
                >
                  <span className="material-symbols-outlined text-lg group-hover:rotate-90 transition-transform duration-300">settings</span>
                  <span className="hidden sm:inline font-body">Settings</span>
                </button>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <motion.main
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10"
        >
          <motion.div variants={itemVariants}>
            <CalculatorGrid
              onSelectCalculator={handleSelectCalculator}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              recentCalculators={recentCalculators}
            />
          </motion.div>
        </motion.main>
      </div>

      {/* Settings Modal - Premium Design */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={() => setShowSettings(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              transition={{ duration: 0.4, ease: premiumEase }}
              className="card-premium rounded-2xl w-full max-w-md overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="relative flex items-center justify-between p-6 border-b border-zinc-800/50">
                {/* Gradient line at top */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-zinc-800/80 flex items-center justify-center">
                    <span className="material-symbols-outlined text-emerald-400">tune</span>
                  </div>
                  <h2 className="text-xl font-display font-bold text-white">Settings</h2>
                </div>
                <button
                  onClick={() => setShowSettings(false)}
                  className="p-2 text-zinc-400 hover:text-white transition-colors rounded-lg hover:bg-zinc-800/50"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                {/* Account Section */}
                {user && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="space-y-3"
                  >
                    <label className="stat-label block">Account</label>
                    <div className="flex items-center justify-between p-4 stat-card">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 flex items-center justify-center">
                          <span className="text-emerald-400 font-display font-bold text-lg">
                            {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-white font-display font-semibold">{user.name || 'User'}</p>
                          <p className="text-zinc-500 text-sm font-body">{user.email}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Default Currency */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="space-y-3"
                >
                  <label className="stat-label block">Default Currency</label>
                  <select
                    value={defaultCurrency}
                    onChange={(e) => {
                      setDefaultCurrency(e.target.value);
                      localStorage.setItem(CURRENCY_KEY, e.target.value);
                    }}
                    className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-xl text-white font-body focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  >
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - British Pound</option>
                    <option value="IDR">IDR - Indonesian Rupiah</option>
                    <option value="SGD">SGD - Singapore Dollar</option>
                    <option value="AUD">AUD - Australian Dollar</option>
                  </select>
                </motion.div>

                {/* Data Management */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="space-y-3"
                >
                  <label className="stat-label block">Data Management</label>
                  <button
                    onClick={() => {
                      if (confirm('Clear all recent calculators history?')) {
                        localStorage.removeItem(RECENT_CALCULATORS_KEY);
                        setShowSettings(false);
                        window.location.reload();
                      }
                    }}
                    className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-xl text-zinc-300 hover:bg-zinc-800 hover:border-zinc-600 transition-all text-left flex items-center gap-3 font-body"
                  >
                    <span className="material-symbols-outlined text-zinc-400">history</span>
                    Clear Recent History
                  </button>
                </motion.div>

                {/* Sign Out */}
                {user && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="pt-4 border-t border-zinc-800/50"
                  >
                    <button
                      onClick={async () => {
                        await signOut();
                        setShowSettings(false);
                      }}
                      className="w-full px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 hover:bg-red-500/20 hover:border-red-500/50 transition-all flex items-center justify-center gap-2 font-display font-medium"
                    >
                      <span className="material-symbols-outlined">logout</span>
                      Sign Out
                    </button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
