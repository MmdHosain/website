import { ProductCard } from "./ProductCard";
import { Watch } from "../../types";

export function ProductGrid({ lang, dict, isFa, watches, currentCategory }: { lang: string, dict: any, isFa: boolean, watches: Watch[], currentCategory: string }) {
  // Filter logic
  const displayWatches = currentCategory === 'all' 
    ? watches 
    : watches.filter(w => (w.category || 'original') === currentCategory);

  if (!displayWatches || displayWatches.length === 0) {
    return (
      <div className="py-24 text-center w-full">
        <p className="text-ariwatch-gray font-serif text-xl tracking-wide">
          No watches found in this category.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
      {displayWatches.map((watch, idx) => (
        <ProductCard key={watch.id || idx} lang={lang} dict={dict} isFa={isFa} watch={watch} />
      ))}
    </div>
  );
}
