import { Router } from 'express';
import type { AuthService } from '../../application/services/AuthService';
import type { QueryExecutor } from '../../domain/ports/Database';
import { StoreSettingsService } from '../../application/settings/StoreSettingsService';
import { asyncRoute, authMiddleware } from '../middleware';
import { requirePermission } from '../permissions';

export function createStoreSettingsRoutes(auth: Pick<AuthService, 'authenticate'>, db: QueryExecutor) {
  const router = Router();
  const settings = new StoreSettingsService(db);
  const authenticated = authMiddleware(auth);
  router.get('/storefront/settings', asyncRoute(async (_req, res) => {
    const { heroStyle } = await settings.get();
    res.set('Cache-Control', 'no-store').json({ heroStyle });
  }));
  router.get('/shipping', asyncRoute(async (_req, res) => {
    const { shippingCost } = await settings.get();
    res.set('Cache-Control', 'no-store').json({ shippingCost });
  }));
  router.get('/admin/settings', authenticated, requirePermission('settings'), asyncRoute(async (_req, res) => {
    res.set('Cache-Control', 'no-store').json(await settings.get());
  }));
  router.put('/admin/settings', authenticated, requirePermission('settings'), asyncRoute(async (req, res) => {
    res.set('Cache-Control', 'no-store').json(await settings.update(req.body));
  }));
  return router;
}
