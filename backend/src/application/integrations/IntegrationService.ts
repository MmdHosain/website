import type { Database } from '../../domain/ports/Database';
import { IntegrationProviders } from '../../domain/integrations/IntegrationPorts';
import { HttpError } from '../errors';
import { MarketplaceMappings } from './MarketplaceMappings';
import { PriceReports } from './PriceReports';

export class IntegrationService {
  readonly prices: PriceReports;
  readonly mappings: MarketplaceMappings;
  private running = new Set<string>();
  constructor(private db: Database, readonly providers: IntegrationProviders) {
    this.prices = new PriceReports(db); this.mappings = new MarketplaceMappings(db);
  }
  async status() {
    const [runs, notifications] = await Promise.all([
      this.db.query('SELECT * FROM integration_runs ORDER BY provider'),
      this.db.query('SELECT status,count(*)::int AS count FROM notification_outbox GROUP BY status'),
    ]);
    return { providers: ['instagram', 'prices', 'basalam'].map(provider => ({ provider,
      configured: this.providers[provider as 'instagram' | 'prices' | 'basalam'].configured(),
      ...(runs.rows.find(row => row.provider === provider) || { status: 'not_connected' }) })),
      notifications: notifications.rows, smsConfigured: this.providers.notifications.configured('order_status_sms'),
      telegramConfigured: this.providers.notifications.configured('telegram_reply'), torobConfigured: process.env.TOROB_ENABLED === 'true' && Boolean(process.env.API_PUBLIC_URL) };
  }
  async posts() {
    const rows = await this.db.query('SELECT * FROM social_posts ORDER BY published_at DESC LIMIT 12');
    return rows.rows.map(row => ({ id: row.id, caption: row.caption, permalink: row.permalink, imageUrl: row.image_url, publishedAt: new Date(row.published_at).toISOString() }));
  }
  async refresh(provider: string): Promise<void> {
    if (!['instagram', 'prices', 'basalam'].includes(provider)) throw new HttpError(400, 'Unknown integration');
    if (!this.providers[provider as 'instagram' | 'prices' | 'basalam'].configured()) throw new HttpError(503, 'Integration is not configured');
    if (this.running.has(provider)) throw new HttpError(409, 'This integration is already syncing');
    this.running.add(provider);
    try {
      await this.db.query(`INSERT INTO integration_runs(provider,status,last_attempt_at) VALUES($1,'syncing',NOW())
        ON CONFLICT(provider) DO UPDATE SET status='syncing',last_attempt_at=NOW(),last_error=NULL`, [provider]);
      if (provider === 'instagram') {
        const posts = await this.providers.instagram.readPosts();
        await this.db.transaction(async client => {
          await client.query('DELETE FROM social_posts');
          for (const post of posts) await client.query('INSERT INTO social_posts(id,caption,permalink,image_url,published_at) VALUES($1,$2,$3,$4,$5)', [post.id, post.caption, post.permalink, post.imageUrl, post.publishedAt]);
        });
      } else if (provider === 'prices') {
        const watches = await this.db.query('SELECT id,name FROM watches ORDER BY name LIMIT 2000');
        await this.prices.save(await this.providers.prices.readPrices(watches.rows));
      } else await this.providers.basalam.publish(await this.mappings.publications());
      await this.db.query("UPDATE integration_runs SET status='ready',last_success_at=NOW(),last_error=NULL WHERE provider=$1", [provider]);
    } catch (error) {
      await this.db.query("UPDATE integration_runs SET status='failed',last_error='Sync failed; check credentials and provider access' WHERE provider=$1", [provider]);
      throw error;
    } finally { this.running.delete(provider); }
  }
  async refreshConfigured(): Promise<void> {
    for (const provider of ['instagram', 'prices', 'basalam']) {
      if (this.providers[provider as 'instagram' | 'prices' | 'basalam'].configured()) await this.refresh(provider).catch(() => undefined);
    }
  }
}
