export function EditorialCollage({ activeImages, brand, currentSlide }: { activeImages: string[], brand: string, currentSlide: number }) {
  return (
    <div className="w-full relative aspect-square md:aspect-[4/3] max-w-2xl mx-auto lg:mx-0" key={`collage-${currentSlide}`}>
      {/* Dark Red Box Background */}
      <div className="absolute top-[10%] left-[15%] w-[60%] h-[80%] bg-[#6b1524] z-0 shadow-2xl animate-fade-in-scale"></div>

      {/* Top Left Image */}
      <div className="absolute top-[-5%] left-[0%] w-[40%] aspect-[4/3] bg-white border-4 md:border-8 border-white shadow-xl z-10 -rotate-6 animate-fade-in-up group cursor-pointer" style={{ animationDelay: '150ms' }}>
        <div className="w-full h-full overflow-hidden">
          <img src={activeImages[2]} alt="Detail" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
        </div>
      </div>

      {/* Bottom Left Image */}
      <div className="absolute bottom-[0%] left-[-5%] w-[35%] aspect-[4/3] bg-white border-4 md:border-8 border-white shadow-xl z-30 rotate-3 animate-fade-in-up group cursor-pointer" style={{ animationDelay: '300ms' }}>
        <div className="w-full h-full overflow-hidden">
          <img src={activeImages[3]} alt="Detail" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
        </div>
      </div>

      {/* Top Right Image */}
      <div className="absolute top-[5%] right-[0%] w-[35%] aspect-square bg-white border-4 md:border-8 border-white shadow-lg z-10 rotate-6 animate-fade-in-up group cursor-pointer" style={{ animationDelay: '200ms' }}>
        <div className="w-full h-full overflow-hidden">
          <img src={activeImages[4]} alt="Detail" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
        </div>
      </div>

      {/* Main Center Image */}
      <div className="absolute top-[15%] left-[20%] w-[60%] aspect-square bg-white border-4 md:border-8 border-white shadow-2xl z-20 animate-fade-in-scale group cursor-pointer" style={{ animationDelay: '50ms' }}>
        <div className="w-full h-full overflow-hidden">
          <img src={activeImages[0]} alt={brand} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
        </div>
      </div>

      {/* Bottom Right (Video style) */}
      <div className="absolute bottom-[-5%] right-[5%] w-[50%] aspect-video bg-white border-4 md:border-8 border-white shadow-2xl z-40 animate-fade-in-up group cursor-pointer" style={{ animationDelay: '400ms' }}>
        <div className="w-full h-full overflow-hidden relative">
          <img src={activeImages[1]} alt="Video Thumbnail" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
          {/* Pause icon overlay */}
          <div className="absolute bottom-3 right-3 md:bottom-4 md:right-4 flex gap-1 z-10">
            <div className="w-1 h-3 md:h-4 bg-white shadow-sm"></div>
            <div className="w-1 h-3 md:h-4 bg-white shadow-sm"></div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-50"></div>
        </div>
      </div>
    </div>
  );
}
