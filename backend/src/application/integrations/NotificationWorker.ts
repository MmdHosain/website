import type { Database } from '../../domain/ports/Database';
import { IntegrationProviders, NotificationEvent } from '../../domain/integrations/IntegrationPorts';

export class NotificationWorker {
  private running = false;
  constructor(private db: Database, private provider: IntegrationProviders['notifications']) {}
  async run(): Promise<void> {
    if (this.running) return;
    this.running = true;
    try {
      const kinds = ['order_status_sms', 'restock_sms', 'new_order_telegram', 'telegram_reply'].filter(kind => this.provider.configured(kind));
      if (!kinds.length) return;
      const events = await this.db.transaction(async client => {
        const result = await client.query(`SELECT * FROM notification_outbox WHERE kind=ANY($1::text[])
          AND status IN ('pending','failed','processing') AND attempts<8 AND next_attempt_at<=NOW()
          ORDER BY created_at LIMIT 5 FOR UPDATE SKIP LOCKED`, [kinds]);
        for (const row of result.rows) await client.query("UPDATE notification_outbox SET status='processing',attempts=attempts+1,next_attempt_at=NOW()+INTERVAL '30 minutes' WHERE id=$1", [row.id]);
        return result.rows;
      });
      for (const row of events) {
        const event: NotificationEvent = { id: row.id, kind: row.kind, recipient: row.recipient, payload: row.payload };
        try {
          await this.provider.send(event);
          await this.db.query("UPDATE notification_outbox SET status='sent',sent_at=NOW(),last_error=NULL WHERE id=$1", [row.id]);
        } catch {
          // Provider response bodies and credentials must never enter operator logs.
          await this.db.query("UPDATE notification_outbox SET status='failed',last_error='Delivery failed; check provider configuration',next_attempt_at=NOW()+($2::int*INTERVAL '1 minute') WHERE id=$1", [row.id, Math.min(60, 2 ** Number(row.attempts))]);
        }
      }
    } finally { this.running = false; }
  }
}
