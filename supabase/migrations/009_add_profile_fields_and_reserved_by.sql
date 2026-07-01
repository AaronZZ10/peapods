-- 1. Add university, avatar_url, and bio to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS university TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio TEXT;

-- 2. Add reserved_by to listings table
ALTER TABLE listings ADD COLUMN IF NOT EXISTS reserved_by UUID REFERENCES profiles(id) ON DELETE SET NULL;

-- 3. Drop existing helper functions to redefine them with the new schema
DROP FUNCTION IF EXISTS get_all_listings();
DROP FUNCTION IF EXISTS get_listings_in_bounds(numeric, numeric, numeric, numeric);
DROP FUNCTION IF EXISTS get_listing_by_id(uuid);

-- 4. Redefine get_all_listings
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
  reserved BOOLEAN,
  reserved_by UUID,
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
    l.reserved,
    l.reserved_by,
    l.created_at,
    l.updated_at,
    jsonb_build_object(
      'full_name', p.full_name,
      'email', p.email,
      'university', p.university,
      'avatar_url', p.avatar_url,
      'bio', p.bio
    ) AS profiles
  FROM listings l
  LEFT JOIN profiles p ON p.id = l.user_id
  ORDER BY l.created_at DESC;
$$;

-- 5. Redefine get_listings_in_bounds
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
  reserved BOOLEAN,
  reserved_by UUID,
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
    l.reserved,
    l.reserved_by,
    l.created_at,
    l.updated_at,
    jsonb_build_object(
      'full_name', p.full_name,
      'email', p.email,
      'university', p.university,
      'avatar_url', p.avatar_url,
      'bio', p.bio
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

-- 6. Redefine get_listing_by_id
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
  reserved BOOLEAN,
  reserved_by UUID,
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
    l.reserved,
    l.reserved_by,
    l.created_at,
    l.updated_at,
    jsonb_build_object(
      'full_name', p.full_name,
      'email', p.email,
      'university', p.university,
      'avatar_url', p.avatar_url,
      'bio', p.bio
    ) AS profiles
  FROM listings l
  LEFT JOIN profiles p ON p.id = l.user_id
  WHERE l.id = listing_id;
END;
$$;

-- 7. Update mark_listing_as_reserved RPC to accept reserver_id and set reserved_by
CREATE OR REPLACE FUNCTION mark_listing_as_reserved(target_listing_id UUID, reserver_id UUID DEFAULT NULL)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE listings
  SET reserved = true,
      reserved_by = COALESCE(reserver_id, reserved_by)
  WHERE id = target_listing_id;
END;
$$;
