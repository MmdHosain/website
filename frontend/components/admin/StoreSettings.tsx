"use client";

import { useCallback, useEffect, useState } from 'react';
import { apiRequest } from '../../services/api';
import { HeroSettingsForm, type HeroStyle } from './HeroSettingsForm';
import { ShippingSettingsForm } from './ShippingSettingsForm';

interface Settings { shippingCost: number; heroStyle: HeroStyle; }

export function StoreSettings({ lang }: { lang: string }) {
  const fa = lang === 'fa';
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const value = await apiRequest<Settings>('/api/admin/settings', { authenticated: true });
      setSettings({ ...value, heroStyle: value.heroStyle === 'classic-clock' ? 'classic-clock' : 'watch-photos' });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : fa ? 'بارگذاری تنظیمات انجام نشد.' : 'Could not load settings.');
    } finally { setLoading(false); }
  }, [fa]);
  useEffect(() => { void load(); }, [load]);

  return <div className="max-w-4xl">
    <h1 className="text-3xl font-serif mb-6">{fa ? 'تنظیمات فروشگاه' : 'Store settings'}</h1>
    {loading ? <p role="status">{fa ? 'در حال بارگذاری…' : 'Loading…'}</p> : error ?
      <div className="border bg-white p-6">
        <p role="alert" className="text-red-700">{error}</p>
        <button type="button" onClick={() => void load()} className="mt-4 bg-black text-white px-5 py-3">
          {fa ? 'تلاش دوباره' : 'Try again'}
        </button>
      </div> : settings && <div className="grid gap-6">
        <HeroSettingsForm initialStyle={settings.heroStyle} fa={fa} />
        <ShippingSettingsForm initialCost={settings.shippingCost} fa={fa} />
      </div>}
  </div>;
}
