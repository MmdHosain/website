"use client";
import { localMediaUrl } from '../../services/media';

import Link from 'next/link';
import { Watch } from '../../types';
import { useCollections } from '../../context/CollectionContext';
import { ProductCard } from '../watches/ProductCard';
import { formatPrice } from '../../services/format';
import { displayPrice, productStock, selectedPrice } from '../../services/catalog/pricing';
import { useCatalogClock } from '../../hooks/useCatalogClock';
export function CollectionsView({ lang, dict, watches, compare = false }: { lang: string; dict: any; watches: Watch[]; compare?: boolean }) {
  const { wishlistIds, compareIds, hydrated, error, toggleCompare, clearCompare } = useCollections();
  const fa = lang === 'fa', ids = compare ? compareIds : wishlistIds;
  const selected = ids.flatMap(id => watches.filter(watch => watch.id === id));
  const now = useCatalogClock(selected);
  return <div className="max-w-6xl mx-auto px-6 pt-32 pb-20">
    <h1 className="font-serif text-3xl mb-5">{compare ? (fa ? 'مقایسه ساعت‌ها' : 'Compare watches') : (fa ? 'علاقه‌مندی‌ها' : 'Saved watches')}</h1>
    <nav className="flex gap-5 mb-8 text-sm"><Link className="underline" href={`/${lang}/watches`}>{fa ? 'مجموعه ساعت‌ها' : 'Collection'}</Link><Link className="underline" href={`/${lang}/${compare ? 'wishlist' : 'compare'}`}>{compare ? (fa ? 'علاقه‌مندی‌ها' : 'Saved watches') : (fa ? 'مقایسه' : 'Compare')}</Link></nav>
    {error && <p role="alert" className="bg-red-50 text-red-700 p-4 mb-6">{error}</p>}
    {!hydrated ? <p role="status">{fa ? 'در حال بارگذاری…' : 'Loading…'}</p> : !selected.length ? <p className="text-gray-500">{fa ? 'ساعتی انتخاب نشده است. از مجموعه ساعت‌ها انتخاب کنید.' : 'No watches selected. Choose watches from the collection.'}</p> : compare ? <div>
      <button type="button" onClick={clearCompare} className="text-sm underline mb-4">{fa ? 'پاک کردن مقایسه' : 'Clear comparison'}</button>
      <div className="overflow-x-auto"><table className="w-full border-collapse text-sm"><thead><tr><th scope="col" className="p-4 text-start">{fa ? 'ویژگی' : 'Attribute'}</th>{selected.map(watch => <th scope="col" key={watch.id} className="p-4 min-w-52"><img src={localMediaUrl(watch.imageUrl)} alt="" className="w-28 h-28 object-cover mx-auto mb-3" /><Link className="underline" href={`/${lang}/watches/${watch.id}`}>{watch.name}</Link><button type="button" onClick={() => toggleCompare(watch.id)} className="block mx-auto mt-3 text-xs text-red-700">{fa ? 'حذف' : 'Remove'}</button></th>)}</tr></thead><tbody>
        {[{ label: fa ? 'قیمت از' : 'Price from', value: (watch: Watch) => formatPrice(displayPrice(watch, now).price, lang) }, { label: fa ? 'نوع' : 'Category', value: (watch: Watch) => watch.category },
          { label: fa ? 'موجودی' : 'Stock', value: (watch: Watch) => productStock(watch).toLocaleString(fa ? 'fa-IR' : 'en-US') },
          { label: fa ? 'مدل و رنگ' : 'Models & colors', value: (watch: Watch) => watch.variants.length ? <div className="space-y-3">{watch.variants.map(item => <Link key={item.id} className="block underline" href={`/${lang}/watches/${watch.id}?variant=${item.id}`}>{[item.label, item.color].filter(Boolean).join(' / ')}<span className="block text-xs mt-1">{formatPrice(selectedPrice(watch, item.id, now).price, lang)} · {item.stockQuantity > 0 ? `${fa ? 'موجودی' : 'Stock'}: ${item.stockQuantity.toLocaleString(fa ? 'fa-IR' : 'en-US')}` : fa ? 'ناموجود' : 'Out of stock'}</span></Link>)}</div> : '—' },
          { label: fa ? 'ویژگی‌ها' : 'Features', value: (watch: Watch) => watch.features || watch.description }].map(row => <tr key={row.label} className="border-t border-gray-200"><th scope="row" className="p-4 text-start">{row.label}</th>{selected.map(watch => <td key={watch.id} className="p-4 text-center">{row.value(watch)}</td>)}</tr>)}
      </tbody></table></div>
    </div> : <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">{selected.map(watch => <ProductCard key={watch.id} watch={watch} lang={lang} dict={dict} isFa={fa} />)}</div>}
  </div>;
}
