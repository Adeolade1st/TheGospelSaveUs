/*
  # Create Role-Based Access Control (RBAC) System

  1. New Tables
    - `user_roles` - Define available roles (admin, moderator, user)
    - `user_permissions` - Define granular permissions
    - `role_permissions` - Junction table linking roles to permissions
    - `user_role_assignments` - Assign roles to users

  2. Security
    - Enable RLS on all RBAC tables
    - Create policies for role-based access control
    - Implement permission checking functions

  3. Default Data
    - Insert default roles (admin, moderator, user)
    - Insert default permissions
    - Assign permissions to roles
    - Create trigger for automatic user role assignment
*/

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Anyone can read active roles" ON user_roles;
DROP POLICY IF EXISTS "Only admins can manage roles" ON user_roles;
DROP POLICY IF EXISTS "Anyone can read permissions" ON user_permissions;
DROP POLICY IF EXISTS "Only admins can manage permissions" ON user_permissions;
DROP POLICY IF EXISTS "Anyone can read role permissions" ON role_permissions;
DROP POLICY IF EXISTS "Only admins can manage role permissions" ON role_permissions;
DROP POLICY IF EXISTS "Users can read their own role assignments" ON user_role_assignments;
DROP POLICY IF EXISTS "Admins can read all role assignments" ON user_role_assignments;
DROP POLICY IF EXISTS "Only admins can insert role assignments" ON user_role_assignments;
DROP POLICY IF EXISTS "Only admins can update role assignments" ON user_role_assignments;
DROP POLICY IF EXISTS "Only admins can delete role assignments" ON user_role_assignments;

-- Drop existing triggers and functions if they exist
DROP TRIGGER IF EXISTS assign_default_role_trigger ON auth.users;
DROP TRIGGER IF EXISTS update_user_roles_updated_at ON user_roles;
DROP FUNCTION IF EXISTS assign_default_user_role();
DROP FUNCTION IF EXISTS update_user_roles_updated_at();
DROP FUNCTION IF EXISTS get_user_permissions(uuid);
DROP FUNCTION IF EXISTS user_has_permission(uuid, text);

-- Create user_roles table
CREATE TABLE IF NOT EXISTS user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user_permissions table
CREATE TABLE IF NOT EXISTS user_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  resource text NOT NULL,
  action text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Create role_permissions junction table
CREATE TABLE IF NOT EXISTS role_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id uuid REFERENCES user_roles(id) ON DELETE CASCADE,
  permission_id uuid REFERENCES user_permissions(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(role_id, permission_id)
);

-- Create user_role_assignments table
CREATE TABLE IF NOT EXISTS user_role_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role_id uuid REFERENCES user_roles(id) ON DELETE CASCADE,
  assigned_by uuid,
  assigned_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  is_active boolean DEFAULT true,
  UNIQUE(user_id, role_id)
);

-- Enable RLS
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_role_assignments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_roles
CREATE POLICY "Anyone can read active roles"
  ON user_roles
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Only admins can manage roles"
  ON user_roles
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_role_assignments ura
      JOIN user_roles ur ON ura.role_id = ur.id
      WHERE ura.user_id = auth.uid()
      AND ur.name = 'admin'
      AND ura.is_active = true
    )
  );

-- RLS Policies for user_permissions
CREATE POLICY "Anyone can read permissions"
  ON user_permissions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can manage permissions"
  ON user_permissions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_role_assignments ura
      JOIN user_roles ur ON ura.role_id = ur.id
      WHERE ura.user_id = auth.uid()
      AND ur.name = 'admin'
      AND ura.is_active = true
    )
  );

-- RLS Policies for role_permissions
CREATE POLICY "Anyone can read role permissions"
  ON role_permissions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can manage role permissions"
  ON role_permissions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_role_assignments ura
      JOIN user_roles ur ON ura.role_id = ur.id
      WHERE ura.user_id = auth.uid()
      AND ur.name = 'admin'
      AND ura.is_active = true
    )
  );

-- RLS Policies for user_role_assignments
CREATE POLICY "Users can read their own role assignments"
  ON user_role_assignments
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can read all role assignments"
  ON user_role_assignments
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_role_assignments ura
      JOIN user_roles ur ON ura.role_id = ur.id
      WHERE ura.user_id = auth.uid()
      AND ur.name = 'admin'
      AND ura.is_active = true
    )
  );

-- Separate policies for INSERT, UPDATE, DELETE operations
CREATE POLICY "Only admins can insert role assignments"
  ON user_role_assignments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_role_assignments ura
      JOIN user_roles ur ON ura.role_id = ur.id
      WHERE ura.user_id = auth.uid()
      AND ur.name = 'admin'
      AND ura.is_active = true
    )
  );

CREATE POLICY "Only admins can update role assignments"
  ON user_role_assignments
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_role_assignments ura
      JOIN user_roles ur ON ura.role_id = ur.id
      WHERE ura.user_id = auth.uid()
      AND ur.name = 'admin'
      AND ura.is_active = true
    )
  );

CREATE POLICY "Only admins can delete role assignments"
  ON user_role_assignments
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_role_assignments ura
      JOIN user_roles ur ON ura.role_id = ur.id
      WHERE ura.user_id = auth.uid()
      AND ur.name = 'admin'
      AND ura.is_active = true
    )
  );

-- Insert default roles
INSERT INTO user_roles (name, description) VALUES
  ('admin', 'Full system administrator with all permissions'),
  ('moderator', 'Content moderator with limited administrative permissions'),
  ('user', 'Regular user with basic permissions')
ON CONFLICT (name) DO NOTHING;

-- Insert default permissions
INSERT INTO user_permissions (name, resource, action, description) VALUES
  ('admin:dashboard:read', 'admin_dashboard', 'read', 'Access admin dashboard'),
  ('admin:users:manage', 'users', 'manage', 'Manage user accounts'),
  ('admin:content:manage', 'content', 'manage', 'Manage content'),
  ('admin:analytics:read', 'analytics', 'read', 'View analytics data'),
  ('admin:system:manage', 'system', 'manage', 'Manage system settings'),
  ('user:profile:read', 'profile', 'read', 'Read own profile'),
  ('user:profile:update', 'profile', 'update', 'Update own profile'),
  ('user:content:read', 'content', 'read', 'View content'),
  ('moderator:content:moderate', 'content', 'moderate', 'Moderate content'),
  ('moderator:users:moderate', 'users', 'moderate', 'Moderate users')
ON CONFLICT (name) DO NOTHING;

-- Assign permissions to roles
DO $$
DECLARE
  admin_role_id uuid;
  moderator_role_id uuid;
  user_role_id uuid;
BEGIN
  -- Get role IDs
  SELECT id INTO admin_role_id FROM user_roles WHERE name = 'admin';
  SELECT id INTO moderator_role_id FROM user_roles WHERE name = 'moderator';
  SELECT id INTO user_role_id FROM user_roles WHERE name = 'user';

  -- Admin permissions (all permissions)
  INSERT INTO role_permissions (role_id, permission_id)
  SELECT admin_role_id, id FROM user_permissions
  ON CONFLICT (role_id, permission_id) DO NOTHING;

  -- Moderator permissions
  INSERT INTO role_permissions (role_id, permission_id)
  SELECT moderator_role_id, id FROM user_permissions 
  WHERE name IN (
    'moderator:content:moderate',
    'moderator:users:moderate',
    'user:profile:read',
    'user:profile:update',
    'user:content:read'
  )
  ON CONFLICT (role_id, permission_id) DO NOTHING;

  -- User permissions
  INSERT INTO role_permissions (role_id, permission_id)
  SELECT user_role_id, id FROM user_permissions 
  WHERE name IN (
    'user:profile:read',
    'user:profile:update',
    'user:content:read'
  )
  ON CONFLICT (role_id, permission_id) DO NOTHING;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_role_assignments_user_id ON user_role_assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_user_role_assignments_role_id ON user_role_assignments(role_id);
CREATE INDEX IF NOT EXISTS idx_user_role_assignments_active ON user_role_assignments(is_active);
CREATE INDEX IF NOT EXISTS idx_role_permissions_role_id ON role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_permission_id ON role_permissions(permission_id);

-- Function to get user permissions
CREATE OR REPLACE FUNCTION get_user_permissions(user_uuid uuid)
RETURNS TABLE(permission_name text) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT up.name
  FROM user_permissions up
  JOIN role_permissions rp ON up.id = rp.permission_id
  JOIN user_role_assignments ura ON rp.role_id = ura.role_id
  WHERE ura.user_id = user_uuid
    AND ura.is_active = true
    AND (ura.expires_at IS NULL OR ura.expires_at > now());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has permission
CREATE OR REPLACE FUNCTION user_has_permission(user_uuid uuid, permission_name text)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM get_user_permissions(user_uuid) WHERE permission_name = $2
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to assign default user role to new users
CREATE OR REPLACE FUNCTION assign_default_user_role()
RETURNS TRIGGER AS $$
DECLARE
  user_role_id uuid;
BEGIN
  -- Get the 'user' role ID
  SELECT id INTO user_role_id FROM user_roles WHERE name = 'user';
  
  -- Assign the user role to the new user
  INSERT INTO user_role_assignments (user_id, role_id, assigned_by)
  VALUES (NEW.id, user_role_id, NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to assign default role to new users
CREATE TRIGGER assign_default_role_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION assign_default_user_role();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_roles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_user_roles_updated_at
  BEFORE UPDATE ON user_roles
  FOR EACH ROW
  EXECUTE FUNCTION update_user_roles_updated_at();