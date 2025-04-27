/*
  # Update RLS policies for all authentication states
  
  1. Changes
    - Add role-based policies for organizations and volunteers
    - Enable proper signup flow permissions
    - Set up admin access controls
  
  2. Security
    - Public can view active opportunities
    - Volunteers can manage their profiles and signups
    - Organizations can manage their opportunities
    - Admins have full access where needed
*/

-- Create admin role type
CREATE TYPE user_role AS ENUM ('admin', 'organization', 'volunteer');

-- Create user roles table
CREATE TABLE IF NOT EXISTS user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Allow admins to manage roles
CREATE POLICY "Admins can manage roles"
  ON user_roles
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

-- Update volunteer_signups policies
DROP POLICY IF EXISTS "Authenticated users can create signups" ON volunteer_signups;
DROP POLICY IF EXISTS "Volunteers can view their own signups" ON volunteer_signups;

-- Allow public to create signups
CREATE POLICY "Anyone can create signups"
  ON volunteer_signups
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Allow volunteers to view their signups
CREATE POLICY "Volunteers can view their signups"
  ON volunteer_signups
  FOR SELECT
  TO authenticated
  USING (
    email = auth.jwt()->>'email' OR
    EXISTS (
      SELECT 1 FROM volunteer_opportunities vo
      JOIN organizations_applications oa ON vo.organization_id = oa.id
      WHERE vo.id = volunteer_signups.opportunity_id
      AND oa.created_by = auth.uid()
    )
  );

-- Allow organizations to view signups for their opportunities
CREATE POLICY "Organizations can view their opportunity signups"
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
  );

-- Allow admins full access to signups
CREATE POLICY "Admins can manage all signups"
  ON volunteer_signups
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

-- Update volunteer_opportunities policies
DROP POLICY IF EXISTS "Organizations can manage their opportunities" ON volunteer_opportunities;

-- Allow organizations to manage their opportunities
CREATE POLICY "Organizations can manage their opportunities"
  ON volunteer_opportunities
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organizations_applications
      WHERE id = volunteer_opportunities.organization_id
      AND created_by = auth.uid()
    )
  );

-- Allow admins to manage all opportunities
CREATE POLICY "Admins can manage all opportunities"
  ON volunteer_opportunities
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;