/**
 * Profile Service - Supabase operations for user tier and usage tracking
 */

import { supabase } from './supabase';
import type { UserTier, UsageData } from '../types/tier';

interface ProfileRow {
  id: string;
  user_id: string;
  tier: UserTier;
  calculations_used: number;
  usage_reset_date: string;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  tier: UserTier;
  usage: UsageData;
}

function getFirstOfMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
}

function getCurrentMonthStart(): number {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).getTime();
}

function rowToProfile(row: ProfileRow): UserProfile {
  const currentMonthStart = getFirstOfMonth();

  // Check if usage needs to be reset for new month
  const needsReset = row.usage_reset_date !== currentMonthStart;

  return {
    tier: row.tier,
    usage: {
      calculationsUsed: needsReset ? 0 : row.calculations_used,
      monthStartTimestamp: getCurrentMonthStart(),
      lastResetDate: needsReset ? currentMonthStart : row.usage_reset_date,
    },
  };
}

/**
 * Fetch user profile (tier and usage)
 */
export async function fetchUserProfile(userId: string): Promise<{ data: UserProfile | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      // If profile doesn't exist, create one
      if (error.code === 'PGRST116') {
        return createUserProfile(userId);
      }
      return { data: null, error: new Error(error.message) };
    }

    const profile = rowToProfile(data as ProfileRow);

    // If month changed, update the database
    if (profile.usage.lastResetDate !== (data as ProfileRow).usage_reset_date) {
      await resetMonthlyUsage(userId);
    }

    return { data: profile, error: null };
  } catch (err) {
    return { data: null, error: err as Error };
  }
}

/**
 * Create a new user profile
 */
export async function createUserProfile(userId: string): Promise<{ data: UserProfile | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .insert({
        user_id: userId,
        tier: 'free',
        calculations_used: 0,
        usage_reset_date: getFirstOfMonth(),
      })
      .select()
      .single();

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data: rowToProfile(data as ProfileRow), error: null };
  } catch (err) {
    return { data: null, error: err as Error };
  }
}

/**
 * Update user tier
 */
export async function updateUserTier(userId: string, tier: UserTier): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase
      .from('user_profiles')
      .update({ tier, updated_at: new Date().toISOString() })
      .eq('user_id', userId);

    if (error) {
      return { error: new Error(error.message) };
    }

    return { error: null };
  } catch (err) {
    return { error: err as Error };
  }
}

/**
 * Increment usage count
 */
export async function incrementUsageCount(userId: string): Promise<{ data: number | null; error: Error | null }> {
  try {
    // First get current usage
    const { data: current, error: fetchError } = await supabase
      .from('user_profiles')
      .select('calculations_used, usage_reset_date')
      .eq('user_id', userId)
      .single();

    if (fetchError) {
      return { data: null, error: new Error(fetchError.message) };
    }

    const currentRow = current as Pick<ProfileRow, 'calculations_used' | 'usage_reset_date'>;
    const currentMonthStart = getFirstOfMonth();

    // Reset if new month
    const newCount = currentRow.usage_reset_date !== currentMonthStart
      ? 1
      : currentRow.calculations_used + 1;

    const { error } = await supabase
      .from('user_profiles')
      .update({
        calculations_used: newCount,
        usage_reset_date: currentMonthStart,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data: newCount, error: null };
  } catch (err) {
    return { data: null, error: err as Error };
  }
}

/**
 * Reset monthly usage (called on new month)
 */
export async function resetMonthlyUsage(userId: string): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase
      .from('user_profiles')
      .update({
        calculations_used: 0,
        usage_reset_date: getFirstOfMonth(),
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (error) {
      return { error: new Error(error.message) };
    }

    return { error: null };
  } catch (err) {
    return { error: err as Error };
  }
}
