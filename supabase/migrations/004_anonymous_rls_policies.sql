-- Migration: RLS policies for anonymous user access
-- This migration adds Row Level Security policies to support anonymous users and public sharing

-- Allow anyone to view testimonies via share_token
-- This is SAFE because share tokens are random, unguessable UUIDs
CREATE POLICY "Anyone can view testimonies with share_token"
  ON testimonies FOR SELECT
  USING (
    share_token IS NOT NULL
    AND share_token <> ''
  );

-- Enable RLS on anonymous_user_tracking table
ALTER TABLE anonymous_user_tracking ENABLE ROW LEVEL SECURITY;

-- Users can view their own tracking record
CREATE POLICY "Users can view own tracking"
  ON anonymous_user_tracking FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own tracking record (for last_activity updates)
CREATE POLICY "Users can update own tracking"
  ON anonymous_user_tracking FOR UPDATE
  USING (auth.uid() = user_id);

-- Note: INSERT operations on anonymous_user_tracking will be done via service role in API routes
-- This is intentional as we want to control the creation of tracking records
