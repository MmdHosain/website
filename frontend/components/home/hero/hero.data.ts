export interface HeroSlide {
  id: number;
  brand: string;
  model: string;
  reference: string;
  type: string;
  typeFa: string;
  imageUrl: string;
  imageScale?: number;
  imageOffsetY?: string;
  blendMode?: "multiply";
}

export const HERO_SLIDES: readonly HeroSlide[] = [
  {
    id: 1,
    brand: "PATEK PHILIPPE",
    model: "Nautilus 5811",
    reference: "5811/1G-001",
    type: "Self-winding movement",
    typeFa: "موتور مکانیکی خودکار",
    imageUrl: "/resourses/hero-nautilus.png",
  },
  {
    id: 2,
    brand: "AUDEMARS PIGUET",
    model: "Royal Oak",
    reference: "26240ST.OO.1320ST.07",
    type: "Self-winding chronograph",
    typeFa: "کرنوگراف خودکار",
    imageUrl: "/resourses/hero-royal-oak.avif",
  },
  {
    id: 3,
    brand: "ROLEX",
    model: "Cosmograph Daytona",
    reference: "126500LN",
    type: "Oyster Perpetual",
    typeFa: "اویستر پرپچوال",
    imageUrl: "/resourses/hero-daytona.webp",
    imageScale: 1.45,
    imageOffsetY: "-4%",
  },
  {
    id: 4,
    brand: "CARTIER",
    model: "Santos de Cartier",
    reference: "WSSA0018",
    type: "Automatic movement",
    typeFa: "موتور مکانیکی خودکار",
    imageUrl: "/resourses/hero-santos.png",
  },
  {
    id: 5,
    brand: "A. LANGE & SÖHNE",
    model: "Lange 1",
    reference: "191.032",
    type: "Manually wound movement",
    typeFa: "موتور مکانیکی کوکی",
    imageUrl: "/resourses/hero-lange-1.jpg",
    blendMode: "multiply",
  },
];
