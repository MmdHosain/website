import { useRef } from "react";
import type { HeroSlide } from "./hero.data";

interface HeroIndicatorsProps {
  slides: readonly Pick<HeroSlide, "id" | "brand" | "model">[];
  currentSlide: number;
  onSelectSlide: (index: number) => void;
  paused: boolean;
  onSetPaused: (paused: boolean) => void;
  isFa: boolean;
  classic?: boolean;
}

export function HeroIndicators({ slides, currentSlide, onSelectSlide, paused, onSetPaused, isFa, classic = false }: HeroIndicatorsProps) {
  const pointerIntent = useRef<boolean | null>(null);
  return (
    <div className={classic ? "absolute bottom-3 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2 md:bottom-12" : "mt-5 flex items-center justify-center gap-2 md:mt-7"} dir="ltr">
      <div className="flex items-center" role="group" aria-label={isFa ? "انتخاب ساعت" : "Choose a watch"}>
        {slides.map((slide, index) => (
          <button
            key={slide.id}
            type="button"
            onClick={() => onSelectSlide(index)}
            className={`group flex h-11 items-center justify-center rounded-full ${classic ? "min-w-11 px-1" : "w-11"}`}
            aria-label={`${isFa ? "نمایش" : "Show"} ${slide.brand} ${slide.model}`}
            aria-pressed={index === currentSlide}
          >
            <span className={`rounded-full transition-all duration-300 ${classic
              ? (index === currentSlide ? "h-[2px] w-20 bg-[#121212]/50" : "h-[2px] w-6 bg-[#121212]/15 group-hover:bg-[#121212]/30")
              : (index === currentSlide ? "h-1 w-7 bg-ariwatch-red" : "h-1 w-2 bg-[#aba59b] group-hover:bg-[#645e53]")}`} />
          </button>
        ))}
      </div>
      <span className="mx-1 h-4 w-px bg-[#c9c3b7]" aria-hidden="true" />
      <button
        type="button"
        onPointerDown={() => { pointerIntent.current = !paused; }}
        onPointerCancel={() => { pointerIntent.current = null; }}
        onClick={() => {
          onSetPaused(pointerIntent.current ?? !paused);
          pointerIntent.current = null;
        }}
        className="flex h-11 w-11 items-center justify-center rounded-full text-[#615b52] transition-colors hover:bg-white/50"
        aria-label={paused ? (isFa ? "پخش خودکار اسلایدها" : "Play slideshow") : (isFa ? "توقف پخش خودکار" : "Pause slideshow")}
        title={paused ? (isFa ? "پخش خودکار" : "Play slideshow") : (isFa ? "توقف پخش" : "Pause slideshow")}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
          {paused ? <path d="M5 3.5v9L12 8 5 3.5Z" /> : <path d="M4 3h3v10H4zM9 3h3v10H9z" />}
        </svg>
      </button>
    </div>
  );
}
