"use client";
import { WatchDraft } from './watchFormModel';
import { VariantEditor } from './VariantEditor';
export function WatchInventoryFields({ draft, onChange, setVariants, lang }: { draft: WatchDraft; onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void; setVariants: (variants: WatchDraft['variants']) => void; lang: string }) {
  const fa = lang === 'fa', input = 'block w-full border border-gray-300 p-3 mt-2 text-sm';
  return <>
    <div className="grid md:grid-cols-2 gap-5">
      <label className="text-xs font-bold">SKU<input name="sku" maxLength={100} value={draft.sku} onChange={onChange} className={input} /></label>
      <label className="text-xs font-bold">{fa ? 'موجودی محصول بدون مدل' : 'Stock for product without variants'}<input required name="stockQuantity" type="number" min={0} max={1000000} step={1} value={draft.stockQuantity} onChange={onChange} className={input} /></label>
    </div>
    <VariantEditor variants={draft.variants} onChange={setVariants} lang={lang} />
    <fieldset className="border border-gray-200 p-4 grid md:grid-cols-3 gap-4">
      <legend className="px-2 text-sm font-bold">{fa ? 'پیشنهاد زمان‌دار' : 'Timed offer'}</legend>
      <label className="text-xs">{fa ? 'قیمت ویژه پایه (تومان)' : 'Sale price (toman)'}<input name="salePrice" type="number" min={1} step={1} value={draft.salePrice} onChange={onChange} className={input} /></label>
      <label className="text-xs">{fa ? 'شروع (زمان محلی)' : 'Starts (local time)'}<input required={!!draft.salePrice} type="datetime-local" name="saleStartsAt" value={draft.saleStartsAt} onChange={onChange} className={input} /></label>
      <label className="text-xs">{fa ? 'پایان (زمان محلی)' : 'Ends (local time)'}<input required={!!draft.salePrice} type="datetime-local" name="saleEndsAt" value={draft.saleEndsAt} onChange={onChange} className={input} /></label>
      <p className="md:col-span-3 text-xs text-gray-500">{fa ? 'درصد تخفیف به مدل‌ها هم اعمال می‌شود. برای حذف پیشنهاد، قیمت ویژه را خالی کنید.' : 'The same discount percentage applies to variants. Clear the sale price to remove the offer.'}</p>
    </fieldset>
    <label className="text-xs font-bold">{fa ? 'ویژگی‌ها' : 'Features'}<textarea name="features" rows={3} maxLength={5000} value={draft.features} onChange={onChange} className={input} /></label>
    <details className="border border-gray-200 p-4"><summary className="text-sm cursor-pointer">{fa ? 'عنوان و توضیحات موتور جست‌وجو' : 'Search engine title & description'}</summary>
      <label className="block mt-4 text-xs">{fa ? 'عنوان' : 'Title'}<input name="metaTitle" maxLength={160} value={draft.metaTitle} onChange={onChange} className={input} /></label>
      <label className="block mt-4 text-xs">{fa ? 'توضیحات' : 'Description'}<textarea rows={2} name="metaDescription" maxLength={320} value={draft.metaDescription} onChange={onChange} className={input} /></label>
    </details>
  </>;
}
