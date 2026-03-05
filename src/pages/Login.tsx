import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../lib/auth-context';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [showReset, setShowReset] = useState(false);

  const { signIn, resetPassword, rateLimitRemaining } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isRateLimited, setIsRateLimited] = useState(false);

  // Get the intended destination (from ProtectedRoute redirect)
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/calculators';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsRateLimited(false);
    setLoading(true);

    const result = await signIn(email, password);

    if (result.success) {
      navigate(from, { replace: true });
    } else {
      if (result.rateLimited) {
        setIsRateLimited(true);
      }
      setError(result.error || 'Failed to sign in');
    }

    setLoading(false);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await resetPassword(email);

    if (result.success) {
      setResetSent(true);
    } else {
      setError(result.error || 'Failed to send reset email');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-20 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center justify-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="font-bold text-xl text-white">ROI Calculate</span>
            </Link>
            <h1 className="text-2xl font-bold text-white">
              {showReset ? 'Reset Password' : 'Welcome Back'}
            </h1>
            <p className="text-zinc-400 mt-2">
              {showReset
                ? 'Enter your email to receive a reset link'
                : 'Access your professional investment calculators'}
            </p>
            {!showReset && (
              <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-xs text-emerald-400">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                2,847 investors online now
              </div>
            )}
          </div>

          {/* Rate Limit Warning */}
          {rateLimitRemaining <= 2 && rateLimitRemaining > 0 && !isRateLimited && (
            <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-400 text-sm flex items-center gap-2">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              {rateLimitRemaining} attempt{rateLimitRemaining !== 1 ? 's' : ''} remaining
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className={`mb-6 p-4 ${isRateLimited ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : 'bg-red-500/10 border-red-500/20 text-red-400'} border rounded-lg text-sm flex items-start gap-2`}>
              {isRateLimited && (
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              <span>{error}</span>
            </div>
          )}

          {/* Success Message */}
          {resetSent && (
            <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-sm">
              Check your email for a password reset link.
            </div>
          )}

          {/* Login Form */}
          {!showReset ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-zinc-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-zinc-300 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                  placeholder="Enter your password"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowReset(true)}
                  className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-cyan-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          ) : (
            /* Reset Password Form */
            <form onSubmit={handleResetPassword} className="space-y-5">
              <div>
                <label htmlFor="reset-email" className="block text-sm font-medium text-zinc-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="reset-email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                  placeholder="you@example.com"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-cyan-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowReset(false);
                  setResetSent(false);
                  setError('');
                }}
                className="w-full py-3 border border-zinc-700 text-zinc-300 font-medium rounded-xl hover:bg-zinc-800 transition-all"
              >
                Back to Sign In
              </button>
            </form>
          )}

          {/* Sign Up Link */}
          {!showReset && (
            <p className="mt-6 text-center text-zinc-400">
              Don't have an account?{' '}
              <Link to="/signup" className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors">
                Sign up
              </Link>
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
