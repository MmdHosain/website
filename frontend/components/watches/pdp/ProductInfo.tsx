"use client";

import Link from "next/link";
import { useState } from "react";
import { Watch } from "../../../types";
import { useCart } from "../../../../context/CartContext";

export function ProductInfo({ lang, dict, watch }: { lang: string, dict: any, isFa: boolean, watch: Watch }) {
  const category = watch.category || 'original';
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const handleAddToCart = () => {
    addToCart(watch);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };
  
  return (
    <div className="w-full lg:w-[45%] flex flex-col pt-4 lg:pt-0">
      <div className="mb-8">
        <span className={`text-[10px] font-bold tracking-widest uppercase px-3 py-1 ${category === 'custom' ? 'bg-ariwatch-red text-white' : category === 'highcopy' ? 'border border-gray-200 text-ariwatch-black bg-white' : 'bg-ariwatch-black text-white'}`}>
          {category === 'original' ? dict.plp.filters.original : category === 'highcopy' ? dict.plp.filters.highCopy : dict.plp.filters.custom}
        </span>
      </div>
      
      <h1 className="text-3xl md:text-5xl lg:text-6xl font-serif text-ariwatch-black uppercase mb-4 tracking-wide leading-tight">
        {watch.name}
      </h1>
      <p className="text-xl md:text-2xl font-light text-ariwatch-gray mb-10">
        ${Number(watch.price).toLocaleString()}
      </p>
      
      <div className="bg-[#fdfcfb] p-6 border border-gray-100 mb-10">
        <p className="text-sm text-ariwatch-gray leading-relaxed mb-8">
          {watch.description}. {dict.pdp.descriptionMock}
        </p>
        {category === 'custom' ? (
          <Link href={`/${lang}/concierge`} className="block w-full text-center bg-ariwatch-black text-white text-[10px] md:text-xs font-bold tracking-widest uppercase py-4 hover:bg-black transition-colors">
            {dict.pdp.requestModel}
          </Link>
        ) : (
          <button onClick={handleAddToCart} className="w-full bg-ariwatch-black text-white text-[10px] md:text-xs font-bold tracking-widest uppercase py-4 hover:bg-black transition-colors">
            {added ? "ADDED TO CART" : dict.pdp.addToCart}
          </button>
        )}
      </div>

      <div className="flex flex-col gap-6 text-[10px] md:text-xs font-bold text-ariwatch-black tracking-widest uppercase">
        <div className="flex justify-between border-b border-gray-200 pb-4">
          <span>{dict.pdp.availability}</span>
          <span className="text-green-700">{dict.pdp.inStock}</span>
        </div>
        <div className="flex justify-between border-b border-gray-200 pb-4">
          <span>{dict.pdp.delivery}</span>
          <span className="text-ariwatch-gray">{dict.pdp.shippingTime}</span>
        </div>
      </div>
    </div>
  );
}
