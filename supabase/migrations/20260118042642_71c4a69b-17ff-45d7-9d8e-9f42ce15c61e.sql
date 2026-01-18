-- 1. 修复 tree_hole_likes 表的 RLS - 限制用户只能查看自己的点赞记录
DROP POLICY IF EXISTS "Anyone can view tree hole likes" ON public.tree_hole_likes;

CREATE POLICY "Users can view their own likes"
ON public.tree_hole_likes
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 2. 修复 tree_hole_posts 的 INSERT 策略 - 必须验证 user_id
DROP POLICY IF EXISTS "Authenticated users can create tree hole posts" ON public.tree_hole_posts;

CREATE POLICY "Authenticated users can create their own posts"
ON public.tree_hole_posts
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 3. 修复 tree_hole_comments 的 INSERT 策略 - 必须验证 user_id
DROP POLICY IF EXISTS "Authenticated users can create tree hole comments" ON public.tree_hole_comments;

CREATE POLICY "Authenticated users can create their own comments"
ON public.tree_hole_comments
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 4. 改进评论计数函数 - 添加验证逻辑
CREATE OR REPLACE FUNCTION public.increment_comments_count()
RETURNS TRIGGER AS $$
DECLARE
  post_exists boolean;
BEGIN
  -- 验证帖子存在
  SELECT EXISTS(
    SELECT 1 FROM public.tree_hole_posts WHERE id = NEW.post_id
  ) INTO post_exists;
  
  IF NOT post_exists THEN
    RAISE EXCEPTION 'Invalid post_id';
  END IF;
  
  UPDATE public.tree_hole_posts
  SET comments_count = comments_count + 1
  WHERE id = NEW.post_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.decrement_comments_count()
RETURNS TRIGGER AS $$
DECLARE
  post_exists boolean;
BEGIN
  -- 验证帖子存在
  SELECT EXISTS(
    SELECT 1 FROM public.tree_hole_posts WHERE id = OLD.post_id
  ) INTO post_exists;
  
  IF NOT post_exists THEN
    RETURN OLD;
  END IF;
  
  UPDATE public.tree_hole_posts
  SET comments_count = GREATEST(0, comments_count - 1)
  WHERE id = OLD.post_id;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 5. 创建公开视图的 RLS 注释（视图本身通过 security_invoker 已安全）
COMMENT ON VIEW public.tree_hole_posts_public IS '公开视图 - 不暴露 user_id，通过 security_invoker 保护';
COMMENT ON VIEW public.tree_hole_comments_public IS '公开视图 - 不暴露 user_id，通过 security_invoker 保护';