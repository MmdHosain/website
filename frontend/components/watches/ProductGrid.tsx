import { ProductCard } from "./ProductCard";

export function ProductGrid({ lang, dict, isFa, watches, currentCategory }: { lang: string, dict: any, isFa: boolean, watches: any[], currentCategory: string }) {
  // Filter logic
  const displayWatches = currentCategory === 'all' 
    ? watches 
    : watches.filter(w => (w.category || 'original') === currentCategory);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
      {displayWatches.map((watch, idx) => (
        <ProductCard key={watch.id || idx} lang={lang} dict={dict} isFa={isFa} watch={watch} />
      ))}
    </div>
  );
}
