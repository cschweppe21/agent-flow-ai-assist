-- Create vendors table for real estate service providers
CREATE TABLE public.vendors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  business_name TEXT,
  category TEXT NOT NULL, -- 'inspector', 'appraiser', 'lender', 'contractor', 'photographer', 'stager', 'attorney', 'insurance'
  phone TEXT,
  email TEXT,
  website TEXT,
  address TEXT,
  notes TEXT,
  rating NUMERIC CHECK (rating >= 1 AND rating <= 5),
  is_preferred BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own vendors" 
ON public.vendors 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own vendors" 
ON public.vendors 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own vendors" 
ON public.vendors 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own vendors" 
ON public.vendors 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_vendors_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_vendors_updated_at
  BEFORE UPDATE ON public.vendors
  FOR EACH ROW
  EXECUTE FUNCTION public.update_vendors_updated_at();