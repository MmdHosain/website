import { getDictionary } from "../../dictionaries";
import { CatalogBrowser } from "../../../components/watches/CatalogBrowser";
import { apiRequest } from "../../../services/api";
import { Watch } from "../../../types";

export default async function WatchesPage({
  params,
  searchParams: searchParamsPromise,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ category?: string; q?: string; sort?: string; search?: string }>;
}) {
  const { lang: requestedLang } = await params;
  const lang = requestedLang === "en" ? "en" : "fa";
  const searchParams = await searchParamsPromise;
  const dict = await getDictionary(lang);
  const isFa = lang === "fa";
  const currentCategory = ["original", "highcopy", "custom"].includes(searchParams.category || "") ? searchParams.category! : "all";
  const currentSort = ["price-asc", "price-desc", "name-asc"].includes(searchParams.sort || "") ? searchParams.sort! : "featured";
  const query = typeof searchParams.q === "string" ? searchParams.q.trim().slice(0, 100) : "";
  const retryParams = new URLSearchParams();
  if (currentCategory !== "all") retryParams.set("category", currentCategory);
  if (currentSort !== "featured") retryParams.set("sort", currentSort);
  if (query) retryParams.set("q", query);
  let watches: Watch[] = [];
  let failed = false;
  try { watches = await apiRequest<Watch[]>(`/api/watches${query ? `?q=${encodeURIComponent(query)}` : ''}`); }
  catch { failed = true; }

  return (
    <div className="w-full min-h-screen bg-white pt-24 md:pt-32 pb-24">
      <div className="max-w-[1600px] mx-auto px-6 md:px-12">
        <div className="text-center mb-12 flex flex-col items-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-ariwatch-black uppercase tracking-wide mb-4">{dict.plp.title}</h1>
          <p className="text-ariwatch-gray text-sm md:text-base max-w-2xl mx-auto leading-relaxed">{dict.plp.subtitle}</p>
        </div>
        {failed ? (
          <div className="py-16 text-center" role="alert">
            <p className="text-gray-600">{isFa ? "بارگذاری مجموعه انجام نشد. لطفاً دوباره تلاش کنید." : "We could not load the collection. Please try again."}</p>
            <a href={`/${lang}/watches${retryParams.size ? `?${retryParams.toString()}` : ""}`} className="inline-block mt-5 text-ariwatch-red underline">{isFa ? "تلاش دوباره" : "Try again"}</a>
          </div>
        ) : (
          <CatalogBrowser key={`${lang}:${currentCategory}:${currentSort}:${query}`} lang={lang} dict={dict} watches={watches} currentCategory={currentCategory} initialQuery={query} currentSort={currentSort} focusSearch={searchParams.search === "1"} />
        )}
      </div>
    </div>
  );
}
