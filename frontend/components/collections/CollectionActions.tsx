"use client";
import { useCollections } from '../../context/CollectionContext';
export function CollectionActions({ id, lang }: { id: string; lang: string }) {
  const { wishlistIds, compareIds, hydrated, toggleWishlist, toggleCompare } = useCollections();
  const saved = wishlistIds.includes(id), comparing = compareIds.includes(id), fa = lang === 'fa';
  return <div className="flex justify-center flex-wrap gap-3 mt-4 text-xs">
    <button type="button" disabled={!hydrated} aria-pressed={saved} onClick={() => toggleWishlist(id)} className={`border px-3 py-2 disabled:opacity-50 ${saved ? 'border-ariwatch-red text-ariwatch-red' : 'border-gray-200 text-gray-600'}`}>{saved ? (fa ? '♥ ذخیره شد' : '♥ Saved') : (fa ? '♡ علاقه‌مندی' : '♡ Save')}</button>
    <button type="button" disabled={!hydrated || (!comparing && compareIds.length >= 4)} title={fa ? 'مقایسه حداکثر چهار ساعت' : 'Compare up to four watches'} aria-pressed={comparing} onClick={() => toggleCompare(id)} className={`border px-3 py-2 disabled:opacity-50 ${comparing ? 'border-ariwatch-black text-black' : 'border-gray-200 text-gray-600'}`}>{comparing ? (fa ? 'در مقایسه' : 'Comparing') : (fa ? 'مقایسه' : 'Compare')}</button>
  </div>;
}
