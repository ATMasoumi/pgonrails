create table if not exists quizzes (
  id uuid default gen_random_uuid() primary key,
  document_id uuid references documents(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  questions jsonb not null,
  created_at timestamptz default now() not null
);

create table if not exists quiz_attempts (
  id uuid default gen_random_uuid() primary key,
  quiz_id uuid references quizzes(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  score integer not null,
  total_questions integer not null,
  answers jsonb not null,
  created_at timestamptz default now() not null
);

alter table quizzes enable row level security;
alter table quiz_attempts enable row level security;

create policy "Users can view their own quizzes"
  on quizzes for select
  using (auth.uid() = user_id);

create policy "Users can insert their own quizzes"
  on quizzes for insert
  with check (auth.uid() = user_id);

create policy "Users can view their own attempts"
  on quiz_attempts for select
  using (auth.uid() = user_id);

create policy "Users can insert their own attempts"
  on quiz_attempts for insert
  with check (auth.uid() = user_id);
