import { Router } from 'express';
import { AuthService } from '../../application/services/AuthService';
import { Database, database } from '../../infrastructure/database/postgres';
import { PostgresWatchRepository } from '../../infrastructure/repositories/PostgresWatchRepository';
import { resolveWatchSelection } from '../../application/catalog/selection';
import { asyncRoute, authMiddleware, rateLimit } from '../middleware';
import { object, uuid } from '../../application/validation';
import { HttpError } from '../../application/errors';

export function createStockAlertRoutes(auth: AuthService, db: Database = database) {
  const router = Router();
  router.use(authMiddleware(auth));
  router.post('/', rateLimit(20, 60_000), asyncRoute(async (req, res) => {
    const body = object(req.body), watchId = uuid(body.watchId, 'Watch ID');
    const variantId = body.variantId ? uuid(body.variantId, 'Variant ID') : undefined;
    await db.transaction(async client => {
      await client.query('SELECT id FROM watches WHERE id=$1 FOR UPDATE', [watchId]);
      const watch = await new PostgresWatchRepository(client).findById(watchId);
      if (!watch) throw new HttpError(404, 'Watch not found');
      const selection = resolveWatchSelection(watch, variantId);
      if (selection.stockQuantity > 0) throw new HttpError(409, 'This selection is currently in stock');
      await client.query('INSERT INTO stock_alerts(user_id,watch_id,variant_id) VALUES($1,$2,$3) ON CONFLICT DO NOTHING', [req.user!.id, watchId, variantId || null]);
    });
    res.status(201).json({ success: true });
  }));
  return router;
}
