-- Migration: Fix Event RLS for Multiple Host Pages
-- Description: Updates the RLS policies on events and related tables to use the host_profiles table for ownership checks.

BEGIN;

-- 1. Fix Events Table Policies
DROP POLICY IF EXISTS "Hosts manage own events" ON public.events;
DROP POLICY IF EXISTS "Hosts can insert own events" ON public.events;
DROP POLICY IF EXISTS "Public can view published events" ON public.events;

-- Allow public to see published events
CREATE POLICY "Public can view published events" 
ON public.events FOR SELECT 
USING (status = 'published');

-- Allow hosts to view their own events (including drafts)
CREATE POLICY "Hosts can view own events" 
ON public.events FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM host_profiles 
    WHERE id = events.host_id AND user_id = auth.uid()
  ) OR 
  (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
);

-- Allow hosts to insert events for their pages
CREATE POLICY "Hosts can insert own events" 
ON public.events FOR INSERT 
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM host_profiles 
    WHERE id = host_id AND user_id = auth.uid()
  ) OR 
  (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
);

-- Allow hosts to update their own events
CREATE POLICY "Hosts can update own events" 
ON public.events FOR UPDATE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM host_profiles 
    WHERE id = events.host_id AND user_id = auth.uid()
  ) OR 
  (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM host_profiles 
    WHERE id = events.host_id AND user_id = auth.uid()
  ) OR 
  (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
);

-- 2. Fix Child Tables (Agenda, FAQs, Tags)
-- They were using host_id = auth.uid() which was wrong for the new structure.

DROP POLICY IF EXISTS "Hosts manage own event agenda" ON public.event_agenda;
CREATE POLICY "Hosts manage own event agenda" ON public.event_agenda
FOR ALL TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.events e
        JOIN public.host_profiles h ON e.host_id = h.id
        WHERE e.id = event_agenda.event_id AND h.user_id = auth.uid()
    ) OR
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
);

DROP POLICY IF EXISTS "Hosts manage own event faqs" ON public.event_faqs;
CREATE POLICY "Hosts manage own event faqs" ON public.event_faqs
FOR ALL TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.events e
        JOIN public.host_profiles h ON e.host_id = h.id
        WHERE e.id = event_faqs.event_id AND h.user_id = auth.uid()
    ) OR
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
);

DROP POLICY IF EXISTS "Hosts manage own event tags" ON public.event_tags;
CREATE POLICY "Hosts manage own event tags" ON public.event_tags
FOR ALL TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.events e
        JOIN public.host_profiles h ON e.host_id = h.id
        WHERE e.id = event_tags.event_id AND h.user_id = auth.uid()
    ) OR
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
);

COMMIT;
