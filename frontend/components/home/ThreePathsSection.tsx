import Link from "next/link";

interface ThreePathsSectionProps {
  lang: 'en' | 'fa';
  dict: any;
  isFa: boolean;
}

export function ThreePathsSection({ lang, dict, isFa }: ThreePathsSectionProps) {
  return (
    <section className="py-24 md:py-32 px-6 md:px-12 bg-ariwatch-cream">
      <div className="text-center mb-16 md:mb-20">
        <span className="text-[10px] md:text-xs font-bold tracking-widest text-ariwatch-red uppercase mb-4 block">
          {dict.home.threePaths}
        </span>
        <h2 className="text-3xl md:text-5xl lg:text-[56px] font-light text-ariwatch-black uppercase tracking-widest mb-6 leading-tight">
          {dict.home.chooseType}
        </h2>
        <p className="text-ariwatch-gray text-sm md:text-base max-w-2xl mx-auto">
          {dict.home.chooseTypeDesc}
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-[1600px] mx-auto">
        
        {/* Path 1: Original */}
        <div className={`relative h-[550px] md:h-[650px] flex flex-col justify-end p-8 md:p-10 group overflow-hidden bg-gray-900 ${isFa ? 'text-right' : 'text-left'}`}>
          {/* Background Image */}
          <img 
            src="https://images.unsplash.com/photo-1524592094714-0f0654e20314?q=80&w=1000&auto=format&fit=crop" 
            alt="Original Watches" 
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 z-0"
          />
          {/* Dark Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-[#121212]/40 to-transparent z-10 opacity-90"></div>
          
          {/* Top Badge */}
          <div className={`absolute top-6 md:top-8 ${isFa ? 'right-6 md:right-8' : 'left-6 md:left-8'} bg-ariwatch-red text-white text-[10px] font-bold px-4 py-2 tracking-widest uppercase z-20`}>
            {dict.home.pathOriginal}
          </div>
          
          {/* Content */}
          <div className="relative z-20 text-white">
            <span className="text-[9px] md:text-[10px] font-bold tracking-widest mb-3 block uppercase text-gray-300">
              {dict.home.pathOriginalSub}
            </span>
            <h3 className="text-3xl md:text-4xl font-light mb-4 uppercase tracking-wider">
              {dict.home.originalWatches}
            </h3>
            <p className="text-sm text-gray-300 mb-8 md:mb-10 leading-relaxed max-w-sm">
              {dict.home.pathOriginalDesc}
            </p>
            <Link href={`/${lang}/watches?category=original`}>
              <button className="border border-white bg-transparent px-8 py-3 text-[10px] md:text-xs font-bold tracking-widest uppercase hover:bg-white hover:text-ariwatch-black transition duration-300">
                {dict.home.viewOriginal}
              </button>
            </Link>
          </div>
        </div>

        {/* Path 2: High Copy (Non-Original) */}
        <div className={`relative h-[550px] md:h-[650px] flex flex-col justify-end p-8 md:p-10 group overflow-hidden bg-gray-800 ${isFa ? 'text-right' : 'text-left'}`}>
          <img 
            src="https://images.unsplash.com/photo-1587836374828-cb4387df3eb7?q=80&w=1000&auto=format&fit=crop" 
            alt="High Copy Watches" 
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 z-0"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-[#121212]/40 to-transparent z-10 opacity-90"></div>
          
          {/* Top Badge (White for Non-Original) */}
          <div className={`absolute top-6 md:top-8 ${isFa ? 'right-6 md:right-8' : 'left-6 md:left-8'} bg-white text-ariwatch-black text-[10px] font-bold px-4 py-2 tracking-widest uppercase z-20`}>
            {dict.home.pathHighCopy}
          </div>
          
          <div className="relative z-20 text-white">
            <span className="text-[9px] md:text-[10px] font-bold tracking-widest mb-3 block uppercase text-gray-300">
              {dict.home.pathHighCopySub}
            </span>
            <h3 className="text-3xl md:text-4xl font-light mb-4 uppercase tracking-wider">
              {dict.home.pathHighCopyTitle}
            </h3>
            <p className="text-sm text-gray-300 mb-8 md:mb-10 leading-relaxed max-w-sm">
              {dict.home.pathHighCopyDesc}
            </p>
            <Link href={`/${lang}/watches?category=highcopy`}>
              <button className="border border-white bg-transparent px-8 py-3 text-[10px] md:text-xs font-bold tracking-widest uppercase hover:bg-white hover:text-ariwatch-black transition duration-300">
                {dict.home.viewHighCopy}
              </button>
            </Link>
          </div>
        </div>

        {/* Path 3: Custom Order */}
        <div className={`relative h-[550px] md:h-[650px] flex flex-col justify-end p-8 md:p-10 group overflow-hidden bg-gray-900 ${isFa ? 'text-right' : 'text-left'}`}>
          <img 
            src="https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=1000&auto=format&fit=crop" 
            alt="Custom Order Watches" 
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 z-0"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-[#121212]/40 to-transparent z-10 opacity-90"></div>
          
          {/* Top Badge */}
          <div className={`absolute top-6 md:top-8 ${isFa ? 'right-6 md:right-8' : 'left-6 md:left-8'} bg-ariwatch-red text-white text-[10px] font-bold px-4 py-2 tracking-widest uppercase z-20`}>
            {dict.home.pathCustom}
          </div>
          
          <div className="relative z-20 text-white">
            <span className="text-[9px] md:text-[10px] font-bold tracking-widest mb-3 block uppercase text-gray-300">
              {dict.home.pathCustomSub}
            </span>
            <h3 className="text-3xl md:text-4xl font-light mb-4 uppercase tracking-wider">
              {dict.home.pathCustomTitle}
            </h3>
            <p className="text-sm text-gray-300 mb-8 md:mb-10 leading-relaxed max-w-sm">
              {dict.home.pathCustomDesc}
            </p>
            <Link href={`/${lang}/watches?category=custom`}>
              <button className="border border-white bg-transparent px-8 py-3 text-[10px] md:text-xs font-bold tracking-widest uppercase hover:bg-white hover:text-ariwatch-black transition duration-300">
                {dict.home.requestModel}
              </button>
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}
