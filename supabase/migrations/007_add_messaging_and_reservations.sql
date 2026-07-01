-- 1. Add reserved column to listings table
ALTER TABLE listings ADD COLUMN IF NOT EXISTS reserved BOOLEAN NOT NULL DEFAULT false;

-- Drop existing functions to update their return schemas
DROP FUNCTION IF EXISTS get_all_listings();
DROP FUNCTION IF EXISTS get_listings_in_bounds(numeric, numeric, numeric, numeric);
DROP FUNCTION IF EXISTS get_listing_by_id(uuid);

-- 2. Redefine get_all_listings to include reserved column
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

-- 3. Redefine get_listings_in_bounds to include reserved column
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

-- 4. Redefine get_listing_by_id to include reserved column
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

-- 5. Create messages table for in-app chat
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID REFERENCES listings(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    receiver_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on messages
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view messages they sent or received
CREATE POLICY "Users can read own messages"
ON messages FOR SELECT
TO authenticated
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- RLS Policy: Users can insert messages where they are the sender
CREATE POLICY "Users can send own messages"
ON messages FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = sender_id);
