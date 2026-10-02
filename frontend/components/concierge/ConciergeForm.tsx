"use client";
import { useState } from "react";
import { apiRequest } from "../../services/api";
export function ConciergeForm({ lang, dict, isFa }: { lang: string; dict: any; isFa: boolean }) {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reference, setReference] = useState('');
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setError('');
    const data = new FormData(event.currentTarget);
    try {
      const result = await apiRequest<{ id?: string; request?: { id: string } }>('/api/concierge', { method: 'POST', body: { name: data.get('name'), email: data.get('email'), model: data.get('model'), message: data.get('message'), lang } });
      setReference(result.id || result.request?.id || ''); setSubmitted(true);
    } catch (err) { setError(err instanceof Error ? err.message : (isFa ? 'ارسال انجام نشد. دوباره تلاش کنید.' : 'Could not submit. Please try again.')); }
    finally { setLoading(false); }
  }
  if (submitted) return <div role="status" className="py-16 text-center">
    <div className="text-green-700 text-4xl mb-6">✓</div>
    <h3 className="text-2xl font-serif mb-4">{dict.concierge.successTitle}</h3>
    <p className="text-gray-500">{dict.concierge.successDesc}</p>
    {reference && <p className="mt-5 text-xs text-gray-500">{isFa ? 'شماره درخواست:' : 'Request reference:'} <span dir="ltr">{reference.slice(0, 8).toUpperCase()}</span></p>}
    <button className="mt-8 underline text-sm" onClick={() => setSubmitted(false)}>{isFa ? 'درخواست جدید' : 'Send another request'}</button>
  </div>;
  const inputClass = "border-b border-gray-300 py-3 bg-transparent focus:border-ariwatch-red outline-none text-sm";
  return <form onSubmit={submit} className="flex flex-col gap-8">
    {error && <p role="alert" className="p-3 bg-red-50 text-red-700 text-sm">{error}</p>}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <label className="flex flex-col gap-2 text-xs font-bold">{dict.concierge.formName}<input name="name" required minLength={2} maxLength={100} autoComplete="name" className={inputClass} /></label>
      <label className="flex flex-col gap-2 text-xs font-bold">{dict.concierge.formEmail}<input name="email" required type="email" maxLength={254} autoComplete="email" dir="ltr" className={inputClass} /></label>
    </div>
    <label className="flex flex-col gap-2 text-xs font-bold">{dict.concierge.formModel}<input name="model" required minLength={2} maxLength={200} className={inputClass} /></label>
    <label className="flex flex-col gap-2 text-xs font-bold">{dict.concierge.formMessage}<textarea name="message" required minLength={10} maxLength={2000} rows={4} className={inputClass} /></label>
    <button disabled={loading} className="bg-ariwatch-black text-white px-10 py-4 text-xs font-bold w-full md:w-fit md:self-end disabled:opacity-50">{loading ? (isFa ? 'در حال ارسال…' : 'Submitting…') : dict.concierge.submit}</button>
  </form>;
}
