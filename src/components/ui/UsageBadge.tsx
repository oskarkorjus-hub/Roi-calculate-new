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

  // Pro/Enterprise badge - Enterprise Design
  if (tier === 'pro' || tier === 'enterprise') {
    return (
      <div className="relative">
        <div
          className={`
            group relative px-4 py-2 rounded-xl cursor-default overflow-hidden
            bg-gradient-to-b from-emerald-500/15 to-emerald-600/10
            border border-emerald-500/30
            shadow-[0_0_0_1px_rgba(16,185,129,0.1),0_1px_2px_rgba(16,185,129,0.1)]
            hover:shadow-[0_0_0_1px_rgba(16,185,129,0.2),0_2px_8px_rgba(16,185,129,0.15)]
            hover:border-emerald-400/40
            transition-all duration-200
          `}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          {/* Subtle shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-400/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />

          <div className="relative flex items-center gap-2.5">
            {/* Premium badge icon */}
            <div className="relative">
              <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
              {/* Glow effect */}
              <div className="absolute inset-0 blur-md bg-emerald-400/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>

            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              {tier === 'enterprise' ? 'Enterprise' : 'Pro'}
            </span>
          </div>
        </div>

        {/* Tooltip - Enterprise Design */}
        {showTooltip && (
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 px-4 py-2.5 bg-zinc-900/95 backdrop-blur-xl border border-zinc-700/60 rounded-xl text-xs text-zinc-200 whitespace-nowrap z-50 shadow-[0_4px_20px_rgba(0,0,0,0.3)] animate-in fade-in slide-in-from-top-1 duration-150">
            <div className="flex items-center gap-2">
              <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span className="font-medium">Unlimited calculations & projects</span>
            </div>
            {/* Tooltip arrow */}
            <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-zinc-900/95 border-l border-t border-zinc-700/60 rotate-45" />
          </div>
        )}
      </div>
    );
  }

  // Free tier badge with remaining uses - Enterprise Design
  const isLow = remaining <= 1;
  const isEmpty = remaining === 0;

  return (
    <div className="relative">
      <div
        className={`
          group relative px-4 py-2 rounded-xl cursor-default overflow-hidden
          transition-all duration-200
          ${isEmpty
            ? 'bg-gradient-to-b from-red-500/15 to-red-600/10 border border-red-500/30 shadow-[0_0_0_1px_rgba(239,68,68,0.1)]'
            : isLow
              ? 'bg-gradient-to-b from-amber-500/15 to-amber-600/10 border border-amber-500/30 shadow-[0_0_0_1px_rgba(245,158,11,0.1)]'
              : 'bg-zinc-800/80 border border-zinc-700/60 shadow-[0_1px_2px_rgba(0,0,0,0.1)]'
          }
          hover:shadow-lg
        `}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <div className="relative flex items-center gap-2.5">
          {/* Lightning icon */}
          <svg
            className={`w-4 h-4 transition-colors ${
              isEmpty ? 'text-red-400' : isLow ? 'text-amber-400' : 'text-zinc-400'
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>

          <span className={`text-xs font-bold transition-colors ${
            isEmpty ? 'text-red-400' : isLow ? 'text-amber-400' : 'text-zinc-300'
          }`}>
            {remaining} {remaining === 1 ? 'use' : 'uses'} left
          </span>
        </div>
      </div>

      {/* Tooltip - Enterprise Design */}
      {showTooltip && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 px-4 py-3 bg-zinc-900/95 backdrop-blur-xl border border-zinc-700/60 rounded-xl text-xs z-50 shadow-[0_4px_20px_rgba(0,0,0,0.3)] animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="text-zinc-200 font-medium">Free tier: 3 calculations/month</div>
          <div className="text-zinc-500 mt-1 flex items-center gap-1.5">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Resets {resetDateFormatted}
          </div>
          {/* Tooltip arrow */}
          <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-zinc-900/95 border-l border-t border-zinc-700/60 rotate-45" />
        </div>
      )}
    </div>
  );
}
