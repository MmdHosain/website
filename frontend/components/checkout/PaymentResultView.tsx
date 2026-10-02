"use client";

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { AuthModal } from '../auth/AuthModal';
import { useCart } from '../../context/CartContext';
import { Order, orderService, trustedPaymentUrl } from '../../services/order.service';
import { ApiError } from '../../services/api';
import { checkoutCopy, checkoutError } from './copy';
import { OrderSummary } from './OrderSummary';
import { useCustomerSession } from './useCustomerSession';
import { abandonCheckoutAttempt, completeCheckoutAttempt, hasCheckoutAttempt } from './storage';

export function PaymentResultView({ lang, dict, orderId, confirmation = true }: { lang: string; dict: any; orderId: string; confirmation?: boolean }) {
  const copy = checkoutCopy(lang);
  const session = useCustomerSession();
  const { isHydrated, consumePurchasedOrder } = useCart();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [authOpen, setAuthOpen] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const [paying, setPaying] = useState(false);
  const paymentLock = useRef(false);
  const paid = order && ['paid', 'confirmed', 'shipped'].includes(order.status);

  useEffect(() => {
    if (session.loading) return;
    if (!session.user || !orderId || orderId.length > 128) { setOrder(null); setLoading(false); return; }
    let active = true;
    setLoading(true);
    setError('');
    setOrder(null);
    orderService.get(orderId).then(value => { if (active) setOrder(value); }).catch(failure => {
      if (active) setError(checkoutError(failure, lang));
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [session.user?.id, session.loading, orderId, refresh, lang, copy.error]);

  useEffect(() => {
    if (order?.status === 'cancelled') { abandonCheckoutAttempt(order.id); return; }
    if (!order || !paid || !isHydrated || !hasCheckoutAttempt(order.id)) return;
    consumePurchasedOrder(order.id, order.items);
    completeCheckoutAttempt(order.id);
  }, [order, paid, isHydrated, consumePurchasedOrder]);

  const resumePayment = async () => {
    if (!order || paymentLock.current) return;
    paymentLock.current = true;
    setPaying(true);
    setError('');
    try {
      const response = await orderService.resumePayment(order.id);
      if (['paid', 'confirmed', 'shipped'].includes(response.order.status)) { setOrder(response.order); setPaying(false); paymentLock.current = false; }
      else window.location.assign(trustedPaymentUrl(response.paymentUrl));
    } catch (failure) {
      if (failure instanceof ApiError && failure.status === 401) setAuthOpen(true);
      setError(checkoutError(failure, lang));
      setPaying(false);
      paymentLock.current = false;
    }
  };

  if (!orderId || orderId.length > 128) return <div className="text-center"><p role="alert" className="mb-8">{copy.missingOrder}</p><Link href={`/${lang}/orders`} className="underline">{copy.orders}</Link></div>;
  if (session.loading || loading) return <p role="status" className="text-center py-12">{copy.loading}</p>;

  return <>
    {!session.user ? <div className="max-w-lg mx-auto text-center border border-gray-200 p-8"><h1 className="text-2xl font-serif mb-4">{copy.signIn}</h1><p className="text-sm text-ariwatch-gray mb-6">{copy.signInHelp}</p><button onClick={() => setAuthOpen(true)} className="bg-ariwatch-black text-white px-8 py-4 text-sm">{copy.signIn}</button></div> : <>
      <h1 className="text-3xl md:text-4xl font-serif mb-5">{confirmation && order ? (order.paymentReview ? copy.paymentReview : paid ? copy.received : copy.pending) : copy.details}</h1>
      {error && <div role="alert" className="bg-red-50 text-red-800 p-4 mb-6 text-sm"><p>{error}</p><button onClick={() => setRefresh(previous => previous + 1)} className="mt-2 underline">{copy.retry}</button></div>}
      {order && <>
        {(confirmation || order.paymentReview) && <p className={`text-sm leading-7 mb-8 ${order.paymentReview ? 'text-amber-900 bg-amber-50 p-4' : 'text-ariwatch-gray'}`}>{order.paymentReview ? copy.reviewHelp : paid ? copy.paidHelp : order.status === 'cancelled' ? copy.cancelledHelp : copy.pendingHelp}</p>}
        <div className="flex flex-wrap items-center gap-4 mb-8"><span className={`px-4 py-2 text-sm ${order.paymentReview ? 'bg-amber-50 text-amber-900' : paid ? 'bg-green-50 text-green-800' : 'bg-gray-100 text-gray-700'}`}>{order.paymentReview ? copy.paymentReview : copy.statuses[order.status]}</span><span dir="ltr" className="text-xs text-ariwatch-gray break-all">{copy.order} #{order.id}</span></div>
        {paid && order.paymentRefId && <p className="text-sm mb-6">{copy.paymentRef}: <span dir="ltr">{order.paymentRefId}</span></p>}
        {order.refundStatus === 'due' && <p role="status" className="bg-amber-50 text-amber-900 p-4 mb-6">{lang === 'fa' ? 'این سفارش لغو شده است. بازپرداخت وجه به‌صورت دستی توسط فروشگاه انجام خواهد شد.' : 'This order was cancelled. The store will arrange your refund manually.'}</p>}
        {order.refundStatus === 'refunded' && <p className="bg-green-50 p-4 mb-6">{lang === 'fa' ? 'فروشگاه انجام بازپرداخت را ثبت کرده است.' : 'The store has recorded your refund as completed.'}</p>}
        <div className="grid md:grid-cols-2 gap-8 items-start">
          <OrderSummary items={order.items} total={order.total} lang={lang} subtotal={order.subtotal} discount={order.discount} shipping={order.shipping} couponCode={order.couponCode} />
          <div className="border border-gray-200 p-6"><h2 className="text-xl font-serif mb-5">{copy.delivery}</h2><p className="text-sm font-semibold">{order.customer.name}</p><p className="text-sm leading-7 whitespace-pre-wrap mt-2">{order.customer.address}</p><p className="text-sm mt-2">{order.customer.city}</p><p className="text-sm mt-2">{copy.postalCode}: <span dir="ltr">{order.customer.postalCode}</span></p>{order.customer.notes && <p className="text-sm text-ariwatch-gray leading-6 mt-4">{copy.notes}: {order.customer.notes}</p>}</div>
        </div>
        <div className="flex flex-wrap items-center gap-4 mt-8">
          {order.status === 'pending_payment' && <button disabled={paying} onClick={() => void resumePayment()} className="bg-ariwatch-black text-white px-8 py-4 text-sm disabled:opacity-50">{paying ? copy.redirecting : copy.resume}</button>}
          {order.paymentReview && <Link href={`/${lang}/concierge`} className="bg-ariwatch-black text-white px-8 py-4 text-sm">{copy.contact}</Link>}
          <Link href={`/${lang}/orders`} className="border border-gray-300 px-8 py-4 text-sm">{copy.orders}</Link>
          <Link href={`/${lang}/cart`} className="text-sm underline underline-offset-4">{copy.backToCart}</Link>
        </div>
      </>}
    </>}
    <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} dict={dict} isFa={lang === 'fa'} onSuccess={() => setAuthOpen(false)} />
  </>;
}
