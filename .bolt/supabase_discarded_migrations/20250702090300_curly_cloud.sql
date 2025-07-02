/*
  # Create Admin User Function

  1. Function
    - `create_admin_user` - Function to create an admin user with proper role assignment

  2. Security
    - Function is security definer to bypass RLS
    - Only callable by service role or existing admins
*/

-- Create function to create admin user
CREATE OR REPLACE FUNCTION create_admin_user(
  user_email text,
  user_password text,
  user_full_name text DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_user_id uuid;
  admin_role_id uuid;
  result json;
BEGIN
  -- Get admin role ID
  SELECT id INTO admin_role_id
  FROM user_roles
  WHERE name = 'admin' AND is_active = true
  LIMIT 1;

  IF admin_role_id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Admin role not found'
    );
  END IF;

  -- Create the user in auth.users (this requires service role privileges)
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    user_email,
    crypt(user_password, gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider": "email", "providers": ["email"]}',
    CASE 
      WHEN user_full_name IS NOT NULL THEN 
        json_build_object('full_name', user_full_name)
      ELSE 
        '{}'::json
    END,
    now(),
    now(),
    '',
    '',
    '',
    ''
  )
  RETURNING id INTO new_user_id;

  -- Assign admin role to the user
  INSERT INTO user_role_assignments (user_id, role_id, assigned_by, is_active)
  VALUES (new_user_id, admin_role_id, new_user_id, true)
  ON CONFLICT (user_id, role_id) DO UPDATE SET
    is_active = true,
    assigned_at = now();

  -- Return success result
  RETURN json_build_object(
    'success', true,
    'user_id', new_user_id,
    'email', user_email,
    'role', 'admin'
  );

EXCEPTION
  WHEN unique_violation THEN
    RETURN json_build_object(
      'success', false,
      'error', 'User with this email already exists'
    );
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- Grant execute permission to service role
GRANT EXECUTE ON FUNCTION create_admin_user(text, text, text) TO service_role;