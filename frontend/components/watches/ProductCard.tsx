import Link from "next/link";

export function ProductCard({ lang, dict, isFa, watch }: { lang: string, dict: any, isFa: boolean, watch: any }) {
  // Determine category badge text and style
  const category = watch.category || 'original'; // default fallback
  const badgeText = 
    category === 'original' ? dict.plp.filters.original : 
    category === 'highcopy' ? dict.plp.filters.highCopy : 
    dict.plp.filters.custom;
    
  const badgeClass = 
    category === 'original' ? 'bg-ariwatch-black text-white' : 
    category === 'highcopy' ? 'bg-white text-ariwatch-black border border-gray-200' : 
    'bg-ariwatch-red text-white';

  return (
    <Link href={`/${lang}/watches/${watch.id}`} className="group block">
      {/* Image Container */}
      <div className="relative w-full aspect-[4/5] bg-[#f4f4f4] mb-6 overflow-hidden flex items-center justify-center border border-gray-100">
        {/* If backend image exists, normally would use Next/Image. Using geometry placeholder for now. */}
        <div className="w-3/4 h-3/4 bg-gray-200/50 rounded-full flex items-center justify-center shadow-inner">
          <span className="text-gray-400 font-serif text-sm">{watch.imageUrl !== 'placeholder' ? watch.imageUrl : 'Watch Front'}</span>
        </div>
        
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10 flex items-center justify-center">
          <button className="translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500 bg-white text-ariwatch-black text-[10px] font-bold tracking-widest uppercase px-6 py-3 shadow-lg hover:bg-black hover:text-white">
            {dict.plp.viewDetails}
          </button>
        </div>
        
        {/* Badges */}
        <div className={`absolute top-4 ${isFa ? 'right-4' : 'left-4'} text-[9px] font-bold tracking-widest uppercase px-2 py-1 z-20 shadow-sm ${badgeClass}`}>
          {badgeText}
        </div>
      </div>
      
      {/* Info Container */}
      <div className="flex flex-col items-center text-center px-4">
        <h3 className="text-lg md:text-xl font-serif text-ariwatch-black uppercase tracking-wider mb-2 group-hover:text-ariwatch-red transition-colors">
          {watch.name}
        </h3>
        <p className="text-xs text-ariwatch-gray mb-3 line-clamp-1">
          {watch.description}
        </p>
        <span className="text-sm font-bold tracking-widest text-ariwatch-black">
          ${Number(watch.price).toLocaleString()}
        </span>
      </div>
    </Link>
  );
}
