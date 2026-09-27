import { getDictionary } from "../../../dictionaries";
import { watchService } from "../../../../services/watch.service";
import { ProductGallery } from "../../../../components/watches/pdp/ProductGallery";
import { ProductInfo } from "../../../../components/watches/pdp/ProductInfo";
import { ProductSpecs } from "../../../../components/watches/pdp/ProductSpecs";

export default async function ProductDetailPage({ 
  params: { lang, id } 
}: { 
  params: { lang: 'en' | 'fa', id: string } 
}) {
  const dict = await getDictionary(lang);
  const isFa = lang === 'fa';
  const watch = await watchService.getById(id);

  if (!watch) {
    return (
      <div className="w-full min-h-[70vh] flex items-center justify-center bg-white pt-32">
        <h1 className="text-2xl font-serif text-ariwatch-gray">{dict.pdp.notFound}</h1>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-white pt-24 md:pt-32 pb-24">
      <div className="max-w-[1500px] mx-auto px-6 md:px-12">
        
        {/* Core Product Layout */}
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 mb-20">
          <ProductGallery watch={watch} isFa={isFa} />
          <ProductInfo lang={lang} dict={dict} isFa={isFa} watch={watch} />
        </div>

        {/* Extended Details */}
        <ProductSpecs dict={dict} isFa={isFa} />
      </div>
    </div>
  );
}
