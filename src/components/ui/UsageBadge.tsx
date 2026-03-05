import { useState } from 'react';
import { useTier } from '../../lib/tier-context';

export function UsageBadge() {
  const { tier, remainingCalculations, getResetDate } = useTier();
  const [showTooltip, setShowTooltip] = useState(false);

  const remaining = remainingCalculations();
  const resetDate = getResetDate();
  const resetDateFormatted = resetDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  // Pro/Enterprise badge
  if (tier === 'pro' || tier === 'enterprise') {
    return (
      <div className="relative">
        <div
          className="px-3 py-1.5 bg-emerald-500/20 border border-emerald-500/30 rounded-lg flex items-center gap-2 cursor-default"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
            {tier === 'enterprise' ? 'Enterprise' : 'Pro'}
          </span>
        </div>

        {showTooltip && (
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-xs text-zinc-300 whitespace-nowrap z-50 shadow-lg">
            Unlimited calculations & projects
          </div>
        )}
      </div>
    );
  }

  // Free tier badge with remaining uses
  const isLow = remaining <= 1;
  const isEmpty = remaining === 0;

  return (
    <div className="relative">
      <div
        className={`px-3 py-1.5 rounded-lg flex items-center gap-2 cursor-default border ${
          isEmpty
            ? 'bg-red-500/20 border-red-500/30'
            : isLow
              ? 'bg-amber-500/20 border-amber-500/30'
              : 'bg-zinc-800 border-zinc-700'
        }`}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <svg
          className={`w-4 h-4 ${isEmpty ? 'text-red-400' : isLow ? 'text-amber-400' : 'text-zinc-400'}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        <span className={`text-xs font-bold ${isEmpty ? 'text-red-400' : isLow ? 'text-amber-400' : 'text-zinc-300'}`}>
          {remaining} {remaining === 1 ? 'use' : 'uses'} left
        </span>
      </div>

      {showTooltip && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-xs text-zinc-300 whitespace-nowrap z-50 shadow-lg">
          <div>Free tier: 3 calculations/month</div>
          <div className="text-zinc-500 mt-1">Resets {resetDateFormatted}</div>
        </div>
      )}
    </div>
  );
}
