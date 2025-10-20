-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create avatar_configs table for storing user's avatar customization
CREATE TABLE public.avatar_configs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  face_type TEXT NOT NULL DEFAULT 'oval',
  hairstyle TEXT NOT NULL DEFAULT 'short',
  eyes TEXT NOT NULL DEFAULT 'normal',
  nose TEXT NOT NULL DEFAULT 'normal',
  mouth TEXT NOT NULL DEFAULT 'smile',
  outfit TEXT NOT NULL DEFAULT 'casual',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.avatar_configs ENABLE ROW LEVEL SECURITY;

-- Create policies for avatar_configs
CREATE POLICY "Users can view their own avatar config"
  ON public.avatar_configs
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own avatar config"
  ON public.avatar_configs
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own avatar config"
  ON public.avatar_configs
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_avatar_configs_updated_at
  BEFORE UPDATE ON public.avatar_configs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (id, username)
  VALUES (new.id, new.email);
  
  -- Insert default avatar config
  INSERT INTO public.avatar_configs (user_id)
  VALUES (new.id);
  
  RETURN new;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();