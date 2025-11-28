
-- Create podcasts bucket
insert into storage.buckets (id, name, public)
values ('podcasts', 'podcasts', true)
on conflict (id) do nothing;

-- Create podcasts table
create table if not exists public.podcasts (
  id uuid default gen_random_uuid() primary key,
  document_id uuid references public.documents(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  audio_url text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.podcasts enable row level security;

-- Policies
create policy "Users can view their own podcasts"
  on public.podcasts for select
  using (auth.uid() = user_id);

create policy "Users can insert their own podcasts"
  on public.podcasts for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own podcasts"
  on public.podcasts for delete
  using (auth.uid() = user_id);

-- Storage policies
create policy "Podcast Audio Public Access"
  on storage.objects for select
  using ( bucket_id = 'podcasts' );

create policy "Users can upload podcast audio"
  on storage.objects for insert
  with check ( bucket_id = 'podcasts' and auth.uid() = owner );

create policy "Users can delete podcast audio"
  on storage.objects for delete
  using ( bucket_id = 'podcasts' and auth.uid() = owner );
