import type { QueryExecutor } from '../../domain/ports/Database';
export interface Notification { kind: string; recipient: string; payload: Record<string, unknown>; dedupeKey: string; }
export async function enqueueNotification(client: QueryExecutor, notification: Notification): Promise<void> {
  await client.query(`INSERT INTO notification_outbox(kind,recipient,payload,dedupe_key)
    VALUES($1,$2,$3::jsonb,$4) ON CONFLICT(dedupe_key) DO NOTHING`,
  [notification.kind, notification.recipient, JSON.stringify(notification.payload), notification.dedupeKey]);
}

