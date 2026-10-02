"use client";

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { apiRequest } from '../../services/api';
import { HERO_SLIDES } from '../home/hero/hero.data';
import type { HeroStyle } from '../../services/store-settings';

export type { HeroStyle } from '../../services/store-settings';

export function HeroSettingsForm({ initialStyle, fa }: { initialStyle: HeroStyle; fa: boolean }) {
  const router = useRouter();
  const [style, setStyle] = useState<HeroStyle>(initialStyle);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const choices: { value: HeroStyle; title: string; detail: string }[] = [
    { value: 'watch-photos', title: fa ? 'عکس ساعت‌ها' : 'Watch photos', detail: fa ? 'نمایش عکس واقعی پنج ساعت — طرح فعلی' : 'Real photos of five watches — current design' },
    { value: 'classic-clock', title: fa ? 'ساعت کلاسیک' : 'Classic clock', detail: fa ? 'نمای ساعت گرد با سایه‌های ملایم — طرح قبلی' : 'Abstract round clock with soft shadows — previous design' },
  ];
  const save = async (event: FormEvent) => {
    event.preventDefault();
    if (saving) return;
    setSaving(true); setError(''); setNotice('');
    try {
      await apiRequest('/api/admin/settings', { method: 'PUT', authenticated: true, body: { heroStyle: style } });
      router.refresh();
      setNotice(fa ? 'طرح صفحه اصلی ذخیره شد.' : 'Homepage style saved.');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : fa ? 'ذخیره انجام نشد.' : 'Could not save.');
    } finally { setSaving(false); }
  };
  return <form onSubmit={save} aria-busy={saving} className="bg-white border p-6">
    <fieldset disabled={saving}>
      <legend className="font-serif text-xl mb-3">{fa ? 'بخش اصلی صفحه خانه' : 'Homepage hero'}</legend>
      <p className="text-sm text-gray-600 leading-7 mb-5">{fa ? 'طرح بالای صفحه اصلی را انتخاب کنید. این تنظیم برای همه بازدیدکنندگان اعمال می‌شود.' : 'Choose the design at the top of the homepage. This setting applies to every visitor.'}</p>
      <div className="grid sm:grid-cols-2 gap-4">
        {choices.map(choice => <label key={choice.value} className={`cursor-pointer border p-4 flex flex-col gap-3 ${style === choice.value ? 'border-ariwatch-red ring-1 ring-ariwatch-red' : 'border-gray-200'} ${saving ? 'opacity-60 cursor-wait' : ''}`}>
          <div aria-hidden="true" className="h-32 bg-[#f6f5f0] flex justify-center items-center overflow-hidden">
            {choice.value === 'watch-photos' ? <img src={HERO_SLIDES[0].imageUrl} alt="" className="h-28 w-24 object-contain" /> :
              <div className="relative w-24 h-24 rounded-full border border-[#d6d1c7] bg-[#f6f5f0] shadow-[6px_6px_12px_#ddd9d0,-6px_-6px_12px_#fff]">
                <span className="absolute top-2 left-1/2 h-2 w-px bg-gray-400" />
                <span className="absolute bottom-2 left-1/2 h-2 w-px bg-gray-400" />
                <span className="absolute left-2 top-1/2 w-2 h-px bg-gray-400" />
                <span className="absolute right-2 top-1/2 w-2 h-px bg-gray-400" />
                <span className="absolute left-1/2 top-1/2 w-1 h-7 bg-gray-700 origin-top rotate-[135deg]" />
                <span className="absolute left-1/2 top-1/2 w-0.5 h-9 bg-ariwatch-red origin-top -rotate-45" />
                <span className="absolute left-1/2 top-1/2 w-2 h-2 bg-gray-700 rounded-full -translate-x-1/2 -translate-y-1/2" />
              </div>}
          </div>
          <span className="flex items-center gap-2 text-sm font-medium">
            <input type="radio" name="hero-style" value={choice.value} checked={style === choice.value}
              onChange={() => { setStyle(choice.value); setError(''); setNotice(''); }} className="accent-ariwatch-red" />
            {choice.title}
          </span>
          <span className="text-xs text-gray-600 leading-6">{choice.detail}</span>
        </label>)}
      </div>
    </fieldset>
    {error && <p role="alert" className="mt-4 text-sm text-red-700">{error}</p>}
    {notice && <p role="status" className="mt-4 text-sm text-green-700">{notice}</p>}
    <button disabled={saving} className="mt-5 bg-black text-white px-6 py-3 disabled:opacity-50">
      {saving ? (fa ? 'در حال ذخیره…' : 'Saving…') : fa ? 'ذخیره طرح صفحه اصلی' : 'Save homepage style'}
    </button>
  </form>;
}
