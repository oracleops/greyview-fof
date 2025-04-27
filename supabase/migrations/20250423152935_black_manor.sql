/*
  # Fix opportunity viewing policies

  1. Changes
    - Drop existing public policy
    - Create new policy for both public and authenticated users
    - Ensures consistent viewing permissions regardless of auth state
  
  2. Security
    - Maintains active=true requirement
    - Allows both authenticated and public users to view active opportunities
*/

-- Drop the existing public policy
DROP POLICY IF EXISTS "Public can view active opportunities" ON volunteer_opportunities;

-- Create new policy for both public and authenticated users
CREATE POLICY "Anyone can view active opportunities"
  ON volunteer_opportunities
  FOR SELECT
  TO public, authenticated
  USING (active = true);