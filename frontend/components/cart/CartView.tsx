"use client";

import { useCart } from "../../context/CartContext";
import Link from "next/link";

export function CartView({ lang, dict }: { lang: string, dict: any }) {
  const { cartItems, removeFromCart } = useCart();

  const total = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  if (cartItems.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-6 md:px-12 text-center animate-fade-in-up">
        <h1 className="text-3xl md:text-5xl font-serif text-ariwatch-black uppercase tracking-widest mb-8">
          {dict.cart.title}
        </h1>
        <div className="w-24 h-24 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-8">
          <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        </div>
        <p className="text-ariwatch-gray text-lg mb-12">
          {dict.cart.empty}
        </p>
        <Link href={`/${lang}/watches`} className="inline-block border border-ariwatch-black px-10 py-4 text-[10px] md:text-xs font-bold tracking-widest text-ariwatch-black uppercase hover:bg-black hover:text-white transition-all">
          {dict.cart.continue}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 md:px-12 animate-fade-in-up">
      <h1 className="text-3xl md:text-5xl font-serif text-ariwatch-black uppercase tracking-widest mb-12 text-center">
        {dict.cart.title}
      </h1>
      
      <div className="flex flex-col gap-6 mb-12">
        {cartItems.map(item => (
          <div key={item.id} className="flex items-center justify-between border-b border-gray-100 pb-6">
            <div className="flex items-center gap-6">
              <img src={item.imageUrl} alt={item.name} className="w-20 h-20 object-cover bg-gray-50 border border-gray-100" />
              <div>
                <h3 className="font-bold text-ariwatch-black uppercase tracking-wider text-sm md:text-base">{item.name}</h3>
                <p className="text-xs text-ariwatch-gray mt-1">QTY: {item.quantity}</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <span className="font-bold text-ariwatch-black tracking-widest">${(item.price * item.quantity).toLocaleString()}</span>
              <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:text-red-700 transition-colors p-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center gap-8 bg-gray-50 p-8 border border-gray-100">
        <div className="text-xl md:text-2xl font-serif text-ariwatch-black tracking-widest">
          TOTAL: ${total.toLocaleString()}
        </div>
        <button className="w-full md:w-auto bg-ariwatch-black text-white px-12 py-4 text-[10px] md:text-xs font-bold tracking-widest uppercase hover:bg-black transition-all">
          CHECKOUT
        </button>
      </div>
    </div>
  );
}
