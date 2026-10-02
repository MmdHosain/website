# Application structure

Domain contracts live in `backend/src/domain`. They describe watches, variants, database execution and integration provider capabilities without depending on Express or provider SDKs.

Application modules live in `backend/src/application` and are grouped by feature: catalog selection/search, checkout quote/inventory/payment/status, discounts, notifications, blog, imports and integrations. Shared timed pricing is a pure domain function used by checkout and external catalog publication.

Infrastructure adapters implement PostgreSQL persistence, migration loading, SMS/payment gateways and integration HTTP contracts. `createApp` is the composition root: it supplies the database, repositories and providers and exposes the HTTP routes. Tests inject PGlite and provider doubles without real notifications or charges.

Frontend server routes fetch public catalog/content and metadata. Client components own interaction state and call typed service wrappers. Checkout persistence and cart selection identifiers are separated from rendering. Staff navigation is convenience; every protected API checks the authoritative stored role.

Migrations are additive SQL modules loaded in filename order under a PostgreSQL advisory lock. Demo seed changes are guarded. Catalog images are separate durable files in a Docker volume. Notification events commit alongside the business mutation, then a worker delivers configured channels outside the transaction.

Application and test files are capped at 200 lines by `scripts/check-file-sizes.cjs`. The same check rejects imports from application/domain modules into infrastructure or presentation. Dependencies are supplied by the composition root. Split new behavior into modules with named responsibilities rather than extending a central service or page.
