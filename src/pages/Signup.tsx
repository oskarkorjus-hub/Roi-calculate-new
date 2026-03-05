import { useState, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../lib/auth-context';
import { checkPasswordStrength } from '../lib/security';

export function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState(false);
  const [isRateLimited, setIsRateLimited] = useState(false);

  const { signUp, rateLimitRemaining } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Password strength calculation
  const passwordStrength = useMemo(() => {
    if (!password) return null;
    return checkPasswordStrength(password);
  }, [password]);

  // Get the intended destination (from ProtectedRoute redirect)
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/calculators';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsRateLimited(false);

    // Validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!passwordStrength?.isValid) {
      setError('Password does not meet requirements');
      return;
    }

    setLoading(true);

    const result = await signUp(name, email, password);

    if (result.success) {
      if (result.confirmEmail) {
        setConfirmEmail(true);
      } else {
        navigate(from, { replace: true });
      }
    } else {
      if (result.rateLimited) {
        setIsRateLimited(true);
      }
      setError(result.error || 'Failed to create account');
    }

    setLoading(false);
  };

  // Show confirmation message
  if (confirmEmail) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] pt-20 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-6 bg-emerald-500/20 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Check Your Email</h1>
            <p className="text-zinc-400 mb-6">
              We've sent a confirmation link to <strong className="text-white">{email}</strong>.
              Click the link to verify your account.
            </p>
            <Link
              to="/login"
              className="inline-block px-6 py-3 bg-zinc-800 text-white font-medium rounded-xl hover:bg-zinc-700 transition-all"
            >
              Back to Sign In
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

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
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full text-xs text-amber-400 mb-4">
              Limited: Free Pro features for new users
            </div>
            <h1 className="text-2xl font-bold text-white">Start Analyzing Deals in 60 Seconds</h1>
            <p className="text-zinc-400 mt-2">
              Join 2,847+ investors making data-driven decisions
            </p>
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

          {/* Signup Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-zinc-300 mb-2">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                placeholder="John Doe"
              />
            </div>

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
                placeholder="Min 8 chars, uppercase, lowercase, number"
              />
              {/* Password Strength Indicator */}
              {password && passwordStrength && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded-full transition-all ${
                          level <= passwordStrength.score
                            ? passwordStrength.score <= 1
                              ? 'bg-red-500'
                              : passwordStrength.score <= 2
                              ? 'bg-orange-500'
                              : passwordStrength.score <= 3
                              ? 'bg-yellow-500'
                              : passwordStrength.score <= 4
                              ? 'bg-emerald-400'
                              : 'bg-emerald-500'
                            : 'bg-zinc-700'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`text-xs capitalize ${
                      passwordStrength.level === 'very-weak' || passwordStrength.level === 'weak'
                        ? 'text-red-400'
                        : passwordStrength.level === 'fair'
                        ? 'text-yellow-400'
                        : 'text-emerald-400'
                    }`}>
                      {passwordStrength.level.replace('-', ' ')}
                    </span>
                    {!passwordStrength.isValid && (
                      <span className="text-xs text-zinc-500">
                        {passwordStrength.feedback[0]}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-zinc-300 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                placeholder="Confirm your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-bold text-lg rounded-xl hover:from-emerald-600 hover:to-cyan-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/25"
            >
              {loading ? 'Creating account...' : 'Get Instant Access'}
            </button>
          </form>

          {/* Trust badges */}
          <div className="flex justify-center gap-4 mt-4 text-xs text-zinc-500">
            {['Free forever', 'No card required', '60s setup'].map((text, i) => (
              <span key={i} className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {text}
              </span>
            ))}
          </div>

          {/* Terms */}
          <p className="mt-4 text-center text-xs text-zinc-500">
            By signing up, you agree to our{' '}
            <Link to="/terms" className="text-zinc-400 hover:text-white transition-colors">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link to="/privacy" className="text-zinc-400 hover:text-white transition-colors">
              Privacy Policy
            </Link>
          </p>

          {/* Sign In Link */}
          <p className="mt-4 text-center text-zinc-400">
            Already have an account?{' '}
            <Link to="/login" className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
