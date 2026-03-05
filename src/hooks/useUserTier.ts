import { useState, useCallback, useEffect, useRef } from 'react';
import type { UserTier, UsageData, TierLimits } from '../types/tier';
import { TIER_LIMITS } from '../types/tier';
import { useAuth } from '../lib/auth-context';
import {
  fetchUserProfile,
  updateUserTier as updateUserTierDb,
  incrementUsageCount,
} from '../lib/profile-service';

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

function loadTierFromStorage(): UserTier {
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

function saveTierToStorage(tier: UserTier): void {
  try {
    localStorage.setItem(TIER_STORAGE_KEY, tier);
  } catch {
    // localStorage unavailable
  }
}

function loadUsageFromStorage(): UsageData {
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
        saveUsageToStorage(resetData);
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

function saveUsageToStorage(usage: UsageData): void {
  try {
    localStorage.setItem(USAGE_STORAGE_KEY, JSON.stringify(usage));
  } catch {
    // localStorage unavailable
  }
}

export function useUserTier() {
  const { user } = useAuth();
  const [tier, setTierState] = useState<UserTier>(loadTierFromStorage);
  const [usage, setUsageState] = useState<UsageData>(loadUsageFromStorage);
  const [loading, setLoading] = useState(true);
  const initialLoadDone = useRef(false);

  const limits: TierLimits = TIER_LIMITS[tier];

  // Load profile from Supabase when user changes
  useEffect(() => {
    async function loadProfile() {
      setLoading(true);

      if (user) {
        // Logged in - fetch from Supabase
        const { data, error } = await fetchUserProfile(user.id);
        if (error) {
          console.error('Error fetching profile:', error);
          // Fall back to localStorage
          setTierState(loadTierFromStorage());
          setUsageState(loadUsageFromStorage());
        } else if (data) {
          setTierState(data.tier);
          setUsageState(data.usage);
        }
      } else {
        // Not logged in - use localStorage
        setTierState(loadTierFromStorage());
        setUsageState(loadUsageFromStorage());
      }

      setLoading(false);
      initialLoadDone.current = true;
    }

    loadProfile();
  }, [user]);

  // Persist to localStorage only for guests
  useEffect(() => {
    if (!user && initialLoadDone.current) {
      saveTierToStorage(tier);
      saveUsageToStorage(usage);
    }
  }, [tier, usage, user]);

  // Check for month reset periodically
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
        if (!user) {
          saveUsageToStorage(resetData);
        }
      }
    };

    checkReset();
    // Check every minute in case user has app open during month transition
    const interval = setInterval(checkReset, 60000);
    return () => clearInterval(interval);
  }, [usage.lastResetDate, user]);

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

    if (user) {
      // Update in Supabase (fire and forget)
      incrementUsageCount(user.id).catch(console.error);
    } else {
      saveUsageToStorage(newUsage);
    }

    return true;
  }, [usage, canUseCalculator, user]);

  const setTier = useCallback((newTier: UserTier) => {
    setTierState(newTier);

    if (user) {
      // Update in Supabase
      updateUserTierDb(user.id, newTier).catch(console.error);
    } else {
      saveTierToStorage(newTier);
    }
  }, [user]);

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
    loading,
    canUseCalculator,
    remainingCalculations,
    incrementUsage,
    setTier,
    upgradeTier,
    getResetDate,
  };
}
