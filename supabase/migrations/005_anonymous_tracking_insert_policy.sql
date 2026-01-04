-- Migration: Allow users to insert their own anonymous tracking record
-- This enables the /api/users/anonymous/track endpoint to work with RLS

-- Users can insert their own tracking record
-- This is SAFE because they can only set user_id to their own auth.uid()
CREATE POLICY "Users can insert own tracking"
  ON anonymous_user_tracking FOR INSERT
  WITH CHECK (auth.uid() = user_id);

