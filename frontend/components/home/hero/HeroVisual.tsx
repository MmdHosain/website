import type { CSSProperties } from "react";
import type { HeroSlide } from "./hero.data";
import styles from "./HeroVisual.module.css";

interface HeroVisualProps {
  activeSlide: HeroSlide;
  currentSlide: number;
  totalSlides: number;
  isFa: boolean;
  paused: boolean;
}

export function HeroVisual({ activeSlide, currentSlide, totalSlides, isFa, paused }: HeroVisualProps) {
  const imageStyle = {
    "--watch-scale": activeSlide.imageScale ?? 1,
    "--watch-offset": activeSlide.imageOffsetY ?? "0%",
    filter: activeSlide.blendMode === "multiply" ? "none" : undefined,
  } as CSSProperties;

  return (
    <figure
      className="relative order-1 min-w-0 md:order-2"
      style={{ mixBlendMode: activeSlide.blendMode ?? "normal" }}
      role="group"
      aria-roledescription={isFa ? "اسلاید" : "slide"}
      aria-label={`${currentSlide + 1} ${isFa ? "از" : "of"} ${totalSlides}: ${activeSlide.brand} ${activeSlide.model}`}
    >
      <div key={activeSlide.id} className={styles.slide}>
        <div className={styles.stage}>
          <div className={styles.glow} aria-hidden="true" />
          <div className={styles.ground} aria-hidden="true" />
          <div className={styles.float} data-paused={paused}>
            <img
              src={activeSlide.imageUrl}
              alt={`${activeSlide.brand} ${activeSlide.model}, ${activeSlide.reference}`}
              className={styles.watch}
              style={imageStyle}
              fetchPriority={currentSlide === 0 ? "high" : "auto"}
              loading="eager"
              decoding="async"
            />
          </div>
        </div>
        <figcaption className="relative mx-auto mt-2 max-w-md px-4 text-center" dir="ltr">
          <p className="mb-2 text-[10px] font-semibold tracking-[0.22em] text-[#77736b] sm:text-xs">
            {activeSlide.brand}
          </p>
          <h2 className="font-serif text-2xl leading-tight text-[#22211f] sm:text-3xl lg:text-4xl">
            {activeSlide.model}
          </h2>
          <p className="mt-2 text-[11px] text-[#77736b] sm:text-xs" dir={isFa ? "rtl" : "ltr"}>
            {isFa ? activeSlide.typeFa : activeSlide.type}
            <span className="mx-2 text-[#aaa49a]" aria-hidden="true">·</span>
            <span dir="ltr">{activeSlide.reference}</span>
          </p>
        </figcaption>
      </div>
    </figure>
  );
}
