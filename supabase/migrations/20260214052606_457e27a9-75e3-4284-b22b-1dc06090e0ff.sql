
-- 删除过于宽松的 UPDATE 策略
DROP POLICY "Service role can update purchases" ON public.test_purchases;

-- 用户只能更新自己的购买记录（实际回调通过 service_role 绕过 RLS）
CREATE POLICY "Users can view and manage their own purchases"
ON public.test_purchases
FOR UPDATE
USING (auth.uid() = user_id);
