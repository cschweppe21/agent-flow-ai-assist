-- Fix security issues by setting search_path for the function
DROP FUNCTION IF EXISTS public.get_user_plan_limits(UUID);

CREATE OR REPLACE FUNCTION public.get_user_plan_limits(user_id UUID)
RETURNS JSONB
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = ''
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