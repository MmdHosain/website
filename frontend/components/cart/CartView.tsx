"use client";
import { localMediaUrl } from '../../services/media';


import { useCart } from '../../context/CartContext';
import Link from 'next/link';
import { checkoutCopy, formatToman } from '../checkout/copy';

export function CartView({ lang, dict }: { lang: string; dict: any }) {
  const { cartItems, isHydrated, removeFromCart, updateQuantity } = useCart();
  const copy = checkoutCopy(lang);
  const total = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  if (!isHydrated) return <p role="status" className="text-center text-ariwatch-gray">{copy.loading}</p>;

  return <div className="w-full max-w-5xl mx-auto px-6 md:px-12 animate-fade-in-up">
    <h1 className="text-3xl md:text-5xl font-serif text-ariwatch-black mb-12 text-center">{dict.cart.title}</h1>
    {cartItems.length === 0 ? <div className="text-center">
      <p className="text-ariwatch-gray text-lg mb-10">{dict.cart.empty}</p>
      <Link href={`/${lang}/watches`} className="inline-block border border-ariwatch-black px-10 py-4 text-sm hover:bg-black hover:text-white transition-colors">{dict.cart.continue}</Link>
    </div> : <>
      <div className="flex flex-col gap-6 mb-12">
        {cartItems.map(item => <article key={item.lineId} className="flex flex-wrap items-center gap-4 border-b border-gray-100 pb-6">
          <Link href={`/${lang}/watches/${encodeURIComponent(item.id)}`}><img src={localMediaUrl(item.imageUrl)} alt={item.name} className="w-20 h-20 object-cover bg-gray-50 border border-gray-100" /></Link>
          <div className="flex-1 min-w-40">
            <Link href={`/${lang}/watches/${encodeURIComponent(item.id)}`} className="font-bold text-sm md:text-base hover:text-ariwatch-red">{item.name}</Link>
            {item.variantLabel && <p className="mt-1 text-xs text-gray-500">{item.variantLabel}</p>}
            {item.stockQuantity < 1 && <p className="mt-1 text-xs text-red-700">{lang === 'fa' ? 'این انتخاب موجود نیست' : 'This selection is out of stock'}</p>}
            <div className="flex items-center gap-3 mt-3">
              <label htmlFor={`quantity-${item.lineId}`} className="text-xs text-ariwatch-gray">{copy.quantity}</label>
              <select id={`quantity-${item.lineId}`} value={item.quantity} onChange={event => updateQuantity(item.lineId, Number(event.target.value))} disabled={item.stockQuantity < 1} className="border border-gray-200 bg-white py-1 px-2 text-sm">
                {Array.from({ length: Math.max(item.quantity, Math.min(10, item.stockQuantity)) }, (_, index) => <option key={index + 1} value={index + 1}>{new Intl.NumberFormat(lang === 'fa' ? 'fa-IR' : 'en-US').format(index + 1)}</option>)}
              </select>
              <button onClick={() => removeFromCart(item.lineId)} aria-label={`${copy.remove} ${item.name}`} className="text-xs text-red-700 hover:underline px-2 py-2">{copy.remove}</button>
            </div>
          </div>
          <span className="text-sm font-bold">{formatToman(item.price * item.quantity, lang)}</span>
        </article>)}
      </div>
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-gray-50 p-6 md:p-8 border border-gray-100">
        <div className="text-xl font-serif">{copy.total}: {formatToman(total, lang)}</div>
        <Link href={`/${lang}/checkout`} className="w-full text-center md:w-auto bg-ariwatch-black text-white px-10 py-4 text-sm hover:bg-black transition-colors">{copy.title}</Link>
      </div>
    </>}
  </div>;
}
