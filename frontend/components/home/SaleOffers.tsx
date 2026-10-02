"use client";
import Link from 'next/link';
import { Watch } from '../../types';
import { saleActive } from '../../services/catalog/pricing';
import { useCatalogClock } from '../../hooks/useCatalogClock';
import { ProductCard } from '../watches/ProductCard';
export function SaleOffers({ watches, lang, dict }: { watches: Watch[]; lang: string; dict: any }) {
  const now = useCatalogClock(watches), active = watches.filter(watch => saleActive(watch, now)), fa = lang === 'fa';
  if (!active.length) return null;
  return <section className="max-w-7xl mx-auto px-6 md:px-12 py-16 w-full">
    <div className="flex justify-between items-center gap-4 mb-8"><h2 className="font-serif text-3xl">{fa ? 'پیشنهادهای محدود' : 'Limited offers'}</h2><Link className="underline text-sm" href={`/${lang}/watches`}>{fa ? 'همه ساعت‌ها' : 'All watches'}</Link></div>
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">{active.slice(0, 3).map(watch => <ProductCard key={watch.id} watch={watch} lang={lang} dict={dict} isFa={fa} />)}</div>
  </section>;
}
