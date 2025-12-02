drop policy if exists "Anyone can view public documents" on public.documents;
alter table public.documents drop column if exists is_public;
