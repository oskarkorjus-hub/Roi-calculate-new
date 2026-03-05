import type {
  BillingData,
  PaymentMethod,
  Invoice,
  SubscriptionData,
  PlanInfo,
} from '../types/billing';
import type { UserTier } from '../types/tier';

// Storage keys
const BILLING_STORAGE_KEY = 'roi_calculate_billing_data';

// Plan definitions
export const PLANS: Record<UserTier, PlanInfo> = {
  free: {
    id: 'free',
    name: 'Free',
    description: 'Perfect for trying out ROI Calculate',
    pricing: { monthly: 0, annual: 0 },
    features: [
      { text: '3 calculations per month', included: true },
      { text: '1 saved project', included: true },
      { text: 'Basic calculators', included: true },
      { text: 'Export to PDF', included: false },
      { text: 'Priority support', included: false },
      { text: 'Team collaboration', included: false },
    ],
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    description: 'For serious investors who need more power',
    pricing: { monthly: 19, annual: 190 },
    features: [
      { text: 'Unlimited calculations', included: true },
      { text: '25 saved projects', included: true },
      { text: 'All calculators', included: true },
      { text: 'Export to PDF', included: true },
      { text: 'Priority support', included: true },
      { text: 'Team collaboration', included: false },
    ],
    popular: true,
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For teams and organizations',
    pricing: { monthly: 49, annual: 490 },
    features: [
      { text: 'Unlimited calculations', included: true },
      { text: 'Unlimited saved projects', included: true },
      { text: 'All calculators', included: true },
      { text: 'Export to PDF', included: true },
      { text: 'Priority support', included: true },
      { text: 'Team collaboration', included: true },
    ],
  },
};

// Mock data generators
function generateMockInvoices(tier: UserTier): Invoice[] {
  if (tier === 'free') return [];

  const now = new Date();
  const invoices: Invoice[] = [];
  const monthlyPrice = PLANS[tier].pricing.monthly;

  for (let i = 0; i < 6; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    invoices.push({
      id: `inv_${Date.now()}_${i}`,
      date: date.toISOString(),
      amount: monthlyPrice,
      status: i === 0 ? 'pending' : 'paid',
      description: `${PLANS[tier].name} Plan - ${date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`,
      downloadUrl: i > 0 ? `#invoice-${i}` : undefined,
    });
  }

  return invoices;
}

function generateMockPaymentMethod(tier: UserTier): PaymentMethod[] {
  if (tier === 'free') return [];

  return [
    {
      id: 'pm_mock_1',
      brand: 'visa',
      last4: '4242',
      expiryMonth: 12,
      expiryYear: 2027,
      isDefault: true,
    },
  ];
}

function generateMockSubscription(tier: UserTier): SubscriptionData {
  if (tier === 'free') {
    return {
      status: null,
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false,
      billingCycle: null,
    };
  }

  const nextMonth = new Date();
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  nextMonth.setDate(1);

  return {
    status: 'active',
    currentPeriodEnd: nextMonth.toISOString(),
    cancelAtPeriodEnd: false,
    billingCycle: 'monthly',
  };
}

// Load billing data from storage
function loadBillingData(): BillingData | null {
  try {
    const saved = localStorage.getItem(BILLING_STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {
    // localStorage unavailable or invalid JSON
  }
  return null;
}

// Save billing data to storage
function saveBillingData(data: BillingData): void {
  try {
    localStorage.setItem(BILLING_STORAGE_KEY, JSON.stringify(data));
  } catch {
    // localStorage unavailable
  }
}

// Get billing data for a user tier
export function getBillingData(tier: UserTier): BillingData {
  const saved = loadBillingData();
  if (saved) {
    return saved;
  }

  const data: BillingData = {
    subscription: generateMockSubscription(tier),
    paymentMethods: generateMockPaymentMethod(tier),
    invoices: generateMockInvoices(tier),
  };

  saveBillingData(data);
  return data;
}

// Update subscription (mock - instant change)
export function updateSubscription(
  tier: UserTier,
  billingCycle: 'monthly' | 'annual'
): BillingData {
  const nextBillingDate = new Date();
  nextBillingDate.setMonth(nextBillingDate.getMonth() + (billingCycle === 'annual' ? 12 : 1));

  const data: BillingData = {
    subscription: {
      status: tier === 'free' ? null : 'active',
      currentPeriodEnd: tier === 'free' ? null : nextBillingDate.toISOString(),
      cancelAtPeriodEnd: false,
      billingCycle: tier === 'free' ? null : billingCycle,
    },
    paymentMethods: tier === 'free' ? [] : generateMockPaymentMethod(tier),
    invoices: generateMockInvoices(tier),
  };

  saveBillingData(data);
  return data;
}

// Cancel subscription (at period end)
export function cancelSubscription(): BillingData {
  const saved = loadBillingData();
  if (!saved) {
    return getBillingData('free');
  }

  const updated: BillingData = {
    ...saved,
    subscription: {
      ...saved.subscription,
      cancelAtPeriodEnd: true,
    },
  };

  saveBillingData(updated);
  return updated;
}

// Resume subscription (undo cancel)
export function resumeSubscription(): BillingData {
  const saved = loadBillingData();
  if (!saved) {
    return getBillingData('free');
  }

  const updated: BillingData = {
    ...saved,
    subscription: {
      ...saved.subscription,
      cancelAtPeriodEnd: false,
    },
  };

  saveBillingData(updated);
  return updated;
}

// Add payment method (mock)
export function addPaymentMethod(
  brand: 'visa' | 'mastercard' | 'amex' | 'discover',
  last4: string,
  expiryMonth: number,
  expiryYear: number
): PaymentMethod {
  const saved = loadBillingData();
  const newMethod: PaymentMethod = {
    id: `pm_${Date.now()}`,
    brand,
    last4,
    expiryMonth,
    expiryYear,
    isDefault: !saved?.paymentMethods.length,
  };

  if (saved) {
    saved.paymentMethods.push(newMethod);
    saveBillingData(saved);
  }

  return newMethod;
}

// Remove payment method
export function removePaymentMethod(paymentMethodId: string): boolean {
  const saved = loadBillingData();
  if (!saved) return false;

  const index = saved.paymentMethods.findIndex((pm) => pm.id === paymentMethodId);
  if (index === -1) return false;

  saved.paymentMethods.splice(index, 1);

  // If we removed the default, make the first one default
  if (saved.paymentMethods.length > 0 && !saved.paymentMethods.some((pm) => pm.isDefault)) {
    saved.paymentMethods[0].isDefault = true;
  }

  saveBillingData(saved);
  return true;
}

// Set default payment method
export function setDefaultPaymentMethod(paymentMethodId: string): boolean {
  const saved = loadBillingData();
  if (!saved) return false;

  saved.paymentMethods.forEach((pm) => {
    pm.isDefault = pm.id === paymentMethodId;
  });

  saveBillingData(saved);
  return true;
}

// Reset billing data (for demo purposes)
export function resetBillingData(): void {
  try {
    localStorage.removeItem(BILLING_STORAGE_KEY);
  } catch {
    // localStorage unavailable
  }
}

// Format currency
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

// Format date
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// Get card brand display name and icon
export function getCardBrandInfo(brand: string): { name: string; color: string } {
  const brands: Record<string, { name: string; color: string }> = {
    visa: { name: 'Visa', color: 'text-blue-400' },
    mastercard: { name: 'Mastercard', color: 'text-orange-400' },
    amex: { name: 'American Express', color: 'text-blue-500' },
    discover: { name: 'Discover', color: 'text-orange-500' },
  };
  return brands[brand] || { name: brand, color: 'text-zinc-400' };
}
