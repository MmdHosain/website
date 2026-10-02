import Link from "next/link";
import { ProductCard } from "./ProductCard";
import { Watch } from "../../types";
import { displayPrice } from "../../services/catalog/pricing";

export function ProductGrid({ lang, dict, isFa, watches, currentCategory, query = "", currentSort = "featured", now = Date.now() }: {
  lang: string;
  dict: any;
  isFa: boolean;
  watches: Watch[];
  currentCategory: string;
  query?: string;
  currentSort?: string;
  now?: number;
}) {
  const displayWatches = watches.filter((watch) =>
    currentCategory === "all" || (watch.category || "original") === currentCategory,
  );

  if (currentSort === "price-asc") displayWatches.sort((a, b) => displayPrice(a, now).price - displayPrice(b, now).price);
  else if (currentSort === "price-desc") displayWatches.sort((a, b) => displayPrice(b, now).price - displayPrice(a, now).price);
  else if (currentSort === "name-asc") displayWatches.sort((a, b) => a.name.localeCompare(b.name, isFa ? "fa" : "en"));

  if (displayWatches.length === 0) {
    return (
      <div className="py-20 text-center w-full">
        <p className="text-ariwatch-gray font-serif text-xl tracking-wide">{isFa ? "ساعتی مطابق جست‌وجوی شما پیدا نشد." : "No watches match your search."}</p>
        <Link href={`/${lang}/watches`} className="inline-block mt-5 text-sm text-ariwatch-red underline">{isFa ? "مشاهده همه ساعت‌ها" : "View all watches"}</Link>
      </div>
    );
  }

  return (
    <>
      <p className="text-xs text-gray-500 mb-7" role="status">{displayWatches.length.toLocaleString(isFa ? "fa-IR" : "en-US")} {isFa ? "ساعت" : displayWatches.length === 1 ? "watch" : "watches"}</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
        {displayWatches.map((watch) => (
          <ProductCard key={watch.id} lang={lang} dict={dict} isFa={isFa} watch={watch} />
        ))}
      </div>
    </>
  );
}
