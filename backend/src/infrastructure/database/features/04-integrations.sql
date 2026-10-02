ALTER TABLE watches ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE watches ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP;
CREATE OR REPLACE FUNCTION watch_update_timestamp() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = CURRENT_TIMESTAMP; RETURN NEW; END; $$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS watches_updated_timestamp ON watches;
CREATE TRIGGER watches_updated_timestamp BEFORE UPDATE ON watches FOR EACH ROW EXECUTE FUNCTION watch_update_timestamp();
CREATE TABLE IF NOT EXISTS integration_runs (
  provider TEXT PRIMARY KEY, status TEXT NOT NULL, last_success_at TIMESTAMPTZ,
  last_attempt_at TIMESTAMPTZ, last_error TEXT
);
CREATE TABLE IF NOT EXISTS social_posts (
  id TEXT PRIMARY KEY, caption TEXT NOT NULL, permalink TEXT NOT NULL,
  image_url TEXT, published_at TIMESTAMPTZ NOT NULL, synced_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS competitive_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), watch_id UUID NOT NULL REFERENCES watches(id) ON DELETE CASCADE,
  source TEXT NOT NULL, url TEXT NOT NULL, price_toman NUMERIC(16,0) NOT NULL,
  observed_at TIMESTAMPTZ NOT NULL, UNIQUE(watch_id,source,url)
);
CREATE TABLE IF NOT EXISTS marketplace_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), watch_id UUID NOT NULL REFERENCES watches(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES watch_variants(id) ON DELETE CASCADE, external_id BIGINT NOT NULL UNIQUE,
  UNIQUE(watch_id,variant_id)
);
CREATE UNIQUE INDEX IF NOT EXISTS mapping_base_unique ON marketplace_mappings(watch_id) WHERE variant_id IS NULL;
CREATE TABLE IF NOT EXISTS telegram_updates (
  update_id BIGINT PRIMARY KEY, processed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
