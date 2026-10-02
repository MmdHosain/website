"use client";

import Link from "next/link";
import { useWatchForm } from "../../hooks/useWatchForm";
import { Watch } from "../../types";
import { WatchInventoryFields } from "./WatchInventoryFields";

export function WatchForm({ lang, dict, initialData }: { lang: string; dict: any; initialData?: Watch | null }) {
  const isFa = lang === "fa";
  const { formData, loading, error, handleChange, handleSubmit, handleDelete, setVariants } = useWatchForm(lang, initialData);
  const fieldClass = "border border-gray-300 p-3 text-sm focus:outline-none focus:border-ariwatch-black disabled:bg-gray-50";
  const labelClass = "text-xs font-bold text-ariwatch-black";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6" aria-busy={loading}>
      {error && <div id="watch-form-error" role="alert" className="bg-red-50 text-red-700 p-4 rounded text-sm">{error}</div>}
      <fieldset disabled={loading} className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <label htmlFor="watch-name" className={labelClass}>{dict.admin.name}</label>
          <input id="watch-name" required maxLength={255} type="text" name="name" value={formData.name} onChange={handleChange} className={fieldClass} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label htmlFor="watch-price" className={labelClass}>{dict.admin.price} ({isFa ? "تومان" : "toman"})</label>
            <input id="watch-price" required type="number" min={1} max={1000000000000} step={1} name="price" value={formData.price} onChange={handleChange} dir="ltr" className={fieldClass} />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="watch-category" className={labelClass}>{dict.admin.category}</label>
            <select id="watch-category" name="category" value={formData.category} onChange={handleChange} className={`${fieldClass} bg-white`}>
              <option value="original">{isFa ? "اصل" : "Original"}</option>
              <option value="highcopy">{isFa ? "های‌کپی" : "High copy"}</option>
              <option value="custom">{isFa ? "سفارش اختصاصی" : "Custom order"}</option>
            </select>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="watch-description" className={labelClass}>{isFa ? "توضیحات" : "Description"}</label>
          <textarea id="watch-description" required maxLength={5000} rows={4} name="description" value={formData.description} onChange={handleChange} className={`${fieldClass} resize-y`} />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="watch-image" className={labelClass}>{isFa ? "آدرس تصویر" : "Image URL"}</label>
          <input id="watch-image" required maxLength={2048} type="text" name="imageUrl" value={formData.imageUrl} onChange={handleChange} placeholder="https://… /images/watch.svg" dir="ltr" aria-describedby="watch-image-help" className={fieldClass} />
          <p id="watch-image-help" className="text-xs text-gray-500">{isFa ? "لینک مستقیم تصویر با http یا https، یا مسیر فایل محلی." : "A direct http(s) image link or a local image file path."}</p>
        </div>
        <WatchInventoryFields draft={formData} onChange={handleChange} setVariants={setVariants} lang={lang} />
      </fieldset>
      <div className="flex justify-between flex-wrap gap-4 items-center mt-4 pt-6 border-t border-gray-200">
        {initialData?.id ? (
          <button type="button" onClick={() => void handleDelete()} disabled={loading} className="text-xs font-bold text-red-700 hover:underline disabled:opacity-50">{dict.admin.delete}</button>
        ) : <Link href={`/${lang}/admin`} className="text-sm text-gray-600 underline">{isFa ? "انصراف" : "Cancel"}</Link>}
        <button type="submit" disabled={loading} className="bg-ariwatch-black text-white px-8 py-3 text-xs font-bold hover:bg-black transition disabled:opacity-50">{loading ? (isFa ? "در حال ذخیره…" : "Saving…") : dict.admin.save}</button>
      </div>
    </form>
  );
}
