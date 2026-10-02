"use client";
import { useCallback, useEffect, useState } from 'react';
import { apiRequest } from '../../services/api';
import { Discount, DiscountForm } from './DiscountForm';
import { formatPrice } from '../../services/format';
export function AdminDiscounts({ lang }: { lang: string }) {
  const fa = lang === 'fa';
  const [coupons, setCoupons] = useState<Discount[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Discount | null | undefined>();
  const load = useCallback(async () => { setLoading(true); try { setCoupons(await apiRequest<Discount[]>('/api/admin/discounts', { authenticated: true })); } catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not load coupons'); } finally { setLoading(false); } }, []);
  useEffect(() => { void load(); }, [load]);
  return <div><div className="flex flex-wrap justify-between items-center gap-4 mb-6"><h1 className="font-serif text-3xl">{fa ? 'کدهای تخفیف' : 'Coupon codes'}</h1><button type="button" onClick={() => setEditing(null)} className="bg-black text-white px-5 py-3 text-sm">{fa ? 'کد جدید' : 'New coupon'}</button></div>
    {error && <p role="alert" className="bg-red-50 p-4 mb-4">{error}</p>}
    {editing !== undefined && <DiscountForm key={editing?.id || 'new'} coupon={editing} lang={lang} onSaved={() => { setEditing(undefined); void load(); }} onClose={() => setEditing(undefined)} />}
    {loading ? <p>{fa ? 'در حال بارگذاری…' : 'Loading…'}</p> : <div className="space-y-3">{coupons.length === 0 && <p className="bg-white border p-6">{fa ? 'هنوز کدی ثبت نشده است.' : 'No coupon codes yet.'}</p>}{coupons.map(coupon => <article key={coupon.id} className="bg-white border p-5 flex flex-wrap justify-between gap-4"><div><h2 className="font-bold" dir="ltr">{coupon.code}</h2><p className="text-sm mt-2">{coupon.type === 'percentage' ? `${coupon.value}%` : formatPrice(coupon.value, lang)} · {coupon.enabled ? (fa ? 'فعال' : 'Enabled') : fa ? 'غیرفعال' : 'Disabled'}</p><p className="text-xs text-gray-500 mt-2">{new Date(coupon.startsAt).toLocaleString(fa ? 'fa-IR' : 'en-US')} — {new Date(coupon.endsAt).toLocaleString(fa ? 'fa-IR' : 'en-US')}</p><p className="text-sm mt-2">{fa ? 'استفاده:' : 'Used:'} {coupon.usedCount}{coupon.usageLimit ? ` / ${coupon.usageLimit}` : ''}</p></div><button type="button" onClick={() => setEditing(coupon)} className="border px-5 py-2 self-start text-sm">{fa ? 'ویرایش' : 'Edit'}</button></article>)}</div>}
  </div>;
}
