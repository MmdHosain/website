"use client";
import { localMediaUrl } from '../../services/media';

import Link from 'next/link';
import { Watch } from '../../types';
import { formatPrice } from '../../services/format';
import { displayPrice, productStock } from '../../services/catalog/pricing';
import { useSaleClock } from '../../hooks/useSaleClock';
import { CollectionActions } from '../collections/CollectionActions';
export function ProductCard({ lang, dict, isFa, watch }: { lang: string; dict: any; isFa: boolean; watch: Watch }) {
  const category = watch.category || 'original', pricing = displayPrice(watch, useSaleClock(watch));
  const badge = category === 'original' ? dict.plp.filters.original : category === 'highcopy' ? dict.plp.filters.highCopy : dict.plp.filters.custom;
  return <article className="group">
    <Link href={`/${lang}/watches/${watch.id}`} className="block">
      <div className="relative w-full aspect-[4/5] bg-[#f4f4f4] mb-5 overflow-hidden flex items-center justify-center border border-gray-100">
        {watch.imageUrl && watch.imageUrl !== 'placeholder' ? <img src={localMediaUrl(watch.imageUrl)} alt={watch.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" /> : <span className="text-gray-400">{isFa ? 'تصویر ساعت' : 'Watch image'}</span>}
        <span className="absolute top-4 start-4 text-[9px] font-bold bg-white border border-gray-200 px-2 py-1">{badge}</span>
        {pricing.onSale && <span className="absolute bottom-4 start-4 bg-ariwatch-red text-white px-3 py-1 text-xs">{isFa ? 'پیشنهاد ویژه' : 'Limited offer'}</span>}
      </div>
      <div className="text-center px-3">
        <h3 className="font-serif text-lg md:text-xl mb-2 group-hover:text-ariwatch-red">{watch.name}</h3>
        <p className="text-xs text-gray-500 mb-3 line-clamp-1">{watch.description}</p>
        <p className="text-sm font-bold">{!!watch.variants?.length && <span className="font-normal me-1">{isFa ? 'از' : 'From'}</span>}{formatPrice(pricing.price, lang)}</p>
        {pricing.onSale && <del className="text-xs text-gray-500">{formatPrice(pricing.originalPrice, lang)}</del>}
        {productStock(watch) < 1 && <p className="mt-2 text-xs text-red-700">{isFa ? 'ناموجود' : 'Out of stock'}</p>}
      </div>
    </Link>
    <CollectionActions id={watch.id} lang={lang} />
  </article>;
}
