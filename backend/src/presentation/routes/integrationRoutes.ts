import { Router } from 'express';
import { timingSafeEqual } from 'crypto';
import { AuthService } from '../../application/services/AuthService';
import { IntegrationService } from '../../application/integrations/IntegrationService';
import { TelegramBot } from '../../application/integrations/TelegramBot';
import { NotificationWorker } from '../../application/integrations/NotificationWorker';
import { catalogFeed, selectFeed } from '../../application/integrations/CatalogFeed';
import { Database } from '../../infrastructure/database/postgres';
import { NotificationProvider } from '../../infrastructure/integrations/NotificationProvider';
import { HttpError } from '../../application/errors';
import { asyncRoute, authMiddleware, rateLimit, requireAdmin } from '../middleware';
import { requirePermission } from '../permissions';
import { validateTorobToken } from '../integrations/torobAuth';

export function createIntegrationRoutes(auth: AuthService, integrations: IntegrationService, bot: TelegramBot, notifications: NotificationWorker, db: Database) {
  const router = Router();
  const origin = () => (process.env.FRONTEND_ORIGIN || 'http://localhost:3000').split(',')[0].trim();
  router.get('/social/instagram', asyncRoute(async (_req, res) => { res.json(await integrations.posts()); }));
  router.get('/feeds/products', rateLimit(60, 60_000), asyncRoute(async (_req, res) => { res.json({ currency: 'IRT', products: await catalogFeed(db, origin()) }); }));
  router.post('/integrations/telegram/webhook', rateLimit(120, 60_000), asyncRoute(async (req, res) => {
    const expected = process.env.TELEGRAM_WEBHOOK_SECRET || '', supplied = req.header('X-Telegram-Bot-Api-Secret-Token') || '';
    if (process.env.TELEGRAM_ENABLED !== 'true') throw new HttpError(503, 'Telegram is not enabled');
    if (expected.length < 20 || Buffer.byteLength(supplied) !== Buffer.byteLength(expected) || !timingSafeEqual(Buffer.from(expected), Buffer.from(supplied))) throw new HttpError(401, 'Invalid webhook secret');
    await bot.handle(req.body); res.json({ ok: true });
  }));
  router.get('/admin/integrations', authMiddleware(auth), requireAdmin, asyncRoute(async (_req, res) => { res.json(await integrations.status()); }));
  router.post('/admin/integrations/:provider/sync', authMiddleware(auth), requireAdmin, asyncRoute(async (req, res) => { await integrations.refresh(req.params.provider); res.json({ success: true }); }));
  router.post('/admin/integrations/telegram/register', authMiddleware(auth), requireAdmin, asyncRoute(async (_req, res) => {
    const provider = new NotificationProvider();
    await provider.registerWebhook(`${(process.env.API_PUBLIC_URL || '').replace(/\/$/, '')}/api/integrations/telegram/webhook`);
    res.json({ success: true });
  }));
  router.post('/admin/integrations/notifications/retry', authMiddleware(auth), requireAdmin, asyncRoute(async (_req, res) => { await notifications.run(); res.json({ success: true }); }));
  router.get('/admin/prices', authMiddleware(auth), requirePermission('catalog'), asyncRoute(async (_req, res) => { res.json(await integrations.prices.list()); }));
  router.post('/admin/prices', authMiddleware(auth), requirePermission('catalog'), asyncRoute(async (req, res) => { await integrations.prices.addManual(req.body); res.status(201).json({ success: true }); }));
  router.get('/admin/integrations/basalam/mappings', authMiddleware(auth), requireAdmin, asyncRoute(async (_req, res) => { res.json(await integrations.mappings.list()); }));
  router.put('/admin/integrations/basalam/mappings', authMiddleware(auth), requireAdmin, asyncRoute(async (req, res) => { await integrations.mappings.save(req.body); res.json({ success: true }); }));
  router.delete('/admin/integrations/basalam/mappings/:id', authMiddleware(auth), requireAdmin, asyncRoute(async (req, res) => { await integrations.mappings.remove(req.params.id); res.status(204).end(); }));
  return router;
}

export function createTorobRoutes(db: Database) {
  const router = Router();
  router.post('/products', rateLimit(120, 60_000), asyncRoute(async (req, res) => {
    if (process.env.TOROB_ENABLED !== 'true' || !process.env.API_PUBLIC_URL) throw new HttpError(503, 'Torob is not configured');
    validateTorobToken(req.header('X-Torob-Token') || '', req.header('X-Torob-Token-Version') || '', process.env.TOROB_AUDIENCE || new URL(process.env.API_PUBLIC_URL).host, process.env.TOROB_PUBLIC_KEY?.replace(/\\n/g, '\n'));
    const products = await catalogFeed(db, (process.env.FRONTEND_ORIGIN || '').split(',')[0].trim());
    res.json(selectFeed(products, req.body));
  }));
  return router;
}
