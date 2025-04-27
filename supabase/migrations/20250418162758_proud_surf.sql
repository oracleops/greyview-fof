/*
  # Create volunteer signups table and related functions

  1. New Tables
    - `volunteer_signups`
      - Core signup fields (volunteer info, opportunity details)
      - Status tracking
      - Group size tracking
  
  2. Security
    - Enable RLS
    - Add policies for:
      - Volunteers can view their own signups
      - Organizations can view signups for their opportunities
*/

-- Create signup status enum
CREATE TYPE signup_status AS ENUM (
  'pending',
  'confirmed',
  'cancelled',
  'completed'
);

-- Create volunteer signups table
CREATE TABLE IF NOT EXISTS volunteer_signups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Volunteer Information
  volunteer_id uuid REFERENCES volunteer_profiles(id),
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  group_size integer NOT NULL DEFAULT 1,
  
  -- Opportunity Information
  opportunity_id uuid REFERENCES volunteer_opportunities(id) NOT NULL,
  
  -- Status
  status signup_status NOT NULL DEFAULT 'pending',
  
  -- Metadata
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Ensure one signup per volunteer per opportunity
  UNIQUE (volunteer_id, opportunity_id)
);

-- Enable RLS
ALTER TABLE volunteer_signups ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Volunteers can view their own signups"
  ON volunteer_signups
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = volunteer_id OR
    EXISTS (
      SELECT 1 FROM volunteer_opportunities vo
      WHERE vo.id = opportunity_id
      AND vo.organization_id IN (
        SELECT id FROM organizations_applications
        WHERE created_by = auth.uid()
      )
    )
  );

CREATE POLICY "Authenticated users can create signups"
  ON volunteer_signups
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = volunteer_id);

-- Triggers for updated_at
CREATE TRIGGER update_volunteer_signups_updated_at
  BEFORE UPDATE ON volunteer_signups
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Indexes
CREATE INDEX idx_volunteer_signups_volunteer ON volunteer_signups(volunteer_id);
CREATE INDEX idx_volunteer_signups_opportunity ON volunteer_signups(opportunity_id);