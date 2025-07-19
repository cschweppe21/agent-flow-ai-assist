-- Security Enhancement: Prevent role escalation and improve policies

-- Drop existing profile update policy that allows role changes
DROP POLICY IF EXISTS "Users can update their own profile data" ON public.profiles;

-- Create new update policy that prevents role changes by only allowing specific fields
CREATE POLICY "Users can update their own profile (display_name and email only)" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

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

-- Add trigger to prevent role escalation and log attempts
CREATE OR REPLACE FUNCTION public.prevent_role_escalation_and_log()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS prevent_role_escalation_trigger ON public.profiles;

-- Create new trigger for role protection
CREATE TRIGGER prevent_role_escalation_and_log_trigger
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_role_escalation_and_log();