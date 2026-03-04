import { useState } from 'react';
import { checkPasswordStrength, type PasswordStrength } from '../../lib/crypto-utils';
import { updatePassword } from '../../lib/auth-store';
import { useAuth } from '../../lib/auth-context';

export function PasswordResetForm() {
  const { isPasswordRecovery, clearPasswordRecovery } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength | null>(null);

  if (!isPasswordRecovery) return null;

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    setPasswordStrength(value ? checkPasswordStrength(value) : null);
  };

  const getStrengthColor = (level: PasswordStrength['level']) => {
    switch (level) {
      case 'weak': return 'bg-red-500';
      case 'fair': return 'bg-yellow-500';
      case 'good': return 'bg-blue-500';
      case 'strong': return 'bg-green-500';
    }
  };

  const getStrengthWidth = (score: number) => {
    return `${Math.min(100, (score / 7) * 100)}%`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    const strength = checkPasswordStrength(password);
    if (strength.level === 'weak') {
      setError('Please choose a stronger password');
      return;
    }

    setLoading(true);
    const result = await updatePassword(password);
    setLoading(false);

    if (result.success) {
      setSuccess(true);
      setTimeout(() => clearPasswordRecovery(), 2000);
    } else {
      setError(result.error || 'Failed to update password');
    }
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden">
        {success ? (
          <div className="p-12 text-center">
            <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-3">
              Password Updated!
            </h3>
            <p className="text-slate-500">
              Your password has been changed successfully.
            </p>
          </div>
        ) : (
          <div className="p-8">
            <div className="mb-6 text-center">
              <div className="bg-green-500 text-white w-14 h-14 flex items-center justify-center rounded-2xl mx-auto mb-4 shadow-lg shadow-green-500/30">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
                Set New Password
              </h2>
              <p className="text-slate-500 text-sm">
                Choose a strong password for your account
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm font-medium text-red-600 mb-4" role="alert">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div>
                <label htmlFor="reset-new-password" className="block text-sm font-semibold text-slate-700 mb-1.5">
                  New Password
                </label>
                <input
                  id="reset-new-password"
                  type="password"
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  placeholder="Min 8 characters"
                  autoComplete="new-password"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 outline-none transition-all focus:border-green-500 focus:ring-4 focus:ring-green-500/10"
                />
                {passwordStrength && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-slate-500">Password strength</span>
                      <span className={`text-xs font-bold capitalize ${
                        passwordStrength.level === 'weak' ? 'text-red-500' :
                        passwordStrength.level === 'fair' ? 'text-yellow-600' :
                        passwordStrength.level === 'good' ? 'text-blue-500' : 'text-green-500'
                      }`}>
                        {passwordStrength.level}
                      </span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${getStrengthColor(passwordStrength.level)}`}
                        style={{ width: getStrengthWidth(passwordStrength.score) }}
                      />
                    </div>
                    {passwordStrength.feedback.length > 0 && (
                      <p className="mt-1.5 text-xs text-slate-500">
                        {passwordStrength.feedback[0]}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="reset-confirm-password" className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Confirm New Password
                </label>
                <input
                  id="reset-confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your new password"
                  autoComplete="new-password"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 outline-none transition-all focus:border-green-500 focus:ring-4 focus:ring-green-500/10"
                />
                {confirmPassword && password !== confirmPassword && (
                  <p className="mt-1.5 text-xs text-red-500 font-medium">Passwords do not match</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || !password || !confirmPassword || password !== confirmPassword}
                className="w-full bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-green-500/25 transition-all flex items-center justify-center gap-2"
              >
                {loading && (
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                    <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" className="opacity-75" />
                  </svg>
                )}
                Update Password
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
