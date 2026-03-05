export type CardBrand = 'visa' | 'mastercard' | 'amex' | 'discover';

export interface PaymentMethod {
  id: string;
  brand: CardBrand;
  last4: string;
  expiryMonth: number;
  expiryYear: number;
  isDefault: boolean;
}

export type InvoiceStatus = 'paid' | 'pending' | 'failed';

export interface Invoice {
  id: string;
  date: string;
  amount: number;
  status: InvoiceStatus;
  description: string;
  downloadUrl?: string;
}

export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'trialing' | null;
export type BillingCycle = 'monthly' | 'annual' | null;

export interface SubscriptionData {
  status: SubscriptionStatus;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  billingCycle: BillingCycle;
}

export interface BillingData {
  subscription: SubscriptionData;
  paymentMethods: PaymentMethod[];
  invoices: Invoice[];
}

export interface PlanPricing {
  monthly: number;
  annual: number;
}

export interface PlanFeature {
  text: string;
  included: boolean;
}

export interface PlanInfo {
  id: string;
  name: string;
  description: string;
  pricing: PlanPricing;
  features: PlanFeature[];
  popular?: boolean;
}
