"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export function FilterBar({ lang, dict, isFa, currentCategory, currentSort = "featured", query = "", focusSearch = false, onQueryChange }: {
  lang: string;
  dict: any;
  isFa: boolean;
  currentCategory: string;
  currentSort?: string;
  query?: string;
  focusSearch?: boolean;
  onQueryChange?: (query: string) => void;
}) {
  const router = useRouter();
  const filters = [
    { id: "all", label: dict.plp.filters.all },
    { id: "original", label: dict.plp.filters.original },
    { id: "highcopy", label: dict.plp.filters.highCopy },
    { id: "custom", label: dict.plp.filters.custom },
  ];

  const catalogUrl = (category: string, sort: string) => {
    const params = new URLSearchParams();
    if (category !== "all") params.set("category", category);
    if (query) params.set("q", query);
    if (sort !== "featured") params.set("sort", sort);
    const suffix = params.toString();
    return `/${lang}/watches${suffix ? `?${suffix}` : ""}`;
  };

  return (
    <div className="mb-10">
      <form action={`/${lang}/watches`} method="get" onSubmit={event => { if (onQueryChange) event.preventDefault(); }} className="max-w-2xl mx-auto mb-8 flex items-end gap-3">
        {currentCategory !== "all" && <input type="hidden" name="category" value={currentCategory} />}
        {currentSort !== "featured" && <input type="hidden" name="sort" value={currentSort} />}
        <div className="flex-1 min-w-0">
          <label htmlFor="catalog-search" className="block mb-2 text-xs font-bold text-gray-600">{isFa ? "جست‌وجوی ساعت" : "Search the collection"}</label>
          <input autoFocus={focusSearch} id="catalog-search" type="search" name="q" value={query} onChange={event => onQueryChange?.(event.target.value)} maxLength={100} placeholder={isFa ? "نام ساعت یا برند…" : "Watch name or brand…"} className="w-full border border-gray-300 px-4 py-3 text-sm outline-none focus:border-ariwatch-black" />
        </div>
        <button type="submit" className="bg-ariwatch-black text-white px-5 py-3 text-sm font-bold">{isFa ? "جست‌وجو" : "Search"}</button>
      </form>
      <div className="flex flex-col md:flex-row justify-between items-center border-y border-gray-200 py-4 gap-4">
        <nav aria-label={isFa ? "دسته‌بندی ساعت‌ها" : "Watch categories"} className="flex gap-6 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
          {filters.map((filter) => (
            <Link key={filter.id} href={catalogUrl(filter.id, currentSort)} aria-current={currentCategory === filter.id ? "page" : undefined} className={`text-[10px] md:text-xs font-bold tracking-widest uppercase whitespace-nowrap transition-colors pb-1 ${currentCategory === filter.id ? "text-ariwatch-red border-b border-ariwatch-red" : "text-ariwatch-gray hover:text-ariwatch-black"}`}>
              {filter.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <label htmlFor="catalog-sort" className="text-xs font-bold text-ariwatch-black whitespace-nowrap">{dict.plp.sort}</label>
          <select id="catalog-sort" value={currentSort} onChange={(event) => router.push(catalogUrl(currentCategory, event.target.value))} className="bg-white border border-gray-200 p-2 text-xs outline-none focus:border-ariwatch-black">
            <option value="featured">{isFa ? "پیشنهادی" : "Featured"}</option>
            <option value="price-asc">{isFa ? "قیمت: کم به زیاد" : "Price: low to high"}</option>
            <option value="price-desc">{isFa ? "قیمت: زیاد به کم" : "Price: high to low"}</option>
            <option value="name-asc">{isFa ? "نام: الف تا ی" : "Name: A to Z"}</option>
          </select>
        </div>
      </div>
    </div>
  );
}
