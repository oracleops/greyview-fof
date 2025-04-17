/*
  # Update calendar integration for volunteer opportunities

  1. Changes
    - Remove calendar_embed_code column
    - Add structured fields for calendar integration
    - Update recurring_schedule structure
  
  2. Details
    - Adds fields needed for calendar event generation
    - Supports recurring event patterns
    - Enables dynamic calendar link generation
*/

-- Remove the outdated calendar_embed_code column
ALTER TABLE volunteer_opportunities 
  DROP COLUMN IF EXISTS calendar_embed_code;

-- Add new columns for better calendar integration
ALTER TABLE volunteer_opportunities
  ADD COLUMN IF NOT EXISTS event_title text GENERATED ALWAYS AS (name) STORED,
  ADD COLUMN IF NOT EXISTS event_duration interval,
  ADD COLUMN IF NOT EXISTS event_timezone text DEFAULT 'America/New_York',
  ADD COLUMN IF NOT EXISTS recurring_pattern jsonb;

-- Create type for recurring pattern frequency
CREATE TYPE recurring_frequency AS ENUM (
  'daily',
  'weekly',
  'monthly',
  'yearly'
);

-- Add constraint to validate recurring_pattern structure
ALTER TABLE volunteer_opportunities
  ADD CONSTRAINT valid_recurring_pattern CHECK (
    CASE 
      WHEN event_type = 'recurring' THEN
        (recurring_pattern IS NOT NULL AND 
         recurring_pattern ? 'frequency' AND
         recurring_pattern ? 'interval' AND
         recurring_pattern ? 'start_date' AND
         recurring_pattern ? 'end_date')
      ELSE true
    END
  );

-- Example recurring_pattern JSON structure:
COMMENT ON COLUMN volunteer_opportunities.recurring_pattern IS
  'JSON structure for recurring events. Example:
   {
     "frequency": "weekly",
     "interval": 1,
     "days": ["MON", "WED", "FRI"],
     "start_date": "2025-01-01",
     "end_date": "2025-12-31",
     "start_time": "09:00",
     "exceptions": ["2025-12-25"]
   }';

-- Update the combined_vector to include new fields
DROP TRIGGER IF EXISTS tsvector_update_trigger ON volunteer_opportunities;

ALTER TABLE volunteer_opportunities
  DROP COLUMN combined_vector;

ALTER TABLE volunteer_opportunities
  ADD COLUMN combined_vector tsvector GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(description, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(impact_description, '')), 'C') ||
    setweight(to_tsvector('english', coalesce(location, '')), 'D') ||
    setweight(to_tsvector('english', coalesce(city, '')), 'D') ||
    setweight(to_tsvector('english', coalesce(state, '')), 'D')
  ) STORED;

-- Recreate the search index
DROP INDEX IF EXISTS idx_volunteer_opportunities_search;
CREATE INDEX idx_volunteer_opportunities_search 
  ON volunteer_opportunities 
  USING GIN(combined_vector tsvector_ops);