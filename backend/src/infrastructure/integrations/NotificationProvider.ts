import { NotificationEvent } from '../../domain/integrations/IntegrationPorts';
import { HttpError } from '../../application/errors';
import { jsonHttp, secureUrl } from './jsonHttp';

const statusFa: Record<string, string> = { pending_payment: 'در انتظار پرداخت', paid: 'پرداخت شد', confirmed: 'تأیید شد', shipped: 'ارسال شد', cancelled: 'لغو شد' };
export function notificationText(event: NotificationEvent): string {
  const p = event.payload;
  if (event.kind === 'telegram_reply') return String(p.text || '').slice(0, 4000);
  if (event.kind === 'new_order_telegram') return `New order ${p.orderId}\n${p.total} toman`;
  if (event.kind === 'restock_sms') return p.lang === 'en' ? `${p.name || 'Your watch'} is back in stock at ARIWATCH.` : `آریواچ: ${p.name || 'ساعت مورد نظر'} دوباره موجود شد.`;
  return p.lang === 'en' ? `ARIWATCH order ${p.orderId}: ${p.status}.` : `آریواچ: وضعیت سفارش ${p.orderId}: ${statusFa[String(p.status)] || p.status}`;
}

export class NotificationProvider {
  constructor(private env: NodeJS.ProcessEnv = process.env, private transport: typeof fetch = fetch) {}
  configured(kind: string): boolean {
    if (kind.endsWith('_telegram') || kind === 'telegram_reply') return this.env.TELEGRAM_ENABLED === 'true' && Boolean(this.env.TELEGRAM_BOT_TOKEN) && this.chatIds().length > 0;
    return this.env.SMS_NOTIFICATIONS_ENABLED === 'true' && Boolean(secureUrl(this.env.SMS_PROVIDER_URL));
  }
  private chatIds(): string[] { return (this.env.TELEGRAM_ADMIN_CHAT_IDS || '').split(',').map(s => s.trim()).filter(s => /^\d+$/.test(s)); }
  async send(event: NotificationEvent): Promise<void> {
    if (!this.configured(event.kind)) throw new HttpError(503, 'Notification provider is not configured');
    const text = notificationText(event);
    if (event.kind.endsWith('_telegram') || event.kind === 'telegram_reply') {
      const chats = event.recipient === 'admin' ? this.chatIds() : [event.recipient];
      if (chats.some(chat => !this.chatIds().includes(chat))) throw new HttpError(403, 'Telegram recipient is not authorized');
      for (const chat_id of chats) {
        const data = await jsonHttp(`https://api.telegram.org/bot${this.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ chat_id, text }),
        }, this.transport);
        if (data.ok !== true) throw new HttpError(502, 'Telegram did not accept the notification');
      }
      return;
    }
    const data = await jsonHttp(this.env.SMS_PROVIDER_URL!, { method: 'POST', headers: {
      'Content-Type': 'application/json', 'Idempotency-Key': event.id,
      ...(this.env.SMS_PROVIDER_TOKEN ? { Authorization: `Bearer ${this.env.SMS_PROVIDER_TOKEN}` } : {}),
    }, body: JSON.stringify({ mobile: event.recipient, message: text, idempotencyKey: event.id, metadata: event.payload }) }, this.transport);
    if (data.success !== true) throw new HttpError(502, 'SMS provider did not accept the notification');
  }
  async registerWebhook(url: string): Promise<void> {
    if (!this.configured('telegram_reply') || !/^[A-Za-z0-9_-]{20,256}$/.test(this.env.TELEGRAM_WEBHOOK_SECRET || '') || !secureUrl(url)) throw new HttpError(503, 'Telegram webhook is not configured');
    const data = await jsonHttp(`https://api.telegram.org/bot${this.env.TELEGRAM_BOT_TOKEN}/setWebhook`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, secret_token: this.env.TELEGRAM_WEBHOOK_SECRET, allowed_updates: ['message'] }),
    }, this.transport);
    if (data.ok !== true) throw new HttpError(502, 'Telegram did not register the webhook');
  }
}
