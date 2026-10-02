ALTER TABLE watches ADD COLUMN IF NOT EXISTS sku VARCHAR(100);
CREATE UNIQUE INDEX IF NOT EXISTS watches_sku_idx ON watches(sku) WHERE sku IS NOT NULL;
ALTER TABLE watches ADD COLUMN IF NOT EXISTS features TEXT NOT NULL DEFAULT '';
ALTER TABLE watches ADD COLUMN IF NOT EXISTS meta_title VARCHAR(160);
ALTER TABLE watches ADD COLUMN IF NOT EXISTS meta_description VARCHAR(320);
CREATE TABLE IF NOT EXISTS blog_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), lang VARCHAR(2) NOT NULL CHECK(lang IN ('en','fa')),
  title VARCHAR(160) NOT NULL, slug VARCHAR(180) NOT NULL, excerpt VARCHAR(320) NOT NULL,
  blocks JSONB NOT NULL, status VARCHAR(12) NOT NULL CHECK(status IN ('draft','published')),
  author_id UUID REFERENCES users(id), published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), UNIQUE(lang,slug)
);
CREATE INDEX IF NOT EXISTS blog_public_idx ON blog_articles(lang,status,published_at DESC);
CREATE TABLE IF NOT EXISTS blog_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), article_id UUID NOT NULL REFERENCES blog_articles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id), name VARCHAR(100) NOT NULL, body VARCHAR(2000) NOT NULL,
  status VARCHAR(12) NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','approved','rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS blog_comments_article_idx ON blog_comments(article_id,status,created_at);
CREATE TABLE IF NOT EXISTS catalog_imports (
  id UUID PRIMARY KEY, user_id UUID NOT NULL REFERENCES users(id), rows JSONB NOT NULL,
  images JSONB NOT NULL, errors JSONB NOT NULL, result JSONB,
  expires_at TIMESTAMPTZ NOT NULL, confirmed_at TIMESTAMPTZ, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS catalog_imports_expiry_idx ON catalog_imports(expires_at);
