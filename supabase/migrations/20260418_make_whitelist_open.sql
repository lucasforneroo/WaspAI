-- Update profiles table to allow everyone by default
ALTER TABLE profiles ALTER COLUMN is_allowed SET DEFAULT true;

-- Update the existing profiles to be allowed
UPDATE profiles SET is_allowed = true;

-- Update the handle_new_user function to always set is_allowed to true
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, is_allowed)
  VALUES (
    NEW.id, 
    NEW.email, 
    true
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
