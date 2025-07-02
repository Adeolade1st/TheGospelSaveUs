/*
  # Create Helper Functions for User Role Management

  1. Functions
    - `get_user_role` - Get user's primary role
    - `get_user_permissions` - Get all permissions for a user
    - `has_permission` - Check if user has specific permission
    - `is_admin` - Check if user is admin

  2. Security
    - Functions are security definer to access role data
    - Proper permission checks included
*/

-- Function to get user's primary role
CREATE OR REPLACE FUNCTION get_user_role(user_uuid uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_role text;
BEGIN
  SELECT ur.name INTO user_role
  FROM user_role_assignments ura
  JOIN user_roles ur ON ura.role_id = ur.id
  WHERE ura.user_id = user_uuid
    AND ura.is_active = true
    AND ur.is_active = true
  ORDER BY 
    CASE ur.name 
      WHEN 'admin' THEN 1
      WHEN 'moderator' THEN 2
      WHEN 'user' THEN 3
      ELSE 4
    END
  LIMIT 1;

  RETURN COALESCE(user_role, 'user');
END;
$$;

-- Function to get all user permissions
CREATE OR REPLACE FUNCTION get_user_permissions(user_uuid uuid)
RETURNS text[]
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  permissions text[];
BEGIN
  SELECT array_agg(DISTINCT up.name) INTO permissions
  FROM user_role_assignments ura
  JOIN user_roles ur ON ura.role_id = ur.id
  JOIN role_permissions rp ON ur.id = rp.role_id
  JOIN user_permissions up ON rp.permission_id = up.id
  WHERE ura.user_id = user_uuid
    AND ura.is_active = true
    AND ur.is_active = true;

  RETURN COALESCE(permissions, ARRAY[]::text[]);
END;
$$;

-- Function to check if user has specific permission
CREATE OR REPLACE FUNCTION has_permission(user_uuid uuid, permission_name text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  has_perm boolean := false;
BEGIN
  SELECT EXISTS(
    SELECT 1
    FROM user_role_assignments ura
    JOIN user_roles ur ON ura.role_id = ur.id
    JOIN role_permissions rp ON ur.id = rp.role_id
    JOIN user_permissions up ON rp.permission_id = up.id
    WHERE ura.user_id = user_uuid
      AND ura.is_active = true
      AND ur.is_active = true
      AND up.name = permission_name
  ) INTO has_perm;

  RETURN has_perm;
END;
$$;

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN get_user_role(user_uuid) = 'admin';
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_user_role(uuid) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_user_permissions(uuid) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION has_permission(uuid, text) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION is_admin(uuid) TO authenticated, anon;