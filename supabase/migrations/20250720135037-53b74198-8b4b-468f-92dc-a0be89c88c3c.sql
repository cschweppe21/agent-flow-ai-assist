
-- Create table to store market data by location
CREATE TABLE public.market_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  median_home_price NUMERIC,
  price_change_percent NUMERIC,
  days_on_market INTEGER,
  active_listings INTEGER,
  sales_volume INTEGER,
  price_per_sqft NUMERIC,
  inventory_months NUMERIC,
  data_source TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(city, state, data_source)
);

-- Create index for faster queries
CREATE INDEX idx_market_data_location ON public.market_data(city, state);
CREATE INDEX idx_market_data_updated ON public.market_data(updated_at);

-- Enable Row Level Security
ALTER TABLE public.market_data ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to read market data (public information)
CREATE POLICY "Anyone can view market data" 
  ON public.market_data 
  FOR SELECT 
  USING (true);

-- Create policy to allow system to insert/update market data
CREATE POLICY "System can manage market data" 
  ON public.market_data 
  FOR ALL 
  USING (true);

-- Create table to track data refresh status
CREATE TABLE public.data_refresh_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  data_source TEXT NOT NULL,
  refresh_started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  refresh_completed_at TIMESTAMP WITH TIME ZONE,
  records_updated INTEGER DEFAULT 0,
  error_message TEXT,
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'failed'))
);

-- Enable RLS for refresh log
ALTER TABLE public.data_refresh_log ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read refresh status
CREATE POLICY "Anyone can view refresh status" 
  ON public.data_refresh_log 
  FOR SELECT 
  USING (true);

-- Enable pg_cron extension for scheduled updates
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Enable pg_net extension for HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net;
