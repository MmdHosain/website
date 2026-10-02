import { Router } from 'express';
import { AuthService } from '../../application/services/AuthService';
import { Database } from '../../infrastructure/database/postgres';
import { HttpError } from '../../application/errors';
import { exportOrdersXlsx } from '../../application/imports/workbooks';
import { asyncRoute, authMiddleware, rateLimit } from '../middleware';
import { requirePermission } from '../permissions';

export function exportDateRange(query:Record<string,unknown>):[string|null,string|null] {
  const dates = [query.from,query.to].map(value => {
    if (value===undefined) return null;
    if (typeof value!=='string' || !/^(?!0000)\d{4}-\d{2}-\d{2}$/.test(value)) throw new HttpError(400,'Use valid YYYY-MM-DD export dates');
    const date = new Date(`${value}T00:00:00Z`);
    if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0,10)!==value) throw new HttpError(400,'Use valid YYYY-MM-DD export dates');
    return value;
  });
  const [from,to]=dates;
  if (from && to && from>to) throw new HttpError(400,'Export start date must precede the end date');
  return [from,to];
}

export function createOrderExportRoutes(auth: Pick<AuthService,'authenticate'>, db: Database): Router {
  const router = Router();
  router.get('/orders/export',authMiddleware(auth),requirePermission('orders'),rateLimit(5,60000),asyncRoute(async (req,res) => {
    const [from,to] = exportDateRange(req.query);
    const result = await db.query(`SELECT o.*,u.mobile FROM orders o JOIN users u ON u.id=o.user_id
      WHERE ($1::date IS NULL OR o.created_at >= $1::date) AND ($2::date IS NULL OR o.created_at < $2::date + INTERVAL '1 day')
      ORDER BY o.created_at DESC LIMIT 10001`, [from || null,to || null]);
    if (result.rows.length > 10000) throw new HttpError(400,'Choose a shorter date range (at most 10,000 orders per export)');
    res.type('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet').attachment('ariwatch-orders.xlsx').send(await exportOrdersXlsx(result.rows));
  }));
  return router;
}
