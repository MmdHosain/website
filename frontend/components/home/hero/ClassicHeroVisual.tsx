import type { ClassicHeroSlide } from "./classic.data";

interface ClassicHeroVisualProps {
  activeSlide: ClassicHeroSlide;
  currentSlide: number;
  totalSlides: number;
  isFa: boolean;
  paused: boolean;
}

export function ClassicHeroVisual({ activeSlide, currentSlide, totalSlides, isFa, paused }: ClassicHeroVisualProps) {
  const animationStyle = { animationPlayState: paused ? "paused" : "running" } as const;

  return (
    <div className="relative z-10 order-1 flex h-1/2 w-full items-center justify-center md:order-2 md:h-full md:w-[55%]"
      role="group" aria-roledescription={isFa ? "اسلاید" : "slide"}
      aria-label={`${currentSlide + 1} ${isFa ? "از" : "of"} ${totalSlides}: ${activeSlide.brand} ${activeSlide.model}`}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.4)_0%,transparent_70%)] opacity-50" aria-hidden="true" />
      <div key={activeSlide.id} className="group relative flex h-full w-full items-center justify-center [perspective:1200px] motion-safe:animate-cinematic-enter">
        <div className="absolute left-4 top-1/2 z-0 hidden -translate-y-1/2 md:left-12 md:block">
          <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-ariwatch-gray/40" style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}>
            {activeSlide.brand}
          </span>
        </div>
        <div className="pointer-events-none absolute bottom-4 right-6 z-30 text-right sm:bottom-8 sm:right-8 md:bottom-1/4 md:right-16 md:text-left" dir="ltr">
          <h2 className="mb-1 font-serif text-2xl tracking-wider text-[#121212] drop-shadow-sm sm:text-3xl md:mb-2 md:text-5xl lg:text-6xl">
            {activeSlide.model}
          </h2>
          <p className="text-[10px] font-bold uppercase tracking-widest text-ariwatch-gray md:text-sm" dir={isFa ? "rtl" : "ltr"}>
            {isFa ? activeSlide.typeFa : activeSlide.type}
          </p>
        </div>
        <div className="relative z-20 flex h-36 w-36 items-center justify-center rounded-full border border-white/40 bg-ariwatch-luxury shadow-[10px_10px_30px_#cfceca,-10px_-10px_30px_#ffffff] transition-transform duration-1000 ease-out sm:h-56 sm:w-56 md:h-80 md:w-80 md:shadow-[20px_20px_60px_#cfceca,-20px_-20px_60px_#ffffff] motion-safe:group-hover:scale-105 motion-safe:group-hover:[transform:rotateX(5deg)_rotateY(-5deg)]" aria-hidden="true">
          <div className="relative flex h-28 w-28 items-center justify-center rounded-full bg-ariwatch-luxury shadow-[inset_5px_5px_15px_#cfceca,inset_-5px_-5px_15px_#ffffff] sm:h-48 sm:w-48 md:h-72 md:w-72 md:shadow-[inset_10px_10px_30px_#cfceca,inset_-10px_-10px_30px_#ffffff]">
            <div className="absolute top-4 h-10 w-[2px] origin-bottom rotate-45 rounded-full bg-[#121212] shadow-sm sm:h-20 md:top-8 md:h-28" />
            <div className="absolute top-8 h-6 w-[3px] origin-bottom -rotate-12 rounded-full bg-[#666666] shadow-sm sm:top-12 sm:h-12 md:top-16 md:h-20" />
            <div className="z-10 h-2 w-2 rounded-full border border-white bg-ariwatch-red shadow-md md:h-3 md:w-3 md:border-2" />
            <div className="absolute inset-2 rounded-full border border-dashed border-gray-300/50 motion-safe:animate-spin-slow" style={animationStyle} />
          </div>
        </div>
        <div className="absolute right-1/4 top-1/4 z-30 text-ariwatch-red/50 motion-safe:animate-float" style={animationStyle} aria-hidden="true">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 drop-shadow-md md:h-6 md:w-6">
            <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
          </svg>
        </div>
        <div className="absolute bottom-1/3 left-1/4 z-30 text-gray-400/40 md:left-1/3 motion-safe:animate-float-reverse" style={animationStyle} aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="h-3 w-3 md:h-4 md:w-4">
            <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
          </svg>
        </div>
      </div>
    </div>
  );
}
