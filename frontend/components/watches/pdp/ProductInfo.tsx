"use client";
import Link from 'next/link';
import { useState } from 'react';
import { Watch } from '../../../types';
import { formatPrice } from '../../../services/format';
import { selectedPrice } from '../../../services/catalog/pricing';
import { initialVariantId } from '../../../services/catalog/selection';
import { useSaleClock } from '../../../hooks/useSaleClock';
import { useCart } from '../../../context/CartContext';
import { CollectionActions } from '../../collections/CollectionActions';
import { StockAlertButton } from '../StockAlertButton';
export function ProductInfo({ lang, dict, watch, requestedVariantId }: { lang: string; dict: any; isFa: boolean; watch: Watch; requestedVariantId?: string }) {
  const fa = lang === 'fa', category = watch.category || 'original', variants = watch.variants || [];
  const [variantId, setVariantId] = useState(initialVariantId(watch, requestedVariantId));
  const [added, setAdded] = useState(false);
  const { addToCart } = useCart();
  const variant = variants.find(item => item.id === variantId), stock = variant?.stockQuantity ?? watch.stockQuantity;
  const pricing = selectedPrice(watch, variantId || undefined, useSaleClock(watch));
  return <div className="w-full lg:w-[45%] flex flex-col">
    <span className="text-xs font-bold mb-6">{category === 'original' ? dict.plp.filters.original : category === 'highcopy' ? dict.plp.filters.highCopy : dict.plp.filters.custom}</span>
    <h1 className="font-serif text-3xl md:text-5xl leading-tight mb-5">{watch.name}</h1>
    <div className="mb-7"><p className="text-2xl">{formatPrice(pricing.price, lang)}</p>{pricing.onSale && <><del className="text-gray-500 text-sm">{formatPrice(pricing.originalPrice, lang)}</del><p className="mt-2 text-xs text-ariwatch-red">{fa ? 'پیشنهاد تا ' : 'Offer until '}{new Date(watch.saleEndsAt!).toLocaleString(fa ? 'fa-IR' : 'en-US', { timeZone: 'Asia/Tehran' })}</p></>}</div>
    {!!variants.length && <div className="mb-6">
      <label htmlFor="product-variant" className="block text-sm font-bold mb-2">{fa ? 'مدل و رنگ' : 'Model & color'}</label>
      <select id="product-variant" value={variantId} onChange={event => { setVariantId(event.target.value); setAdded(false); }} className="w-full border border-gray-300 p-3 bg-white">
        {variants.map(item => <option key={item.id} value={item.id}>{item.label}{item.color ? ` / ${item.color}` : ''}{item.stockQuantity === 0 ? (fa ? ' — ناموجود' : ' — out of stock') : ''}</option>)}
      </select><p className="mt-2 text-xs text-gray-500" dir="ltr">{variant?.sku}</p>
    </div>}
    <div className="bg-gray-50 border border-gray-100 p-6 mb-6">
      <p className="text-sm text-gray-600 leading-7 whitespace-pre-wrap mb-5">{watch.description}</p>
      {watch.features && <p className="text-sm leading-7 whitespace-pre-wrap mb-5">{watch.features}</p>}
      {category === 'custom' ? <Link href={`/${lang}/concierge`} className="block bg-ariwatch-black text-white text-center p-4 text-sm">{dict.pdp.requestModel}</Link> :
        <><button type="button" disabled={stock < 1} onClick={() => { if (addToCart(watch, variantId || undefined)) { setAdded(true); setTimeout(() => setAdded(false), 2000); } }} className="w-full bg-ariwatch-black text-white p-4 text-sm disabled:opacity-40">{added ? (fa ? 'به سبد اضافه شد' : 'Added to cart') : dict.pdp.addToCart}</button>
          {stock < 1 && <StockAlertButton key={variantId || 'base'} watchId={watch.id} variantId={variantId || undefined} lang={lang} dict={dict} />}</>}
      <CollectionActions id={watch.id} lang={lang} />
    </div>
    <div className="flex justify-between border-b border-gray-200 py-4 text-sm"><span>{dict.pdp.availability}</span><span className={stock > 0 ? 'text-green-700' : 'text-red-700'}>{stock > 0 ? `${dict.pdp.inStock} (${stock.toLocaleString(fa ? 'fa-IR' : 'en-US')})` : (fa ? 'ناموجود' : 'Out of stock')}</span></div>
    <div className="flex justify-between border-b border-gray-200 py-4 text-sm"><span>{dict.pdp.delivery}</span><span>{dict.pdp.shippingTime}</span></div>
  </div>;
}
