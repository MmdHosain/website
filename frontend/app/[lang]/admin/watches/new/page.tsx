import Link from "next/link";
import { getDictionary } from "../../../../dictionaries";
import { watchService } from "../../../../../services/watch.service";
import { WatchForm } from "../../../../../components/admin/WatchForm";
import { Watch } from "../../../../../types";

export default async function NewWatchPage({
  params,
  searchParams: searchParamsPromise,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ id?: string }>;
}) {
  const { lang: requestedLang } = await params;
  const lang = requestedLang === "en" ? "en" : "fa";
  const searchParams = await searchParamsPromise;
  const dict = await getDictionary(lang);
  const isFa = lang === "fa";
  const isEdit = typeof searchParams.id === "string" && !!searchParams.id;
  let initialData: Watch | null = null;
  let failed = false;
  if (isEdit) {
    try { initialData = await watchService.getById(searchParams.id!); }
    catch { failed = true; }
    if (!initialData) return (
      <div className="max-w-3xl mx-auto p-8 bg-white border border-gray-200">
        <p role="alert" className="text-gray-600">{failed ? (isFa ? "بارگذاری محصول انجام نشد. دوباره تلاش کنید." : "Could not load the product. Please try again.") : (isFa ? "این محصول پیدا نشد." : "This product could not be found.")}</p>
        <Link href={`/${lang}/admin`} className="inline-block mt-5 text-sm text-ariwatch-red underline">{isFa ? "بازگشت به محصولات" : "Back to products"}</Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-serif text-ariwatch-black mb-8">{isEdit ? dict.admin.edit : dict.admin.addNew}</h1>
      <div className="bg-white p-6 md:p-8 rounded-md border border-gray-200">
        <WatchForm key={initialData?.id || "new"} lang={lang} dict={dict} initialData={initialData} />
      </div>
    </div>
  );
}
