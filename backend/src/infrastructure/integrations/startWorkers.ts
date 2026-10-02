import { IntegrationService } from '../../application/integrations/IntegrationService';
import { NotificationWorker } from '../../application/integrations/NotificationWorker';

export function startIntegrationWorkers(integrations: IntegrationService, notifications: NotificationWorker): () => void {
  const deliver = () => { void notifications.run().catch(() => console.error('Notification queue processing failed')); };
  const sync = () => { void integrations.refreshConfigured().catch(() => console.error('Integration sync failed')); };
  deliver(); sync();
  const deliveryTimer = setInterval(deliver, 30_000);
  const syncTimer = setInterval(sync, 10 * 60_000);
  deliveryTimer.unref(); syncTimer.unref();
  return () => { clearInterval(deliveryTimer); clearInterval(syncTimer); };
}
