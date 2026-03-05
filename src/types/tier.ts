export type UserTier = 'free' | 'pro' | 'enterprise';

export interface TierLimits {
  calculationsPerMonth: number;  // 3, Infinity, Infinity
  maxSavedProjects: number;      // 1, 25, Infinity
}

export const TIER_LIMITS: Record<UserTier, TierLimits> = {
  free: { calculationsPerMonth: 3, maxSavedProjects: 1 },
  pro: { calculationsPerMonth: Infinity, maxSavedProjects: 25 },
  enterprise: { calculationsPerMonth: Infinity, maxSavedProjects: Infinity },
};

export interface UsageData {
  calculationsUsed: number;
  monthStartTimestamp: number;
  lastResetDate: string; // ISO date string YYYY-MM-DD
}

export type UpgradeReason = 'calculation_limit' | 'project_limit';
