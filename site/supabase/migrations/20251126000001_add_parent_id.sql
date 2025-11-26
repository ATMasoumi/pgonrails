alter table public.documents 
add column parent_id uuid references public.documents(id) on delete cascade;
