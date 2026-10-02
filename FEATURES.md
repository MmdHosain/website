# ARIWATCH feature implementation

The feature list in `لیست امکانات آریواچ.pdf` is implemented in the order below. Its descriptions are product requirements; live accounts and credentials are configured separately.

| Order | PDF feature | Implementation |
| --- | --- | --- |
| 1 | Mobile OTP login | Iranian number normalization, expiring codes, server sessions, logout |
| 2 | Fuzzy live search | Live catalog queries, English/Persian brand aliases, typo tolerance |
| 3 | Product variants | SKU/model/color selection, independent price and available stock |
| 4 | Wishlist and comparison | Guest persistence, account wishlist synchronization, comparison page |
| 5 | Back-in-stock SMS | Authenticated per-product/variant subscriptions, deduplicated notification queue |
| 6 | Checkout and fixed shipping | Server quote, configurable shipping fee, toman checkout and verified Zarinpal receipt |
| 7 | Timed special offers | Start/end dates, consistent proportional variant discounts, offers section |
| 8 | Staff access levels | Full administrator, catalog staff, order staff, blog staff; API authorization |
| 9 | Order status SMS and cancellation | Durable status notifications; stock release and manual-refund record |
| 10 | Coupon rules | Percentage/fixed discounts, dates, minimum/maximum cart, maximum discount, usage limits |
| 11 | Excel export | Authenticated order XLSX download with date range and size limit |
| 12 | Sales reporting | Verified payment time, product category/quantity, totals and refund balance |
| 13 | Competitive pricing | Timestamped observations with sources, comparison dashboard, configurable provider bridge |
| 14 | Torob and Basalam | Torob v3 JWT feed; mapped Basalam catalog price/stock synchronization |
| 15 | Two-way Telegram bot | New-order queue, authorized private-chat commands for orders, status, stock and price |
| 16 | Bulk Excel and ZIP updates | Real XLSX template, every-row validation, safe images, transactional confirmation, stable SKU upserts |
| 17 | Instagram posts | Configurable professional-account API adapter, cached recent media on storefront |
| 18 | Automatic SEO | Generated product titles/descriptions, canonical metadata, product JSON-LD, sitemap and robots |
| 19 | Blog and comments | Draft/published articles, scoped staff editor, authenticated moderated comments |
| 20 | Products inside articles | Text and product blocks rendered in order, variant-aware product links and add-to-cart controls |

All optional integration adapters are disabled by default; development checkout uses Zarinpal sandbox. Stock/status SMS, Telegram, Instagram, Basalam, Torob onboarding and competitive-price collection need their respective provider settings. This does not require changing storefront or business logic. See [INTEGRATIONS.md](INTEGRATIONS.md).

The running local QA preview is temporary. PostgreSQL and uploaded-image volumes provide persistence in the Docker deployment. Live payment, SMS delivery and partner account approval are not simulated as live connections.

Code is separated into domain contracts, application feature modules, infrastructure adapters and HTTP/UI components. `node scripts/check-file-sizes.cjs` enforces the requested 200-line cap for application and test modules. Tests exercise pricing, inventory, permissions, imports, provider boundaries and notification recovery.
