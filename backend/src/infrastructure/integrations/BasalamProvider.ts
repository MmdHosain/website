import { CatalogPublication } from '../../domain/integrations/IntegrationPorts';
import { HttpError } from '../../application/errors';
import { jsonHttp } from './jsonHttp';

export class BasalamProvider {
  constructor(private env: NodeJS.ProcessEnv = process.env, private transport: typeof fetch = fetch) {}
  configured(): boolean {
    return this.env.BASALAM_ENABLED === 'true' && Boolean(this.env.BASALAM_ACCESS_TOKEN) &&
      /^\d+$/.test(this.env.BASALAM_VENDOR_ID || '') && ['toman', 'rial'].includes(this.env.BASALAM_PRICE_UNIT || '');
  }
  async publish(products: CatalogPublication[]): Promise<void> {
    if (!this.configured()) throw new HttpError(503, 'Basalam is not configured');
    for (let offset = 0; offset < products.length; offset += 100) {
      const batch = products.slice(offset, offset + 100);
      const data = batch.map(product => ({ id: product.externalId, stock: product.stock,
        primary_price: product.priceToman * (this.env.BASALAM_PRICE_UNIT === 'rial' ? 10 : 1) }));
      const result = await jsonHttp(`https://openapi.basalam.com/v1/vendors/${this.env.BASALAM_VENDOR_ID}/products/batch-updates`, {
        method: 'PATCH', headers: { Authorization: `Bearer ${this.env.BASALAM_ACCESS_TOKEN}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ data }),
      }, this.transport);
      if (!Array.isArray(result) || result.length !== data.length || result.some(row => row.has_error !== false || !data.some(item => item.id === row.id))) {
        throw new HttpError(502, 'Basalam did not confirm all product updates');
      }
    }
  }
}
