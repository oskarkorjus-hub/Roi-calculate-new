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

  // Pro/Enterprise badge - Compact
  if (tier === 'pro' || tier === 'enterprise') {
    return (
      <div className="relative">
        <div
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 cursor-default"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wide">
            {tier === 'enterprise' ? 'ENT' : 'PRO'}
          </span>
        </div>

        {showTooltip && (
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-xs text-zinc-200 whitespace-nowrap z-50 shadow-xl">
            <div className="flex items-center gap-1.5">
              <svg className="w-3 h-3 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span>Unlimited calculations</span>
            </div>
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-zinc-900 border-l border-t border-zinc-700 rotate-45" />
          </div>
        )}
      </div>
    );
  }

  // Free tier - Compact
  const isLow = remaining <= 1;
  const isEmpty = remaining === 0;

  return (
    <div className="relative">
      <div
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg cursor-default transition-all ${
          isEmpty
            ? 'bg-red-500/15 border border-red-500/30'
            : isLow
              ? 'bg-amber-500/15 border border-amber-500/30'
              : 'bg-zinc-800/80 border border-zinc-700/60'
        }`}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <svg
          className={`w-3.5 h-3.5 ${isEmpty ? 'text-red-400' : isLow ? 'text-amber-400' : 'text-zinc-400'}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        <span className={`text-[10px] font-bold uppercase tracking-wide ${
          isEmpty ? 'text-red-400' : isLow ? 'text-amber-400' : 'text-zinc-400'
        }`}>
          {remaining}
        </span>
      </div>

      {showTooltip && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-xs z-50 shadow-xl whitespace-nowrap">
          <div className="text-zinc-200">{remaining} uses remaining</div>
          <div className="text-zinc-500 text-[10px] mt-0.5">Resets {resetDateFormatted}</div>
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-zinc-900 border-l border-t border-zinc-700 rotate-45" />
        </div>
      )}
    </div>
  );
}
