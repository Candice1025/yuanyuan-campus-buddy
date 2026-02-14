
-- 创建测试购买记录表
CREATE TABLE public.test_purchases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  test_type TEXT NOT NULL,
  order_no TEXT UNIQUE,
  amount NUMERIC(10,2) NOT NULL DEFAULT 0.99,
  status TEXT NOT NULL DEFAULT 'pending',
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 启用 RLS
ALTER TABLE public.test_purchases ENABLE ROW LEVEL SECURITY;

-- 用户只能查看自己的购买记录
CREATE POLICY "Users can view their own purchases"
ON public.test_purchases
FOR SELECT
USING (auth.uid() = user_id);

-- 用户可以创建自己的购买记录
CREATE POLICY "Users can create their own purchases"
ON public.test_purchases
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 服务端可通过 service_role 更新状态（回调用）
CREATE POLICY "Service role can update purchases"
ON public.test_purchases
FOR UPDATE
USING (true)
WITH CHECK (true);

-- 自动更新 updated_at
CREATE TRIGGER update_test_purchases_updated_at
BEFORE UPDATE ON public.test_purchases
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 索引：按用户+测试类型快速查询
CREATE INDEX idx_test_purchases_user_test ON public.test_purchases(user_id, test_type);
CREATE INDEX idx_test_purchases_order ON public.test_purchases(order_no);
