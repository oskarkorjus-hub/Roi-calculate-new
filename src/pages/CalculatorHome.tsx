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
    // Add to recently used
    const updated = [id, ...recentCalculators.filter(c => c !== id)].slice(0, MAX_RECENT);
    localStorage.setItem(RECENT_CALCULATORS_KEY, JSON.stringify(updated));

    // Notify parent
    onSelectCalculator(id);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Clean Header */}
      <div className="border-b border-zinc-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
          >
            <div>
              <h1 className="text-3xl font-bold text-white">Calculators</h1>
              <p className="text-zinc-500 mt-2">
                Professional tools for real estate investment analysis
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-3">
              <a
                href="/contact"
                className="flex items-center gap-2 px-4 py-2.5 text-sm text-zinc-400 hover:text-white border border-zinc-800 rounded-xl hover:border-zinc-700 hover:bg-zinc-900 transition-all"
              >
                <span className="material-symbols-outlined text-lg">help</span>
                <span className="hidden sm:inline">Help</span>
              </a>
              <button
                onClick={() => setShowSettings(true)}
                className="flex items-center gap-2 px-4 py-2.5 text-sm bg-zinc-900 text-white rounded-xl hover:bg-zinc-800 border border-zinc-800 transition-all"
              >
                <span className="material-symbols-outlined text-lg">settings</span>
                <span className="hidden sm:inline">Settings</span>
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <CalculatorGrid
            onSelectCalculator={handleSelectCalculator}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            recentCalculators={recentCalculators}
          />
        </motion.div>
      </main>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowSettings(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-zinc-800">
                <h2 className="text-xl font-bold text-white">Settings</h2>
                <button
                  onClick={() => setShowSettings(false)}
                  className="p-2 text-zinc-400 hover:text-white transition-colors rounded-lg hover:bg-zinc-800"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Account */}
                {user && (
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-zinc-400">Account</label>
                    <div className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-xl border border-zinc-700/50">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-500/20 border border-emerald-500/30 rounded-full flex items-center justify-center text-emerald-400 font-bold">
                          {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-white font-medium">{user.name || 'User'}</p>
                          <p className="text-zinc-500 text-sm">{user.email}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Default Currency */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-zinc-400">Default Currency</label>
                  <select
                    value={defaultCurrency}
                    onChange={(e) => {
                      setDefaultCurrency(e.target.value);
                      localStorage.setItem(CURRENCY_KEY, e.target.value);
                    }}
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-emerald-500 transition-colors"
                  >
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - British Pound</option>
                    <option value="IDR">IDR - Indonesian Rupiah</option>
                    <option value="SGD">SGD - Singapore Dollar</option>
                    <option value="AUD">AUD - Australian Dollar</option>
                  </select>
                </div>

                {/* Clear Data */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-zinc-400">Data Management</label>
                  <button
                    onClick={() => {
                      if (confirm('Clear all recent calculators history?')) {
                        localStorage.removeItem(RECENT_CALCULATORS_KEY);
                        setShowSettings(false);
                        window.location.reload();
                      }
                    }}
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-zinc-300 hover:bg-zinc-700 transition-all text-left flex items-center gap-3"
                  >
                    <span className="material-symbols-outlined text-zinc-500">history</span>
                    Clear Recent History
                  </button>
                </div>

                {/* Sign Out */}
                {user && (
                  <div className="pt-4 border-t border-zinc-800">
                    <button
                      onClick={async () => {
                        await signOut();
                        setShowSettings(false);
                      }}
                      className="w-full px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 hover:bg-red-500/20 transition-all flex items-center justify-center gap-2"
                    >
                      <span className="material-symbols-outlined">logout</span>
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
