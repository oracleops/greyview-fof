/*
  # Create organizations applications table

  1. New Tables
    - `organizations_applications`
      - Core organization fields (name, description, etc.)
      - Application status tracking
      - Timestamps and audit fields
  
  2. Security
    - Enable RLS
    - Add policies for:
      - Applicants can read their own applications
      - Admins can read all applications
      - Only authenticated users can create applications
      - Only admins can update application status
*/

-- Create enum for application status
CREATE TYPE application_status AS ENUM (
  'pending',
  'under_review',
  'changes_requested',
  'approved',
  'rejected'
);

-- Create organizations applications table
CREATE TABLE IF NOT EXISTS organizations_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Organization Details
  name text NOT NULL,
  description text,
  logo_url text,
  website_url text,
  
  -- Location
  address text,
  city text,
  state text,
  postal_code text,
  country text,
  
  -- Contact
  email text NOT NULL,
  phone text,
  
  -- Application Status
  status application_status NOT NULL DEFAULT 'pending',
  status_notes text,
  reviewed_by uuid REFERENCES auth.users(id),
  reviewed_at timestamptz,
  
  -- Metadata
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid NOT NULL REFERENCES auth.users(id),
  
  -- Ensure unique email per pending/under_review application
  UNIQUE (email, status)
);

-- Enable RLS
ALTER TABLE organizations_applications ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can create applications"
  ON organizations_applications
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can view their own applications"
  ON organizations_applications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = created_by);

CREATE POLICY "Admins can view all applications"
  ON organizations_applications
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update applications"
  ON organizations_applications
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

-- Triggers
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_organizations_applications_updated_at
  BEFORE UPDATE ON organizations_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Indexes
CREATE INDEX idx_organizations_applications_status ON organizations_applications(status);
CREATE INDEX idx_organizations_applications_created_by ON organizations_applications(created_by);