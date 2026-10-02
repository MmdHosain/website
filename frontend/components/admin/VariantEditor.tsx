"use client";
import { VariantDraft } from './watchFormModel';
export function VariantEditor({ variants, onChange, lang }: { variants: VariantDraft[]; onChange: (variants: VariantDraft[]) => void; lang: string }) {
  const fa = lang === 'fa';
  const update = (id: string, key: keyof VariantDraft, value: string) => onChange(variants.map(item => item.id === id ? { ...item, [key]: value } : item));
  return <fieldset className="border border-gray-200 p-4 space-y-4">
    <legend className="px-2 text-sm font-bold">{fa ? 'مدل‌ها و رنگ‌ها با موجودی مستقل' : 'Models & colors with separate stock'}</legend>
    {variants.map((item, index) => <div key={item.id} className="border-b border-gray-100 pb-4">
      <div className="grid md:grid-cols-2 gap-3">
        {[{ key: 'label' as const, title: fa ? 'نام مدل' : 'Model label', max: 150 }, { key: 'color' as const, title: fa ? 'رنگ' : 'Color', max: 100 }, { key: 'sku' as const, title: 'SKU', max: 100 }].map(field => <label key={field.key} className="text-xs">{field.title}<input required={field.key !== 'color'} aria-label={`${field.title} ${index + 1}`} maxLength={field.max} value={item[field.key] || ''} onChange={event => update(item.id, field.key, event.target.value)} className="block w-full border border-gray-300 p-2 mt-1 text-sm" /></label>)}
        <label className="text-xs">{fa ? 'قیمت (تومان)' : 'Price (toman)'}<input required type="number" min={1} max={1000000000000} step={1} value={item.price} onChange={event => update(item.id, 'price', event.target.value)} className="block w-full border border-gray-300 p-2 mt-1 text-sm" /></label>
        <label className="text-xs">{fa ? 'موجودی' : 'Stock'}<input required type="number" min={0} max={1000000} step={1} value={item.stockQuantity} onChange={event => update(item.id, 'stockQuantity', event.target.value)} className="block w-full border border-gray-300 p-2 mt-1 text-sm" /></label>
      </div>
      <button type="button" onClick={() => { if (!item.label || window.confirm(fa ? 'این مدل حذف شود؟' : 'Remove this variant?')) onChange(variants.filter(variant => variant.id !== item.id)); }} className="mt-3 text-xs text-red-700 underline">{fa ? 'حذف مدل' : 'Remove variant'}</button>
    </div>)}
    <button type="button" disabled={variants.length >= 30} onClick={() => onChange([...variants, { id: crypto.randomUUID(), sku: '', label: '', color: '', price: '', stockQuantity: 0 }])} className="border border-gray-300 px-4 py-2 text-sm disabled:opacity-40">{fa ? 'افزودن مدل یا رنگ' : 'Add model or color'}</button>
  </fieldset>;
}
