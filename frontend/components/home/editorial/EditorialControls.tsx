export function EditorialControls({ 
  handlePrev, 
  handleNext, 
  currentSlide, 
  totalSlides, 
  isFa 
}: { 
  handlePrev: () => void; 
  handleNext: () => void; 
  currentSlide: number; 
  totalSlides: number; 
  isFa: boolean; 
}) {
  return (
    <div className={`absolute bottom-0 ${isFa ? 'right-0' : 'left-0'} flex bg-white border-t border-gray-200 z-30 shadow-[0_-10px_30px_rgba(0,0,0,0.03)]`} dir="ltr">
      <button onClick={handlePrev} className="w-14 h-14 md:w-20 md:h-20 flex items-center justify-center text-ariwatch-black hover:bg-gray-50 transition-colors border-r border-gray-200 group">
        <svg className="w-5 h-5 md:w-6 md:h-6 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 19l-7-7 7-7"></path>
        </svg>
      </button>
      <button onClick={handleNext} className="w-14 h-14 md:w-20 md:h-20 flex items-center justify-center bg-ariwatch-red text-white hover:bg-red-800 transition-colors group">
        <svg className="w-5 h-5 md:w-6 md:h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5l7 7-7 7"></path>
        </svg>
      </button>
      <div className="h-14 md:h-20 flex items-center px-6 md:px-8 border-l border-gray-200">
        <span className="text-[10px] md:text-xs font-bold tracking-[0.3em] text-ariwatch-gray">
          <span className="text-ariwatch-black">{currentSlide + 1}</span> / {totalSlides}
        </span>
      </div>
    </div>
  );
}
