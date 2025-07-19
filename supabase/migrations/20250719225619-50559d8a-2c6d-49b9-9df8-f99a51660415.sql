-- Security Enhancement: Prevent role escalation and improve policies

-- Drop existing profile update policy that allows role changes
DROP POLICY IF EXISTS "Users can update their own profile data" ON public.profiles;

-- Create new update policy that prevents role changes
CREATE POLICY "Users can update their own profile (except role and subscription)" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id 
  AND OLD.role = NEW.role 
  AND OLD.subscription_tier = NEW.subscription_tier
  AND OLD.subscription_active = NEW.subscription_active
  AND OLD.subscription_end_date = NEW.subscription_end_date
);

-- Create security logging table for audit trails
CREATE TABLE public.security_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  event_data JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for security logs
ALTER TABLE public.security_logs ENABLE ROW LEVEL SECURITY;

-- Only allow viewing own security logs
CREATE POLICY "Users can view their own security logs" 
ON public.security_logs 
FOR SELECT 
USING (auth.uid() = user_id);

-- System can insert security logs
CREATE POLICY "System can insert security logs" 
ON public.security_logs 
FOR INSERT 
WITH CHECK (true);

-- Create function to log security events
CREATE OR REPLACE FUNCTION public.log_security_event(
  event_type TEXT,
  event_data JSONB DEFAULT NULL,
  target_user_id UUID DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.security_logs (user_id, event_type, event_data)
  VALUES (COALESCE(target_user_id, auth.uid()), event_type, event_data);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Add trigger to log profile changes
CREATE OR REPLACE FUNCTION public.log_profile_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- Log role changes (should be prevented by RLS but log attempts)
  IF OLD.role IS DISTINCT FROM NEW.role THEN
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
  END IF;
  
  -- Log subscription changes
  IF OLD.subscription_tier IS DISTINCT FROM NEW.subscription_tier 
     OR OLD.subscription_active IS DISTINCT FROM NEW.subscription_active THEN
    INSERT INTO public.security_logs (user_id, event_type, event_data)
    VALUES (
      NEW.user_id,
      'subscription_change',
      jsonb_build_object(
        'old_tier', OLD.subscription_tier,
        'new_tier', NEW.subscription_tier,
        'old_active', OLD.subscription_active,
        'new_active', NEW.subscription_active,
        'profile_id', NEW.id
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

CREATE TRIGGER log_profile_changes_trigger
  AFTER UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.log_profile_changes();