-- 心灵树洞帖子表（公开）
CREATE TABLE public.tree_hole_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  mood TEXT NOT NULL,
  likes INTEGER NOT NULL DEFAULT 0,
  comments_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 心灵树洞评论表（公开）
CREATE TABLE public.tree_hole_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.tree_hole_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 心灵树洞点赞表（公开）
CREATE TABLE public.tree_hole_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.tree_hole_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- 心情日记表（私有）
CREATE TABLE public.mood_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mood TEXT NOT NULL,
  content TEXT,
  intensity INTEGER CHECK (intensity >= 1 AND intensity <= 10),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 聊天记录表（私有）
CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  sender TEXT NOT NULL CHECK (sender IN ('user', 'assistant')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 启用 RLS
ALTER TABLE public.tree_hole_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tree_hole_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tree_hole_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mood_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- 心灵树洞帖子 RLS 策略（公开）
CREATE POLICY "Anyone can view tree hole posts"
  ON public.tree_hole_posts FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create tree hole posts"
  ON public.tree_hole_posts FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update their own tree hole posts"
  ON public.tree_hole_posts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tree hole posts"
  ON public.tree_hole_posts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 心灵树洞评论 RLS 策略（公开）
CREATE POLICY "Anyone can view tree hole comments"
  ON public.tree_hole_comments FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create tree hole comments"
  ON public.tree_hole_comments FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can delete their own tree hole comments"
  ON public.tree_hole_comments FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 心灵树洞点赞 RLS 策略（公开）
CREATE POLICY "Anyone can view tree hole likes"
  ON public.tree_hole_likes FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create tree hole likes"
  ON public.tree_hole_likes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tree hole likes"
  ON public.tree_hole_likes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 心情日记 RLS 策略（私有）
CREATE POLICY "Users can view their own mood entries"
  ON public.mood_entries FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own mood entries"
  ON public.mood_entries FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own mood entries"
  ON public.mood_entries FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own mood entries"
  ON public.mood_entries FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 聊天记录 RLS 策略（私有）
CREATE POLICY "Users can view their own chat messages"
  ON public.chat_messages FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own chat messages"
  ON public.chat_messages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own chat messages"
  ON public.chat_messages FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 创建更新时间戳触发器
CREATE TRIGGER update_tree_hole_posts_updated_at
  BEFORE UPDATE ON public.tree_hole_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_mood_entries_updated_at
  BEFORE UPDATE ON public.mood_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 创建函数来自动更新评论数
CREATE OR REPLACE FUNCTION public.increment_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.tree_hole_posts
  SET comments_count = comments_count + 1
  WHERE id = NEW.post_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.decrement_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.tree_hole_posts
  SET comments_count = comments_count - 1
  WHERE id = OLD.post_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 触发器：自动更新评论数
CREATE TRIGGER on_comment_created
  AFTER INSERT ON public.tree_hole_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.increment_comments_count();

CREATE TRIGGER on_comment_deleted
  AFTER DELETE ON public.tree_hole_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.decrement_comments_count();

-- 创建索引以提高查询性能
CREATE INDEX idx_tree_hole_posts_created_at ON public.tree_hole_posts(created_at DESC);
CREATE INDEX idx_tree_hole_posts_user_id ON public.tree_hole_posts(user_id);
CREATE INDEX idx_tree_hole_comments_post_id ON public.tree_hole_comments(post_id);
CREATE INDEX idx_tree_hole_likes_post_id ON public.tree_hole_likes(post_id);
CREATE INDEX idx_tree_hole_likes_user_id ON public.tree_hole_likes(user_id);
CREATE INDEX idx_mood_entries_user_id_created_at ON public.mood_entries(user_id, created_at DESC);
CREATE INDEX idx_chat_messages_user_id_created_at ON public.chat_messages(user_id, created_at DESC);