import type { HeroSlide } from "./hero.data";

export type ClassicHeroSlide = Pick<HeroSlide, "id" | "brand" | "model" | "type" | "typeFa">;

export const CLASSIC_HERO_SLIDES: readonly ClassicHeroSlide[] = [
  { id: 1, brand: "PATEK PHILIPPE", model: "Nautilus 5711", type: "Automatic Movement", typeFa: "موتور مکانیکی خودکار" },
  { id: 2, brand: "AUDEMARS PIGUET", model: "Royal Oak", type: "Self-winding Chronograph", typeFa: "کرنوگراف خودکار" },
  { id: 3, brand: "ROLEX", model: "Daytona Cosmograph", type: "Oyster Perpetual", typeFa: "اویستر پرپچوال" },
  { id: 4, brand: "CARTIER", model: "Santos de Cartier", type: "Mechanical Automatic", typeFa: "موتور مکانیکی خودکار" },
  { id: 5, brand: "A. LANGE & SÖHNE", model: "Lange 1", type: "Manual Winding", typeFa: "موتور مکانیکی کوکی" },
];
