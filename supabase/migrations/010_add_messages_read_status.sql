-- Add read boolean column to messages for unread status indicators
ALTER TABLE messages ADD COLUMN IF NOT EXISTS read BOOLEAN NOT NULL DEFAULT false;
