-- Create download_tokens table
CREATE TABLE IF NOT EXISTS download_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_session_id text UNIQUE NOT NULL,
  track_id text NOT NULL,
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
  track_id text NOT NULL,
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
CREATE INDEX IF NOT EXISTS idx_download_tokens_session_id ON download_tokens(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_download_tokens_email ON download_tokens(email);
CREATE INDEX IF NOT EXISTS idx_download_tokens_expires_at ON download_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_download_tokens_active ON download_tokens(is_active);

CREATE INDEX IF NOT EXISTS idx_download_logs_token_id ON download_logs(token_id);
CREATE INDEX IF NOT EXISTS idx_download_logs_email ON download_logs(email);
CREATE INDEX IF NOT EXISTS idx_download_logs_downloaded_at ON download_logs(downloaded_at DESC);

-- Function to increment download count
CREATE OR REPLACE FUNCTION increment_download_count(token_uuid uuid)
RETURNS boolean AS $$
DECLARE
  token_record download_tokens%ROWTYPE;
  success boolean := false;
BEGIN
  -- Get the token record with FOR UPDATE to lock it
  SELECT * INTO token_record FROM download_tokens 
  WHERE id = token_uuid AND is_active = true
  FOR UPDATE;
  
  -- Check if token exists and is valid
  IF FOUND AND token_record.is_active = true AND 
     token_record.expires_at > now() AND 
     (token_record.download_count < token_record.max_downloads) THEN
    
    -- Increment download count and update last_downloaded_at
    UPDATE download_tokens 
    SET 
      download_count = download_count + 1,
      last_downloaded_at = now()
    WHERE id = token_uuid;
    
    success := true;
  END IF;
  
  RETURN success;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to validate download token
CREATE OR REPLACE FUNCTION validate_download_token(token_uuid uuid)
RETURNS TABLE(
  is_valid boolean,
  message text,
  track_id text,
  downloads_remaining integer
) AS $$
DECLARE
  token_record download_tokens%ROWTYPE;
BEGIN
  -- Get the token record
  SELECT * INTO token_record FROM download_tokens 
  WHERE id = token_uuid;
  
  -- Check if token exists
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'Invalid download token', NULL::text, 0;
    RETURN;
  END IF;
  
  -- Check if token is active
  IF NOT token_record.is_active THEN
    RETURN QUERY SELECT false, 'Download token is inactive', token_record.track_id, 0;
    RETURN;
  END IF;
  
  -- Check if token has expired
  IF token_record.expires_at < now() THEN
    RETURN QUERY SELECT false, 'Download token has expired', token_record.track_id, 0;
    RETURN;
  END IF;
  
  -- Check if download limit reached
  IF token_record.download_count >= token_record.max_downloads THEN
    RETURN QUERY SELECT false, 'Download limit reached', token_record.track_id, 0;
    RETURN;
  END IF;
  
  -- Token is valid
  RETURN QUERY SELECT 
    true, 
    'Token is valid', 
    token_record.track_id, 
    (token_record.max_downloads - token_record.download_count);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to cleanup expired tokens
CREATE OR REPLACE FUNCTION cleanup_expired_download_tokens()
RETURNS void AS $$
BEGIN
  UPDATE download_tokens 
  SET is_active = false 
  WHERE expires_at < now() AND is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;