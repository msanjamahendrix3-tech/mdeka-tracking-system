-- Supabase/PostgreSQL schema definitions for MDeka Tracking System
-- Paste this script directly inside the SQL Editor of your Supabase Dashboard to instantiate all tables.

-- Enable UUID extension just in case
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. CLINICS TABLE
CREATE TABLE IF NOT EXISTS clinics (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, SUSPENDED
    subscription_status TEXT NOT NULL DEFAULT 'PAID', -- PAID, UNPAID
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY, -- Maps to Firebase Auth UID
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL, -- SUPER_ADMIN, ADMIN, CHW, CLINICIAN
    clinic_id TEXT REFERENCES clinics(id) ON DELETE SET NULL,
    clinic TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. PATIENTS TABLE
CREATE TABLE IF NOT EXISTS patients (
    id TEXT PRIMARY KEY, -- Maps to Firestore Document ID
    name TEXT NOT NULL,
    age TEXT NOT NULL,
    gender TEXT NOT NULL,
    clinic TEXT NOT NULL,
    clinic_id TEXT REFERENCES clinics(id) ON DELETE CASCADE,
    department TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    address TEXT NOT NULL,
    sector TEXT,
    allergies TEXT,
    medications TEXT,
    ncd_reg_number TEXT,
    bp_measurement TEXT,
    diabetes_reading TEXT,
    status TEXT NOT NULL DEFAULT 'Normal', -- Normal, At Risk, Critical
    assigned_chw TEXT,
    follow_ups JSONB DEFAULT '[]'::jsonb NOT NULL, -- Stores structural FollowUpRecord array
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. PASSWORD RESET REQUESTS TABLE
CREATE TABLE IF NOT EXISTS password_reset_requests (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE, -- User who receives it OR null for general
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL, -- INFO, ALERT, PRIORITY
    read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. COMMUNITY POSTS (representing 'posts' collection)
CREATE TABLE IF NOT EXISTS posts (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    user_name TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT, -- Education, Case Study, Discussion, Question
    likes INTEGER DEFAULT 0 NOT NULL,
    comments JSONB DEFAULT '[]'::jsonb NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- INDEXES TO ENSURE SCALE AND PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_users_clinic ON users(clinic_id);
CREATE INDEX IF NOT EXISTS idx_patients_clinic ON patients(clinic_id);
CREATE INDEX IF NOT EXISTS idx_patients_status ON patients(status);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_user ON posts(user_id);

-- ROW LEVEL SECURITY (RLS) BASICS
-- Enable RLS on all tables
ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE password_reset_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Create generic permissive policies for basic full access (Since Auth is managed via Firebase frontends, these bypass RLS constraints)
CREATE POLICY "Enable read for authenticated users" ON clinics FOR SELECT USING (true);
CREATE POLICY "Enable write for authenticated users" ON clinics FOR ALL USING (true);

CREATE POLICY "Enable select for users" ON users FOR SELECT USING (true);
CREATE POLICY "Enable write for users" ON users FOR ALL USING (true);

CREATE POLICY "Enable select for patients" ON patients FOR SELECT USING (true);
CREATE POLICY "Enable write for patients" ON patients FOR ALL USING (true);

CREATE POLICY "Enable select for notifications" ON notifications FOR SELECT USING (true);
CREATE POLICY "Enable write for notifications" ON notifications FOR ALL USING (true);

CREATE POLICY "Enable select for posts" ON posts FOR SELECT USING (true);
CREATE POLICY "Enable write for posts" ON posts FOR ALL USING (true);

CREATE POLICY "Enable select for resets" ON password_reset_requests FOR SELECT USING (true);
CREATE POLICY "Enable write for resets" ON password_reset_requests FOR ALL USING (true);
