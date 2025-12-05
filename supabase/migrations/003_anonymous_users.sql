-- Migration: Add support for anonymous users
-- This migration adds share tokens to testimonies and creates a tracking table for anonymous users

-- Add share token columns to testimonies table
ALTER TABLE testimonies
  ADD COLUMN share_token TEXT UNIQUE,
  ADD COLUMN is_claimed BOOLEAN DEFAULT FALSE,
  ADD COLUMN claimed_at TIMESTAMP WITH TIME ZONE;

-- Create index on share_token for fast lookups
CREATE INDEX idx_testimonies_share_token ON testimonies(share_token)
  WHERE share_token IS NOT NULL;

-- Track anonymous users for lifecycle management
CREATE TABLE anonymous_user_tracking (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  last_activity TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  testimony_count INT DEFAULT 0,
  has_claimed BOOLEAN DEFAULT FALSE
);

-- Create indexes for common queries
CREATE INDEX idx_anonymous_tracking_activity ON anonymous_user_tracking(last_activity);
CREATE INDEX idx_anonymous_tracking_claimed ON anonymous_user_tracking(has_claimed);

-- Add comment for documentation
COMMENT ON TABLE anonymous_user_tracking IS 'Tracks anonymous users created via signInAnonymously() for conversion tracking and cleanup';
COMMENT ON COLUMN testimonies.share_token IS 'Unique token for public sharing via /share/[token]';
COMMENT ON COLUMN testimonies.is_claimed IS 'Whether this testimony was originally anonymous and has been claimed';
COMMENT ON COLUMN testimonies.claimed_at IS 'Timestamp when anonymous testimony was claimed by a real user';
