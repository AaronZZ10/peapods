-- Update public.handle_new_user trigger function to populate avatar_url from Google OAuth metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url)
    VALUES (
      new.id,
      new.email,
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'avatar_url'
    )
    ON CONFLICT (id) DO UPDATE SET
      avatar_url = COALESCE(profiles.avatar_url, EXCLUDED.avatar_url),
      full_name = COALESCE(profiles.full_name, EXCLUDED.full_name);
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
