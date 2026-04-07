import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../lib/auth-context';

export function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    setUserMenuOpen(false);
    navigate('/login');
  };

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navLinks: { path: string; label: string }[] = [];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a] border-b border-zinc-800/50"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link to="/login" className="flex items-center gap-3 group">
            <img
              src="/logo.png"
              alt="ROI Calculate"
              className="h-10 w-auto"
            />
            <div className="hidden sm:block">
              <span className="font-bold text-lg text-white group-hover:text-emerald-400 transition-colors">
                ROI Calculate
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                  isActive(link.path)
                    ? 'text-white'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {isActive(link.path) && (
                  <motion.div
                    layoutId="navbar-indicator"
                    className="absolute inset-0 bg-zinc-800/80 rounded-lg"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10">{link.label}</span>
              </Link>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            {!loading && (
              <>
                {user ? (
                  /* Logged In - User Menu */
                  <div className="relative">
                    <button
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-zinc-800 transition-all"
                    >
                      <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                        <span className="text-emerald-400 font-semibold text-sm">
                          {user.name?.charAt(0) || user.email?.charAt(0) || 'U'}
                        </span>
                      </div>
                      <span className="text-sm text-zinc-300 max-w-[120px] truncate">
                        {user.name || user.email}
                      </span>
                      <svg className={`w-4 h-4 text-zinc-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    <AnimatePresence>
                      {userMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute right-0 mt-2 w-48 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl overflow-hidden"
                        >
                          <Link
                            to="/calculators"
                            onClick={() => setUserMenuOpen(false)}
                            className="block px-4 py-3 text-sm text-zinc-300 hover:bg-zinc-800 transition-colors"
                          >
                            Calculators
                          </Link>
                          <Link
                            to="/settings"
                            onClick={() => setUserMenuOpen(false)}
                            className="block px-4 py-3 text-sm text-zinc-300 hover:bg-zinc-800 transition-colors"
                          >
                            Account Settings
                          </Link>
                          <button
                            onClick={handleSignOut}
                            className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-zinc-800 transition-colors border-t border-zinc-800"
                          >
                            Sign Out
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  /* Not Logged In - Login/Signup */
                  <>
                    <Link
                      to="/login"
                      className="px-4 py-2 text-sm font-medium text-zinc-300 hover:text-white transition-colors"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/signup"
                      className="group relative px-5 py-2.5 overflow-hidden rounded-xl font-semibold text-sm shadow-lg shadow-emerald-500/20"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-cyan-500 transition-transform group-hover:scale-105" />
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-r from-emerald-600 to-cyan-600" />
                      <span className="relative z-10 text-white flex items-center gap-2">
                        Start Free
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </span>
                    </Link>
                  </>
                )}
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden relative w-10 h-10 flex items-center justify-center rounded-lg bg-zinc-800/50 border border-zinc-700/50 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all"
          >
            <span className="sr-only">Toggle menu</span>
            <div className="w-5 h-4 relative flex flex-col justify-between">
              <motion.span
                animate={mobileMenuOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
                className="w-full h-0.5 bg-current rounded-full origin-center"
              />
              <motion.span
                animate={mobileMenuOpen ? { opacity: 0 } : { opacity: 1 }}
                className="w-full h-0.5 bg-current rounded-full"
              />
              <motion.span
                animate={mobileMenuOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
                className="w-full h-0.5 bg-current rounded-full origin-center"
              />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Menu - Full Screen Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden fixed inset-0 top-16 bg-[#0a0a0a] z-40"
          >
            <div className="flex flex-col h-full px-6 py-8">
              {/* Navigation Links */}
              <nav className="flex-1 space-y-1">
                {navLinks.map((link, idx) => (
                  <motion.div
                    key={link.path}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Link
                      to={link.path}
                      className={`flex items-center gap-3 px-4 py-4 rounded-xl text-lg font-medium transition-all ${
                        isActive(link.path)
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'text-zinc-300 active:bg-zinc-800'
                      }`}
                    >
                      {link.label}
                      {isActive(link.path) && (
                        <svg className="w-5 h-5 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </Link>
                  </motion.div>
                ))}
              </nav>

              {/* CTA Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="pt-6 border-t border-zinc-800 space-y-3"
              >
                {!loading && (
                  <>
                    {user ? (
                      /* Logged In */
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 px-4 py-3 bg-zinc-900 rounded-xl">
                          <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                            <span className="text-emerald-400 font-bold">
                              {user.name?.charAt(0) || user.email?.charAt(0) || 'U'}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{user.name || 'User'}</p>
                            <p className="text-xs text-zinc-500 truncate">{user.email}</p>
                          </div>
                        </div>
                        <Link
                          to="/calculators"
                          className="flex items-center justify-center gap-2 w-full py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-bold rounded-xl text-base"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                          Open Calculators
                        </Link>
                        <div className="grid grid-cols-2 gap-3">
                          <Link
                            to="/settings"
                            className="py-3 text-center border border-zinc-700 text-zinc-300 font-medium rounded-xl active:bg-zinc-800"
                          >
                            Settings
                          </Link>
                          <button
                            onClick={handleSignOut}
                            className="py-3 text-center border border-red-500/30 text-red-400 font-medium rounded-xl active:bg-red-500/10"
                          >
                            Sign Out
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Not Logged In */
                      <div className="space-y-3">
                        <Link
                          to="/signup"
                          className="flex items-center justify-center gap-2 w-full py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-bold rounded-xl text-base shadow-lg shadow-emerald-500/20"
                        >
                          Start Free Analysis
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </Link>
                        <Link
                          to="/login"
                          className="block w-full py-4 text-center border border-zinc-700 text-zinc-300 font-medium rounded-xl active:bg-zinc-800"
                        >
                          Sign In
                        </Link>
                        <p className="text-center text-xs text-zinc-500 pt-2">
                          Join <span className="text-emerald-400 font-medium">2,847+</span> investors analyzing deals
                        </p>
                      </div>
                    )}
                  </>
                )}
              </motion.div>

              {/* Footer Links */}
              <div className="flex justify-center gap-8 pt-6 text-sm text-zinc-500">
                <Link to="/terms" className="active:text-zinc-300">Terms</Link>
                <Link to="/privacy" className="active:text-zinc-300">Privacy</Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
