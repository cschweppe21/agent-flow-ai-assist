-- Create buyers table for buyer representation
CREATE TABLE public.buyers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  budget_min NUMERIC,
  budget_max NUMERIC,
  preferred_bedrooms INTEGER,
  preferred_bathrooms NUMERIC,
  preferred_areas TEXT[], -- Array of preferred neighborhoods/areas
  status TEXT NOT NULL DEFAULT 'active', -- active, under_contract, closed, inactive
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.buyers ENABLE ROW LEVEL SECURITY;

-- Create policies for buyer access
CREATE POLICY "Users can view their own buyers" 
ON public.buyers 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own buyers" 
ON public.buyers 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own buyers" 
ON public.buyers 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own buyers" 
ON public.buyers 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_buyers_updated_at
BEFORE UPDATE ON public.buyers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create buyer_showings table to track property showings
CREATE TABLE public.buyer_showings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  buyer_id UUID NOT NULL REFERENCES public.buyers(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  showing_date DATE NOT NULL,
  feedback TEXT,
  interest_level TEXT DEFAULT 'neutral', -- high, medium, low, neutral
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for buyer_showings
ALTER TABLE public.buyer_showings ENABLE ROW LEVEL SECURITY;

-- Create policies for buyer_showings
CREATE POLICY "Users can view their own buyer showings" 
ON public.buyer_showings 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.buyers 
  WHERE buyers.id = buyer_showings.buyer_id 
  AND buyers.user_id = auth.uid()
));

CREATE POLICY "Users can create their own buyer showings" 
ON public.buyer_showings 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.buyers 
  WHERE buyers.id = buyer_showings.buyer_id 
  AND buyers.user_id = auth.uid()
));

CREATE POLICY "Users can update their own buyer showings" 
ON public.buyer_showings 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.buyers 
  WHERE buyers.id = buyer_showings.buyer_id 
  AND buyers.user_id = auth.uid()
));

CREATE POLICY "Users can delete their own buyer showings" 
ON public.buyer_showings 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM public.buyers 
  WHERE buyers.id = buyer_showings.buyer_id 
  AND buyers.user_id = auth.uid()
));

-- Add trigger for buyer_showings timestamps
CREATE TRIGGER update_buyer_showings_updated_at
BEFORE UPDATE ON public.buyer_showings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();