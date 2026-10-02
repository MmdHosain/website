import { PriceObservation } from '../../domain/integrations/IntegrationPorts';
import { HttpError } from '../../application/errors';
import { jsonHttp, secureUrl } from './jsonHttp';

// A licensed comparison provider is connected through this explicit bridge contract.
export class PriceReportProvider {
  constructor(private env: NodeJS.ProcessEnv = process.env, private transport: typeof fetch = fetch) {}
  configured(): boolean { return this.env.PRICE_REPORT_ENABLED === 'true' && Boolean(secureUrl(this.env.PRICE_REPORT_URL)); }
  async readPrices(watches: { id: string; name: string }[]): Promise<PriceObservation[]> {
    if (!this.configured()) throw new HttpError(503, 'Competitive price provider is not configured');
    const result = await jsonHttp(this.env.PRICE_REPORT_URL!, { method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(this.env.PRICE_REPORT_TOKEN ? { Authorization: `Bearer ${this.env.PRICE_REPORT_TOKEN}` } : {}) },
      body: JSON.stringify({ currency: 'IRT', watches }),
    }, this.transport);
    if (!Array.isArray(result.observations) || result.observations.length > 5000) throw new HttpError(502, 'Price provider returned invalid observations');
    return result.observations.map((row: any) => {
      const date = new Date(row.observedAt);
      const url = secureUrl(row.url);
      if (!watches.some(w => w.id === row.watchId) || typeof row.source !== 'string' || !row.source.trim() || row.source.length > 120 || !url ||
          !Number.isSafeInteger(row.priceToman) || row.priceToman <= 0 || row.priceToman > 10_000_000_000 || isNaN(date.getTime()) || date.getTime() > Date.now() + 60_000) {
        throw new HttpError(502, 'Price provider returned an invalid observation');
      }
      return { watchId: row.watchId, source: row.source.trim(), url, priceToman: row.priceToman, observedAt: date.toISOString() };
    });
  }
}
