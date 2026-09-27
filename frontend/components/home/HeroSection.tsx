"use client";

import { useState, useEffect } from "react";
import { HERO_SLIDES } from "./hero/hero.data";
import { HeroText } from "./hero/HeroText";
import { HeroVisual } from "./hero/HeroVisual";
import { HeroIndicators } from "./hero/HeroIndicators";

interface HeroSectionProps {
  lang: 'en' | 'fa';
  dict: any;
  isFa: boolean;
}

export function HeroSection({ lang, dict, isFa }: HeroSectionProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative w-full h-[100dvh] flex flex-col md:flex-row bg-ariwatch-luxury overflow-hidden pt-16 md:pt-20">
      <HeroText lang={lang} dict={dict} isFa={isFa} />
      <HeroVisual activeSlide={HERO_SLIDES[currentSlide]} isFa={isFa} />
      <HeroIndicators 
        totalSlides={HERO_SLIDES.length} 
        currentSlide={currentSlide} 
        onSelectSlide={setCurrentSlide} 
        isFa={isFa}
      />
    </section>
  );
}
