-- Create test_results table to store user test results
CREATE TABLE IF NOT EXISTS public.test_results (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  test_type text NOT NULL,
  test_name text NOT NULL,
  result text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.test_results ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own test results"
ON public.test_results FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own test results"
ON public.test_results FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own test results"
ON public.test_results FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own test results"
ON public.test_results FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_test_results_updated_at
BEFORE UPDATE ON public.test_results
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();