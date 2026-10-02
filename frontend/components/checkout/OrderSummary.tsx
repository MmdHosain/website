import { localMediaUrl } from '../../services/media';
import { OrderItem } from '../../services/order.service';
import { checkoutCopy, formatToman } from './copy';

export function OrderSummary({ items, total, lang, subtotal, discount = 0, shipping, couponCode }: { items: OrderItem[]; total: number; lang: string; subtotal?: number; discount?: number; shipping?: number; couponCode?: string | null }) {
  const copy = checkoutCopy(lang);
  return <div className="border border-gray-200 bg-gray-50 p-6">
    <h2 className="text-xl font-serif mb-6">{copy.cart}</h2>
    <ul className="space-y-5">
      {items.map(item => <li key={`${item.watchId}:${item.variantId || 'base'}`} className="flex items-center gap-3">
        <img src={localMediaUrl(item.imageUrl)} alt={item.name} className="w-16 h-16 object-cover bg-white" />
        <div className="min-w-0 flex-1"><p className="text-sm font-semibold break-words">{item.name}</p>{item.variantLabel && <p className="text-xs mt-1">{item.variantLabel}</p>}<p className="text-xs text-ariwatch-gray mt-1">{copy.quantity}: {new Intl.NumberFormat(lang === 'fa' ? 'fa-IR' : 'en-US').format(item.quantity)}</p><p className="text-xs font-semibold mt-2">{formatToman(item.price * item.quantity, lang)}</p></div>
      </li>)}
    </ul>
    {subtotal !== undefined && <p className="mt-5 flex justify-between text-sm"><span>{lang === 'fa' ? 'جمع محصولات' : 'Subtotal'}</span><span>{formatToman(subtotal, lang)}</span></p>}
    {discount > 0 && <p className="mt-3 flex justify-between text-sm text-green-700"><span>{lang === 'fa' ? 'تخفیف' : 'Discount'} {couponCode}</span><span>−{formatToman(discount, lang)}</span></p>}
    {shipping !== undefined && <p className="mt-3 flex justify-between text-sm"><span>{lang === 'fa' ? 'هزینه ارسال' : 'Shipping'}</span><span>{shipping ? formatToman(shipping, lang) : lang === 'fa' ? 'رایگان' : 'Free'}</span></p>}
    <p className="flex justify-between gap-3 border-t border-gray-200 mt-6 pt-5 text-base font-semibold"><span>{copy.total}</span><span>{formatToman(total, lang)}</span></p>
  </div>;
}
