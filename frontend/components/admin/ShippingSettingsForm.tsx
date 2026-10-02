"use client";

import { useState, type FormEvent } from 'react';
import { apiRequest } from '../../services/api';

export function ShippingSettingsForm({ initialCost, fa }: { initialCost: number; fa: boolean }) {
  const [amount, setAmount] = useState(String(initialCost));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const save = async (event: FormEvent) => {
    event.preventDefault();
    if (saving) return;
    setError(''); setNotice('');
    const shippingCost = Number(amount);
    if (!amount.trim() || !Number.isSafeInteger(shippingCost) || shippingCost < 0 || shippingCost > 100000000) {
      setError(fa ? 'هزینه ارسال باید عدد صحیح از صفر تا ۱۰۰٬۰۰۰٬۰۰۰ تومان باشد.' : 'Enter a whole amount between 0 and 100,000,000 toman.');
      return;
    }
    setSaving(true);
    try {
      await apiRequest('/api/admin/settings', { method: 'PUT', authenticated: true, body: { shippingCost } });
      setNotice(fa ? 'هزینه ارسال ذخیره شد.' : 'Shipping cost saved.');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : fa ? 'ذخیره انجام نشد.' : 'Could not save.');
    } finally { setSaving(false); }
  };
  return <form onSubmit={save} aria-busy={saving} className="bg-white border p-6">
    <h2 className="font-serif text-xl mb-3">{fa ? 'ارسال' : 'Shipping'}</h2>
    <p className="text-sm text-gray-600 leading-7 mb-5">{fa ? 'این هزینه ثابت به سفارش‌های جدید اضافه می‌شود. سفارش‌های ثبت‌شده مبلغ خود را حفظ می‌کنند.' : 'This fixed cost is added to new orders. Existing orders retain their original shipping charge.'}</p>
    <label htmlFor="shipping-cost" className="block text-sm mb-2">{fa ? 'هزینه ارسال (تومان)' : 'Shipping cost (toman)'}</label>
    <input id="shipping-cost" required disabled={saving} type="number" min={0} max={100000000} step={1}
      value={amount} onChange={event => { setAmount(event.target.value); setError(''); setNotice(''); }}
      className="border p-3 w-full max-w-sm disabled:opacity-50" />
    {error && <p role="alert" className="mt-4 text-sm text-red-700">{error}</p>}
    {notice && <p role="status" className="mt-4 text-sm text-green-700">{notice}</p>}
    <div><button disabled={saving} className="mt-5 bg-black text-white px-6 py-3 disabled:opacity-50">
      {saving ? (fa ? 'در حال ذخیره…' : 'Saving…') : fa ? 'ذخیره هزینه ارسال' : 'Save shipping cost'}
    </button></div>
  </form>;
}
