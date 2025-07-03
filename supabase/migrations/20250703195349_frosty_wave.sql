/*
  # Create spoken_word_content table

  1. New Tables
    - `spoken_word_content` - Stores audio content metadata
      - `id` (uuid, primary key)
      - `title` (text, not null)
      - `artist` (text, default 'Evangelist Jones')
      - `description` (text)
      - `audio_url` (text, not null) - Path to audio file in storage
      - `language` (text, not null) - Limited to yoruba, igbo, hausa, english
      - `duration` (text, default '0:00')
      - `scripture_ref` (text)
      - `theme` (text)
      - `thumbnail` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - `is_active` (boolean, default true)

  2. Security
    - Enable RLS on the table
    - Add policy for public to read active content
    - Add policy for authenticated users to manage content

  3. Indexes
    - Index on language for filtering
    - Index on created_at for sorting
    - Index on is_active for filtering
*/

CREATE TABLE IF NOT EXISTS spoken_word_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  artist text DEFAULT 'Evangelist Jones',
  description text,
  audio_url text NOT NULL,
  language text NOT NULL,
  duration text DEFAULT '0:00',
  scripture_ref text,
  theme text,
  thumbnail text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  is_active boolean DEFAULT true,
  CONSTRAINT spoken_word_content_language_check CHECK (language = ANY (ARRAY['yoruba', 'igbo', 'hausa', 'english']))
);

-- Enable RLS
ALTER TABLE spoken_word_content ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Public can read active spoken word content" ON spoken_word_content;
DROP POLICY IF EXISTS "Authenticated users can manage spoken word content" ON spoken_word_content;

-- RLS Policies
CREATE POLICY "Public can read active spoken word content"
  ON spoken_word_content
  FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Authenticated users can manage spoken word content"
  ON spoken_word_content
  FOR ALL
  TO authenticated
  USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_spoken_word_content_language ON spoken_word_content(language);
CREATE INDEX IF NOT EXISTS idx_spoken_word_content_created_at ON spoken_word_content(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_spoken_word_content_active ON spoken_word_content(is_active);

-- Insert sample content
INSERT INTO spoken_word_content (id, title, artist, description, audio_url, language, duration, scripture_ref, theme)
VALUES 
  ('a1b2c3d4-e5f6-7890-1234-567890abcdef', 'Eyin rere', 'Deaconess Janet Olaitan', 'Good fruit in Yoruba language', 'Yoruba version of The Gospel.mp3', 'yoruba', '3:45', 'John 15:5', 'salvation'),
  ('b2c3d4e5-f6a7-8901-2345-67890abcdef0', 'Ozi oma', 'Minister Susan Collins', 'Good news in Igbo language', 'Ibo version of The Gospel-1.mp3', 'igbo', '4:12', 'Romans 1:16', 'salvation'),
  ('c3d4e5f6-a7b8-9012-3456-7890abcdef01', 'Labari mai dadi', 'Pastor Isaac O. Samuel', 'Sweet story in Hausa language', 'Hausa version of The Gospel.mp3', 'hausa', '3:58', 'Acts 4:12', 'salvation'),
  ('d4e5f6a7-b8c9-0123-4567-890abcdef012', 'Transformed by Grace', 'Evangelist Jones', 'The gospel message in English', 'English.mp3', 'english', '4:33', 'Ephesians 2:8-9', 'salvation')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  artist = EXCLUDED.artist,
  description = EXCLUDED.description,
  audio_url = EXCLUDED.audio_url,
  language = EXCLUDED.language,
  duration = EXCLUDED.duration,
  scripture_ref = EXCLUDED.scripture_ref,
  theme = EXCLUDED.theme,
  updated_at = now();

-- Add download token stripe_session_id column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'download_tokens' AND column_name = 'stripe_session_id'
  ) THEN
    ALTER TABLE download_tokens ADD COLUMN stripe_session_id text UNIQUE;
  END IF;
END $$;