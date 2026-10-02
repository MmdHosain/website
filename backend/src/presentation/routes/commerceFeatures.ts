import { Router } from 'express';
import { AuthService } from '../../application/services/AuthService';
import { OrderService } from '../../application/services/OrderService';
import { Database } from '../../infrastructure/database/postgres';
import { HttpError } from '../../application/errors';
import { object, uuid, text } from '../../application/validation';
import { discountInput, mapDiscount } from '../../application/commerce/discounts';
import { asyncRoute, authMiddleware, rateLimit } from '../middleware';
import { requirePermission, roles } from '../permissions';
import { salesReport } from '../../application/commerce/sales';
import { configuredAdminMobiles } from '../../application/auth/adminMobiles';
import { createStoreSettingsRoutes } from './storeSettingsRoutes';

export function createCommerceFeatureRoutes(auth: AuthService, orders: OrderService, db: Database) {
  const router = Router();
  const authenticated = authMiddleware(auth);
  router.use(createStoreSettingsRoutes(auth, db));
  router.post('/checkout/quote', rateLimit(60, 60_000), asyncRoute(async (req, res) => { res.json(await orders.quote(req.body)); }));
  router.get('/admin/discounts', authenticated, requirePermission('settings'), asyncRoute(async (_req, res) => {
    res.json((await db.query('SELECT * FROM discount_codes ORDER BY created_at DESC LIMIT 500')).rows.map(mapDiscount));
  }));
  router.post('/admin/discounts', authenticated, requirePermission('settings'), asyncRoute(async (req, res) => {
    const input = discountInput(req.body);
    const result = await db.query(`INSERT INTO discount_codes(code,type,value,minimum_amount,maximum_amount,maximum_discount,starts_at,ends_at,usage_limit,enabled)
      VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) ON CONFLICT(code) DO NOTHING RETURNING *`, Object.values(input));
    if (!result.rows.length) throw new HttpError(409, 'This coupon code already exists');
    res.status(201).json(mapDiscount(result.rows[0]));
  }));
  router.put('/admin/discounts/:id', authenticated, requirePermission('settings'), asyncRoute(async (req, res) => {
    const input = discountInput(req.body);
    const row = await db.transaction(async client => {
      const current = (await client.query('SELECT * FROM discount_codes WHERE id=$1 FOR UPDATE', [uuid(req.params.id)])).rows[0];
      if (!current) throw new HttpError(404, 'Coupon not found');
      if (current.code !== input.code) throw new HttpError(400, 'Coupon codes are immutable; create another coupon to use a different code');
      if (input.usageLimit !== null && input.usageLimit < current.used_count) throw new HttpError(400, 'Usage limit cannot be below current usage');
      return (await client.query(`UPDATE discount_codes SET type=$2,value=$3,minimum_amount=$4,maximum_amount=$5,maximum_discount=$6,
        starts_at=$7,ends_at=$8,usage_limit=$9,enabled=$10 WHERE id=$1 RETURNING *`, [current.id, ...Object.values(input).slice(1)])).rows[0];
    });
    res.json(mapDiscount(row));
  }));
  router.delete('/admin/discounts/:id', authenticated, requirePermission('settings'), asyncRoute(async (req, res) => {
    const result = await db.query('UPDATE discount_codes SET enabled=FALSE WHERE id=$1 RETURNING *', [uuid(req.params.id)]);
    if (!result.rows.length) throw new HttpError(404, 'Coupon not found');
    res.json(mapDiscount(result.rows[0]));
  }));
  router.get('/admin/users', authenticated, requirePermission('roles'), asyncRoute(async (_req, res) => {
    res.json((await db.query('SELECT id,mobile,role,created_at AS "createdAt" FROM users ORDER BY created_at DESC LIMIT 500')).rows);
  }));
  router.patch('/admin/users/:id/role', authenticated, requirePermission('roles'), asyncRoute(async (req, res) => {
    const role = text(object(req.body).role, 'Role', 30);
    if (!roles.includes(role as typeof roles[number])) throw new HttpError(400, 'Invalid staff role');
    const id = uuid(req.params.id);
    if (id === req.user!.id && role !== 'admin') throw new HttpError(409, 'You cannot remove your own administrator access');
    const row = (await db.query('SELECT mobile FROM users WHERE id=$1', [id])).rows[0];
    if (!row) throw new HttpError(404, 'User not found');
    const ownerMobiles = configuredAdminMobiles();
    if (ownerMobiles.includes(row.mobile) && role !== 'admin') throw new HttpError(409, 'Configured owner accounts retain administrator access');
    res.json((await db.query('UPDATE users SET role=$2 WHERE id=$1 RETURNING id,mobile,role', [id, role])).rows[0]);
  }));
  router.get('/admin/sales', authenticated, requirePermission('orders'), asyncRoute(async (req, res) => {
    res.json(await salesReport(db, req.query.from, req.query.to));
  }));
  router.post('/admin/orders/:id/refund-completed', authenticated, requirePermission('orders'), asyncRoute(async (req, res) => { res.json(await orders.markRefunded(req.params.id, object(req.body).reference)); }));
  return router;
}
