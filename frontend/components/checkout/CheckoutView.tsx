"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '../../context/CartContext';
import { AuthModal } from '../auth/AuthModal';
import { CheckoutRequest, OrderCustomer, orderService, trustedPaymentUrl } from '../../services/order.service';
import { ApiError } from '../../services/api';
import { watchService } from '../../services/watch.service';
import { checkoutCopy, checkoutError, normalizeDigits } from './copy';
import { OrderSummary } from './OrderSummary';
import { useCustomerSession } from './useCustomerSession';
import { useCheckoutQuote } from './useCheckoutQuote';
import { abandonCheckoutAttempt, DRAFT_KEY, emptyCustomer, getCheckoutAttempt, readCustomer, requestFingerprint, saveAttemptOrder } from './storage';

export function CheckoutView({ lang, dict }: { lang: string; dict: any }) {
  const { cartItems, isHydrated, refreshCartPrices } = useCart();
  const session = useCustomerSession();
  const router = useRouter();
  const copy = checkoutCopy(lang);
  const [customer, setCustomer] = useState<OrderCustomer>({ ...emptyCustomer });
  const [draftReady, setDraftReady] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogFailed, setCatalogFailed] = useState(false);
  const [availableIds, setAvailableIds] = useState<string[]>([]);
  const [couponDraft, setCouponDraft] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const selectedItems = cartItems.map(item => ({ watchId: item.id, quantity: item.quantity, ...(item.variantId ? { variantId: item.variantId } : {}) }));
  const pricing = useCheckoutQuote(selectedItems, couponCode, lang);
  const currentAttempt = useRef<{ key: string; fingerprint: string } | null>(null);
  const submitLock = useRef(false);
  const cartIds = cartItems.map(item => item.id).sort().join('|');
  const total = pricing.quote?.total ?? cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalUnsupported = !Number.isSafeInteger(total) || total < 1000 || total > 100_000_000;
  const unavailable = cartItems.some(item => !availableIds.includes(item.id));

  const refreshCatalog = useCallback(async () => {
    setCatalogLoading(true);
    try {
      const watches = await watchService.getAll();
      refreshCartPrices(watches);
      setAvailableIds(watches.filter(watch => watch.category !== 'custom').map(watch => watch.id));
      setCatalogFailed(false);
    } catch (failure) { setCatalogFailed(true); setError(checkoutError(failure, lang)); }
    finally { setCatalogLoading(false); }
  }, [refreshCartPrices, lang]);
  useEffect(() => { if (isHydrated && cartIds) void refreshCatalog(); else if (isHydrated) setCatalogLoading(false); }, [isHydrated, cartIds, refreshCatalog]);

  useEffect(() => { setCustomer(readCustomer()); setDraftReady(true); }, []);
  useEffect(() => {
    if (!draftReady) return;
    try { sessionStorage.setItem(DRAFT_KEY, JSON.stringify(customer)); } catch { /* Checkout works when storage is unavailable. */ }
  }, [customer, draftReady]);

  const update = (field: keyof OrderCustomer, value: string) => setCustomer(previous => ({ ...previous, [field]: value }));
  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitLock.current || cartItems.length === 0 || catalogLoading || catalogFailed || unavailable || totalUnsupported || pricing.loading || !pricing.quote) return;
    if (!session.user) { setAuthOpen(true); return; }
    const normalized = Object.fromEntries(Object.entries(customer).map(([key, value]) => [key, value.trim()])) as unknown as OrderCustomer;
    normalized.postalCode = normalizeDigits(normalized.postalCode);
    if (!/^\d{10}$/.test(normalized.postalCode)) { setError(copy.invalidPostal); return; }
    if (normalized.address.length < 10) { setError(copy.invalidAddress); return; }
    const request: CheckoutRequest = { items: selectedItems, customer: normalized, lang, expectedTotal: total, couponCode: pricing.quote.couponCode };
    const fingerprint = requestFingerprint(request);
    if (currentAttempt.current?.fingerprint !== fingerprint) currentAttempt.current = getCheckoutAttempt(request);
    submitLock.current = true;
    setSubmitting(true);
    setError('');
    try {
      const response = await orderService.create(request, currentAttempt.current.key);
      saveAttemptOrder(currentAttempt.current.key, response.order.id);
      if (['paid', 'confirmed', 'shipped'].includes(response.order.status)) {
        router.push(`/${lang}/checkout/result?orderId=${encodeURIComponent(response.order.id)}`);
      } else window.location.assign(trustedPaymentUrl(response.paymentUrl));
    } catch (failure) {
      if (failure instanceof ApiError && failure.status === 401) setAuthOpen(true);
      if (failure instanceof ApiError && failure.status === 409 && /cancelled/i.test(failure.message) && currentAttempt.current) {
        abandonCheckoutAttempt(currentAttempt.current.key);
        currentAttempt.current = null;
      }
      setError(checkoutError(failure, lang));
      if (failure instanceof ApiError && failure.status === 409) { await refreshCatalog(); pricing.refresh(); }
      setSubmitting(false);
      submitLock.current = false;
    }
  };

  if (!isHydrated || session.loading || !draftReady || catalogLoading) return <p role="status" className="text-center py-12">{copy.loading}</p>;
  if (cartItems.length === 0) return <div className="text-center"><h1 className="text-3xl font-serif mb-6">{copy.title}</h1><p className="mb-8 text-ariwatch-gray">{copy.empty}</p><Link href={`/${lang}/watches`} className="inline-block border border-black px-8 py-3">{copy.browse}</Link></div>;

  return <>
    <div className="flex items-center justify-between gap-4 mb-10"><h1 className="text-3xl md:text-4xl font-serif">{copy.title}</h1><Link className="text-sm underline underline-offset-4" href={`/${lang}/cart`}>{copy.backToCart}</Link></div>
    {session.sessionError && <p role="alert" className="mb-6 bg-red-50 p-4 text-sm text-red-800">{copy.error} <button onClick={() => void session.refresh()} className="underline">{copy.retry}</button></p>}
    {catalogFailed && <p role="alert" className="mb-6 bg-red-50 p-4 text-sm text-red-800">{copy.error} <button onClick={() => void refreshCatalog()} className="underline">{copy.retry}</button></p>}
    {unavailable && !catalogFailed && <p role="alert" className="mb-6 bg-red-50 p-4 text-sm text-red-800">{copy.unavailable}</p>}
    {totalUnsupported && <div role="alert" className="mb-6 bg-amber-50 p-4 text-sm text-amber-900"><p className="leading-6">{copy.paymentLimit}</p><Link href={`/${lang}/concierge`} className="inline-block mt-3 underline underline-offset-4">{copy.contact}</Link></div>}
    <div className="grid lg:grid-cols-[1.3fr_1fr] gap-10 items-start">
      {session.user ? <form onSubmit={submit} className="space-y-6">
        <h2 className="text-xl font-serif">{copy.delivery}</h2>
        <fieldset disabled={submitting} className="grid sm:grid-cols-2 gap-5 disabled:opacity-60">
          <label className="text-sm space-y-2"><span className="block">{copy.name}</span><input required minLength={2} maxLength={120} autoComplete="name" value={customer.name} onChange={event => update('name', event.target.value)} className="w-full border border-gray-300 p-3 focus:outline-none focus:border-ariwatch-red" /></label>
          <label className="text-sm space-y-2"><span className="block">{copy.email}</span><input type="email" maxLength={254} autoComplete="email" dir="ltr" value={customer.email} onChange={event => update('email', event.target.value)} className="w-full border border-gray-300 p-3 focus:outline-none focus:border-ariwatch-red" /></label>
          <label className="text-sm space-y-2"><span className="block">{copy.city}</span><input required minLength={2} maxLength={120} autoComplete="address-level2" value={customer.city} onChange={event => update('city', event.target.value)} className="w-full border border-gray-300 p-3 focus:outline-none focus:border-ariwatch-red" /></label>
          <label className="text-sm space-y-2"><span className="block">{copy.postalCode}</span><input required inputMode="numeric" maxLength={10} autoComplete="postal-code" dir="ltr" value={customer.postalCode} onChange={event => update('postalCode', normalizeDigits(event.target.value))} className="w-full border border-gray-300 p-3 focus:outline-none focus:border-ariwatch-red" /></label>
          <label className="sm:col-span-2 text-sm space-y-2"><span className="block">{copy.address}</span><textarea required minLength={10} maxLength={1000} rows={3} autoComplete="street-address" value={customer.address} onChange={event => update('address', event.target.value)} className="w-full border border-gray-300 p-3 focus:outline-none focus:border-ariwatch-red" /></label>
          <label className="sm:col-span-2 text-sm space-y-2"><span className="block">{copy.notes}</span><textarea maxLength={1000} rows={2} value={customer.notes} onChange={event => update('notes', event.target.value)} className="w-full border border-gray-300 p-3 focus:outline-none focus:border-ariwatch-red" /></label>
        </fieldset>
        {error && <p role="alert" className="bg-red-50 p-4 text-sm text-red-800">{error}</p>}
        <div className="border-t border-gray-200 pt-5"><label className="text-sm block mb-2" htmlFor="coupon">{lang === 'fa' ? 'کد تخفیف' : 'Coupon code'}</label><div className="flex gap-2"><input id="coupon" dir="ltr" maxLength={40} value={couponDraft} onChange={event => setCouponDraft(event.target.value.toUpperCase())} className="border p-3 min-w-0 flex-1" /><button type="button" disabled={submitting || pricing.loading} onClick={() => setCouponCode(couponDraft.trim())} className="border px-4 text-sm">{lang === 'fa' ? 'اعمال' : 'Apply'}</button>{couponCode && <button type="button" onClick={() => { setCouponCode(''); setCouponDraft(''); }} className="text-sm underline">{lang === 'fa' ? 'حذف' : 'Remove'}</button>}</div></div>
        {pricing.error && <p role="alert" className="bg-red-50 p-4 text-sm text-red-800">{pricing.error}</p>}
        {pricing.loading && <p role="status" className="text-sm">{lang === 'fa' ? 'محاسبه مبلغ و موجودی…' : 'Checking prices and stock…'}</p>}
        <div className="border-t border-gray-200 pt-5"><h3 className="font-semibold text-sm mb-2">{copy.payment}</h3><p className="text-sm text-ariwatch-gray leading-6">{copy.paymentHelp}</p></div>
        <button type="submit" disabled={submitting || catalogFailed || unavailable || totalUnsupported || pricing.loading || !pricing.quote} className="w-full bg-ariwatch-black text-white px-8 py-4 text-sm disabled:opacity-50">{submitting ? copy.redirecting : copy.pay}</button>
      </form> : <div className="border border-gray-200 p-8"><h2 className="text-xl font-serif mb-4">{copy.signIn}</h2><p className="text-sm text-ariwatch-gray leading-6 mb-6">{copy.signInHelp}</p><button onClick={() => setAuthOpen(true)} className="w-full bg-ariwatch-black text-white p-4 text-sm">{copy.signIn}</button></div>}
      <OrderSummary lang={lang} items={pricing.quote?.items ?? cartItems.map(item => ({ ...item, watchId: item.id }))} total={total} subtotal={pricing.quote?.subtotal} shipping={pricing.quote?.shipping} discount={pricing.quote?.discount} couponCode={pricing.quote?.couponCode} />
    </div>
    <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} dict={dict} isFa={lang === 'fa'} onSuccess={() => setAuthOpen(false)} />
  </>;
}
