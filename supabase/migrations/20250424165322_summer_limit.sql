/*
  # Fix volunteer signup policies
  
  1. Changes
    - Add public signup policy
    - Update authenticated user policies
    - Ensure proper role-based access
  
  2. Security
    - Allow public to create initial signups
    - Maintain role-based access control
    - Preserve data isolation
*/

-- Drop existing signup policies
DROP POLICY IF EXISTS "Volunteers can manage their signups" ON volunteer_signups;
DROP POLICY IF EXISTS "Org admins can view their signups" ON volunteer_signups;
DROP POLICY IF EXISTS "Admins can manage signups" ON volunteer_signups;
DROP POLICY IF EXISTS "Admin admin full access" ON volunteer_signups;

-- Allow public to create signups
CREATE POLICY "Public can create signups"
  ON volunteer_signups
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Volunteers can view and manage their own signups
CREATE POLICY "Volunteers can manage own signups"
  ON volunteer_signups
  FOR ALL
  TO authenticated
  USING (
    email = auth.jwt()->>'email'
    OR EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role = 'volunteer'
    )
  );

-- Org admins can view signups for their opportunities
CREATE POLICY "Org admins can view opportunity signups"
  ON volunteer_signups
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM volunteer_opportunities vo
      WHERE vo.id = volunteer_signups.opportunity_id
      AND vo.organization_id IN (
        SELECT organization_id 
        FROM user_roles 
        WHERE user_id = auth.uid() 
        AND role = 'org_admin'
      )
    )
  );

-- Admins can manage all signups
CREATE POLICY "Admins can manage all signups"
  ON volunteer_signups
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'admin_admin')
    )
  );

-- Helper function to check if user has specific role
CREATE OR REPLACE FUNCTION has_role(required_role user_role)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role = required_role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;