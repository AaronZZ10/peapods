-- Delete all current listings to re-seed fresh ones with images
DELETE FROM listings;

-- Seed listings with Unsplash images
INSERT INTO listings (
  user_id,
  title,
  description,
  price,
  location,
  address,
  start_date,
  end_date,
  images
)
SELECT
  seed.user_id,
  demo.title,
  demo.description,
  demo.price,
  ST_SetSRID(ST_MakePoint(demo.longitude, demo.latitude), 4326)::geography,
  demo.address,
  demo.start_date,
  demo.end_date,
  demo.images
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
      DATE '2026-09-15',
      ARRAY[
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80'
      ]
    ),
    (
      'Intern Summer Spot in University City',
      'Furnished studio with desk space, fast Wi-Fi, and easy trolley access for summer internships.',
      1350,
      '3601 Market St, Philadelphia, PA 19104',
      39.9587,
      -75.1948,
      DATE '2026-06-15',
      DATE '2026-08-31',
      ARRAY[
        'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80'
      ]
    ),
    (
      'Cozy Semester Sublease by Penn',
      'Quiet room in a student-friendly building close to cafes, groceries, and late-night study spaces.',
      1100,
      '3900 Walnut St, Philadelphia, PA 19104',
      39.9531,
      -75.2026,
      DATE '2026-08-01',
      DATE '2026-12-20',
      ARRAY[
        'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1527030280862-64139fbe04ca?auto=format&fit=crop&w=800&q=80'
      ]
    ),
    (
      'Modern Studio for Summer Interns',
      'Compact furnished studio with in-unit laundry, great for a short summer stay near transit.',
      1425,
      '3400 Lancaster Ave, Philadelphia, PA 19104',
      39.9616,
      -75.1932,
      DATE '2026-05-20',
      DATE '2026-08-20',
      ARRAY[
        'https://images.unsplash.com/photo-1502005229762-fc1b2b812ca5?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=800&q=80'
      ]
    ),
    (
      'Two-Bedroom Sublet Near Rittenhouse',
      'One room open in a clean two-bedroom apartment with central air and easy commute options.',
      1250,
      '2101 Chestnut St, Philadelphia, PA 19103',
      39.9518,
      -75.1764,
      DATE '2026-07-10',
      DATE '2026-11-30',
      ARRAY[
        'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&w=800&q=80'
      ]
    ),
    (
      'Budget-Friendly Room by 30th Street',
      'Affordable student room with desk, dresser, and quick access to Amtrak, SEPTA, and campus shuttles.',
      875,
      '3101 Market St, Philadelphia, PA 19104',
      39.9558,
      -75.1878,
      DATE '2026-06-01',
      DATE '2026-08-15',
      ARRAY[
        'https://images.unsplash.com/photo-1505693395321-883724634266?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1505692795793-20f545c30fc6?auto=format&fit=crop&w=800&q=80'
      ]
    )
) AS demo(
  title,
  description,
  price,
  address,
  latitude,
  longitude,
  start_date,
  end_date,
  images
)
WHERE EXISTS (
  SELECT 1
  FROM profiles
);
