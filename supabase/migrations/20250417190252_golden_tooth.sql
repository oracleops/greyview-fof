/*
  # Insert sample volunteer opportunity

  1. Changes
    - Insert a complete sample opportunity record
    - Includes all fields with realistic example data
    - Uses proper event scheduling and location data
*/

-- Insert a sample volunteer opportunity
INSERT INTO volunteer_opportunities (
  name,
  description,
  impact_description,
  image_url,
  time_commitment,
  skills_required,
  event_type,
  event_date,
  recurring_pattern,
  location,
  street_address,
  city,
  state,
  postal_code,
  country,
  coordinates,
  sign_up_external,
  external_signup_url,
  active,
  event_duration,
  event_timezone
) VALUES (
  'Community Garden Maintenance',
  E'Join us in maintaining our community garden! We need dedicated volunteers to help with planting, weeding, watering, and harvesting organic vegetables. This is a great opportunity to learn about sustainable gardening while helping provide fresh produce to local food banks.\n\nNo prior gardening experience is required - we provide all necessary training and tools.',
  'Your work directly contributes to food security in our community. Last year, our garden produced over 2,000 pounds of fresh vegetables for local food banks and community kitchens.',
  'https://images.unsplash.com/photo-1592150621744-aca64f48394a',
  '2-3 hours per session',
  'Physical ability to bend, kneel, and lift up to 20 pounds. Enthusiasm for outdoor work!',
  'recurring',
  NULL,
  '{
    "frequency": "weekly",
    "interval": 1,
    "days": ["SAT"],
    "start_date": "2025-05-01",
    "end_date": "2025-10-31",
    "start_time": "09:00",
    "exceptions": ["2025-07-04"]
  }'::jsonb,
  'Downtown Community Garden',
  '123 Main Street',
  'Springfield',
  'IL',
  '62701',
  'United States',
  ST_SetSRID(ST_MakePoint(-89.6501, 39.8018), 4326)::geography,
  false,
  NULL,
  true,
  '3 hours'::interval,
  'America/Chicago'
);