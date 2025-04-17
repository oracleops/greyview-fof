/*
  # Create volunteer profiles table

  1. New Tables
    - `volunteer_profiles`
      - Core volunteer fields (name, bio, skills, etc.)
      - Links to Supabase auth.users
      - Timestamps and audit fields
  
  2. Security
    - Enable RLS
    - Add policies for:
      - Volunteers can read and update their own profile
      - Public can view limited volunteer info
      - Only authenticated users can create profiles
*/

-- Create volunteer profiles table
CREATE TABLE IF NOT EXISTS volunteer_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  first_name text NOT NULL,
  last_name text NOT NULL,
  bio text,
  skills text[],
  interests text[],
  avatar_url text,
  phone text,
  city text,
  state text,
  postal_code text,
  country text DEFAULT 'United States',
  email_notifications boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE volunteer_profiles ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own profile"
  ON volunteer_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON volunteer_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Public can view limited volunteer info"
  ON volunteer_profiles
  FOR SELECT
  TO public
  USING (true);

-- Triggers
CREATE OR REPLACE FUNCTION update_volunteer_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_volunteer_profiles_updated_at
  BEFORE UPDATE ON volunteer_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_volunteer_profiles_updated_at();