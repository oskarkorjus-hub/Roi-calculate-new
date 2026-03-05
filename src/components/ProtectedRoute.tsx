import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/auth-context';
import { motion } from 'framer-motion';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-zinc-400 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  // Show compelling signup/login page if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4 pt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-lg w-full text-center"
        >
          {/* Icon */}
          <motion.div
            className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-2xl flex items-center justify-center"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </motion.div>

          {/* Heading */}
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            Unlock Professional ROI Analysis
          </h1>
          <p className="text-zinc-400 mb-8 text-lg">
            Join <span className="text-emerald-400 font-semibold">2,847+ investors</span> making smarter decisions with institutional-grade calculators.
          </p>

          {/* Benefits */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mb-8 text-left">
            <p className="text-sm text-zinc-500 uppercase tracking-wider mb-4">Free account includes:</p>
            <ul className="space-y-3">
              {[
                '13 professional investment calculators',
                'XIRR, IRR, NPV, Cap Rate analysis',
                'Save projects to your portfolio',
                'Export PDF reports',
                '60-second deal analysis'
              ].map((benefit, i) => (
                <li key={i} className="flex items-center gap-3 text-zinc-300">
                  <svg className="w-5 h-5 text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {benefit}
                </li>
              ))}
            </ul>
          </div>

          {/* CTAs */}
          <div className="space-y-3">
            <Link
              to="/signup"
              state={{ from: location }}
              className="block w-full py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-bold text-lg rounded-xl hover:from-emerald-600 hover:to-cyan-600 transition-all shadow-lg shadow-emerald-500/25"
            >
              Create Free Account
            </Link>
            <Link
              to="/login"
              state={{ from: location }}
              className="block w-full py-4 border border-zinc-700 text-zinc-300 font-medium rounded-xl hover:bg-zinc-800 transition-all"
            >
              Already have an account? Sign In
            </Link>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap justify-center gap-4 mt-6 text-xs text-zinc-500">
            {['Free forever plan', 'No credit card required', 'Setup in 30 seconds'].map((text, i) => (
              <span key={i} className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {text}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  return <>{children}</>;
}
