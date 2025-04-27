/*
  # Create volunteer signups table and policies
  
  1. New Tables
    - `volunteer_signups`
      - Core signup fields (volunteer info, opportunity details)
      - Status tracking
      - Group size tracking
      - Communication preferences
      - Audit fields
  
  2. Security
    - Enable RLS
    - Add policies for all auth states:
      - Public signup creation
      - Volunteer management
      - Org admin viewing
      - Admin full access
*/

-- Create signup status enum if it doesn't exist
CREATE TYPE signup_status AS ENUM (
  'pending',
  'confirmed',
  'cancelled',
  'completed',
  'no_show'
);

-- Create volunteer signups table
CREATE TABLE IF NOT EXISTS volunteer_signups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Volunteer Information
  volunteer_id uuid REFERENCES auth.users(id),
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  phone text,
  group_size integer NOT NULL DEFAULT 1,
  
  -- Opportunity Information
  opportunity_id uuid REFERENCES volunteer_opportunities(id) NOT NULL,
  
  -- Status & Schedule
  status signup_status NOT NULL DEFAULT 'pending',
  scheduled_start timestamptz,
  scheduled_end timestamptz,
  actual_start timestamptz,
  actual_end timestamptz,
  hours_logged numeric(5,2),
  
  -- Additional Details
  special_requirements text,
  emergency_contact jsonb,
  waiver_signed boolean DEFAULT false,
  waiver_signed_at timestamptz,
  
  -- Communication Preferences
  reminder_email boolean DEFAULT true,
  reminder_sms boolean DEFAULT false,
  
  -- Notes & Feedback
  private_notes text, -- For org/admin use
  public_notes text,  -- Visible to volunteer
  feedback_rating integer,
  feedback_text text,
  
  -- Metadata & Audit
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  cancelled_at timestamptz,
  cancelled_reason text,
  last_reminder_sent timestamptz,
  check_in_location geography(Point,4326),
  
  -- Constraints
  CONSTRAINT valid_group_size CHECK (group_size > 0),
  CONSTRAINT valid_feedback_rating CHECK (feedback_rating IS NULL OR (feedback_rating >= 1 AND feedback_rating <= 5)),
  CONSTRAINT valid_schedule CHECK (scheduled_end > scheduled_start),
  CONSTRAINT valid_actual_time CHECK (actual_end > actual_start)
);

-- Enable RLS
ALTER TABLE volunteer_signups ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX idx_volunteer_signups_volunteer_id ON volunteer_signups(volunteer_id);
CREATE INDEX idx_volunteer_signups_opportunity_id ON volunteer_signups(opportunity_id);
CREATE INDEX idx_volunteer_signups_email ON volunteer_signups(email);
CREATE INDEX idx_volunteer_signups_status ON volunteer_signups(status);
CREATE INDEX idx_volunteer_signups_scheduled_start ON volunteer_signups(scheduled_start);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_volunteer_signups_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_volunteer_signups_updated_at
  BEFORE UPDATE ON volunteer_signups
  FOR EACH ROW
  EXECUTE FUNCTION update_volunteer_signups_updated_at();

-- Policies

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