"use client";
import { FormEvent, useEffect, useState } from 'react';
import { useAdminData } from '../../../hooks/useAdminData';
import { apiRequest } from '../../../services/api';
import { watchService } from '../../../services/watch.service';
import { Watch } from '../../../types';

interface Mapping { id: string; watchId: string; variantId: string | null; externalId: number; name: string; label?: string; }
export function BasalamMappings({ lang }: { lang: string }) {
  const fa = lang === 'fa', { data, error, reload } = useAdminData<Mapping[]>('/api/admin/integrations/basalam/mappings');
  const [watches, setWatches] = useState<Watch[]>([]), [watchId, setWatchId] = useState(''), [variantId, setVariantId] = useState('');
  const [externalId, setExternalId] = useState(''), [message, setMessage] = useState(''), [busy, setBusy] = useState(false);
  useEffect(() => { watchService.getAll().then(setWatches).catch(cause => setMessage(cause.message)); }, []);
  const selected = watches.find(w => w.id === watchId);
  async function save(event: FormEvent) {
    event.preventDefault(); setBusy(true); setMessage('');
    try { await apiRequest('/api/admin/integrations/basalam/mappings', { method: 'PUT', authenticated: true, body: { watchId, variantId: variantId || null, externalId: Number(externalId) } }); await reload(); setMessage(fa ? 'تطبیق ذخیره شد.' : 'Mapping saved.'); }
    catch (cause) { setMessage(cause instanceof Error ? cause.message : 'Save failed'); }
    finally { setBusy(false); }
  }
  async function remove(id: string) {
    setBusy(true); setMessage('');
    try { await apiRequest(`/api/admin/integrations/basalam/mappings/${id}`, { method: 'DELETE', authenticated: true }); await reload(); }
    catch (cause) { setMessage(cause instanceof Error ? cause.message : 'Remove failed'); }
    finally { setBusy(false); }
  }
  return <section className="space-y-6"><h1 className="text-3xl font-serif">{fa ? 'تطبیق محصولات باسلام' : 'Basalam product mapping'}</h1>
    <p className="text-sm leading-7 text-gray-600">{fa ? 'شناسه محصول موجود در غرفه باسلام را به ساعت یا مدل مربوط متصل کنید. قیمت و موجودی این محصولات پس از فعال کردن اتصال همگام می‌شوند.' : 'Connect an existing product in your Basalam shop to its watch or variant. Its price and available stock will sync once the connection is enabled.'}</p>
    {(error || message) && <p role="status" className="p-4 bg-gray-100">{error || message}</p>}
    <form onSubmit={save} className="grid md:grid-cols-4 gap-4 bg-white border p-5">
      <label className="text-sm">{fa ? 'ساعت' : 'Watch'}<select required value={watchId} onChange={event => { setWatchId(event.target.value); setVariantId(''); }} className="w-full border p-3 mt-2"><option value="">—</option>{watches.filter(w => w.category !== 'custom').map(w => <option key={w.id} value={w.id}>{w.name}</option>)}</select></label>
      <label className="text-sm">{fa ? 'مدل' : 'Variant'}<select required={!!selected?.variants?.length} disabled={!selected?.variants?.length} value={variantId} onChange={event => setVariantId(event.target.value)} className="w-full border p-3 mt-2"><option value="">—</option>{selected?.variants?.map(v => <option key={v.id} value={v.id}>{v.label}</option>)}</select></label>
      <label className="text-sm">{fa ? 'شناسه محصول باسلام' : 'Basalam product ID'}<input required type="number" min="1" step="1" value={externalId} onChange={event => setExternalId(event.target.value)} className="w-full border p-3 mt-2" /></label>
      <button disabled={busy} className="bg-black text-white p-3 mt-7 disabled:opacity-40">{fa ? 'ذخیره' : 'Save'}</button>
    </form>
    <div className="space-y-2">{data?.map(row => <article key={row.id} className="flex flex-wrap justify-between gap-4 bg-white border p-4"><span>{row.name} {row.label && `· ${row.label}`} → {row.externalId}</span><button disabled={busy} onClick={() => void remove(row.id)} className="text-red-700 underline">{fa ? 'حذف تطبیق' : 'Remove mapping'}</button></article>)}</div>
  </section>;
}
