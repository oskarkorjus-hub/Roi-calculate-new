import { useState, useEffect, useCallback } from 'react';

interface Props {
  onJoinWaitlist: () => void;
  onSignUp: () => void;
  onLogin: () => void;
}

const POPUP_SHOWN_KEY = 'roi_welcome_popup_shown';
const POPUP_COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 hours

export const WelcomePopup: React.FC<Props> = ({ onJoinWaitlist, onSignUp, onLogin }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    // Check if we should show the popup
    const lastShown = localStorage.getItem(POPUP_SHOWN_KEY);
    const now = Date.now();

    if (lastShown) {
      const lastShownTime = parseInt(lastShown, 10);
      if (now - lastShownTime < POPUP_COOLDOWN_MS) {
        // Don't show if shown within cooldown period
        return;
      }
    }

    // Show popup after 3 seconds
    const timer = setTimeout(() => {
      setIsVisible(true);
      localStorage.setItem(POPUP_SHOWN_KEY, now.toString());
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
      setIsClosing(false);
    }, 200);
  }, []);

  const handleAction = useCallback((action: () => void) => {
    handleClose();
    // Small delay to let animation finish
    setTimeout(action, 250);
  }, [handleClose]);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm transition-opacity duration-200 ${
        isClosing ? 'opacity-0' : 'opacity-100'
      }`}
      onClick={handleClose}
    >
      <div
        className={`bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden transform transition-all duration-200 ${
          isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-slate-300 hover:text-slate-500 transition-colors z-10"
          aria-label="Close"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-8 text-center relative">
          {/* Logo */}
          <div className="bg-primary text-white w-16 h-16 flex items-center justify-center rounded-2xl font-black text-4xl italic mx-auto mb-5 shadow-lg shadow-primary/30">
            R
          </div>

          {/* Title */}
          <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
            Welcome to ROI Calculate
          </h2>
          <p className="text-slate-500 text-sm mb-8 max-w-sm mx-auto">
            Professional investment analysis tools for Bali real estate. Calculate XIRR, rental yields, and more.
          </p>

          {/* Primary CTA - Join Waitlist */}
          <button
            onClick={() => handleAction(onJoinWaitlist)}
            className="w-full bg-primary hover:bg-primary-dark text-white py-4 rounded-xl font-bold text-sm shadow-lg shadow-primary/25 transition-all mb-3"
          >
            Join the Waitlist for Updates
          </button>

          {/* Secondary options */}
          <div className="flex gap-3">
            <button
              onClick={() => handleAction(onSignUp)}
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl font-bold text-sm transition-all"
            >
              Create Account
            </button>
            <button
              onClick={() => handleAction(onLogin)}
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl font-bold text-sm transition-all"
            >
              Sign In
            </button>
          </div>

          {/* Skip link */}
          <button
            onClick={handleClose}
            className="mt-5 text-xs font-medium text-slate-400 hover:text-slate-600 transition-colors"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomePopup;
