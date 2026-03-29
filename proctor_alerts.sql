-- ============================================================
-- AI Proctoring Alerts - Supabase SQL Script
-- Run this ENTIRE script in Supabase Dashboard → SQL Editor
-- ============================================================

-- ╔══════════════════════════════════════════════════════════╗
-- ║  Add opened_at column to exams table                    ║
-- ║  (Tracks when exam was first opened - prevents re-entry)║
-- ╚══════════════════════════════════════════════════════════╝

ALTER TABLE public.exams ADD COLUMN IF NOT EXISTS opened_at BIGINT DEFAULT NULL;

-- ╔══════════════════════════════════════════════════════════╗
-- ║  Create proctor_alerts table                            ║
-- ╚══════════════════════════════════════════════════════════╝

CREATE TABLE IF NOT EXISTS public.proctor_alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id TEXT NOT NULL,
  student_name TEXT,
  exam_code TEXT NOT NULL,
  instructor_id TEXT NOT NULL,
  alert_type TEXT DEFAULT 'face_absent',
  snapshot_path TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  is_read BOOLEAN DEFAULT FALSE
);

-- ╔══════════════════════════════════════════════════════════╗
-- ║  Enable RLS                                             ║
-- ╚══════════════════════════════════════════════════════════╝

ALTER TABLE public.proctor_alerts ENABLE ROW LEVEL SECURITY;

-- ╔══════════════════════════════════════════════════════════╗
-- ║  RLS Policies                                           ║
-- ╚══════════════════════════════════════════════════════════╝

-- Allow anon to insert alerts (from student's browser)
DROP POLICY IF EXISTS "proctor_alerts_insert" ON public.proctor_alerts;
CREATE POLICY "proctor_alerts_insert"
ON public.proctor_alerts FOR INSERT TO anon
WITH CHECK (true);

-- Allow anon to read alerts (instructor dashboard)
DROP POLICY IF EXISTS "proctor_alerts_select" ON public.proctor_alerts;
CREATE POLICY "proctor_alerts_select"
ON public.proctor_alerts FOR SELECT TO anon
USING (true);

-- Allow anon to update alerts (mark as read)
DROP POLICY IF EXISTS "proctor_alerts_update" ON public.proctor_alerts;
CREATE POLICY "proctor_alerts_update"
ON public.proctor_alerts FOR UPDATE TO anon
USING (true)
WITH CHECK (true);

-- ╔══════════════════════════════════════════════════════════╗
-- ║  Enable Realtime for proctor_alerts                     ║
-- ╚══════════════════════════════════════════════════════════╝

-- This enables Supabase Realtime to push INSERT events
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'proctor_alerts'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.proctor_alerts;
  END IF;
END $$;

-- ╔══════════════════════════════════════════════════════════╗
-- ║  Anti-Spam Trigger (Rate Limiter)                       ║
-- ╚══════════════════════════════════════════════════════════╝
CREATE OR REPLACE FUNCTION check_proctor_alert_spam()
RETURNS TRIGGER AS $$
DECLARE
  last_alert_time TIMESTAMPTZ;
BEGIN
  -- Find the most recent alert for the same student and exam
  SELECT created_at INTO last_alert_time
  FROM public.proctor_alerts
  WHERE student_id = NEW.student_id AND exam_code = NEW.exam_code
  ORDER BY created_at DESC
  LIMIT 1;

  -- If an alert was sent less than 15 seconds ago, block this one
  IF last_alert_time IS NOT NULL AND (NOW() - last_alert_time) < interval '15 seconds' THEN
    RAISE EXCEPTION 'Rate limit exceeded: Please wait 15 seconds before sending another alert.';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_check_proctor_alert_spam ON public.proctor_alerts;
CREATE TRIGGER trg_check_proctor_alert_spam
BEFORE INSERT ON public.proctor_alerts
FOR EACH ROW
EXECUTE FUNCTION check_proctor_alert_spam();

-- ╔══════════════════════════════════════════════════════════╗
-- ║  DONE! Proctor alerts system ready.                     ║
-- ╚══════════════════════════════════════════════════════════╝
