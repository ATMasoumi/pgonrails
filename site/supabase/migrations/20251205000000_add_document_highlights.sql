-- Create document_highlights table to store highlighted text positions
create table if not exists public.document_highlights (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  highlighted_text text not null,
  created_at timestamp with time zone default now(),
  
  -- Ensure unique highlights per document per user
  unique(document_id, user_id, highlighted_text)
);

-- Enable RLS
alter table public.document_highlights enable row level security;

-- Policies
drop policy if exists "Users can view their own highlights" on public.document_highlights;
create policy "Users can view their own highlights"
  on public.document_highlights for select
  using (auth.uid() = user_id);

drop policy if exists "Users can create their own highlights" on public.document_highlights;
create policy "Users can create their own highlights"
  on public.document_highlights for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own highlights" on public.document_highlights;
create policy "Users can delete their own highlights"
  on public.document_highlights for delete
  using (auth.uid() = user_id);

-- Index for faster lookups
create index if not exists document_highlights_document_id_idx on public.document_highlights(document_id);
create index if not exists document_highlights_user_id_idx on public.document_highlights(user_id);
