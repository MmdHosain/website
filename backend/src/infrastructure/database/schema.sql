CREATE TABLE IF NOT EXISTS watches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL, price NUMERIC(16, 2) NOT NULL, image_url TEXT NOT NULL,
  category VARCHAR(50) NOT NULL DEFAULT 'original'
);
ALTER TABLE watches ALTER COLUMN price TYPE NUMERIC(16, 2);
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), mobile VARCHAR(20) UNIQUE NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'user', created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS otps (
  mobile VARCHAR(20) PRIMARY KEY, code VARCHAR(10) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL
);
ALTER TABLE otps ADD COLUMN IF NOT EXISTS code_hash TEXT;
ALTER TABLE otps ADD COLUMN IF NOT EXISTS salt TEXT;
ALTER TABLE otps ADD COLUMN IF NOT EXISTS attempts INTEGER NOT NULL DEFAULT 0;
ALTER TABLE otps ADD COLUMN IF NOT EXISTS requested_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP;
CREATE TABLE IF NOT EXISTS sessions (
  token_hash CHAR(64) PRIMARY KEY, user_id UUID NOT NULL REFERENCES users(id),
  expires_at TIMESTAMPTZ NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS sessions_expiry_idx ON sessions(expires_at);
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID NOT NULL REFERENCES users(id),
  idempotency_key UUID NOT NULL, request_hash CHAR(64) NOT NULL,
  items JSONB NOT NULL, customer JSONB NOT NULL, total NUMERIC(16,2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'IRT', status VARCHAR(30) NOT NULL DEFAULT 'pending_payment',
  lang VARCHAR(2) NOT NULL DEFAULT 'en', payment_authority TEXT UNIQUE,
  payment_url TEXT, payment_ref_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP, UNIQUE(user_id, idempotency_key)
);
CREATE INDEX IF NOT EXISTS orders_user_idx ON orders(user_id,created_at DESC);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_review BOOLEAN NOT NULL DEFAULT FALSE;
CREATE TABLE IF NOT EXISTS payment_attempts (
  authority TEXT PRIMARY KEY, order_id UUID NOT NULL REFERENCES orders(id),
  payment_url TEXT NOT NULL, amount NUMERIC(16,2) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending', ref_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS payment_attempts_order_idx ON payment_attempts(order_id);
-- Preserve callback lookup for authorities created before attempt history was introduced.
INSERT INTO payment_attempts(authority,order_id,payment_url,amount,status,ref_id)
SELECT payment_authority,id,COALESCE(payment_url,''),total,
  CASE WHEN payment_ref_id IS NULL THEN 'pending' ELSE 'paid' END,payment_ref_id
FROM orders WHERE payment_authority IS NOT NULL ON CONFLICT(authority) DO NOTHING;
CREATE TABLE IF NOT EXISTS concierge_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name VARCHAR(150) NOT NULL,
  email VARCHAR(254) NOT NULL, model VARCHAR(255) NOT NULL DEFAULT '',
  message TEXT NOT NULL, lang VARCHAR(2) NOT NULL DEFAULT 'en',
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS newsletter_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), email VARCHAR(254) UNIQUE NOT NULL,
  lang VARCHAR(2) NOT NULL DEFAULT 'en', created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS schema_migrations (name TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP);
