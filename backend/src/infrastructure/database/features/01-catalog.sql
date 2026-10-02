ALTER TABLE watches ADD COLUMN IF NOT EXISTS stock_quantity INTEGER NOT NULL DEFAULT 20 CHECK (stock_quantity >= 0);
ALTER TABLE watches ADD COLUMN IF NOT EXISTS sale_price NUMERIC(16,2);
ALTER TABLE watches ADD COLUMN IF NOT EXISTS sale_starts_at TIMESTAMPTZ;
ALTER TABLE watches ADD COLUMN IF NOT EXISTS sale_ends_at TIMESTAMPTZ;
CREATE TABLE IF NOT EXISTS watch_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), watch_id UUID NOT NULL REFERENCES watches(id) ON DELETE CASCADE,
  sku VARCHAR(100) NOT NULL UNIQUE, label VARCHAR(150) NOT NULL, color VARCHAR(100),
  price NUMERIC(16,2) NOT NULL CHECK (price > 0),
  stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0)
);
CREATE INDEX IF NOT EXISTS watch_variants_watch_idx ON watch_variants(watch_id);
CREATE TABLE IF NOT EXISTS wishlist_items (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  watch_id UUID NOT NULL REFERENCES watches(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), PRIMARY KEY(user_id,watch_id)
);
CREATE TABLE IF NOT EXISTS stock_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  watch_id UUID NOT NULL REFERENCES watches(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES watch_variants(id) ON DELETE CASCADE,
  notification_enqueued_at TIMESTAMPTZ, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS stock_alerts_pending_idx ON stock_alerts(user_id,watch_id,COALESCE(variant_id,'00000000-0000-0000-0000-000000000000'::uuid)) WHERE notification_enqueued_at IS NULL;
