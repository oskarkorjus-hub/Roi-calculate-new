import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDate } from '../../lib/billing-service';

interface CancelSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  currentPlan: string;
  periodEnd: string | null;
}

export function CancelSubscriptionModal({
  isOpen,
  onClose,
  onConfirm,
  currentPlan,
  periodEnd,
}: CancelSubscriptionModalProps) {
  const [reason, setReason] = useState('');
  const [step, setStep] = useState<'reason' | 'confirm'>('reason');

  const reasons = [
    { id: 'too-expensive', label: 'Too expensive' },
    { id: 'not-using', label: 'Not using it enough' },
    { id: 'missing-features', label: 'Missing features I need' },
    { id: 'found-alternative', label: 'Found a better alternative' },
    { id: 'temporary', label: 'Just need a break' },
    { id: 'other', label: 'Other reason' },
  ];

  const handleClose = () => {
    setStep('reason');
    setReason('');
    onClose();
  };

  const handleContinue = () => {
    if (reason) {
      setStep('confirm');
    }
  };

  const handleConfirm = () => {
    onConfirm();
    handleClose();
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
            {step === 'reason' ? (
              <>
                <div className="text-center mb-6">
                  <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-6 h-6 text-amber-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    We're sorry to see you go
                  </h3>
                  <p className="text-zinc-400 text-sm">
                    Before you cancel, please let us know why you're leaving.
                  </p>
                </div>

                <div className="space-y-2 mb-6">
                  {reasons.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => setReason(r.id)}
                      className={`w-full px-4 py-3 rounded-xl text-left transition-all ${
                        reason === r.id
                          ? 'bg-zinc-800 border-2 border-emerald-500/50 text-white'
                          : 'bg-zinc-800/50 border border-zinc-700 text-zinc-300 hover:bg-zinc-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                            reason === r.id
                              ? 'border-emerald-500 bg-emerald-500'
                              : 'border-zinc-600'
                          }`}
                        >
                          {reason === r.id && (
                            <div className="w-1.5 h-1.5 rounded-full bg-white" />
                          )}
                        </div>
                        {r.label}
                      </div>
                    </button>
                  ))}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleClose}
                    className="flex-1 py-3 border border-zinc-700 text-zinc-300 rounded-xl font-medium hover:bg-zinc-800 transition-all"
                  >
                    Keep Subscription
                  </button>
                  <button
                    onClick={handleContinue}
                    disabled={!reason}
                    className="flex-1 py-3 bg-zinc-700 text-white rounded-xl font-medium hover:bg-zinc-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continue
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="text-center mb-6">
                  <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-6 h-6 text-red-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    Confirm Cancellation
                  </h3>
                  <p className="text-zinc-400 text-sm">
                    Are you sure you want to cancel your {currentPlan} subscription?
                  </p>
                </div>

                <div className="bg-zinc-800/50 rounded-xl p-4 mb-6">
                  <h4 className="text-white font-medium mb-2">What happens next:</h4>
                  <ul className="space-y-2 text-sm text-zinc-400">
                    <li className="flex items-start gap-2">
                      <svg className="w-4 h-4 text-zinc-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {periodEnd
                        ? `You'll have access until ${formatDate(periodEnd)}`
                        : "Your access will end immediately"}
                    </li>
                    <li className="flex items-start gap-2">
                      <svg className="w-4 h-4 text-zinc-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      You'll be downgraded to the Free plan
                    </li>
                    <li className="flex items-start gap-2">
                      <svg className="w-4 h-4 text-zinc-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Your data will be preserved
                    </li>
                    <li className="flex items-start gap-2">
                      <svg className="w-4 h-4 text-zinc-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      You can resubscribe anytime
                    </li>
                  </ul>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep('reason')}
                    className="flex-1 py-3 border border-zinc-700 text-zinc-300 rounded-xl font-medium hover:bg-zinc-800 transition-all"
                  >
                    Go Back
                  </button>
                  <button
                    onClick={handleConfirm}
                    className="flex-1 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-all"
                  >
                    Cancel Subscription
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
