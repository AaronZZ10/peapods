-- Create a SECURITY DEFINER function to allow the webhook endpoint to update reserved status securely
CREATE OR REPLACE FUNCTION mark_listing_as_reserved(target_listing_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER -- Bypasses RLS for this specific update statement
AS $$
BEGIN
  UPDATE listings
  SET reserved = true
  WHERE id = target_listing_id;
END;
$$;
