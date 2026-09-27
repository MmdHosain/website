import Link from "next/link";

interface ThreePathsSectionProps {
  lang: 'en' | 'fa';
  dict: any;
  isFa: boolean;
}

export function ThreePathsSection({ lang, dict, isFa }: ThreePathsSectionProps) {
  return (
    <section className="py-32 px-8 bg-ariwatch-cream">
      <div className="text-center mb-20">
        <span className="text-[10px] font-bold tracking-widest text-ariwatch-red uppercase mb-4 block">
          {dict.home.threePaths}
        </span>
        <h2 className="text-4xl md:text-5xl font-light text-ariwatch-black uppercase tracking-widest mb-6">
          {dict.home.chooseType}
        </h2>
        <p className="text-ariwatch-gray text-sm md:text-base">{dict.home.chooseTypeDesc}</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-[1600px] mx-auto">
        
        {/* Path 1: Original */}
        <div className={`relative h-[650px] flex flex-col justify-end p-10 group overflow-hidden bg-gray-800 ${isFa ? 'text-right' : 'text-left'}`}>
          {/* Background Image Placeholder */}
          <div className="absolute inset-0 flex items-center justify-center z-0 opacity-50">
            <span className="text-white font-serif text-2xl">Original Watches Image</span>
          </div>
          {/* Dark Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent z-10"></div>
          
          {/* Top Badge */}
          <div className={`absolute top-8 ${isFa ? 'right-8' : 'left-8'} bg-ariwatch-red text-white text-[10px] font-bold px-4 py-2 tracking-widest uppercase z-20`}>
            {dict.home.pathOriginal}
          </div>
          
          {/* Content */}
          <div className="relative z-20 text-white">
            <span className="text-[10px] font-bold tracking-widest mb-3 block uppercase">{dict.home.pathOriginalSub}</span>
            <h3 className="text-3xl font-light mb-4 uppercase tracking-wider">{dict.home.originalWatches}</h3>
            <p className="text-sm text-gray-300 mb-10 leading-relaxed max-w-sm">{dict.home.pathOriginalDesc}</p>
            <Link href={`/${lang}/watches?category=original`}>
              <button className="border border-white bg-transparent px-8 py-3 text-xs font-bold tracking-widest uppercase hover:bg-white hover:text-ariwatch-black transition">
                {dict.home.viewOriginal}
              </button>
            </Link>
          </div>
        </div>

        {/* Path 2: High Copy (Non-Original) */}
        <div className={`relative h-[650px] flex flex-col justify-end p-10 group overflow-hidden bg-gray-700 ${isFa ? 'text-right' : 'text-left'}`}>
          <div className="absolute inset-0 flex items-center justify-center z-0 opacity-50">
            <span className="text-white font-serif text-2xl">High Copy Watches Image</span>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent z-10"></div>
          
          {/* Top Badge (White for Non-Original) */}
          <div className={`absolute top-8 ${isFa ? 'right-8' : 'left-8'} bg-white text-ariwatch-black text-[10px] font-bold px-4 py-2 tracking-widest uppercase z-20`}>
            {dict.home.pathHighCopy}
          </div>
          
          <div className="relative z-20 text-white">
            <span className="text-[10px] font-bold tracking-widest mb-3 block uppercase">{dict.home.pathHighCopySub}</span>
            <h3 className="text-3xl font-light mb-4 uppercase tracking-wider">{dict.home.pathHighCopyTitle}</h3>
            <p className="text-sm text-gray-300 mb-10 leading-relaxed max-w-sm">{dict.home.pathHighCopyDesc}</p>
            <Link href={`/${lang}/watches?category=highcopy`}>
              <button className="border border-white bg-transparent px-8 py-3 text-xs font-bold tracking-widest uppercase hover:bg-white hover:text-ariwatch-black transition">
                {dict.home.viewHighCopy}
              </button>
            </Link>
          </div>
        </div>

        {/* Path 3: Custom Order */}
        <div className={`relative h-[650px] flex flex-col justify-end p-10 group overflow-hidden bg-gray-900 ${isFa ? 'text-right' : 'text-left'}`}>
          <div className="absolute inset-0 flex items-center justify-center z-0 opacity-50">
            <span className="text-white font-serif text-2xl">Custom Order Image</span>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent z-10"></div>
          
          {/* Top Badge */}
          <div className={`absolute top-8 ${isFa ? 'right-8' : 'left-8'} bg-ariwatch-red text-white text-[10px] font-bold px-4 py-2 tracking-widest uppercase z-20`}>
            {dict.home.pathCustom}
          </div>
          
          <div className="relative z-20 text-white">
            <span className="text-[10px] font-bold tracking-widest mb-3 block uppercase">{dict.home.pathCustomSub}</span>
            <h3 className="text-3xl font-light mb-4 uppercase tracking-wider">{dict.home.pathCustomTitle}</h3>
            <p className="text-sm text-gray-300 mb-10 leading-relaxed max-w-sm">{dict.home.pathCustomDesc}</p>
            <Link href={`/${lang}/watches?category=custom`}>
              <button className="border border-white bg-transparent px-8 py-3 text-xs font-bold tracking-widest uppercase hover:bg-white hover:text-ariwatch-black transition">
                {dict.home.requestModel}
              </button>
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}
