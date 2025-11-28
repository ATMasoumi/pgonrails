alter table public.documents 
add column if not exists is_public boolean not null default false;

drop policy if exists "Anyone can view public documents" on public.documents;
create policy "Anyone can view public documents"
    on public.documents for select
    using (is_public = true);
