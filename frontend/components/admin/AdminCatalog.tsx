"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Watch } from "../../types";
import { watchService } from "../../services/watch.service";
import { formatPrice } from "../../services/format";
import { productStock } from "../../services/catalog/pricing";

export function AdminCatalog({ lang, dict }: { lang: string; dict: any }) {
  const isFa = lang === "fa";
  const [watches, setWatches] = useState<Watch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try { setWatches(await watchService.getAll()); }
    catch (cause) { setError(cause instanceof Error ? cause.message : (isFa ? "بارگذاری محصولات انجام نشد." : "Could not load products.")); }
    finally { setLoading(false); }
  }, [isFa]);

  useEffect(() => { void load(); }, [load]);

  const deleteWatch = async (watch: Watch) => {
    if (!window.confirm(isFa ? `«${watch.name}» از فروشگاه حذف شود؟` : `Delete “${watch.name}” from the catalog?`)) return;
    setDeleting(watch.id);
    setError("");
    try {
      await watchService.delete(watch.id);
      setWatches((current) => current.filter((item) => item.id !== watch.id));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : (isFa ? "حذف محصول انجام نشد." : "Could not delete the product."));
    } finally { setDeleting(null); }
  };

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
        <h1 className="text-2xl md:text-3xl font-serif text-ariwatch-black">{dict.admin.products}</h1>
        <Link href={`/${lang}/admin/watches/new`} className="bg-ariwatch-red text-white px-6 py-3 text-xs font-bold hover:bg-red-800 transition">{dict.admin.addNew}</Link>
      </div>
      {error && <div role="alert" className="mb-4 p-4 bg-red-50 text-red-700 text-sm">{error}<button type="button" onClick={() => void load()} className="ms-3 underline">{isFa ? "تلاش دوباره" : "Retry"}</button></div>}
      {loading ? <p role="status" className="p-8 text-gray-500">{isFa ? "در حال بارگذاری…" : "Loading products…"}</p> : (
        <div className="bg-white rounded-md border border-gray-200 overflow-x-auto">
          <table className="w-full text-start border-collapse">
            <thead><tr className="bg-gray-50 border-b border-gray-200 text-xs text-gray-500">
              <th scope="col" className="p-4 text-start">{dict.admin.name}</th>
              <th scope="col" className="p-4 text-start">{dict.admin.category}</th>
              <th scope="col" className="p-4 text-start">{dict.admin.price}</th>
              <th scope="col" className="p-4 text-start">{isFa ? 'موجودی' : 'Stock'}</th>
              <th scope="col" className="p-4 text-end">{dict.admin.actions}</th>
            </tr></thead>
            <tbody>
              {watches.map((watch) => (
                <tr key={watch.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-4 text-sm font-bold text-ariwatch-black">{watch.name}<span className="block mt-1 font-mono text-xs font-normal text-gray-400" dir="ltr">{watch.id.slice(0, 8)}</span></td>
                  <td className="p-4 text-xs">{watch.category === "highcopy" ? (isFa ? "های‌کپی" : "High copy") : watch.category === "custom" ? (isFa ? "سفارش اختصاصی" : "Custom") : (isFa ? "اصل" : "Original")}</td>
                  <td className="p-4 text-sm whitespace-nowrap">{formatPrice(watch.price, lang)}</td>
                  <td className="p-4 text-sm">{productStock(watch).toLocaleString(isFa ? 'fa-IR' : 'en-US')}</td>
                  <td className="p-4"><div className="flex justify-end gap-4">
                    <Link href={`/${lang}/admin/watches/new?id=${encodeURIComponent(watch.id)}`} className="text-xs font-bold text-blue-700 hover:underline">{dict.admin.edit}</Link>
                    <button type="button" disabled={deleting !== null} onClick={() => void deleteWatch(watch)} className="text-xs font-bold text-red-700 hover:underline disabled:opacity-50">{deleting === watch.id ? (isFa ? "در حال حذف…" : "Deleting…") : dict.admin.delete}</button>
                  </div></td>
                </tr>
              ))}
              {!error && watches.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-gray-500">{isFa ? "محصولی ثبت نشده است." : "No products yet."}</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
