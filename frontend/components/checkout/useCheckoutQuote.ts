"use client";
import { useCallback, useEffect, useState } from 'react';
import { CheckoutItem, OrderQuote, orderService } from '../../services/order.service';
import { checkoutError } from './copy';

export function useCheckoutQuote(items: CheckoutItem[], couponCode: string, lang: string) {
  const [quote, setQuote] = useState<OrderQuote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refresh, setRefresh] = useState(0);
  const fingerprint = JSON.stringify({ items, couponCode });
  useEffect(() => {
    let active = true;
    setQuote(null); setError(''); setLoading(true);
    if (!items.length) { setLoading(false); return; }
    orderService.quote(items, couponCode).then(value => { if (active) setQuote(value); })
      .catch(cause => { if (active) setError(checkoutError(cause, lang)); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [fingerprint, refresh, lang]);
  return { quote, loading, error, refresh: useCallback(() => setRefresh(value => value + 1), []) };
}
