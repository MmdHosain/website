import type { Database } from '../../domain/ports/Database';
import { WatchRepository } from '../../domain/repositories/WatchRepository';
import { OrderService } from '../services/OrderService';
import { HttpError } from '../errors';
import { object, uuid } from '../validation';
import { enqueueNotification } from '../notifications/outbox';

export class TelegramBot {
  private processing = new Map<number, Promise<void>>();
  constructor(private db: Database, private orders: OrderService, private catalog: WatchRepository, private env: NodeJS.ProcessEnv = process.env) {}
  async handle(raw: unknown): Promise<void> {
    const update = object(raw);
    if (!Number.isSafeInteger(update.update_id) || Number(update.update_id) < 0) throw new HttpError(400, 'Invalid Telegram update');
    const id = Number(update.update_id), current = this.processing.get(id);
    if (current) return current;
    const work = this.process(id, update);
    this.processing.set(id, work);
    try { await work; } finally { this.processing.delete(id); }
  }
  private async process(id: number, update: Record<string, unknown>) {
    const message = update.message as any;
    const chat = String(message?.chat?.id || '');
    const allowed = (this.env.TELEGRAM_ADMIN_CHAT_IDS || '').split(',').map(s => s.trim());
    if (!message || message.chat?.type !== 'private' || !allowed.includes(chat) || String(message.from?.id) !== chat) throw new HttpError(403, 'Telegram administrator chat is not authorized');
    await this.db.query('INSERT INTO telegram_updates(update_id) VALUES($1) ON CONFLICT DO NOTHING', [id]);
    const result = await this.db.query('SELECT processed FROM telegram_updates WHERE update_id=$1', [id]);
    if (result.rows[0].processed) return;
    let reply: string;
    try { reply = await this.command(String(message.text || '')); }
    catch (error) { if (!(error instanceof HttpError) || error.status >= 500) throw error; reply = error.message; }
    await this.db.transaction(async client => {
      await enqueueNotification(client, { kind: 'telegram_reply', recipient: chat, payload: { text: reply }, dedupeKey: `telegram-reply:${id}` });
      await client.query('UPDATE telegram_updates SET processed=TRUE WHERE update_id=$1', [id]);
    });
  }
  private async command(value: string): Promise<string> {
    const [command, ...args] = value.trim().split(/\s+/);
    if (command === '/orders') {
      const orders = await this.orders.list();
      return orders.slice(0, 10).map(order => `${order.id}\n${order.status} · ${order.total} toman`).join('\n\n') || 'No orders yet.';
    }
    if (command === '/status' && args.length === 2) {
      const order = await this.orders.setStatus(uuid(args[0]), args[1]);
      return `${order.id}: ${order.status}${(order as any).refundDue ? '\nManual refund required.' : ''}`;
    }
    if (['/stock', '/price'].includes(command) && [2, 3].includes(args.length)) {
      const id = uuid(args[0]), variantId = args.length === 3 ? uuid(args[1]) : null;
      const amount = Number(args[args.length - 1]);
      if (!Number.isSafeInteger(amount) || amount < (command === '/price' ? 1 : 0) || amount > (command === '/price' ? 100_000_000 : 1_000_000)) throw new HttpError(400, 'Invalid whole amount');
      const watch = await this.catalog.findById(id);
      if (!watch) throw new HttpError(404, 'Watch not found');
      const field = command === '/stock' ? 'stockQuantity' : 'price';
      if (variantId) {
        if (!watch.variants?.some(variant => variant.id === variantId)) throw new HttpError(404, 'Variant not found');
        await this.catalog.update(id, { variants: watch.variants.map(variant => variant.id === variantId ? { ...variant, [field]: amount } : variant) });
      } else {
        if (watch.variants?.length) throw new HttpError(400, 'Include the variant ID');
        await this.catalog.update(id, { [field]: amount });
      }
      return `${watch.name}: ${field} = ${amount}`;
    }
    return 'ARIWATCH commands:\n/orders\n/status ORDER_ID confirmed|shipped|cancelled\n/stock WATCH_ID [VARIANT_ID] QUANTITY\n/price WATCH_ID [VARIANT_ID] TOMAN\n/help';
  }
}
