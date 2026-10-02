"use client";
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Watch } from '../../types';
import { apiRequest } from '../../services/api';
import { useCollections } from '../../context/CollectionContext';
import { FilterBar } from './FilterBar';
import { ProductGrid } from './ProductGrid';
import { useCatalogClock } from '../../hooks/useCatalogClock';
export function CatalogBrowser({ lang, dict, watches, currentCategory, currentSort, initialQuery, focusSearch }: {
  lang: string; dict: any; watches: Watch[]; currentCategory: string; currentSort: string; initialQuery: string; focusSearch: boolean;
}) {
  const [query, setQuery] = useState(initialQuery), [results, setResults] = useState(watches);
  const [loading, setLoading] = useState(false), [error, setError] = useState('');
  const version = useRef(0), { error: collectionError } = useCollections();
  const now = useCatalogClock(results), fa = lang === 'fa';
  useEffect(() => {
    const current = ++version.current;
    setLoading(true);
    const timer = setTimeout(async () => {
      const params = new URLSearchParams(window.location.search);
      if (query.trim()) params.set('q', query.trim()); else params.delete('q');
      params.delete('search');
      window.history.replaceState(null, '', `${window.location.pathname}${params.size ? `?${params}` : ''}`);
      try {
        const data = await apiRequest<Watch[]>(`/api/watches${query.trim() ? `?q=${encodeURIComponent(query.trim())}` : ''}`);
        if (version.current === current) { setResults(data); setError(''); }
      } catch (cause) {
        if (version.current === current) setError(cause instanceof Error ? cause.message : (fa ? 'جست‌وجو انجام نشد.' : 'Search is unavailable.'));
      } finally { if (version.current === current) setLoading(false); }
    }, 180);
    return () => { clearTimeout(timer); version.current++; };
  }, [query, fa]);
  return <>
    <nav className="flex justify-end gap-5 mb-5 text-sm"><Link className="underline" href={`/${lang}/wishlist`}>{fa ? 'علاقه‌مندی‌ها' : 'Saved watches'}</Link><Link className="underline" href={`/${lang}/compare`}>{fa ? 'مقایسه' : 'Compare'}</Link></nav>
    <FilterBar lang={lang} dict={dict} isFa={fa} currentCategory={currentCategory} currentSort={currentSort} query={query} focusSearch={focusSearch} onQueryChange={setQuery} />
    {loading && <p role="status" className="text-xs text-gray-500 mb-4">{fa ? 'در حال جست‌وجو…' : 'Searching…'}</p>}
    {(error || collectionError) && <p role="alert" className="mb-5 p-4 bg-red-50 text-red-700 text-sm">{error || collectionError}</p>}
    <ProductGrid lang={lang} dict={dict} isFa={fa} watches={results} currentCategory={currentCategory} currentSort={currentSort} query={query} now={now} />
  </>;
}
