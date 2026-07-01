-- Create is_admin checking helper function (SECURITY DEFINER to bypass recursion)
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = user_id AND is_admin = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant SELECT profile access to admins
CREATE POLICY "Admins can view all profiles"
ON profiles FOR SELECT
TO authenticated
USING (
  public.is_admin(auth.uid())
);

-- Grant UPDATE profile access to admins (for role management)
CREATE POLICY "Admins can update any profile"
ON profiles FOR UPDATE
TO authenticated
USING (
  public.is_admin(auth.uid())
)
WITH CHECK (
  public.is_admin(auth.uid())
);

-- Grant DELETE listings access to admins (for moderation)
CREATE POLICY "Admins can delete any listing"
ON listings FOR DELETE
TO authenticated
USING (
  public.is_admin(auth.uid())
);
