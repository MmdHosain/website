"use client";

import { useCallback, useEffect, useState } from "react";
import { apiRequest } from "../../services/api";
import { formatPrice } from "../../services/format";
import { downloadOrders } from "../../services/admin-export";

type OrderStatus = "pending_payment" | "paid" | "confirmed" | "shipped" | "cancelled";
interface Order {
  id: string;
  customer: { name: string; email: string; address: string; city: string; postalCode: string; notes?: string };
  items: { watchId: string; name: string; price: number; quantity: number }[];
  total: number;
  currency: string;
  status: OrderStatus;
  createdAt: string;
  customerMobile?: string;
  paymentRefId?: string | null;
  paymentReview: boolean;
  paymentReferences?: string[];
  subtotal: number;
  discount: number;
  shipping: number;
  paidAt?: string | null;
  refundDue: number;
  refundStatus: 'none' | 'due' | 'refunded';
}

const transitions: Record<OrderStatus, OrderStatus[]> = {
  pending_payment: ["cancelled"],
  paid: ["confirmed", "cancelled"],
  confirmed: ["shipped", "cancelled"],
  shipped: [],
  cancelled: [],
};

export function AdminOrders({ lang }: { lang: string }) {
  const isFa = lang === "fa";
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const labels: Record<OrderStatus, string> = isFa ? {
    pending_payment: "در انتظار پرداخت", paid: "پرداخت شده", confirmed: "تأیید شده", shipped: "ارسال شده", cancelled: "لغو شده",
  } : { pending_payment: "Pending payment", paid: "Paid", confirmed: "Confirmed", shipped: "Shipped", cancelled: "Cancelled" };

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try { setOrders(await apiRequest<Order[]>("/api/admin/orders", { authenticated: true })); }
    catch (cause) { setError(cause instanceof Error ? cause.message : (isFa ? "بارگذاری سفارش‌ها انجام نشد." : "Could not load orders.")); }
    finally { setLoading(false); }
  }, [isFa]);

  useEffect(() => { void load(); }, [load]);

  const updateStatus = async (order: Order, status: OrderStatus) => {
    if (status === "cancelled" && !window.confirm(isFa ? "سفارش لغو و موجودی آزاد شود؟ بازپرداخت سفارش پرداخت‌شده باید دستی انجام شود." : "Cancel and restore inventory? A paid order will require a manual refund.")) return;
    setSaving(order.id);
    setError("");
    setNotice("");
    try {
      const updated = await apiRequest<Order>(`/api/admin/orders/${encodeURIComponent(order.id)}`, { method: "PATCH", authenticated: true, body: { status } });
      setOrders((current) => current.map((item) => item.id === order.id ? { ...item, ...updated } : item));
      setNotice(status === "cancelled" && updated.status === "paid"
        ? (isFa ? "پرداخت این سفارش تأیید شد. سفارش را برای ارسال بررسی کنید." : "Payment was verified for this order. Review the paid order for fulfillment.")
        : (isFa ? "وضعیت سفارش به‌روز شد." : "Order status updated."));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : (isFa ? "به‌روزرسانی سفارش انجام نشد." : "Could not update the order."));
    } finally { setSaving(null); }
  };
  const finishRefund = async (order: Order) => {
    const reference = window.prompt(isFa ? 'شماره پیگیری بازپرداخت انجام‌شده را وارد کنید:' : 'Enter the reference for the refund you have completed:');
    if (!reference) return;
    setSaving(order.id); setError('');
    try { const updated = await apiRequest<Order>(`/api/admin/orders/${order.id}/refund-completed`, { method: 'POST', authenticated: true, body: { reference } }); setOrders(current => current.map(item => item.id === order.id ? { ...item, ...updated } : item)); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not record refund'); }
    finally { setSaving(null); }
  };

  return (
    <div>
      <div className="flex justify-between items-center gap-4 mb-6">
        <h1 className="font-serif text-3xl">{isFa ? "سفارش‌ها" : "Orders"}</h1>
        <button type="button" onClick={() => void downloadOrders().catch(cause => setError(cause.message))} className="border bg-white px-4 py-2 text-xs">{isFa ? 'خروجی اکسل' : 'Export Excel'}</button>
        <button type="button" disabled={loading || saving !== null} onClick={() => void load()} className="border border-gray-300 bg-white px-4 py-2 text-xs font-bold disabled:opacity-50">{isFa ? "تازه‌سازی" : "Refresh"}</button>
      </div>
      <p className="text-sm text-gray-500 mb-6">{isFa ? "پرداخت از طریق زرین‌پال تأیید می‌شود. سفارش‌های پرداخت شده را تأیید و پس از ارسال، وضعیت را به‌روز کنید." : "Payments are verified through Zarinpal. Confirm paid orders, then update them when shipped."}</p>
      {error && <div role="alert" className="p-4 mb-4 bg-red-50 text-red-700 text-sm">{error}</div>}
      {notice && <div role="status" className="p-4 mb-4 bg-green-50 text-green-800 text-sm">{notice}</div>}
      {loading ? <p role="status" className="p-8 text-gray-500">{isFa ? "در حال بارگذاری…" : "Loading orders…"}</p> :
        orders.length === 0 && !error ? <p className="p-8 bg-white border border-gray-200 text-gray-500">{isFa ? "هنوز سفارشی ثبت نشده است." : "No orders yet."}</p> :
          <div className="space-y-5">
            {orders.map((order) => (
              <article key={order.id} className="bg-white border border-gray-200 p-5 md:p-6">
                <div className="flex flex-wrap justify-between gap-4 items-start">
                  <div>
                    <h2 className="font-bold text-sm">{order.customer.name}</h2>
                    {order.customerMobile && <a href={`tel:${order.customerMobile}`} dir="ltr" className="inline-block mt-1 text-sm text-gray-600 underline">{order.customerMobile}</a>}
                    <p className="font-mono text-xs text-gray-500 mt-1 break-all" dir="ltr">{order.id}</p>
                    <time dateTime={order.createdAt} className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleString(isFa ? "fa-IR" : "en-US", { timeZone: "Asia/Tehran" })}</time>
                  </div>
                  <div className="text-end">
                    <span className={`inline-block px-3 py-1 text-xs rounded ${order.status === "paid" || order.status === "confirmed" || order.status === "shipped" ? "bg-green-50 text-green-800" : "bg-gray-100 text-gray-600"}`}>{labels[order.status]}</span>
                    <p className="mt-2 font-bold text-sm">{formatPrice(order.total, lang)}</p>
                  </div>
                </div>
                {order.paymentReview && (
                  <div role="alert" className="mt-5 border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                    <p className="font-bold">{isFa ? "پرداخت نیاز به بررسی دارد" : "Payment review required"}</p>
                    <p className="mt-1 leading-6">{isFa ? "چند پرداخت برای این سفارش تأیید شده است. پیش از تأیید یا ارسال سفارش، مبالغ و استرداد وجه را با مشتری بررسی کنید." : "Multiple payments were verified for this order. Contact the customer and reconcile the payments or refund before confirming or shipping."}</p>
                    {(order.paymentReferences || []).length > 0 && <p className="mt-2 break-all">{isFa ? "شماره‌های پیگیری: " : "Payment references: "}<span dir="ltr">{order.paymentReferences!.join(", ")}</span></p>}
                  </div>
                )}
                {order.refundStatus === 'due' && <div className="mt-4 bg-amber-50 p-4 text-sm"><p>{isFa ? 'بازپرداخت دستی لازم:' : 'Manual refund due:'} {formatPrice(order.refundDue, lang)}</p><button type="button" disabled={Boolean(saving)} onClick={() => void finishRefund(order)} className="mt-3 underline">{isFa ? 'ثبت بازپرداخت انجام‌شده' : 'Record completed refund'}</button></div>}
                {order.refundStatus === 'refunded' && <p className="mt-4 text-sm text-green-700">{isFa ? 'بازپرداخت ثبت شده است.' : 'Refund recorded as completed.'}</p>}
                <details className="mt-5 border-t border-gray-100 pt-4">
                  <summary className="cursor-pointer text-sm font-bold">{isFa ? "محصولات و اطلاعات ارسال" : "Items & delivery details"}</summary>
                  <ul className="mt-4 space-y-2">
                    {order.items.map((item, index) => (
                      <li key={`${item.watchId}-${index}`} className="flex justify-between flex-wrap gap-2 text-sm">
                        <span>{item.name} × {item.quantity.toLocaleString(isFa ? "fa-IR" : "en-US")}</span><span>{formatPrice(item.price * item.quantity, lang)}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-4 text-sm">{isFa ? 'جمع محصولات / تخفیف / ارسال:' : 'Subtotal / discount / shipping:'} {formatPrice(order.subtotal, lang)} / {formatPrice(order.discount, lang)} / {formatPrice(order.shipping, lang)}</p>
                  <div className="mt-5 pt-4 border-t border-gray-100 text-sm text-gray-600 space-y-2">
                    {order.customer.email && <p><a href={`mailto:${order.customer.email}`} className="underline" dir="ltr">{order.customer.email}</a></p>}
                    <p>{order.customer.address}, {order.customer.city}</p>
                    <p>{isFa ? "کد پستی: " : "Postal code: "}<span dir="ltr">{order.customer.postalCode}</span></p>
                    {order.customer.notes && <p className="whitespace-pre-wrap">{order.customer.notes}</p>}
                    {order.paymentRefId && <p>{isFa ? "شماره پیگیری پرداخت: " : "Payment reference: "}<span dir="ltr">{order.paymentRefId}</span></p>}
                  </div>
                </details>
                {(transitions[order.status] || []).length > 0 && (
                  <div className="mt-5 flex flex-wrap gap-3 border-t border-gray-100 pt-4">
                    {transitions[order.status].map((status) => (
                      <button key={status} type="button" disabled={saving !== null || order.paymentReview} onClick={() => void updateStatus(order, status)} className={`px-4 py-2 text-xs font-bold disabled:opacity-50 ${status === "cancelled" ? "border border-red-200 text-red-700 hover:bg-red-50" : "bg-ariwatch-black text-white hover:bg-black"}`}>
                        {saving === order.id ? (isFa ? "در حال ذخیره…" : "Saving…") : status === "confirmed" ? (isFa ? "تأیید سفارش" : "Confirm order") : status === "shipped" ? (isFa ? "ثبت ارسال" : "Mark shipped") : (isFa ? "لغو سفارش" : "Cancel order")}
                      </button>
                    ))}
                  </div>
                )}
              </article>
            ))}
          </div>
      }
    </div>
  );
}
