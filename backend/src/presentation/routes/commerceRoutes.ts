import { Router } from 'express';
import { AuthService } from '../../application/services/AuthService';
import { OrderService } from '../../application/services/OrderService';
import { Database, database } from '../../infrastructure/database/postgres';
import { email, language, object, text } from '../../application/validation';
import { asyncRoute, authMiddleware, rateLimit } from '../middleware';
import { requirePermission } from '../permissions';

export function createOrderRoutes(auth: AuthService, orders: OrderService) {
  const router = Router();
  router.use(authMiddleware(auth));
  router.get('/', asyncRoute(async (req, res) => { res.json(await orders.list(req.user!.id)); }));
  router.get('/:id', asyncRoute(async (req, res) => { res.json(await orders.detail(req.user!.id, req.params.id)); }));
  router.post('/', rateLimit(30, 10 * 60_000), asyncRoute(async (req, res) => {
    const result = await orders.create(req.user!.id, req.user!.mobile, req.header('Idempotency-Key'), req.body);
    res.status(result.replayed ? 200 : 201).json({ order: result.order, paymentUrl: result.paymentUrl });
  }));
  router.post('/:id/payment', rateLimit(20, 10 * 60_000), asyncRoute(async (req, res) => { res.json(await orders.resume(req.user!.id, req.user!.mobile, req.params.id)); }));
  return router;
}
export function createPaymentRoutes(orders: OrderService) {
  const router = Router();
  router.get('/zarinpal/callback', rateLimit(30, 60_000), asyncRoute(async (req, res) => {
    const result = await orders.callback(req.query.Authority, req.query.Status === 'OK');
    const origin = (process.env.FRONTEND_ORIGIN || 'http://localhost:3000').split(',')[0].trim().replace(/\/$/, '');
    res.redirect(303, `${origin}/${result.lang}/checkout/result?orderId=${result.id}&payment=${result.paid ? 'success' : 'failed'}`);
  }));
  return router;
}
export function createFormRoutes(db: Database = database) {
  const router = Router();
  router.post('/concierge', rateLimit(5, 60_000), asyncRoute(async (req, res) => {
    const body = object(req.body);
    const result = await db.query(`INSERT INTO concierge_requests(name,email,model,message,lang) VALUES($1,$2,$3,$4,$5) RETURNING id`,
      [text(body.name, 'Name', 150, 2), email(body.email), body.model === undefined ? '' : text(body.model, 'Model', 255, 0), text(body.message, 'Message', 5000, 10), language(body.lang)]);
    res.status(201).json({ success: true, id: result.rows[0].id });
  }));
  router.post('/newsletter', rateLimit(10, 60_000), asyncRoute(async (req, res) => {
    const body = object(req.body);
    await db.query('INSERT INTO newsletter_subscriptions(email,lang) VALUES($1,$2) ON CONFLICT(email) DO NOTHING', [email(body.email), language(body.lang)]);
    res.json({ success: true });
  }));
  return router;
}
export function createAdminRoutes(auth: AuthService, orders: OrderService, db: Database = database) {
  const router = Router();
  router.use(authMiddleware(auth), requirePermission('orders'));
  router.get('/orders', asyncRoute(async (_req, res) => { res.json(await orders.list()); }));
  router.patch('/orders/:id', asyncRoute(async (req, res) => { res.json(await orders.setStatus(req.params.id, object(req.body).status)); }));
  router.get('/concierge', asyncRoute(async (_req, res) => {
    const result = await db.query('SELECT id,name,email,model,message,lang,created_at AS "createdAt" FROM concierge_requests ORDER BY created_at DESC LIMIT 500');
    res.json(result.rows);
  }));
  router.get('/newsletter', asyncRoute(async (_req, res) => {
    const result = await db.query('SELECT id,email,lang,created_at AS "createdAt" FROM newsletter_subscriptions ORDER BY created_at DESC LIMIT 500');
    res.json(result.rows);
  }));
  return router;
}
