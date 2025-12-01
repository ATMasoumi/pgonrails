alter table public.documents
add column if not exists published_at timestamp with time zone;

-- Backfill existing public documents
update public.documents
set published_at = created_at
where is_public = true;
