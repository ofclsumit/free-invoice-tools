-- ============================================================
-- TURNIVO — ADMIN ANALYTICS & USAGE TELEMETRY SYSTEM
-- Supabase PostgreSQL Migration with Row Level Security (RLS)
-- ============================================================

-- 1. Create tool_events table
CREATE TABLE IF NOT EXISTS public.tool_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tool_id VARCHAR(100) NOT NULL,
    tool_name VARCHAR(150) NOT NULL,
    category VARCHAR(100) NOT NULL,
    event_type VARCHAR(50) NOT NULL, -- 'pdf_download', 'tool_open', 'calculate', 'preview', 'share'
    download_type VARCHAR(50) DEFAULT 'pdf',
    country VARCHAR(100) DEFAULT 'Other',
    device_type VARCHAR(50) DEFAULT 'Desktop',
    session_id VARCHAR(100),
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Indexes for lightning fast aggregated queries
CREATE INDEX IF NOT EXISTS idx_tool_events_created_at ON public.tool_events (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tool_events_tool_id ON public.tool_events (tool_id);
CREATE INDEX IF NOT EXISTS idx_tool_events_event_type ON public.tool_events (event_type);
CREATE INDEX IF NOT EXISTS idx_tool_events_category ON public.tool_events (category);
CREATE INDEX IF NOT EXISTS idx_tool_events_compound ON public.tool_events (event_type, created_at DESC);

-- 2. Create admin_audit_logs table
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action VARCHAR(150) NOT NULL,
    admin_email VARCHAR(255) NOT NULL,
    details TEXT,
    ip_address VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_created_at ON public.admin_audit_logs (created_at DESC);

-- 3. Create admin_settings table
CREATE TABLE IF NOT EXISTS public.admin_settings (
    id VARCHAR(50) PRIMARY KEY DEFAULT 'global',
    tracking_active BOOLEAN DEFAULT TRUE NOT NULL,
    timezone VARCHAR(100) DEFAULT 'Asia/Kolkata' NOT NULL,
    retention_days INT,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Insert default admin settings if not present
INSERT INTO public.admin_settings (id, tracking_active, timezone)
VALUES ('global', TRUE, 'Asia/Kolkata')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE public.tool_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

-- Anonymous public visitors can ONLY insert valid events (no reading permission)
CREATE POLICY "Allow public insert to tool_events"
ON public.tool_events
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Disallow public read access to analytics tables
CREATE POLICY "Deny public select on tool_events"
ON public.tool_events
FOR SELECT
TO anon
USING (false);

-- Only authorized admin (smrtx.sumit@gmail.com) or service_role can read tool_events
CREATE POLICY "Allow admin and service_role select on tool_events"
ON public.tool_events
FOR SELECT
TO authenticated, service_role
USING (
    auth.jwt() ->> 'email' = 'smrtx.sumit@gmail.com'
    OR auth.role() = 'service_role'
);

-- Admin audit logs: strictly restricted to service_role and authorized admin
CREATE POLICY "Allow admin select on admin_audit_logs"
ON public.admin_audit_logs
FOR SELECT
TO authenticated, service_role
USING (
    auth.jwt() ->> 'email' = 'smrtx.sumit@gmail.com'
    OR auth.role() = 'service_role'
);

CREATE POLICY "Allow service_role insert on admin_audit_logs"
ON public.admin_audit_logs
FOR INSERT
TO service_role
WITH CHECK (true);

-- Admin settings: read & write strictly for service_role and authorized admin
CREATE POLICY "Allow admin manage admin_settings"
ON public.admin_settings
FOR ALL
TO authenticated, service_role
USING (
    auth.jwt() ->> 'email' = 'smrtx.sumit@gmail.com'
    OR auth.role() = 'service_role'
);
