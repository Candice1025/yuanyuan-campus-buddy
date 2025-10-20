-- Add new columns to avatar_configs for more customization options
ALTER TABLE public.avatar_configs 
ADD COLUMN IF NOT EXISTS eyebrows text DEFAULT 'normal',
ADD COLUMN IF NOT EXISTS skin_tone text DEFAULT 'light',
ADD COLUMN IF NOT EXISTS accessories text DEFAULT 'none',
ADD COLUMN IF NOT EXISTS avatar_name text DEFAULT '我的形象';

-- Create a table for saving multiple avatar presets
CREATE TABLE IF NOT EXISTS public.saved_avatars (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  avatar_name text NOT NULL DEFAULT '未命名形象',
  face_type text NOT NULL DEFAULT 'oval',
  hairstyle text NOT NULL DEFAULT 'short',
  eyes text NOT NULL DEFAULT 'normal',
  eyebrows text NOT NULL DEFAULT 'normal',
  nose text NOT NULL DEFAULT 'normal',
  mouth text NOT NULL DEFAULT 'smile',
  skin_tone text NOT NULL DEFAULT 'light',
  outfit text NOT NULL DEFAULT 'casual',
  accessories text NOT NULL DEFAULT 'none',
  is_active boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.saved_avatars ENABLE ROW LEVEL SECURITY;

-- Create policies for saved_avatars
CREATE POLICY "Users can view their own saved avatars"
ON public.saved_avatars
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own saved avatars"
ON public.saved_avatars
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own saved avatars"
ON public.saved_avatars
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved avatars"
ON public.saved_avatars
FOR DELETE
USING (auth.uid() = user_id);

-- Add trigger for automatic timestamp updates on saved_avatars
CREATE TRIGGER update_saved_avatars_updated_at
BEFORE UPDATE ON public.saved_avatars
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();