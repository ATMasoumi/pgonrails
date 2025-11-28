create table if not exists resources (
  id uuid default gen_random_uuid() primary key,
  document_id uuid references documents(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  data jsonb not null,
  created_at timestamptz default now() not null
);

alter table resources enable row level security;

create policy "Users can view their own resources"
  on resources for select
  using (auth.uid() = user_id);

create policy "Users can insert their own resources"
  on resources for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own resources"
  on resources for delete
  using (auth.uid() = user_id);
