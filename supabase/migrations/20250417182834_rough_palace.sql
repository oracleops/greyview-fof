/*
  # Fix recurring pattern constraint

  1. Changes
    - Drop existing constraint
    - Add more flexible constraint that:
      a) Only validates when recurring_pattern is present
      b) Allows NULL for existing records
    - Update example documentation
  
  2. Details
    - Maintains data integrity while being more permissive
    - Prevents invalid JSON structures
    - Allows migration of existing data
*/

-- Drop the existing constraint
ALTER TABLE volunteer_opportunities
  DROP CONSTRAINT IF EXISTS valid_recurring_pattern;

-- Add new, more flexible constraint
ALTER TABLE volunteer_opportunities
  ADD CONSTRAINT valid_recurring_pattern CHECK (
    CASE 
      WHEN recurring_pattern IS NOT NULL THEN
        (jsonb_typeof(recurring_pattern) = 'object' AND
         recurring_pattern ? 'frequency' AND
         recurring_pattern ? 'interval' AND
         recurring_pattern ? 'start_date' AND
         recurring_pattern ? 'end_date')
      ELSE true
    END
  );

-- Update the documentation comment
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