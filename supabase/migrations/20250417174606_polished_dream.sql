/*
  # Create volunteer opportunities table

  1. New Tables
    - `volunteer_opportunities`
      - Core opportunity fields (name, description, etc.)
      - Event details (date, type, schedule)
      - Location information
      - Sign-up configuration
  
  2. Security
    - Enable RLS
    - Add policies for:
      - Public can view active opportunities
      - Organizations can manage their opportunities
*/

-- Create event_type enum
CREATE TYPE event_type AS ENUM ('one-time', 'recurring');

-- Create volunteer opportunities table
CREATE TABLE IF NOT EXISTS volunteer_opportunities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations_applications(id),
  
  -- Basic Details
  name text NOT NULL,
  description text NOT NULL,
  impact_description text,
  image_url text,
  time_commitment text NOT NULL,
  skills_required text,
  
  -- Event Information
  event_type event_type NOT NULL,
  event_date timestamptz,
  recurring_schedule jsonb,
  
  -- Location
  location text NOT NULL,
  street_address text NOT NULL,
  city text NOT NULL,
  state text NOT NULL,
  postal_code text NOT NULL,
  country text DEFAULT 'United States',
  coordinates geography(POINT),
  
  -- Sign-up Configuration
  sign_up_external boolean DEFAULT false,
  external_signup_url text,
  
  -- Status and Metadata
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  impact_results text,
  
  -- Search Optimization
  combined_vector tsvector GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(description, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(impact_description, '')), 'C') ||
    setweight(to_tsvector('english', coalesce(location, '')), 'D')
  ) STORED,

  -- Constraints
  CONSTRAINT valid_event_date CHECK (
    (event_type = 'one-time' AND event_date IS NOT NULL) OR
    (event_type = 'recurring' AND recurring_schedule IS NOT NULL)
  ),
  CONSTRAINT valid_signup_url CHECK (
    NOT (sign_up_external = true AND external_signup_url IS NULL)
  )
);

-- Enable RLS
ALTER TABLE volunteer_opportunities ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public can view active opportunities"
  ON volunteer_opportunities
  FOR SELECT
  TO public
  USING (active = true);

CREATE POLICY "Organizations can manage their opportunities"
  ON volunteer_opportunities
  FOR ALL
  TO authenticated
  USING (organization_id IN (
    SELECT id FROM organizations_applications 
    WHERE created_by = auth.uid()
  ))
  WITH CHECK (organization_id IN (
    SELECT id FROM organizations_applications 
    WHERE created_by = auth.uid()
  ));

-- Triggers
CREATE OR REPLACE FUNCTION update_volunteer_opportunities_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_volunteer_opportunities_updated_at
  BEFORE UPDATE ON volunteer_opportunities
  FOR EACH ROW
  EXECUTE FUNCTION update_volunteer_opportunities_updated_at();

-- Indexes
CREATE INDEX idx_volunteer_opportunities_active ON volunteer_opportunities(active);
CREATE INDEX idx_volunteer_opportunities_organization ON volunteer_opportunities(organization_id);
CREATE INDEX idx_volunteer_opportunities_location ON volunteer_opportunities(city, state);
CREATE INDEX idx_volunteer_opportunities_search ON volunteer_opportunities USING GIN(combined_vector);
CREATE INDEX idx_volunteer_opportunities_coordinates ON volunteer_opportunities USING GIST(coordinates);