interface HeroIndicatorsProps {
  totalSlides: number;
  currentSlide: number;
  onSelectSlide: (index: number) => void;
  isFa?: boolean;
}

export function HeroIndicators({ totalSlides, currentSlide, onSelectSlide, isFa }: HeroIndicatorsProps) {
  return (
    <div 
      className={`absolute top-1/2 -translate-y-1/2 ${isFa ? 'left-4 md:left-auto md:right-16 lg:right-24' : 'right-4 md:right-auto md:left-16 lg:left-24'} md:top-auto md:translate-y-0 md:bottom-12 z-30 flex flex-col md:flex-row items-center gap-2 md:gap-3`} 
      dir="ltr"
    >
      {Array.from({ length: totalSlides }).map((_, idx) => (
        <button 
          key={idx}
          onClick={() => onSelectSlide(idx)}
          className={`relative rounded-full transition-all duration-700 ease-in-out ${
            idx === currentSlide 
              ? 'h-8 w-[3px] md:h-[2px] md:w-20 bg-[#121212]/50 md:bg-[#121212]/30' 
              : 'h-3 w-[3px] md:h-[2px] md:w-6 bg-[#121212]/15 hover:bg-[#121212]/30'
          }`}
          aria-label={`Go to slide ${idx + 1}`}
        />
      ))}
    </div>
  );
}
