export interface WatchVariant {
  id: string; sku: string; label: string; color?: string;
  price: number; stockQuantity: number;
}
export class Watch {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly description: string,
    public readonly price: number,
    public readonly imageUrl: string,
    public readonly category: string,
    public readonly stockQuantity: number = 20,
    public readonly variants: WatchVariant[] = [],
    public readonly salePrice: number | null = null,
    public readonly saleStartsAt: string | null = null,
    public readonly saleEndsAt: string | null = null,
    public readonly sku: string | null = null,
    public readonly features: string = '',
    public readonly metaTitle: string = '',
    public readonly metaDescription: string = ''
  ) {}
}
