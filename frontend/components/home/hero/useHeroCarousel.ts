import { useEffect, useState } from "react";
import { HERO_SLIDES } from "./hero.data";

export function useHeroCarousel(slides: readonly { id: number; imageUrl?: string }[] = HERO_SLIDES) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [hidden, setHidden] = useState(false);
  const isPaused = paused || hovered || hidden;

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const respectPreference = () => { if (preference.matches) setPaused(true); };
    const trackVisibility = () => setHidden(document.hidden);
    respectPreference();
    trackVisibility();
    preference.addEventListener("change", respectPreference);
    document.addEventListener("visibilitychange", trackVisibility);
    return () => {
      preference.removeEventListener("change", respectPreference);
      document.removeEventListener("visibilitychange", trackVisibility);
    };
  }, []);

  useEffect(() => {
    if (isPaused) return;
    const timer = window.setInterval(() => {
      setCurrentSlide(index => (index + 1) % slides.length);
    }, 6000);
    return () => window.clearInterval(timer);
  }, [isPaused, slides.length]);

  useEffect(() => {
    const nextUrl = slides[(currentSlide + 1) % slides.length].imageUrl;
    if (!nextUrl) return;
    const next = new window.Image();
    next.src = nextUrl;
  }, [currentSlide, slides]);

  return {
    currentSlide,
    paused,
    isPaused,
    setHovered,
    pause: () => setPaused(true),
    setPaused,
    selectSlide: (index: number) => {
      setCurrentSlide(index);
      setPaused(true);
    },
  };
}
