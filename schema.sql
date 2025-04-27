-- -------------------------------------------------------------------
-- 1) ENUM TYPES
-- -------------------------------------------------------------------

CREATE TYPE application_status AS ENUM (
  'under_review',
  'rejected',
  'approved',
  'changes_requested',
  'pending'
);

CREATE TYPE recurring_frequency AS ENUM (
  'yearly',
  'daily',
  'weekly',
  'monthly'
);

CREATE TYPE user_role AS ENUM (
  'admin_admin',
  'volunteer',
  'org_admin',
  'admin'
);


-- -------------------------------------------------------------------
-- 2) TABLES
-- -------------------------------------------------------------------

CREATE TABLE public.notifications (
  id             uuid        NOT NULL DEFAULT gen_random_uuid(),
  data           jsonb       NOT NULL,
  recipient_email text       NOT NULL,
  type           text        NOT NULL,
  created_at     timestamptz NOT NULL DEFAULT now(),
  processed_at   timestamptz,
  last_attempt   timestamptz,
  attempts       integer     NOT NULL DEFAULT 0,
  status         text        NOT NULL DEFAULT 'pending'
);

CREATE TABLE public.organizations (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name           text        NOT NULL,
  description    text,
  logo_url       text,
  website        text,
  contact_email  text,
  contact_phone  text,
  address        text,
  city           text,
  state          text,
  postal_code    text,
  country        text        DEFAULT 'United States',
  coordinates    geography(Point,4326),
  verified       boolean     DEFAULT false,
  created_at     timestamptz DEFAULT now()
);

CREATE TABLE public.organizations_applications (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name           text        NOT NULL,
  description    text,
  logo_url       text,
  website_url    text,
  email          text        NOT NULL,
  phone          text,
  address        text,
  city           text,
  state          text,
  postal_code    text,
  country        text,
  status         application_status NOT NULL DEFAULT 'pending',
  status_notes   text,
  reviewed_by    uuid        REFERENCES auth.users(id),
  reviewed_at    timestamptz,
  created_by     uuid        NOT NULL REFERENCES auth.users(id),
  created_at     timestamptz DEFAULT now(),
  updated_at     timestamptz DEFAULT now()
);

CREATE TABLE public.user_roles (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id uuid,
  role           user_role   NOT NULL,
  provider       text        DEFAULT 'email',
  created_by     uuid        REFERENCES auth.users(id),
  created_at     timestamptz DEFAULT now()
);

CREATE TABLE public.volunteer_applications (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  volunteer_id   uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  opportunity_id uuid        NOT NULL REFERENCES public.volunteer_opportunities(id) ON DELETE CASCADE,
  message        text,
  status         text        NOT NULL,
  created_at     timestamptz DEFAULT now(),
  updated_at     timestamptz DEFAULT now()
);

CREATE TABLE public.volunteer_messages (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id uuid        REFERENCES public.volunteer_opportunities(id),
  sender_id      uuid        REFERENCES auth.users(id),
  recipient_id   uuid        REFERENCES auth.users(id),
  message        text        NOT NULL,
  read           boolean     DEFAULT false,
  created_at     timestamptz DEFAULT now()
);

CREATE TABLE public.volunteer_opportunities (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id  uuid        REFERENCES public.organizations_applications(id) ON DELETE CASCADE,
  name             text        NOT NULL,
  description      text        NOT NULL,
  impact_description text,
  image_url        text,
  time_commitment  text        NOT NULL,
  skills_required  text[]      DEFAULT '{}'::text[],
  location         text        NOT NULL,
  street_address   text,
  city             text,
  state            text,
  postal_code      text,
  country          text        DEFAULT 'United States',
  coordinates      geography(Point,4326),
  event_type       text,
  event_date       timestamptz,
  recurring_schedule jsonb,
  sign_up_external boolean     NOT NULL DEFAULT false,
  external_signup_url text,
  completed_at     timestamptz,
  impact_results   text,
  calendar_embed_config text,
  event_title      text        GENERATED ALWAYS AS (name) STORED,
  event_duration   interval,
  event_timezone   text        DEFAULT 'America/New_York',
  recurring_pattern jsonb,
  combined_vector  tsvector    GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(description, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(impact_description, '')), 'C') ||
    setweight(to_tsvector('english', coalesce(location, '')), 'D') ||
    setweight(to_tsvector('english', coalesce(city, '')), 'D') ||
    setweight(to_tsvector('english', coalesce(state, '')), 'D')
  ) STORED,
  created_at       timestamptz DEFAULT now(),
  active           boolean     DEFAULT true
);

CREATE TABLE public.volunteer_schedules (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  volunteer_id     uuid        REFERENCES auth.users(id),
  opportunity_id   uuid        REFERENCES public.volunteer_opportunities(id),
  start_time       timestamptz NOT NULL,
  end_time         timestamptz NOT NULL,
  hours_logged     numeric(5,2),
  status           text        NOT NULL,
  notes            text,
  created_at       timestamptz DEFAULT now()
);


-- -------------------------------------------------------------------
-- 3) ENABLE ROW LEVEL SECURITY
-- -------------------------------------------------------------------

ALTER TABLE public.notifications            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.volunteer_applications   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.volunteer_messages       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.volunteer_opportunities  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.volunteer_schedules      ENABLE ROW LEVEL SECURITY;


-- -------------------------------------------------------------------
-- 4) RLS POLICIES
-- -------------------------------------------------------------------

-- notifications
CREATE POLICY "Service role can manage all notifications"
  ON public.notifications
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- organizations_applications
CREATE POLICY "Anyone can submit organization applications"
  ON public.organizations_applications
  FOR INSERT
  TO public
  WITH CHECK (created_by IS NULL);

CREATE POLICY "Users can view their own applications"
  ON public.organizations_applications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = created_by);

CREATE POLICY "Admins can view all applications"
  ON public.organizations_applications
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
        AND role = 'admin'::user_role
    )
  );

CREATE POLICY "Admins can update applications"
  ON public.organizations_applications
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
        AND role = 'admin'::user_role
    )
  );

CREATE POLICY "Applicants can update own applications"
  ON public.organizations_applications
  FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

-- organizations
CREATE POLICY "Organizations are viewable by everyone"
  ON public.organizations
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can create organizations"
  ON public.organizations
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can manage organizations"
  ON public.organizations
  FOR UPDATE
  TO authenticated
  USING (can_manage_organization(id))
  WITH CHECK (can_manage_organization(id));

CREATE POLICY "Organization admins can update organizations"
  ON public.organizations
  FOR UPDATE
  TO authenticated
  USING (has_role('org_admin'::user_role, id));

CREATE POLICY "Organization members can view their organizations"
  ON public.organizations
  FOR SELECT
  TO authenticated
  USING (true);

-- user_roles
CREATE POLICY "Users can view own roles"
  ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admin admin can manage all roles"
  ON public.user_roles
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.role = 'admin_admin'::user_role
    )
  );

CREATE POLICY "Org admins can manage org roles"
  ON public.user_roles
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.role = 'org_admin'::user_role
        AND ur.organization_id = user_roles.organization_id
    )
  );

CREATE POLICY "Allow initial role assignment during signup"
  ON public.user_roles
  FOR INSERT
  TO public
  WITH CHECK (
    (role = 'volunteer'::user_role AND user_id = auth.uid() AND organization_id IS NULL)
    OR (role = 'org_admin'::user_role  AND user_id = auth.uid() AND organization_id IS NOT NULL)
    OR (provider = 'google'          AND user_id = auth.uid() AND role = 'volunteer'::user_role AND organization_id IS NULL)
  );

-- volunteer_opportunities
CREATE POLICY "Anyone can view active opportunities"
  ON public.volunteer_opportunities
  FOR SELECT
  TO public, authenticated
  USING (active = true);

CREATE POLICY "Organization admins can manage opportunities"
  ON public.volunteer_opportunities
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
        AND organization_id = volunteer_opportunities.organization_id
        AND role = ANY (ARRAY['admin_admin'::user_role,'admin'::user_role,'org_admin'::user_role])
    )
  );

-- volunteer_applications
CREATE POLICY "Admins can view all applications"
  ON public.volunteer_applications
  FOR SELECT
  TO authenticated
  USING (
    has_role(
      'admin'::user_role,
      (
        SELECT organization_id
        FROM public.volunteer_opportunities
        WHERE id = volunteer_applications.opportunity_id
      )
    )
  );

-- volunteer_messages
CREATE POLICY "Users can view their own messages"
  ON public.volunteer_messages
  FOR SELECT
  TO authenticated
  USING (
    sender_id = auth.uid()
    OR recipient_id = auth.uid()
  );

CREATE POLICY "Users can send messages"
  ON public.volunteer_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (sender_id = auth.uid());

-- volunteer_schedules
-- (You can add scheduling-specific RLS here if needed)
