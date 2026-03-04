
import React, { useState } from 'react';
import { User } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
}

const AuthModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  const [isLogin, setIsLogin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'form' | 'verifying'>('form');

  if (!isOpen) return null;

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate verification process
    setTimeout(() => {
      setStep('verifying');
      setTimeout(() => {
        onSuccess({
          id: 'u123',
          email: 'investor@example.com',
          name: 'Real Estate Pro',
          isVerified: true,
        });
      }, 2000);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden relative">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-300 hover:text-slate-500 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {step === 'form' ? (
          <div className="p-10">
            <div className="mb-8 text-center">
              <div className="bg-indigo-600 text-white w-12 h-12 flex items-center justify-center rounded-2xl font-black text-2xl italic mx-auto mb-4">R</div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
                {isLogin ? 'Welcome Back' : 'Get Full Report'}
              </h3>
              <p className="text-slate-500 font-medium text-sm">
                Includes Opportunity Score, Comparables, Investment Summary and more
              </p>
            </div>

            <div className="space-y-4">
              <button className="w-full flex items-center justify-center gap-3 py-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all font-bold text-slate-700 text-sm">
                <svg className="w-5 h-5" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.13-.41-4.63H24v9.04h12.94c-.58 3.01-2.23 5.56-4.79 7.27l7.78 6.03c4.54-4.18 7.05-10.36 7.05-17.71z" />
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24s.92 7.54 2.56 10.78l7.97-6.19z" />
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.78-6.03c-2.1.41-4.47.67-8.11.67-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                </svg>
                Continue with Google
              </button>

              <div className="flex items-center gap-4 py-2">
                <div className="flex-1 h-px bg-slate-100"></div>
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">or email</span>
                <div className="flex-1 h-px bg-slate-100"></div>
              </div>

              <form onSubmit={handleAuth} className="space-y-4">
                <input 
                  type="email" 
                  placeholder="Email Address"
                  required
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-400 transition-all"
                />
                {!isLogin && (
                  <input 
                    type="text" 
                    placeholder="Full Name"
                    required
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-400 transition-all"
                  />
                )}
                <input 
                  type="password" 
                  placeholder="Password"
                  required
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-400 transition-all"
                />
                
                <button 
                  disabled={loading}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-black uppercase tracking-widest text-xs shadow-xl shadow-indigo-100 transition-all flex items-center justify-center gap-2"
                >
                  {loading && <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10" strokeWidth="4" className="opacity-25"/><path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" className="opacity-75"/></svg>}
                  {isLogin ? 'Sign In' : 'Create Free Account'}
                </button>
              </form>

              <button 
                onClick={() => setIsLogin(!isLogin)}
                className="w-full text-center text-xs font-bold text-slate-400 hover:text-indigo-600 transition-colors"
              >
                {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
              </button>
            </div>
          </div>
        ) : (
          <div className="p-16 text-center">
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-8">
              <svg className="w-10 h-10 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-3">Verified & Loading</h3>
            <p className="text-slate-500 font-medium mb-8">
              Welcome aboard! Your full investment report is being generated and your download will start automatically.
            </p>
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 animate-[loading_2s_ease-in-out_infinite]"></div>
            </div>
          </div>
        )}
      </div>
      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

export default AuthModal;
