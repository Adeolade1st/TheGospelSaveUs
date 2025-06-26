/*
  # Create spoken word content table

  1. New Tables
    - `spoken_word_content`
      - `id` (uuid, primary key)
      - `title` (text)
      - `artist` (text)
      - `description` (text)
      - `audio_url` (text, pointing to Supabase Storage files)
      - `language` (text, e.g., 'yoruba', 'igbo', 'hausa', 'english')
      - `duration` (text, e.g., '15:32')
      - `scripture_ref` (text)
      - `theme` (text)
      - `thumbnail` (text, URL to an image)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `is_active` (boolean, for content management)

  2. Security
    - Enable RLS on `spoken_word_content` table
    - Add policy for public read access (content is public)
    - Add policy for authenticated users to manage content

  3. Sample Data
    - Insert sample tracks for each language
*/

CREATE TABLE IF NOT EXISTS spoken_word_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  artist text DEFAULT 'Evangelist Birdie Jones',
  description text,
  audio_url text NOT NULL,
  language text NOT NULL CHECK (language IN ('yoruba', 'igbo', 'hausa', 'english')),
  duration text DEFAULT '0:00',
  scripture_ref text,
  theme text,
  thumbnail text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  is_active boolean DEFAULT true
);

ALTER TABLE spoken_word_content ENABLE ROW LEVEL SECURITY;

-- Allow public read access to active content
CREATE POLICY "Public can read active spoken word content"
  ON spoken_word_content
  FOR SELECT
  TO public
  USING (is_active = true);

-- Allow authenticated users to manage content
CREATE POLICY "Authenticated users can manage spoken word content"
  ON spoken_word_content
  FOR ALL
  TO authenticated
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_spoken_word_content_language ON spoken_word_content(language);
CREATE INDEX IF NOT EXISTS idx_spoken_word_content_active ON spoken_word_content(is_active);
CREATE INDEX IF NOT EXISTS idx_spoken_word_content_created_at ON spoken_word_content(created_at DESC);

-- Insert sample data
INSERT INTO spoken_word_content (title, description, audio_url, language, duration, scripture_ref, theme, thumbnail) VALUES
-- Yoruba content
('The Gospel Saves Us', 'A powerful message about salvation and God''s transforming grace', 'https://tamgexlordzjyfzhvmel.supabase.co/storage/v1/object/public/audio-files/yoruba.mp3', 'yoruba', '15:32', 'Romans 1:16', 'salvation', 'https://images.pexels.com/photos/8088495/pexels-photo-8088495.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop'),
('Walking in Divine Purpose', 'Discover God''s unique plan for your life and step into your destiny', 'https://tamgexlordzjyfzhvmel.supabase.co/storage/v1/object/public/audio-files/yoruba.mp3', 'yoruba', '18:45', 'Jeremiah 29:11', 'purpose', 'https://images.pexels.com/photos/8088495/pexels-photo-8088495.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop'),
('Healing for the Broken Heart', 'God''s comfort and restoration for those experiencing pain and loss', 'https://tamgexlordzjyfzhvmel.supabase.co/storage/v1/object/public/audio-files/yoruba.mp3', 'yoruba', '22:15', 'Psalm 34:18', 'healing', 'https://images.pexels.com/photos/8088495/pexels-photo-8088495.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop'),

-- Igbo content
('Victory Over Fear', 'Breaking free from the chains of fear and anxiety through faith', 'https://tamgexlordzjyfzhvmel.supabase.co/storage/v1/object/public/audio-files/Ibo%20version%20of%20The%20Gospel-1.mp3', 'igbo', '16:20', '2 Timothy 1:7', 'victory', 'https://images.pexels.com/photos/8088501/pexels-photo-8088501.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop'),
('God''s Unfailing Love', 'Understanding the depth and breadth of God''s love for us', 'https://tamgexlordzjyfzhvmel.supabase.co/storage/v1/object/public/audio-files/Ibo%20version%20of%20The%20Gospel-1.mp3', 'igbo', '19:30', 'Romans 8:38-39', 'love', 'https://images.pexels.com/photos/8088501/pexels-photo-8088501.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop'),

-- Hausa content
('Faith That Moves Mountains', 'Building unshakeable faith that overcomes every obstacle', 'https://tamgexlordzjyfzhvmel.supabase.co/storage/v1/object/public/audio-files/Hausa%20version%20of%20The%20Gospel.mp3', 'hausa', '17:45', 'Matthew 17:20', 'faith', 'https://images.pexels.com/photos/8088489/pexels-photo-8088489.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop'),
('Hope in Dark Times', 'Finding light and hope when facing life''s greatest challenges', 'https://tamgexlordzjyfzhvmel.supabase.co/storage/v1/object/public/audio-files/Hausa%20version%20of%20The%20Gospel.mp3', 'hausa', '20:10', 'Romans 15:13', 'hope', 'https://images.pexels.com/photos/8088489/pexels-photo-8088489.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop'),

-- English content
('Transformed by Grace', 'The life-changing power of God''s grace in our daily lives', 'https://tamgexlordzjyfzhvmel.supabase.co/storage/v1/object/public/audio-files/English.mp3', 'english', '21:30', 'Ephesians 2:8-9', 'grace', 'https://images.pexels.com/photos/3808904/pexels-photo-3808904.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop'),
('Living with Purpose', 'Discovering and fulfilling God''s calling on your life', 'https://tamgexlordzjyfzhvmel.supabase.co/storage/v1/object/public/audio-files/English.mp3', 'english', '18:15', 'Ephesians 2:10', 'purpose', 'https://images.pexels.com/photos/3808904/pexels-photo-3808904.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop');