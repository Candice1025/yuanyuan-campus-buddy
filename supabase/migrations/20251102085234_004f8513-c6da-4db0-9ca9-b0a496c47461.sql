-- 修复 cleanup_expired_codes 函数的 search_path
CREATE OR REPLACE FUNCTION public.cleanup_expired_codes()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.verification_codes
  WHERE expires_at < now() OR created_at < now() - interval '1 day';
END;
$$;

-- 为 verification_codes 表添加 RLS 策略
-- 此表不需要用户直接访问，只通过 edge function 操作
-- 所以不添加任何允许策略，保持 RLS 启用状态以提高安全性