create table if not exists flashcards (
  id uuid default gen_random_uuid() primary key,
  document_id uuid references documents(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  cards jsonb not null,
  created_at timestamptz default now() not null
);

alter table flashcards enable row level security;

create policy "Users can view their own flashcards"
  on flashcards for select
  using (auth.uid() = user_id);

create policy "Users can insert their own flashcards"
  on flashcards for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own flashcards"
  on flashcards for delete
  using (auth.uid() = user_id);
