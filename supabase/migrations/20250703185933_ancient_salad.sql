-- Function to validate a download token
CREATE OR REPLACE FUNCTION validate_download_token(token_uuid uuid)
RETURNS TABLE(
  is_valid boolean,
  message text,
  downloads_remaining integer
) AS $$
DECLARE
  token_record record;
BEGIN
  -- Get the token record
  SELECT * INTO token_record
  FROM download_tokens
  WHERE id = token_uuid;
  
  -- Check if token exists
  IF token_record IS NULL THEN
    RETURN QUERY SELECT 
      false AS is_valid,
      'Invalid download token' AS message,
      0 AS downloads_remaining;
    RETURN;
  END IF;
  
  -- Check if token is active
  IF NOT token_record.is_active THEN
    RETURN QUERY SELECT 
      false AS is_valid,
      'Download token is inactive' AS message,
      0 AS downloads_remaining;
    RETURN;
  END IF;
  
  -- Check if token has expired
  IF token_record.expires_at < now() THEN
    RETURN QUERY SELECT 
      false AS is_valid,
      'Download token has expired' AS message,
      0 AS downloads_remaining;
    RETURN;
  END IF;
  
  -- Check if download limit reached
  IF token_record.download_count >= token_record.max_downloads THEN
    RETURN QUERY SELECT 
      false AS is_valid,
      'Download limit reached' AS message,
      0 AS downloads_remaining;
    RETURN;
  END IF;
  
  -- Token is valid
  RETURN QUERY SELECT 
    true AS is_valid,
    'Token is valid' AS message,
    (token_record.max_downloads - token_record.download_count) AS downloads_remaining;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment download count
CREATE OR REPLACE FUNCTION increment_download_count(token_uuid uuid)
RETURNS boolean AS $$
DECLARE
  success boolean := false;
BEGIN
  -- Update the download count and last downloaded timestamp
  UPDATE download_tokens
  SET 
    download_count = download_count + 1,
    last_downloaded_at = now()
  WHERE id = token_uuid
    AND is_active = true
    AND expires_at > now()
    AND download_count < max_downloads;
  
  -- Check if update was successful
  GET DIAGNOSTICS success = ROW_COUNT;
  
  RETURN success;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get download token by session ID
CREATE OR REPLACE FUNCTION get_download_token_by_session(session_id text)
RETURNS TABLE(
  token_id uuid,
  track_id uuid,
  email text,
  expires_at timestamptz,
  download_count integer,
  max_downloads integer,
  is_active boolean
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    dt.id,
    dt.track_id,
    dt.email,
    dt.expires_at,
    dt.download_count,
    dt.max_downloads,
    dt.is_active
  FROM download_tokens dt
  WHERE dt.stripe_session_id = session_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION validate_download_token(uuid) TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION increment_download_count(uuid) TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION get_download_token_by_session(text) TO authenticated, anon, service_role;