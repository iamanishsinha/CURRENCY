-- CURRENCY -- reference schema for the persistence layer described in the
-- planning spec (sections 78-86). NOT wired up in this build: the running
-- app uses the provider adapters + in-memory cache in lib/, and fetches
-- current/historical data live rather than owning a datastore.
--
-- Use this when you're ready to add: full historical backfill independent
-- of provider retention windows, per-user watchlists/alerts (needs the
-- users table, which the original spec omitted -- see the plan review),
-- and precomputed analytics.

CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT UNIQUE NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE countries (
  code          CHAR(2) PRIMARY KEY, -- ISO 3166-1 alpha-2
  name          TEXT NOT NULL,
  region        TEXT
);

CREATE TABLE currencies (
  code          CHAR(3) PRIMARY KEY, -- ISO 4217
  name          TEXT NOT NULL,
  symbol        TEXT NOT NULL,
  country_code  CHAR(2) REFERENCES countries(code)
);

CREATE TABLE crypto_assets (
  id            TEXT PRIMARY KEY, -- provider id, e.g. coingecko slug
  symbol        TEXT NOT NULL,
  name          TEXT NOT NULL
);

-- One row per observed price/rate. Append-only; this is the historical
-- record, not just a "latest" cache.
CREATE TABLE market_observations (
  id                  BIGSERIAL PRIMARY KEY,
  asset_id            TEXT NOT NULL, -- currency code or crypto id
  asset_type          TEXT NOT NULL CHECK (asset_type IN ('fiat', 'crypto')),
  base                TEXT NOT NULL,
  quote               TEXT NOT NULL,
  value               NUMERIC NOT NULL,
  source              TEXT NOT NULL,
  data_status         TEXT NOT NULL,
  provider_timestamp  TIMESTAMPTZ NOT NULL,
  retrieved_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_market_observations_lookup
  ON market_observations (asset_id, base, quote, provider_timestamp DESC);

CREATE TABLE economic_indicators (
  id            BIGSERIAL PRIMARY KEY,
  country_code  CHAR(2) REFERENCES countries(code),
  indicator     TEXT NOT NULL, -- e.g. 'CPI_YOY', 'POLICY_RATE'
  value         NUMERIC NOT NULL,
  as_of         DATE NOT NULL,
  source        TEXT NOT NULL
);

CREATE TABLE market_events (
  id            BIGSERIAL PRIMARY KEY,
  title         TEXT NOT NULL,
  description   TEXT,
  occurred_at   TIMESTAMPTZ NOT NULL,
  related_asset TEXT, -- optional currency code or crypto id
  source        TEXT
);

CREATE TABLE watchlist_items (
  id          BIGSERIAL PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  asset_id    TEXT NOT NULL,
  asset_type  TEXT NOT NULL CHECK (asset_type IN ('fiat', 'crypto')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, asset_id, asset_type)
);

CREATE TABLE alerts (
  id            BIGSERIAL PRIMARY KEY,
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  asset_id      TEXT NOT NULL,
  asset_type    TEXT NOT NULL CHECK (asset_type IN ('fiat', 'crypto')),
  condition     TEXT NOT NULL CHECK (condition IN ('above', 'below')),
  threshold     NUMERIC NOT NULL,
  triggered_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
