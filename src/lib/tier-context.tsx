import { createContext, useContext, type ReactNode } from 'react';
import { useUserTier } from '../hooks/useUserTier';
import type { UserTier, TierLimits, UsageData } from '../types/tier';

interface TierContextType {
  tier: UserTier;
  limits: TierLimits;
  usage: UsageData;
  canUseCalculator: () => boolean;
  remainingCalculations: () => number;
  incrementUsage: () => boolean;
  setTier: (tier: UserTier) => void;
  upgradeTier: (tier: UserTier) => void;
  getResetDate: () => Date;
}

const TierContext = createContext<TierContextType | null>(null);

export function TierProvider({ children }: { children: ReactNode }) {
  const tierState = useUserTier();

  return (
    <TierContext.Provider value={tierState}>
      {children}
    </TierContext.Provider>
  );
}

export function useTier(): TierContextType {
  const context = useContext(TierContext);
  if (!context) {
    throw new Error('useTier must be used within TierProvider');
  }
  return context;
}
