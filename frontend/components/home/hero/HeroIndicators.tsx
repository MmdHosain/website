interface HeroIndicatorsProps {
  totalSlides: number;
  currentSlide: number;
  onSelectSlide: (index: number) => void;
  isFa?: boolean;
}

export function HeroIndicators({ totalSlides, currentSlide, onSelectSlide, isFa }: HeroIndicatorsProps) {
  return (
    <div 
      className={`absolute top-1/2 -translate-y-1/2 ${isFa ? 'left-3' : 'right-3'} md:left-auto md:right-auto md:top-auto md:translate-y-0 md:bottom-12 md:left-1/2 md:-translate-x-1/2 z-30 flex flex-col md:flex-row items-center gap-2 md:gap-3`} 
      dir="ltr"
    >
      {Array.from({ length: totalSlides }).map((_, idx) => (
        <button 
          key={idx}
          onClick={() => onSelectSlide(idx)}
          className={`relative rounded-full transition-all duration-700 ease-in-out ${
            idx === currentSlide 
              ? 'h-8 w-[2px] md:h-[2px] md:w-20 bg-ariwatch-red md:bg-[#121212]/50' 
              : 'h-1 w-1 md:h-[2px] md:w-6 bg-black/20 md:bg-[#121212]/15 hover:bg-black/40 md:hover:bg-[#121212]/30'
          }`}
          aria-label={`Go to slide ${idx + 1}`}
        />
      ))}
    </div>
  );
}
