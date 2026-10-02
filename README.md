# ARIWATCH MVP

Bilingual English/Persian watch store with a Next.js 15 / React 19 storefront, Express API, and PostgreSQL. Prices are whole Iranian toman. Zarinpal receives the equivalent rial amount.

## Implemented

- Browse product details; search, filter collections, and sort by name or price.
- Persistent cart with quantity controls and current catalog price checks.
- Iranian mobile OTP sign-in, expiring server sessions, logout, and admin authorization.
- Shipping details, Zarinpal checkout, verified receipts, and private customer order history.
- Idempotent checkout and payment retries, retained payment-attempt references, and duplicate-payment review.
- Staff product creation/editing/deletion, order confirmation/shipping, concierge inbox, and newsletter signup list.
- English/Persian content, RTL layouts, language switching, mobile menus, and loading/error/empty states.
- Live typo-tolerant search, independent variant stock, wishlists, comparison, restock alerts, and timed offers.
- Configurable shipping, limited-use coupons, scoped staff roles, manual refund records, and verified sales reports.
- Excel product import with preview/confirmation, ZIP images, generated SEO, and Excel order export.
- Published/draft blog articles with embedded products and moderated customer comments.
- Configurable Torob feed, Basalam synchronization, Telegram administration, Instagram posts, and competitive price reports.

The PDF feature checklist is tracked in [FEATURES.md](FEATURES.md). Integration setup and bridge contracts are in [INTEGRATIONS.md](INTEGRATIONS.md).

## Run locally with Docker

Copy `.env.example` to `.env`, then:

```sh
docker compose up --build
```

Open [Persian storefront](http://localhost:3000/fa), [English storefront](http://localhost:3000/en), or [administration](http://localhost:3000/en/admin). PostgreSQL is exposed on local port 5433.

This development configuration uses SMS codes displayed in the login dialog and Zarinpal sandbox. The development administrator is `09123456789`; set `ADMIN_MOBILES` to change it. No live payment is made in sandbox.

The backend applies schema migrations and seeds the demo catalog automatically. Existing orders and edited products are preserved. Only original sample prices matching the old seed are migrated to sample toman amounts. Set `SEED_CATALOG=false` to prevent demo seeding. The sample amounts and stock photos are demonstration content, not market valuations.

## Run without Docker

Use Node.js 22+ and pnpm 10.17+ or npm. Install dependencies in `backend` and `frontend`.

Set backend `DATABASE_URL`, run `pnpm build`, then `pnpm start`. Set frontend `INTERNAL_API_URL=http://localhost:4000` and `NEXT_PUBLIC_API_URL=http://localhost:4000`, then run `pnpm dev`. Example frontend configuration is in `frontend/.env.example`.

For a local QA preview without PostgreSQL, build the backend then run `node tests/preview.cjs`. This test server uses a PGlite database saved in `.preview-db/store`, preserving local users, sessions, catalog edits and settings across restarts. `PREVIEW_DATA_DIRECTORY` and `PREVIEW_PORT` select a separate data directory and port for isolated QA. It uses Zarinpal sandbox by default. `PREVIEW_MOCK_PAYMENTS=true` explicitly enables an injected fake gateway for UI tests; its receipts do not represent real payments. The QA server refuses production mode.

## Production configuration

The Docker images build production applications. `docker-compose.yml` deliberately overrides the API to development mode for local OTP/sandbox testing. To deploy the production overlay:

```sh
docker compose -f docker-compose.yml -f docker-compose.production.yml up --build -d
```

Configure these values in the deployment environment:

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` / `POSTGRES_*` | Persistent PostgreSQL and separate production credentials |
| `ADMIN_MOBILES` | Comma-separated owner mobile numbers; staff and other administrators are managed in the admin panel |
| `FRONTEND_ORIGIN` | Public storefront HTTPS origin; first origin receives payment callbacks |
| `API_PUBLIC_URL` | Public HTTPS API origin used for Zarinpal callbacks |
| `NEXT_PUBLIC_API_URL` | Browser API origin, supplied at frontend build time |
| `NEXT_PUBLIC_SITE_URL` | Public storefront origin for canonical URLs and sitemaps, supplied at build time |
| `INTERNAL_API_URL` | API origin reachable by the Next.js server |
| `ZARINPAL_MERCHANT_ID` | Your Zarinpal merchant UUID |
| `ZARINPAL_SANDBOX=false` | Enable the live payment provider |
| `OTP_PROVIDER_URL` | HTTPS SMS bridge that accepts `POST {mobile,code}` |
| `OTP_PROVIDER_TOKEN` | Bearer credential for that SMS bridge |
| `TRUST_PROXY` | Trusted proxy hop count 0–5; configure to match the actual deployment |
| `SEED_CATALOG=false` | Disable sample products in production |

Production sign-in requires configured SMS delivery and never returns OTP codes to the browser. Configure your SMS provider behind the documented bridge contract. Live checkout requires the merchant account and a publicly reachable callback. No real merchant credentials or SMS secrets are included.

Each online order must total 1,000–100,000,000 toman. Custom sourcing uses concierge. The server calculates prices, verifies payments, and retains previous attempt references during recovery. Multiple verified payments flag staff review and block fulfillment. See the official [Zarinpal integration](https://www.zarinpal.com/docs/paymentGateway/connectToGateway), [sandbox](https://www.zarinpal.com/docs/paymentGateway/sandBox), [limits](https://www.zarinpal.com/docs/paymentGateway/errorList), and [payment inquiry](https://www.zarinpal.com/docs/paymentGateway/otherMethods/Inquiry) documentation.

Refunds are performed manually outside the payment gateway and recorded with their bank reference. Carrier integrations and newsletter campaign delivery remain outside scope. Inquiries and subscriptions are saved for staff. Review operational policies and replace demonstration content before accepting live orders.

Pending checkouts reserve available inventory and coupon usage. Staff can cancel an abandoned checkout after the provider confirms it is not actively processing. Paid/confirmed cancellations restore stock once and flag a manual refund. An eventual payment for a cancelled checkout remains cancelled and requires a refund; it cannot re-enter fulfillment. Verified duplicate payments still require operator review.

Bulk images live in `backend/uploads/catalog` (or `MEDIA_DIRECTORY`). Docker persists them in `catalog_media`; include that volume in backups with PostgreSQL. Import screens provide the Excel template, full row errors, and a read-only preview before confirmation. Existing SKUs update the matching product; new SKUs create products.

## Storefront media

The five homepage hero watches use official product packshots with matching model references. Admin Settings offers a choice between these watch photos and the original abstract clock design; the saved choice applies to both languages and all visitors. All 15 downloaded storefront images live in `frontend/public/resourses` and are served from `/resourses/`. [Media sources](frontend/public/resourses/SOURCES.md) records provenance; `manifest.json` records checksums and the replacements for two broken demo URLs and an unrelated photo. The current application has no video sources.

Run `node scripts/download-resourses.cjs` to verify existing downloads and restore any missing files. Original demo URLs in saved carts and orders resolve to their local counterparts; custom uploads keep their own URLs.

## Validation

```sh
node scripts/check-file-sizes.cjs
cd backend
pnpm build
pnpm test
cd ../frontend
pnpm typecheck
pnpm test
pnpm build
```

Tests cover OTP/session security, admin permissions, input validation, migration preservation, server pricing, checkout idempotency, owner-only history, verified callbacks, payment recovery, receipt review, form persistence, and safe payment navigation. API integration tests use an actual PostgreSQL engine via PGlite with mocked provider responses. They do not charge cards or confirm live Zarinpal account configuration.

## Repository

- `frontend/`: storefront, customer checkout, staff screens, and bilingual dictionaries.
- `backend/`: domain entities, application services/use cases, infrastructure, and HTTP routes.
- `backend/src/infrastructure/database/schema.sql`: additive database schema.
- `backend/src/infrastructure/database/init.sql`: guarded demo catalog migration.
- [Admin guide](ADMIN_README.md): operator setup and workflows.

Earlier plan documents record previous implementation stages; this README describes the current MVP.
