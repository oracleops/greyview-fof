/*
  # Fix vector index in volunteer opportunities table

  1. Changes
    - Drop existing index
    - Create new index with correct operator class
    - Add missing calendar_embed_code column
*/

-- Drop the existing index if it exists
DROP INDEX IF EXISTS idx_volunteer_opportunities_search;

-- Create the index with the correct operator class
CREATE INDEX idx_volunteer_opportunities_search 
  ON volunteer_opportunities 
  USING GIN(combined_vector tsvector_ops);

-- Add missing calendar_embed_code column
ALTER TABLE volunteer_opportunities
  ADD COLUMN IF NOT EXISTS calendar_embed_code text;