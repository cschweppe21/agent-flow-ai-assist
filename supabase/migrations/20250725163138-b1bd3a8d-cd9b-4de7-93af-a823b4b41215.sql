-- Create subscription plans table
CREATE TABLE public.subscription_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  price_monthly DECIMAL(10,2) NOT NULL DEFAULT 0,
  price_yearly DECIMAL(10,2),
  features JSONB DEFAULT '[]'::jsonb,
  max_listings INTEGER,
  max_buyers INTEGER,
  max_tasks INTEGER,
  ai_features BOOLEAN DEFAULT false,
  priority_support BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

-- Allow everyone to view subscription plans
CREATE POLICY "Anyone can view subscription plans" 
ON public.subscription_plans 
FOR SELECT 
USING (true);

-- Insert default subscription plans
INSERT INTO public.subscription_plans (name, display_name, description, price_monthly, price_yearly, features, max_listings, max_buyers, max_tasks, ai_features, priority_support) VALUES
('free', 'Free', 'Perfect for getting started', 0, 0, '["Basic dashboard", "Up to 5 listings", "Up to 10 buyers", "Basic task management"]'::jsonb, 5, 10, 50, false, false),
('pro', 'Pro', 'For growing real estate professionals', 29.99, 299.99, '["Everything in Free", "Unlimited listings", "Unlimited buyers", "Advanced analytics", "AI assistant", "Email support"]'::jsonb, NULL, NULL, NULL, true, false),
('team', 'Team', 'For real estate teams and brokerages', 99.99, 999.99, '["Everything in Pro", "Team collaboration", "Advanced reporting", "Priority support", "Custom integrations", "White-label options"]'::jsonb, NULL, NULL, NULL, true, true);

-- Create subscription change requests table for tracking upgrade requests
CREATE TABLE public.subscription_change_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  current_plan TEXT NOT NULL,
  requested_plan TEXT NOT NULL,
  billing_cycle TEXT CHECK (billing_cycle IN ('monthly', 'yearly')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on subscription change requests
ALTER TABLE public.subscription_change_requests ENABLE ROW LEVEL SECURITY;

-- Users can view their own subscription change requests
CREATE POLICY "Users can view their own subscription change requests" 
ON public.subscription_change_requests 
FOR SELECT 
USING (auth.uid() = user_id);

-- Users can create their own subscription change requests
CREATE POLICY "Users can create their own subscription change requests" 
ON public.subscription_change_requests 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create function to calculate usage limits
CREATE OR REPLACE FUNCTION public.get_user_plan_limits(user_id UUID)
RETURNS JSONB
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT jsonb_build_object(
    'max_listings', sp.max_listings,
    'max_buyers', sp.max_buyers,
    'max_tasks', sp.max_tasks,
    'ai_features', sp.ai_features,
    'priority_support', sp.priority_support
  )
  FROM public.profiles p
  JOIN public.subscription_plans sp ON sp.name = p.subscription_tier
  WHERE p.user_id = get_user_plan_limits.user_id;
$$;