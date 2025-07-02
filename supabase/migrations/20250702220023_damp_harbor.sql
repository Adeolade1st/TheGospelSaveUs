/*
  # Add Download Token Functions

  1. New Functions
    - `validate_download_token` - Validates if a download token is valid and can be used
    - `increment_download_count` - Increments the download count for a token

  2. Security
    - Functions are security definer to bypass RLS
    - Proper validation of token status
*/

-- Function to validate a download token
CREATE OR REPLACE FUNCTION validate_download_token(token_uuid uuid)
RETURNS TABLE(
  is_valid boolean,
  message text,
  downloads_remaining int
) AS $$
DECLARE
  token_record download_tokens;
  remaining int;
BEGIN
  -- Get the token record
  SELECT * INTO token_record
  FROM download_tokens
  WHERE id = token_uuid;
  
  -- Check if token exists
  IF token_record IS NULL THEN
    RETURN QUERY SELECT 
      false AS is_valid,
      'Download token not found' AS message,
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
  remaining := token_record.max_downloads - token_record.download_count;
  IF remaining <= 0 THEN
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
    remaining AS downloads_remaining;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment download count
CREATE OR REPLACE FUNCTION increment_download_count(token_uuid uuid)
RETURNS boolean AS $$
DECLARE
  success boolean;
BEGIN
  UPDATE download_tokens
  SET 
    download_count = download_count + 1,
    last_downloaded_at = now()
  WHERE id = token_uuid
  RETURNING true INTO success;
  
  RETURN COALESCE(success, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;