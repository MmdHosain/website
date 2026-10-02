"use client";
import { localMediaUrl } from '../../services/media';


import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Order, orderService } from '../../services/order.service';
import { AuthModal } from '../auth/AuthModal';
import { checkoutCopy, checkoutError, formatToman } from './copy';
import { useCustomerSession } from './useCustomerSession';

export function OrdersView({ lang, dict }: { lang: string; dict: any }) {
  const session = useCustomerSession();
  const copy = checkoutCopy(lang);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [authOpen, setAuthOpen] = useState(false);
  const [refresh, setRefresh] = useState(0);
  useEffect(() => {
    if (session.loading) return;
    if (!session.user) { setOrders([]); setLoading(false); return; }
    let active = true;
    setLoading(true);
    setOrders([]);
    setError('');
    orderService.list().then(value => { if (active) setOrders(value); }).catch(failure => {
      if (active) setError(checkoutError(failure, lang));
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [session.user?.id, session.loading, refresh, lang, copy.error]);

  return <>
    <h1 className="text-3xl md:text-4xl font-serif mb-10">{copy.orders}</h1>
    {session.loading || loading ? <p role="status">{copy.loading}</p> : !session.user ? <div className="border border-gray-200 p-8 max-w-lg"><p className="mb-6 text-sm text-ariwatch-gray leading-6">{copy.signInHelp}</p><button onClick={() => setAuthOpen(true)} className="bg-ariwatch-black text-white px-8 py-4 text-sm">{copy.signIn}</button></div> : error ? <div role="alert" className="bg-red-50 text-red-800 p-5"><p className="text-sm">{error}</p><button onClick={() => setRefresh(value => value + 1)} className="underline text-sm mt-3">{copy.retry}</button></div> : orders.length === 0 ? <div><p className="text-ariwatch-gray mb-6">{copy.noOrders}</p><Link href={`/${lang}/watches`} className="inline-block border border-black px-8 py-3 text-sm">{copy.browse}</Link></div> : <div className="space-y-6">
      {orders.map(order => <article key={order.id} className="border border-gray-200 p-5 md:p-7">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-5"><div><p className="font-semibold text-sm break-all">{copy.order} <span dir="ltr">#{order.id.slice(0, 8)}</span></p><p className="text-xs text-ariwatch-gray mt-2">{new Date(order.createdAt).toLocaleDateString(lang === 'fa' ? 'fa-IR' : 'en-US')}</p></div><span className={`text-xs px-3 py-2 ${order.paymentReview ? 'bg-amber-50 text-amber-900' : ['paid', 'confirmed', 'shipped'].includes(order.status) ? 'bg-green-50 text-green-800' : 'bg-gray-100'}`}>{order.paymentReview ? copy.paymentReview : copy.statuses[order.status]}</span></div>
        <div className="flex flex-wrap gap-3 mb-5">{order.items.map(item => <div key={item.watchId} className="flex items-center gap-3 bg-gray-50 p-3"><img src={localMediaUrl(item.imageUrl)} alt={item.name} className="w-12 h-12 object-cover" /><p className="text-xs">{item.name}<span className="block text-ariwatch-gray mt-1">{copy.quantity}: {new Intl.NumberFormat(lang === 'fa' ? 'fa-IR' : 'en-US').format(item.quantity)}</span></p></div>)}</div>
        <div className="flex flex-wrap justify-between items-center gap-4 border-t border-gray-100 pt-5"><p className="text-sm font-semibold">{copy.total}: {formatToman(order.total, lang)}</p><Link href={`/${lang}/orders/${encodeURIComponent(order.id)}`} className="text-sm underline underline-offset-4">{order.status === 'pending_payment' ? copy.resume : copy.details}</Link></div>
      </article>)}
    </div>}
    <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} dict={dict} isFa={lang === 'fa'} onSuccess={() => setAuthOpen(false)} />
  </>;
}
