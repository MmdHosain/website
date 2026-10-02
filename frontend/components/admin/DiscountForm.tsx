"use client";
import { useState } from 'react';
import { apiRequest } from '../../services/api';
export interface Discount {
  id: string; code: string; type: 'percentage' | 'fixed'; value: number; minimumAmount: number;
  maximumAmount: number | null; maximumDiscount: number | null; startsAt: string; endsAt: string;
  usageLimit: number | null; usedCount: number; enabled: boolean;
}
const localTime = (date: Date) => new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
export function DiscountForm({ coupon, lang, onSaved, onClose }: { coupon: Discount | null; lang: string; onSaved: () => void; onClose: () => void }) {
  const fa = lang === 'fa';
  const [values, setValues] = useState({ code: coupon?.code || '', type: coupon?.type || 'percentage', value: String(coupon?.value || 10), minimumAmount: String(coupon?.minimumAmount || 0),
    maximumAmount: coupon?.maximumAmount?.toString() || '', maximumDiscount: coupon?.maximumDiscount?.toString() || '', usageLimit: coupon?.usageLimit?.toString() || '',
    startsAt: localTime(coupon ? new Date(coupon.startsAt) : new Date()), endsAt: localTime(coupon ? new Date(coupon.endsAt) : new Date(Date.now() + 7 * 86400000)), enabled: coupon?.enabled ?? true });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const change = (key: string, value: string | boolean) => setValues(current => ({ ...current, [key]: value }));
  const save = async (event: React.FormEvent) => {
    event.preventDefault(); setSaving(true); setError('');
    try {
      await apiRequest(`/api/admin/discounts${coupon ? `/${coupon.id}` : ''}`, { authenticated: true, method: coupon ? 'PUT' : 'POST', body: {
        ...values, value: Number(values.value), minimumAmount: Number(values.minimumAmount), maximumAmount: values.maximumAmount ? Number(values.maximumAmount) : null,
        maximumDiscount: values.maximumDiscount ? Number(values.maximumDiscount) : null, usageLimit: values.usageLimit ? Number(values.usageLimit) : null,
        startsAt: new Date(values.startsAt).toISOString(), endsAt: new Date(values.endsAt).toISOString(),
      } }); onSaved();
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not save coupon'); }
    finally { setSaving(false); }
  };
  const fields = [
    { key: 'value', label: fa ? 'مقدار تخفیف' : 'Discount value', required: true, min: 0.01, step: values.type === 'percentage' ? 0.01 : 1, max: values.type === 'percentage' ? 100 : 100000000 },
    { key: 'minimumAmount', label: fa ? 'حداقل خرید (تومان)' : 'Minimum order (toman)', required: true, min: 0, step: 1 },
    { key: 'maximumAmount', label: fa ? 'حداکثر خرید (اختیاری)' : 'Maximum order (optional)', min: 0, step: 1 },
    { key: 'maximumDiscount', label: fa ? 'سقف تخفیف (تومان، اختیاری)' : 'Discount cap (toman, optional)', min: 0, step: 1 },
    { key: 'usageLimit', label: fa ? 'حد استفاده (اختیاری)' : 'Usage limit (optional)', min: 1, step: 1 },
  ];
  return <form onSubmit={save} className="bg-white border p-6 mb-6"><h2 className="font-serif text-xl mb-5">{coupon ? (fa ? 'ویرایش کد' : 'Edit coupon') : fa ? 'کد تخفیف جدید' : 'New coupon'}</h2>
    {error && <p role="alert" className="p-4 bg-red-50 mb-4">{error}</p>}
    <fieldset disabled={saving} className="grid sm:grid-cols-2 gap-4">
      <label className="text-sm">{fa ? 'کد' : 'Code'}<input required maxLength={40} pattern="[A-Za-z0-9_-]+" disabled={Boolean(coupon)} value={values.code} onChange={event => change('code', event.target.value.toUpperCase())} dir="ltr" className="mt-2 border p-3 w-full" /></label>
      <label className="text-sm">{fa ? 'نوع' : 'Type'}<select value={values.type} onChange={event => change('type', event.target.value)} className="mt-2 border p-3 w-full"><option value="percentage">{fa ? 'درصدی' : 'Percentage'}</option><option value="fixed">{fa ? 'مبلغ ثابت (تومان)' : 'Fixed amount (toman)'}</option></select></label>
      {fields.map(field => <label key={field.key} className="text-sm">{field.label}<input type="number" required={field.required} min={field.min} max={field.max} step={field.step} value={values[field.key as keyof typeof values] as string} onChange={event => change(field.key, event.target.value)} className="mt-2 border p-3 w-full" /></label>)}
      <label className="text-sm">{fa ? 'شروع' : 'Starts'}<input type="datetime-local" required value={values.startsAt} onChange={event => change('startsAt', event.target.value)} className="mt-2 border p-3 w-full" /></label>
      <label className="text-sm">{fa ? 'پایان' : 'Ends'}<input type="datetime-local" required value={values.endsAt} onChange={event => change('endsAt', event.target.value)} className="mt-2 border p-3 w-full" /></label>
      <label className="text-sm flex items-center gap-3"><input type="checkbox" checked={values.enabled} onChange={event => change('enabled', event.target.checked)} />{fa ? 'فعال' : 'Enabled'}</label>
    </fieldset><div className="flex gap-3 mt-6"><button disabled={saving} className="bg-black text-white px-6 py-3 disabled:opacity-50">{saving ? (fa ? 'ذخیره…' : 'Saving…') : fa ? 'ذخیره' : 'Save'}</button><button type="button" onClick={onClose} className="border px-6 py-3">{fa ? 'بستن' : 'Close'}</button></div>
  </form>;
}
