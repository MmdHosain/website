import Link from "next/link";

export function FilterBar({ lang, dict, isFa, currentCategory }: { lang: string, dict: any, isFa: boolean, currentCategory: string }) {
  const filters = [
    { id: 'all', label: dict.plp.filters.all },
    { id: 'original', label: dict.plp.filters.original },
    { id: 'highcopy', label: dict.plp.filters.highCopy },
    { id: 'custom', label: dict.plp.filters.custom }
  ];

  return (
    <div className="flex flex-col md:flex-row justify-between items-center border-y border-gray-200 py-4 mb-12 gap-4">
      {/* Category Links */}
      <div className="flex gap-6 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
        {filters.map(filter => (
          <Link 
            key={filter.id} 
            href={`/${lang}/watches${filter.id !== 'all' ? `?category=${filter.id}` : ''}`}
            className={`text-[10px] md:text-xs font-bold tracking-widest uppercase whitespace-nowrap transition-colors ${
              currentCategory === filter.id 
                ? 'text-ariwatch-red border-b border-ariwatch-red pb-1' 
                : 'text-ariwatch-gray hover:text-ariwatch-black pb-1'
            }`}
          >
            {filter.label}
          </Link>
        ))}
      </div>
      
      {/* Sort Dropdown Placeholder */}
      <div className="flex items-center gap-2 text-[10px] md:text-xs font-bold tracking-widest text-ariwatch-black uppercase w-full md:w-auto justify-end cursor-pointer group">
        <span>{dict.plp.sort}</span>
        <svg className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
}
