-- 创建验证码表
CREATE TABLE IF NOT EXISTS public.verification_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  phone TEXT NOT NULL,
  code TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN NOT NULL DEFAULT false
);

-- 创建索引以提高查询效率
CREATE INDEX idx_verification_codes_phone ON public.verification_codes(phone);
CREATE INDEX idx_verification_codes_created_at ON public.verification_codes(created_at);

-- 启用 RLS
ALTER TABLE public.verification_codes ENABLE ROW LEVEL SECURITY;

-- 创建清理过期验证码的函数
CREATE OR REPLACE FUNCTION public.cleanup_expired_codes()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.verification_codes
  WHERE expires_at < now() OR created_at < now() - interval '1 day';
END;
$$;