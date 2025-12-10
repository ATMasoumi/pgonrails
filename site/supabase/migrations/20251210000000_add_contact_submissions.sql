-- Create contact_submissions table
CREATE TABLE IF NOT EXISTS public.contact_submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied', 'archived')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add comment
COMMENT ON TABLE public.contact_submissions IS 'Stores contact form submissions from users';

-- Create index for faster queries
CREATE INDEX idx_contact_submissions_status ON public.contact_submissions(status);
CREATE INDEX idx_contact_submissions_created_at ON public.contact_submissions(created_at DESC);

-- Enable RLS
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

-- Policy: Only service role can insert (from API route)
CREATE POLICY "Service role can insert contact submissions"
    ON public.contact_submissions
    FOR INSERT
    TO service_role
    WITH CHECK (true);

-- Policy: Only service role can select (for admin purposes)
CREATE POLICY "Service role can view contact submissions"
    ON public.contact_submissions
    FOR SELECT
    TO service_role
    USING (true);

-- Policy: Only service role can update (for status changes)
CREATE POLICY "Service role can update contact submissions"
    ON public.contact_submissions
    FOR UPDATE
    TO service_role
    USING (true);
