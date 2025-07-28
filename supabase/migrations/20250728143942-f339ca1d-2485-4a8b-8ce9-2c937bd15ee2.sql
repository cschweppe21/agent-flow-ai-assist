-- Phase 1: Critical Database Security Fixes

-- Fix Security Definer Functions - Add SET search_path = '' to prevent search path attacks
CREATE OR REPLACE FUNCTION public.get_user_plan_limits(user_id uuid)
 RETURNS jsonb
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = ''
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

-- Update prevent_role_escalation_and_log function
CREATE OR REPLACE FUNCTION public.prevent_role_escalation_and_log()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
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

-- Update update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Update handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, email)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'display_name', NEW.email);
  RETURN NEW;
END;
$function$;

-- Update log_security_event function
CREATE OR REPLACE FUNCTION public.log_security_event(event_type text, event_data jsonb DEFAULT NULL::jsonb, target_user_id uuid DEFAULT NULL::uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  INSERT INTO public.security_logs (user_id, event_type, event_data)
  VALUES (COALESCE(target_user_id, auth.uid()), event_type, event_data);
END;
$function$;

-- Update update_vendors_updated_at function
CREATE OR REPLACE FUNCTION public.update_vendors_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Add missing triggers for updated_at columns that should use the secure function
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_tasks_updated_at ON public.tasks;
CREATE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON public.tasks
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_listings_updated_at ON public.listings;
CREATE TRIGGER update_listings_updated_at
    BEFORE UPDATE ON public.listings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_buyers_updated_at ON public.buyers;
CREATE TRIGGER update_buyers_updated_at
    BEFORE UPDATE ON public.buyers
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_commissions_updated_at ON public.commissions;
CREATE TRIGGER update_commissions_updated_at
    BEFORE UPDATE ON public.commissions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_client_ratings_updated_at ON public.client_ratings;
CREATE TRIGGER update_client_ratings_updated_at
    BEFORE UPDATE ON public.client_ratings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_buyer_showings_updated_at ON public.buyer_showings;
CREATE TRIGGER update_buyer_showings_updated_at
    BEFORE UPDATE ON public.buyer_showings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Add security trigger to profiles table if not exists
DROP TRIGGER IF EXISTS prevent_role_escalation ON public.profiles;
CREATE TRIGGER prevent_role_escalation
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.prevent_role_escalation_and_log();

-- Add trigger to auth.users table if not exists (this creates user profiles automatically)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();