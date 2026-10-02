# ARIWATCH administration

Open `/en/admin` or `/fa/admin` and sign in with a mobile number listed in `ADMIN_MOBILES`. Development defaults to `09123456789`, with the six-digit mock SMS code displayed in the login dialog. Production has no default administrator and requires real SMS delivery.

The API validates each staff request using an expiring server session and the stored role. `ADMIN_MOBILES` promotes configured owner accounts; other roles persist and are managed through Staff roles. Removing a number from the environment alone does not revoke a stored role. Use another full administrator to revoke access in the panel. Configured owners and the current administrator cannot be demoted by that screen.

Full administrators manage all sections. Catalog staff manage products/imports/price observations; order staff manage orders/reports/inquiries; blog staff manage articles and comments. Menu visibility follows these permissions, and the API enforces them independently.

## Catalog

Use Products to add, edit, or delete watches. Prices are positive whole toman amounts. Images accept HTTP(S) URLs or safe local asset paths. Product category is Original, High Copy, or Custom Order. Custom watches open concierge instead of online checkout.

Set available stock, variants with stable SKUs, and optional timed sale dates. A variant’s sale price uses the product’s discount ratio. Stock changes from zero to positive enqueue pending restock alerts. Pending checkouts reserve inventory, so the stock fields show remaining available inventory rather than total physical inventory.

Products/variants in active orders cannot be removed. Other deletions leave historical order snapshots intact. Stale carts and prices are checked before payment. Wishlist and comparison links are in the storefront menu.

Bulk import provides an XLSX template and optional image ZIP. Preview lists every row error before confirmation. Confirmation updates existing SKUs and creates new SKUs in one database transaction. New images persist in the catalog media volume. Product names/features generate SEO titles and descriptions.

## Orders

The Orders screen lists verified customer mobile numbers, delivery details, item snapshots, totals, status, and payment references.

- `pending_payment`: payment has not been verified; cancellation first checks the provider.
- `paid`: provider verification succeeded; staff can confirm or cancel with a manual refund due.
- `confirmed`: order is accepted for fulfillment; staff can mark it shipped or cancel with a manual refund due.
- `shipped`: fulfillment is complete in this MVP.
- `cancelled`: inventory has been released once; any verified funds require a manual refund.

Staff cannot manufacture a paid status. Pending cancellation checks the provider and is blocked while payment is actively processing. An eventual verified payment for a cancelled order remains cancelled and requires a refund. Multiple verified attempts flag review and preserve all references; resolve that issue before fulfillment.

Perform refunds outside the app, then record the bank reference through the order’s manual refund control. Status changes queue SMS notifications when the notification provider is configured. Unconfigured channels remain pending instead of pretending delivery succeeded.

Sales reports show verified payment times, product categories/quantities, final order revenue and manual refunds due. Product revenue is before coupons/shipping. Date-filtered summary totals cover the full period, while displayed order detail is capped. The Excel export contains creation-date-filtered order snapshots, mobile, payment and refund data.

## Shipping and coupons

Shipping settings controls the fixed whole-toman delivery fee. Coupons support fixed/percentage discounts, cart minimum/maximum, maximum discount, start/end timestamps and a global usage limit. Pending checkout reservations count toward that limit; unpaid cancellation releases the reservation. Coupon codes are stable and can be disabled without changing historical orders.

## Blog

Create draft or published articles in each language. Content blocks are plain text or embedded catalog products, and retain their order. A variant product opens its selection page before adding to cart. Customer comments require sign-in and remain hidden until blog staff approves them; moderation can hide previously approved comments.

## Integrations and competitive prices

Integrations displays server configuration readiness, sync attempts, and notification queue counts. Configure accounts according to [INTEGRATIONS.md](INTEGRATIONS.md). Basalam mappings connect existing marketplace IDs to catalog selections. Price tracking retains source URLs and timestamps for manual or connected-provider observations; staff decides whether to change a catalog price.

## Inquiries and newsletter

Inquiries contains saved concierge requests with name, email, requested model, message, and time. Newsletter lists saved signup addresses. These screens are an inbox and signup list; outbound email campaigns and support messaging are handled separately.

## Configuration

See [README.md](README.md) and [.env.example](.env.example) for production payment, SMS, public callback, and proxy configuration.
