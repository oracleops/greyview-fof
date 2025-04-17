/*
  # Update calendar integration & recurring pattern

  1. Changes
    - Remove outdated `calendar_embed_code`
    - Add structured fields for calendar integration
    - Define `recurring_frequency` enum
    - Add a permissive `valid_recurring_pattern` CHECK
    - Update documentation on `recurring_pattern`
    - Rebuild `combined_vector` to include location fields
    - Recreate full-text search index
*/

-- 1) Remove the outdated calendar_embed_code column
ALTER TABLE volunteer_opportunities 
  DROP COLUMN IF EXISTS calendar_embed_code;

-- 2) Add new columns for calendar integration
ALTER TABLE volunteer_opportunities
  ADD COLUMN IF NOT EXISTS event_title       text GENERATED ALWAYS AS (name) STORED,
  ADD COLUMN IF NOT EXISTS event_duration    interval,
  ADD COLUMN IF NOT EXISTS event_timezone    text DEFAULT 'America/New_York',
  ADD COLUMN IF NOT EXISTS recurring_pattern jsonb;

-- 3) Create enum for recurring frequency
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'recurring_frequency') THEN
    CREATE TYPE recurring_frequency AS ENUM (
      'daily',
      'weekly',
      'monthly',
      'yearly'
    );
  END IF;
END$$;

-- 4) Drop old constraint and add a more flexible one
ALTER TABLE volunteer_opportunities
  DROP CONSTRAINT IF EXISTS valid_recurring_pattern;

ALTER TABLE volunteer_opportunities
  ADD CONSTRAINT valid_recurring_pattern CHECK (
    CASE
      WHEN recurring_pattern IS NOT NULL THEN
        jsonb_typeof(recurring_pattern) = 'object'
        AND recurring_pattern ? 'frequency'
        AND recurring_pattern ? 'interval'
        AND recurring_pattern ? 'start_date'
        AND recurring_pattern ? 'end_date'
      ELSE true
    END
  );

-- 5) Update the documentation comment on recurring_pattern
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
   }
   
   Notes:
   - NULL is allowed for one-time events
   - frequency must be one of: daily, weekly, monthly, yearly
   - interval is the number of frequency units between occurrences
   - days is required for weekly frequency
   - start_date and end_date must be in YYYY-MM-DD format
   - start_time must be in HH:mm format (24-hour)
   - exceptions is an optional array of YYYY-MM-DD dates to skip';

-- 6) Rebuild the combined_vector column
--    Drop trigger, drop old column, add new generated column
DROP TRIGGER IF EXISTS tsvector_update_trigger ON volunteer_opportunities;

ALTER TABLE volunteer_opportunities
  DROP COLUMN IF EXISTS combined_vector;

ALTER TABLE volunteer_opportunities
  ADD COLUMN combined_vector tsvector GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(name, '')),               'A') ||
    setweight(to_tsvector('english', coalesce(description, '')),        'B') ||
    setweight(to_tsvector('english', coalesce(impact_description, '')), 'C') ||
    setweight(to_tsvector('english', coalesce(location, '')),           'D') ||
    setweight(to_tsvector('english', coalesce(city, '')),               'D') ||
    setweight(to_tsvector('english', coalesce(state, '')),              'D')
  ) STORED;

-- 7) Recreate the GIN index on combined_vector
DROP INDEX IF EXISTS idx_volunteer_opportunities_search;
CREATE INDEX idx_volunteer_opportunities_search 
  ON volunteer_opportunities 
  USING GIN(combined_vector);