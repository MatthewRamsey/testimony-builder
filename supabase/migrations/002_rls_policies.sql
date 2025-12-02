-- Enable Row Level Security
ALTER TABLE testimonies ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_entries ENABLE ROW LEVEL SECURITY;

-- Testimonies RLS Policies
-- Users can only see their own testimonies
CREATE POLICY "Users can view their own testimonies"
  ON testimonies FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own testimonies
CREATE POLICY "Users can insert their own testimonies"
  ON testimonies FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own testimonies
CREATE POLICY "Users can update their own testimonies"
  ON testimonies FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own testimonies
CREATE POLICY "Users can delete their own testimonies"
  ON testimonies FOR DELETE
  USING (auth.uid() = user_id);

-- Public testimonies can be viewed by anyone (for gallery)
CREATE POLICY "Public testimonies are viewable by everyone"
  ON testimonies FOR SELECT
  USING (is_public = true);

-- Subscriptions RLS Policies
-- Users can only see their own subscriptions
CREATE POLICY "Users can view their own subscriptions"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own subscriptions
CREATE POLICY "Users can insert their own subscriptions"
  ON subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own subscriptions
CREATE POLICY "Users can update their own subscriptions"
  ON subscriptions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Gallery Entries RLS Policies
-- Everyone can view public gallery entries
CREATE POLICY "Everyone can view gallery entries"
  ON gallery_entries FOR SELECT
  USING (true);

-- Users can insert their own gallery entries
CREATE POLICY "Users can insert their own gallery entries"
  ON gallery_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own gallery entries
CREATE POLICY "Users can update their own gallery entries"
  ON gallery_entries FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own gallery entries
CREATE POLICY "Users can delete their own gallery entries"
  ON gallery_entries FOR DELETE
  USING (auth.uid() = user_id);

