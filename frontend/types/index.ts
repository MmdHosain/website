export interface WatchVariant {
  id: string; sku: string; label: string; color?: string;
  price: number; stockQuantity: number;
}
export interface Watch {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  stockQuantity: number;
  variants: WatchVariant[];
  salePrice: number | null;
  saleStartsAt: string | null;
  saleEndsAt: string | null;
  sku?: string | null;
  features?: string;
  metaTitle?: string;
  metaDescription?: string;
}

export interface Dictionary {
  [key: string]: any;
}
