import express from 'express';
import { AuthService } from '../application/services/AuthService';
import { OrderService } from '../application/services/OrderService';
import { Database, database } from '../infrastructure/database/postgres';
import { createOtpProvider } from '../infrastructure/providers/HttpOtpProvider';
import { createPaymentGateway, PaymentGateway } from '../infrastructure/payments/ZarinpalGateway';
import { WatchRepository } from '../domain/repositories/WatchRepository';
import { PostgresWatchRepository } from '../infrastructure/repositories/PostgresWatchRepository';
import type { CatalogRepositoryFactory } from '../domain/ports/CatalogRepositoryFactory';
import { createAuthRoutes } from './routes/authRoutes';
import { createWatchRoutes } from './routes/watchRoutes';
import { createAdminRoutes, createFormRoutes, createOrderRoutes, createPaymentRoutes } from './routes/commerceRoutes';
import { errorHandler } from './middleware';
import { resolve } from 'path';
import { IntegrationProviders } from '../domain/integrations/IntegrationPorts';
import { createIntegrationProviders } from '../infrastructure/integrations/createProviders';
import { IntegrationService } from '../application/integrations/IntegrationService';
import { NotificationWorker } from '../application/integrations/NotificationWorker';
import { TelegramBot } from '../application/integrations/TelegramBot';
import { createIntegrationRoutes, createTorobRoutes } from './routes/integrationRoutes';
import { createWishlistRoutes } from './routes/wishlistRoutes';
import { createStockAlertRoutes } from './routes/stockAlertRoutes';
import { createCommerceFeatureRoutes } from './routes/commerceFeatures';
import { createBlogRoutes } from './routes/blogRoutes';
import { createAdminBlogRoutes } from './routes/adminBlogRoutes';
import { createBulkCatalogRoutes } from './routes/bulkCatalogRoutes';
import { createOrderExportRoutes } from './routes/orderExportRoutes';

export function createApp(options: { db?: Database; auth?: AuthService; gateway?: PaymentGateway; watchRepository?: WatchRepository; integrationProviders?: IntegrationProviders } = {}) {
  const app = express();
  app.disable('x-powered-by');
  const trustedHops = process.env.TRUST_PROXY;
  if (trustedHops !== undefined && !/^[0-5]$/.test(trustedHops)) throw new Error('TRUST_PROXY must be a number from 0 to 5');
  app.set('trust proxy', trustedHops === undefined ? false : Number(trustedHops));
  const db = options.db || database;
  const auth = options.auth || new AuthService(createOtpProvider(), db);
  const gateway = options.gateway || {
    requestPayment: input => createPaymentGateway().requestPayment(input),
    verifyPayment: input => createPaymentGateway().verifyPayment(input),
    inquirePayment: async input => {
      const provider = createPaymentGateway();
      if (!provider.inquirePayment) throw new Error('Payment inquiry is unavailable');
      return provider.inquirePayment(input);
    },
  } as PaymentGateway;
  const catalogFactory: CatalogRepositoryFactory = client => new PostgresWatchRepository(client);
  const orders = new OrderService(gateway, db, catalogFactory);
  const catalog = options.watchRepository || new PostgresWatchRepository(db);
  const providers = options.integrationProviders || createIntegrationProviders();
  const integrations = new IntegrationService(db, providers);
  const notifications = new NotificationWorker(db, providers.notifications);
  const bot = new TelegramBot(db, orders, catalog);
  app.locals.integrations = integrations;
  app.locals.notifications = notifications;
  const origins = (process.env.FRONTEND_ORIGIN || 'http://localhost:3000').split(',').map(origin => origin.trim()).filter(Boolean);
  app.use((req, res, next) => {
    const origin = req.header('Origin');
    res.vary('Origin');
    if (origin && origins.includes(origin)) {
      res.header('Access-Control-Allow-Origin', origin);
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Idempotency-Key');
    }
    if (req.method === 'OPTIONS') { res.status(204).end(); return; }
    next();
  });
  app.use(express.json({ limit: '64kb' }));
  const mediaDirectory = resolve(process.env.MEDIA_DIRECTORY || resolve(__dirname, '../../uploads/catalog'));
  app.use('/media/catalog', express.static(mediaDirectory, { dotfiles: 'deny', index: false, setHeaders: res => {
    res.setHeader('X-Content-Type-Options', 'nosniff'); res.setHeader('Content-Security-Policy', "default-src 'none'");
  } }));
  app.get('/health', (_req, res) => { res.json({ status: 'OK' }); });
  app.use('/api/auth', createAuthRoutes(auth));
  app.use('/api/watches', createWatchRoutes(auth, catalog));
  app.use('/api/wishlist', createWishlistRoutes(auth, db));
  app.use('/api/stock-alerts', createStockAlertRoutes(auth, db));
  app.use('/api/blog', createBlogRoutes(auth, db));
  app.use('/api/admin/blog', createAdminBlogRoutes(auth, db));
  app.use('/api/admin/catalog/import', createBulkCatalogRoutes(auth, db, catalogFactory, mediaDirectory, `${(process.env.API_PUBLIC_URL || 'http://localhost:4000').replace(/\/$/, '')}/media/catalog`));
  app.use('/api/admin', createOrderExportRoutes(auth, db));
  app.use('/api/orders', createOrderRoutes(auth, orders));
  app.use('/api/payments', createPaymentRoutes(orders));
  app.use('/api/admin', createAdminRoutes(auth, orders, db));
  app.use('/api', createCommerceFeatureRoutes(auth, orders, db));
  app.use('/api', createIntegrationRoutes(auth, integrations, bot, notifications, db));
  app.use('/torob_api/v3', createTorobRoutes(db));
  app.use('/api', createFormRoutes(db));
  app.use((_req, res) => { res.status(404).json({ error: 'Endpoint not found' }); });
  app.use(errorHandler);
  return app;
}
