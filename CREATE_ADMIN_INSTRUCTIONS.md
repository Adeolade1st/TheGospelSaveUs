# Creating an Admin User

After running the database migrations, you can create an admin user using one of these methods:

## Method 1: Using Supabase SQL Editor (Recommended)

1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Run this SQL command:

```sql
SELECT create_admin_user(
  'admin@godwillprovide.org',  -- Replace with your email
  'SecurePassword123!',        -- Replace with a secure password
  'Admin User'                 -- Replace with full name (optional)
);
```

## Method 2: Using Supabase CLI

```bash
# Connect to your database
supabase db reset

# Or run the specific function
supabase db functions invoke create_admin_user --data '{"user_email":"admin@godwillprovide.org","user_password":"SecurePassword123!","user_full_name":"Admin User"}'
```

## Method 3: Manual Database Insert

If the function doesn't work, you can manually create an admin user:

```sql
-- 1. First, create the user in auth.users
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@godwillprovide.org',
  crypt('SecurePassword123!', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "Admin User"}'
);

-- 2. Get the user ID (replace with actual ID from above)
-- 3. Assign admin role
INSERT INTO user_role_assignments (user_id, role_id, assigned_by, is_active)
SELECT 
  'USER_ID_FROM_STEP_1',  -- Replace with actual user ID
  ur.id,
  'USER_ID_FROM_STEP_1',  -- Replace with actual user ID
  true
FROM user_roles ur
WHERE ur.name = 'admin';
```

## Verification

After creating the admin user, verify it works:

1. Try logging in with the admin credentials
2. Navigate to `/admin` in your application
3. You should see the admin dashboard

## Security Notes

- Use a strong password for admin accounts
- Consider enabling 2FA for admin users
- Regularly audit admin user access
- Use unique emails for admin accounts