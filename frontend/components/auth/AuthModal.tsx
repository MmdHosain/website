"use client";

import { useState } from "react";
import { authService } from "../../services/auth.service";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  dict: any;
  isFa: boolean;
  onSuccess: () => void;
}

export function AuthModal({ isOpen, onClose, dict, isFa, onSuccess }: AuthModalProps) {
  const [step, setStep] = useState<'mobile' | 'otp'>('mobile');
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await authService.requestOtp(mobile);
      setStep('otp');
      
      // Simulated popup notification as requested for MVP
      if (res.devOtp) {
        setTimeout(() => {
          alert(`${dict.auth.mockPopupTitle}\n\n${dict.auth.mockPopupDesc} ${res.devOtp}`);
        }, 500);
      }
    } catch (err: any) {
      setError(err.message || 'Error requesting OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await authService.verifyOtp(mobile, otp);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative w-full max-w-md bg-white p-8 md:p-12 shadow-2xl animate-fade-in-scale border border-gray-100">
        <button onClick={onClose} className="absolute top-6 right-6 text-gray-400 hover:text-black transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="text-center mb-10">
          <div className="w-12 h-12 rounded-full border border-ariwatch-red flex items-center justify-center text-ariwatch-red mx-auto mb-4">
            <span className="text-xl font-serif">A</span>
          </div>
          <h2 className="text-2xl font-serif text-ariwatch-black uppercase tracking-widest mb-2">
            {step === 'mobile' ? dict.auth.title : dict.auth.otpTitle}
          </h2>
          <p className="text-sm text-ariwatch-gray">
            {step === 'mobile' ? dict.auth.subtitle : dict.auth.otpSubtitle}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 text-red-600 text-xs font-bold text-center uppercase tracking-widest">
            {error}
          </div>
        )}

        {step === 'mobile' ? (
          <form onSubmit={handleRequestOtp} className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold tracking-widest text-ariwatch-black uppercase">
                {dict.auth.mobileLabel}
              </label>
              <input 
                type="tel"
                required
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder={dict.auth.mobilePlaceholder}
                className="border-b border-gray-300 py-3 bg-transparent focus:outline-none focus:border-ariwatch-red transition-colors text-sm font-mono"
                dir="ltr"
              />
            </div>
            <button 
              type="submit" 
              disabled={loading || mobile.length < 10}
              className="mt-4 w-full bg-ariwatch-black text-white px-8 py-4 text-[10px] md:text-xs font-bold tracking-widest uppercase hover:bg-black transition-colors disabled:opacity-50"
            >
              {loading ? '...' : dict.auth.sendOtp}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold tracking-widest text-ariwatch-black uppercase">
                {dict.auth.otpLabel}
              </label>
              <input 
                type="text"
                required
                maxLength={5}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="- - - - -"
                className="border-b border-gray-300 py-3 bg-transparent focus:outline-none focus:border-ariwatch-red transition-colors text-center text-xl tracking-[1em] font-mono"
                dir="ltr"
              />
            </div>
            <button 
              type="submit" 
              disabled={loading || otp.length < 5}
              className="mt-4 w-full bg-ariwatch-black text-white px-8 py-4 text-[10px] md:text-xs font-bold tracking-widest uppercase hover:bg-black transition-colors disabled:opacity-50"
            >
              {loading ? '...' : dict.auth.verifyOtp}
            </button>
            <button 
              type="button"
              onClick={() => { setStep('mobile'); setOtp(''); setError(''); }}
              className="text-[10px] text-ariwatch-gray font-bold tracking-widest uppercase hover:text-ariwatch-black transition-colors"
            >
              {dict.auth.changeMobile}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
