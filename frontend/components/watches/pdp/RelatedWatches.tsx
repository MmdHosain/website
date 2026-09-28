import { watchService } from "../../../services/watch.service";
import { ProductCard } from "../ProductCard";
import { Watch } from "../../../types";

export async function RelatedWatches({ lang, dict, isFa, currentWatchId }: { lang: string, dict: any, isFa: boolean, currentWatchId: string }) {
  const allWatches = await watchService.getAll();
  // Filter out the current watch and select up to 3 for the related section
  const related = allWatches.filter((w: Watch) => w.id !== currentWatchId).slice(0, 3);
  
  if (related.length === 0) return null;

  return (
    <section className="mt-24 md:mt-32 border-t border-gray-100 pt-16 md:pt-24">
      <h2 className="text-2xl md:text-3xl font-serif text-ariwatch-black uppercase tracking-widest mb-12 text-center">
        {dict.pdp.relatedProducts}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {related.map((watch: Watch) => (
          <ProductCard key={watch.id} lang={lang} dict={dict} isFa={isFa} watch={watch} />
        ))}
      </div>
    </section>
  );
}
