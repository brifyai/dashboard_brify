-- Supabase Authentication Setup Script
-- Run this SQL in your Supabase SQL editor to set up the necessary tables and policies for authentication.

-- Drop existing users table if it exists (this will delete all data)
DROP TABLE IF EXISTS users CASCADE;

-- Create users table (profiles)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'user',
  status TEXT DEFAULT 'active',
  profile JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users to read all users (for dashboard)
CREATE POLICY "Allow authenticated users to read users"
  ON users FOR SELECT
  USING (auth.role() = 'authenticated');

-- Policy: Allow users to update their own profile
CREATE POLICY "Allow users to update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- Policy: Allow insert via trigger (no policy needed, trigger runs with SECURITY DEFINER)

-- Function to automatically create a user profile after signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role, status, profile, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    COALESCE(NEW.raw_user_meta_data->>'role', 'user'),
    'active',
    jsonb_build_object(
      'avatar', NEW.raw_user_meta_data->>'avatar_url',
      'bio', ''
    ),
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function after a user is created in auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Optionally, create an admin user manually via the app or with the following instructions:
-- 1. Sign up with an email and password.
-- 2. Then run an SQL update to set role = 'admin' for that user.
-- Example: UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';