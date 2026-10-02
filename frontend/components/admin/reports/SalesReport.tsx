"use client";
import { FormEvent, useState } from 'react';
import { useAdminData } from '../../../hooks/useAdminData';
import { formatPrice } from '../../../services/format';
import { getApiBaseUrl } from '../../../services/api';
import { authService } from '../../../services/auth.service';

interface SalesData {
  summary: { orderCount: number; revenue: number; refundDue: number };
  orders: { id: string; paidAt: string; status: string; total: number; refundDue: number }[];
  products: { watchId: string; name: string; type: string; quantity: number; revenue: number }[];
  truncated?: boolean; orderDisplayLimit?: number;
}
export function SalesReport({ lang }: { lang: string }) {
  const fa = lang === 'fa', [query, setQuery] = useState(''), [exportQuery, setExportQuery] = useState(''), { data, error, loading } = useAdminData<SalesData>(`/api/admin/sales${query}`);
  const [exporting, setExporting] = useState(false), [exportError, setExportError] = useState('');
  function filter(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = new FormData(event.currentTarget), params = new URLSearchParams(), exportParams = new URLSearchParams();
    if (form.get('from')) params.set('from', new Date(`${form.get('from')}T00:00:00`).toISOString());
    if (form.get('to')) params.set('to', new Date(`${form.get('to')}T23:59:59.999`).toISOString());
    if (form.get('from')) exportParams.set('from', String(form.get('from')));
    if (form.get('to')) exportParams.set('to', String(form.get('to')));
    setQuery(params.size ? `?${params}` : '');
    setExportQuery(exportParams.size ? `?${exportParams}` : '');
  }
  async function download() {
    setExporting(true); setExportError('');
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/admin/orders/export${exportQuery}`, { headers: { Authorization: `Bearer ${authService.getToken() || ''}` } });
      if (!response.ok) throw new Error((await response.json()).error || 'Export failed');
      const url = URL.createObjectURL(await response.blob()), link = document.createElement('a'); link.href = url; link.download = 'ariwatch-orders.xlsx'; link.click(); URL.revokeObjectURL(url);
    } catch (cause) { setExportError(cause instanceof Error ? cause.message : 'Export failed'); }
    finally { setExporting(false); }
  }
  return <section className="space-y-6"><h1 className="text-3xl font-serif">{fa ? 'گزارش فروش' : 'Sales report'}</h1>
    <form onSubmit={filter} className="flex flex-wrap items-end gap-4 bg-white border p-5"><label className="text-sm">{fa ? 'از تاریخ' : 'From'}<input name="from" type="date" className="block border p-3 mt-2" /></label><label className="text-sm">{fa ? 'تا تاریخ' : 'To'}<input name="to" type="date" className="block border p-3 mt-2" /></label><button className="bg-black text-white px-5 py-3">{fa ? 'نمایش' : 'Apply'}</button><button type="button" disabled={exporting} onClick={() => void download()} className="border px-5 py-3 disabled:opacity-40">{fa ? 'خروجی اکسل سفارش‌ها' : 'Export orders to Excel'}</button></form>
    {(error || exportError) && <p role="alert" className="p-4 bg-red-50 text-red-700">{error || exportError}</p>}
    {loading && <p role="status">{fa ? 'در حال بارگذاری…' : 'Loading…'}</p>}
    {data && <><div className="grid md:grid-cols-3 gap-4">{[
      [fa ? 'سفارش‌های پرداخت‌شده' : 'Verified orders', data.summary.orderCount],
      [fa ? 'مبلغ فروش' : 'Revenue', formatPrice(data.summary.revenue, lang)],
      [fa ? 'بازپرداخت دستی باقی‌مانده' : 'Manual refunds due', formatPrice(data.summary.refundDue, lang)],
    ].map(([label, value]) => <article className="border bg-white p-5" key={label}><h2 className="text-sm text-gray-600">{label}</h2><p className="text-2xl mt-3">{value}</p></article>)}</div>
      <p className="text-xs text-gray-600">{fa ? 'مبلغ محصولات پیش از کد تخفیف و هزینه ارسال است؛ جمع فروش مبلغ نهایی سفارش‌ها است. خروجی سفارش‌ها بر اساس تاریخ ثبت فیلتر می‌شود.' : 'Product revenue is before coupons and shipping; total revenue uses final order amounts. Order exports filter by creation date.'}</p>
      {data.truncated && <p role="status" className="text-sm">{fa ? 'فقط آخرین سفارش‌های بازه نمایش داده می‌شوند؛ جمع‌ها شامل کل بازه هستند.' : 'Only the latest orders in this period are displayed; summaries cover the entire period.'}</p>}
      <h2 className="text-xl font-serif">{fa ? 'محصولات فروخته‌شده' : 'Products sold'}</h2><div className="overflow-x-auto bg-white border"><table className="w-full text-sm"><thead><tr>{(fa ? ['محصول', 'نوع', 'تعداد', 'مبلغ'] : ['Product', 'Type', 'Quantity', 'Revenue']).map(label => <th key={label} className="p-4 text-start">{label}</th>)}</tr></thead><tbody>{data.products.map(row => <tr key={row.watchId} className="border-t"><td className="p-4">{row.name}</td><td className="p-4">{row.type}</td><td className="p-4">{row.quantity}</td><td className="p-4 whitespace-nowrap">{formatPrice(row.revenue, lang)}</td></tr>)}</tbody></table></div>
      <h2 className="text-xl font-serif">{fa ? 'زمان و مبلغ فروش' : 'Sale times and amounts'}</h2><div className="space-y-2">{data.orders.map(row => <article key={row.id} className="bg-white border p-4 flex flex-wrap justify-between gap-4"><span className="font-mono text-xs">{row.id}</span><time dateTime={row.paidAt}>{new Date(row.paidAt).toLocaleString(fa ? 'fa-IR' : 'en-US')}</time><span>{row.status}</span><strong>{formatPrice(row.total, lang)}</strong></article>)}{!data.orders.length && <p>{fa ? 'فروشی در این بازه ثبت نشده است.' : 'No verified sales in this period.'}</p>}</div>
    </>}
  </section>;
}
