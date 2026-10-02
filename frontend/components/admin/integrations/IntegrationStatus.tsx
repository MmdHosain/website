"use client";
import { useState } from 'react';
import Link from 'next/link';
import { useAdminData } from '../../../hooks/useAdminData';
import { apiRequest } from '../../../services/api';

interface Status {
  providers: { provider: string; configured: boolean; status: string; last_success_at?: string; last_error?: string }[];
  notifications: { status: string; count: number }[];
  smsConfigured: boolean; telegramConfigured: boolean; torobConfigured: boolean;
}
export function IntegrationStatus({ lang }: { lang: string }) {
  const fa = lang === 'fa', { data, error, loading, reload } = useAdminData<Status>('/api/admin/integrations');
  const [busy, setBusy] = useState(''), [message, setMessage] = useState('');
  async function act(path: string) {
    setBusy(path); setMessage('');
    try { await apiRequest(path, { method: 'POST', authenticated: true }); setMessage(fa ? 'عملیات انجام شد.' : 'Operation completed.'); await reload(); }
    catch (cause) { setMessage(cause instanceof Error ? cause.message : 'Operation failed'); }
    finally { setBusy(''); }
  }
  return <section className="space-y-6">
    <h1 className="text-3xl font-serif">{fa ? 'اتصال‌ها و اعلان‌ها' : 'Integrations and notifications'}</h1>
    <p className="text-sm text-gray-600 leading-7">{fa ? 'اتصال‌ها پس از تنظیم حساب و کلیدهای سرور فعال می‌شوند. این صفحه وضعیت همگام‌سازی و صف اعلان‌ها را نشان می‌دهد.' : 'Connections become available after account credentials are configured on the server. This page shows sync status and notification delivery.'}</p>
    {(error || message) && <p role="status" className="p-4 bg-gray-100 break-words">{error || message}</p>}
    {loading && !data && <p>{fa ? 'در حال بارگذاری…' : 'Loading…'}</p>}
    <div className="grid md:grid-cols-3 gap-4">{data?.providers.map(provider => <article key={provider.provider} className="bg-white border p-5 space-y-3">
      <h2 className="font-bold capitalize">{provider.provider === 'prices' ? (fa ? 'قیمت‌های رقبا' : 'Competitive prices') : provider.provider}</h2>
      <p className="text-sm">{provider.configured ? (fa ? 'پیکربندی شده' : 'Configured') : (fa ? 'نیاز به پیکربندی' : 'Needs configuration')}</p>
      {provider.last_success_at && <p className="text-xs text-gray-600">{new Date(provider.last_success_at).toLocaleString(fa ? 'fa-IR' : 'en-US')}</p>}
      {provider.last_error && <p className="text-sm text-red-700">{fa ? 'همگام‌سازی ناموفق؛ تنظیمات اتصال را بررسی کنید.' : provider.last_error}</p>}
      <button disabled={!provider.configured || !!busy} onClick={() => void act(`/api/admin/integrations/${provider.provider}/sync`)} className="bg-black text-white px-4 py-2 text-sm disabled:opacity-40">{fa ? 'همگام‌سازی' : 'Sync now'}</button>
    </article>)}</div>
    <div className="bg-white border p-5 space-y-3 text-sm">
      <p>{fa ? 'پیامک اعلان:' : 'Notification SMS:'} {data?.smsConfigured ? (fa ? 'آماده' : 'Ready') : (fa ? 'تنظیم نشده' : 'Not configured')}</p>
      <p>{fa ? 'ربات تلگرام:' : 'Telegram bot:'} {data?.telegramConfigured ? (fa ? 'آماده' : 'Ready') : (fa ? 'تنظیم نشده' : 'Not configured')}</p>
      <p>{fa ? 'خوراک ترب:' : 'Torob feed:'} {data?.torobConfigured ? (fa ? 'فعال' : 'Enabled') : (fa ? 'تنظیم نشده' : 'Not configured')}</p>
      <div className="flex flex-wrap gap-4">{data?.notifications.map(row => <span key={row.status}>{row.status}: {row.count}</span>)}</div>
      <div className="flex flex-wrap gap-4"><button disabled={!!busy || !data?.telegramConfigured} className="underline disabled:opacity-40" onClick={() => void act('/api/admin/integrations/telegram/register')}>{fa ? 'ثبت وب‌هوک تلگرام' : 'Register Telegram webhook'}</button>
        <button disabled={!!busy || !(data?.smsConfigured || data?.telegramConfigured)} className="underline disabled:opacity-40" onClick={() => void act('/api/admin/integrations/notifications/retry')}>{fa ? 'پردازش صف اعلان' : 'Process notification queue'}</button>
        <button disabled={!!busy} className="underline" onClick={() => void reload()}>{fa ? 'تازه‌سازی' : 'Refresh'}</button></div>
    </div>
    <Link className="inline-block underline" href={`/${lang}/admin/integrations/basalam`}>{fa ? 'تطبیق محصولات باسلام' : 'Map Basalam products'}</Link>
  </section>;
}
