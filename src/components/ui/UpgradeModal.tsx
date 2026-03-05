import { useTier } from '../../lib/tier-context';
import type { UpgradeReason } from '../../types/tier';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  reason: UpgradeReason;
}

export function UpgradeModal({ isOpen, onClose, reason }: UpgradeModalProps) {
  const { upgradeTier, tier } = useTier();

  if (!isOpen) return null;

  const handleUpgrade = (newTier: 'pro' | 'enterprise') => {
    upgradeTier(newTier);
    onClose();
  };

  const title = reason === 'calculation_limit'
    ? 'Monthly Calculation Limit Reached'
    : 'Project Limit Reached';

  const description = reason === 'calculation_limit'
    ? 'You\'ve used all 3 free calculations this month. Upgrade to Pro for unlimited calculations.'
    : 'You\'ve reached the maximum number of saved projects on the free plan. Upgrade to save more projects.';

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6 max-w-lg w-full mx-4">
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-500/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">{title}</h2>
          <p className="text-zinc-400 text-sm">{description}</p>
        </div>

        {/* Plan Comparison */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Free Plan */}
          <div className={`p-4 rounded-xl border ${tier === 'free' ? 'border-zinc-600 bg-zinc-800/50' : 'border-zinc-700 bg-zinc-800/30'}`}>
            <div className="text-sm font-semibold text-zinc-400 mb-2">Free</div>
            <div className="text-2xl font-bold text-white mb-3">$0</div>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                3 calculations/month
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                1 saved project
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                All calculators
              </li>
            </ul>
            {tier === 'free' && (
              <div className="mt-3 text-xs text-amber-500 font-medium">Current plan</div>
            )}
          </div>

          {/* Pro Plan */}
          <div className="p-4 rounded-xl border-2 border-emerald-500/50 bg-emerald-500/10 relative">
            <div className="absolute -top-2 right-4 px-2 py-0.5 bg-emerald-500 text-xs font-bold text-white rounded">
              POPULAR
            </div>
            <div className="text-sm font-semibold text-emerald-400 mb-2">Pro</div>
            <div className="text-2xl font-bold text-white mb-3">
              $9<span className="text-sm font-normal text-zinc-400">/month</span>
            </div>
            <ul className="space-y-2 text-sm text-zinc-300">
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <strong>Unlimited</strong> calculations
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <strong>25</strong> saved projects
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                PDF exports
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Priority support
              </li>
            </ul>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border border-zinc-700 text-zinc-300 rounded-xl hover:bg-zinc-800 transition font-medium"
          >
            Maybe Later
          </button>
          <button
            onClick={() => handleUpgrade('pro')}
            className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition font-bold"
          >
            Upgrade to Pro
          </button>
        </div>

        <p className="text-center text-xs text-zinc-500 mt-4">
          Demo mode: Click "Upgrade to Pro" to instantly upgrade
        </p>
      </div>
    </div>
  );
}
