import { useState, useCallback, useEffect } from 'react';
import type { UserTier, UsageData, TierLimits } from '../types/tier';
import { TIER_LIMITS } from '../types/tier';

const TIER_STORAGE_KEY = 'baliinvest_user_tier';
const USAGE_STORAGE_KEY = 'baliinvest_usage_tracking';

function getFirstOfMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
}

function getCurrentMonthStart(): number {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).getTime();
}

function loadTier(): UserTier {
  try {
    const saved = localStorage.getItem(TIER_STORAGE_KEY);
    if (saved && ['free', 'pro', 'enterprise'].includes(saved)) {
      return saved as UserTier;
    }
  } catch {
    // localStorage unavailable
  }
  return 'free';
}

function saveTier(tier: UserTier): void {
  try {
    localStorage.setItem(TIER_STORAGE_KEY, tier);
  } catch {
    // localStorage unavailable
  }
}

function loadUsage(): UsageData {
  try {
    const saved = localStorage.getItem(USAGE_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as UsageData;
      // Check if we need to reset for new month
      const currentMonthStart = getFirstOfMonth();
      if (parsed.lastResetDate !== currentMonthStart) {
        // New month - reset usage
        const resetData: UsageData = {
          calculationsUsed: 0,
          monthStartTimestamp: getCurrentMonthStart(),
          lastResetDate: currentMonthStart,
        };
        saveUsage(resetData);
        return resetData;
      }
      return parsed;
    }
  } catch {
    // localStorage unavailable or invalid JSON
  }
  // Initialize fresh
  return {
    calculationsUsed: 0,
    monthStartTimestamp: getCurrentMonthStart(),
    lastResetDate: getFirstOfMonth(),
  };
}

function saveUsage(usage: UsageData): void {
  try {
    localStorage.setItem(USAGE_STORAGE_KEY, JSON.stringify(usage));
  } catch {
    // localStorage unavailable
  }
}

export function useUserTier() {
  const [tier, setTierState] = useState<UserTier>(loadTier);
  const [usage, setUsageState] = useState<UsageData>(loadUsage);

  const limits: TierLimits = TIER_LIMITS[tier];

  // Check for month reset on mount and periodically
  useEffect(() => {
    const checkReset = () => {
      const currentMonthStart = getFirstOfMonth();
      if (usage.lastResetDate !== currentMonthStart) {
        const resetData: UsageData = {
          calculationsUsed: 0,
          monthStartTimestamp: getCurrentMonthStart(),
          lastResetDate: currentMonthStart,
        };
        setUsageState(resetData);
        saveUsage(resetData);
      }
    };

    checkReset();
    // Check every minute in case user has app open during month transition
    const interval = setInterval(checkReset, 60000);
    return () => clearInterval(interval);
  }, [usage.lastResetDate]);

  const canUseCalculator = useCallback((): boolean => {
    if (limits.calculationsPerMonth === Infinity) return true;
    return usage.calculationsUsed < limits.calculationsPerMonth;
  }, [limits.calculationsPerMonth, usage.calculationsUsed]);

  const remainingCalculations = useCallback((): number => {
    if (limits.calculationsPerMonth === Infinity) return Infinity;
    return Math.max(0, limits.calculationsPerMonth - usage.calculationsUsed);
  }, [limits.calculationsPerMonth, usage.calculationsUsed]);

  const incrementUsage = useCallback((): boolean => {
    if (!canUseCalculator()) return false;

    const newUsage: UsageData = {
      ...usage,
      calculationsUsed: usage.calculationsUsed + 1,
    };
    setUsageState(newUsage);
    saveUsage(newUsage);
    return true;
  }, [usage, canUseCalculator]);

  const setTier = useCallback((newTier: UserTier) => {
    setTierState(newTier);
    saveTier(newTier);
  }, []);

  const upgradeTier = useCallback((newTier: UserTier) => {
    setTier(newTier);
  }, [setTier]);

  const getResetDate = useCallback((): Date => {
    const now = new Date();
    // First of next month
    return new Date(now.getFullYear(), now.getMonth() + 1, 1);
  }, []);

  return {
    tier,
    limits,
    usage,
    canUseCalculator,
    remainingCalculations,
    incrementUsage,
    setTier,
    upgradeTier,
    getResetDate,
  };
}
