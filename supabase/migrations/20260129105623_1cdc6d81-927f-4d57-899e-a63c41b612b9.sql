-- 添加公开读取帖子的策略（通过公开视图访问）
CREATE POLICY "Anyone can view posts via public view"
ON public.tree_hole_posts
FOR SELECT
TO anon, authenticated
USING (true);

-- 添加公开读取评论的策略（通过公开视图访问）
CREATE POLICY "Anyone can view comments via public view"
ON public.tree_hole_comments
FOR SELECT
TO anon, authenticated
USING (true);

-- 删除旧的限制性策略
DROP POLICY IF EXISTS "Users can view their own posts for management" ON public.tree_hole_posts;
DROP POLICY IF EXISTS "Users can view their own comments for management" ON public.tree_hole_comments;