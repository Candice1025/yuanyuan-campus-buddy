-- 1. Create public view for tree_hole_posts that excludes user_id
CREATE VIEW public.tree_hole_posts_public
WITH (security_invoker = on) AS
SELECT id, content, mood, likes, comments_count, created_at, updated_at
FROM public.tree_hole_posts;

-- Grant access to the view
GRANT SELECT ON public.tree_hole_posts_public TO authenticated, anon;

-- 2. Create public view for tree_hole_comments that excludes user_id
CREATE VIEW public.tree_hole_comments_public
WITH (security_invoker = on) AS
SELECT id, post_id, content, created_at
FROM public.tree_hole_comments;

-- Grant access to the view
GRANT SELECT ON public.tree_hole_comments_public TO authenticated, anon;

-- 3. Update RLS policies for tree_hole_posts - restrict direct SELECT to owner only
DROP POLICY IF EXISTS "Anyone can view tree hole posts" ON public.tree_hole_posts;

CREATE POLICY "Users can view their own posts for management"
ON public.tree_hole_posts
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 4. Update RLS policies for tree_hole_comments - restrict direct SELECT to owner only
DROP POLICY IF EXISTS "Anyone can view tree hole comments" ON public.tree_hole_comments;

CREATE POLICY "Users can view their own comments for management"
ON public.tree_hole_comments
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 5. Add RLS policies for verification_codes table - only service role should access
ALTER TABLE public.verification_codes ENABLE ROW LEVEL SECURITY;

-- No public access - only backend service role can access this table
-- The service role bypasses RLS, so no policies needed for backend access