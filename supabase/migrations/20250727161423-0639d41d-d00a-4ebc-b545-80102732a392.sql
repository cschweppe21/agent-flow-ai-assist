-- Create a client_ratings table to store ratings
CREATE TABLE public.client_ratings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  client_id uuid NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, client_id)
);

-- Enable Row Level Security
ALTER TABLE public.client_ratings ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own client ratings" 
ON public.client_ratings 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own client ratings" 
ON public.client_ratings 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own client ratings" 
ON public.client_ratings 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own client ratings" 
ON public.client_ratings 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_client_ratings_updated_at
BEFORE UPDATE ON public.client_ratings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add comment to explain the purpose
COMMENT ON TABLE public.client_ratings IS 'Client ratings from 1-5 stars based on ease of working together';