"use client";

import { useState } from "react";
import { EDITORIAL_IMAGES } from "./editorial/editorial.data";

interface EditorialSliderProps {
  lang: 'en' | 'fa';
  dict: any;
  isFa: boolean;
}

export function EditorialSlider({ lang, dict, isFa }: EditorialSliderProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = dict.editorial.slides;
  const totalSlides = slides.length;

  const handlePrev = () => setCurrentSlide((prev) => (prev === 0 ? totalSlides - 1 : prev - 1));
  const handleNext = () => setCurrentSlide((prev) => (prev === totalSlides - 1 ? 0 : prev + 1));

  const activeSlide = slides[currentSlide];
  const activeImages = EDITORIAL_IMAGES[currentSlide];

  return (
    <section className="relative py-24 md:py-32 bg-dotted overflow-hidden border-t border-gray-200">
      {/* Header */}
      <div className="text-center mb-16 md:mb-24 px-6 relative z-10">
        <span className="inline-block text-[10px] md:text-xs font-bold tracking-[0.3em] text-ariwatch-red uppercase mb-6 bg-white/80 px-4 py-1">
          {dict.editorial.subtitle}
        </span>
        <h2 className="text-3xl md:text-5xl lg:text-6xl font-light tracking-widest text-ariwatch-black uppercase">
          {dict.editorial.title}
        </h2>
      </div>

      {/* Slider Content */}
      <div className="max-w-[1500px] mx-auto px-6 md:px-12 lg:px-24 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center relative z-10 pb-24 md:pb-12">
        
        {/* Left: Collage */}
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
              <img src={activeImages[0]} alt={activeSlide.brand} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
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
              {/* Dark gradient overlay for video feel */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-50"></div>
            </div>
          </div>
        </div>

        {/* Right: Text */}
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
              {dict.editorial.discover}
            </span>
            <svg 
              className={`w-4 h-4 text-ariwatch-black group-hover:text-ariwatch-red transition-all duration-300 ${isFa ? 'group-hover:-translate-x-2 rotate-180' : 'group-hover:translate-x-2'}`} 
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
        </div>

      </div>

      {/* Controls (Always LTR for universal media control UX) */}
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
    </section>
  );
}
