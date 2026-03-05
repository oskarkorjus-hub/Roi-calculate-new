import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTier } from '../../lib/tier-context';
import { PaymentMethodCard } from './PaymentMethodCard';
import { BillingHistoryTable } from './BillingHistoryTable';
import {
  removePaymentMethod,
  setDefaultPaymentMethod,
  addPaymentMethod,
} from '../../lib/billing-service';
import type { BillingData, CardBrand } from '../../types/billing';

interface BillingSectionProps {
  billingData: BillingData;
  onBillingUpdate: (data: BillingData) => void;
  onToast: (message: string, type: 'success' | 'error') => void;
}

export function BillingSection({
  billingData,
  onBillingUpdate,
  onToast,
}: BillingSectionProps) {
  const { tier } = useTier();
  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);

  const handleSetDefault = (paymentMethodId: string) => {
    const success = setDefaultPaymentMethod(paymentMethodId);
    if (success) {
      const updated = { ...billingData };
      updated.paymentMethods = updated.paymentMethods.map((pm) => ({
        ...pm,
        isDefault: pm.id === paymentMethodId,
      }));
      onBillingUpdate(updated);
      onToast('Default payment method updated', 'success');
    }
  };

  const handleRemove = (paymentMethodId: string) => {
    if (billingData.paymentMethods.length <= 1 && tier !== 'free') {
      onToast('You must have at least one payment method', 'error');
      return;
    }

    const success = removePaymentMethod(paymentMethodId);
    if (success) {
      const updated = { ...billingData };
      updated.paymentMethods = updated.paymentMethods.filter(
        (pm) => pm.id !== paymentMethodId
      );
      // If we removed the default, make the first one default
      if (updated.paymentMethods.length > 0 && !updated.paymentMethods.some((pm) => pm.isDefault)) {
        updated.paymentMethods[0].isDefault = true;
      }
      onBillingUpdate(updated);
      onToast('Payment method removed', 'success');
    }
  };

  const handleAddPaymentMethod = (
    brand: CardBrand,
    last4: string,
    expiryMonth: number,
    expiryYear: number
  ) => {
    const newMethod = addPaymentMethod(brand, last4, expiryMonth, expiryYear);
    const updated = { ...billingData };
    updated.paymentMethods = [...updated.paymentMethods, newMethod];
    onBillingUpdate(updated);
    onToast('Payment method added', 'success');
    setShowAddPaymentModal(false);
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
            Payment methods shown are simulated. No real payment processing is connected.
          </p>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Payment Methods</h3>
          <button
            onClick={() => setShowAddPaymentModal(true)}
            className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add Payment Method
          </button>
        </div>

        {billingData.paymentMethods.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-zinc-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
              </svg>
            </div>
            <p className="text-zinc-400">No payment methods on file</p>
            <p className="text-sm text-zinc-500 mt-1">
              {tier === 'free'
                ? 'Add a payment method to upgrade your plan'
                : 'Add a payment method to continue your subscription'}
            </p>
            <button
              onClick={() => setShowAddPaymentModal(true)}
              className="mt-4 px-4 py-2 bg-zinc-800 text-white rounded-xl font-medium hover:bg-zinc-700 transition-all"
            >
              Add Payment Method
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {billingData.paymentMethods.map((pm) => (
              <PaymentMethodCard
                key={pm.id}
                paymentMethod={pm}
                onSetDefault={() => handleSetDefault(pm.id)}
                onRemove={() => handleRemove(pm.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Billing History */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-6">Billing History</h3>
        <BillingHistoryTable invoices={billingData.invoices} />
      </div>

      {/* Add Payment Method Modal */}
      <AddPaymentMethodModal
        isOpen={showAddPaymentModal}
        onClose={() => setShowAddPaymentModal(false)}
        onAdd={handleAddPaymentMethod}
      />
    </div>
  );
}

// Add Payment Method Modal
function AddPaymentMethodModal({
  isOpen,
  onClose,
  onAdd,
}: {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (brand: CardBrand, last4: string, expiryMonth: number, expiryYear: number) => void;
}) {
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Basic validation
    const cleanNumber = cardNumber.replace(/\s/g, '');
    if (cleanNumber.length !== 16) {
      setError('Please enter a valid 16-digit card number');
      return;
    }

    const [month, year] = expiry.split('/');
    const expiryMonth = parseInt(month, 10);
    const expiryYear = parseInt(`20${year}`, 10);

    if (!expiryMonth || !expiryYear || expiryMonth < 1 || expiryMonth > 12) {
      setError('Please enter a valid expiry date (MM/YY)');
      return;
    }

    if (cvc.length < 3) {
      setError('Please enter a valid CVC');
      return;
    }

    // Detect card brand from number prefix
    let brand: CardBrand = 'visa';
    if (cleanNumber.startsWith('5')) brand = 'mastercard';
    else if (cleanNumber.startsWith('3')) brand = 'amex';
    else if (cleanNumber.startsWith('6')) brand = 'discover';

    const last4 = cleanNumber.slice(-4);
    onAdd(brand, last4, expiryMonth, expiryYear);
    handleClose();
  };

  const handleClose = () => {
    setCardNumber('');
    setExpiry('');
    setCvc('');
    setError('');
    onClose();
  };

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 16);
    const groups = cleaned.match(/.{1,4}/g) || [];
    return groups.join(' ');
  };

  const formatExpiry = (value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 4);
    if (cleaned.length >= 2) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
    }
    return cleaned;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-white mb-4">Add Payment Method</h3>

            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 mb-4 text-sm text-amber-400">
              Demo Mode: No real card will be charged
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Card Number
                </label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-mono"
                  placeholder="1234 5678 9012 3456"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    value={expiry}
                    onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-mono"
                    placeholder="MM/YY"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">
                    CVC
                  </label>
                  <input
                    type="text"
                    value={cvc}
                    onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-mono"
                    placeholder="123"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 py-3 border border-zinc-700 text-zinc-300 rounded-xl font-medium hover:bg-zinc-800 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-cyan-600 transition-all"
                >
                  Add Card
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
