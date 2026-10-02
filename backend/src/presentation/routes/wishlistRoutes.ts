import { Router } from 'express';
import { AuthService } from '../../application/services/AuthService';
import { Database, database } from '../../infrastructure/database/postgres';
import { asyncRoute, authMiddleware, rateLimit } from '../middleware';
import { object, uuid } from '../../application/validation';
import { HttpError } from '../../application/errors';

export function createWishlistRoutes(auth: AuthService, db: Database = database) {
  const router = Router();
  router.use(authMiddleware(auth));
  router.get('/', asyncRoute(async (req, res) => {
    const result = await db.query('SELECT watch_id FROM wishlist_items WHERE user_id=$1 ORDER BY created_at DESC', [req.user!.id]);
    res.json({ watchIds: result.rows.map(row => row.watch_id) });
  }));
  router.put('/', rateLimit(60, 60_000), asyncRoute(async (req, res) => {
    const raw = object(req.body).watchIds;
    if (!Array.isArray(raw) || raw.length > 100) throw new HttpError(400, 'Wishlist can contain at most 100 watches');
    const requested = Array.from(new Set(raw.map(id => uuid(id, 'Watch ID'))));
    const watchIds = await db.transaction(async client => {
      await client.query('SELECT id FROM users WHERE id=$1 FOR UPDATE', [req.user!.id]);
      const watches = await client.query('SELECT id FROM watches WHERE id=ANY($1::uuid[]) ORDER BY id FOR KEY SHARE', [requested]);
      const available = new Set(watches.rows.map(row => row.id));
      const ids = requested.filter(id => available.has(id));
      await client.query('DELETE FROM wishlist_items WHERE user_id=$1', [req.user!.id]);
      for (const watchId of ids) await client.query('INSERT INTO wishlist_items(user_id,watch_id) VALUES($1,$2)', [req.user!.id, watchId]);
      return ids;
    });
    res.json({ watchIds });
  }));
  return router;
}
