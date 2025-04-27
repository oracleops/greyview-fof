/*
  # Update authentication roles and policies
  
  1. Changes
    - Update user_role enum to include all required roles
    - Add role-specific policies for each auth state
    - Set up proper access control hierarchy
  
  2. Security
    - Volunteers can manage their profiles and view opportunities
    - Org admins can manage their organization's content
    - Admins have elevated access
    - Admin admins have full system access
*/

-- Drop and recreate role enum with proper values
DROP TYPE IF EXISTS user_role;
CREATE TYPE user_role AS ENUM ('volunteer', 'org_admin', 'admin', 'admin_admin');

-- Update existing admin policies to check for admin_admin role
CREATE OR REPLACE FUNCTION is_admin_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin_admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'admin_admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_org_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role = 'org_admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update user_roles policies
DROP POLICY IF EXISTS "Admins can manage roles" ON user_roles;

-- Only admin_admin can manage admin roles
CREATE POLICY "Admin admin can manage all roles"
  ON user_roles
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin_admin'
    )
  );

-- Admins can manage org_admin and volunteer roles
CREATE POLICY "Admins can manage non-admin roles"
  ON user_roles
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
    AND NEW.role IN ('org_admin', 'volunteer')
  );

-- Update volunteer_opportunities policies
DROP POLICY IF EXISTS "Organizations can manage their opportunities" ON volunteer_opportunities;
DROP POLICY IF EXISTS "Admins can manage all opportunities" ON volunteer_opportunities;

-- Org admins can manage their opportunities
CREATE POLICY "Org admins can manage their opportunities"
  ON volunteer_opportunities
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organizations_applications
      WHERE id = volunteer_opportunities.organization_id
      AND created_by = auth.uid()
    )
    AND EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role = 'org_admin'
    )
  );

-- Admins can manage all opportunities
CREATE POLICY "Admins can manage opportunities"
  ON volunteer_opportunities
  FOR ALL
  TO authenticated
  USING (is_admin());

-- Update volunteer_signups policies
DROP POLICY IF EXISTS "Anyone can create signups" ON volunteer_signups;
DROP POLICY IF EXISTS "Volunteers can view their signups" ON volunteer_signups;
DROP POLICY IF EXISTS "Organizations can view their opportunity signups" ON volunteer_signups;
DROP POLICY IF EXISTS "Admins can manage all signups" ON volunteer_signups;

-- Volunteers can manage their own signups
CREATE POLICY "Volunteers can manage their signups"
  ON volunteer_signups
  FOR ALL
  TO authenticated
  USING (
    email = auth.jwt()->>'email'
    AND EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role = 'volunteer'
    )
  );

-- Org admins can view their opportunity signups
CREATE POLICY "Org admins can view their signups"
  ON volunteer_signups
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM volunteer_opportunities vo
      JOIN organizations_applications oa ON vo.organization_id = oa.id
      WHERE vo.id = volunteer_signups.opportunity_id
      AND oa.created_by = auth.uid()
    )
    AND EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role = 'org_admin'
    )
  );

-- Admins can manage all signups
CREATE POLICY "Admins can manage signups"
  ON volunteer_signups
  FOR ALL
  TO authenticated
  USING (is_admin());

-- Admin admins have full access to everything
CREATE POLICY "Admin admin full access"
  ON volunteer_signups
  FOR ALL
  TO authenticated
  USING (is_admin_admin());

-- Create helper function to check user's highest role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS user_role AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin_admin') THEN
    RETURN 'admin_admin'::user_role;
  ELSIF EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin') THEN
    RETURN 'admin'::user_role;
  ELSIF EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'org_admin') THEN
    RETURN 'org_admin'::user_role;
  ELSIF EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'volunteer') THEN
    RETURN 'volunteer'::user_role;
  ELSE
    RETURN NULL;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;