"use client";
import { useState } from "react";
import { apiRequest } from "../../../services/api";
export function FooterNewsletter({ dict, isFa }: { dict: any; isFa: boolean }) {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'loading' | 'success'>('idle');
  const [error, setError] = useState('');
  async function submit(event: React.FormEvent) {
    event.preventDefault(); setState('loading'); setError('');
    try { await apiRequest('/api/newsletter', { method: 'POST', body: { email, lang: isFa ? 'fa' : 'en' } }); setState('success'); }
    catch (err) { setState('idle'); setError(err instanceof Error ? err.message : 'Please try again.'); }
  }
  return <div className="text-xs tracking-widest">
    <h4 className="font-bold mb-6">{dict.footer.subscribe}</h4>
    {state === 'success' ? <p role="status" className="text-green-800 normal-case">{isFa ? 'عضویت شما ثبت شد.' : 'You are subscribed. Thank you.'}</p> :
      <form onSubmit={submit} className="flex flex-col gap-4">
        <label className="sr-only" htmlFor="newsletter-email">{dict.footer.emailPlaceholder}</label>
        <input id="newsletter-email" type="email" required maxLength={254} autoComplete="email" dir="ltr" value={email} onChange={event => setEmail(event.target.value)} placeholder={dict.footer.emailPlaceholder} className="border-b border-gray-300 bg-transparent py-2 focus:border-ariwatch-black outline-none" />
        <p className="text-gray-500 normal-case tracking-normal">{isFa ? 'با ثبت ایمیل، دریافت اخبار مجموعه را انتخاب می‌کنید.' : 'By subscribing, you choose to receive collection news.'}</p>
        {error && <p role="alert" className="text-red-700 normal-case tracking-normal">{error}</p>}
        <button disabled={state === 'loading'} className="text-start text-ariwatch-red font-bold disabled:opacity-50">{state === 'loading' ? '…' : isFa ? 'عضویت' : 'SUBSCRIBE'}</button>
      </form>}
  </div>;
}
