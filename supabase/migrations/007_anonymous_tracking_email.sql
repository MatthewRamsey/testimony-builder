-- Add email to anonymous user tracking for future claim matching
ALTER TABLE anonymous_user_tracking
  ADD COLUMN IF NOT EXISTS email TEXT;

CREATE INDEX IF NOT EXISTS idx_anonymous_tracking_email
  ON anonymous_user_tracking(email);

COMMENT ON COLUMN anonymous_user_tracking.email IS 'Email entered by anonymous user for future claim matching';
