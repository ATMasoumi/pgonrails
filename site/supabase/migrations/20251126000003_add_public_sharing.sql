alter table public.documents 
add column is_public boolean not null default false;

create policy "Anyone can view public documents"
    on public.documents for select
    using (is_public = true);
