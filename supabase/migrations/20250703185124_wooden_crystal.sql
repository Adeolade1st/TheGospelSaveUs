/*
  # Create Spoken Word Content Table

  1. New Tables
    - `spoken_word_content` - Stores metadata for spoken word audio files
      - `id` (uuid, primary key)
      - `title` (text)
      - `artist` (text)
      - `description` (text)
      - `audio_url` (text) - Path to audio file in storage
      - `language` (text)
      - `duration` (text)
      - `scripture_ref` (text)
      - `theme` (text)
      - `thumbnail` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - `is_active` (boolean)

  2. Security
    - Enable RLS on the table
    - Add policies for public and authenticated users
    - Create indexes for performance
*/

-- Create spoken_word_content table if it doesn't exist
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
  is_active boolean DEFAULT true
);

-- Add constraint for language
ALTER TABLE spoken_word_content
  ADD CONSTRAINT spoken_word_content_language_check
  CHECK (language = ANY (ARRAY['yoruba', 'igbo', 'hausa', 'english']));

-- Enable RLS
ALTER TABLE spoken_word_content ENABLE ROW LEVEL SECURITY;

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
  ('a1b2c3d4-e5f6-7890-1234-567890abcdef', 'Eyin rere', 'Deaconess Janet Olaitan', 'Good Fruit in Yoruba', 'Yoruba version of The Gospel.mp3', 'yoruba', '3:45', 'John 15:5', 'faith'),
  ('b2c3d4e5-f6a7-8901-2345-67890abcdef0', 'Ozi oma', 'Minister Susan Collins', 'Good News in Igbo', 'Ibo version of The Gospel-1.mp3', 'igbo', '4:12', 'Romans 10:15', 'hope'),
  ('c3d4e5f6-a7b8-9012-3456-7890abcdef01', 'Labari mai dadi', 'Pastor Isaac O. Samuel', 'Sweet Story in Hausa', 'Hausa version of The Gospel.mp3', 'hausa', '3:58', 'Psalm 119:103', 'joy'),
  ('d4e5f6a7-b8c9-0123-4567-890abcdef012', 'Transformed by Grace', 'Evangelist Jones', 'The transforming power of God's grace', 'English.mp3', 'english', '4:33', '2 Corinthians 5:17', 'transformation')
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