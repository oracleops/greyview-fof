/*
  # Update organizations applications policies

  1. Changes
    - Drop existing insert policy
    - Add new public insert policy
    - Remove created_by requirement
  
  2. Security
    - Allow public submissions
    - Maintain other existing policies
*/

-- Drop the existing insert policy
DROP POLICY IF EXISTS "Users can create applications" ON organizations_applications;

-- Alter table to make created_by nullable
ALTER TABLE organizations_applications ALTER COLUMN created_by DROP NOT NULL;

-- Create new public insert policy
CREATE POLICY "Public can submit applications"
  ON organizations_applications
  FOR INSERT
  TO public
  WITH CHECK (
    status = 'pending' AND
    created_by IS NULL
  );