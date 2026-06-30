-- Function to get listings within map bounds
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
    ST_Y(l.location::geometry) AS latitude,
    ST_X(l.location::geometry) AS longitude,
    l.start_date,
    l.end_date,
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
