/*
  # Create User Roles and Permissions System

  1. New Tables
    - `user_roles` - Define available roles (admin, user, moderator)
    - `user_permissions` - Define granular permissions
    - `role_permissions` - Junction table linking roles to permissions
    - `user_role_assignments` - Assign roles to users

  2. Security
    - Enable RLS on all tables
    - Add policies for role-based access control
    - Create function to assign default user role

  3. Initial Data
    - Create default roles (admin, user, moderator)
    - Create default permissions
    - Assign permissions to roles
*/

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

-- Enable RLS on all tables
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_role_assignments ENABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_role_assignments_user_id ON user_role_assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_user_role_assignments_role_id ON user_role_assignments(role_id);
CREATE INDEX IF NOT EXISTS idx_user_role_assignments_active ON user_role_assignments(is_active);
CREATE INDEX IF NOT EXISTS idx_role_permissions_role_id ON role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_permission_id ON role_permissions(permission_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_roles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_user_roles_updated_at
  BEFORE UPDATE ON user_roles
  FOR EACH ROW
  EXECUTE FUNCTION update_user_roles_updated_at();

-- Insert default roles
INSERT INTO user_roles (name, description) VALUES
  ('admin', 'Full system administrator with all permissions'),
  ('user', 'Regular user with basic permissions'),
  ('moderator', 'Content moderator with limited admin permissions')
ON CONFLICT (name) DO NOTHING;

-- Insert default permissions
INSERT INTO user_permissions (name, resource, action, description) VALUES
  ('admin:dashboard:read', 'dashboard', 'read', 'Access admin dashboard'),
  ('admin:users:manage', 'users', 'manage', 'Full user account management'),
  ('admin:content:manage', 'content', 'manage', 'Content creation, editing, deletion'),
  ('admin:analytics:read', 'analytics', 'read', 'View all analytics and reports'),
  ('admin:system:manage', 'system', 'manage', 'System configuration and settings'),
  ('user:profile:read', 'profile', 'read', 'Read own user profile'),
  ('user:profile:update', 'profile', 'update', 'Update own user profile'),
  ('user:content:read', 'content', 'read', 'View content'),
  ('moderator:content:moderate', 'content', 'moderate', 'Content moderation capabilities'),
  ('moderator:users:moderate', 'users', 'moderate', 'User moderation capabilities')
ON CONFLICT (name) DO NOTHING;

-- Assign permissions to roles
WITH role_permission_mapping AS (
  SELECT 
    ur.id as role_id,
    up.id as permission_id
  FROM user_roles ur
  CROSS JOIN user_permissions up
  WHERE 
    (ur.name = 'admin') OR
    (ur.name = 'user' AND up.name IN ('user:profile:read', 'user:profile:update', 'user:content:read')) OR
    (ur.name = 'moderator' AND up.name IN ('user:profile:read', 'user:profile:update', 'user:content:read', 'moderator:content:moderate', 'moderator:users:moderate'))
)
INSERT INTO role_permissions (role_id, permission_id)
SELECT role_id, permission_id FROM role_permission_mapping
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Create function to assign default user role
CREATE OR REPLACE FUNCTION assign_default_user_role()
RETURNS TRIGGER AS $$
DECLARE
  default_role_id uuid;
BEGIN
  -- Get the 'user' role ID
  SELECT id INTO default_role_id
  FROM user_roles
  WHERE name = 'user' AND is_active = true
  LIMIT 1;

  -- Assign the default role to the new user
  IF default_role_id IS NOT NULL THEN
    INSERT INTO user_role_assignments (user_id, role_id, assigned_by, is_active)
    VALUES (NEW.id, default_role_id, NEW.id, true)
    ON CONFLICT (user_id, role_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to assign default role on user creation
CREATE TRIGGER assign_default_user_role_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION assign_default_user_role();

-- RLS Policies

-- user_roles policies
CREATE POLICY "Anyone can read active roles"
  ON user_roles
  FOR SELECT
  TO public
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

-- user_permissions policies
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

-- role_permissions policies
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

-- user_role_assignments policies
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