-- Migration: safer public share access via RPC

-- Remove overly broad public select policy
DROP POLICY IF EXISTS "Anyone can view testimonies with share_token" ON testimonies;

-- Public share access by token with limited fields and derived flags
CREATE OR REPLACE FUNCTION public.get_public_testimony_by_share_token(share_token text)
RETURNS TABLE (
  id uuid,
  title text,
  framework_type framework_type,
  content jsonb,
  is_public boolean,
  created_at timestamptz,
  updated_at timestamptz,
  is_owner boolean,
  is_anonymous boolean
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    t.id,
    t.title,
    t.framework_type,
    t.content,
    t.is_public,
    t.created_at,
    t.updated_at,
    (auth.uid() = t.user_id) AS is_owner,
    EXISTS (
      SELECT 1
      FROM anonymous_user_tracking aut
      WHERE aut.user_id = t.user_id
    ) AS is_anonymous
  FROM testimonies t
  WHERE t.share_token = $1
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_public_testimony_by_share_token(text) TO anon, authenticated;
