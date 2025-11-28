alter table public.documents 
add column if not exists is_read boolean not null default false;
