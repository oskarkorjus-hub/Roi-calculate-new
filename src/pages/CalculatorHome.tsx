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
      {/* Compact Dashboard Header */}
      <div className="border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
          >
            <div>
              <h1 className="text-2xl font-bold text-white">Dashboard</h1>
              <p className="text-zinc-500 text-sm mt-1">
                Select a calculator to start your analysis
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-3">
              <a
                href="/contact"
                className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-400 hover:text-white border border-zinc-800 rounded-lg hover:border-zinc-700 transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Support
              </a>
              <button
                onClick={() => setShowSettings(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Settings
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
                  className="p-2 text-zinc-400 hover:text-white transition-colors"
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
                    <div className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-xl">
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
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
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
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-zinc-300 hover:bg-zinc-700 transition-all text-left"
                  >
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
                      className="w-full px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 hover:bg-red-500/20 transition-all"
                    >
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
