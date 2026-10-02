import type { Database } from '../../domain/ports/Database';
import { HttpError } from '../errors';

function boundary(value: unknown, end = false): Date | null {
  if (value === undefined) return null;
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2}))?$/.test(value)) throw new HttpError(400, 'Sales dates must use ISO format');
  const calendar = value.slice(0,10);
  const calendarDate = new Date(`${calendar}T00:00:00.000Z`);
  if (!Number.isFinite(calendarDate.getTime()) || calendarDate.toISOString().slice(0,10) !== calendar) throw new HttpError(400, 'Invalid sales date');
  const date = new Date(value.length === 10 ? `${value}T${end ? '23:59:59.999' : '00:00:00.000'}Z` : value);
  if (!Number.isFinite(date.getTime())) throw new HttpError(400, 'Invalid sales date');
  return date;
}
export async function salesReport(db: Database, from: unknown, to: unknown) {
  const start = boundary(from); const end = boundary(to, true);
  if (start && end && start > end) throw new HttpError(400, 'Sales start date must precede end date');
  const params = [start,end];
  const where = `paid_at IS NOT NULL AND ($1::timestamptz IS NULL OR paid_at >= $1::timestamptz)
    AND ($2::timestamptz IS NULL OR paid_at <= $2::timestamptz)`;
  const totals = await db.query(`SELECT COUNT(*) FILTER(WHERE status<>'cancelled') AS order_count,
    COALESCE(SUM(total) FILTER(WHERE status<>'cancelled'),0) AS revenue,
    COALESCE(SUM(refund_due) FILTER(WHERE refund_status='due'),0) AS refund_due FROM orders WHERE ${where}`, params);
  const products = await db.query(`SELECT item->>'watchId' AS watch_id,item->>'name' AS name,
    COALESCE(item->>'category','unknown') AS type,SUM((item->>'quantity')::int) AS quantity,
    SUM((item->>'price')::numeric*(item->>'quantity')::int) AS revenue
    FROM orders CROSS JOIN LATERAL jsonb_array_elements(items) AS item WHERE ${where} AND status<>'cancelled'
    GROUP BY item->>'watchId',item->>'name',item->>'category' ORDER BY revenue DESC`, params);
  const rows = (await db.query(`SELECT id,paid_at,status,subtotal,discount,shipping,total,refund_due FROM orders WHERE ${where} ORDER BY paid_at DESC LIMIT 10001`, params)).rows;
  const aggregate = totals.rows[0];
  return { summary: { orderCount: Number(aggregate.order_count), revenue: Number(aggregate.revenue), refundDue: Number(aggregate.refund_due) },
    orders: rows.slice(0,10000).map(row => ({ id: row.id, paidAt: row.paid_at, status: row.status, subtotal: Number(row.subtotal), discount: Number(row.discount), shipping: Number(row.shipping), total: Number(row.total), refundDue: Number(row.refund_due) })),
    products: products.rows.map(row => ({ watchId: row.watch_id, name: row.name, type: row.type, quantity: Number(row.quantity), revenue: Number(row.revenue) })),
    truncated: rows.length > 10000, orderDisplayLimit: 10000 };
}

