import { createApp } from './app';
import { initDb, pool } from '../infrastructure/database/postgres';
import { startIntegrationWorkers } from '../infrastructure/integrations/startWorkers';

async function start() {
  await initDb();
  const app = createApp();
  const stopWorkers = startIntegrationWorkers(app.locals.integrations, app.locals.notifications);
  const server = app.listen(Number(process.env.PORT || 4000), () => { console.log('Watch shop API is ready'); });
  const shutdown = () => { stopWorkers(); server.close(() => { pool.end().finally(() => process.exit(0)); }); };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}
start().catch(async error => {
  console.error('Database startup failed:', error.message);
  await pool.end();
  process.exitCode = 1;
});
