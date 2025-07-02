/*
  # Download System Tables

  1. New Tables
    - `download_tokens`
      - `id` (uuid, primary key)
      - `track_id` (uuid, references spoken_word_content)
      - `email` (text)
      - `expires_at` (timestamptz)
      - `download_count` (integer)
      - `max_downloads` (integer)
      - `is_active` (boolean)
      - `created_at` (timestamptz)
      - `last_downloaded_at` (timestamptz)
    
    - `download_logs`
      - `id` (uuid, primary key)
      - `token_id` (uuid, references download_tokens)
      - `track_id` (uuid, references spoken_word_content)
      - `email` (text)
      - `ip_address` (text)
      - `user_agent` (text)
      - `downloaded_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for secure access
*/

-- Create download_tokens table
CREATE TABLE IF NOT EXISTS download_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  track_id uuid REFERENCES spoken_word_content(id) ON DELETE CASCADE,
  email text NOT NULL,
  expires_at timestamptz NOT NULL,
  download_count integer DEFAULT 0,
  max_downloads integer DEFAULT 3,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  last_downloaded_at timestamptz
);

-- Create download_logs table
CREATE TABLE IF NOT EXISTS download_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token_id uuid REFERENCES download_tokens(id) ON DELETE CASCADE,
  track_id uuid REFERENCES spoken_word_content(id) ON DELETE CASCADE,
  email text NOT NULL,
  ip_address text,
  user_agent text,
  downloaded_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE download_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE download_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for download_tokens
CREATE POLICY "Service role can manage download tokens"
  ON download_tokens
  FOR ALL
  TO service_role
  USING (true);

CREATE POLICY "Users can read their own download tokens"
  ON download_tokens
  FOR SELECT
  TO authenticated
  USING (email = (jwt() ->> 'email'::text));

-- RLS Policies for download_logs
CREATE POLICY "Service role can manage download logs"
  ON download_logs
  FOR ALL
  TO service_role
  USING (true);

CREATE POLICY "Users can read their own download logs"
  ON download_logs
  FOR SELECT
  TO authenticated
  USING (email = (jwt() ->> 'email'::text));

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_download_tokens_track_id ON download_tokens(track_id);
CREATE INDEX IF NOT EXISTS idx_download_tokens_email ON download_tokens(email);
CREATE INDEX IF NOT EXISTS idx_download_tokens_expires_at ON download_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_download_tokens_active ON download_tokens(is_active);

CREATE INDEX IF NOT EXISTS idx_download_logs_token_id ON download_logs(token_id);
CREATE INDEX IF NOT EXISTS idx_download_logs_track_id ON download_logs(track_id);
CREATE INDEX IF NOT EXISTS idx_download_logs_email ON download_logs(email);
CREATE INDEX IF NOT EXISTS idx_download_logs_downloaded_at ON download_logs(downloaded_at DESC);

-- Function to cleanup expired tokens
CREATE OR REPLACE FUNCTION cleanup_expired_download_tokens()
RETURNS void AS $$
BEGIN
  UPDATE download_tokens 
  SET is_active = false 
  WHERE expires_at < now() AND is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get download statistics
CREATE OR REPLACE FUNCTION get_download_stats(track_uuid uuid)
RETURNS TABLE(
  total_downloads bigint,
  unique_users bigint,
  downloads_last_30_days bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(dl.id) as total_downloads,
    COUNT(DISTINCT dl.email) as unique_users,
    COUNT(CASE WHEN dl.downloaded_at > now() - interval '30 days' THEN 1 END) as downloads_last_30_days
  FROM download_logs dl
  WHERE dl.track_id = track_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;