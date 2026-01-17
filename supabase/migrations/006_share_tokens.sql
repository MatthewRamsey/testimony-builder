-- Add share_token for read-only sharing
ALTER TABLE testimonies
  ADD COLUMN IF NOT EXISTS share_token TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_testimonies_share_token
  ON testimonies(share_token)
  WHERE share_token IS NOT NULL;
