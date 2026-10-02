export interface SocialPost {
  id: string;
  caption: string;
  permalink: string;
  imageUrl: string | null;
  publishedAt: string;
}

export interface PriceObservation {
  watchId: string;
  source: string;
  url: string;
  priceToman: number;
  observedAt: string;
}

export interface CatalogPublication {
  watchId: string;
  variantId: string | null;
  externalId: number;
  priceToman: number;
  stock: number;
}

export interface IntegrationProviders {
  instagram: { configured(): boolean; readPosts(): Promise<SocialPost[]> };
  prices: { configured(): boolean; readPrices(watches: { id: string; name: string }[]): Promise<PriceObservation[]> };
  basalam: { configured(): boolean; publish(products: CatalogPublication[]): Promise<void> };
  notifications: { configured(kind: string): boolean; send(event: NotificationEvent): Promise<void> };
}

export interface NotificationEvent {
  id: string;
  kind: string;
  recipient: string;
  payload: Record<string, unknown>;
}
