"use client";
import { FormEvent, useEffect, useState } from 'react';
import { useAdminData } from '../../../hooks/useAdminData';
import { apiRequest } from '../../../services/api';
import { watchService } from '../../../services/watch.service';
import { formatPrice } from '../../../services/format';
import { Watch } from '../../../types';

interface Observation { id: string; name: string; storePrice: number; priceToman: number; difference: number; source: string; url: string; observedAt: string; }
export function PriceReports({ lang }: { lang: string }) {
  const fa = lang === 'fa', { data, error, loading, reload } = useAdminData<Observation[]>('/api/admin/prices');
  const [watches, setWatches] = useState<Watch[]>([]), [message, setMessage] = useState(''), [busy, setBusy] = useState(false);
  useEffect(() => { watchService.getAll().then(setWatches).catch(cause => setMessage(cause.message)); }, []);
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = event.currentTarget, fields = new FormData(form); setBusy(true); setMessage('');
    try {
      await apiRequest('/api/admin/prices', { method: 'POST', authenticated: true, body: { watchId: fields.get('watchId'), source: fields.get('source'), url: fields.get('url'), priceToman: Number(fields.get('price')) } });
      form.reset(); await reload(); setMessage(fa ? 'قیمت ثبت شد.' : 'Price recorded.');
    } catch (cause) { setMessage(cause instanceof Error ? cause.message : 'Save failed'); }
    finally { setBusy(false); }
  }
  return <section className="space-y-6"><h1 className="text-3xl font-serif">{fa ? 'گزارش قیمت رقبا' : 'Competitive price report'}</h1>
    <p className="text-sm text-gray-600 leading-7">{fa ? 'قیمت‌های دریافتی از ارائه‌دهنده متصل یا مشاهدات ثبت‌شده را با قیمت فروشگاه مقایسه کنید. زمان ثبت و منبع هر قیمت مشخص است.' : 'Compare connected provider observations and recorded prices with your catalog. Each observation retains its source and timestamp.'}</p>
    {(error || message) && <p role="status" className="p-4 bg-gray-100">{error || message}</p>}
    <form onSubmit={save} className="grid md:grid-cols-2 gap-4 bg-white border p-5">
      <label className="text-sm">{fa ? 'ساعت' : 'Watch'}<select required name="watchId" className="w-full border p-3 mt-2"><option value="">—</option>{watches.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}</select></label>
      <label className="text-sm">{fa ? 'فروشگاه یا منبع' : 'Store or source'}<input required name="source" maxLength={120} className="w-full border p-3 mt-2" /></label>
      <label className="text-sm">{fa ? 'پیوند محصول' : 'Product URL'}<input required name="url" type="url" placeholder="https://" className="w-full border p-3 mt-2" /></label>
      <label className="text-sm">{fa ? 'قیمت به تومان' : 'Price in toman'}<input required name="price" type="number" min={1} max={10_000_000_000} step={1} className="w-full border p-3 mt-2" /></label>
      <button disabled={busy} className="bg-black text-white p-3 disabled:opacity-40">{fa ? 'ثبت مشاهده' : 'Record observation'}</button>
    </form>
    {loading && !data && <p>{fa ? 'در حال بارگذاری…' : 'Loading…'}</p>}
    <div className="overflow-x-auto border bg-white"><table className="w-full text-sm text-start"><thead className="bg-gray-50"><tr>{(fa ? ['ساعت', 'قیمت ما', 'قیمت رقیب', 'اختلاف', 'منبع / زمان'] : ['Watch', 'Our price', 'Observed price', 'Difference', 'Source / time']).map(title => <th key={title} className="p-4 text-start">{title}</th>)}</tr></thead><tbody>
      {data?.map(row => <tr key={row.id} className="border-t"><td className="p-4">{row.name}</td><td className="p-4 whitespace-nowrap">{formatPrice(row.storePrice, lang)}</td><td className="p-4 whitespace-nowrap">{formatPrice(row.priceToman, lang)}</td><td className="p-4 whitespace-nowrap">{formatPrice(row.difference, lang)}</td><td className="p-4"><a href={row.url} target="_blank" rel="noopener noreferrer" className="underline">{row.source}</a><time className="block text-xs text-gray-500 mt-2" dateTime={row.observedAt}>{new Date(row.observedAt).toLocaleString(fa ? 'fa-IR' : 'en-US')}</time></td></tr>)}
      {data?.length === 0 && <tr><td colSpan={5} className="p-8 text-center">{fa ? 'هنوز قیمتی ثبت نشده است.' : 'No price observations yet.'}</td></tr>}
    </tbody></table></div>
  </section>;
}
