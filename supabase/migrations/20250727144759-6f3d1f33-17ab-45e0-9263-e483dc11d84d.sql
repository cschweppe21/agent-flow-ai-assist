-- Fix Security Definer View Issue
-- Drop and recreate past_clients view without SECURITY DEFINER
DROP VIEW IF EXISTS public.past_clients;

CREATE VIEW public.past_clients AS
SELECT 
  b.*,
  c.amount as commission_amount,
  c.sale_price,
  c.created_at as closed_at
FROM public.buyers b
LEFT JOIN public.commissions c ON b.id = c.buyer_id
WHERE b.status = 'closed' AND b.user_id = auth.uid();

-- Fix function search path security issues
-- Update existing functions to have secure search_path

-- Fix handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, email)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'display_name', NEW.email);
  RETURN NEW;
END;
$function$;

-- Fix update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Fix prevent_role_escalation_and_log function
CREATE OR REPLACE FUNCTION public.prevent_role_escalation_and_log()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  -- Prevent role changes
  IF OLD.role IS DISTINCT FROM NEW.role THEN
    -- Log the attempt
    INSERT INTO public.security_logs (user_id, event_type, event_data)
    VALUES (
      NEW.user_id,
      'role_change_attempt',
      jsonb_build_object(
        'old_role', OLD.role,
        'new_role', NEW.role,
        'profile_id', NEW.id
      )
    );
    
    -- Prevent the change
    RAISE EXCEPTION 'Role changes are not permitted';
  END IF;
  
  -- Prevent subscription changes by regular users
  IF OLD.subscription_tier IS DISTINCT FROM NEW.subscription_tier 
     OR OLD.subscription_active IS DISTINCT FROM NEW.subscription_active
     OR OLD.subscription_end_date IS DISTINCT FROM NEW.subscription_end_date THEN
    
    -- Log the attempt
    INSERT INTO public.security_logs (user_id, event_type, event_data)
    VALUES (
      NEW.user_id,
      'subscription_change_attempt',
      jsonb_build_object(
        'old_tier', OLD.subscription_tier,
        'new_tier', NEW.subscription_tier,
        'old_active', OLD.subscription_active,
        'new_active', NEW.subscription_active,
        'profile_id', NEW.id
      )
    );
    
    -- Prevent the change
    RAISE EXCEPTION 'Subscription changes are not permitted';
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Fix log_security_event function
CREATE OR REPLACE FUNCTION public.log_security_event(event_type text, event_data jsonb DEFAULT NULL::jsonb, target_user_id uuid DEFAULT NULL::uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  INSERT INTO public.security_logs (user_id, event_type, event_data)
  VALUES (COALESCE(target_user_id, auth.uid()), event_type, event_data);
END;
$function$;

-- Fix get_user_plan_limits function
CREATE OR REPLACE FUNCTION public.get_user_plan_limits(user_id uuid)
RETURNS jsonb
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $function$
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
$function$;