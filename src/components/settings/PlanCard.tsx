import type { PlanInfo } from '../../types/billing';
import type { UserTier } from '../../types/tier';
import { formatCurrency } from '../../lib/billing-service';

interface PlanCardProps {
  plan: PlanInfo;
  isCurrentPlan: boolean;
  billingCycle: 'monthly' | 'annual';
  onSelect: (planId: UserTier) => void;
  disabled?: boolean;
}

export function PlanCard({
  plan,
  isCurrentPlan,
  billingCycle,
  onSelect,
  disabled,
}: PlanCardProps) {
  const price = billingCycle === 'annual' ? plan.pricing.annual : plan.pricing.monthly;
  const monthlyEquivalent = billingCycle === 'annual' ? plan.pricing.annual / 12 : plan.pricing.monthly;
  const annualSavings = plan.pricing.monthly * 12 - plan.pricing.annual;

  return (
    <div
      className={`relative rounded-2xl p-6 transition-all ${
        isCurrentPlan
          ? 'border-2 border-emerald-500/50 bg-emerald-500/10'
          : 'border border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'
      }`}
    >
      {/* Popular badge */}
      {plan.popular && !isCurrentPlan && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="px-3 py-1 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white text-xs font-semibold rounded-full">
            Most Popular
          </span>
        </div>
      )}

      {/* Current plan badge */}
      {isCurrentPlan && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="px-3 py-1 bg-emerald-500 text-white text-xs font-semibold rounded-full">
            Current Plan
          </span>
        </div>
      )}

      {/* Plan name and description */}
      <div className="text-center mb-6 pt-2">
        <h3 className="text-xl font-bold text-white mb-1">{plan.name}</h3>
        <p className="text-sm text-zinc-400">{plan.description}</p>
      </div>

      {/* Price */}
      <div className="text-center mb-6">
        {price === 0 ? (
          <div className="text-3xl font-bold text-white">Free</div>
        ) : (
          <>
            <div className="text-3xl font-bold text-white">
              {formatCurrency(monthlyEquivalent)}
              <span className="text-sm font-normal text-zinc-400">/mo</span>
            </div>
            {billingCycle === 'annual' && annualSavings > 0 && (
              <div className="text-sm text-emerald-400 mt-1">
                Save {formatCurrency(annualSavings)}/year
              </div>
            )}
            {billingCycle === 'annual' && (
              <div className="text-xs text-zinc-500 mt-1">
                Billed {formatCurrency(price)} annually
              </div>
            )}
          </>
        )}
      </div>

      {/* Features */}
      <ul className="space-y-3 mb-6">
        {plan.features.map((feature, idx) => (
          <li key={idx} className="flex items-start gap-3">
            {feature.included ? (
              <svg
                className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            ) : (
              <svg
                className="w-5 h-5 text-zinc-600 flex-shrink-0 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            )}
            <span
              className={feature.included ? 'text-zinc-300' : 'text-zinc-600'}
            >
              {feature.text}
            </span>
          </li>
        ))}
      </ul>

      {/* Action button */}
      {isCurrentPlan ? (
        <button
          disabled
          className="w-full py-3 px-4 rounded-xl border border-emerald-500/50 text-emerald-400 font-medium cursor-default"
        >
          Current Plan
        </button>
      ) : (
        <button
          onClick={() => onSelect(plan.id as UserTier)}
          disabled={disabled}
          className={`w-full py-3 px-4 rounded-xl font-semibold transition-all ${
            plan.popular
              ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:from-emerald-600 hover:to-cyan-600'
              : 'border border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {plan.pricing.monthly === 0 ? 'Downgrade' : 'Upgrade'}
        </button>
      )}
    </div>
  );
}
