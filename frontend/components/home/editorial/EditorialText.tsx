export function EditorialText({ activeSlide, isFa, discoverText, currentSlide }: { activeSlide: any, isFa: boolean, discoverText: string, currentSlide: number }) {
  return (
    <div className="w-full flex flex-col justify-center animate-fade-in-up" key={`text-${currentSlide}`} style={{ animationDelay: '200ms' }}>
      <h3 className="text-4xl md:text-6xl lg:text-7xl font-serif text-ariwatch-red mb-4 md:mb-6 uppercase tracking-wider drop-shadow-sm">
        {activeSlide.brand}
      </h3>
      <h4 className="text-sm md:text-lg font-bold tracking-[0.25em] text-ariwatch-black mb-6 md:mb-8 uppercase">
        {activeSlide.title}
      </h4>
      <p className="text-sm md:text-base text-ariwatch-gray leading-[2] mb-10 max-w-lg">
        {activeSlide.desc}
      </p>
      
      {/* Animated Button */}
      <button className="group flex items-center gap-4 text-[10px] md:text-xs font-bold tracking-widest text-ariwatch-black uppercase self-start">
        <span className="border-b border-ariwatch-black pb-1 group-hover:text-ariwatch-red group-hover:border-ariwatch-red transition-colors duration-300">
          {discoverText}
        </span>
        <svg 
          className={`w-4 h-4 text-ariwatch-black group-hover:text-ariwatch-red transition-all duration-300 ${isFa ? 'group-hover:-translate-x-2 rotate-180' : 'group-hover:translate-x-2'}`} 
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
      </button>
    </div>
  );
}
