interface HeroVisualProps {
  activeSlide: {
    id: number;
    brand: string;
    model: string;
    type: string;
  };
  isFa: boolean;
}

export function HeroVisual({ activeSlide, isFa }: HeroVisualProps) {
  return (
    <div className={`w-full h-1/2 md:h-full md:w-[55%] relative flex items-center justify-center z-10 ${isFa ? 'order-1 md:order-2' : 'order-1 md:order-2'}`}>
      
      {/* Abstract Ambient Background Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.4)_0%,transparent_70%)] opacity-50"></div>

      {/* Dynamic Slide Content */}
      <div 
        key={activeSlide.id} 
        className="relative w-full h-full flex items-center justify-center animate-cinematic-enter group [perspective:1200px]"
      >
        {/* Watch Model Typography */}
        <div className="absolute left-4 md:left-12 top-1/2 -translate-y-1/2 z-0 hidden md:block">
           <span className="text-[10px] tracking-[0.4em] text-ariwatch-gray/40 uppercase font-bold" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
             {activeSlide.brand}
           </span>
        </div>

        <div className="absolute right-6 sm:right-8 md:right-16 bottom-4 sm:bottom-8 md:bottom-1/4 z-30 text-right md:text-left pointer-events-none">
           <h3 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-serif text-[#121212] tracking-wider mb-1 md:mb-2 drop-shadow-sm">
             {activeSlide.model}
           </h3>
           <p className="text-[10px] md:text-sm tracking-widest text-ariwatch-gray uppercase font-bold">
             {activeSlide.type}
           </p>
        </div>

        {/* 3D Neumorphic Abstract Watch Placeholder */}
        <div className="relative w-48 h-48 sm:w-56 sm:h-56 md:w-80 md:h-80 rounded-full bg-ariwatch-luxury shadow-[10px_10px_30px_#cfceca,-10px_-10px_30px_#ffffff] md:shadow-[20px_20px_60px_#cfceca,-20px_-20px_60px_#ffffff] border border-white/40 flex items-center justify-center transition-transform duration-1000 ease-out group-hover:scale-105 group-hover:[transform:rotateX(5deg)_rotateY(-5deg)] z-20">
           {/* Inner Dial (Debossed) */}
           <div className="w-40 h-40 sm:w-48 sm:h-48 md:w-72 md:h-72 rounded-full bg-ariwatch-luxury shadow-[inset_5px_5px_15px_#cfceca,inset_-5px_-5px_15px_#ffffff] md:shadow-[inset_10px_10px_30px_#cfceca,inset_-10px_-10px_30px_#ffffff] flex items-center justify-center relative">
              {/* Abstract Watch Hands */}
              <div className="absolute w-[2px] h-16 sm:h-20 md:h-28 bg-[#121212] rounded-full origin-bottom top-4 sm:top-4 md:top-8 transform rotate-45 shadow-sm"></div>
              <div className="absolute w-[3px] h-10 sm:h-12 md:h-20 bg-[#666666] rounded-full origin-bottom top-10 sm:top-12 md:top-16 transform -rotate-12 shadow-sm"></div>
              {/* Center Pin */}
              <div className="w-2 h-2 md:w-3 md:h-3 bg-ariwatch-red rounded-full z-10 shadow-md border-[1px] md:border-2 border-white"></div>
              {/* Minimalist Tick Marks */}
              <div className="absolute inset-2 border-[1px] border-dashed border-gray-300/50 rounded-full animate-spin-slow"></div>
           </div>
        </div>

        {/* Floating Luxury Icons (Stars/Sparks) */}
        <div className="absolute top-1/4 right-1/4 z-30 animate-float text-ariwatch-red/50">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="drop-shadow-md w-4 h-4 md:w-6 md:h-6">
            <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
          </svg>
        </div>
        <div className="absolute bottom-1/3 left-1/4 md:left-1/3 z-30 animate-float-reverse text-gray-400/40">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 md:w-4 md:h-4">
            <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
          </svg>
        </div>
      </div>
    </div>
  );
}
