import { useState, useCallback, useEffect } from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (email: string) => void;
  isExporting?: boolean;
}

export const EmailCollectorModal: React.FC<Props> = ({ isOpen, onClose, onSubmit, isExporting = false }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  // Reset form state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setEmail('');
      setError(null);
      setSubmitted(false);
    }
  }, [isOpen]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !trimmed.includes('@') || !trimmed.includes('.')) {
      setError('Please enter a valid email address');
      return;
    }

    setSubmitted(true);
    onSubmit(trimmed);
  }, [email, onSubmit]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-300"
      role="dialog"
      aria-modal="true"
      aria-labelledby="email-modal-title"
    >
      <div className="glass-card bg-surface w-full max-w-md rounded-3xl shadow-2xl overflow-hidden relative border border-border">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-text-muted hover:text-white transition-colors z-10"
          aria-label="Close"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {!submitted || isExporting ? (
          <div className="p-8">
            <div className="mb-6 text-center">
              <div className="bg-primary text-background w-14 h-14 flex items-center justify-center rounded-2xl font-black text-3xl italic mx-auto mb-4 shadow-lg shadow-primary/30">
                R
              </div>
              <h2 id="email-modal-title" className="text-2xl font-black text-white tracking-tight mb-2">
                Get Your Report
              </h2>
              <p className="text-text-muted text-sm">
                Enter your email and we'll send the PDF report directly to your inbox. No account required.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-sm font-medium text-red-400" role="alert">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="report-email" className="block text-sm font-semibold text-text-secondary mb-1.5">
                  Email Address
                </label>
                <input
                  id="report-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  autoFocus
                  disabled={submitted && isExporting}
                  className={`w-full bg-surface-alt/50 border rounded-xl px-4 py-3 text-sm font-medium text-white placeholder-text-muted outline-none transition-all ${
                    error ? 'border-red-500/50 focus:border-red-400' : 'border-border focus:border-primary/50'
                  } disabled:opacity-50`}
                  aria-invalid={!!error}
                />
              </div>

              <button
                type="submit"
                disabled={submitted && isExporting}
                className="w-full bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed text-background py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-primary/25 transition-all flex items-center justify-center gap-2"
              >
                {submitted && isExporting ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                      <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" className="opacity-75" />
                    </svg>
                    Generating & Sending Report...
                  </>
                ) : (
                  'Send Report to My Email'
                )}
              </button>
            </form>

            <div className="mt-5 text-center">
              <p className="text-text-muted text-xs">
                Your report will be generated as a PDF and emailed to you instantly.
              </p>
            </div>
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="w-20 h-20 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-2xl font-black text-white tracking-tight mb-3">
              Report Sent!
            </h3>
            <p className="text-text-muted mb-6">
              Check your inbox at <span className="font-semibold text-text-secondary">{email}</span>
            </p>
            <button
              onClick={onClose}
              className="bg-surface-alt hover:bg-surface-alt/80 text-text-secondary px-8 py-3 rounded-xl font-bold text-sm transition-colors"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailCollectorModal;
