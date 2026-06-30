-- Return listings with latitude/longitude extracted from PostGIS.
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

-- Seed a few starter listings using the first real profile if one exists.
INSERT INTO listings (
  user_id,
  title,
  description,
  price,
  location,
  address,
  start_date,
  end_date
)
SELECT
  seed.user_id,
  demo.title,
  demo.description,
  demo.price,
  ST_SetSRID(ST_MakePoint(demo.longitude, demo.latitude), 4326)::geography,
  demo.address,
  demo.start_date,
  demo.end_date
FROM (
  SELECT id AS user_id
  FROM profiles
  ORDER BY created_at
  LIMIT 1
) AS seed
CROSS JOIN (
  VALUES
    (
      'Sunny Room Near Drexel',
      'Private bedroom in a shared apartment with lots of natural light and a short walk to campus.',
      950,
      '3200 Powelton Ave, Philadelphia, PA 19104',
      39.9608,
      -75.1897,
      DATE '2026-07-01',
      DATE '2026-09-15'
    ),
    (
      'Intern Summer Spot in University City',
      'Furnished studio with desk space, fast Wi-Fi, and easy trolley access for summer internships.',
      1350,
      '3601 Market St, Philadelphia, PA 19104',
      39.9587,
      -75.1948,
      DATE '2026-06-15',
      DATE '2026-08-31'
    ),
    (
      'Cozy Semester Sublease by Penn',
      'Quiet room in a student-friendly building close to cafes, groceries, and late-night study spaces.',
      1100,
      '3900 Walnut St, Philadelphia, PA 19104',
      39.9531,
      -75.2026,
      DATE '2026-08-01',
      DATE '2026-12-20'
    )
) AS demo(
  title,
  description,
  price,
  address,
  latitude,
  longitude,
  start_date,
  end_date
)
WHERE EXISTS (
  SELECT 1
  FROM profiles
)
AND NOT EXISTS (
  SELECT 1
  FROM listings
);
