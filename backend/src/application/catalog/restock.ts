import type { QueryExecutor } from '../../domain/ports/Database';
import { Watch } from '../../domain/entities/Watch';
import { enqueueNotification } from '../notifications/outbox';

export async function enqueueRestockAlerts(client: QueryExecutor, before: Watch, after: Watch) {
  const restocked: (string | null)[] = [];
  if (!after.variants.length && before.stockQuantity === 0 && after.stockQuantity > 0) restocked.push(null);
  for (const variant of after.variants) {
    if (variant.stockQuantity > 0 && before.variants.find(item => item.id === variant.id)?.stockQuantity === 0) restocked.push(variant.id);
  }
  for (const variantId of restocked) {
    const alerts = await client.query(`SELECT stock_alerts.id,users.mobile FROM stock_alerts
      JOIN users ON users.id=stock_alerts.user_id WHERE watch_id=$1
      AND variant_id IS NOT DISTINCT FROM $2::uuid AND notification_enqueued_at IS NULL FOR UPDATE OF stock_alerts`, [after.id, variantId]);
    for (const alert of alerts.rows) {
      await enqueueNotification(client, { kind: 'restock_sms', recipient: alert.mobile,
        payload: { watchId: after.id, variantId, name: after.name, variantLabel: after.variants.find(item => item.id === variantId)?.label || '', message: `${after.name} دوباره موجود شد.` },
        dedupeKey: `restock:${alert.id}` });
      await client.query('UPDATE stock_alerts SET notification_enqueued_at=NOW() WHERE id=$1', [alert.id]);
    }
  }
}
