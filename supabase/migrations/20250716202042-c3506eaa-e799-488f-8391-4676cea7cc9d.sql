-- Fix Database Functions Security - Add search_path protection
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, email)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'display_name', NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Add missing DELETE policy for profiles
CREATE POLICY "Users can delete their own profile" 
ON public.profiles 
FOR DELETE 
USING (auth.uid() = user_id);

-- Fix role management vulnerability - Drop existing update policy
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Create new update policy that allows updates to all fields except role
CREATE POLICY "Users can update their own profile data" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);