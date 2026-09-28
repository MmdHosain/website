import { getDictionary } from "../../dictionaries";
import { FilterBar } from "../../../components/watches/FilterBar";
import { ProductGrid } from "../../../components/watches/ProductGrid";
import { watchService } from "../../../services/watch.service";

export default async function WatchesPage({ 
  params: { lang }, 
  searchParams 
}: { 
  params: { lang: 'en' | 'fa' }, 
  searchParams: { category?: string } 
}) {
  const dict = await getDictionary(lang);
  const isFa = lang === 'fa';
  
  // Using the centralized clean service for data fetching
  const watches = await watchService.getAll();
  const currentCategory = searchParams.category || 'all';

  return (
    <div className="w-full min-h-screen bg-white pt-24 md:pt-32 pb-24">
      <div className="max-w-[1600px] mx-auto px-6 md:px-12">
        {/* PLP Header */}
        <div className="text-center mb-12 flex flex-col items-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-ariwatch-black uppercase tracking-wide mb-4">
            {dict.plp.title}
          </h1>
          <p className="text-ariwatch-gray text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
            {dict.plp.subtitle}
          </p>
        </div>
        
        {/* Filters and Grid */}
        <FilterBar lang={lang} dict={dict} isFa={isFa} currentCategory={currentCategory} />
        <ProductGrid lang={lang} dict={dict} isFa={isFa} watches={watches} currentCategory={currentCategory} />
        
      </div>
    </div>
  );
}
