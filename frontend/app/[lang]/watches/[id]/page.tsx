import { getDictionary } from "../../../dictionaries";
import { watchService } from "../../../../services/watch.service";
import { ProductGallery } from "../../../../components/watches/pdp/ProductGallery";
import { ProductInfo } from "../../../../components/watches/pdp/ProductInfo";
import { ProductSpecs } from "../../../../components/watches/pdp/ProductSpecs";
import { RelatedWatches } from "../../../../components/watches/pdp/RelatedWatches";
import { notFound } from "next/navigation";
import { watchMetadata, watchJsonLd, safeJsonLd } from "../../../../services/seo";

export async function generateMetadata({ params }: { params: Promise<{ lang: string; id: string }> }) {
  const { lang: requestedLang,id } = await params;
  const lang = requestedLang === 'en' ? 'en' : 'fa';
  const watch = await watchService.getById(id);
  return watch ? watchMetadata(watch,lang) : { title:lang === 'fa' ? 'محصول یافت نشد' : 'Product not found',robots:{ index:false } };
}

export default async function ProductDetailPage({
  params, searchParams
}: {
  params: Promise<{ lang: string, id: string }>;
  searchParams: Promise<{ variant?: string | string[] }>;
}) {
  const { lang: requestedLang, id } = await params;
  const query = await searchParams;
  const requestedVariantId = typeof query.variant === 'string' ? query.variant : undefined;
  const lang = requestedLang === "en" ? "en" : "fa";
  const dict = await getDictionary(lang);
  const isFa = lang === 'fa';
  const watch = await watchService.getById(id);

  if (!watch) {
    notFound();
  }

  return (
    <div className="w-full min-h-screen bg-white pt-24 md:pt-32 pb-24">
      <div className="max-w-[1500px] mx-auto px-6 md:px-12">

        {/* Core Product Layout */}
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 mb-20">
          <ProductGallery watch={watch} isFa={isFa} />
          <ProductInfo key={`${watch.id}:${requestedVariantId || ''}`} lang={lang} dict={dict} isFa={isFa} watch={watch} requestedVariantId={requestedVariantId} />
        </div>

        {/* Extended Details */}
        <ProductSpecs dict={dict} isFa={isFa} watch={watch} />

        {/* Related Watches Section */}
        <RelatedWatches lang={lang} dict={dict} isFa={isFa} currentWatchId={watch.id} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(watchJsonLd(watch,lang)) }} />
      </div>
    </div>
  );
}
