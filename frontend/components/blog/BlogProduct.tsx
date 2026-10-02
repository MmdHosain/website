"use client";
import { localMediaUrl } from '../../services/media';


import Link from 'next/link';
import { useEffect, useId, useState } from 'react';
import { Watch } from '../../types';
import { useCart } from '../../context/CartContext';
import { useSaleClock } from '../../hooks/useSaleClock';
import { cartLineId } from '../../services/catalog/cart';
import { selectedPrice } from '../../services/catalog/pricing';
import { initialVariantId } from '../../services/catalog/selection';
import { formatPrice } from '../../services/format';

export function BlogProduct({ watch, lang }: { watch: Watch; lang: string }) {
  const fa = lang === 'fa';
  const t = (en: string, faText: string) => fa ? faText : en;
  const variants = watch.variants || [];
  const [variantId, setVariantId] = useState(() => initialVariantId(watch));
  const [added, setAdded] = useState(false);
  const selectId = useId();
  const { addToCart, cartItems, isHydrated } = useCart();
  const variant = variants.find(item => item.id === variantId);
  const stock = variants.length ? variant?.stockQuantity ?? 0 : watch.stockQuantity ?? 20;
  const pricing = selectedPrice(watch, variant?.id, useSaleClock(watch));
  const quantity = cartItems.find(item => item.lineId === cartLineId(watch.id, variant?.id))?.quantity || 0;
  const limitReached = stock > 0 && quantity >= Math.min(10, stock);
  const custom = watch.category === 'custom';
  const productHref = `/${lang}/watches/${watch.id}${variant ? `?variant=${encodeURIComponent(variant.id)}` : ''}`;

  useEffect(() => {
    setVariantId(initialVariantId(watch));
    setAdded(false);
  }, [watch.id]);

  function add() {
    if (addToCart(watch, variant?.id)) setAdded(true);
  }

  return <aside className="my-10 border border-gray-200 bg-gray-50 p-5 flex flex-col sm:flex-row gap-6 items-center">
    <Link href={productHref} className="shrink-0">
      <img src={localMediaUrl(watch.imageUrl)} alt={watch.name} className="w-32 h-32 object-contain bg-white" loading="lazy" />
    </Link>
    <div className="flex-1 w-full">
      <p className="text-xs text-gray-500 mb-2">{t('Featured product', 'محصول معرفی‌شده')}</p>
      <h2 className="font-serif text-xl mb-3">{watch.name}</h2>
      <p className="text-sm mb-2">{formatPrice(pricing.price, lang)}</p>
      {pricing.onSale && <del className="block text-xs text-gray-500 mb-3">{formatPrice(pricing.originalPrice, lang)}</del>}
      {variants.length > 0 && <div className="mb-4">
        <label htmlFor={selectId} className="block text-sm mb-2">{t('Model & color', 'مدل و رنگ')}</label>
        <select id={selectId} value={variantId} onChange={event => { setVariantId(event.target.value); setAdded(false); }} className="w-full border border-gray-300 p-3 bg-white text-sm">
          {variants.map(item => <option key={item.id} value={item.id}>
            {item.label}{item.color ? ` / ${item.color}` : ''}{item.stockQuantity < 1 ? t(' — out of stock', ' — ناموجود') : ''}
          </option>)}
        </select>
        {variant && <p className="mt-2 text-xs text-gray-500" dir="ltr">{variant.sku}</p>}
      </div>}
      {!custom && <p className={`text-xs mb-4 ${stock > 0 ? 'text-green-700' : 'text-red-700'}`}>
        {stock > 0 ? `${t('In stock', 'موجود')} (${stock.toLocaleString(fa ? 'fa-IR' : 'en-US')})` : t('Out of stock', 'ناموجود')}
      </p>}
      <div className="flex flex-wrap items-center gap-4">
        {custom ? <Link href={`/${lang}/concierge`} className="bg-ariwatch-black text-white px-5 py-3 text-sm">
          {t('Request this model', 'درخواست این مدل')}
        </Link> : <button type="button" onClick={add} disabled={!isHydrated || stock < 1 || limitReached} className="bg-ariwatch-black text-white px-5 py-3 text-sm disabled:opacity-40">
          {stock < 1 ? t('Out of stock', 'ناموجود') : limitReached ? t('Quantity limit reached', 'حداکثر تعداد در سبد') : t('Add to cart', 'افزودن به سبد')}
        </button>}
        <Link href={productHref} className="text-sm text-ariwatch-red underline">{t('View watch details', 'مشاهده جزئیات ساعت')}</Link>
      </div>
      {added && <p role="status" className="mt-3 text-sm text-green-700">
        {t('Added to cart.', 'به سبد خرید اضافه شد.')} <Link href={`/${lang}/cart`} className="underline">{t('View cart', 'مشاهده سبد')}</Link>
      </p>}
    </div>
  </aside>;
}
