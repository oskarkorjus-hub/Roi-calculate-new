import { useState } from 'react';
import { useTier } from '../../lib/tier-context';
import { PlanCard } from './PlanCard';
import { CancelSubscriptionModal } from './CancelSubscriptionModal';
import { PLANS, formatDate, updateSubscription } from '../../lib/billing-service';
import type { UserTier } from '../../types/tier';
import type { BillingData } from '../../types/billing';

interface SubscriptionSectionProps {
  billingData: BillingData;
  onBillingUpdate: (data: BillingData) => void;
  onToast: (message: string, type: 'success' | 'error') => void;
}

export function SubscriptionSection({
  billingData,
  onBillingUpdate,
  onToast,
}: SubscriptionSectionProps) {
  const { tier, limits, usage, remainingCalculations, setTier, getResetDate } = useTier();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [updating, setUpdating] = useState(false);

  const currentPlan = PLANS[tier];
  const resetDate = getResetDate();
  const remaining = remainingCalculations();

  const handlePlanSelect = async (planId: UserTier) => {
    if (planId === tier) return;

    setUpdating(true);
    try {
      // Update tier in context
      setTier(planId);

      // Update billing data
      const newBillingData = updateSubscription(planId, billingCycle);
      onBillingUpdate(newBillingData);

      const action = PLANS[planId].pricing.monthly > PLANS[tier].pricing.monthly
        ? 'upgraded'
        : 'downgraded';
      onToast(`Successfully ${action} to ${PLANS[planId].name} plan`, 'success');
    } catch {
      onToast('Failed to update subscription', 'error');
    }
    setUpdating(false);
  };

  const handleCancelSubscription = () => {
    setShowCancelModal(false);
    // Reset to free tier
    setTier('free');
    const newBillingData = updateSubscription('free', null as unknown as 'monthly');
    onBillingUpdate(newBillingData);
    onToast('Subscription cancelled. You can continue using free features.', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Demo Mode Notice */}
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-start gap-3">
        <svg
          className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <div>
          <p className="text-amber-400 font-medium text-sm">Demo Mode</p>
          <p className="text-zinc-400 text-sm">
            Subscription changes are instant and simulated. No real charges will be made.
          </p>
        </div>
      </div>

      {/* Current Plan Status */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-white mb-1">Current Plan</h3>
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                tier === 'enterprise'
                  ? 'bg-purple-500/20 text-purple-400'
                  : tier === 'pro'
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'bg-zinc-700 text-zinc-300'
              }`}>
                {currentPlan.name}
              </span>
              {billingData.subscription.cancelAtPeriodEnd && (
                <span className="text-xs text-amber-400 bg-amber-500/10 px-2 py-1 rounded">
                  Cancels at period end
                </span>
              )}
            </div>
          </div>
          {tier !== 'free' && !billingData.subscription.cancelAtPeriodEnd && (
            <button
              onClick={() => setShowCancelModal(true)}
              className="text-sm text-red-400 hover:text-red-300 transition-colors"
            >
              Cancel Subscription
            </button>
          )}
        </div>

        {/* Usage Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-zinc-800/50 rounded-xl p-4">
            <p className="text-sm text-zinc-400 mb-1">Calculations This Month</p>
            <p className="text-2xl font-bold text-white">
              {usage.calculationsUsed}
              <span className="text-sm font-normal text-zinc-500">
                {' '}/ {limits.calculationsPerMonth === Infinity ? '∞' : limits.calculationsPerMonth}
              </span>
            </p>
            {tier === 'free' && (
              <p className="text-xs text-zinc-500 mt-1">
                {remaining > 0 ? `${remaining} remaining` : 'Limit reached'}
              </p>
            )}
          </div>

          <div className="bg-zinc-800/50 rounded-xl p-4">
            <p className="text-sm text-zinc-400 mb-1">Saved Projects</p>
            <p className="text-2xl font-bold text-white">
              <span className="text-sm font-normal text-zinc-500">
                Up to {limits.maxSavedProjects === Infinity ? '∞' : limits.maxSavedProjects}
              </span>
            </p>
          </div>

          <div className="bg-zinc-800/50 rounded-xl p-4">
            <p className="text-sm text-zinc-400 mb-1">
              {tier === 'free' ? 'Usage Resets' : 'Next Billing Date'}
            </p>
            <p className="text-2xl font-bold text-white">
              {billingData.subscription.currentPeriodEnd
                ? formatDate(billingData.subscription.currentPeriodEnd)
                : resetDate.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
            </p>
          </div>
        </div>
      </div>

      {/* Billing Cycle Toggle */}
      <div className="flex justify-center">
        <div className="inline-flex items-center bg-zinc-800 rounded-xl p-1">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              billingCycle === 'monthly'
                ? 'bg-zinc-700 text-white'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle('annual')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              billingCycle === 'annual'
                ? 'bg-zinc-700 text-white'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Annual
            <span className="ml-2 text-xs text-emerald-400">Save 17%</span>
          </button>
        </div>
      </div>

      {/* Plan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Object.entries(PLANS).map(([planId, plan]) => (
          <PlanCard
            key={planId}
            plan={plan}
            isCurrentPlan={tier === planId}
            billingCycle={billingCycle}
            onSelect={handlePlanSelect}
            disabled={updating}
          />
        ))}
      </div>

      {/* Cancel Subscription Modal */}
      <CancelSubscriptionModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleCancelSubscription}
        currentPlan={currentPlan.name}
        periodEnd={billingData.subscription.currentPeriodEnd}
      />
    </div>
  );
}
