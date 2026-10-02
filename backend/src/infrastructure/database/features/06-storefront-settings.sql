ALTER TABLE store_settings ADD COLUMN IF NOT EXISTS hero_style VARCHAR(20) NOT NULL DEFAULT 'watch-photos';
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='store_settings_hero_style_check' AND conrelid='store_settings'::regclass) THEN
    ALTER TABLE store_settings ADD CONSTRAINT store_settings_hero_style_check CHECK(hero_style IN ('watch-photos','classic-clock'));
  END IF;
END
$$;
