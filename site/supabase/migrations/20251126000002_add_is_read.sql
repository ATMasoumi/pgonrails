alter table public.documents 
add column is_read boolean not null default false;
