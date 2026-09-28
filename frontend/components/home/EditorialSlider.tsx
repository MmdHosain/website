"use client";

import { useState } from "react";
import { EDITORIAL_IMAGES } from "./editorial/editorial.data";
import { EditorialCollage } from "./editorial/EditorialCollage";
import { EditorialText } from "./editorial/EditorialText";
import { EditorialControls } from "./editorial/EditorialControls";

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
        <EditorialCollage 
          activeImages={activeImages} 
          brand={activeSlide.brand} 
          currentSlide={currentSlide} 
        />
        <EditorialText 
          activeSlide={activeSlide} 
          isFa={isFa} 
          discoverText={dict.editorial.discover} 
          currentSlide={currentSlide} 
          lang={lang}
        />
      </div>

      {/* Controls */}
      <EditorialControls 
        handlePrev={handlePrev} 
        handleNext={handleNext} 
        currentSlide={currentSlide} 
        totalSlides={totalSlides} 
        isFa={isFa} 
      />
    </section>
  );
}
