-- Drop existing listing read functions to update their return signatures
DROP FUNCTION IF EXISTS get_all_listings();
DROP FUNCTION IF EXISTS get_listings_in_bounds(numeric, numeric, numeric, numeric);

-- 1. Redefine get_all_listings to include images
CREATE OR REPLACE FUNCTION get_all_listings()
RETURNS TABLE (
  id UUID,
  user_id UUID,
  title TEXT,
  description TEXT,
  price NUMERIC,
  address TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  start_date DATE,
  end_date DATE,
  images TEXT[],
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  profiles JSONB
)
LANGUAGE sql
AS $$
  SELECT
    l.id,
    l.user_id,
    l.title,
    l.description,
    l.price,
    l.address,
    ST_Y(l.location::geometry)::numeric AS latitude,
    ST_X(l.location::geometry)::numeric AS longitude,
    l.start_date,
    l.end_date,
    l.images,
    l.created_at,
    l.updated_at,
    jsonb_build_object(
      'full_name', p.full_name,
      'email', p.email
    ) AS profiles
  FROM listings l
  LEFT JOIN profiles p ON p.id = l.user_id
  ORDER BY l.created_at DESC;
$$;

-- 2. Redefine get_listings_in_bounds to include images
CREATE OR REPLACE FUNCTION get_listings_in_bounds(
  min_lat NUMERIC,
  max_lat NUMERIC,
  min_lng NUMERIC,
  max_lng NUMERIC
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  title TEXT,
  description TEXT,
  price NUMERIC,
  address TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  start_date DATE,
  end_date DATE,
  images TEXT[],
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  profiles JSONB
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    l.id,
    l.user_id,
    l.title,
    l.description,
    l.price,
    l.address,
    ST_Y(l.location::geometry)::numeric AS latitude,
    ST_X(l.location::geometry)::numeric AS longitude,
    l.start_date,
    l.end_date,
    l.images,
    l.created_at,
    l.updated_at,
    jsonb_build_object(
      'full_name', p.full_name,
      'email', p.email
    ) AS profiles
  FROM listings l
  JOIN profiles p ON l.user_id = p.id
  WHERE
    ST_Intersects(
      l.location,
      ST_MakeEnvelope(min_lng, min_lat, max_lng, max_lat, 4326)::geography
    );
END;
$$;

-- 3. Create a helper function to retrieve a single listing by its ID
CREATE OR REPLACE FUNCTION get_listing_by_id(listing_id UUID)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  title TEXT,
  description TEXT,
  price NUMERIC,
  address TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  start_date DATE,
  end_date DATE,
  images TEXT[],
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  profiles JSONB
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    l.id,
    l.user_id,
    l.title,
    l.description,
    l.price,
    l.address,
    ST_Y(l.location::geometry)::numeric AS latitude,
    ST_X(l.location::geometry)::numeric AS longitude,
    l.start_date,
    l.end_date,
    l.images,
    l.created_at,
    l.updated_at,
    jsonb_build_object(
      'full_name', p.full_name,
      'email', p.email
    ) AS profiles
  FROM listings l
  LEFT JOIN profiles p ON p.id = l.user_id
  WHERE l.id = listing_id;
END;
$$;

-- 4. Set up Supabase Storage bucket for listing-images
INSERT INTO storage.buckets (id, name, public)
VALUES ('listing-images', 'listing-images', true)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for storage bucket 'listing-images'
-- Note: Enable row level security on storage.objects is managed by Supabase, we write policies
CREATE POLICY "Public Read Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'listing-images');

CREATE POLICY "Auth Insert Access"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'listing-images' AND auth.uid() = owner);

CREATE POLICY "Auth Update Access"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'listing-images' AND auth.uid() = owner)
WITH CHECK (bucket_id = 'listing-images' AND auth.uid() = owner);

CREATE POLICY "Auth Delete Access"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'listing-images' AND auth.uid() = owner);
