-- Add is_admin boolean column to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT false;

-- Grant administrator rights to the specified emails
UPDATE profiles SET is_admin = true WHERE email IN ('aaronzz10101@gmail.com', 'aaronzz10@tamu.edu');
