-- Postgres schema for Findtern auth & admin

-- Ensure UUID generation function is available
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Users (interns / employees)
CREATE TABLE IF NOT EXISTS users (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL UNIQUE,
  country_code text NOT NULL DEFAULT '+91',
  phone_number text NOT NULL,
  password text NOT NULL,
  agreed_to_terms boolean NOT NULL DEFAULT false,
  role text NOT NULL DEFAULT 'intern' -- 'intern' or 'employee'
);

-- Employers / Companies
CREATE TABLE IF NOT EXISTS employers (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  company_name text NOT NULL,
  company_email text NOT NULL UNIQUE,
  country_code text NOT NULL DEFAULT '+91',
  phone_number text NOT NULL,
  password text NOT NULL,
  agreed_to_terms boolean NOT NULL DEFAULT false,
  website_url text,
  company_size text,
  city text,
  state text,
  primary_contact_name text,
  primary_contact_role text,
  escalation_contact_name text,
  escalation_contact_email text,
  escalation_contact_phone text,
  escalation_contact_role text,
  bank_name text,
  account_number text,
  account_holder_name text,
  ifsc_code text,
  swift_code text,
  gst_number text,
  created_at timestamp DEFAULT now()
);

-- Admins (for /admin/login)
CREATE TABLE IF NOT EXISTS admins (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  password text NOT NULL,
  name text,
  role text DEFAULT 'admin',
  created_at timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS projects (
  id           varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id  varchar NOT NULL REFERENCES employers(id) ON DELETE CASCADE,
  project_name text NOT NULL,
  skills       jsonb DEFAULT '[]'::jsonb,
  scope_of_work text,
  full_time_offer boolean DEFAULT false,
  location_type  text,          -- 'onsite' | 'hybrid' | 'remote'
  pincode        text,
  city           text,
  timezone       text,
  status         text DEFAULT 'active',
  created_at     timestamp DEFAULT now()
);

-- Intern Onboarding (linked to users)
CREATE TABLE IF NOT EXISTS intern_onboarding (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id varchar NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Step 1: About Me
  linkedin_url    text,
  pin_code        text,
  state           text,
  city            text,
  aadhaar_number  text,
  pan_number      text,
  bio             text,

  -- Step 3: Experience (optional, stored as JSON array)
  experience_json jsonb DEFAULT '[]'::jsonb,

  -- Step 4: Skills
  skills          jsonb DEFAULT '[]'::jsonb,  -- [{name: 'React', rating: 4}, ...]

  -- Step 6: Location Preferences (stored as JSON arrays)
  location_types jsonb DEFAULT '[]'::jsonb,
  preferred_locations jsonb DEFAULT '[]'::jsonb,

  has_laptop           boolean,

  preview_summary text,
  extra_data      jsonb DEFAULT '{}'::jsonb,

  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Intern Documents (metadata for uploaded files)
CREATE TABLE IF NOT EXISTS intern_document (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id varchar NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  profile_photo_name text,
  profile_photo_type text,
  profile_photo_size integer,

  intro_video_name text,
  intro_video_type text,
  intro_video_size integer,

  aadhaar_image_name text,
  aadhaar_image_type text,
  aadhaar_image_size integer,

  pan_image_name text,
  pan_image_type text,
  pan_image_size integer,

  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

ALTER TABLE employers
  ADD COLUMN IF NOT EXISTS setup_completed boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS onboarding_completed boolean NOT NULL DEFAULT false;