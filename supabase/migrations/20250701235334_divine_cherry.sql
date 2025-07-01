/*
  # Download Tokens and Logs Schema

  1. New Tables
    - `download_tokens`
      - `id` (uuid, primary key)
      - `track_id` (uuid, foreign key to spoken_word_content)
      - `email` (text)
      - `expires_at` (timestamptz)
      - `download_count` (integer, default 0)
      - `max_downloads` (integer, default 3)
      - `is_active` (boolean, default true)
      - `created_at` (timestamptz)
      - `last_downloaded_at` (timestamptz)
    
    - `download_logs`
      - `id` (uuid, primary key)
      - `token_id` (uuid, foreign key to download_tokens)
      - `track_id` (uuid, foreign key to spoken_word_content)
      - `email` (text)
      - `ip_address` (text)
      - `user_agent` (text)
      - `downloaded_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Service role can manage all data
    - Users can read their own tokens and logs

  3. Functions
    - Cleanup expired tokens
    - Get download statistics
*/

-- Ensure required extensions are enabled
CREATE EXTENSION IF NOT EXISTS pg_net;

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

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Service role can manage download tokens" ON download_tokens;
DROP POLICY IF EXISTS "Users can read their own download tokens" ON download_tokens;
DROP POLICY IF EXISTS "Service role can manage download logs" ON download_logs;
DROP POLICY IF EXISTS "Users can read their own download logs" ON download_logs;

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
  USING (email = auth.email());

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
  USING (email = auth.email());

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

-- Function to validate download token
CREATE OR REPLACE FUNCTION validate_download_token(token_uuid uuid)
RETURNS TABLE(
  is_valid boolean,
  message text,
  downloads_remaining integer
) AS $$
DECLARE
  token_record download_tokens%ROWTYPE;
BEGIN
  -- Get token record
  SELECT * INTO token_record
  FROM download_tokens
  WHERE id = token_uuid;
  
  -- Check if token exists
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'Token not found', 0;
    RETURN;
  END IF;
  
  -- Check if token is active
  IF NOT token_record.is_active THEN
    RETURN QUERY SELECT false, 'Token is inactive', 0;
    RETURN;
  END IF;
  
  -- Check if token has expired
  IF token_record.expires_at < now() THEN
    RETURN QUERY SELECT false, 'Token has expired', 0;
    RETURN;
  END IF;
  
  -- Check if download limit reached
  IF token_record.download_count >= token_record.max_downloads THEN
    RETURN QUERY SELECT false, 'Download limit reached', 0;
    RETURN;
  END IF;
  
  -- Token is valid
  RETURN QUERY SELECT 
    true, 
    'Token is valid', 
    (token_record.max_downloads - token_record.download_count);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment download count
CREATE OR REPLACE FUNCTION increment_download_count(token_uuid uuid)
RETURNS boolean AS $$
DECLARE
  validation_result record;
BEGIN
  -- Validate token first
  SELECT * INTO validation_result
  FROM validate_download_token(token_uuid);
  
  IF NOT validation_result.is_valid THEN
    RETURN false;
  END IF;
  
  -- Increment download count and update last downloaded timestamp
  UPDATE download_tokens
  SET 
    download_count = download_count + 1,
    last_downloaded_at = now()
  WHERE id = token_uuid;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;