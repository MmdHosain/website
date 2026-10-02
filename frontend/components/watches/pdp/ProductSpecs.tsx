import { Watch } from "../../../types";
export function ProductSpecs({ dict, isFa, watch }: { dict: any; isFa: boolean; watch: Watch }) {
  const category = watch.category === 'original' ? dict.plp.filters.original : watch.category === 'highcopy' ? dict.plp.filters.highCopy : dict.plp.filters.custom;
  return <section className="mt-16 border-t border-gray-100 pt-12">
    <h2 className="text-2xl font-serif mb-8">{isFa ? 'اطلاعات محصول' : 'Product details'}</h2>
    <dl className="grid sm:grid-cols-2 gap-8">
      <div><dt className="text-xs text-gray-500 mb-2">{isFa ? 'مدل' : 'Model'}</dt><dd>{watch.name}</dd></div>
      <div><dt className="text-xs text-gray-500 mb-2">{isFa ? 'دسته‌بندی' : 'Collection'}</dt><dd>{category}</dd></div>
      <div className="sm:col-span-2"><dt className="text-xs text-gray-500 mb-2">{isFa ? 'توضیحات' : 'Description'}</dt><dd className="text-sm leading-relaxed">{watch.description}</dd></div>
    </dl>
  </section>;
}
