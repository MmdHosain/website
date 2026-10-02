# Integration configuration

Set credentials in the server environment or local `.env`, never in the storefront. Enable each optional adapter only after configuring its account. Optional integrations are disabled by default; development checkout uses Zarinpal sandbox. The admin integrations page shows readiness, last successful sync and delivery counts without returning secrets.

## Notification SMS

OTP delivery continues to use `OTP_PROVIDER_URL` / `OTP_PROVIDER_TOKEN` with `POST {mobile,code}`. Transactional notifications use a separate bridge:

```dotenv
SMS_NOTIFICATIONS_ENABLED=true
SMS_PROVIDER_URL=https://your-sms-bridge.example/notifications
SMS_PROVIDER_TOKEN=your-server-secret
```

The bridge accepts JSON `{mobile,message,idempotencyKey,metadata}` and an `Idempotency-Key` header, and returns `{success:true}` only after accepting delivery. It must deduplicate the key. Events are persisted with the order/restock transaction, retried with backoff, and stop after eight attempts. Configure the provider’s actual SMS service behind this bridge.

## Telegram

Set `TELEGRAM_ENABLED=true`, `TELEGRAM_BOT_TOKEN`, comma-separated numeric `TELEGRAM_ADMIN_CHAT_IDS`, and a 20–256 character `TELEGRAM_WEBHOOK_SECRET` containing letters, digits, `_` or `-`. Only explicitly allowed private chats can issue commands; the sender ID must match the private chat ID. Bot credentials remain on the server.

With a public HTTPS `API_PUBLIC_URL`, click **Register Telegram webhook** in administration. It registers `/api/integrations/telegram/webhook` and Telegram’s secret header. Start the bot from each configured administrator’s Telegram account first. Incoming updates and replies are deduplicated by update ID.

Commands: `/orders`, `/status ORDER_ID confirmed|shipped|cancelled`, `/stock WATCH_ID [VARIANT_ID] QUANTITY`, `/price WATCH_ID [VARIANT_ID] TOMAN`, and `/help`. Stock is available-to-sell stock, excluding pending reservations. Commands apply the same order transition rules as the admin panel. New-order notifications and command replies use the durable outbox. Telegram delivery is at least once if a process stops after Telegram accepts a message but before recording success.

Protocol: [Telegram Bot API](https://core.telegram.org/bots/api).

## Torob

Enable `TOROB_ENABLED=true`, set public HTTPS API/storefront origins, and submit `API_PUBLIC_URL/torob_api/v3/products` to your Torob account. POST requests require the signed `X-Torob-Token` and version `1`. The official Ed25519 key is included; optionally configure `TOROB_PUBLIC_KEY` after a documented key rotation. `TOROB_AUDIENCE` defaults to the public API host including a custom port.

The endpoint supports URL/identifier selections, 100-product pages, and cursor pagination; it reports integer toman, availability and separate variant identifiers. `/api/feeds/products` is also a public general catalog feed. Partner account approval and suitable product imagery are still required.

Protocol: [Torob product API](https://github.com/torob/Torob-Sync/blob/main/product_api_v3.md), [token validation](https://github.com/torob/Torob-Sync/blob/main/torob_api_token_guide.md).

## Basalam

Set `BASALAM_ENABLED=true`, `BASALAM_ACCESS_TOKEN`, numeric `BASALAM_VENDOR_ID`, and explicitly select `BASALAM_PRICE_UNIT=toman` or `rial` according to your account’s API contract. There is no implicit currency assumption. In administration, map existing Basalam product IDs to individual catalog watches/variants before syncing. Each variant can map to a separate existing product. The integration does not create a new vendor or invent marketplace category/image IDs.

The adapter patches `/v1/vendors/{vendorId}/products/batch-updates` at `https://openapi.basalam.com`. Every batch item must confirm success. Configured mappings synchronize prices and available stock at startup and every ten minutes; **Sync now** provides an immediate update. Expired access tokens require renewal in the server environment.

Protocol: [Basalam official SDK](https://github.com/basalam/php-sdk), [core product operations](https://github.com/basalam/php-sdk/blob/main/docs/services/core.md).

## Instagram

Set `INSTAGRAM_ENABLED=true`, numeric `INSTAGRAM_USER_ID`, `INSTAGRAM_ACCESS_TOKEN`, and `INSTAGRAM_API_VERSION` (a supported version such as `v26.0`, selected in the Meta developer console). Use a professional account token for Instagram Login with permission to read its media. Server-side requests read recent media at `graph.instagram.com/{version}/{userId}/media`; tokens are sent in authorization headers.

Recent posts refresh at startup/every ten minutes. Successful responses replace the storefront cache; failures retain the previous cache. Media without an image/thumbnail remains accessible through its Instagram permalink. The homepage section is hidden until posts are available. Renew expiring tokens through your approved account workflow.

Protocol: [Meta Instagram Platform](https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login/), [Meta’s API collection](https://www.postman.com/meta/instagram/documentation/6yqw8pt/instagram-api).

## Competitive prices

Manual source observations can be added by catalog staff. For automated collection, connect a licensed price-report provider through `PRICE_REPORT_ENABLED=true`, HTTPS `PRICE_REPORT_URL`, and optional `PRICE_REPORT_TOKEN`.

The bridge accepts `POST {currency:"IRT",watches:[{id,name}]}` and returns `{observations:[{watchId,source,url,priceToman,observedAt}]}`. Prices must be whole positive toman; product URLs must use HTTPS; timestamps must be valid and not in the future. The application preserves sources and observation dates and never automatically changes catalog prices. Review matching model/color/authenticity before staff adjusts a price.

The provider is responsible for permitted access and exact product matching. The app supplies the integration contract and reporting workflow, rather than claiming unconfigured external observations are live market data.
