"use client";
import { useEffect, useRef, useState } from "react";
import { authService } from "../../services/auth.service";

interface AuthModalProps { isOpen: boolean; onClose: () => void; dict: any; isFa: boolean; onSuccess: () => void; }
const digits = (value: string) => value.replace(/[۰-۹]/g, ch => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(ch))).replace(/[٠-٩]/g, ch => String('٠١٢٣٤٥٦٧٨٩'.indexOf(ch)));
export function AuthModal({ isOpen, onClose, dict, isFa, onSuccess }: AuthModalProps) {
  const [step, setStep] = useState<'mobile' | 'otp'>('mobile');
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [devOtp, setDevOtp] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const panel = useRef<HTMLDivElement>(null);
  const t = (en: string, fa: string) => isFa ? fa : en;

  useEffect(() => {
    if (!isOpen) return;
    setStep('mobile'); setOtp(''); setError(''); setDevOtp(''); setCooldown(0);
    const previous = document.activeElement as HTMLElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panel.current?.querySelector('input')?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'Tab') {
        const focusable = panel.current?.querySelectorAll<HTMLElement>('button:not(:disabled),input:not(:disabled)');
        if (!focusable?.length) return;
        const first = focusable[0], last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = overflow; document.removeEventListener('keydown', onKey); previous?.focus(); };
  }, [isOpen]); // Modal callbacks may change while typing.
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setTimeout(() => setCooldown(value => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [cooldown]);

  async function requestCode(event?: React.FormEvent) {
    event?.preventDefault(); setLoading(true); setError('');
    try {
      const response = await authService.requestOtp(digits(mobile));
      if (response.mobile) setMobile(response.mobile);
      setStep('otp'); setOtp(''); setDevOtp(response.devOtp || ''); setCooldown(60);
    } catch (err) { setError(err instanceof Error ? err.message : t('Could not send the code.', 'ارسال کد انجام نشد.')); }
    finally { setLoading(false); }
  }
  async function verifyCode(event: React.FormEvent) {
    event.preventDefault(); setLoading(true); setError('');
    try { await authService.verifyOtp(digits(mobile), digits(otp)); onSuccess(); onClose(); }
    catch (err) { setError(err instanceof Error ? err.message : t('Invalid code.', 'کد نامعتبر است.')); }
    finally { setLoading(false); }
  }
  if (!isOpen) return null;
  return <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" dir={isFa ? 'rtl' : 'ltr'}>
    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
    <div ref={panel} role="dialog" aria-modal="true" aria-labelledby="auth-title" className="relative w-full max-w-md bg-white p-8 md:p-12 shadow-2xl border border-gray-100">
      <button onClick={onClose} aria-label={t('Close', 'بستن')} className="absolute top-4 right-4 p-2 text-2xl text-gray-500">×</button>
      <h2 id="auth-title" className="text-2xl font-serif text-center mb-3">{step === 'mobile' ? dict.auth.title : dict.auth.otpTitle}</h2>
      <p className="text-sm text-gray-500 text-center mb-8">{step === 'mobile' ? dict.auth.subtitle : dict.auth.otpSubtitle}</p>
      {error && <p role="alert" className="mb-5 p-3 bg-red-50 text-red-700 text-sm">{error}</p>}
      {devOtp && step === 'otp' && <p className="mb-5 p-3 bg-amber-50 text-amber-900 text-sm">{t('Development SMS code:', 'کد پیامک آزمایشی:')} <strong dir="ltr">{devOtp}</strong></p>}
      <form onSubmit={step === 'mobile' ? requestCode : verifyCode} className="flex flex-col gap-5">
        <label htmlFor="auth-input" className="text-xs font-bold">{step === 'mobile' ? dict.auth.mobileLabel : dict.auth.otpLabel}</label>
        <input key={step} id="auth-input" autoFocus required disabled={loading} type={step === 'mobile' ? 'tel' : 'text'} autoComplete={step === 'mobile' ? 'tel' : 'one-time-code'} inputMode="numeric" maxLength={step === 'mobile' ? 16 : 6} value={step === 'mobile' ? mobile : otp} onChange={event => step === 'mobile' ? setMobile(digits(event.target.value)) : setOtp(digits(event.target.value).replace(/\D/g, ''))} placeholder={step === 'mobile' ? dict.auth.mobilePlaceholder : '123456'} dir="ltr" className="border-b border-gray-300 py-3 text-base focus:border-ariwatch-red outline-none" />
        <button disabled={loading || (step === 'mobile' ? mobile.length < 10 : otp.length !== 6)} className="bg-ariwatch-black text-white py-4 text-xs font-bold disabled:opacity-50">{loading ? t('Please wait…', 'لطفاً صبر کنید…') : step === 'mobile' ? dict.auth.sendOtp : dict.auth.verifyOtp}</button>
        {step === 'otp' && <>
          <button type="button" disabled={loading || cooldown > 0} onClick={() => requestCode()} className="text-sm text-ariwatch-red disabled:text-gray-400">{t('Resend code', 'ارسال دوباره کد')}{cooldown > 0 ? ` (${cooldown})` : ''}</button>
          <button type="button" disabled={loading} onClick={() => { setStep('mobile'); setOtp(''); setDevOtp(''); setError(''); }} className="text-sm text-gray-500">{dict.auth.changeMobile}</button>
        </>}
      </form>
    </div>
  </div>;
}
